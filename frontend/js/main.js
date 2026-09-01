// ✅ main.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ main.js loaded");

  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  // ⛔ Skip token check on login page
  if (currentPage === "login.html") {
    console.log("🟡 Skipping token check on login page");
    return;
  }

  // 🔑 Get token and role from localStorage
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").trim();
  const username = localStorage.getItem("username");

  // 🌐 Publicly accessible pages
  const publicPages = ["home.html", "about.html", "contact.html", "login.html"];

  // 🚫 Redirect if not logged in
  if (!publicPages.includes(currentPage) && !token) {
    console.warn("❌ No token found — redirecting to login.");
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
    return;
  }

  // ✅ Role-based access control
  const accessRules = {
    Resident: ["home.html", "residentdashboard.html", "about.html", "contact.html"],
    Security: ["securitydashboard.html", "home.html", "about.html", "contact.html"],
    Visitor: [
      "home.html",
      "about.html",
      "contact.html",
      "services.html",
      "membershiprequests.html",
      "login.html"
    ]
  };

  // 🧩 Access check — Admin bypasses all restrictions
  if (token && role) {
    const normalizedRole = role.toLowerCase();

    if (normalizedRole !== "admin") {
      const allowedPages = (accessRules[role] || []).map(p => p.toLowerCase());
      if (!allowedPages.includes(currentPage)) {
        alert("🚫 Access denied for your role.");
        console.warn(`🚫 ${role} tried to access ${currentPage}`);
        window.location.href = "home.html";
        return;
      }
    }

    console.log(`🟢 Access granted: ${role} → ${currentPage}`);
  }

  // 🧭 Navbar Role-based Display Logic
  const logoutBtn = document.getElementById("logoutBtn");

  // Admin-specific section links
  const adminSectionLinks = [
    "adminDashboardLink",
    "membershipRequestsLink",
    "membershipRecordsLink",
    "securityDashboardLink"
  ];
  const residentLinks = ["residentPaymentsLink"];

  if (token && role) {
    logoutBtn?.classList.remove("hidden");

    if (role.toLowerCase() === "admin") {
      // 👑 Admin sees everything
      document.querySelectorAll("a").forEach(link => link.classList.remove("hidden"));
    }

    if (role.toLowerCase() === "resident") {
      residentLinks.forEach(id => document.getElementById(id)?.classList.remove("hidden"));
    }

    if (role.toLowerCase() === "security") {
      document.getElementById("securityDashboardLink")?.classList.remove("hidden");
    }
  } else {
    logoutBtn?.classList.add("hidden");
  }

 

  // 🔹 Mobile menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  menuToggle?.addEventListener("click", () => {
    navMenu?.classList.toggle("hidden");
  });

  // 📅 Set current year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

// 🔁 Logout function definition
function logout() {
  localStorage.clear();
  alert("You have been logged out.");
  window.location.href = "login.html";
}
