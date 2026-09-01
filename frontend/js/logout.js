// ✅ logout.js — unified version
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ logout.js loaded");

  const logoutBtn = document.getElementById("logoutBtn");
  const adminLink = document.getElementById("adminPortalLink") || document.querySelector('a[href="admin.html"]');
  const updateProfileLink = document.getElementById("updateProfileLink");
  const userNameDisplay = document.getElementById("userName");

  // 🔹 Get user data
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || localStorage.getItem("role");
  const userName = user?.name || localStorage.getItem("name");
  const userStatus = user?.status || localStorage.getItem("status");

  console.log("👤 Logged in as:", userName || "Guest", "| Role:", userRole || "None");

  // ✅ Display username if available
  if (userNameDisplay && userName) {
    userNameDisplay.textContent = `👋 ${userName}`;
  }

  // ✅ Handle link visibility based on role
  if (userRole === "Admin") {
    adminLink?.classList.remove("hidden");
    updateProfileLink?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");
  } else if (userRole === "Resident" && userStatus === "Approved") {
    adminLink?.classList.add("hidden");
    updateProfileLink?.classList.remove("hidden");
    logoutBtn?.classList.remove("hidden");
  } else if (userRole === "Security") {
    adminLink?.classList.add("hidden");
    updateProfileLink?.classList.add("hidden");
    logoutBtn?.classList.remove("hidden");
  } else {
    // Guest or pending users
    adminLink?.classList.add("hidden");
    updateProfileLink?.classList.add("hidden");
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  // 🚪 Logout button logic
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const confirmLogout = confirm("Are you sure you want to log out?");
      if (!confirmLogout) return;

      try {
        // 🔹 Optional API logout call
        if (token) {
          await fetch("http://localhost:4050/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {
        console.warn("⚠️ Logout API request failed:", err);
      }

      // 🧹 Clear all localStorage keys safely
      [
        "token", "role", "name", "user", "status",
        "residentID", "residentName", "fullName", "username", "roleId"
      ].forEach((key) => localStorage.removeItem(key));

      alert("✅ You have been logged out successfully.");
      window.location.href = "login.html";
    });
  } else {
    console.warn("⚠️ logoutBtn not found — logout button skipped.");
  }
});
