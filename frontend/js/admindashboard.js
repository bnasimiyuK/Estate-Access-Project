// ================================
// admindashboard.js
// ================================

import { apiFetch } from "./auth.js"; // ⬅ Ensure this file exists and is imported correctly

document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Admin Dashboard Loaded");

  // -------------------------------
  // 1️⃣ Get token and role info
  // -------------------------------
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const roleId = localStorage.getItem("roleId");

  if (!accessToken) {
    alert("Authentication token missing. Please log in.");
    window.location.href = "login.html";
    return;
  }

  // -------------------------------
  // 2️⃣ Safe DOM update helper
  // -------------------------------
  const safeSetText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  // -------------------------------
  // 3️⃣ Fetch resident count
  // -------------------------------
  const fetchResidentCount = async () => {
    try {
      const data = await apiFetch("http://localhost:4050/api/residents/count");

      safeSetText("totalResidents", data.totalResidents || 0);
    } catch (err) {
      console.error("❌ Failed to fetch resident count:", err);
      safeSetText("totalResidents", "Error");
    }
  };

  // -------------------------------
  // 4️⃣ Fetch pending memberships
  // -------------------------------
  const fetchPendingMemberships = async () => {
    try {
      const data = await apiFetch("http://localhost:4050/api/membership/pending");

      safeSetText("pendingMemberships", data.length || 0);
    } catch (err) {
      console.error("❌ Failed to fetch memberships:", err);
      safeSetText("pendingMemberships", "Error");
    }
  };

  // -------------------------------
  // 5️⃣ Fetch verified payments
  // -------------------------------
  const fetchVerifiedPayments = async () => {
    try {
      const data = await apiFetch("http://localhost:4050/api/payments/verified");

      safeSetText("verifiedPayments", data.length || 0);
    } catch (err) {
      console.error("❌ Failed to fetch payments:", err);
      safeSetText("verifiedPayments", "Error");
    }
  };

  // -------------------------------
  // 6️⃣ Load dashboard stats
  // -------------------------------
  const loadDashboardStats = async () => {
    await Promise.all([
      fetchResidentCount(),
      fetchPendingMemberships(),
      fetchVerifiedPayments(),
    ]);
  };

  // -------------------------------
  // 7️⃣ Initialize dashboard
  // -------------------------------
  loadDashboardStats();
});
