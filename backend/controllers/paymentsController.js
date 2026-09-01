import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import { initiateStkPush } from "../utils/mpesa.js";

// Helper function to safely extract and normalize role and resident ID
const getUserAuthContext = (req) => {
  const user = req.user || {};
  const rawRole = user.role || user.Role || "";
  const normalizedRole = String(rawRole).trim().toLowerCase();

  const canViewAll = normalizedRole === "admin" || normalizedRole === "security";

  // Fallback to userId if ResidentID is missing in the payload
  const tokenResidentID = user.ResidentID || user.residentId || user.userId || user.UserID || null;

  return { normalizedRole, canViewAll, tokenResidentID };
};

// ------------------------
// Get all payments (Admin & Security: all/any, Resident: own only)
export async function getPayments(req, res) {
  const { canViewAll, tokenResidentID } = getUserAuthContext(req);

  // If viewing restricted and no resident identifier can be determined
  const ResidentID = canViewAll ? req.query.ResidentID : tokenResidentID;

  if (!canViewAll && !ResidentID) {
    return res.status(403).json({ message: "Access denied. Resident profile missing." });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    let query = "SELECT * FROM Payments";
    if (ResidentID) {
      query += " WHERE ResidentID = @ResidentID";
      request.input("ResidentID", sql.Int, ResidentID);
    }
    query += " ORDER BY PaymentDate DESC";

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Get Payments Error:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
}

// ------------------------
// Get verified payments (Admin & Security: all/any, Resident: own only)
export async function getVerifiedPayments(req, res) {
  const { canViewAll, tokenResidentID } = getUserAuthContext(req);

  const ResidentID = canViewAll ? req.query.ResidentID : tokenResidentID;

  if (!canViewAll && !ResidentID) {
    return res.status(403).json({ message: "Access denied. Resident profile missing." });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    let query = "SELECT * FROM Payments WHERE Status = 'Verified'";
    if (ResidentID) {
      query += " AND ResidentID = @ResidentID";
      request.input("ResidentID", sql.Int, ResidentID);
    }
    query += " ORDER BY VerifiedDate DESC";

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Get Verified Payments Error:", err);
    res.status(500).json({ message: "Failed to fetch verified payments" });
  }
}

// ------------------------
// Get balances (Admin & Security: all/any, Resident: own only)
export async function getBalances(req, res) {
  const { canViewAll, tokenResidentID } = getUserAuthContext(req);

  const ResidentID = canViewAll ? req.query.ResidentID : tokenResidentID;

  if (!canViewAll && !ResidentID) {
    return res.status(403).json({ message: "Access denied. Resident profile missing." });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    let query = `
      SELECT 
        r.ResidentID,
        SUM(p.Amount) AS TotalPaid,
        r.TotalDue,
        (r.TotalDue - SUM(p.Amount)) AS Balance
      FROM Payments p
      JOIN Residents r ON p.ResidentID = r.ResidentID
    `;
    if (ResidentID) {
      query += " WHERE r.ResidentID = @ResidentID";
      request.input("ResidentID", sql.Int, ResidentID);
    }
    query += " GROUP BY r.ResidentID, r.TotalDue";

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Get Balances Error:", err);
    res.status(500).json({ message: "Failed to fetch balances" });
  }
}

// ------------------------
// Make payment (manual / cash / bank)
export async function makePayment(req, res) {
  const { normalizedRole, tokenResidentID } = getUserAuthContext(req);
  const isAdmin = normalizedRole === "admin";

  const { amount, method, reference } = req.body;
  const residentId = isAdmin ? req.body.residentId : tokenResidentID;

  if (!residentId) {
    return res.status(403).json({ message: "Access denied. Valid resident ID required." });
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("ResidentID", sql.Int, residentId)
      .input("Amount", sql.Money, amount)
      .input("PaymentMethod", sql.VarChar, method)
      .input("Reference", sql.VarChar, reference)
      .input("Status", sql.VarChar, "Pending")
      .query(`
        INSERT INTO Payments 
        (ResidentID, Amount, PaymentMethod, Reference, Status, PaymentDate)
        VALUES 
        (@ResidentID, @Amount, @PaymentMethod, @Reference, @Status, GETDATE())
      `);

    res.json({ success: true, message: "Payment recorded" });
  } catch (err) {
    console.error("Make Payment Error:", err);
    res.status(500).json({ message: "Failed to record payment" });
  }
}

// ------------------------
// Verify payment (admin only)
export async function verifyPayment(req, res) {
  const paymentId = req.params.id;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("PaymentID", sql.Int, paymentId)
      .query(`
        UPDATE Payments
        SET Status='Verified', VerifiedDate=GETDATE()
        WHERE PaymentID=@PaymentID
      `);

    res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ message: "Failed to verify payment" });
  }
}

// ------------------------
// M-PESA STK Push Payment
export async function mpesaPayment(req, res) {
  const { normalizedRole, tokenResidentID } = getUserAuthContext(req);
  const isAdmin = normalizedRole === "admin";

  const { phoneNumber, amount } = req.body;
  const residentId = isAdmin ? req.body.residentId : tokenResidentID;

  if (!residentId) {
    return res.status(403).json({ message: "Access denied. Valid resident ID required." });
  }

  try {
    const stkResponse = await initiateStkPush(
      phoneNumber,
      amount,
      residentId
    );

    if (stkResponse.ResponseCode === "0") {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input("ResidentID", sql.Int, residentId)
        .input("Amount", sql.Money, amount)
        .input("PaymentMethod", sql.VarChar, "Mpesa")
        .input("Reference", sql.VarChar, stkResponse.CheckoutRequestID)
        .input("Status", sql.VarChar, "Pending")
        .query(`
          INSERT INTO Payments
          (ResidentID, Amount, PaymentMethod, Reference, Status, PaymentDate, CheckoutRequestID)
          VALUES
          (@ResidentID, @Amount, @PaymentMethod, @Reference, @Status, GETDATE(), @Reference)
        `);

      return res.json({
        success: true,
        message: "STK Push sent successfully",
        checkoutRequestId: stkResponse.CheckoutRequestID
      });
    }

    if (stkResponse.errorCode === "500.003.02") {
      return res.status(202).json({
        success: false,
        retry: true,
        message: "M-Pesa system busy. Please try again in a moment."
      });
    }

    return res.status(400).json({
      success: false,
      message: stkResponse.errorMessage || "STK Push failed"
    });

  } catch (err) {
    console.error("M-PESA STK Error:", err);
    res.status(500).json({
      success: false,
      message: "M-PESA payment failed",
      error: err.message
    });
  }
}