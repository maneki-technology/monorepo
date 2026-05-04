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

    func testRealizedPnLQueryIncludesUsdValuedAssetAccounts() {
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
}
