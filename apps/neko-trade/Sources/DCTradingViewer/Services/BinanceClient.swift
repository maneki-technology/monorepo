import Foundation

/// Lightweight Binance public API client for public spot price data.
/// No API key needed — uses public endpoints.
struct BinanceClient {
    static let baseURL = "https://api.binance.com/api/v3"

    /// Fetch current spot price for a Binance symbol.
    static func fetchPrice(symbol: String = "BTCUSDT") async throws -> Double {
        let url = URL(string: "\(baseURL)/ticker/price?symbol=\(symbol)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let priceStr = json?["price"] as? String,
              let price = Double(priceStr) else {
            throw URLError(.cannotParseResponse)
        }
        return price
    }

    /// Fetch recent 1-minute klines for sparkline/chart.
    /// Returns array of (timestamp, close price).
    static func fetchKlines(interval: String = "1m", limit: Int = 60, startTime: Date? = nil) async throws -> [(Date, Double)] {
        var urlString = "\(baseURL)/klines?symbol=BTCUSDT&interval=\(interval)&limit=\(limit)"
        if let start = startTime {
            urlString += "&startTime=\(Int(start.timeIntervalSince1970 * 1000))"
        }
        let url = URL(string: urlString)!
        let (data, _) = try await URLSession.shared.data(from: url)
        guard let klines = try JSONSerialization.jsonObject(with: data) as? [[Any]] else {
            throw URLError(.cannotParseResponse)
        }
        return klines.compactMap { k in
            guard k.count >= 5,
                  let ts = k[0] as? Double,
                  let closeStr = k[4] as? String,
                  let close = Double(closeStr) else { return nil }
            return (Date(timeIntervalSince1970: ts / 1000.0), close)
        }
    }
}
