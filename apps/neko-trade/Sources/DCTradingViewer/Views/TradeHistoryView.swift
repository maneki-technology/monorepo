import SwiftUI
import Charts

struct TradeHistoryView: View {
    @ObservedObject var settings: AppSettings
    @State private var trades: [TradeEvent] = []
    @State private var positions: [Position] = []
    @State private var latestPrice: Double = 0
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingPositions = false
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

            HStack(spacing: 0) {
                tabButton("Trades", isSelected: !showingPositions) { showingPositions = false }
                tabButton("Positions", isSelected: showingPositions) { showingPositions = true }
            }
            .padding(.horizontal)
            .padding(.top, 8)

            Divider().padding(.top, 8)

            Group {
                if !settings.isConfigured {
                    notConfiguredPlaceholder
                } else if isLoading && trades.isEmpty && positions.isEmpty {
                    ProgressView("Loading...")
                        .font(.system(.body, design: .monospaced))
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
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
        .onChange(of: showingPositions) { _ in Task { await loadData() } }
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
                        emptyState("No trade events yet.")
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
    }


    // MARK: - Trade Event Row

    private func tradeRow(_ trade: TradeEvent) -> some View {
        HStack(spacing: 12) {
            Text(trade.action)
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
                Text("Fee: \(formatCurrency(trade.fee))")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.orange)
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

    private func positionRow(_ pos: Position) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header: status + size
            HStack {
                Text(pos.status)
                    .font(.system(.caption, design: .monospaced, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background {
                        Capsule()
                            .fill(pos.isOpen ? Color.blue : pos.isStale ? Color.gray : ((pos.pnl ?? 0) >= 0 ? Color.green : Color.red))
                    }

                if let exitType = pos.exitType, !pos.isOpen, !pos.isStale {
                    Text(exitType)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text("\(String(format: "%.8f", pos.size)) BTC")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.secondary)
            }

            // Entry → Exit prices
            HStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("ENTRY")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    Text(formatCurrency(pos.entryPrice))
                        .font(.system(.body, design: .monospaced, weight: .semibold))
                    if let drift = pos.entryDriftPct {
                        let color: Color = drift == 0 ? .secondary : (drift > 0 ? .red : .green)
                        Text(String(format: "drift %+.2f%%", drift))
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(color)
                    }
                }

                Image(systemName: "arrow.right")
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 2) {
                    Text(pos.isOpen ? "CURRENT" : "EXIT")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    if let exitPrice = pos.exitPrice {
                        Text(formatCurrency(exitPrice))
                            .font(.system(.body, design: .monospaced, weight: .semibold))
                    } else if pos.isOpen && latestPrice > 0 {
                        Text(formatCurrency(latestPrice))
                            .font(.system(.body, design: .monospaced, weight: .semibold))
                            .foregroundStyle(.blue)
                    } else {
                        Text("—")
                            .font(.system(.body, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(pos.isOpen ? "UNREALIZED" : "REALIZED")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    if let pnl = pos.pnl {
                        Text(formatCurrency(pnl))
                            .font(.system(.body, design: .monospaced, weight: .bold))
                            .foregroundStyle(pnl >= 0 ? .green : .red)
                    } else if pos.isOpen && latestPrice > 0 {
                        let unrealized = (latestPrice - pos.entryPrice) * pos.size
                        Text(formatCurrency(unrealized))
                            .font(.system(.body, design: .monospaced, weight: .bold))
                            .foregroundStyle(unrealized >= 0 ? .green : .red)
                    } else {
                        Text("—")
                            .font(.system(.body, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                }
            }

            // Footer: fees + time
            HStack {
                if let fees = pos.fees {
                    Text("Fee: \(formatCurrency(fees))")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.orange)
                }
                Spacer()
                Text(formatTimestamp(pos.entryTime))
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
                            (pos.isOpen ? Color.blue : ((pos.pnl ?? 0) >= 0 ? Color.green : Color.red)).opacity(0.2),
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
        if trades.isEmpty && positions.isEmpty { isLoading = true }
        errorMessage = nil
        do {
            async let equityLogTask = client.fetchEquityLog(days: 7)
            async let latestTask = client.fetchLatestEquity()

            let eqLog = try await equityLogTask
            let equity = try await latestTask
            let price = equity?.price ?? 0

            if showingPositions {
                var pos = try await client.fetchPositions()
                if settings.isAlpacaConfigured {
                    if let ap = try? await AlpacaClient.fetchPosition(
                        apiKey: settings.alpacaKey, apiSecret: settings.alpacaSecret
                    ) {
                        pos = pos.filter { !$0.isOpen }
                        pos.insert(Position(
                            id: 0, status: "OPEN",
                            entryPrice: ap.entryPrice,
                            entryTime: "",
                            exitPrice: nil, exitTime: nil,
                            size: ap.qty,
                            pnl: ap.unrealizedPnl,
                            fees: nil, exitType: nil,
                            signalPrice: nil, alpacaOrderId: nil,
                            createdAt: ""
                        ), at: 0)
                    }
                }
                await MainActor.run {
                    equityData = eqLog
                    latestPrice = price
                    positions = pos
                    isLoading = false
                }
            } else {
                let events = try await client.fetchTradeEvents()
                await MainActor.run {
                    equityData = eqLog
                    latestPrice = price
                    trades = events
                    isLoading = false
                }
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
