import SwiftUI
import Charts

struct TradeHistoryView: View {
    @ObservedObject var settings: AppSettings
    @State private var trades: [Transfer] = []
    @State private var positions: [Transfer] = []  // buy transfers (open positions)
    @State private var latestPrice: Double = 0
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingPositions = false
    @State private var btcPriceHistory: [(Date, Double)] = []
    private let client = TursoClient()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Price chart at top
                if settings.isConfigured && btcPriceHistory.count >= 2 {
                    priceChartCard
                        .padding(.horizontal)
                        .padding(.top, 8)
                }

                HStack(spacing: 0) {
                    tabButton("Trades", isSelected: !showingPositions) { showingPositions = false }
                    tabButton("Positions", isSelected: showingPositions) { showingPositions = true }
                }
                .padding(.horizontal)
                .padding(.top, 8)

                Divider().padding(.top, 8)

                if !settings.isConfigured {
                    notConfiguredPlaceholder
                } else if isLoading && trades.isEmpty && positions.isEmpty {
                    ProgressView("Loading...")
                        .font(.system(.body, design: .monospaced))
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else if let error = errorMessage, trades.isEmpty, positions.isEmpty {
                    errorPlaceholder(error)
                } else {
                    tradeList
                }
            }
        }
        .navigationTitle("Trades")
        .toolbar {
            ToolbarItem(placement: .automatic) {
                Button(action: { Task { await loadData() } }) {
                    Image(systemName: "arrow.clockwise")
                }
                .disabled(isLoading)
            }
        }
        .task { await loadData() }
        .onReceive(timer) { _ in
            guard settings.isConfigured else { return }
            Task { await loadData() }
        }
    }

    // MARK: - Trade List

    @ViewBuilder
    private var tradeList: some View {
        LazyVStack(spacing: 8) {
            if showingPositions {
                if positions.isEmpty {
                    emptyState("No positions yet.")
                } else {
                    ForEach(positions) { pos in
                        positionRow(pos)
                            .id("pos-\(pos.id)")
                    }
                }
            } else {
                if trades.isEmpty {
                    emptyState("No trades yet.")
                } else {
                    ForEach(trades) { trade in
                        tradeRow(trade)
                            .id("trade-\(trade.id)")
                    }
                }
            }
        }
        .padding()
        .id(showingPositions ? "positions" : "trades")
    }


    // MARK: - Trade Row

    private func tradeRow(_ trade: Transfer) -> some View {
        HStack(spacing: 12) {
            Text(trade.codeName)
                .font(.system(.caption, design: .monospaced, weight: .bold))
                .foregroundStyle(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background {
                    Capsule()
                        .fill(trade.isBuy ? Color.green : Color.red)
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(formatCurrency(trade.price))
                    .font(.system(.body, design: .monospaced, weight: .semibold))
                Text("Size: \(String(format: "%.8f", trade.size))")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 3) {
                if let note = trade.userData, !note.isEmpty {
                    Text(note)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.orange)
                        .lineLimit(1)
                }
                Text(formatTimestamp(trade.timestamp))
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(12)
        .background {
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .strokeBorder(
                            (trade.isBuy ? Color.green : Color.red).opacity(0.15),
                            lineWidth: 1
                        )
                )
        }
    }

    // MARK: - Position Row

    private func positionRow(_ pos: Transfer) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("OPEN")
                    .font(.system(.caption, design: .monospaced, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background { Capsule().fill(Color.blue) }

                Spacer()

                Text("\(String(format: "%.8f", pos.size)) BTC")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.secondary)
            }

            Divider()

            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("ENTRY PRICE")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    Text(formatCurrency(pos.price))
                        .font(.system(.body, design: .monospaced, weight: .semibold))
                }

                Spacer()

                if latestPrice > 0 {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("UNREALIZED")
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(.secondary)
                        let unrealized = (latestPrice - pos.price) * pos.size
                        Text(formatCurrency(unrealized))
                            .font(.system(.body, design: .monospaced, weight: .bold))
                            .foregroundStyle(unrealized >= 0 ? .green : .red)
                    }
                }
            }

            HStack {
                if let note = pos.userData, !note.isEmpty {
                    Text(note)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.orange)
                }
                Spacer()
                Text(formatTimestamp(pos.timestamp))
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(12)
        .background {
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .strokeBorder(Color.blue.opacity(0.2), lineWidth: 1)
                )
        }
    }

    // MARK: - Price Chart

    @ViewBuilder
    private var priceChartCard: some View {
        let prices = btcPriceHistory.map(\.1)
        let minPrice = (prices.min() ?? 0) * 0.999
        let maxPrice = (prices.max() ?? 0) * 1.001

        VStack(alignment: .leading, spacing: 8) {
            Text("BTC PRICE")
                .font(.system(.caption, design: .monospaced, weight: .medium))
                .foregroundStyle(.secondary)

            Chart {
                ForEach(Array(btcPriceHistory.enumerated()), id: \.offset) { _, point in
                    LineMark(
                        x: .value("Time", point.0),
                        y: .value("Price", point.1)
                    )
                    .foregroundStyle(.orange.opacity(0.8))
                    .lineStyle(StrokeStyle(lineWidth: 1.5))
                    .interpolationMethod(.catmullRom)
                }

                // Only show trades within the equity data date range
                let chartTrades = trades.filter { trade in
                    guard let first = btcPriceHistory.first?.0 else { return false }
                    return trade.date >= first
                }
                ForEach(chartTrades) { trade in
                    PointMark(
                        x: .value("Time", trade.date),
                        y: .value("Price", trade.price)
                    )
                    .symbol(trade.isBuy ? .triangle : .diamond)
                    .symbolSize(100)
                    .foregroundStyle(trade.isBuy ? .green : .red)
                    .annotation(position: trade.isBuy ? .top : .bottom, spacing: 4) {
                        Text(trade.isBuy ? "BUY" : "SELL")
                            .font(.system(.caption2, design: .monospaced, weight: .bold))
                            .foregroundStyle(trade.isBuy ? .green : .red)
                    }
                }
            }
            .chartYScale(domain: minPrice...maxPrice)
            .chartXAxis {
                AxisMarks(values: .automatic(desiredCount: 3)) { _ in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4]))
                        .foregroundStyle(.secondary.opacity(0.3))
                    AxisValueLabel()
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
            }
            .chartYAxis {
                AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) { _ in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4]))
                        .foregroundStyle(.secondary.opacity(0.3))
                    AxisValueLabel()
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
            }
            .frame(height: 200)
            .clipped()
        }
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
        }
    }

    // MARK: - Placeholders

    private func emptyState(_ message: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: "tray")
                .font(.system(size: 32))
                .foregroundStyle(.secondary)
            Text(message)
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 200)
    }

    private var notConfiguredPlaceholder: some View {
        VStack(spacing: 12) {
            Image(systemName: "list.bullet.rectangle")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text("Configure Turso in Settings to view trades.")
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func errorPlaceholder(_ message: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 36))
                .foregroundStyle(.orange)
            Text(message)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") { Task { await loadData() } }
                .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }

    // MARK: - Data

    private func loadData() async {
        guard settings.isConfigured else { return }
        if trades.isEmpty && positions.isEmpty { isLoading = true }
        errorMessage = nil
        do {
            async let tradesTask = client.fetchTradeTransfers()
            async let priceTask = BinanceClient.fetchPrice()

            let btcPrice = try? await priceTask
            let price = btcPrice ?? 0
            let allTransfers = try await tradesTask

            // Fetch klines covering all trades (from oldest trade to now)
            let oldestTradeDate = allTransfers.last?.date ?? Date()
            let klines = (try? await BinanceClient.fetchKlines(interval: "15m", limit: 1000, startTime: oldestTradeDate)) ?? []

            // Position from Alpaca (source of truth)
            var openPosition: [Transfer] = []
            if settings.isAlpacaConfigured {
                if let ap = try? await AlpacaClient.fetchPosition(
                    apiKey: settings.alpacaKey, apiSecret: settings.alpacaSecret
                ), ap.qty > 0 {
                    openPosition = [Transfer(
                        id: 0,
                        debitAccountId: 2, creditAccountId: 1,
                        amount: ap.entryPrice * ap.qty,
                        pendingId: nil,
                        code: 2, flags: 0, status: "posted",
                        userData: nil,
                        price: ap.entryPrice,
                        size: ap.qty,
                        timestamp: "",
                        createdAt: ""
                    )]
                }
            }

            await MainActor.run {
                btcPriceHistory = klines
                latestPrice = price
                trades = allTransfers
                positions = openPosition
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    // MARK: - Formatting

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: value)) ?? "$0.00"
    }

    private func formatTimestamp(_ ts: String) -> String {
        let df = DateFormatter()
        df.dateFormat = "MMM d, HH:mm"
        if let epoch = Double(ts) {
            return df.string(from: Date(timeIntervalSince1970: epoch))
        }
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime]
        if let date = isoFormatter.date(from: ts) {
            return df.string(from: date)
        }
        let sqlFormatter = DateFormatter()
        sqlFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        sqlFormatter.timeZone = TimeZone(identifier: "UTC")
        if let date = sqlFormatter.date(from: ts) {
            return df.string(from: date)
        }
        return ts
    }


    private func tabButton(_ title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(.caption, design: .monospaced, weight: isSelected ? .bold : .regular))
                .foregroundStyle(isSelected ? .primary : .secondary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background {
                    if isSelected {
                        Capsule()
                            .fill(Color.accentColor.opacity(0.15))
                    }
                }
        }
        .buttonStyle(.plain)
    }
}
