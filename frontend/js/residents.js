// 🚨 BLOCK UNAUTHORIZED ACCESS
const savedToken = localStorage.getItem("token");
console.log("🔍 Token on Residents Page:", savedToken);

if (!savedToken || savedToken === "null" || savedToken === "undefined") {
  console.warn("🚫 No valid token found. Redirecting to login.");
  window.location.href = "login.html";
}

// ==========================================
// frontend/scripts/residents.js
// ==========================================
console.log("🏘️ residents.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("📡 Initializing Residents Page...");

  loadResidents();
  setupFilters();

  const syncBtn = document.getElementById("syncResidentsBtn");
  if (syncBtn) {
    syncBtn.addEventListener("click", async () => {
      await syncResidents();
      await loadResidents();
    });
  }
});

// ==========================================
// 🧩 Load Residents from Backend
// ==========================================
async function loadResidents() {
  const token = localStorage.getItem("token");
  const tbody = document.querySelector("#residentsTable tbody");

  if (!tbody) {
    console.warn("⚠️ No residents table body found in DOM.");
    return;
  }

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
          <td colspan="12" class="text-center py-4 text-gray-500">
            No resident records found.
          </td>
        </tr>`;
      console.log("⚠️ No residents returned from server.");
      return;
    }

    residents.forEach((r) => {
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
          <td class="border px-4 py-2 text-center">${r.ResidentID ?? "-"}</td>
          <td class="border px-4 py-2 text-center">${r.UserID ?? "-"}</td>
          <td class="border px-4 py-2 font-medium">${r.ResidentName ?? "-"}</td>
          <td class="border px-4 py-2">${r.NationalID ?? "-"}</td>
          <td class="border px-4 py-2">${r.PhoneNumber ?? "-"}</td>
          <td class="border px-4 py-2">${r.Email ?? "-"}</td>
          <td class="border px-4 py-2 text-center">${r.HouseNumber ?? "-"}</td>
          <td class="border px-4 py-2">${r.CourtName ?? "-"}</td>
          <td class="border px-4 py-2">${r.Occupation ?? "-"}</td>
          <td class="border px-4 py-2 text-center">${formattedDate}</td>
          <td class="border px-4 py-2 text-center">
            <span class="px-2 py-1 rounded-full text-xs ${statusColor}">
              ${r.Status ?? "Unknown"}
            </span>
          </td>
          <td class="border px-4 py-2 text-center">${r.RoleName ?? "-"}</td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    console.log(`✅ Loaded ${residents.length} residents`);

    applyFilters(); // ensure filters apply after loading data

  } catch (err) {
    console.error("❌ Failed to load residents:", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="12" class="text-center py-4 text-red-500">
          Failed to load residents. Please try again later.
        </td>
      </tr>`;
  }
}

// ==========================================
// 🔁 Sync Residents (Backend Insert Trigger)
// ==========================================
async function syncResidents() {
  const token = localStorage.getItem("token");

  try {
    console.log("🔄 Syncing residents...");
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
      console.error("❌ Sync error:", data);
      alert("Sync failed: " + (data.message || "Unknown error"));
      return;
    }

    alert(
      `Residents Synced!\n\nAdded Residents: ${data.residentsAdded}\nAdded Users: ${data.usersAdded}`
    );

    console.log("🔁 Sync complete:", data);

  } catch (err) {
    console.error("❌ Sync error:", err);
    alert("Failed to sync residents. Check backend.");
  }
}

// ==========================================
// 🔍 Table Column Filtering System
// ==========================================
function setupFilters() {
  document.querySelectorAll(".filterInput").forEach((input) => {
    input.addEventListener("input", applyFilters);
    input.addEventListener("change", applyFilters);
  });
}

function applyFilters() {
  const table = document.getElementById("residentsTable");
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
      } else if (!cellText.includes(filter.value)) {
        show = false;
      }
    });

    row.style.display = show ? "" : "none";
  });
}

