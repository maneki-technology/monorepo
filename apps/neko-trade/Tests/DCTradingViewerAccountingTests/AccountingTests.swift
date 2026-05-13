import XCTest
@testable import Neko_Trade

final class AccountingTests: XCTestCase {
    func testCashEffectUsesTransferAccounts() {
        let deposit = transfer(debitAccountId: Transfer.cashAccountId, creditAccountId: 4, amount: 1000, code: 1)
        let buy = transfer(debitAccountId: Transfer.btcAccountId, creditAccountId: Transfer.cashAccountId, amount: 250, code: 2)
        let cashFee = transfer(debitAccountId: 3, creditAccountId: Transfer.cashAccountId, amount: 0.25, code: 4)
        let bnbFee = transfer(debitAccountId: 3, creditAccountId: Transfer.bnbAccountId, amount: 0.00123, code: 4)
        let btcFee = transfer(debitAccountId: 3, creditAccountId: Transfer.btcAccountId, amount: 0.0000025, code: 4)

        XCTAssertEqual(deposit.cashEffect, 1000)
        XCTAssertEqual(buy.cashEffect, -250)
        XCTAssertEqual(cashFee.cashEffect, -0.25)
        XCTAssertEqual(bnbFee.cashEffect, 0)
        XCTAssertEqual(btcFee.cashEffect, 0)
    }

    func testRealizedPnLQueryIncludesQuoteValuedAssetAccounts() {
        let sql = TursoClient.totalRealizedPnLSQL

        XCTAssertTrue(sql.contains("WHERE id = 1"))
        XCTAssertTrue(sql.contains("WHERE id = 2"))
        XCTAssertTrue(sql.contains("WHERE id = 6"))
        XCTAssertTrue(sql.contains("WHERE code = 1 AND status = 'posted'"))
    }

    func testManagedBalancesQueryUsesNativeTransferSizes() {
        let sql = TursoClient.managedBalancesSQL

        XCTAssertTrue(sql.contains("debit_account_id = 2 THEN size"))
        XCTAssertTrue(sql.contains("credit_account_id = 2 THEN -size"))
        XCTAssertTrue(sql.contains("debit_account_id = 6 THEN size"))
        XCTAssertTrue(sql.contains("credit_account_id = 6 THEN -size"))
        XCTAssertTrue(sql.contains("WHERE status = 'posted'"))
    }

    func testBnbAllocationStatementsRecordNativeSizeAndQuoteValue() {
        let statements = TursoClient.bnbAllocationStatements(quantity: 0.05, price: 700, timestamp: 123)

        XCTAssertEqual(statements.first, "BEGIN")
        XCTAssertTrue(statements[1].contains("debit_account_id, credit_account_id, amount"))
        XCTAssertTrue(statements[1].contains("VALUES (6, 4, 35.0, 1, 0, 'posted', 'BNB allocation', 700.0, 0.05, 123.0)"))
        XCTAssertTrue(statements[2].contains("credits_posted = credits_posted + 35.0 WHERE id = 6"))
        XCTAssertTrue(statements[3].contains("debits_posted = debits_posted + 35.0 WHERE id = 4"))
        XCTAssertEqual(statements.last, "COMMIT")
    }

    func testCashDepositStatementsDoNotAffectNativeSize() {
        let statements = TursoClient.depositStatements(amount: 1000, timestamp: 123)

        XCTAssertTrue(statements[1].contains("VALUES (1, 4, 1000.0, 1, 0, 'posted', 0, 0, 123.0)"))
        XCTAssertTrue(statements[2].contains("credits_posted = credits_posted + 1000.0 WHERE id = 1"))
        XCTAssertTrue(statements[3].contains("debits_posted = debits_posted + 1000.0 WHERE id = 4"))
    }

    func testBotStatusSymbolMetadataFallsBackForOlderDatabases() {
        let status = botStatus(tradingSymbol: "", baseAsset: "", quoteAsset: "", markSymbol: "")
        let symbol = status.symbolMetadata

        XCTAssertEqual(symbol.tradingSymbol, "BTC/USD")
        XCTAssertEqual(symbol.baseAsset, "BTC")
        XCTAssertEqual(symbol.quoteAsset, "USD")
        XCTAssertEqual(symbol.markSymbol, "BTCUSDT")
        XCTAssertEqual(symbol.priceLabel, "BTC/USD")
    }

    func testBotStatusSymbolMetadataSupportsUsdtQuote() {
        let status = botStatus(
            tradingSymbol: "BTC/USDT",
            baseAsset: "BTC",
            quoteAsset: "USDT",
            markSymbol: "BTCUSDT"
        )
        let symbol = status.symbolMetadata

        XCTAssertEqual(symbol.tradingSymbol, "BTC/USDT")
        XCTAssertEqual(symbol.quoteAsset, "USDT")
        XCTAssertEqual(symbol.markSymbol, "BTCUSDT")
        XCTAssertEqual(symbol.priceLabel, "BTC/USDT")
        XCTAssertEqual(symbol.bnbMarkSymbol, "BNBUSDT")
    }

    func testAlpacaPositionSymbolNormalization() {
        XCTAssertEqual(AlpacaClient.normalizePositionSymbol("BTC/USD"), "BTCUSD")
        XCTAssertEqual(AlpacaClient.normalizePositionSymbol(" btc/usdt "), "BTCUSDT")
    }

    private func transfer(debitAccountId: Int, creditAccountId: Int, amount: Double, code: Int) -> Transfer {
        Transfer(
            id: 1,
            debitAccountId: debitAccountId,
            creditAccountId: creditAccountId,
            amount: amount,
            pendingId: nil,
            code: code,
            flags: 0,
            status: "posted",
            userData: nil,
            price: 0,
            size: 0,
            timestamp: "0",
            createdAt: ""
        )
    }

    private func botStatus(
        tradingSymbol: String,
        baseAsset: String,
        quoteAsset: String,
        markSymbol: String
    ) -> BotStatus {
        BotStatus(
            status: "RUNNING",
            lastTick: Date().timeIntervalSince1970,
            tickCount: 1,
            regime: "BULL",
            inPosition: 0,
            entryPrice: 0,
            equity: 0,
            capital: 0,
            unrealized: 0,
            price: 0,
            uptimeStart: Date().timeIntervalSince1970,
            version: "test",
            updatedAt: "",
            tradingSymbol: tradingSymbol,
            baseAsset: baseAsset,
            quoteAsset: quoteAsset,
            markSymbol: markSymbol,
            checkpointHealth: "OK",
            checkpointError: "",
            exchangeHealth: "OK",
            exchangeError: "",
            resourceHealth: "OK",
            resourceError: "",
            resourceRssMb: 0,
            resourceDiskFreeMb: 0,
            resourceDiskUsedPct: 0,
            resourceFeedGapSec: 0,
            resourceWsLagSec: 0,
            resourceHttpErrors: 0,
            resourceHttpMaxMs: 0
        )
    }
}
