// ==========================================
// backend/routes/membershipRoutes.js
// ==========================================
import express from "express";
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";
import { sendEmail } from "../utils/emailService.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// ==========================================
// 🧠 SYNC FUNCTION
// ==========================================
async function syncMembershipTables() {
  try {
    const pool = await sql.connect(dbConfig);

    // Insert new requests not yet in MembershipRecords
    await pool.request().query(`
      INSERT INTO MembershipRecords (
        RequestID, ResidentName, NationalID, PhoneNumber, Email,
        HouseNumber, CourtName, RoleName, Status, RequestedAt
      )
      SELECT
        r.RequestID, r.ResidentName, r.NationalID, r.PhoneNumber, r.Email,
        r.HouseNumber, r.CourtName, r.RoleName, r.Status, r.RequestedAt
      FROM MembershipRequests r
      WHERE NOT EXISTS (
        SELECT 1 FROM MembershipRecords m WHERE m.RequestID = r.RequestID
      );
    `);

    // Update changed fields
    await pool.request().query(`
      UPDATE m
      SET
        m.ResidentName = r.ResidentName,
        m.NationalID = r.NationalID,
        m.PhoneNumber = r.PhoneNumber,
        m.Email = r.Email,
        m.HouseNumber = r.HouseNumber,
        m.CourtName = r.CourtName,
        m.RoleName = r.RoleName,
        m.Status = r.Status,
        m.RequestedAt = r.RequestedAt
      FROM MembershipRecords m
      INNER JOIN MembershipRequests r ON m.RequestID = r.RequestID;
    `);

    console.log("🔄 Membership tables synced");
  } catch (err) {
    console.error("❌ Sync error:", err);
  }
}

// ==========================================
// 🟩 SUBMIT MEMBERSHIP REQUEST
// ==========================================
router.post("/request", async (req, res) => {
  try {
    const { ResidentName, NationalID, PhoneNumber, Email, HouseNumber, CourtName, Role = "Resident" } = req.body;
    if (!ResidentName || !NationalID || !PhoneNumber || !Email || !HouseNumber || !CourtName)
      return res.status(400).json({ success: false, message: "All fields are required." });

    const pool = await sql.connect(dbConfig);

    // Prevent duplicates
    const existing = await pool.request()
      .input("NationalID", sql.NVarChar, NationalID)
      .query(`SELECT 1 FROM MembershipRequests WHERE NationalID=@NationalID`);

    if (existing.recordset.length)
      return res.status(409).json({ success: false, message: "Duplicate request exists." });

    // Insert request
    const result = await pool.request()
      .input("ResidentName", sql.NVarChar, ResidentName)
      .input("NationalID", sql.NVarChar, NationalID)
      .input("PhoneNumber", sql.NVarChar, PhoneNumber)
      .input("Email", sql.NVarChar, Email)
      .input("HouseNumber", sql.NVarChar, HouseNumber)
      .input("CourtName", sql.NVarChar, CourtName)
      .input("RoleName", sql.NVarChar, Role)
      .input("Status", sql.NVarChar, "Pending")
      .input("RequestedAt", sql.DateTime, new Date())
      .query(`
        INSERT INTO MembershipRequests (
          ResidentName, NationalID, PhoneNumber, Email,
          HouseNumber, CourtName, RoleName, Status, RequestedAt
        )
        VALUES (@ResidentName,@NationalID,@PhoneNumber,@Email,
                @HouseNumber,@CourtName,@RoleName,@Status,@RequestedAt);
        SELECT SCOPE_IDENTITY() AS RequestID;
      `);

    const newRequestID = result.recordset[0].RequestID;

    await syncMembershipTables();

    // Notify applicant
    try {
      await sendEmail(
        Email,
        `${Role} Membership Request Pending Approval`,
        `<p>Hello ${ResidentName},</p><p>Your membership request has been received and is pending approval.</p>`
      );
    } catch (err) {
      console.error(`❌ Failed to send email to user ${Email}:`, err.message);
    }

    // Notify admins
    const admins = await pool.request().query(`SELECT Email FROM Users WHERE LOWER(Role)='admin'`);
    const adminEmails = admins.recordset.map(a => a.Email);
    if (adminEmails.length) {
      try {
        const recipients = adminEmails.join(",");
        await sendEmail(
          recipients,
          "New Membership Request Pending Approval",
          `<p><strong>${ResidentName}</strong> has submitted a membership request.</p><p>Role: ${Role}</p>`
        );
      } catch (err) {
        console.error("❌ Failed to send email to admins:", err.message);
      }
    }

    res.json({ success: true, message: "Request submitted & emails sent", RequestID: newRequestID });
  } catch (err) {
    console.error("❌ Submit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================================
// 🟩 APPROVE REQUEST + CREATE USER + UPDATE RESIDENT
// ==========================================
router.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { approverEmail } = req.body;
    const pool = await sql.connect(dbConfig);

    // Fetch request
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`SELECT * FROM MembershipRequests WHERE RequestID=@id`);

    if (!result.recordset.length) return res.status(404).json({ success: false, message: "Request not found" });

    const userRequest = result.recordset[0];

    // Role-based initial password
    const role = (userRequest.RoleName || "").toLowerCase();
    let tempPassword = "Resident@123";
    if (role === "admin") tempPassword = "Admin123";
    if (role === "security") tempPassword = "Security@123";

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Transaction: Update MembershipRequests, MembershipRecords, Residents, and Users
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const request = new sql.Request(transaction);

      // Update MembershipRequests
      await request.input("id", sql.Int, id)
        .query(`UPDATE MembershipRequests SET Status='Approved' WHERE RequestID=@id`);

      // Update MembershipRecords
      await request.input("id", sql.Int, id)
        .query(`UPDATE MembershipRecords SET Status='Approved' WHERE RequestID=@id`);

      // Insert or update Residents
      const existingResident = await request.input("NationalID", sql.NVarChar, userRequest.NationalID)
        .query(`SELECT * FROM Residents WHERE NationalID=@NationalID`);

      if (existingResident.recordset.length === 0) {
        await request
          .input("ResidentName", sql.NVarChar, userRequest.ResidentName)
          .input("PhoneNumber", sql.NVarChar, userRequest.PhoneNumber)
          .input("Email", sql.NVarChar, userRequest.Email)
          .input("HouseNumber", sql.NVarChar, userRequest.HouseNumber)
          .input("CourtName", sql.NVarChar, userRequest.CourtName)
          .query(`
            INSERT INTO Residents (FullName, NationalID, PhoneNumber, Email, HouseNumber, CourtName, Status, CreatedAt)
            VALUES (@ResidentName, @NationalID, @PhoneNumber, @Email, @HouseNumber, @CourtName, 'Active', GETDATE())
          `);
      } else {
        await request
          .input("ResidentName", sql.NVarChar, userRequest.ResidentName)
          .input("PhoneNumber", sql.NVarChar, userRequest.PhoneNumber)
          .input("Email", sql.NVarChar, userRequest.Email)
          .input("HouseNumber", sql.NVarChar, userRequest.HouseNumber)
          .input("CourtName", sql.NVarChar, userRequest.CourtName)
          .query(`
            UPDATE Residents
            SET FullName=@ResidentName, PhoneNumber=@PhoneNumber, Email=@Email, HouseNumber=@HouseNumber, CourtName=@CourtName
            WHERE NationalID=@NationalID
          `);
      }

      // Insert into Users
      await request
        .input("Username", sql.NVarChar, userRequest.ResidentName)
        .input("PasswordHash", sql.NVarChar, hashedPassword)
        .input("Role", sql.NVarChar, userRequest.RoleName)
        .input("Email", sql.NVarChar, userRequest.Email)
        .input("NationalID", sql.NVarChar, userRequest.NationalID)
        .input("FullName", sql.NVarChar, userRequest.ResidentName)
        .input("PhoneNumber", sql.NVarChar, userRequest.PhoneNumber)
        .input("Status", sql.NVarChar, "Active")
        .query(`
          INSERT INTO Users (Username, PasswordHash, Role, Email, NationalID, FullName, PhoneNumber, Status, CreatedAt)
          VALUES (@Username,@PasswordHash,@Role,@Email,@NationalID,@FullName,@PhoneNumber,@Status,GETDATE())
        `);

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    await syncMembershipTables();

    // Determine dashboard link
    let link = "http://localhost:5500/resident/dashboard.html";
    if (role === "admin") link = "http://localhost:5500/admin/dashboard.html";
    if (role === "security") link = "http://localhost:5500/security/dashboard.html";

    // Email to resident
    try {
      await sendEmail(
        userRequest.Email,
        "Your Account Has Been Approved",
        `<p>Hello ${userRequest.ResidentName},</p>
         <p>Your account has been approved.</p>
         <p><strong>Temporary Password:</strong> ${tempPassword}</p>
         <p>Please <a href="${link}">login here</a> and change your password within 24 hours.</p>`
      );
    } catch (err) {
      console.error("❌ Failed to send approval email to user:", err.message);
    }

    // Email to admins
    try {
      const admins = await pool.request().query("SELECT Email FROM Users WHERE LOWER(Role)='admin'");
      const adminEmails = admins.recordset.map(a => a.Email);
      if (adminEmails.length) {
        const recipients = adminEmails.join(",");
        await sendEmail(
          recipients,
          "Membership Approved",
          `<p>${userRequest.ResidentName} has been approved as a member.</p>
           <p>Role: ${userRequest.RoleName}</p>`
        );
      }
    } catch (err) {
      console.error("❌ Failed to notify admins:", err.message);
    }

    // Email to approver
    if (approverEmail) {
      try {
        await sendEmail(
          approverEmail,
          "Membership Approval Confirmation",
          `<p>You approved ${userRequest.ResidentName}'s account.</p>`
        );
      } catch (err) {
        console.error("❌ Failed to send email to approver:", err.message);
      }
    }

    res.json({ success: true, message: "Request approved & updated in all tables" });
  } catch (err) {
    console.error("❌ Approval error:", err);
    res.status(500).json({ success: false, message: "Approval failed" });
  }
});

// ==========================================
// 🟥 REJECT REQUEST
// ==========================================
router.put("/reject/:id", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().input("id", sql.Int, req.params.id)
      .query(`UPDATE MembershipRequests SET Status='Rejected' WHERE RequestID=@id`);
    await pool.request().input("id", sql.Int, req.params.id)
      .query(`UPDATE MembershipRecords SET Status='Rejected' WHERE RequestID=@id`);
    res.json({ success: true, message: "Request rejected" });
  } catch (err) {
    console.error("❌ Reject error:", err);
    res.status(500).json({ success: false });
  }
});

// ==========================================
// 🗑️ DELETE REQUEST
// ==========================================
router.delete("/delete/:id", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request().input("id", sql.Int, req.params.id)
      .query(`
        DELETE FROM MembershipRequests WHERE RequestID=@id;
        DELETE FROM MembershipRecords WHERE RequestID=@id;
      `);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false });
  }
});

// ==========================================
// ⏱️ AUTO SYNC EVERY 60 SECONDS
// ==========================================
setInterval(syncMembershipTables, 60000);

export default router;
