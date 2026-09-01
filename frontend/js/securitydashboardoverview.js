// ================================
// securitydashboardoverview.js
// ================================

document.addEventListener("DOMContentLoaded", async () => {
  // ================================
  // Select elements
  // ================================
  const totalResidentsEl = document.getElementById("totalResidents");
  const pendingPaymentsEl = document.getElementById("pendingPayments");
  const compliancePctEl = document.getElementById("compliancePct");
  const overrideCountEl = document.getElementById("overrideCount");

  const totalVisitorsCheckedinEl = document.getElementById("totalVisitorsCheckedin");
  const totalVisitorsCheckedoutEl = document.getElementById("totalVisitorsCheckedout");
  const rejectsEl = document.getElementById("rejects");

  const accessChartEl = document.getElementById("accessChart");

  // ================================
  // Mock fetch function (replace with your API calls)
  // ================================
  async function fetchDashboardData() {
    // Simulate API call delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalResidents: 152,
          pendingPayments: 27,
          compliancePct: 94,
          overrideCount: 3,
          totalVisitorsCheckedin: 48,
          totalVisitorsCheckedout: 45,
          rejects: 5,
          accessAttemptsLast14Days: [
            { date: "2025-11-14", attempts: 34 },
            { date: "2025-11-15", attempts: 29 },
            { date: "2025-11-16", attempts: 41 },
            { date: "2025-11-17", attempts: 36 },
            { date: "2025-11-18", attempts: 50 },
            { date: "2025-11-19", attempts: 43 },
            { date: "2025-11-20", attempts: 38 },
            { date: "2025-11-21", attempts: 47 },
            { date: "2025-11-22", attempts: 52 },
            { date: "2025-11-23", attempts: 44 },
            { date: "2025-11-24", attempts: 39 },
            { date: "2025-11-25", attempts: 48 },
            { date: "2025-11-26", attempts: 50 },
            { date: "2025-11-27", attempts: 46 },
          ]
        });
      }, 500);
    });
  }

  // ================================
  // Populate dashboard stats
  // ================================
  const data = await fetchDashboardData();

  totalResidentsEl.textContent = data.totalResidents;
  pendingPaymentsEl.textContent = data.pendingPayments;
  compliancePctEl.textContent = `${data.compliancePct}%`;
  overrideCountEl.textContent = data.overrideCount;

  totalVisitorsCheckedinEl.textContent = data.totalVisitorsCheckedin;
  totalVisitorsCheckedoutEl.textContent = data.totalVisitorsCheckedout;
  rejectsEl.textContent = data.rejects;

  // ================================
  // Chart.js: Access Attempts Last 14 Days
  // ================================
  const labels = data.accessAttemptsLast14Days.map(d => d.date);
  const attempts = data.accessAttemptsLast14Days.map(d => d.attempts);

  new Chart(accessChartEl, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Access Attempts",
          data: attempts,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#1D4ED8"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top"
        },
        tooltip: {
          mode: "index",
          intersect: false
        }
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Date"
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Attempts"
          },
          beginAtZero: true,
          suggestedMax: Math.max(...attempts) + 5
        }
      }
    }
  });
});
