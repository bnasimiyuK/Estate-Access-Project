import express from "express";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import { verifyToken } from "./authRoutes.js"; // JWT middleware

const router = express.Router();

// Apply JWT verification
router.use(verifyToken);

/**
 * GET all payments/receipts (paginated, searchable)
 * Admin: sees all
 * Resident: sees only their own
 * Query params:
 *  - page (default 1)
 *  - limit (default 5)
 *  - search (optional, PaymentID or VerifiedDate)
 */
router.get("/resident", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search ? req.query.search.trim() : "";
    const offset = (page - 1) * limit;

    const pool = await sql.connect(dbConfig);
    const conditions = [];
    const request = pool.request();

    // Resident filter
    if (req.user.role === "resident") {
      conditions.push("ResidentID = @residentId");
      request.input("residentId", sql.Int, req.user.residentId);
    }

    // Search filter
    if (search) {
      conditions.push("(CAST(PaymentID AS VARCHAR) LIKE @search OR CONVERT(varchar, VerifiedDate, 23) LIKE @search)");
      request.input("search", sql.VarChar, `%${search}%`);
    }

    // Build WHERE clause
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total records
    const countResult = await pool.request()
      .input("residentId", sql.Int, req.user.residentId)
      .input("search", sql.VarChar, `%${search}%`)
      .query(`SELECT COUNT(*) AS total FROM Payments ${whereClause}`);
    const totalRecords = countResult.recordset[0].total;

    // Fetch paginated records
    const dataQuery = `
      SELECT PaymentID, ResidentID, PaidAmount, MpesaReceipt, PhoneNumber, Status, VerifiedDate
      FROM Payments
      ${whereClause}
      ORDER BY VerifiedDate DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const dataResult = await request.query(dataQuery);

    res.status(200).json({
      data: dataResult.recordset,
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords
    });
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

    const conditions = ["PaymentID = @paymentId"];
    const request = pool.request().input("paymentId", sql.Int, paymentId);

    if (req.user.role === "resident") {
      conditions.push("ResidentID = @residentId");
      request.input("residentId", sql.Int, req.user.residentId);
    }

    const query = `
      SELECT PaymentID, ResidentID, PaidAmount, MpesaReceipt, PhoneNumber, Status, VerifiedDate
      FROM Payments
      WHERE ${conditions.join(" AND ")}
    `;

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

    await pool.request()
      .input("paymentId", sql.Int, paymentId)
      .query(`
        UPDATE Payments
        SET Status='Verified', VerifiedDate=GETDATE()
        WHERE PaymentID=@paymentId
      `);

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

export default router;
