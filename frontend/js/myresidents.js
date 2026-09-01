// ==========================================
// frontend/scripts/residents.js
// ==========================================
console.log("🏘️ residents.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("📡 Initializing Residents Page...");

  loadResidents();

  // Optional: Auto-sync residents on load
  // Uncomment if you want automatic sync at page load
  // syncResidents();

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
  const tbody =
    document.querySelector("#residentsTable tbody") ||
    document.getElementById("residents-table-body");

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
// 🔁 Sync Residents (Trigger Backend Insert)
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
      body: JSON.stringify({ residents: [] }), // optional payload
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      alert("⚠️ Sync failed: " + (data.message || "Unknown error"));
      console.error("❌ Sync error:", data);
      return;
    }

    alert(
      `✅ Residents synced successfully!\nAdded to Residents: ${
        data.residentsAdded || 0
      }\nAdded to Users: ${data.usersAdded || 0}`
    );
    console.log("🔁 Sync complete:", data);
  } catch (err) {
    console.error("❌ Sync error:", err);
    alert("Failed to sync residents. Please check backend connection.");
  }
}
