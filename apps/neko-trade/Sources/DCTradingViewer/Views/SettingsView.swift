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
        Form {
            // Bot Status Section
            if settings.isConfigured, let bs = botStatus {
                let statusColor: Color = bs.isLive ? .green : .red
                let statusText = bs.isLive ? "LIVE" : "OFFLINE"
                
                Section {
                    VStack(spacing: 0) {
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

                        if bs.checkpointNeedsAttention {
                            Divider()
                                .overlay(Color.orange.opacity(0.25))

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

                        Divider()
                            .overlay(statusColor.opacity(0.2))

                        HStack {
                            HStack(spacing: 6) {
                                Image(systemName: "tag")
                                    .font(.system(.caption2, design: .monospaced))
                                    .foregroundStyle(.secondary)
                                Text(bs.symbolMetadata.tradingSymbol)
                                    .font(.system(.caption, design: .monospaced))
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Text("QUOTE \(bs.symbolMetadata.quoteAsset)")
                                .font(.system(.caption, design: .monospaced))
                                .foregroundStyle(.secondary)
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
            }
            
            Section {
                HStack {
                    VStack(alignment: .leading, spacing: 6) {
                        Label("Database Connection", systemImage: "server.rack")
                            .font(.system(.title3, design: .monospaced, weight: .semibold))
                            .foregroundStyle(.primary)
                        Text("Connect to your Turso database to view live trading data.")
                            .font(.system(.caption, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Image(systemName: settings.isConfigured ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(settings.isConfigured ? .green : .orange)
                        .font(.title3)
                }
                .padding(.vertical, 4)
            }

            Section("Turso URL") {
                TextField("libsql://your-db.turso.io", text: $settings.tursoURL)
                    .font(.system(.body, design: .monospaced))
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()
                    #if os(iOS)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                    #endif
            }

            Section("Auth Token") {
                SecureField("eyJhbGciOi...", text: $settings.tursoToken)
                    .font(.system(.body, design: .monospaced))
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()
                    #if os(iOS)
                    .textInputAutocapitalization(.never)
                    #endif
            }


            Section {
                HStack {
                    VStack(alignment: .leading, spacing: 6) {
                        Label("Alpaca Paper Trading", systemImage: "chart.bar.fill")
                            .font(.system(.title3, design: .monospaced, weight: .semibold))
                            .foregroundStyle(.primary)
                        Text("Connect to Alpaca for live position data.")
                            .font(.system(.caption, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Image(systemName: settings.isAlpacaConfigured ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(settings.isAlpacaConfigured ? .green : .orange)
                        .font(.title3)
                }
                .padding(.vertical, 4)
            }

            Section("API Key") {
                TextField("PK...", text: $settings.alpacaKey)
                    .font(.system(.body, design: .monospaced))
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()
                    #if os(iOS)
                    .textInputAutocapitalization(.never)
                    #endif
            }

            Section("API Secret") {
                SecureField("Your Alpaca secret", text: $settings.alpacaSecret)
                    .font(.system(.body, design: .monospaced))
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()
                    #if os(iOS)
                    .textInputAutocapitalization(.never)
                    #endif
            }

        }
        .formStyle(.grouped)
        .navigationTitle("Settings")
        .task { await loadStatus() }
        .onReceive(statusTimer) { _ in
            guard settings.isConfigured else { return }
            Task { await loadStatus() }
        }
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
