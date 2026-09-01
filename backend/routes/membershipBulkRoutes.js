import express from "express";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

const router = express.Router();

// Memory storage only — never write to disk (Vercel's filesystem is read-only
// outside of /tmp, and /tmp is ephemeral anyway).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap, adjust as needed
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// Cache the connection pool across invocations instead of reconnecting
// on every request (important on serverless — avoids exhausting DB connections).
let poolPromise;
function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig).catch((err) => {
      poolPromise = null; // allow retry on next request if this failed
      throw err;
    });
  }
  return poolPromise;
}

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const records = [];
    Readable.from(buffer)
      .pipe(csv())
      .on("data", (row) => records.push(row))
      .on("end", () => resolve(records))
      .on("error", (err) => reject(err));
  });
}

router.post("/bulk", (req, res) => {
  upload.single("file")(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ message: uploadErr.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let records;
    try {
      records = await parseCsvBuffer(req.file.buffer);
    } catch (err) {
      return res.status(400).json({ message: "Failed to parse CSV", error: err.message });
    }

    if (records.length === 0) {
      return res.status(400).json({ message: "CSV file is empty" });
    }

    let pool;
    try {
      pool = await getPool();
    } catch (err) {
      return res.status(500).json({ message: "Database connection failed", error: err.message });
    }

    const errors = [];
    let inserted = 0;

    for (const [index, r] of records.entries()) {
      if (!r.ResidentName || !r.NationalID || !r.PhoneNumber) {
        errors.push({ row: index + 1, reason: "Missing required fields" });
        continue;
      }

      try {
        await pool
          .request()
          .input("ResidentName", sql.VarChar, r.ResidentName)
          .input("NationalID", sql.VarChar, r.NationalID)
          .input("PhoneNumber", sql.VarChar, r.PhoneNumber)
          .input("Email", sql.VarChar, r.Email || null)
          .input("HouseNumber", sql.VarChar, r.HouseNumber || null)
          .input("CourtName", sql.VarChar, r.CourtName || null)
          .input("RoleName", sql.VarChar, r.RoleName || "Resident")
          .input("Action", sql.VarChar, r.Action || null)
          .query(`
            INSERT INTO MembershipRequests
            (ResidentName, NationalID, PhoneNumber, Email, HouseNumber, CourtName, RoleName, Action)
            VALUES
            (@ResidentName, @NationalID, @PhoneNumber, @Email, @HouseNumber, @CourtName, @RoleName, @Action)
          `);

        inserted++;
      } catch (dbErr) {
        errors.push({ row: index + 1, reason: dbErr.message });
      }
    }

    res.json({
      message: "Bulk upload completed",
      inserted,
      failed: errors.length,
      errors,
    });
  });
});

export default router;