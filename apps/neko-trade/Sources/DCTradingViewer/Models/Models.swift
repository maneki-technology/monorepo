import Foundation
import SwiftUI

// MARK: - Position

struct Position: Identifiable, Codable {
    let id: Int
    let status: String
    let entryPrice: Double
    let entryTime: String
    let exitPrice: Double?
    let exitTime: String?
    let size: Double
    let pnl: Double?
    let fees: Double?
    let exitType: String?
    let signalPrice: Double?
    let alpacaOrderId: String?
    let createdAt: String

    var isOpen: Bool { status == "OPEN" }
    var isStale: Bool { status == "STALE" }
    var isClosed: Bool { status == "CLOSED" }

    /// Price drift between signal and actual fill (in dollars)
    var entryDrift: Double? {
        guard let sp = signalPrice, sp > 0 else { return nil }
        return entryPrice - sp
    }

    /// Price drift as percentage
    var entryDriftPct: Double? {
        guard let sp = signalPrice, sp > 0 else { return nil }
        return (entryPrice - sp) / sp * 100
    }
}


// MARK: - Transfer (double-entry)

struct Transfer: Identifiable, Codable {
    static let cashAccountId = 1
    static let btcAccountId = 2
    static let bnbAccountId = 6

    let id: Int
    let debitAccountId: Int
    let creditAccountId: Int
    let amount: Double
    let pendingId: Int?
    let code: Int          // 1=deposit, 2=buy, 3=sell, 4=fee, 5=pnl
    let flags: Int
    let status: String     // pending/posted/voided
    let userData: String?
    let price: Double
    let size: Double
    let timestamp: String
    let createdAt: String

    var codeName: String {
        switch code {
        case 1: return "DEPOSIT"
        case 2: return "BUY"
        case 3: return "SELL"
        case 4: return "FEE"
        case 5: return "PNL"
        default: return "UNKNOWN"
        }
    }

    /// Display sign for the transfer amount. Account balances use `effect(on:)`.
    var isPositive: Bool {
        code == 1 || code == 3
    }

    func effect(on accountId: Int) -> Double {
        if debitAccountId == accountId { return amount }
        if creditAccountId == accountId { return -amount }
        return 0
    }

    var cashEffect: Double {
        effect(on: Self.cashAccountId)
    }

    var typeColor: Color {
        switch code {
        case 1: return .blue
        case 2: return .orange
        case 3: return .green
        case 4: return .red
        case 5: return .cyan
        default: return .secondary
        }
    }

    var typeIcon: String {
        switch code {
        case 1: return "plus.circle.fill"
        case 2: return "arrow.down.circle.fill"
        case 3: return "arrow.up.circle.fill"
        case 4: return "minus.circle.fill"
        case 5: return "chart.line.uptrend.xyaxis"
        default: return "circle.fill"
        }
    }

    var isBuy: Bool { code == 2 }

    var date: Date {
        if let ts = Double(timestamp) { return Date(timeIntervalSince1970: ts) }
        return Date()
    }
}

// MARK: - Managed Balances

struct ManagedBalances {
    let cash: Double
    let btcQuantity: Double
    let bnbQuantity: Double
}

// MARK: - Symbol Metadata

struct SymbolMetadata {
    let tradingSymbol: String
    let baseAsset: String
    let quoteAsset: String
    let markSymbol: String

    static let fallback = SymbolMetadata(
        tradingSymbol: "BTC/USD",
        baseAsset: "BTC",
        quoteAsset: "USD",
        markSymbol: "BTCUSDT"
    )

    var priceLabel: String {
        "\(baseAsset)/\(quoteAsset)"
    }

    var bnbMarkSymbol: String {
        // Binance spot does not expose a BNB/USD pair; use BNB/USDT as the
        // valuation source and treat USDT as USD-equivalent in USD mode.
        "BNBUSDT"
    }
}

// MARK: - Equity Log

struct EquityLog: Identifiable, Codable {
    let id: Int
    let timestamp: String
    let tickCount: Int
    let capital: Double
    let equity: Double
    let unrealized: Double
    let regime: String
    let price: Double
    let createdAt: String

    var date: Date {
        // Timestamp is always unix epoch seconds from our Zig bot
        if let ts = Double(timestamp) { return Date(timeIntervalSince1970: ts) }
        // Fallback: try created_at as SQLite datetime
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd HH:mm:ss"
        fmt.timeZone = TimeZone(identifier: "UTC")
        if let d = fmt.date(from: createdAt) { return d }
        return Date()
    }

    var isBull: Bool { regime == "BULL" }
    var isSideways: Bool { regime == "SIDE" }
    var isBear: Bool { regime == "BEAR" }

    var regimeColor: Color {
        switch regime {
        case "BULL": return .green
        case "SIDE": return .orange
        default: return .red
        }
    }
}


// MARK: - Bot Status

struct BotStatus {
    let status: String
    let lastTick: Double
    let tickCount: Int
    let regime: String
    let inPosition: Int
    let entryPrice: Double
    let equity: Double
    let capital: Double
    let unrealized: Double
    let price: Double
    let uptimeStart: Double
    let version: String
    let updatedAt: String
    let tradingSymbol: String
    let baseAsset: String
    let quoteAsset: String
    let markSymbol: String
    let checkpointHealth: String
    let checkpointError: String
    let resourceHealth: String
    let resourceError: String
    let resourceRssMb: Double
    let resourceDiskFreeMb: Double
    let resourceDiskUsedPct: Double
    let resourceFeedGapSec: Double
    let resourceWsLagSec: Double
    let resourceHttpErrors: Int
    let resourceHttpMaxMs: Double

    var symbolMetadata: SymbolMetadata {
        SymbolMetadata(
            tradingSymbol: tradingSymbol.isEmpty ? SymbolMetadata.fallback.tradingSymbol : tradingSymbol,
            baseAsset: baseAsset.isEmpty ? SymbolMetadata.fallback.baseAsset : baseAsset,
            quoteAsset: quoteAsset.isEmpty ? SymbolMetadata.fallback.quoteAsset : quoteAsset,
            markSymbol: markSymbol.isEmpty ? SymbolMetadata.fallback.markSymbol : markSymbol
        )
    }

    var isLive: Bool {
        status == "RUNNING" && Date().timeIntervalSince1970 - lastTick < 120
    }

    var checkpointNeedsAttention: Bool {
        !checkpointHealth.isEmpty && checkpointHealth != "OK"
    }

    var resourceNeedsAttention: Bool {
        !resourceHealth.isEmpty && resourceHealth != "OK"
    }

    var uptimeDuration: TimeInterval {
        Date().timeIntervalSince1970 - uptimeStart
    }

    var formattedUptime: String {
        let total = Int(uptimeDuration)
        let days = total / 86400
        let hours = (total % 86400) / 3600
        let mins = (total % 3600) / 60
        if days > 0 {
            return "\(days)d \(hours)h \(mins)m"
        } else if hours > 0 {
            return "\(hours)h \(mins)m"
        } else {
            return "\(mins)m"
        }
    }

    var lastTickRelative: String {
        let ago = Int(Date().timeIntervalSince1970 - lastTick)
        if ago < 60 { return "\(ago)s ago" }
        if ago < 3600 { return "\(ago / 60)m ago" }
        return "\(ago / 3600)h \((ago % 3600) / 60)m ago"
    }
}

// MARK: - Turso API Types

struct TursoRequest: Codable {
    let requests: [TursoPipelineRequest]
}

struct TursoPipelineRequest: Codable {
    let type: String
    let stmt: TursoStatement
}

struct TursoStatement: Codable {
    let sql: String
}

struct TursoResponse: Codable {
    let results: [TursoResult]
}

struct TursoResult: Codable {
    let type: String
    let response: TursoResultResponse?
}

struct TursoResultResponse: Codable {
    let type: String
    let result: TursoExecuteResult
}

struct TursoExecuteResult: Codable {
    let cols: [TursoColumn]
    let rows: [[TursoValue]]
}

struct TursoColumn: Codable {
    let name: String
    let decltype: String?
}

enum TursoValue: Codable {
    case text(String)
    case integer(String)
    case float(String)
    case null
    case blob(String)

    var stringValue: String? {
        switch self {
        case .text(let v), .integer(let v), .float(let v), .blob(let v): return v
        case .null: return nil
        }
    }

    var doubleValue: Double? {
        guard let s = stringValue else { return nil }
        return Double(s)
    }

    var intValue: Int? {
        guard let s = stringValue else { return nil }
        return Int(s)
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        switch type {
        case "text":
            let value = try container.decode(String.self, forKey: .value)
            self = .text(value)
        case "integer":
            // Can be string or int
            if let value = try? container.decode(String.self, forKey: .value) {
                self = .integer(value)
            } else if let value = try? container.decode(Int.self, forKey: .value) {
                self = .integer(String(value))
            } else {
                self = .null
            }
        case "float":
            // Can be string or number
            if let value = try? container.decode(String.self, forKey: .value) {
                self = .float(value)
            } else if let value = try? container.decode(Double.self, forKey: .value) {
                self = .float(String(value))
            } else {
                self = .null
            }
        case "blob":
            let value = try container.decode(String.self, forKey: .value)
            self = .blob(value)
        case "null":
            self = .null
        default:
            self = .null
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .text(let v):
            try container.encode("text", forKey: .type)
            try container.encode(v, forKey: .value)
        case .integer(let v):
            try container.encode("integer", forKey: .type)
            try container.encode(v, forKey: .value)
        case .float(let v):
            try container.encode("float", forKey: .type)
            try container.encode(v, forKey: .value)
        case .blob(let v):
            try container.encode("blob", forKey: .type)
            try container.encode(v, forKey: .value)
        case .null:
            try container.encode("null", forKey: .type)
        }
    }

    private enum CodingKeys: String, CodingKey {
        case type, value
    }
}
