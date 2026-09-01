// ================================
// CONFIG & TOKEN
// ================================
const API_HOST = "http://localhost:4050";
const DASHBOARD_SUMMARY_URL = `${API_HOST}/api/dashboard/summary`;
const ACCESS_CHART_URL = `${API_HOST}/api/dashboard/accesschart`;

// ================================
// SAFE UPDATE HELPER
// Prevents errors if an element is missing.
// ================================
const safeUpdate = (id, value, suffix = "") => {
  const el = document.getElementById(id);
  if (el) el.textContent = value + suffix;
};

// ================================
// FETCH WITH AUTH HELPER
// Automatically attaches JWT token and handles missing token
// ================================
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("🚨 Authentication token missing. Please log in.");
    window.location.href = "login.html";
    throw new Error("Authentication token missing.");
  }

  const headers = options.headers || {};
  headers["Authorization"] = `Bearer ${token}`;
  headers["Accept"] = "application/json";

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ================================
// LOAD DASHBOARD SUMMARY
// ================================
export async function loadDashboardSummary() {
  try {
    const data = await fetchWithAuth(DASHBOARD_SUMMARY_URL);

    safeUpdate("totalResidents", data.totalResidents || 0);
    safeUpdate("pendingPayments", data.pendingPayments || 0);
    safeUpdate("compliancePct", data.compliancePct || 0, "%");
    safeUpdate("overrideCount", data.overrideCount || 0);
    safeUpdate("totalVisitorsCheckedin", data.visitorscheckedin || 0);
    safeUpdate("totalVisitorsCheckedout", data.visitorscheckedout || 0);
    safeUpdate("rejects", data.rejects || 0);

  } catch (err) {
    console.error("Error loading dashboard summary:", err);
  }
}

// ================================
// LOAD ACCESS CHART
// ================================
export async function loadAccessChart() {
  try {
    const chartData = await fetchWithAuth(ACCESS_CHART_URL);

    const ctx = document.getElementById("accessChart")?.getContext("2d");
    if (!ctx) return;

    new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels || [],
        datasets: [
          {
            label: "Daily Access Attempts",
            data: chartData.data || [],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.2)",
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
    console.error("Error loading access chart:", err);
  }
}

// ================================
// ACCESS GUARD
// Restrict access based on role
// ================================
function accessGuard() {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").split(",")[0].trim().toLowerCase();
  const roleId = localStorage.getItem("roleId");

  if (!token) {
    alert("Please log in to access this page.");
    window.location.href = "login.html";
    return false;
  }

  const currentPage = window.location.pathname.split("/").pop();
  const accessRules = {
    admin: ["admindashboard.html", "admin.html"],
    security: ["securitydashboard.html"],
    resident: ["residentportal.html"],
  };

  const isAllowed = () => {
    if (role === "admin" || roleId == 1) return true;
    if (role === "security" || roleId == 3) return accessRules.security.includes(currentPage);
    if (role === "resident" || roleId == 2) return accessRules.resident.includes(currentPage);
    return false;
  };

  if (!isAllowed()) {
    alert("🚫 Access denied. You are not authorized to view this page.");
    window.location.href = "home.html";
    return false;
  }

  console.log("✅ Access granted for:", role, "| RoleID:", roleId);
  return true;
}

// ================================
// INIT
// ================================
document.addEventListener("DOMContentLoaded", () => {
  if (!accessGuard()) return; // check access first

  loadDashboardSummary();
  loadAccessChart();
});
