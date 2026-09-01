// ================================
// frontend/scripts/dashboard.js
// ================================

const API_HOST = "http://localhost:4050";
// Use 'token' to retrieve the token from localStorage
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// API Endpoints
const DASHBOARD_SUMMARY_URL = `${API_HOST}/api/dashboard/summary`;
const ACCESS_CHART_URL = `${API_HOST}/api/dashboard/accesschart`;
const PENDING_MEMBERSHIPS_URL = `${API_HOST}/api/admin/memberships/pending`;

// ================================
// SAFE DOM UPDATE HELPER
// ================================
const safeUpdate = (id, value, suffix = "") => {
  const element = document.getElementById(id);
  if (element) element.textContent = value + suffix;
  else console.warn(`Element with ID '${id}' not found in the DOM.`);
};

// ================================
// ADMIN GUARD
// ================================
const checkAdminAccess = () => {
  if (!token || role !== "Admin") {
    console.warn("Access denied. Redirecting to login.");
    window.location.href = "/login.html";
    return false;
  }
  console.log(`✅ Access granted for role: ${role}`);
  return true;
};

// ================================
// FETCH PENDING MEMBERSHIPS
// ================================
async function fetchPendingMemberships() {
  try {
    const res = await fetch(PENDING_MEMBERSHIPS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Failed to fetch memberships:", err);
    return [];
  }
}

// ================================
// LOAD DASHBOARD SUMMARY
// ================================
async function loadDashboardSummary() {
  if (!token) return;

  try {
    const res = await fetch(DASHBOARD_SUMMARY_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

    const data = await res.json();

    // Update dashboard cards
    safeUpdate("totalResidents", data.totalResidents || 0);
    safeUpdate("pendingPayments", data.pendingPayments || 0);
    safeUpdate("compliancePct", data.compliancePct || 0, "%");
    safeUpdate("overrideCount", data.overrideCount || 0);
    safeUpdate("totalVisitorsCheckedin", data.visitorscheckedin || 0);
    safeUpdate("totalVisitorsCheckedout", data.visitorscheckedout || 0);
    safeUpdate("rejects", data.rejects || 0);

  } catch (err) {
    console.error("Error loading dashboard summary:", err.message);
    safeUpdate("totalResidents", "Error");
  }
}

// ================================
// LOAD ACCESS CHART
// ================================
async function loadAccessChart() {
  if (!token) return;

  try {
    const res = await fetch(ACCESS_CHART_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

    const chartData = await res.json();
    const accessChartElement = document.getElementById("accessChart");
    if (!accessChartElement) return console.warn("Chart element not found.");

    const ctx = accessChartElement.getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels || [],
        datasets: [
          {
            label: "Daily Access Attempts",
            data: chartData.data || [],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 5 } } },
        plugins: { legend: { display: true, position: "top" }, tooltip: { enabled: true } },
      },
    });

  } catch (err) {
    console.error("Error loading access chart:", err.message);
  }
}

// ================================
// LOAD PENDING MEMBERSHIPS COUNT
// ================================
async function loadPendingMemberships() {
  const memberships = await fetchPendingMemberships();
  console.log("Pending memberships:", memberships);
  safeUpdate("membershipCount", memberships.length);
}

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Admin Dashboard Loaded");
  if (!checkAdminAccess()) return;

  // Load all dashboard data
  loadDashboardSummary();
  loadAccessChart();
  loadPendingMemberships();
});
