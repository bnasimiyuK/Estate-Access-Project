// ✅ admin.js
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ admin.js loaded");

  const role = (localStorage.getItem("role") || "").toLowerCase();
  const roleId = localStorage.getItem("roleId");
  const token = localStorage.getItem("token");

  // 🔒 Ensure user is logged in
  if (!token) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // 🚫 Restrict non-admin access
  if (role !== "admin" && roleId != 1) {
    alert("🚫 Access denied. Admins only.");
    window.location.href = "home.html";
    return;
  }

  console.log("✅ Admin access granted");

  // ✅ Safely load membership records if available
  if (typeof loadMembershipRecords === "function") {
    try {
      await loadMembershipRecords();
    } catch (err) {
      console.error("❌ Error while loading membership records:", err);
    }
  } else {
    console.warn("⚠️ loadMembershipRecords() not found — skipping auto-load.");
  }
});
