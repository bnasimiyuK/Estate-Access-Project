// ================================
// backend/controllers/dashboardController.js
// ================================

import sql from "mssql";
import dbConfig from "../config/dbConfig.js";

// ------------------------
// Dashboard Summary
// ------------------------
export const getDashboardSummary = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const totalResidentsResult = await pool.request()
      .query("SELECT COUNT(*) AS totalResidents FROM Residents");

    const pendingPaymentsResult = await pool.request()
      .query("SELECT COUNT(*) AS pendingPayments FROM Payments WHERE Status='Pending'");

    const totalPaymentsResult = await pool.request()
      .query("SELECT COUNT(*) AS totalPayments FROM Payments");

    const compliancePct = totalPaymentsResult.recordset[0].totalPayments
      ? Math.round(((totalPaymentsResult.recordset[0].totalPayments - pendingPaymentsResult.recordset[0].pendingPayments) / totalPaymentsResult.recordset[0].totalPayments) * 100)
      : 0;

    const overrideResult = await pool.request()
      .query("SELECT COUNT(*) AS overrideCount FROM gate_overrides");

    const visitorsCheckedinResult = await pool.request()
      .query("SELECT COUNT(*) AS visitorscheckedin FROM Visitors WHERE Status='CheckedIn'");
    const visitorsCheckedoutResult = await pool.request()
      .query("SELECT COUNT(*) AS visitorscheckedout FROM Visitors WHERE Status='CheckedOut'");

    const rejectsResult = await pool.request()
      .query("SELECT COUNT(*) AS rejects FROM MembershipRequests WHERE Status='Rejected'");

    res.json({
      totalResidents: totalResidentsResult.recordset[0].totalResidents,
      pendingPayments: pendingPaymentsResult.recordset[0].pendingPayments,
      compliancePct,
      overrideCount: overrideResult.recordset[0].overrideCount,
      visitorscheckedin: visitorsCheckedinResult.recordset[0].visitorscheckedin,
      visitorscheckedout: visitorsCheckedoutResult.recordset[0].visitorscheckedout,
      rejects: rejectsResult.recordset[0].rejects,
    });
  } catch (err) {
    console.error("❌ Error fetching dashboard summary:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard summary" });
  }
};

// ------------------------
// Access Chart Data
// ------------------------
export const getAccessChart = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    // Last 14 days access attempts
    const result = await pool.request()
      .query(`
        SELECT CONVERT(VARCHAR, TimestampUtc, 23) AS Day, COUNT(*) AS Attempts
        FROM accesslogs
        WHERE TimestampUtc >= DATEADD(DAY, -13, CAST(GETDATE() AS DATE))
        GROUP BY CONVERT(VARCHAR, TimestampUtc, 23)
        ORDER BY Day ASC
      `);

    const labels = result.recordset.map(r => r.Day);
    const data = result.recordset.map(r => r.Attempts);

    res.setHeader("Cache-Control", "no-store"); // prevent 304
    res.json({ labels, data });
  } catch (err) {
    console.error("❌ Error fetching access chart:", err);
    res.status(500).json({ success: false, message: "Failed to fetch access chart" });
  }
};
