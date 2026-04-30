import Foundation

/// Alpaca paper trading API client for reading positions.
struct AlpacaClient {
    static let baseURL = "https://paper-api.alpaca.markets/v2"

    struct AlpacaPosition {
        let qty: Double
        let entryPrice: Double
        let marketValue: Double
        let unrealizedPnl: Double
        let currentPrice: Double
    }

    /// Fetch current BTC/USD position from Alpaca. Returns nil if no position.
    static func fetchPosition(apiKey: String, apiSecret: String) async throws -> AlpacaPosition? {
        let url = URL(string: "\(baseURL)/positions/BTCUSD")!
        var request = URLRequest(url: url)
        request.setValue(apiKey, forHTTPHeaderField: "APCA-API-KEY-ID")
        request.setValue(apiSecret, forHTTPHeaderField: "APCA-API-SECRET-KEY")

        let (data, response) = try await URLSession.shared.data(for: request)

        // 404 = no position
        if let http = response as? HTTPURLResponse, http.statusCode == 404 {
            return nil
        }

        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return nil
        }

        // Error response
        if json["code"] != nil { return nil }

        guard let qtyStr = json["qty"] as? String, let qty = Double(qtyStr),
              let entryStr = json["avg_entry_price"] as? String, let entry = Double(entryStr) else {
            return nil
        }

        let mv = Double(json["market_value"] as? String ?? "0") ?? 0
        let pnl = Double(json["unrealized_pl"] as? String ?? "0") ?? 0
        let price = Double(json["current_price"] as? String ?? "0") ?? 0

        return AlpacaPosition(qty: qty, entryPrice: entry, marketValue: mv, unrealizedPnl: pnl, currentPrice: price)
    }
}
