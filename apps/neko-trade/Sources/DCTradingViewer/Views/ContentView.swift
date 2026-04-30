import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case dashboard = "Dashboard"
    case ledger = "Ledger"
    case equity = "Equity"
    case trades = "Trades"
    case settings = "Settings"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .dashboard: return "gauge.with.dots.needle.33percent"
        case .equity: return "chart.line.uptrend.xyaxis"
        case .trades: return "list.bullet.rectangle.portrait"
        case .ledger: return "book.closed.fill"
        case .settings: return "gearshape"
        }
    }
}

struct ContentView: View {
    @StateObject private var settings = AppSettings.shared
    @State private var selectedTab: AppTab = .dashboard

    var body: some View {
        #if os(macOS)
        macOSLayout
        #else
        iOSLayout
        #endif
    }

    // MARK: - macOS: Sidebar

    #if os(macOS)
    private var macOSLayout: some View {
        NavigationSplitView {
            List(AppTab.allCases, selection: $selectedTab) { tab in
                Label(tab.rawValue, systemImage: tab.icon)
                    .font(.system(.body, design: .monospaced))
                    .tag(tab)
            }
            .navigationTitle("DC Trading")
            .listStyle(.sidebar)
        } detail: {
            detailView(for: selectedTab)
        }
        .frame(minWidth: 800, minHeight: 560)
    }
    #endif

    // MARK: - iOS: TabView

    #if os(iOS)
    private var iOSLayout: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                DashboardView(settings: settings)
            }
            .tabItem {
                Label(AppTab.dashboard.rawValue, systemImage: AppTab.dashboard.icon)
            }
            .tag(AppTab.dashboard)

            NavigationStack {
                LedgerView(settings: settings)
            }
            .tabItem {
                Label(AppTab.ledger.rawValue, systemImage: AppTab.ledger.icon)
            }
            .tag(AppTab.ledger)

            NavigationStack {
                EquityChartView(settings: settings)
            }
            .tabItem {
                Label(AppTab.equity.rawValue, systemImage: AppTab.equity.icon)
            }
            .tag(AppTab.equity)

            NavigationStack {
                TradeHistoryView(settings: settings)
            }
            .tabItem {
                Label(AppTab.trades.rawValue, systemImage: AppTab.trades.icon)
            }
            .tag(AppTab.trades)

            NavigationStack {
                SettingsView(settings: settings)
            }
            .tabItem {
                Label(AppTab.settings.rawValue, systemImage: AppTab.settings.icon)
            }
            .tag(AppTab.settings)
        }
    }
    #endif

    // MARK: - Detail View (macOS)

    @ViewBuilder
    private func detailView(for tab: AppTab) -> some View {
        switch tab {
        case .dashboard:
            DashboardView(settings: settings)
        case .equity:
            EquityChartView(settings: settings)
        case .trades:
            TradeHistoryView(settings: settings)
        case .ledger:
            LedgerView(settings: settings)
        case .settings:
            SettingsView(settings: settings)
        }
    }
}
