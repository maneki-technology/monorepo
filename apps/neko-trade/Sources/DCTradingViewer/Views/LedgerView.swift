import SwiftUI

struct LedgerView: View {
    @ObservedObject var settings: AppSettings
    @State private var ledger: [LedgerEntry] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showDepositSheet = false
    @State private var depositAmount = ""
    @State private var isDepositing = false

    private let client = TursoClient()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 0) {
            if !settings.isConfigured {
                notConfiguredPlaceholder
            } else if isLoading && ledger.isEmpty {
                ProgressView("Loading...")
                    .font(.system(.body, design: .monospaced))
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = errorMessage, ledger.isEmpty {
                errorPlaceholder(error)
            } else if ledger.isEmpty {
                emptyPlaceholder
            } else {
                ledgerList
            }
        }
        .navigationTitle("Ledger")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: { showDepositSheet = true }) {
                    Label("Deposit", systemImage: "plus.circle")
                }
                .disabled(!settings.isConfigured)
            }
            ToolbarItem(placement: .automatic) {
                Button(action: { Task { await loadData() } }) {
                    Image(systemName: "arrow.clockwise")
                }
                .disabled(isLoading)
            }
        }
        .sheet(isPresented: $showDepositSheet) {
            depositSheet
        }
        .task { await loadData() }
        .onReceive(timer) { _ in
            guard settings.isConfigured else { return }
            Task { await loadData() }
        }
    }

    // MARK: - Ledger List

    // MARK: - Deposit Sheet

    private var depositSheet: some View {
        VStack(spacing: 16) {
            Text("Deposit Capital")
                .font(.system(.headline, design: .monospaced))

            TextField("Amount ($)", text: $depositAmount)
                .font(.system(.body, design: .monospaced))
                .textFieldStyle(.roundedBorder)
                .frame(width: 200)
                #if os(iOS)
                .keyboardType(.decimalPad)
                #endif

            HStack(spacing: 12) {
                Button("Cancel") {
                    depositAmount = ""
                    showDepositSheet = false
                }
                .keyboardShortcut(.cancelAction)

                Button("Deposit") {
                    Task { await submitDeposit() }
                }
                .keyboardShortcut(.defaultAction)
                .disabled(Double(depositAmount) == nil || Double(depositAmount)! <= 0 || isDepositing)
            }

            if isDepositing {
                ProgressView()
                    .controlSize(.small)
            }
        }
        .padding(24)
        .frame(minWidth: 280)
    }

    private func submitDeposit() async {
        guard let amount = Double(depositAmount), amount > 0 else { return }
        isDepositing = true
        do {
            _ = try await client.insertDeposit(amount: amount)
            await MainActor.run {
                depositAmount = ""
                showDepositSheet = false
                isDepositing = false
            }
            await loadData()
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isDepositing = false
            }
        }
    }

    private var ledgerList: some View {
        ScrollView {
            // Balance summary at top
            if let latest = ledger.first {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("CASH BALANCE")
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(.secondary)
                        Text(String(format: "$%.2f", latest.balanceAfter))
                            .font(.system(.title2, design: .monospaced, weight: .bold))
                            .foregroundStyle(.primary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("ENTRIES")
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(.secondary)
                        Text("\(ledger.count)")
                            .font(.system(.body, design: .monospaced, weight: .semibold))
                    }
                }
                .padding()
                .background {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(.ultraThinMaterial)
                }
                .padding(.horizontal)
                .padding(.top, 8)
            }

            LazyVStack(spacing: 6) {
                ForEach(ledger) { entry in
                    HStack(spacing: 10) {
                        Image(systemName: entry.typeIcon)
                            .foregroundStyle(entry.typeColor)
                            .font(.title3)
                            .frame(width: 28)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(entry.type)
                                .font(.system(.caption, design: .monospaced, weight: .bold))
                                .foregroundStyle(entry.typeColor)
                            Text(entry.note)
                                .font(.system(.caption2, design: .monospaced))
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text(String(format: "%+.2f", entry.amount))
                                .font(.system(.body, design: .monospaced, weight: .semibold))
                                .foregroundStyle(entry.isPositive ? .green : .red)
                            Text(String(format: "bal $%.2f", entry.balanceAfter))
                                .font(.system(.caption2, design: .monospaced))
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background {
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(.ultraThinMaterial)
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Placeholders

    private var notConfiguredPlaceholder: some View {
        VStack(spacing: 12) {
            Image(systemName: "book.closed")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text("Configure Turso in Settings to view ledger.")
                .font(.system(.body, design: .monospaced))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }

    private var emptyPlaceholder: some View {
        VStack(spacing: 12) {
            Image(systemName: "book.closed")
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text("No ledger entries yet.")
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
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }

    // MARK: - Data

    private func loadData() async {
        guard settings.isConfigured else { return }
        if ledger.isEmpty { isLoading = true }
        errorMessage = nil
        do {
            let entries = try await client.fetchLedger()
            await MainActor.run {
                ledger = entries
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                isLoading = false
            }
        }
    }
}
