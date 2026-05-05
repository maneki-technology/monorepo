import SwiftUI
import Charts

struct DashboardView: View {
    @ObservedObject var settings: AppSettings
    @State private var openPosition: Position?
    @State private var latestEquity: EquityLog?
    @State private var botStatus: BotStatus?
    @State private var realizedPnL: Double?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var lastRefresh: Date?
    @State private var equityHistory: [EquityLog] = []
    @State private var markPrice: Double = 0
    @State private var estimatedEquity: Double?
    @State private var markPriceHistory: [(Date, Double)] = []

    private let client = TursoClient()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        ScrollView {
            if !settings.isConfigured {
                notConfiguredView
            } else if isLoading && latestEquity == nil {
                ProgressView("Loading...")
                    .font(.system(.body, design: .monospaced))
                    .frame(maxWidth: .infinity, minHeight: 200)
            } else if let error = errorMessage, latestEquity == nil {
                errorView(error)
            } else {
                dashboardContent
            }
        }
        .navigationTitle("Dashboard")
        .toolbar {
            ToolbarItem(placement: .automatic) {
                Button(action: { Task { await refresh() } }) {
                    Image(systemName: "arrow.clockwise")
                }
                .disabled(isLoading)
            }
        }
        .task { await refresh() }
        .onReceive(timer) { _ in
            guard settings.isConfigured else { return }
            Task { await refresh() }
        }
    }

    // MARK: - Dashboard Content

    @ViewBuilder
    private var dashboardContent: some View {
        LazyVStack(spacing: 16) {
            // Bot status indicator

            // Regime + Equity header
            if let eq = latestEquity {
                regimeCard(eq)
            }

            // Stats grid — keep top-level metrics focused on current account value.
            let symbol = botStatus?.symbolMetadata ?? .fallback
            let unrealized = openPosition?.pnl ?? latestEquity?.unrealized
            let price = markPrice > 0 ? markPrice : latestEquity?.price ?? openPosition?.entryPrice ?? 0

            HStack(spacing: 12) {
                statCard(
                    title: "EQUITY",
                    value: estimatedEquity.map { formatCurrency($0, quote: symbol.quoteAsset) } ?? "—",
                    icon: "chart.bar.xaxis",
                    color: .mint
                )
                statCard(
                    title: "REALIZED P&L",
                    value: realizedPnL.map { formatCurrency($0, quote: symbol.quoteAsset) } ?? "—",
                    icon: "banknote",
                    color: (realizedPnL ?? 0) >= 0 ? .green : .red
                )
            }

            HStack(spacing: 12) {
                statCard(
                    title: "UNREALIZED P&L",
                    value: unrealized.map { formatCurrency($0, quote: symbol.quoteAsset) } ?? "—",
                    icon: "clock.arrow.circlepath",
                    color: (unrealized ?? 0) >= 0 ? .green : .red
                )
                statCard(
                    title: symbol.priceLabel,
                    value: price > 0 ? formatCurrency(price, quote: symbol.quoteAsset) : "—",
                    icon: "bitcoinsign.circle",
                    color: .orange
                )
            }

            // Sparklines
            if equityHistory.count >= 2 || markPriceHistory.count >= 2 {
                HStack(spacing: 12) {
                    sparklineCard("EQUITY", data: equityHistory.suffix(50).map(\.equity), color: .cyan)
                    sparklineCard(symbol.priceLabel, data: markPriceHistory.suffix(60).map(\.1), color: .orange)
                }
            }
            // Open position
            if let pos = openPosition {
                openPositionCard(pos)
            } else {
                noPositionCard
            }

            // Last refresh
            if let lr = lastRefresh {
                Text("Updated \(lr, style: .relative) ago")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.tertiary)
                    .padding(.top, 4)
            }
        }
        .padding()
    }

    // MARK: - Cards

    private func regimeCard(_ eq: EquityLog) -> some View {
        let quote = (botStatus?.symbolMetadata ?? .fallback).quoteAsset
        return HStack(spacing: 12) {
            Circle()
                .fill(eq.regimeColor)
                .frame(width: 12, height: 12)
                .shadow(color: eq.regimeColor.opacity(0.6), radius: 6)

            Text(eq.regime)
                .font(.system(.title2, design: .monospaced, weight: .bold))
                .foregroundStyle(eq.regimeColor)

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("CAPITAL")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.secondary)
                Text(formatCurrency(eq.capital, quote: quote))
                    .font(.system(.body, design: .monospaced, weight: .semibold))
            }
        }
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(
                            (eq.isBull ? Color.green : Color.red).opacity(0.3),
                            lineWidth: 1
                        )
                )
        }
    }

    private func botStatusCard(_ bs: BotStatus) -> some View {
        let statusColor: Color = bs.isLive ? .green : .red
        let statusText = bs.isLive ? "LIVE" : "OFFLINE"

        return VStack(spacing: 0) {
            // Main status row
            HStack(spacing: 14) {
                // Pulsing status dot
                ZStack {
                    Circle()
                        .fill(statusColor.opacity(0.25))
                        .frame(width: 32, height: 32)
                    Circle()
                        .fill(statusColor)
                        .frame(width: 14, height: 14)
                        .shadow(color: statusColor.opacity(0.8), radius: 8)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(statusText)
                        .font(.system(.title2, design: .monospaced, weight: .heavy))
                        .foregroundStyle(statusColor)
                    Text("v\(bs.version)")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("UPTIME")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    Text(bs.formattedUptime)
                        .font(.system(.body, design: .monospaced, weight: .semibold))
                }
            }
            .padding()

            Divider()
                .overlay(statusColor.opacity(0.2))

            // Detail row
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    Text("Last tick: \(bs.lastTickRelative)")
                        .font(.system(.caption, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                Spacer()
                HStack(spacing: 6) {
                    Image(systemName: "number")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    Text("\(bs.tickCount) ticks")
                        .font(.system(.caption, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 10)
        }
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(statusColor.opacity(0.4), lineWidth: 1.5)
                )
                .shadow(color: statusColor.opacity(0.15), radius: 12, y: 4)
        }
    }

    private func statCard(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(color)
                Text(title)
                    .font(.system(.caption2, design: .monospaced, weight: .medium))
                    .foregroundStyle(.secondary)
            }
            Text(value)
                .font(.system(.title3, design: .monospaced, weight: .bold))
                .foregroundStyle(.primary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
        }
    }

    private func openPositionCard(_ pos: Position) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label("OPEN POSITION", systemImage: "arrow.up.right.circle.fill")
                    .font(.system(.caption, design: .monospaced, weight: .bold))
                    .foregroundStyle(.green)
                Spacer()
                Text("SIZE: \(String(format: "%.8f", pos.size))")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.secondary)
            }

            Divider()

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("ENTRY PRICE")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    Text(formatCurrency(pos.entryPrice, quote: (botStatus?.symbolMetadata ?? .fallback).quoteAsset))
                        .font(.system(.body, design: .monospaced, weight: .semibold))
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("ENTRY TIME")
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                    Text(formatTimestamp(pos.entryTime))
                        .font(.system(.caption, design: .monospaced))
                }
            }
        }
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Color.green.opacity(0.2), lineWidth: 1)
                )
        }
    }

    private var noPositionCard: some View {
        HStack(spacing: 8) {
            Image(systemName: "moon.zzz.fill")
                .foregroundStyle(.secondary)
            Text("No open position")
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
        }
    }

    private var notConfiguredView: some View {
        VStack(spacing: 12) {
            Image(systemName: "gear.badge.questionmark")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text("Not Connected")
                .font(.system(.title3, design: .monospaced, weight: .semibold))
            Text("Configure your Turso database in Settings.")
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 36))
                .foregroundStyle(.orange)
            Text("Error")
                .font(.system(.title3, design: .monospaced, weight: .semibold))
            Text(message)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") { Task { await refresh() } }
                .font(.system(.body, design: .monospaced))
                .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
        .padding()
    }

    // MARK: - Data

    private func refresh() async {
        guard settings.isConfigured else { return }
        isLoading = true
        errorMessage = nil
        do {
            async let equityTask = client.fetchLatestEquity()
            async let realizedPnLTask = client.fetchTotalRealizedPnL()
            async let managedBalancesTask = client.fetchManagedBalances()
            async let historyTask = client.fetchRecentEquity(limit: 50)
            async let statusTask = client.fetchBotStatus()

            let (equity, realized, history, managedBalances, status) = try await (equityTask, realizedPnLTask, historyTask, managedBalancesTask, statusTask)
            let symbol = status?.symbolMetadata ?? .fallback
            var alpacaPos: AlpacaClient.AlpacaPosition? = nil
            if settings.isAlpacaConfigured {
                alpacaPos = try? await AlpacaClient.fetchPosition(
                    apiKey: settings.alpacaKey, apiSecret: settings.alpacaSecret, tradingSymbol: symbol.tradingSymbol
                )
            }
            async let priceTask = BinanceClient.fetchPrice(symbol: symbol.markSymbol)
            async let bnbPriceTask = BinanceClient.fetchPrice(symbol: symbol.bnbMarkSymbol)
            async let klinesTask = BinanceClient.fetchKlines(symbol: symbol.markSymbol, interval: "5m", limit: 60)
            let price = try? await priceTask
            let bnb = try? await bnbPriceTask
            let klines = (try? await klinesTask) ?? []
            let currentMarkPrice = price ?? equity?.price ?? 0
            let bnbPriceRequired = abs(managedBalances.bnbQuantity) > 0.00000001
            let canMarkEquity = currentMarkPrice > 0 && (!bnbPriceRequired || bnb != nil)
            let markedEquity: Double? = canMarkEquity
                ? managedBalances.cash + managedBalances.btcQuantity * currentMarkPrice + managedBalances.bnbQuantity * (bnb ?? 0)
                : nil

            await MainActor.run {
                // Use Alpaca position if available, fall back to Turso
                if let ap = alpacaPos {
                    openPosition = Position(
                        id: 0, status: "OPEN",
                        entryPrice: ap.entryPrice,
                        entryTime: "",
                        exitPrice: nil, exitTime: nil,
                        size: ap.qty,
                        pnl: ap.unrealizedPnl,
                        fees: nil, exitType: nil,
                        signalPrice: nil, alpacaOrderId: nil,
                        createdAt: ""
                    )
                } else {
                    openPosition = nil
                }
                latestEquity = equity
                botStatus = status
                realizedPnL = realized
                equityHistory = history
                if let price { markPrice = price }
                estimatedEquity = markedEquity
                markPriceHistory = klines
                lastRefresh = Date()
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

    private func formatCurrency(_ value: Double, quote: String = "USD") -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = quote == "USD" ? .currency : .decimal
        formatter.currencyCode = quote
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        let formatted = formatter.string(from: NSNumber(value: value)) ?? "0.00"
        return quote == "USD" ? formatted : "\(formatted) \(quote)"
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

    private func sparklineCard(_ title: String, data: [Double], color: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(.caption2, design: .monospaced, weight: .medium))
                .foregroundStyle(.secondary)

            Chart {
                ForEach(Array(data.enumerated()), id: \.offset) { index, value in
                    LineMark(
                        x: .value("I", index),
                        y: .value("V", value)
                    )
                    .foregroundStyle(color)
                    .lineStyle(StrokeStyle(lineWidth: 1.5))
                    .interpolationMethod(.catmullRom)
                }
            }
            .chartXAxis(.hidden)
            .chartYAxis(.hidden)
            .chartYScale(domain: (data.min() ?? 0) * 0.999 ... (data.max() ?? 1) * 1.001)
            .frame(height: 80)
            .clipped()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(.ultraThinMaterial)
        }
}
}
