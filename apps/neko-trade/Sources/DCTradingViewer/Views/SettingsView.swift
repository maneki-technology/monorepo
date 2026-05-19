import SwiftUI
import Foundation
import UserNotifications

struct SettingsView: View {
    @ObservedObject var settings: AppSettings
    @State private var testStatus: String = ""
    @State private var isTesting = false
    @State private var botStatus: BotStatus?
    @State private var wasLive: Bool = false

    private let client = TursoClient()
    private let statusTimer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        ScrollView {
            settingsContent
        }
        .navigationTitle("Settings")
        .task { await loadStatus() }
        .onReceive(statusTimer) { _ in
            guard settings.isConfigured else { return }
            Task { await loadStatus() }
        }
    }

    private var settingsContent: some View {
        LazyVStack(spacing: 16) {
            if settings.isConfigured, let bs = botStatus {
                botStatusCard(bs)
            }

            settingsGroup(accent: settings.isConfigured ? .green : .orange) {
                connectionHeader(
                    title: "Database Connection",
                    subtitle: "Connect to your Turso database to view live trading data.",
                    icon: "server.rack",
                    isConnected: settings.isConfigured
                )
                cardDivider(.secondary)
                settingsTextField("TURSO URL", placeholder: "libsql://your-db.turso.io", text: $settings.tursoURL, keyboardURL: true)
                cardDivider(.secondary)
                settingsSecureField("AUTH TOKEN", placeholder: "eyJhbGciOi...", text: $settings.tursoToken)
            }

            settingsGroup(accent: settings.isAlpacaConfigured ? .green : .orange) {
                connectionHeader(
                    title: "Alpaca Paper Trading",
                    subtitle: "Connect to Alpaca for live position data.",
                    icon: "chart.bar.fill",
                    isConnected: settings.isAlpacaConfigured
                )
                cardDivider(.secondary)
                settingsTextField("API KEY", placeholder: "PK...", text: $settings.alpacaKey)
                cardDivider(.secondary)
                settingsSecureField("API SECRET", placeholder: "Your Alpaca secret", text: $settings.alpacaSecret)
            }
        }
        .padding()
    }

    private func testConnection() {
        isTesting = true
        testStatus = ""
        let client = TursoClient(settings: settings)
        Task {
            do {
                let _ = try await client.fetchLatestEquity()
                await MainActor.run {
                    testStatus = "✓ Connected successfully"
                    isTesting = false
                }
            } catch {
                await MainActor.run {
                    testStatus = "✗ \(error.localizedDescription)"
                    isTesting = false
                }
            }
        }
    }

    private func botStatusCard(_ bs: BotStatus) -> some View {
        let statusColor: Color = bs.isLive ? .green : .red
        let statusText = bs.isLive ? "LIVE" : "OFFLINE"

        return VStack(spacing: 0) {
            HStack(spacing: 12) {
                Circle()
                    .fill(statusColor)
                    .frame(width: 12, height: 12)
                    .shadow(color: statusColor.opacity(0.55), radius: 6)

                VStack(alignment: .leading, spacing: 2) {
                    Text(statusText)
                        .font(.system(.title2, design: .monospaced, weight: .bold))
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

            cardDivider(statusColor)

            HStack {
                metricLabel(icon: "clock.arrow.circlepath", text: "Last tick: \(bs.lastTickRelative)")
                Spacer()
                metricLabel(icon: "number", text: "\(bs.tickCount) ticks")
            }
            .padding(.horizontal)
            .padding(.vertical, 10)

            if bs.checkpointNeedsAttention {
                cardDivider(.orange)

                HStack(spacing: 8) {
                    Image(systemName: "externaldrive.trianglebadge.exclamationmark")
                        .font(.system(.caption, design: .monospaced, weight: .semibold))
                        .foregroundStyle(.orange)
                    Text(bs.checkpointHealth)
                        .font(.system(.caption, design: .monospaced, weight: .semibold))
                        .foregroundStyle(.orange)
                    if !bs.checkpointError.isEmpty {
                        Text(bs.checkpointError)
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.vertical, 10)
            }

            exchangeStatusRow(bs)

            cardDivider(statusColor)

            HStack {
                metricLabel(icon: "tag", text: bs.symbolMetadata.tradingSymbol)
                Spacer()
                Text("QUOTE \(bs.symbolMetadata.quoteAsset)")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal)
            .padding(.vertical, 10)

            resourceStatusRow(bs)
        }
        .background {
            AppCardSurface(accent: statusColor, borderOpacity: 0.24)
        }
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func settingsTextField(_ title: String, placeholder: String, text: Binding<String>, keyboardURL: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(.caption2, design: .monospaced, weight: .medium))
                .foregroundStyle(.secondary)
            TextField(placeholder, text: text)
                .font(.system(.body, design: .monospaced))
                .textFieldStyle(.plain)
                .autocorrectionDisabled()
                #if os(iOS)
                .textInputAutocapitalization(.never)
                .keyboardType(keyboardURL ? .URL : .default)
                #endif
        }
        .padding()
    }

    private func settingsSecureField(_ title: String, placeholder: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(.caption2, design: .monospaced, weight: .medium))
                .foregroundStyle(.secondary)
            SecureField(placeholder, text: text)
                .font(.system(.body, design: .monospaced))
                .textFieldStyle(.plain)
                .autocorrectionDisabled()
                #if os(iOS)
                .textInputAutocapitalization(.never)
                #endif
        }
        .padding()
    }

    private func settingsGroup<Content: View>(accent: Color, @ViewBuilder content: () -> Content) -> some View {
        VStack(spacing: 0) {
            content()
        }
        .background {
            AppCardSurface(accent: accent, borderOpacity: accent == .green ? 0.18 : 0.24)
        }
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func connectionHeader(title: String, subtitle: String, icon: String, isConnected: Bool) -> some View {
        let color: Color = isConnected ? .green : .orange

        return HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(.body, design: .monospaced, weight: .semibold))
                .foregroundStyle(color)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(.body, design: .monospaced, weight: .semibold))
                    .foregroundStyle(.primary)
                Text(subtitle)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: isConnected ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(color)
                .font(.system(.title3, design: .monospaced))
        }
        .padding()
    }

    private func metricLabel(icon: String, text: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.secondary)
            Text(text)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.secondary)
        }
    }

    private func cardDivider(_ color: Color) -> some View {
        Divider()
            .overlay(color.opacity(0.18))
    }

    private func loadStatus() async {
        guard settings.isConfigured else { return }
        do {
            botStatus = try await client.fetchBotStatus()
            let isLive = botStatus?.isLive ?? false
            if wasLive && !isLive {
                sendOfflineNotification()
            }
            wasLive = isLive
        } catch {
            // Silently fail, status will remain nil or stale
        }
    }

    private func resourceStatusRow(_ bs: BotStatus) -> some View {
        let resourceColor: Color = bs.resourceNeedsAttention ? .yellow : .green
        let detail = bs.resourceError.isEmpty ? "OK" : bs.resourceError

        let columns = [GridItem(.adaptive(minimum: 130), alignment: .leading)]

        return VStack(alignment: .leading, spacing: 10) {
            Divider()
                .overlay(resourceColor.opacity(0.25))

            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "gauge")
                    .font(.system(.body, design: .monospaced, weight: .semibold))
                    .foregroundStyle(resourceColor)
                Text("RESOURCE \(bs.resourceHealth.isEmpty ? "OK" : bs.resourceHealth)")
                    .font(.system(.body, design: .monospaced, weight: .semibold))
                    .foregroundStyle(resourceColor)
                Spacer()
            }
            .padding(.horizontal)

            Text(detail)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .padding(.horizontal)

            LazyVGrid(columns: columns, alignment: .leading, spacing: 8) {
                resourceMetric("Disk free", "\(Int(bs.resourceDiskFreeMb)) MB")
                resourceMetric("Disk used", "\(String(format: "%.1f", bs.resourceDiskUsedPct))%")
                resourceMetric("Memory", "\(String(format: "%.1f", bs.resourceRssMb)) MB")
                resourceMetric("Feed gap", "\(Int(bs.resourceFeedGapSec))s")
                resourceMetric("WS lag", "\(Int(bs.resourceWsLagSec))s")
                resourceMetric("HTTP", "\(bs.resourceHttpErrors) err / \(Int(bs.resourceHttpMaxMs))ms")
            }
            .padding(.horizontal)
        }
        .padding(.vertical, 10)
    }

    private func exchangeStatusRow(_ bs: BotStatus) -> some View {
        let exchangeColor: Color = bs.exchangeNeedsAttention ? .orange : .green
        let health = bs.exchangeHealth.isEmpty ? "OK" : bs.exchangeHealth
        let detail = bs.exchangeError.isEmpty ? "OK" : bs.exchangeError

        return VStack(alignment: .leading, spacing: 8) {
            Divider()
                .overlay(exchangeColor.opacity(0.25))

            HStack(alignment: .top, spacing: 8) {
                Image(systemName: bs.exchangeNeedsAttention ? "exclamationmark.triangle.fill" : "checkmark.seal.fill")
                    .font(.system(.body, design: .monospaced, weight: .semibold))
                    .foregroundStyle(exchangeColor)
                Text("EXCHANGE \(health)")
                    .font(.system(.body, design: .monospaced, weight: .semibold))
                    .foregroundStyle(exchangeColor)
                Spacer()
            }
            .padding(.horizontal)

            Text(detail)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .padding(.horizontal)
        }
        .padding(.vertical, 10)
    }

    private func resourceMetric(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title.uppercased())
                .font(.system(.caption2, design: .monospaced, weight: .medium))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(.caption, design: .monospaced, weight: .semibold))
                .foregroundStyle(.primary)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 6)
        .padding(.horizontal, 8)
        .background {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(.secondary.opacity(0.08))
        }
    }

    private func sendOfflineNotification() {
        let content = UNMutableNotificationContent()
        content.title = "⚠️ DC Trading Bot"
        content.subtitle = "Bot is OFFLINE"
        content.body = "Last tick: \(botStatus?.lastTickRelative ?? "unknown")"
        content.sound = .default
        let request = UNNotificationRequest(identifier: "bot-offline", content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }
}
