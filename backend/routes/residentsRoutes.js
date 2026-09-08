import express from "express";
import sql from "mssql";
import bcrypt from "bcryptjs";
import dbConfig from "../config/dbConfig.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ==========================================
// ✅ GET ALL RESIDENTS (API: /api/residents/all)
// ==========================================
router.get("/all", verifyToken, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        ResidentID, UserID, ResidentName, NationalID, PhoneNumber, Email, 
        HouseNumber, CourtName, Occupation, DateJoined, Status, RoleName
      FROM Residents
      ORDER BY ResidentID DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching residents:", err);
    res.status(500).json({ message: "Failed to fetch residents" });
  }
});

// ==========================================
// ✅ GET SINGLE RESIDENT BY ID (API: /api/residents/:id)
// Fixes the 404 Not Found error on modal open
// ==========================================
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("ResidentID", sql.Int, id)
      .query(`
        SELECT * 
        FROM Residents 
        WHERE ResidentID = @ResidentID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Resident not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(`❌ Error fetching resident ID ${id}:`, err);
    res.status(500).json({ message: "Error fetching resident details" });
  }
});

// ==========================================
// ✅ PUT UPDATE RESIDENT (API: /api/residents/:id)
// Handles saving profile changes from the modal
// ==========================================
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    ResidentName,
    NationalID,
    HouseNumber,
    CourtName,
    ResidencyType,
    Status,
    PhoneNumber,
    AlternatePhone,
    Email,
    Occupation,
    EmergencyContactName,
    EmergencyContactPhone,
    EmergencyContactRelationship,
    NextOfKin,
    DomesticStaffCount,
    Pets,
    MoveInDate,
    AccessCardNumber,
    Notes,
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("ResidentID", sql.Int, id)
      .input("ResidentName", sql.NVarChar, ResidentName || null)
      .input("NationalID", sql.NVarChar, NationalID || null)
      .input("HouseNumber", sql.NVarChar, HouseNumber || null)
      .input("CourtName", sql.NVarChar, CourtName || null)
      .input("ResidencyType", sql.NVarChar, ResidencyType || null)
      .input("Status", sql.NVarChar, Status || null)
      .input("PhoneNumber", sql.NVarChar, PhoneNumber || null)
      .input("AlternatePhone", sql.NVarChar, AlternatePhone || null)
      .input("Email", sql.NVarChar, Email || null)
      .input("Occupation", sql.NVarChar, Occupation || null)
      .input("EmergencyContactName", sql.NVarChar, EmergencyContactName || null)
      .input("EmergencyContactPhone", sql.NVarChar, EmergencyContactPhone || null)
      .input("EmergencyContactRelationship", sql.NVarChar, EmergencyContactRelationship || null)
      .input("NextOfKin", sql.NVarChar, NextOfKin || null)
      .input("DomesticStaffCount", sql.Int, DomesticStaffCount ? parseInt(DomesticStaffCount) : 0)
      .input("Pets", sql.NVarChar, Pets || null)
      .input("MoveInDate", sql.Date, MoveInDate || null)
      .input("AccessCardNumber", sql.NVarChar, AccessCardNumber || null)
      .input("Notes", sql.NVarChar, Notes || null)
      .query(`
        UPDATE Residents
        SET 
          ResidentName = ISNULL(@ResidentName, ResidentName),
          NationalID = ISNULL(@NationalID, NationalID),
          HouseNumber = ISNULL(@HouseNumber, HouseNumber),
          CourtName = ISNULL(@CourtName, CourtName),
          ResidencyType = ISNULL(@ResidencyType, ResidencyType),
          Status = ISNULL(@Status, Status),
          PhoneNumber = ISNULL(@PhoneNumber, PhoneNumber),
          AlternatePhone = ISNULL(@AlternatePhone, AlternatePhone),
          Email = ISNULL(@Email, Email),
          Occupation = ISNULL(@Occupation, Occupation),
          EmergencyContactName = ISNULL(@EmergencyContactName, EmergencyContactName),
          EmergencyContactPhone = ISNULL(@EmergencyContactPhone, EmergencyContactPhone),
          EmergencyContactRelationship = ISNULL(@EmergencyContactRelationship, EmergencyContactRelationship),
          NextOfKin = ISNULL(@NextOfKin, NextOfKin),
          DomesticStaffCount = ISNULL(@DomesticStaffCount, DomesticStaffCount),
          Pets = ISNULL(@Pets, Pets),
          MoveInDate = ISNULL(@MoveInDate, MoveInDate),
          AccessCardNumber = ISNULL(@AccessCardNumber, AccessCardNumber),
          Notes = ISNULL(@Notes, Notes)
        WHERE ResidentID = @ResidentID
      `);

    res.json({ success: true, message: "Resident profile updated successfully!" });
  } catch (err) {
    console.error(`❌ Error updating resident ID ${id}:`, err);
    res.status(500).json({ message: "Failed to update resident profile" });
  }
});

// ==========================================
// ✅ POST /sync
// ==========================================
router.post("/sync", verifyToken, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const syncResidentsQuery = `
      INSERT INTO Residents (
        UserID, ResidentName, NationalID, HouseNumber, Occupation, 
        DateJoined, Status, PhoneNumber, Email, CourtName, RoleName
      )
      SELECT 
        NULL AS UserID,
        m.ResidentName,
        m.NationalID,
        m.HouseNumber,
        'N/A' AS Occupation,
        GETDATE() AS DateJoined,
        'Approved' AS Status,
        m.PhoneNumber,
        m.Email,
        m.CourtName,
        m.RoleName
      FROM MembershipRequests m
      WHERE m.Status = 'Approved'
        AND NOT EXISTS (
          SELECT 1 FROM Residents rs WHERE rs.NationalID = m.NationalID
        )
    `;

    const residentsResult = await pool.request().query(syncResidentsQuery);

    const defaultPassword = "defaultpassword";
    const defaultHash = bcrypt.hashSync(defaultPassword, 10);
    const syncUsersQuery = `
      INSERT INTO Users (
        Username, PasswordHash, RoleID, Status, Email, NationalID, FullName, PhoneNumber
      )
      SELECT 
        r.Email, @DefaultPasswordHash, ro.RoleID, 'Active', r.Email, r.NationalID, r.ResidentName, r.PhoneNumber
      FROM Residents r
      JOIN Roles ro ON ro.RoleName = r.RoleName
      WHERE r.Status = 'Approved'
        AND NOT EXISTS (
          SELECT 1 FROM Users u WHERE u.Email = r.Email
        )
    `;

    const usersResult = await pool
      .request()
      .input("DefaultPasswordHash", sql.VarChar, defaultHash)
      .query(syncUsersQuery);

    res.json({
      success: true,
      message: "Residents synced successfully to both Residents and Users tables",
      residentsAdded: residentsResult.rowsAffected[0],
      usersAdded: usersResult.rowsAffected[0],
    });
  } catch (err) {
    console.error("❌ Sync error:", err);
    res.status(500).json({ success: false, message: "Failed to sync residents", error: err.message });
  }
});

export default router;