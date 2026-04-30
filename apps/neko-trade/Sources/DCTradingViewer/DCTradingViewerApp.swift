import SwiftUI
import UserNotifications

@main
struct DCTradingViewerApp: App {
    init() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
        }
        #if os(macOS)
        .defaultSize(width: 1000, height: 680)
        #endif
    }
}
