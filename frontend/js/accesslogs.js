// ==========================================
// frontend/js/accesslogs.js
// ==========================================
console.log("🚀 Access JS loaded");

const API_URL = "http://localhost:4050/api/accesslogs";
const tableBody = document.getElementById("accessLogsTableBody");

const filterUserId = document.getElementById("filterUserId");
const filterAction = document.getElementById("filterAction");
const filterFrom = document.getElementById("filterFrom");
const filterTo = document.getElementById("filterTo");
const btnFilter = document.getElementById("btnFilter");
const btnReset = document.getElementById("btnReset");
const btnDownloadCSV = document.getElementById("btnDownloadCSV");

// Load access logs
async function loadAccessLogs() {
  if (!tableBody) return console.error("Table body element not found");

  try {
    // Build URL with filters
    let url = API_URL + "?";
    if (filterUserId?.value) url += `userId=${filterUserId.value}&`;
    if (filterAction?.value) url += `action=${encodeURIComponent(filterAction.value)}&`;
    if (filterFrom?.value) url += `fromDate=${filterFrom.value}&`;
    if (filterTo?.value) url += `toDate=${filterTo.value}&`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const logs = await res.json();
    tableBody.innerHTML = "";

    if (!logs.length) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-2">No logs found</td></tr>`;
      return;
    }

    logs.forEach((log, i) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-100 transition duration-200";

      const date = log.TimestampUtc ? new Date(log.TimestampUtc).toLocaleString() : "N/A";

      row.innerHTML = `
        <td class="border px-2 py-1">${i + 1}</td>
        <td class="border px-2 py-1">${log.UserId || "N/A"}</td>
        <td class="border px-2 py-1">${log.Action || "N/A"}</td>
        <td class="border px-2 py-1">${log.Resource || "N/A"}</td>
        <td class="border px-2 py-1">${date}</td>
        <td class="border px-2 py-1">${log.IpAddress || "N/A"}</td>
        <td class="border px-2 py-1">${log.UserAgent || "N/A"}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("❌ Error loading access logs:", err);
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-2 text-red-600">Error loading access logs</td></tr>`;
  }
}

// Event listeners
btnDownloadCSV?.addEventListener("click", () => {
  window.open(API_URL + "/download/csv", "_blank");
});

btnFilter?.addEventListener("click", loadAccessLogs);
btnReset?.addEventListener("click", () => {
  if (filterUserId) filterUserId.value = "";
  if (filterAction) filterAction.value = "";
  if (filterFrom) filterFrom.value = "";
  if (filterTo) filterTo.value = "";
  loadAccessLogs();
});

// Initial load
document.addEventListener("DOMContentLoaded", loadAccessLogs);

// Auto-refresh every 10 seconds
setInterval(loadAccessLogs, 10000);
