import SwiftUI
import Charts

struct TradeHistoryView: View {
    @ObservedObject var settings: AppSettings
    @State private var trades: [Transfer] = []
    @State private var latestPrice: Double = 0
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var equityData: [EquityLog] = []

    private let client = TursoClient()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 0) {
            // Price chart at top
            if settings.isConfigured && equityData.count >= 2 {
                priceChartCard
                    .padding(.horizontal)
                    .padding(.top, 8)
            }


            Divider().padding(.top, 8)

            Group {
                if !settings.isConfigured {
                    notConfiguredPlaceholder
                } else if isLoading && trades.isEmpty {
                    ProgressView("Loading...")
                        .font(.system(.body, design: .monospaced))
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = errorMessage, trades.isEmpty {
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
        ScrollView {
            LazyVStack(spacing: 8) {
                if trades.isEmpty {
                    emptyState("No trades yet.")
                } else {
                    ForEach(trades) { trade in
                        tradeRow(trade)
                            .id("trade-\(trade.id)")
                    }
                }
            }
            .padding()
        }
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

    // MARK: - Price Chart

    @ViewBuilder
    private var priceChartCard: some View {
        let prices = equityData.map(\.price)
        let minPrice = (prices.min() ?? 0) * 0.999
        let maxPrice = (prices.max() ?? 0) * 1.001

        VStack(alignment: .leading, spacing: 8) {
            Text("BTC PRICE")
                .font(.system(.caption, design: .monospaced, weight: .medium))
                .foregroundStyle(.secondary)

            Chart {
                ForEach(equityData) { point in
                    LineMark(
                        x: .value("Time", point.date),
                        y: .value("Price", point.price)
                    )
                    .foregroundStyle(.orange.opacity(0.8))
                    .lineStyle(StrokeStyle(lineWidth: 1.5))
                    .interpolationMethod(.catmullRom)
                }

                ForEach(trades) { trade in
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
        if trades.isEmpty { isLoading = true }
        errorMessage = nil
        do {
            async let equityLogTask = client.fetchEquityLog(days: 7)
            async let latestTask = client.fetchLatestEquity()

            let eqLog = try await equityLogTask
            let equity = try await latestTask
            let price = equity?.price ?? 0

            let transfers = try await client.fetchTradeTransfers()
            await MainActor.run {
                equityData = eqLog
                latestPrice = price
                trades = transfers
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

}
