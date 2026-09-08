// ==========================================
// frontend/scripts/residents.js
// ==========================================

// --------------------------------------------------
// 1. AUTHENTICATION GUARD
// --------------------------------------------------
const savedToken = localStorage.getItem("token");
console.log("🔍 Token on Residents Page:", savedToken);

if (!savedToken || savedToken === "null" || savedToken === "undefined") {
  console.warn("🚫 No valid token found. Redirecting to login.");
  window.location.href = "login.html";
}

// --------------------------------------------------
// 2. MAIN RESIDENTS MODULE
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("📡 Initializing Residents Table System...");

  loadResidents();
  setupFilters();
  setupTableActionListeners();

  const syncBtn = document.getElementById("syncResidentsBtn");
  if (syncBtn) {
    syncBtn.addEventListener("click", async () => {
      await syncResidents();
      await loadResidents();
    });
  }
});

// Event Delegation Listener on Table
function setupTableActionListeners() {
  const table = document.getElementById("residentsTable");
  if (!table) return;

  table.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".viewProfileBtn");
    if (viewBtn) {
      e.preventDefault();
      const residentId = viewBtn.getAttribute("data-resident-id");
      console.log("👆 Click detected for Resident ID:", residentId);

      if (
        residentId &&
        residentId !== "undefined" &&
        typeof window.openResidentProfile === "function"
      ) {
        window.openResidentProfile(residentId);
      } else {
        console.error("❌ Could not trigger profile modal.");
      }
    }
  });
}

// Fetch and load data from backend server
async function loadResidents() {
  const token = localStorage.getItem("token");
  const tbody = document.querySelector("#residentsTable tbody");

  if (!tbody) return;

  try {
    const response = await fetch("http://localhost:4050/api/residents/all", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const residents = await response.json();
    tbody.innerHTML = "";

    if (!Array.isArray(residents) || residents.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13" class="text-center py-4 text-gray-500">
            No resident records found.
          </td>
        </tr>`;
      return;
    }

    residents.forEach((r) => {
      const resId = r.ResidentID ?? r.id ?? r.resident_id ?? "";
      const formattedDate = r.DateJoined
        ? new Date(r.DateJoined).toLocaleDateString()
        : "-";

      const statusColor =
        r.Status?.toLowerCase() === "active"
          ? "bg-green-100 text-green-700"
          : r.Status?.toLowerCase() === "approved"
          ? "bg-blue-100 text-blue-700"
          : "bg-red-100 text-red-700";

      const row = `
        <tr class="hover:bg-gray-50 transition">
          <td class="border px-4 py-2 text-center">${resId || "-"}</td>
          <td class="border px-4 py-2 text-center">${
            r.UserID ?? r.user_id ?? "-"
          }</td>
          <td class="border px-4 py-2 font-medium">${
            r.ResidentName ?? r.name ?? "-"
          }</td>
          <td class="border px-4 py-2">${
            r.NationalID ?? r.national_id ?? "-"
          }</td>
          <td class="border px-4 py-2">${r.PhoneNumber ?? r.phone ?? "-"}</td>
          <td class="border px-4 py-2">${r.Email ?? r.email ?? "-"}</td>
          <td class="border px-4 py-2 text-center">${
            r.HouseNumber ?? r.house_no ?? "-"
          }</td>
          <td class="border px-4 py-2">${r.CourtName ?? r.court ?? "-"}</td>
          <td class="border px-4 py-2">${r.Occupation ?? "-"}</td>
          <td class="border px-4 py-2 text-center">${formattedDate}</td>
          <td class="border px-4 py-2 text-center">
            <span class="px-2 py-1 rounded-full text-xs ${statusColor}">
              ${r.Status ?? "Unknown"}
            </span>
          </td>
          <td class="border px-4 py-2 text-center">${r.RoleName ?? "-"}</td>
          <td class="border px-4 py-2 text-center">
            <button
              type="button"
              class="viewProfileBtn bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded shadow transition cursor-pointer"
              data-resident-id="${resId}"
            >
              View
            </button>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    applyFilters();
  } catch (err) {
    console.error("❌ Failed to load residents:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="13" class="text-center py-4 text-red-500">
          Failed to load residents. Please try again later.
        </td>
      </tr>`;
  }
}

// Trigger backend sync process
async function syncResidents() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:4050/api/residents/sync", {
      method: "POST",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!data.success) {
      alert("Sync failed: " + (data.message || "Unknown error"));
      return;
    }

    alert(
      `Residents Synced!\n\nAdded Residents: ${data.residentsAdded}\nAdded Users: ${data.usersAdded}`
    );
  } catch (err) {
    console.error("❌ Sync error:", err);
    alert("Failed to sync residents. Check backend server.");
  }
}

// Dynamic filtering setup
function setupFilters() {
  document.querySelectorAll(".filterInput").forEach((input) => {
    input.addEventListener("input", applyFilters);
    input.addEventListener("change", applyFilters);
  });
}

function applyFilters() {
  const table = document.getElementById("residentsTable");
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");

  const filters = Array.from(document.querySelectorAll(".filterInput")).map(
    (input) => ({
      col: input.dataset.col,
      value: input.value.trim().toLowerCase(),
      isDate: input.dataset.date === "true",
    })
  );

  rows.forEach((row) => {
    let show = true;
    const cells = row.getElementsByTagName("td");

    filters.forEach((filter) => {
      if (!filter.value) return;

      const cellText = cells[filter.col]?.textContent.trim().toLowerCase();

      if (filter.isDate) {
        const rowDate = new Date(cellText).toISOString().split("T")[0];
        if (rowDate !== filter.value) show = false;
      } else if (!cellText || !cellText.includes(filter.value)) {
        show = false;
      }
    });

    row.style.display = show ? "" : "none";
  });
}