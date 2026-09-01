// backend/routes/adminRoutes.js
// Mounted at /api/admins in server.js
//
// Contains:
//  - Dashboard stats:  GET /summary, /gate-stats, /visitor-stats, /export/access-logs
//  - Admin account CRUD: GET /, POST /, PATCH /:id/status, DELETE /:id
//
// >>> ADJUST TABLE/COLUMN NAMES in the CRUD section below if your schema differs. <<<
// Assumed table: dbo.admins (AdminID, FullName, Email, Role, IsActive, PasswordHash, CreatedAt)

import express from "express";
import sql from "mssql";
import { stringify } from "csv-stringify";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/emailService.js";

// ✅ Use the central auth middleware
import {
  verifyToken,  // a.k.a verifyToken
  isAdmin,          // robust admin checker
} from "../middleware/authMiddleware.js";

const router = express.Router();

// =======================================
// 🔐 Protect all admin routes
// =======================================
// First verify token, then ensure admin
router.use(verifyToken);
router.use(isAdmin);

const VALID_ROLES = ["full", "finance", "guard"];

// The frontend speaks in 'full' / 'finance' / 'guard'.
// The Users table speaks in Role='Admin'/'Finance'/'Security' + a numeric RoleID.
// Finance shares RoleID 1 with Admin — they're distinguished only by the
// Role text column, not by RoleID.
const FRONTEND_TO_DB = {
  full: { role: "Admin", roleId: 1 },
  finance: { role: "Finance", roleId: 1 },
  guard: { role: "Security", roleId: 3 },
};
const DB_TO_FRONTEND = {
  Admin: "full",
  Finance: "finance",
  Security: "guard",
};
const ADMIN_DB_ROLES = Object.keys(DB_TO_FRONTEND); // ['Admin','Finance','Security']
const ADMIN_ROLE_LIST = ADMIN_DB_ROLES.map((r) => `'${r}'`).join(", ");

// Human-readable labels for the "add admin" confirmation email.
const roleLabel = {
  full: "Full Admin",
  finance: "Finance Admin",
  guard: "Security Guard",
};

// Base URL of the frontend, used to build the login link in invite emails.
// >>> Once you deploy, set FRONTEND_URL in your .env (e.g.
// https://portal.athihighwayestate.co.ke) and it will always be used.
// Until then, this derives the link from whatever host the admin used to
// reach the API (localhost, a LAN IP, etc.) so the emailed link actually
// works on the recipient's device instead of hardcoding 'localhost'. The
// frontend is assumed to run on port 3000 on that same host. <<<
function getLoginUrl(req) {
  if (process.env.FRONTEND_URL) {
    return `${process.env.FRONTEND_URL}/login.html`;
  }
  return `http://${req.hostname}:3000/login.html`;
}

// Status is a free-text varchar, not a bit/boolean.
// >>> If your DB uses different literal strings (e.g. 'disabled' instead of
// 'Inactive'), change ACTIVE_VALUE / INACTIVE_VALUE here — everything else
// in this file reads from these two constants. <<<
const ACTIVE_VALUE = "Active";
const INACTIVE_VALUE = "Inactive";

function toIsActive(status) {
  return String(status || "").toLowerCase() === ACTIVE_VALUE.toLowerCase();
}

// =======================================
// GET /api/admins
// List all admin accounts
// =======================================
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT UserID, FullName, Email, Role, Status
      FROM Users
      WHERE Role IN (${ADMIN_ROLE_LIST})
      ORDER BY FullName
    `);

    const admins = result.recordset.map((row) => ({
      AdminID: row.UserID,
      FullName: row.FullName,
      Email: row.Email,
      Role: DB_TO_FRONTEND[row.Role] || row.Role,
      IsActive: toIsActive(row.Status),
    }));

    res.json(admins);
  } catch (err) {
    console.error("❌ GET /api/admins error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =======================================
// POST /api/admins
// Add a new admin account
// =======================================
router.post("/", async (req, res) => {
  const { name, email, role, nationalId, phoneNumber } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Name and email are required" });
  }

  const cleanRole = VALID_ROLES.includes(role) ? role : "guard";
  const dbRole = FRONTEND_TO_DB[cleanRole];

  try {
    const pool = await sql.connect();

    // Prevent duplicate emails
    const existing = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT UserID FROM Users WHERE Email = @email");

    if (existing.recordset.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "An admin with that email already exists" });
    }

    // No password field in the "Add admin" form yet, so generate a temporary
    // one the new admin resets on first login, and hash it the same way
    // your login route expects (bcrypt), so they can actually log in.
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // NOTE: Username is likely a required (NOT NULL / possibly UNIQUE) column
    // on Users. Using the email as a stand-in username here — change this if
    // your schema needs something else (e.g. a separate username field on
    // the "Add admin" form).
    const insertResult = await pool
      .request()
      .input("username", sql.VarChar, email)
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("role", sql.VarChar, dbRole.role)
      .input("roleId", sql.Int, dbRole.roleId)
      .input("status", sql.VarChar, ACTIVE_VALUE)
      .input("passwordHash", sql.VarChar, passwordHash)
      .input("nationalId", sql.NVarChar, nationalId || null)
      .input("phoneNumber", sql.VarChar, phoneNumber || null)
      .query(`
        INSERT INTO Users (Username, FullName, Email, Role, RoleID, Status, PasswordHash, NationalID, PhoneNumber, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.UserID
        VALUES (@username, @name, @email, @role, @roleId, @status, @passwordHash, @nationalId, @phoneNumber, GETDATE(), GETDATE())
      `);

    const newId = insertResult.recordset[0].UserID;
    const loginUrl = getLoginUrl(req);

    // Send login credentials by email — don't fail the request if email fails
    try {
      await sendEmail(
        email,
        "Your Athi Estate Admin Account",
        `
          <p>Hi ${name},</p>
          <p>An admin account has been created for you on the Athi Estate Access Management System.</p>
          <p><strong>Role:</strong> ${roleLabel[cleanRole] || cleanRole}</p>
          <p><strong>Login email:</strong> ${email}</p>
          <p><strong>Temporary password:</strong> ${tempPassword}</p>
          <p><a href="${loginUrl}" style="display:inline-block;padding:10px 18px;background:#1a73e8;color:#ffffff;text-decoration:none;border-radius:6px;">Log in to Athi Highway Estate</a></p>
          <p>Or copy this link into your browser: <a href="${loginUrl}">${loginUrl}</a></p>
          <p>Please log in and change your password as soon as possible.</p>
        `
      );
    } catch (emailErr) {
      console.error("⚠️ Admin created but email failed to send:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Admin added",
      adminId: newId,
      // tempPassword removed from the response now that it's emailed instead
    });
  } catch (err) {
    console.error("❌ POST /api/admins error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =======================================
// PATCH /api/admins/:id/status
// Enable / disable an admin account
// =======================================
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  if (typeof active !== "boolean") {
    return res
      .status(400)
      .json({ success: false, message: "'active' must be true or false" });
  }

  const newStatus = active ? ACTIVE_VALUE : INACTIVE_VALUE;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.VarChar, newStatus)
      .query(`
        UPDATE Users
        SET Status = @status, UpdatedAt = GETDATE()
        WHERE UserID = @id AND Role IN (${ADMIN_ROLE_LIST})
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error("❌ PATCH /api/admins/:id/status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =======================================
// DELETE /api/admins/:id
// Remove an admin account
// =======================================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM Users
        WHERE UserID = @id AND Role IN (${ADMIN_ROLE_LIST})
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, message: "Admin deleted" });
  } catch (err) {
    console.error("❌ DELETE /api/admins/:id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =======================================
// GET /api/admins/summary
// =======================================
router.get("/summary", async (req, res) => {
  try {
    const pool = await sql.connect();

    const totalRes = await pool
      .request()
      .query("SELECT COUNT(*) AS total FROM residents");
    const total = totalRes.recordset[0].total || 0;

    const paidRes = await pool
      .request()
      .query(
        "SELECT COUNT(DISTINCT residentId) AS paidCount FROM payments WHERE status = 'paid'"
      );
    const paid = paidRes.recordset[0].paidCount || 0;

    const overridesRes = await pool
      .request()
      .query(`
        SELECT COUNT(*) AS ov FROM gate_overrides 
        WHERE CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE)
      `);
    const overrides = overridesRes.recordset[0].ov || 0;

    const accessRes = await pool
      .request()
      .query(`
        SELECT CAST(timestamp AS DATE) as day, COUNT(*) as attempts
        FROM access_logs
        WHERE timestamp >= DATEADD(DAY, -13, CAST(GETDATE() AS DATE))
        GROUP BY CAST(timestamp AS DATE)
        ORDER BY CAST(timestamp AS DATE)
      `);

    const labels = accessRes.recordset.map((r) =>
      r.day.toISOString().slice(0, 10)
    );
    const counts = accessRes.recordset.map((r) => r.attempts);

    const visitorsRes = await pool
      .request()
      .query(`
        SELECT
          SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
          SUM(CASE WHEN status='used' THEN 1 ELSE 0 END) AS used,
          SUM(CASE WHEN status='expired' THEN 1 ELSE 0 END) AS expired
        FROM visitor_passes
      `);
    const visitors = visitorsRes.recordset[0] || {
      active: 0,
      used: 0,
      expired: 0,
    };

    const compliancePct = total ? Math.round((paid / total) * 100) : 0;

    res.json({
      totalResidents: total,
      paidResidents: paid,
      pendingPayments: Math.max(total - paid, 0),
      compliancePct,
      overrideCount: overrides,
      accessLast14Days: { labels, counts },
      visitors,
    });
  } catch (err) {
    console.error("❌ /api/admins/summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================================
// GET /api/admins/gate-stats?days=14
// =======================================
router.get("/gate-stats", async (req, res) => {
  const days = parseInt(req.query.days || "14", 10);

  try {
    const pool = await sql.connect();
    const accessRes = await pool.request().query(`
      SELECT CAST(timestamp AS DATE) as day, COUNT(*) as attempts,
             SUM(CASE WHEN status='granted' THEN 1 ELSE 0 END) AS granted,
             SUM(CASE WHEN status='denied' THEN 1 ELSE 0 END) AS denied
      FROM access_logs
      WHERE timestamp >= DATEADD(DAY, -${days - 1}, CAST(GETDATE() AS DATE))
      GROUP BY CAST(timestamp AS DATE)
      ORDER BY CAST(timestamp AS DATE)
    `);

    const labels = accessRes.recordset.map((r) =>
      r.day.toISOString().slice(0, 10)
    );
    const attempts = accessRes.recordset.map((r) => r.attempts);

    const recent = await pool
      .request()
      .query(
        "SELECT TOP 30 name, credential, gate, status, timestamp FROM access_logs ORDER BY timestamp DESC"
      );

    res.json({ labels, attempts, recentActivity: recent.recordset });
  } catch (err) {
    console.error("❌ /api/admins/gate-stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================================
// GET /api/admins/visitor-stats
// =======================================
router.get("/visitor-stats", async (req, res) => {
  try {
    const pool = await sql.connect();
    const v = await pool.request().query(`
      SELECT
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS checked_in,
        SUM(CASE WHEN status='used' THEN 1 ELSE 0 END) AS checked_out,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
        COUNT(*) AS total
      FROM visitor_passes
    `);
    res.json({ breakdown: v.recordset[0], overridesToday: 0 });
  } catch (err) {
    console.error("❌ /api/admins/visitor-stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================================
// GET /api/admins/export/access-logs?from=...&to=...
// =======================================
router.get("/export/access-logs", async (req, res) => {
  try {
    const from = req.query.from;
    const to = req.query.to;
    const pool = await sql.connect();

    let q =
      "SELECT timestamp, name, credential, gate, status, reason FROM access_logs";
    if (from || to) {
      q += " WHERE 1=1";
      if (from) q += " AND timestamp >= @from";
      if (to) q += " AND timestamp <= @to";
    }

    const request = pool.request();
    if (from) request.input("from", sql.Date, from);
    if (to) request.input("to", sql.Date, to);

    const result = await request.query(q);
    const rows = result.recordset;

    stringify(rows, { header: true }, (err, output) => {
      if (err) {
        console.error("❌ CSV generation error:", err);
        return res.status(500).send("CSV generation error");
      }
      res.header("Content-Type", "text/csv");
      res.attachment(
        `access-logs-${new Date().toISOString().slice(0, 10)}.csv`
      );
      res.send(output);
    });
  } catch (err) {
    console.error("❌ /api/admins/export/access-logs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;