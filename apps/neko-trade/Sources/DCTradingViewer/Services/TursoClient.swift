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

    func fetchPositions(status: String? = nil) async throws -> [Position] {
        let whereClause = status.map { " WHERE status = '\($0)'" } ?? ""
        let sql = "SELECT * FROM positions\(whereClause) ORDER BY created_at DESC LIMIT 100"
        let result = try await executeSQL(sql)
        return result.rows.map { row in
            Position(
                id: getInt(row, result.cols, "id"),
                status: getString(row, result.cols, "status"),
                entryPrice: getDouble(row, result.cols, "entry_price"),
                entryTime: getString(row, result.cols, "entry_time"),
                exitPrice: getOptionalDouble(row, result.cols, "exit_price"),
                exitTime: getOptionalString(row, result.cols, "exit_time"),
                size: getDouble(row, result.cols, "size"),
                pnl: getOptionalDouble(row, result.cols, "pnl"),
                fees: getOptionalDouble(row, result.cols, "fees"),
                exitType: getOptionalString(row, result.cols, "exit_type"),
                signalPrice: getOptionalDouble(row, result.cols, "signal_price"),
                alpacaOrderId: getOptionalString(row, result.cols, "alpaca_order_id"),
                createdAt: getString(row, result.cols, "created_at")
            )
        }
    }

    func fetchTradeEvents(limit: Int = 50) async throws -> [TradeEvent] {
        let sql = "SELECT * FROM trade_events ORDER BY timestamp DESC LIMIT \(limit)"
        let result = try await executeSQL(sql)
        return result.rows.map { row in
            TradeEvent(
                id: getInt(row, result.cols, "id"),
                action: getString(row, result.cols, "action"),
                price: getDouble(row, result.cols, "price"),
                size: getDouble(row, result.cols, "size"),
                fee: getDouble(row, result.cols, "fee"),
                timestamp: getString(row, result.cols, "timestamp"),
                createdAt: getString(row, result.cols, "created_at")
            )
        }
    }

    func fetchLedger(limit: Int = 100) async throws -> [LedgerEntry] {
        let sql = "SELECT * FROM account_ledger ORDER BY id DESC LIMIT \(limit)"
        let result = try await executeSQL(sql)
        return result.rows.map { row in
            LedgerEntry(
                id: getInt(row, result.cols, "id"),
                type: getString(row, result.cols, "type"),
                amount: getDouble(row, result.cols, "amount"),
                balanceAfter: getDouble(row, result.cols, "balance_after"),
                note: getString(row, result.cols, "note"),
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
        let sql = "SELECT COALESCE(SUM(pnl), 0) as total_pnl FROM positions WHERE status = 'CLOSED'"
        let result = try await executeSQL(sql)
        guard let row = result.rows.first else { return 0 }
        return getDouble(row, result.cols, "total_pnl")
    }

    func fetchTotalDeposits() async throws -> Double {
        let sql = "SELECT COALESCE(SUM(amount), 0) as total FROM account_ledger WHERE type = 'DEPOSIT'"
        let result = try await executeSQL(sql)
        guard let row = result.rows.first else { return 0 }
        return getDouble(row, result.cols, "total")
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
            updatedAt: getString(row, result.cols, "updated_at")
        )
    }

    /// Insert a deposit into the account_ledger. Returns the new balance.
    func insertDeposit(amount: Double) async throws -> Double {
        // First get current balance
        let balanceSQL = "SELECT balance_after FROM account_ledger ORDER BY id DESC LIMIT 1"
        let balResult = try await executeSQL(balanceSQL)
        let currentBalance = balResult.rows.first.flatMap { getDouble($0, balResult.cols, "balance_after") } ?? 0
        let newBalance = currentBalance + amount
        let timestamp = Date().timeIntervalSince1970

        let insertSQL = "INSERT INTO account_ledger (type, amount, balance_after, note, timestamp) VALUES ('DEPOSIT', \(amount), \(newBalance), 'Manual deposit via Neko Trade', \(timestamp))"
        _ = try await executeSQL(insertSQL)
        return newBalance
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
