import SwiftUI
import Charts

struct EquityChartView: View {
    @ObservedObject var settings: AppSettings
    @State private var equityData: [EquityLog] = []
    @State private var botStatus: BotStatus?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var selectedDays = 7

    private let client = TursoClient()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()
    private let dayOptions = [1, 3, 7, 14, 30]
    private var quoteAsset: String { (botStatus?.symbolMetadata ?? .fallback).quoteAsset }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                periodSelector
                    .padding(.horizontal)

                if !settings.isConfigured {
                    notConfiguredPlaceholder
                } else if isLoading && equityData.isEmpty {
                    ProgressView("Loading chart data...")
                        .font(.system(.body, design: .monospaced))
                        .frame(maxWidth: .infinity, minHeight: 300)
                } else if let error = errorMessage, equityData.isEmpty {
                    errorPlaceholder(error)
                } else {
                    chartBody
                }
            }
        }
        .navigationTitle("Equity")
        .toolbar {
            ToolbarItem(placement: .automatic) {
                Button(action: { Task { await loadData() } }) {
                    Image(systemName: "arrow.clockwise")
                }
                .disabled(isLoading)
            }
        }
        .task { await loadData() }
        .onChange(of: selectedDays) { _ in Task { await loadData() } }
        .onReceive(timer) { _ in
            guard settings.isConfigured else { return }
            Task { await loadData() }
        }
    }

    // MARK: - Period Selector

    private var periodSelector: some View {
        HStack(spacing: 0) {
            ForEach(dayOptions, id: \.self) { days in
                Button(action: { selectedDays = days }) {
                    Text(days == 1 ? "24H" : "\(days)D")
                        .font(.system(.caption, design: .monospaced, weight: selectedDays == days ? .bold : .regular))
                        .foregroundStyle(selectedDays == days ? .white : .secondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background {
                            if selectedDays == days {
                                Capsule().fill(Color.cyan.opacity(0.8))
                            }
                        }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background { Capsule().fill(.ultraThinMaterial) }
    }

    // MARK: - Chart Body

    @ViewBuilder
    private var chartBody: some View {
        VStack(spacing: 16) {
            if !equityData.isEmpty { summaryRow }

            if equityData.count >= 2 {
                // Equity chart
                chartCard("EQUITY") {
                    equityChart
                        .frame(minHeight: 280)
                        .clipped()
                }


                chartCard("REGIME") {
                    regimeChart
                        .frame(height: 24)
                        .clipped()
                }
            } else {
                Text("Not enough data points to chart.")
                    .font(.system(.body, design: .monospaced))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, minHeight: 200)
            }

            Text("\(equityData.count) data points")
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.tertiary)
        }
        .padding()
    }

    private func chartCard<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(.caption, design: .monospaced, weight: .medium))
                .foregroundStyle(.secondary)
            content()
        }
        .padding()
        .background {
            AppCardSurface()
        }
    }

    // MARK: - Summary

    @ViewBuilder
    private var summaryRow: some View {
        let first = equityData.first!
        let last = equityData.last!
        let change = last.equity - first.equity
        let pctChange = first.equity != 0 ? (change / first.equity) * 100 : 0
        let minEq = equityData.map(\.equity).min() ?? 0
        let maxEq = equityData.map(\.equity).max() ?? 0

        HStack(spacing: 12) {
            miniStat("CHANGE", value: formatCurrency(change), color: change >= 0 ? .green : .red)
            miniStat("CHANGE %", value: String(format: "%+.2f%%", pctChange), color: pctChange >= 0 ? .green : .red)
            miniStat("LOW", value: formatCurrency(minEq), color: .orange)
            miniStat("HIGH", value: formatCurrency(maxEq), color: .cyan)
        }
    }

    private func miniStat(_ title: String, value: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(.caption, design: .monospaced, weight: .semibold))
                .foregroundStyle(color)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(.ultraThinMaterial)
        }
    }

    // MARK: - Equity Chart (no trade markers — different Y scale)

    @ViewBuilder
    private var equityChart: some View {
        let minEq = (equityData.map(\.equity).min() ?? 0) * 0.999
        let maxEq = (equityData.map(\.equity).max() ?? 0) * 1.001

        Chart {
            ForEach(equityData) { point in
                LineMark(
                    x: .value("Time", point.date),
                    y: .value("Equity", point.equity)
                )
                .foregroundStyle(
                    .linearGradient(
                        colors: [.cyan, .blue],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .lineStyle(StrokeStyle(lineWidth: 2))
                .interpolationMethod(.monotone)

                AreaMark(
                    x: .value("Time", point.date),
                    y: .value("Equity", point.equity)
                )
                .foregroundStyle(
                    .linearGradient(
                        colors: [.cyan.opacity(0.15), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.monotone)
            }
        }
        .chartYScale(domain: minEq...maxEq)
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
    }


    // MARK: - Regime Bar

    @ViewBuilder
    private var regimeChart: some View {
        Chart {
            ForEach(equityData) { point in
                RectangleMark(
                    x: .value("Time", point.date),
                    y: .value("V", 1)
                )
                .foregroundStyle(point.regimeColor.opacity(0.6))
            }
        }
        .chartYAxis(.hidden)
        .chartXAxis(.hidden)
    }

    // MARK: - Placeholders

    private var notConfiguredPlaceholder: some View {
        VStack(spacing: 12) {
            Image(systemName: "chart.xyaxis.line")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text("Configure Turso in Settings to view equity chart.")
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
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
                .font(.system(.body, design: .monospaced))
                .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
        .padding()
    }

    // MARK: - Data

    private func loadData() async {
        guard settings.isConfigured else { return }
        if equityData.isEmpty { isLoading = true }
        errorMessage = nil
        do {
            async let dataTask = client.fetchEquityLog(days: selectedDays)
            async let statusTask = client.fetchBotStatus()
            let (data, status) = try await (dataTask, statusTask)
            await MainActor.run {
                equityData = data
                botStatus = status
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }

    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = quoteAsset == "USD" ? .currency : .decimal
        formatter.currencyCode = quoteAsset
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        let formatted = formatter.string(from: NSNumber(value: value)) ?? "0.00"
        return quoteAsset == "USD" ? formatted : "\(formatted) \(quoteAsset)"
    }
}
