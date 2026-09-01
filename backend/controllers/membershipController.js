// backend/controllers/membershiprecordsController.js
import sql from "mssql";
import bcrypt from "bcryptjs"; //added line to be tested
import crypto from "crypto"; //added line to be tested
import dotenv from "dotenv";
import { sendEmail } from "../utils/emailService.js";
dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || "Beverly",
  password: process.env.DB_PASSWORD || "Bev@12345678",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "EstateAccessManagementSystem",
  options: { encrypt: false, trustServerCertificate: true },
};

export async function getAllMembershipRecords(req, res) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM MembershipRecords");
    res.json({ records: result.recordset });
  } catch (err) {
    console.error("Failed to fetch membership records:", err);
    res.status(500).json({ message: "Server error fetching records." });
  }
}

export async function syncMembershipRecords(req, res) {
  // implement your sync logic here
  res.json({ message: "Sync completed successfully." });
}

export async function approveMembershipRecord(req, res) {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, id)
      .query("UPDATE MembershipRecords SET Status='Approved' WHERE RequestID=@id");
    res.json({ success: true, message: "Record approved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve record." });
  }
}

export async function rejectMembershipRecord(req, res) {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, id)
      .query("UPDATE MembershipRecords SET Status='Rejected' WHERE RequestID=@id");
    res.json({ success: true, message: "Record rejected." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject record." });
  }
}

export async function deleteMembershipRecord(req, res) {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM MembershipRecords WHERE RequestID=@id");
    res.json({ success: true, message: "Record deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete record." });
  }
}
