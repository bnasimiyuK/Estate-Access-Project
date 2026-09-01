// backend/routes/visitorsAccessRoutes.js
import express from "express";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import crypto from "crypto";

const router = express.Router();

// ============================
// GET pending visitors
// ============================
router.get("/pending", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT v.VisitorAccessID, v.ResidentID, v.ResidentName, v.HouseNumber,
             v.VisitorName, v.NationalID, v.PhoneNumber, v.VehicleNumber,
             v.Purpose, v.DateOfVisit, v.Level1Approval, v.Level2Approval,
             v.Level1ApprovedBy, v.Level2ApprovedBy
      FROM VisitorsAccess v
      ORDER BY v.DateOfVisit ASC
    `);
    res.json({ success: true, requests: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================
// Register new visitors
// ============================
router.post("/register", async (req, res) => {
  try {
    const { ResidentID, ResidentName, HouseNumber, CreatedByRole, visitors } = req.body;
    if (!visitors || !visitors.length)
      return res.status(400).json({ success: false, message: "No visitors provided" });

    const pool = await sql.connect(dbConfig);
    const insertPromises = visitors.map(v =>
      pool.request()
        .input("ResidentID", sql.Int, ResidentID)
        .input("ResidentName", sql.NVarChar, ResidentName)
        .input("HouseNumber", sql.NVarChar, HouseNumber)
        .input("VisitorName", sql.NVarChar, v.VisitorName)
        .input("NationalID", sql.NVarChar, v.NationalID)
        .input("PhoneNumber", sql.NVarChar, v.PhoneNumber)
        .input("VehicleNumber", sql.NVarChar, v.VehicleNumber)
        .input("Purpose", sql.NVarChar, v.Purpose)
        .input("DateOfVisit", sql.DateTime, v.DateOfVisit)
        .input("CreatedByRole", sql.NVarChar, CreatedByRole)
        .query(`
          INSERT INTO VisitorsAccess 
          (ResidentID, ResidentName, HouseNumber, VisitorName, NationalID, PhoneNumber, VehicleNumber, Purpose, DateOfVisit, CreatedByRole, Level1Approval, Level2Approval, AllowedVisitorsCount)
          VALUES (@ResidentID, @ResidentName, @HouseNumber, @VisitorName, @NationalID, @PhoneNumber, @VehicleNumber, @Purpose, @DateOfVisit, @CreatedByRole, 'Pending', 'Pending', 1)
        `)
    );

    await Promise.all(insertPromises);
    res.json({ success: true, message: "Visitors registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================
// Approve Level 1
// ============================
router.patch("/approve/level1/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedByID, approvedByName } = req.body;
    const pool = await sql.connect(dbConfig);

    const accessCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char code

    await pool.request()
      .input("VisitorAccessID", sql.Int, id)
      .input("ApprovedByID", sql.Int, approvedByID)
      .input("ApprovedByName", sql.NVarChar, approvedByName)
      .input("AccessCode", sql.NVarChar, accessCode)
      .query(`
        UPDATE VisitorsAccess
        SET Level1Approval = 'Approved', 
            Level1ApprovedBy = @ApprovedByName, 
            Level1ApprovedByID = @ApprovedByID, 
            Level1ApprovedAt = GETDATE(),
            AccessCode = @AccessCode
        WHERE VisitorAccessID = @VisitorAccessID
      `);

    res.json({ success: true, message: "Level 1 approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================
// Approve Level 2
// ============================
router.patch("/approve/level2/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedByID, approvedByName } = req.body;
    const pool = await sql.connect(dbConfig);

    const accessCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char code

    await pool.request()
      .input("VisitorAccessID", sql.Int, id)
      .input("ApprovedByID", sql.Int, approvedByID)
      .input("ApprovedByName", sql.NVarChar, approvedByName)
      .input("AccessCode", sql.NVarChar, accessCode)
      .query(`
        UPDATE VisitorsAccess
        SET Level2Approval = 'Approved', 
            Level2ApprovedBy = @ApprovedByName, 
            Level2ApprovedByID = @ApprovedByID, 
            Level2ApprovedAt = GETDATE(),
            AccessCode = @AccessCode,
            AllowedVisitorsCount = AllowedVisitorsCount + 1
        WHERE VisitorAccessID = @VisitorAccessID
      `);

    res.json({ success: true, message: "Level 2 approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================
// GET approved visitors
// ============================
router.get("/approved", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT VisitorName, ResidentName, HouseNumber, DateOfVisit, AccessCode, AllowedVisitorsCount, Level1ApprovedBy, Level2ApprovedBy
      FROM VisitorsAccess
      WHERE Level1Approval = 'Approved' AND Level2Approval = 'Approved'
      ORDER BY DateOfVisit ASC
    `);
    res.json({ success: true, approved: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
