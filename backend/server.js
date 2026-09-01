// ================================
// backend/server.js
// Main API: Auth + Membership + Residents + Payments + Visitors + Courts
// ================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "mssql";
import bcrypt from "bcryptjs";
import fs from "fs";


// ================================
// ROUTE IMPORTS
// ================================
import refreshTokenRoute from "./routes/refreshToken.js";
import authRoutes, { verifyToken } from "./routes/authRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import membershiprecordsRoutes from "./routes/membershiprecordsRoutes.js";
import residentsRoutes from "./routes/residentsRoutes.js";
import visitorsaccessRoutes from "./routes/visitorsaccessRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import verifiedPaymentsRoutes from "./routes/verifiedPaymentsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import accesslogsRoutes from "./routes/accesslogsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dbConfig from "./config/dbConfig.js";
import {
  syncMembershipRecords,
  getAllMembershipRecords,
  approveMembershipRecord,
  rejectMembershipRecord,
  deleteMembershipRecord
} from "./controllers/membershiprecordsController.js";
import { sendEmail } from "./utils/emailService.js";
import membershipBulkRoutes from "./routes/membershipBulkRoutes.js";
import mpesaCallback from "./routes/mpesaCallback.js";
import receiptsRoutes from "./routes/receiptsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import hardwareRoutes from "./routes/hardwareRoutes.js";

// APP & CONFIG
// ================================
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: "*", // Adjust to "http://localhost:3000" if restricting origins
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ================================
// SQL CONFIGURATION
// ================================

// ================================
// ONE-TIME PASSWORD HASH SETUP
// ================================
const HASH_FLAG_FILE = "./passwords_hashed.flag";
async function hashPasswordsOnce() {
  if (fs.existsSync(HASH_FLAG_FILE)) return;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT UserID, PasswordHash FROM Users");
    for (const user of result.recordset) {
      if (user.PasswordHash && !user.PasswordHash.startsWith("$2a$")) {
        const hashed = await bcrypt.hash(user.PasswordHash, 10);
        await pool.request()
          .input("UserID", sql.Int, user.UserID)
          .input("HashedPassword", sql.VarChar, hashed)
          .query("UPDATE Users SET PasswordHash=@HashedPassword WHERE UserID=@UserID");
      }
    }
    fs.writeFileSync(HASH_FLAG_FILE, "hashed=true");
    console.log("Passwords hashed successfully!");
  } catch (err) {
    console.error("Error hashing passwords:", err);
  }
}
hashPasswordsOnce();

// ================================
// ROUTES
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/membershiprecords", membershiprecordsRoutes);
app.use("/api/residents", residentsRoutes);
app.use("/api/visitorsaccess", visitorsaccessRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/verifiedpayments", verifiedPaymentsRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/accesslogs", accesslogsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/membership", membershipBulkRoutes);
app.use("/api/mpesa", mpesaCallback);
app.use("/api/receipts", receiptsRoutes);
app.use("/api/settings", settingsRoutes);
app.use(
    "/api/hardware",
    hardwareRoutes
);

// ================================
// COURTS ENDPOINT
// ================================
app.get("/api/courts/all", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT CourtID, CourtName FROM Courts ORDER BY CourtName ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching courts:", err);
    res.status(500).json({ success: false, message: "Failed to fetch courts" });
  }
});

// ================================
// PROTECTED ROUTE EXAMPLE
// ================================
app.get("/api/secure", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

// Default route
app.get("/", (req, res) => {
  res.send("Athi Estate Access Management API running...");
});

// ================================
// RESIDENTS COUNT ROUTE
// ================================
app.get("/api/residents/count", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT COUNT(*) AS totalResidents FROM Residents");
    res.json({ success: true, totalResidents: result.recordset[0].totalResidents });
  } catch (error) {
    console.error("Error fetching residents count:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ================================
// MEMBERSHIP REQUEST CRUD + AUTO SYNC
// (Keep all your existing membership routes here)
// ================================
// --- POST /api/membership/request
// --- GET /api/membership/all
// --- PUT /api/membership/approve/:id
// --- PUT /api/membership/reject/:id
// --- DELETE /api/membership/delete/:id
// Use the same logic as in your original code.

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 4050;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await sql.connect(dbConfig);
    console.log("SQL Server connection successful.");
  } catch (err) {
    console.error("SQL Server connection failed:", err);
  }
});
app.get("/api/test-email", async (req, res) => {
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      "Test Email from Estate Access System",
      "<p>If you receive this, email is working!</p>"
    );
    res.json({ success: true, message: "Test email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
export default app;