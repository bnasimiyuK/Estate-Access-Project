// backend/controllers/adminController.js
import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

// ✅ Get all membership requests
export const getAllMemberships = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT RequestID, FullName, NationalID, Phone, Email, HouseNumber, Court, Status, CreatedAt
      FROM MembershipRequests
      ORDER BY CreatedAt DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error fetching memberships:", error);
    res.status(500).json({ message: "Server error fetching memberships" });
  }
};

// ✅ Approve a membership
export const approveResident = async (req, res) => {
  try {
    const { requestId } = req.body;
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("RequestID", sql.Int, requestId)
      .query(`UPDATE MembershipRequests SET Status = 'Approved' WHERE RequestID = @RequestID`);

    res.json({ message: "Membership approved ✅" });
  } catch (error) {
    console.error("❌ Error approving membership:", error);
    res.status(500).json({ message: "Server error approving membership" });
  }
};
