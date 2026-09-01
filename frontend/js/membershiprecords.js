// 📘 membershiprecords.js

// ================================
// Check Access Token & Role (Fixed)
// ================================
const token = localStorage.getItem("token");
let role = localStorage.getItem("role");
const roleId = localStorage.getItem("roleId");

// Parse role if it's stored as JSON string
try {
  const parsedRole = JSON.parse(role);
  if (Array.isArray(parsedRole) && parsedRole.length > 0) {
    role = parsedRole[0]; // Take first role if array
  } else if (typeof parsedRole === 'string') {
    role = parsedRole;
  }
} catch (e) {
  // role is already a string, keep as is
  console.log("Role is already string:", role);
}

// Normalize role for comparison
const normalizedRole = role ? role.toLowerCase() : '';

// Check authentication and authorization
if (!token) {
  alert("Please log in first!");
  window.location.href = "login.html";
} else if (!role || (normalizedRole !== 'admin' && roleId != 1)) {
  alert("Access Denied: Admins only");
  window.location.href = "login.html";
}

// ================================
// API Base URL
// ================================
const API_BASE = "http://localhost:4050/api/membershiprecords";

// ================================
// Authentication Helper Functions
// ================================
async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("http://localhost:4050/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data.token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.clear();
    window.location.href = "login.html";
    throw error;
  }
}

async function authenticatedFetch(url, options = {}) {
  let token = localStorage.getItem("token");
  
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      token = await refreshToken();
      config.headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, config);
    } catch (error) {
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }
  }

  return response;
}

document.addEventListener("DOMContentLoaded", async () => {
  // -------------------------------
  // DOM Elements
  // -------------------------------
  const msg = document.getElementById("msg");
  const membershipCount = document.getElementById("membershipCount");
  const statusLabel = document.getElementById("statusLabel");
  const actionText = document.getElementById("actionText");
  const tableBody = document.getElementById("membershipTableBody");
  const residentsBody = document.getElementById("residentsTableBody");
  const requestIdFilter = document.getElementById("requestIdFilter");
  const residentFilter = document.getElementById("residentFilter");
  const clearFilterBtn = document.getElementById("clearFilterBtn");

  let allRecords = []; // global store

  // -------------------------------
  // Sync Records from Server
  // -------------------------------
  async function syncRecords() {
    try {
      const res = await authenticatedFetch(`${API_BASE}/sync`, {
        method: "POST",
      });
      
      if (!res) return; // Authentication failed
      
      const data = await res.json();
      console.log("✅ Sync:", data.message || "Done");
    } catch (err) {
      console.error("❌ Sync failed:", err);
      if (msg) msg.textContent = "Sync failed.";
    }
  }

  // -------------------------------
  // Load Membership Records
  // -------------------------------
  async function loadMembershipRecords() {
    if (!tableBody || !msg) return;

    msg.textContent = "Loading...";
    await syncRecords();

    try {
      const res = await authenticatedFetch(`${API_BASE}/all`);
      
      if (!res) return; // Authentication failed
      
      const data = await res.json();
      allRecords = Array.isArray(data.records) ? data.records : [];

      applyFilters();
      populateFilters(allRecords);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      msg.textContent = "Error loading records.";
    }
  }

  // -------------------------------
  // Apply Filters
  // -------------------------------
  function applyFilters() {
    if (!tableBody) return;
    const selectedId = requestIdFilter?.value || "";
    const selectedResident = residentFilter?.value || "";

    let filtered = [...allRecords];
    if (selectedId) filtered = filtered.filter(r => String(r.RequestID) === selectedId);
    if (selectedResident) filtered = filtered.filter(r => r.ResidentName === selectedResident);

    renderTable(filtered);
  }

  // -------------------------------
  // Render Table
  // -------------------------------
  function renderTable(records) {
    tableBody.innerHTML = "";

    if (!records.length) {
      msg.textContent = "No records found for selected filter(s).";
      updateUIStats([]);
      updateResidentsTable([]);
      return;
    }

    records.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.RequestID || "-"}</td>
        <td>${r.ResidentName || "-"}</td>
        <td>${r.NationalID || "-"}</td>
        <td>${r.PhoneNumber || "-"}</td>
        <td>${r.Email || "-"}</td>
        <td>${r.HouseNumber || "-"}</td>
        <td>${r.CourtName || "-"}</td>
        <td>${r.RoleName || "-"}</td>
        <td class="${r.Status === 'Approved' ? 'text-green-600' : r.Status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'} font-semibold">${r.Status || "-"}</td>
        <td>${r.RequestedAt ? new Date(r.RequestedAt).toLocaleString() : "-"}</td>
        <td class="text-center">
          <button class="approveBtn bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-1" data-id="${r.RequestID}">Approve</button>
          <button class="rejectBtn bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-1" data-id="${r.RequestID}">Reject</button>
          <button class="deleteBtn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" data-id="${r.RequestID}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    msg.textContent = `Showing ${records.length} record(s).`;
    updateUIStats(records);
    updateResidentsTable(records.filter(r => r.Status === "Approved"));
  }

  // -------------------------------
  // Update Dashboard Stats
  // -------------------------------
  function updateUIStats(records) {
    if (membershipCount) membershipCount.textContent = records.length;
    const approved = records.filter(r => r.Status === "Approved").length;
    const pending = records.filter(r => r.Status === "Pending").length;
    const rejected = records.filter(r => r.Status === "Rejected").length;
    if (statusLabel) statusLabel.textContent = `Approved: ${approved} | Pending: ${pending} | Rejected: ${rejected}`;
    const latest = records[0]?.RequestedAt ? new Date(records[0].RequestedAt).toLocaleString() : "N/A";
    if (actionText) actionText.textContent = latest;
  }

  // -------------------------------
  // Populate Filters
  // -------------------------------
  function populateFilters(records) {
    if (requestIdFilter) {
      const ids = [...new Set(records.map(r => r.RequestID))];
      requestIdFilter.innerHTML = `<option value="">All Request IDs</option>` + ids.map(id => `<option value="${id}">${id}</option>`).join("");
    }
    if (residentFilter) {
      const names = [...new Set(records.map(r => r.ResidentName))];
      residentFilter.innerHTML = `<option value="">All Residents</option>` + names.map(n => `<option value="${n}">${n}</option>`).join("");
    }
  }

  // -------------------------------
  // Update Residents Table
  // -------------------------------
  function updateResidentsTable(records) {
    if (!residentsBody) return;
    residentsBody.innerHTML = "";
    if (!records.length) return;
    records.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.ResidentName}</td>
        <td>${r.NationalID}</td>
        <td>${r.PhoneNumber}</td>
        <td>${r.Email}</td>
        <td>${r.HouseNumber}</td>
        <td>${r.CourtName}</td>
      `;
      residentsBody.appendChild(row);
    });
  }

  // -------------------------------
  // Handle Approve / Reject / Delete
  // -------------------------------
  document.addEventListener("click", async e => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id) return;

    let action = "";
    if (target.classList.contains("approveBtn")) action = "approve";
    else if (target.classList.contains("rejectBtn")) action = "reject";
    else if (target.classList.contains("deleteBtn")) {
      if (!confirm("Are you sure?")) return;
      action = "delete";
    }
    if (!action) return;

    try {
      const method = action === "delete" ? "DELETE" : "PUT";
      const res = await authenticatedFetch(`${API_BASE}/${action}/${id}`, {
        method,
      });
      
      if (!res) return; // Authentication failed
      
      const data = await res.json();
      if (!data.success) return alert(data.message || "Action failed");
      await loadMembershipRecords();
    } catch (err) {
      console.error("Action error:", err);
      alert("Action failed.");
    }
  });

  // -------------------------------
  // Filter Triggers
  // -------------------------------
  if (requestIdFilter) requestIdFilter.addEventListener("change", applyFilters);
  if (residentFilter) residentFilter.addEventListener("change", applyFilters);
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", () => {
      if (requestIdFilter) requestIdFilter.value = "";
      if (residentFilter) residentFilter.value = "";
      renderTable(allRecords);
    });
  }

  // -------------------------------
  // Logout Functionality
  // -------------------------------
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await authenticatedFetch("http://localhost:4050/api/auth/logout", {
          method: "POST",
        });
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        localStorage.clear();
        window.location.href = "login.html";
      }
    });
  }

  // -------------------------------
  // Initial Load
  // -------------------------------
  await loadMembershipRecords();
});
