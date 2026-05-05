import Foundation

// MARK: - Settings Manager

final class AppSettings: ObservableObject {
    static let shared = AppSettings()

    @Published var tursoURL: String {
        didSet { UserDefaults.standard.set(tursoURL, forKey: "turso_url") }
    }
    @Published var tursoToken: String {
        didSet { UserDefaults.standard.set(tursoToken, forKey: "turso_token") }
    }
    @Published var alpacaKey: String {
        didSet { UserDefaults.standard.set(alpacaKey, forKey: "alpaca_key") }
    }
    @Published var alpacaSecret: String {
        didSet { UserDefaults.standard.set(alpacaSecret, forKey: "alpaca_secret") }
    }

    var isConfigured: Bool {
        !tursoURL.isEmpty && !tursoToken.isEmpty
    }

    var isAlpacaConfigured: Bool {
        !alpacaKey.isEmpty && !alpacaSecret.isEmpty
    }

    private init() {
        self.tursoURL = UserDefaults.standard.string(forKey: "turso_url") ?? ""
        self.tursoToken = UserDefaults.standard.string(forKey: "turso_token") ?? ""
        self.alpacaKey = UserDefaults.standard.string(forKey: "alpaca_key") ?? ""
        self.alpacaSecret = UserDefaults.standard.string(forKey: "alpaca_secret") ?? ""
    }
}

// MARK: - Turso Client

final class TursoClient {
    static let totalRealizedPnLSQL = "SELECT (SELECT COALESCE(credits_posted - debits_posted, 0) FROM accounts WHERE id = 1) + (SELECT COALESCE(credits_posted - debits_posted, 0) FROM accounts WHERE id = 2) + (SELECT COALESCE(credits_posted - debits_posted, 0) FROM accounts WHERE id = 6) - (SELECT COALESCE(SUM(amount), 0) FROM transfers WHERE code = 1 AND status = 'posted') as total"
    static let managedBalancesSQL = "SELECT (SELECT COALESCE(credits_posted - debits_posted, 0) FROM accounts WHERE id = 1) as cash, COALESCE(SUM(CASE WHEN debit_account_id = 2 THEN size WHEN credit_account_id = 2 THEN -size ELSE 0 END), 0) as btc_qty, COALESCE(SUM(CASE WHEN debit_account_id = 6 THEN size WHEN credit_account_id = 6 THEN -size ELSE 0 END), 0) as bnb_qty FROM transfers WHERE status = 'posted'"

    private let settings: AppSettings

    init(settings: AppSettings = .shared) {
        self.settings = settings
    }

    private func executeSQL(_ sql: String) async throws -> TursoExecuteResult {
        guard settings.isConfigured else {
            throw TursoError.notConfigured
        }

        var urlString = settings.tursoURL.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Convert libsql:// to https:// for HTTP API
        if urlString.hasPrefix("libsql://") {
            urlString = "https://" + urlString.dropFirst("libsql://".count)
        } else if !urlString.hasPrefix("https://") {
            urlString = "https://" + urlString
        }
        
        urlString = urlString.hasSuffix("/")
            ? "\(urlString)v2/pipeline"
            : "\(urlString)/v2/pipeline"

        guard let url = URL(string: urlString) else {
            throw TursoError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(settings.tursoToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 15

        let body = TursoRequest(requests: [
            TursoPipelineRequest(type: "execute", stmt: TursoStatement(sql: sql))
        ])
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
            let body = String(data: data, encoding: .utf8) ?? "unknown"
            throw TursoError.httpError(httpResponse.statusCode, body)
        }

        let tursoResponse = try JSONDecoder().decode(TursoResponse.self, from: data)

        guard let first = tursoResponse.results.first,
              first.type == "ok",
              let result = first.response?.result else {
            throw TursoError.emptyResult
        }

        return result
    }

    // MARK: - Row Parsing Helpers

    private func colIndex(_ cols: [TursoColumn], _ name: String) -> Int? {
        cols.firstIndex(where: { $0.name == name })
    }

    private func getString(_ row: [TursoValue], _ cols: [TursoColumn], _ name: String) -> String {
        guard let idx = colIndex(cols, name) else { return "" }
        return row[idx].stringValue ?? ""
    }

    private func getDouble(_ row: [TursoValue], _ cols: [TursoColumn], _ name: String) -> Double {
        guard let idx = colIndex(cols, name) else { return 0 }
        return row[idx].doubleValue ?? 0
    }

    private func getOptionalDouble(_ row: [TursoValue], _ cols: [TursoColumn], _ name: String) -> Double? {
        guard let idx = colIndex(cols, name) else { return nil }
        return row[idx].doubleValue
    }

    private func getOptionalString(_ row: [TursoValue], _ cols: [TursoColumn], _ name: String) -> String? {
        guard let idx = colIndex(cols, name) else { return nil }
        return row[idx].stringValue
    }

    private func getInt(_ row: [TursoValue], _ cols: [TursoColumn], _ name: String) -> Int {
        guard let idx = colIndex(cols, name) else { return 0 }
        return row[idx].intValue ?? 0
    }

    // MARK: - Public API

    func fetchTradeTransfers(limit: Int = 50) async throws -> [Transfer] {
        let sql = "SELECT t.id, t.debit_account_id, t.credit_account_id, COALESCE(s.amount, t.amount) as amount, t.pending_id, t.code, t.flags, COALESCE(s.status, t.status) as resolved_status, COALESCE(s.user_data, t.user_data) as user_data, COALESCE(s.price, t.price) as price, COALESCE(s.size, t.size) as size, t.timestamp, t.created_at FROM transfers t LEFT JOIN transfers s ON s.pending_id = t.id AND s.flags IN (2, 4) WHERE t.code IN (2, 3) AND t.flags NOT IN (2, 4) ORDER BY t.id DESC LIMIT \(limit)"
        let result = try await executeSQL(sql)
        return result.rows.map { row in
            Transfer(
                id: getInt(row, result.cols, "id"),
                debitAccountId: getInt(row, result.cols, "debit_account_id"),
                creditAccountId: getInt(row, result.cols, "credit_account_id"),
                amount: getDouble(row, result.cols, "amount"),
                pendingId: row[colIndex(result.cols, "pending_id") ?? 0].intValue,
                code: getInt(row, result.cols, "code"),
                flags: getInt(row, result.cols, "flags"),
                status: getString(row, result.cols, "resolved_status"),
                userData: getOptionalString(row, result.cols, "user_data"),
                price: getDouble(row, result.cols, "price"),
                size: getDouble(row, result.cols, "size"),
                timestamp: getString(row, result.cols, "timestamp"),
                createdAt: getString(row, result.cols, "created_at")
            )
        }
    }


    func fetchTransfers(limit: Int = 100) async throws -> [Transfer] {
        let sql = "SELECT t.id, t.debit_account_id, t.credit_account_id, COALESCE(s.amount, t.amount) as amount, t.pending_id, t.code, t.flags, COALESCE(s.status, t.status) as resolved_status, COALESCE(s.user_data, t.user_data) as user_data, COALESCE(s.price, t.price) as price, COALESCE(s.size, t.size) as size, t.timestamp, t.created_at FROM transfers t LEFT JOIN transfers s ON s.pending_id = t.id AND s.flags IN (2, 4) WHERE t.flags NOT IN (2, 4) ORDER BY t.id DESC LIMIT \(limit)"
        let result = try await executeSQL(sql)
        return result.rows.map { row in
            Transfer(
                id: getInt(row, result.cols, "id"),
                debitAccountId: getInt(row, result.cols, "debit_account_id"),
                creditAccountId: getInt(row, result.cols, "credit_account_id"),
                amount: getDouble(row, result.cols, "amount"),
                pendingId: row[colIndex(result.cols, "pending_id") ?? 0].intValue,
                code: getInt(row, result.cols, "code"),
                flags: getInt(row, result.cols, "flags"),
                status: getString(row, result.cols, "resolved_status"),
                userData: getOptionalString(row, result.cols, "user_data"),
                price: getDouble(row, result.cols, "price"),
                size: getDouble(row, result.cols, "size"),
                timestamp: getString(row, result.cols, "timestamp"),
                createdAt: getString(row, result.cols, "created_at")
            )
        }
    }

    /// Fetch recent equity snapshots (lightweight, for dashboard sparkline).
    func fetchRecentEquity(limit: Int = 50) async throws -> [EquityLog] {
        let sql = "SELECT * FROM equity_log ORDER BY id DESC LIMIT \(limit)"
        let result = try await executeSQL(sql)
        return result.rows.map { row in
            EquityLog(
                id: getInt(row, result.cols, "id"),
                timestamp: getString(row, result.cols, "timestamp"),
                tickCount: getInt(row, result.cols, "tick_count"),
                capital: getDouble(row, result.cols, "capital"),
                equity: getDouble(row, result.cols, "equity"),
                unrealized: getDouble(row, result.cols, "unrealized"),
                regime: getString(row, result.cols, "regime"),
                price: getDouble(row, result.cols, "price"),
                createdAt: getString(row, result.cols, "created_at")
            )
        }.reversed()  // oldest first for sparkline
    }
    func fetchEquityLog(days: Int = 7) async throws -> [EquityLog] {
        let cutoff = Int(Date().timeIntervalSince1970) - (days * 86400)
        let sql = "SELECT * FROM equity_log WHERE timestamp >= \(cutoff) ORDER BY timestamp ASC LIMIT 5000"
        let result = try await executeSQL(sql)
        return result.rows.map { row in
            EquityLog(
                id: getInt(row, result.cols, "id"),
                timestamp: getString(row, result.cols, "timestamp"),
                tickCount: getInt(row, result.cols, "tick_count"),
                capital: getDouble(row, result.cols, "capital"),
                equity: getDouble(row, result.cols, "equity"),
                unrealized: getDouble(row, result.cols, "unrealized"),
                regime: getString(row, result.cols, "regime"),
                price: getDouble(row, result.cols, "price"),
                createdAt: getString(row, result.cols, "created_at")
            )
        }
    }

    func fetchLatestEquity() async throws -> EquityLog? {
        let sql = "SELECT * FROM equity_log ORDER BY id DESC LIMIT 1"
        let result = try await executeSQL(sql)
        guard let row = result.rows.first else { return nil }
        return EquityLog(
            id: getInt(row, result.cols, "id"),
            timestamp: getString(row, result.cols, "timestamp"),
            tickCount: getInt(row, result.cols, "tick_count"),
            capital: getDouble(row, result.cols, "capital"),
            equity: getDouble(row, result.cols, "equity"),
            unrealized: getDouble(row, result.cols, "unrealized"),
            regime: getString(row, result.cols, "regime"),
            price: getDouble(row, result.cols, "price"),
            createdAt: getString(row, result.cols, "created_at")
        )
    }

    func fetchTotalRealizedPnL() async throws -> Double {
        // Net return = historical quote-currency ledger value - total deposits.
        // Native fee quantity is stored in transfer size.
        let result = try await executeSQL(Self.totalRealizedPnLSQL)
        guard let row = result.rows.first else { return 0 }
        return getDouble(row, result.cols, "total")
    }

    func fetchTotalDeposits() async throws -> Double {
        let sql = "SELECT COALESCE(SUM(amount), 0) as total FROM transfers WHERE code = 1 AND status = 'posted'"
        let result = try await executeSQL(sql)
        guard let row = result.rows.first else { return 0 }
        return getDouble(row, result.cols, "total")
    }

    func fetchManagedBalances() async throws -> ManagedBalances {
        let result = try await executeSQL(Self.managedBalancesSQL)
        guard let row = result.rows.first else {
            return ManagedBalances(cash: 0, btcQuantity: 0, bnbQuantity: 0)
        }
        return ManagedBalances(
            cash: getDouble(row, result.cols, "cash"),
            btcQuantity: getDouble(row, result.cols, "btc_qty"),
            bnbQuantity: getDouble(row, result.cols, "bnb_qty")
        )
    }

    func fetchBotStatus() async throws -> BotStatus? {
        let sql = "SELECT * FROM bot_status WHERE id = 1"
        let result = try await executeSQL(sql)
        guard let row = result.rows.first else { return nil }
        return BotStatus(
            status: getString(row, result.cols, "status"),
            lastTick: getDouble(row, result.cols, "last_tick"),
            tickCount: getInt(row, result.cols, "tick_count"),
            regime: getString(row, result.cols, "regime"),
            inPosition: getInt(row, result.cols, "in_position"),
            entryPrice: getDouble(row, result.cols, "entry_price"),
            equity: getDouble(row, result.cols, "equity"),
            capital: getDouble(row, result.cols, "capital"),
            unrealized: getDouble(row, result.cols, "unrealized"),
            price: getDouble(row, result.cols, "price"),
            uptimeStart: getDouble(row, result.cols, "uptime_start"),
            version: getString(row, result.cols, "version"),
            updatedAt: getString(row, result.cols, "updated_at"),
            tradingSymbol: getOptionalString(row, result.cols, "trading_symbol") ?? "",
            baseAsset: getOptionalString(row, result.cols, "base_asset") ?? "",
            quoteAsset: getOptionalString(row, result.cols, "quote_asset") ?? "",
            markSymbol: getOptionalString(row, result.cols, "mark_symbol") ?? ""
        )
    }

    /// Fetch cash balance from accounts table (credits_posted - debits_posted for account 1).
    func fetchCashBalance() async throws -> Double {
        let sql = "SELECT credits_posted - debits_posted as balance FROM accounts WHERE id = 1"
        let result = try await executeSQL(sql)
        guard let row = result.rows.first else { return 0 }
        return getDouble(row, result.cols, "balance")
    }

    /// Insert a deposit atomically: create transfer + update both accounts.
    func insertDeposit(amount: Double) async throws -> Double {
        let timestamp = Date().timeIntervalSince1970
        try await executePipeline(Self.depositStatements(amount: amount, timestamp: timestamp))
        return try await fetchCashBalance()
    }

    /// Insert a managed BNB allocation. `quantity` is native BNB and `price` is BNB/quote.
    func insertBnbAllocation(quantity: Double, price: Double) async throws {
        let timestamp = Date().timeIntervalSince1970
        try await executePipeline(Self.bnbAllocationStatements(quantity: quantity, price: price, timestamp: timestamp))
    }

    static func depositStatements(amount: Double, timestamp: Double) -> [String] {
        [
            "BEGIN",
            "INSERT INTO transfers (debit_account_id, credit_account_id, amount, code, flags, status, price, size, timestamp) VALUES (1, 4, \(amount), 1, 0, 'posted', 0, 0, \(timestamp))",
            "UPDATE accounts SET credits_posted = credits_posted + \(amount) WHERE id = 1",
            "UPDATE accounts SET debits_posted = debits_posted + \(amount) WHERE id = 4",
            "COMMIT"
        ]
    }

    static func bnbAllocationStatements(quantity: Double, price: Double, timestamp: Double) -> [String] {
        let amount = quantity * price
        return [
            "BEGIN",
            "INSERT INTO transfers (debit_account_id, credit_account_id, amount, code, flags, status, user_data, price, size, timestamp) VALUES (6, 4, \(amount), 1, 0, 'posted', 'BNB allocation', \(price), \(quantity), \(timestamp))",
            "UPDATE accounts SET credits_posted = credits_posted + \(amount) WHERE id = 6",
            "UPDATE accounts SET debits_posted = debits_posted + \(amount) WHERE id = 4",
            "COMMIT"
        ]
    }

    /// Execute multiple SQL statements in a single pipeline request.
    private func executePipeline(_ statements: [String]) async throws {
        guard settings.isConfigured else {
            throw TursoError.notConfigured
        }

        var urlString = settings.tursoURL.trimmingCharacters(in: .whitespacesAndNewlines)

        if urlString.hasPrefix("libsql://") {
            urlString = "https://" + urlString.dropFirst("libsql://".count)
        } else if !urlString.hasPrefix("https://") {
            urlString = "https://" + urlString
        }

        urlString = urlString.hasSuffix("/")
            ? "\(urlString)v2/pipeline"
            : "\(urlString)/v2/pipeline"

        guard let url = URL(string: urlString) else {
            throw TursoError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(settings.tursoToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 15

        let body = TursoRequest(requests: statements.map {
            TursoPipelineRequest(type: "execute", stmt: TursoStatement(sql: $0))
        })
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)

        if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
            let body = String(data: data, encoding: .utf8) ?? "unknown"
            throw TursoError.httpError(httpResponse.statusCode, body)
        }
    }
}

// MARK: - Errors

enum TursoError: LocalizedError {
    case notConfigured
    case invalidURL
    case httpError(Int, String)
    case emptyResult

    var errorDescription: String? {
        switch self {
        case .notConfigured: return "Turso not configured. Add URL and token in Settings."
        case .invalidURL: return "Invalid Turso URL."
        case .httpError(let code, let body): return "HTTP \(code): \(body)"
        case .emptyResult: return "Empty result from Turso."
        }
    }
}
