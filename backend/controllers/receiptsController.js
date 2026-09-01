// receiptsController.js
import express from "express";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import { verifyToken } from "./authRoutes.js"; // JWT middleware

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyToken);

/**
 * GET paginated payments/receipts
 * Admin: sees all payments
 * Resident: sees only their own
 * Query params:
 *   - page (default 1)
 *   - limit (default 5)
 *   - search (optional, PaymentID or date)
 */
router.get("/resident", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // large default so frontend gets all
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const pool = await sql.connect(dbConfig);

    // Base query
    let query = `
      SELECT PaymentID, ResidentID, PaidAmount, MpesaReceipt, PhoneNumber, Status, VerifiedDate
      FROM Payments
    `;

    const request = pool.request();

    // Filter by resident
    if (req.user.role === "resident") {
      query += " WHERE ResidentID = @residentId";
      request.input("residentId", sql.Int, req.user.residentId);
    }

    // Search filter
    if (search) {
      const condition = "PaymentID LIKE @search OR CONVERT(varchar, VerifiedDate, 23) LIKE @search";
      request.input("search", sql.VarChar, `%${search}%`);
      if (req.user.role === "resident") {
        query += ` AND (${condition})`;
      } else {
        query += ` WHERE ${condition}`;
      }
    }

    query += " ORDER BY VerifiedDate DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const result = await request.query(query);

    res.status(200).json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Load payments error:", err);
    res.status(500).json({ message: "Failed to load payments" });
  }
});

/**
 * GET single receipt by PaymentID
 * Admin: any receipt
 * Resident: only their own
 */
router.get("/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const pool = await sql.connect(dbConfig);

    let query = `
      SELECT PaymentID, ResidentID, PaidAmount, MpesaReceipt, PhoneNumber, Status, VerifiedDate
      FROM Payments
      WHERE PaymentID = @paymentId
    `;
    const request = pool.request().input("paymentId", sql.Int, paymentId);

    if (req.user.role === "resident") {
      query += " AND ResidentID = @residentId";
      request.input("residentId", sql.Int, req.user.residentId);
    }

    const result = await request.query(query);

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Receipt fetch error:", err);
    res.status(500).json({ message: "Server error fetching receipt" });
  }
});

/**
 * POST verify payment (Admin only)
 */
router.post("/verify/:paymentId", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const { paymentId } = req.params;
    const pool = await sql.connect(dbConfig);

    // Update payment status
    await pool.request()
      .input("paymentId", sql.Int, paymentId)
      .query(`
        UPDATE Payments
        SET Status='Verified', VerifiedDate=GETDATE()
        WHERE PaymentID=@paymentId
      `);

    // Return updated receipt
    const result = await pool.request()
      .input("paymentId", sql.Int, paymentId)
      .query(`
        SELECT PaymentID, ResidentID, PaidAmount, MpesaReceipt, PhoneNumber, Status, VerifiedDate
        FROM Payments
        WHERE PaymentID=@paymentId
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Payment not found after verification" });
    }

    res.status(200).json({ message: "Payment verified successfully", receipt: result.recordset[0] });
  } catch (err) {
    console.error("❌ Verify payment error:", err);
    res.status(500).json({ message: "Server error while verifying payment" });
  }
});
export async function verifyReceipt(req, res) {
  try {
    // 🔐 ROLE CHECK GOES HERE
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { paymentId } = req.params;

    // continue verification logic...
    // update DB, set VerifiedDate, return receipt

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


export default router;
