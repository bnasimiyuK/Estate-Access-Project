console.log("🚀 Dashboard JS loaded");

const API_URL = "http://localhost:4050/api/visitorsaccess";

// Simulated logged-in user (for testing)
const loggedResident = {
  UserID: 1,
  FullName: "Beverlyne Kongani",
  RoleName: "Admin", // "Admin", "Resident", "Security"
  HouseNumber: "B12"
};

// Tabs
const tabRegister = document.getElementById("tabRegister");
const tabPending = document.getElementById("tabPending");
const registerSection = document.getElementById("registerSection");
const pendingSection = document.getElementById("pendingSection");
const approvedSection = document.getElementById("approvedSection");

// --- Tab switching ---
tabRegister.addEventListener("click", () => {
  registerSection.classList.remove("hidden");
  pendingSection.classList.add("hidden");
  tabRegister.classList.add("bg-blue-600", "text-white");
  tabRegister.classList.remove("bg-gray-200", "text-gray-700");
  tabPending.classList.remove("bg-blue-600", "text-white");
  tabPending.classList.add("bg-gray-200", "text-gray-700");
});

tabPending.addEventListener("click", () => {
  registerSection.classList.add("hidden");
  pendingSection.classList.remove("hidden");
  tabPending.classList.add("bg-blue-600", "text-white");
  tabPending.classList.remove("bg-gray-200", "text-gray-700");
  tabRegister.classList.remove("bg-blue-600", "text-white");
  tabRegister.classList.add("bg-gray-200", "text-gray-700");
  loadPendingRequests();
});

// --- Visitor registration ---
const registrationType = document.getElementById("registrationType");
const addVisitorBtn = document.getElementById("addVisitorBtn");
const visitorContainer = document.getElementById("visitorContainer");

registrationType.addEventListener("change", () => {
  addVisitorBtn.classList.toggle("hidden", registrationType.value !== "group");
});

addVisitorBtn.addEventListener("click", () => {
  const firstEntry = visitorContainer.querySelector(".visitor-entry");
  const newEntry = firstEntry.cloneNode(true);
  newEntry.querySelectorAll("input, textarea").forEach(i => i.value = "");
  newEntry.querySelector(".removeVisitorBtn").classList.remove("hidden");
  visitorContainer.appendChild(newEntry);
});

visitorContainer.addEventListener("click", e => {
  if (e.target.classList.contains("removeVisitorBtn")) {
    e.target.parentElement.remove();
  }
});

// --- Submit visitor registration ---
document.getElementById("visitorForm").addEventListener("submit", async e => {
  e.preventDefault();
  const msgRegister = document.getElementById("msgRegister");
  msgRegister.textContent = "";

  const visitors = Array.from(document.querySelectorAll(".visitor-entry")).map(entry => ({
    VisitorName: entry.querySelector("[name='VisitorName']").value.trim(),
    NationalID: entry.querySelector("[name='NationalID']").value.trim(),
    PhoneNumber: entry.querySelector("[name='PhoneNumber']").value.trim(),
    VehicleNumber: entry.querySelector("[name='VehicleNumber']").value.trim(),
    Purpose: entry.querySelector("[name='Purpose']").value.trim(),
    DateOfVisit: entry.querySelector("[name='DateOfVisit']").value
  })).filter(v => v.VisitorName && v.NationalID && v.PhoneNumber && v.Purpose && v.DateOfVisit);

  if (!visitors.length) {
    msgRegister.textContent = "No visitors provided";
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
    visitorContainer.querySelectorAll(".visitor-entry").forEach((entry, idx) => {
      if (idx > 0) entry.remove();
      entry.querySelectorAll("input, textarea").forEach(i => i.value = "");
    });

    loadPendingRequests(); // Refresh pending table
  } catch (err) {
    console.error(err);
    msgRegister.textContent = "Error: " + err.message;
  }
});

// --- Load pending approvals ---
async function loadPendingRequests() {
  const tableBody = document.getElementById("requestsTable");
  tableBody.innerHTML = "<tr><td colspan='7' class='text-center py-2'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/pending`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

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

    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const level = btn.dataset.level;
        const endpoint = `${API_URL}/approve/level${level}/${id}`;

        try {
          const resp = await fetch(endpoint, {
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
          loadPendingRequests();
          loadApprovedVisitors();
        } catch (err) {
          console.error(err);
          alert("Error approving visitor: " + err.message);
        }
      });
    });

  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan='7' class='text-center py-2 text-red-600'>Error loading pending requests</td></tr>";
  }
}

// --- Load approved visitors ---
async function loadApprovedVisitors() {
  const approvedBody = document.getElementById("approvedTableBody");
  approvedBody.innerHTML = "<tr><td colspan='8' class='text-center py-2'>Loading...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/approved`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

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

// Initial load
loadApprovedVisitors();
loadPendingRequests();

// Refresh approved visitors every 10 seconds
setInterval(loadApprovedVisitors, 10000);
