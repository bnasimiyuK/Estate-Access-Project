// ================================
// mpesaCallback.js (MERGED & FIXED)
// ================================
import express from "express";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

const router = express.Router();

router.post("/callback", async (req, res) => {
  let pool;

  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return res.sendStatus(200);

    const {
      CheckoutRequestID,
      ResultCode,
      CallbackMetadata
    } = callback;

    pool = await sql.connect(dbConfig);

    // -----------------------
    // PAYMENT FAILED
    // -----------------------
    if (ResultCode !== 0) {
      await pool.request()
        .input("CheckoutRequestID", sql.VarChar(50), CheckoutRequestID)
        .query(`
          UPDATE Payments
          SET Status = 'Failed'
          WHERE CheckoutRequestID = @CheckoutRequestID
        `);

      console.log("❌ Payment failed:", CheckoutRequestID);
      return res.sendStatus(200);
    }

    // -----------------------
    // PAYMENT SUCCESSFUL
    // -----------------------
    const metadata = {};
    (CallbackMetadata?.Item || []).forEach(i => {
      metadata[i.Name] = i.Value;
    });

    const amount = Number(metadata.Amount || 0);
    const receipt = metadata.MpesaReceiptNumber
      ? String(metadata.MpesaReceiptNumber)
      : null;

    const transactionDate = metadata.TransactionDate
      ? String(metadata.TransactionDate)
      : null;

    // 🔥 CRITICAL FIX: always safe string or null
    const phoneNumber =
      metadata.PhoneNumber !== undefined && metadata.PhoneNumber !== null
        ? String(metadata.PhoneNumber)
        : null;

    await pool.request()
      .input("CheckoutRequestID", sql.VarChar(50), CheckoutRequestID)
      .input("Status", sql.VarChar(20), "Paid")
      .input("PhoneNumber", sql.NVarChar(20), phoneNumber) // SAFE
      .input("Amount", sql.Money, amount)
      .input("MpesaReceipt", sql.VarChar(50), receipt)
      .query(`
        UPDATE Payments
        SET
          Status = @Status,
          PhoneNumber = @PhoneNumber,
          Amount = @Amount,
          MpesaReceipt = @MpesaReceipt,
          VerifiedDate = GETDATE()
        WHERE CheckoutRequestID = @CheckoutRequestID
      `);

    console.log("✅ Payment verified:", CheckoutRequestID, receipt);
    res.sendStatus(200);

  } catch (err) {
    console.error("🚨 M-Pesa Callback Error:", err);
    res.sendStatus(200); // IMPORTANT: avoid Safaricom retries
  } finally {
    if (pool) await pool.close();
  }
});

export default router;
