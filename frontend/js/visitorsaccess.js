console.log("🚀 Dashboard JS loaded");

const API_URL = "http://localhost:4050/api/visitorsaccess";

// Track counts globally across module
let pendingCount = 0;
let approvedCount = 0;

// Simulated logged-in user
const loggedResident = {
  UserID: 1,
  FullName: "Beverlyne Kongani",
  RoleName: "Admin",
  HouseNumber: "B12"
};

// DOM Elements
const tabRegister = document.getElementById("tabRegister");
const tabPending = document.getElementById("tabPending");
const registerSection = document.getElementById("registerSection");
const pendingSection = document.getElementById("pendingSection");
const approvedSection = document.getElementById("approvedSection");

const registrationType = document.getElementById("registrationType");
const addVisitorBtn = document.getElementById("addVisitorBtn");
const visitorContainer = document.getElementById("visitorContainer");
const visitorForm = document.getElementById("visitorForm");
const msgRegister = document.getElementById("msgRegister");

// --- Centralized UI Stats Updater ---
function updateStatsBar() {
  const totalEl = document.getElementById("totalCount");
  const pendingEl = document.getElementById("pendingCountBadge");
  const approvedEl = document.getElementById("approvedCountBadge");
  const pendingSectionEl = document.getElementById("pendingSectionCount");
  const approvedSectionEl = document.getElementById("approvedSectionCount");

  if (totalEl) totalEl.textContent = pendingCount + approvedCount;
  if (pendingEl) pendingEl.textContent = pendingCount;
  if (approvedEl) approvedEl.textContent = approvedCount;
  if (pendingSectionEl) pendingSectionEl.textContent = `(${pendingCount})`;
  if (approvedSectionEl) approvedSectionEl.textContent = `(${approvedCount})`;
}

// --- Synchronized Data Fetcher ---
async function fetchAllDashboardStats() {
  await Promise.all([loadPendingRequests(), loadApprovedVisitors()]);
  updateStatsBar();
}

// --- Tab switching ---
tabRegister?.addEventListener("click", () => {
  registerSection.classList.remove("hidden");
  pendingSection.classList.add("hidden");
  tabRegister.classList.add("bg-blue-600", "text-white");
  tabRegister.classList.remove("bg-gray-200", "text-gray-700");
  tabPending.classList.remove("bg-blue-600", "text-white");
  tabPending.classList.add("bg-gray-200", "text-gray-700");
});

tabPending?.addEventListener("click", () => {
  registerSection.classList.add("hidden");
  pendingSection.classList.remove("hidden");
  tabPending.classList.add("bg-blue-600", "text-white");
  tabPending.classList.remove("bg-gray-200", "text-gray-700");
  tabRegister.classList.remove("bg-blue-600", "text-white");
  tabRegister.classList.add("bg-gray-200", "text-gray-700");
  fetchAllDashboardStats();
});

// --- Dynamic Form Handlers ---
registrationType?.addEventListener("change", () => {
  addVisitorBtn.classList.toggle("hidden", registrationType.value !== "group");
});

addVisitorBtn?.addEventListener("click", () => {
  const firstEntry = visitorContainer.querySelector(".visitor-entry");
  if (!firstEntry) return;
  const clone = firstEntry.cloneNode(true);
  clone.querySelectorAll("input, textarea").forEach(i => i.value = "");
  clone.querySelectorAll(".error-msg").forEach(e => e.classList.add("hidden"));
  clone.querySelector(".removeVisitorBtn")?.classList.remove("hidden");
  visitorContainer.appendChild(clone);
});

visitorContainer?.addEventListener("click", e => {
  if (e.target.classList.contains("removeVisitorBtn")) {
    e.target.closest(".visitor-entry").remove();
  }
});

// --- Validation ---
function validateVisitor(visitor) {
  let valid = true;

  if (!visitor.VisitorName.trim()) {
    visitor.errors.VisitorName.textContent = "Name is required";
    visitor.errors.VisitorName.classList.remove("hidden");
    visitor.fields.VisitorName.classList.add("border-red-600");
    valid = false;
  } else {
    visitor.errors.VisitorName.classList.add("hidden");
    visitor.fields.VisitorName.classList.remove("border-red-600");
  }

  if (!/^\d{1,8}$/.test(visitor.NationalID)) {
    visitor.errors.NationalID.textContent = "National ID must be numeric (max 8 digits)";
    visitor.errors.NationalID.classList.remove("hidden");
    visitor.fields.NationalID.classList.add("border-red-600");
    valid = false;
  } else {
    visitor.errors.NationalID.classList.add("hidden");
    visitor.fields.NationalID.classList.remove("border-red-600");
  }

  if (!/^(\+2547\d{8}|07\d{8})$/.test(visitor.PhoneNumber)) {
    visitor.errors.PhoneNumber.textContent = "Phone must be 07######## or +2547########";
    visitor.errors.PhoneNumber.classList.remove("hidden");
    visitor.fields.PhoneNumber.classList.add("border-red-600");
    valid = false;
  } else {
    visitor.errors.PhoneNumber.classList.add("hidden");
    visitor.fields.PhoneNumber.classList.remove("border-red-600");
  }

  if (!visitor.Purpose.trim() || visitor.Purpose.trim().length < 3) {
    visitor.errors.Purpose.textContent = "Purpose must be at least 3 characters";
    visitor.errors.Purpose.classList.remove("hidden");
    visitor.fields.Purpose.classList.add("border-red-600");
    valid = false;
  } else {
    visitor.errors.Purpose.classList.add("hidden");
    visitor.fields.Purpose.classList.remove("border-red-600");
  }

  const visitDate = new Date(visitor.DateOfVisit);
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (!visitor.DateOfVisit || visitDate < minDate) {
    visitor.errors.DateOfVisit.textContent = "Date must be at least 24 hours in the future";
    visitor.errors.DateOfVisit.classList.remove("hidden");
    visitor.fields.DateOfVisit.classList.add("border-red-600");
    valid = false;
  } else {
    visitor.errors.DateOfVisit.classList.add("hidden");
    visitor.fields.DateOfVisit.classList.remove("border-red-600");
  }

  return valid;
}

// --- Registration Submit ---
visitorForm?.addEventListener("submit", async e => {
  e.preventDefault();
  msgRegister.textContent = "";
  msgRegister.classList.remove("text-green-600", "text-red-600");

  const visitorEntries = Array.from(visitorContainer.querySelectorAll(".visitor-entry"));
  const visitors = [];
  let allValid = true;

  visitorEntries.forEach(entry => {
    const visitor = {
      VisitorName: entry.querySelector("[name='VisitorName']").value,
      NationalID: entry.querySelector("[name='NationalID']").value,
      PhoneNumber: entry.querySelector("[name='PhoneNumber']").value,
      VehicleNumber: entry.querySelector("[name='VehicleNumber']")?.value || "",
      Purpose: entry.querySelector("[name='Purpose']").value,
      DateOfVisit: entry.querySelector("[name='DateOfVisit']").value,
      fields: {
        VisitorName: entry.querySelector("[name='VisitorName']"),
        NationalID: entry.querySelector("[name='NationalID']"),
        PhoneNumber: entry.querySelector("[name='PhoneNumber']"),
        Purpose: entry.querySelector("[name='Purpose']"),
        DateOfVisit: entry.querySelector("[name='DateOfVisit']")
      },
      errors: {
        VisitorName: entry.querySelector("[name='VisitorName']").nextElementSibling,
        NationalID: entry.querySelector("[name='NationalID']").nextElementSibling,
        PhoneNumber: entry.querySelector("[name='PhoneNumber']").nextElementSibling,
        Purpose: entry.querySelector("[name='Purpose']").nextElementSibling,
        DateOfVisit: entry.querySelector("[name='DateOfVisit']").nextElementSibling
      }
    };

    if (validateVisitor(visitor)) visitors.push(visitor);
    else allValid = false;
  });

  if (!allValid) {
    msgRegister.textContent = "Please fix validation errors";
    msgRegister.classList.add("text-red-600");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ResidentID: loggedResident.UserID,
        ResidentName: loggedResident.FullName,
        HouseNumber: loggedResident.HouseNumber,
        CreatedByRole: loggedResident.RoleName,
        RegistrationType: registrationType.value,
        visitors
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    msgRegister.textContent = "Visitor(s) registered successfully";
    msgRegister.classList.add("text-green-600");

    visitorContainer.querySelectorAll(".visitor-entry").forEach((entry, idx) => {
      if (idx > 0) entry.remove();
      entry.querySelectorAll("input, textarea").forEach(i => i.value = "");
      entry.querySelectorAll(".error-msg").forEach(e => e.classList.add("hidden"));
    });

    await fetchAllDashboardStats();
  } catch (err) {
    console.error(err);
    msgRegister.textContent = "Error: " + err.message;
    msgRegister.classList.add("text-red-600");
  }
});

// --- Load Pending Requests ---
async function loadPendingRequests() {
  const tableBody = document.getElementById("requestsTable");
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_URL}/pending`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    pendingCount = data.requests.length;

    if (!data.requests.length) {
      tableBody.innerHTML = "<tr><td colspan='7' class='text-center py-2'>No pending requests</td></tr>";
      return;
    }

    tableBody.innerHTML = "";
    data.requests.forEach(v => {
      const tr = document.createElement("tr");

      let statusBadge = "";
      if (v.Level1Approval === "Pending") statusBadge = `<span class="px-2 py-0.5 bg-yellow-300 text-yellow-900 rounded">Pending L1</span>`;
      else if (v.Level1Approval === "Approved" && v.Level2Approval === "Pending") statusBadge = `<span class="px-2 py-0.5 bg-blue-300 text-blue-900 rounded">Pending L2</span>`;
      else if (v.Level2Approval === "Approved") statusBadge = `<span class="px-2 py-0.5 bg-green-300 text-green-900 rounded">Fully Approved</span>`;

      const approvers = [];
      if (v.Level1ApprovedBy) approvers.push(`L1: ${v.Level1ApprovedBy}`);
      if (v.Level2ApprovedBy) approvers.push(`L2: ${v.Level2ApprovedBy}`);
      const approversInfo = approvers.length ? approvers.join(", ") : "None";

      let actionButton = "";
      if (v.Level1Approval === "Pending" && loggedResident.RoleName === "Admin") {
        actionButton = `<button data-id="${v.VisitorAccessID}" data-level="1" class="approve-btn bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-700">Approve L1</button>`;
      } else if (v.Level1Approval === "Approved" && v.Level2Approval === "Pending" && (loggedResident.RoleName === "Security" || loggedResident.RoleName === "Admin")) {
        actionButton = `<button data-id="${v.VisitorAccessID}" data-level="2" class="approve-btn bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700">Approve L2</button>`;
      }

      tr.innerHTML = `
        <td class="border px-2 py-1">${v.VisitorName}</td>
        <td class="border px-2 py-1">${v.ResidentName}</td>
        <td class="border px-2 py-1">${v.HouseNumber}</td>
        <td class="border px-2 py-1">${new Date(v.DateOfVisit).toLocaleString()}</td>
        <td class="border px-2 py-1">${statusBadge}</td>
        <td class="border px-2 py-1">${approversInfo}</td>
        <td class="border px-2 py-1">${actionButton}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan='7' class='text-center py-2 text-red-600'>Error loading pending requests</td></tr>";
  }
}

// --- Delegate Approval Actions (Single Listener) ---
document.getElementById("requestsTable")?.addEventListener("click", async e => {
  if (!e.target.classList.contains("approve-btn")) return;
  
  const btn = e.target;
  const id = btn.dataset.id;
  const level = btn.dataset.level;

  try {
    const resp = await fetch(`${API_URL}/approve/level${level}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvedByID: loggedResident.UserID,
        approvedByName: loggedResident.FullName
      })
    });

    const result = await resp.json();
    if (!result.success) throw new Error(result.message);

    alert(`Visitor approved (Level ${level})`);
    await fetchAllDashboardStats();
  } catch (err) {
    console.error(err);
    alert("Error approving visitor: " + err.message);
  }
});

// --- Load Approved Visitors ---
async function loadApprovedVisitors() {
  const approvedBody = document.getElementById("approvedTableBody");
  if (!approvedBody) return;

  try {
    const res = await fetch(`${API_URL}/approved`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    approvedCount = data.approved.length;

    if (!data.approved.length) {
      approvedBody.innerHTML = "<tr><td colspan='8' class='text-center py-2'>No approved visitors</td></tr>";
      return;
    }

    approvedBody.innerHTML = "";
    data.approved.forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border px-2 py-1">${v.VisitorName}</td>
        <td class="border px-2 py-1">${v.ResidentName}</td>
        <td class="border px-2 py-1">${v.HouseNumber}</td>
        <td class="border px-2 py-1">${new Date(v.DateOfVisit).toLocaleString()}</td>
        <td class="border px-2 py-1">${v.AccessCode || "N/A"}</td>
        <td class="border px-2 py-1">${v.AllowedVisitorsCount || 1}</td>
        <td class="border px-2 py-1">${v.Level1ApprovedBy || ""}</td>
        <td class="border px-2 py-1">${v.Level2ApprovedBy || ""}</td>
      `;
      approvedBody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    approvedBody.innerHTML = "<tr><td colspan='8' class='text-center py-2 text-red-600'>Error loading approved visitors</td></tr>";
  }
}

// --- Exporters ---
function downloadCSV(containerId, filename) {
  const rows = Array.from(document.querySelectorAll(`#${containerId} tr`));
  const csvContent = rows.map(row => Array.from(row.cells).map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function downloadExcel(containerId, filename) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = `<table border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;">`;
  const rows = container.tagName === "TABLE" ? container.rows : container.querySelectorAll("tr");
  
  Array.from(rows).forEach(row => {
    html += "<tr>";
    Array.from(row.cells).forEach(cell => {
      const isHeader = cell.tagName === "TH";
      html += `<td style="padding:5px;${isHeader ? 'font-weight:bold;background-color:#f0f0f0;' : ''}">${cell.textContent}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// --- Export Bindings ---
document.getElementById("exportPendingCSV")?.addEventListener("click", () => downloadCSV("requestsTable", "pending_visitors.csv"));
document.getElementById("exportPendingExcel")?.addEventListener("click", () => downloadExcel("requestsTable", "pending_visitors.xls"));
document.getElementById("exportApprovedCSV")?.addEventListener("click", () => downloadCSV("approvedTableBody", "approved_visitors.csv"));
document.getElementById("exportApprovedExcel")?.addEventListener("click", () => downloadExcel("approvedTableBody", "approved_visitors.xls"));

// --- Initial Load & Polling ---
fetchAllDashboardStats();
setInterval(fetchAllDashboardStats, 10000);