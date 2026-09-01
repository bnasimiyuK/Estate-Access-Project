document.addEventListener("DOMContentLoaded", () => {
  console.log("📌 Resident Dashboard Loaded");

  // Load header first
  loadHeader(() => {
    setupResidentSidebar();
  });
});

function loadHeader(callback) {
  fetch("partials/header.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("header").innerHTML = html;
      console.log("✅ Header loaded");
      if (typeof navbarInit === "function") navbarInit();
      if (typeof callback === "function") callback();
    })
    .catch(err => {
      console.error("❌ Failed to load header:", err);
      if (typeof callback === "function") callback();
    });
}

function setupResidentSidebar() {
  const sidebarLinks = document.getElementById("sidebarLinks");
  if (!sidebarLinks) {
    console.warn("⚠️ No sidebarLinks element found");
    return;
  }

  sidebarLinks.innerHTML = `
    <a href="residentdashboard.html" class="px-4 py-2 rounded hover:bg-gray-700">Dashboard Home</a>
    <a href="residents.html" class="px-4 py-2 rounded hover:bg-gray-700">My Profile</a>
    <a href="payments.html" class="px-4 py-2 rounded hover:bg-gray-700">My Payments</a>
    <a href="verifiedpayments.html" class="px-4 py-2 rounded hover:bg-gray-700">Verified Payments</a>
    <a href="reports.html" class="px-4 py-2 rounded hover:bg-gray-700">Reports</a>
  `;

  console.log("✅ Sidebar initialized");
}
