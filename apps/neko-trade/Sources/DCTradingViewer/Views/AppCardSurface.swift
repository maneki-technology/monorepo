import SwiftUI

struct AppCardSurface: View {
    var accent: Color?
    var borderOpacity: Double = 0.18

    var body: some View {
        RoundedRectangle(cornerRadius: 12, style: .continuous)
            .fill(.ultraThinMaterial)
            .overlay {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder((accent ?? .secondary).opacity(accent == nil ? 0.10 : borderOpacity), lineWidth: 1)
            }
            .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
    }
}
