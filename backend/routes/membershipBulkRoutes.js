import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/bulk", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const records = [];
  const errors = [];
  let inserted = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => records.push(row))
    .on("end", async () => {
      try {
        const pool = await sql.connect(dbConfig);

        for (const [index, r] of records.entries()) {
          // basic validation
          if (!r.ResidentName || !r.NationalID || !r.PhoneNumber) {
            errors.push({ row: index + 1, reason: "Missing required fields" });
            continue;
          }

          try {
            await pool.request()
              .input("ResidentName", sql.VarChar, r.ResidentName)
              .input("NationalID", sql.VarChar, r.NationalID)
              .input("PhoneNumber", sql.VarChar, r.PhoneNumber)
              .input("Email", sql.VarChar, r.Email)
              .input("HouseNumber", sql.VarChar, r.HouseNumber)
              .input("CourtName", sql.VarChar, r.CourtName)
              .input("RoleName", sql.VarChar, r.RoleName || "Resident")
              .input("Action", sql.VarChar, r.Action)
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

        fs.unlinkSync(req.file.path);

        res.json({
          message: "Bulk upload completed",
          inserted,
          failed: errors.length,
          errors
        });

      } catch (err) {
        res.status(500).json({ message: "Bulk upload failed", error: err.message });
      }
    });
});

export default router;
