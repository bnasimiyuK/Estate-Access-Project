// ==========================================
// backend/routes/accesslogsRoutes.js
// ==========================================
import express from "express";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import { Parser } from "json2csv"; // For CSV export

const router = express.Router();

// ================================
// GET: Fetch all access logs with optional filters
// ================================
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const { userId, action, fromDate, toDate } = req.query;

    let query = `
      SELECT TOP 1000
        Id,
        TimestampUtc,
        UserId,
        Action,
        Resource,
        IpAddress,
        UserAgent
      FROM AccessLogs
      WHERE 1=1
    `;

    if (userId) query += ` AND UserId = ${parseInt(userId)}`;
    if (action) query += ` AND Action LIKE '%${action}%'`;
    if (fromDate) query += ` AND TimestampUtc >= '${fromDate}'`;
    if (toDate) query += ` AND TimestampUtc <= '${toDate}'`;

    query += " ORDER BY TimestampUtc DESC";

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================================
// GET: Download CSV (simple export of top 1000 logs)
// ================================
router.get("/download/csv", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 1000
        Id, TimestampUtc, UserId, Action, Resource, IpAddress, UserAgent
      FROM AccessLogs
      ORDER BY TimestampUtc DESC
    `);

    const fields = ["Id","TimestampUtc","UserId","Action","Resource","IpAddress","UserAgent"];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.recordset);

    res.header("Content-Type", "text/csv");
    res.attachment("access_logs.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ================================
// GET: Export CSV with more fields (Referrer, Metadata)
// ================================
router.get("/export/csv", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 1000
        Id, TimestampUtc, UserId, Action, Resource, IpAddress, UserAgent, Referrer, Metadata
      FROM AccessLogs
      ORDER BY TimestampUtc DESC
    `);

    const parser = new Parser();
    const csv = parser.parse(result.recordset);

    res.header("Content-Type", "text/csv");
    res.attachment("access_logs.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
