import jsPDF from "jspdf";

const BACKEND_URL = "http://localhost:4050";
const rowsPerPage = 5;

let allPayments = [];
let filteredPayments = [];
let currentPage = 1;
let currentSort = { column: null, asc: true };
let userRole = null;
let refreshInterval = null;

// ------------------------------
// INIT
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  userRole = localStorage.getItem("role"); // "admin" | "resident"

  if (!userRole) {
    alert("Unauthorized");
    window.location.href = "/login.html";
    return;
  }

  await fetchPayments();

  document.getElementById("searchInput").addEventListener("input", handleSearch);

  document.querySelectorAll("thead th[data-sort]").forEach(th => {
    th.onclick = () => handleSort(th.dataset.sort);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchPayments, 10000);
});

// ------------------------------
// FETCH PAYMENTS
// ------------------------------
async function fetchPayments() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BACKEND_URL}/api/receipts/resident`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    allPayments = data.data || [];
    filteredPayments = [...allPayments];
    currentPage = 1;
    renderTable();

  } catch (err) {
    console.error(err);
    displayPayments([]);
  }
}

// ------------------------------
// SEARCH
// ------------------------------
function handleSearch(e) {
  const q = e.target.value.toLowerCase().trim();

  filteredPayments = allPayments.filter(p =>
    String(p.PaymentID).includes(q) ||
    (p.VerifiedDate &&
      new Date(p.VerifiedDate).toISOString().includes(q))
  );

  currentPage = 1;
  renderTable();
}

// ------------------------------
// SORT
// ------------------------------
function handleSort(column) {
  currentSort.asc = currentSort.column === column ? !currentSort.asc : true;
  currentSort.column = column;

  filteredPayments.sort((a, b) => {
    let A = a[column] ?? "";
    let B = b[column] ?? "";
    if (column === "VerifiedDate") {
      A = A ? new Date(A) : 0;
      B = B ? new Date(B) : 0;
    }
    return A < B ? (currentSort.asc ? -1 : 1) : A > B ? (currentSort.asc ? 1 : -1) : 0;
  });

  renderTable();
}

// ------------------------------
// TABLE RENDER
// ------------------------------
function renderTable() {
  const start = (currentPage - 1) * rowsPerPage;
  displayPayments(filteredPayments.slice(start, start + rowsPerPage));
  renderPagination();
}

// ------------------------------
function displayPayments(payments) {
  const tbody = document.getElementById("receiptsTableBody");
  tbody.innerHTML = "";

  if (!payments.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">No payments found</td></tr>`;
    return;
  }

  payments.forEach(p => {
    const tr = document.createElement("tr");

    let actionButtons = `
      <button class="previewBtn bg-blue-500 text-white px-3 py-1 rounded"
        data-id="${p.PaymentID}">Preview</button>
    `;

    if (userRole === "admin") {
      actionButtons += `
        <button class="verifyBtn bg-green-600 text-white px-3 py-1 rounded"
          data-id="${p.PaymentID}">
          Verify & Download
        </button>
      `;
    } else {
      actionButtons += `
        <button class="downloadBtn bg-gray-700 text-white px-3 py-1 rounded"
          data-id="${p.PaymentID}">
          Download
        </button>
      `;
    }

    tr.innerHTML = `
      <td class="px-4 py-2">${p.PaymentID}</td>
      <td class="px-4 py-2">KES ${p.PaidAmount}</td>
      <td class="px-4 py-2">${p.VerifiedDate ? new Date(p.VerifiedDate).toLocaleDateString() : "Pending"}</td>
      <td class="px-4 py-2 flex gap-2">${actionButtons}</td>
    `;

    tbody.appendChild(tr);
  });

  document.querySelectorAll(".previewBtn").forEach(b =>
    b.onclick = () => previewReceipt(b.dataset.id)
  );

  document.querySelectorAll(".verifyBtn").forEach(b =>
    b.onclick = () => verifyAndDownloadReceipt(b.dataset.id)
  );

  document.querySelectorAll(".downloadBtn").forEach(b =>
    b.onclick = () => downloadReceipt(b.dataset.id)
  );
}

// ------------------------------
// PAGINATION
// ------------------------------
function renderPagination() {
  const el = document.getElementById("paginationControls");
  el.innerHTML = "";
  const pages = Math.ceil(filteredPayments.length / rowsPerPage);
  if (pages <= 1) return;

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 border rounded ${i === currentPage ? "bg-blue-500 text-white" : ""}`;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    el.appendChild(btn);
  }
}

// ------------------------------
// PREVIEW
// ------------------------------
async function previewReceipt(paymentId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BACKEND_URL}/api/receipts/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const receipt = await res.json();
    showModal(receipt);
  } catch {
    alert("Failed to load receipt");
  }
}

// ------------------------------
// ADMIN: VERIFY + DOWNLOAD
// ------------------------------
async function verifyAndDownloadReceipt(paymentId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BACKEND_URL}/api/receipts/verify/${paymentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Verification failed");
      return;
    }

    generatePDF(data.receipt);
    await fetchPayments();

  } catch {
    alert("Verification error");
  }
}

// ------------------------------
// RESIDENT: DOWNLOAD ONLY
// ------------------------------
async function downloadReceipt(paymentId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BACKEND_URL}/api/receipts/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const receipt = await res.json();
    generatePDF(receipt);
  } catch {
    alert("Download failed");
  }
}

// ------------------------------
// MODAL
// ------------------------------
function showModal(r) {
  document.getElementById("receiptModal").classList.remove("hidden");
  document.getElementById("modalContent").innerHTML = `
    <p><strong>Receipt ID:</strong> ${r.PaymentID}</p>
    <p><strong>Amount:</strong> KES ${r.PaidAmount}</p>
    <p><strong>MPESA:</strong> ${r.MpesaReceipt}</p>
    <p><strong>Date:</strong> ${r.VerifiedDate || "-"}</p>
  `;
}

function closeModal() {
  document.getElementById("receiptModal").classList.add("hidden");
}

// ------------------------------
// PDF
// ------------------------------
function generatePDF(r) {
  const doc = new jsPDF();
  doc.text("Athi Estate Access Management System", 20, 20);
  doc.text(`Receipt ID: ${r.PaymentID}`, 20, 40);
  doc.text(`Paid Amount: KES ${r.PaidAmount}`, 20, 50);
  doc.text(`MPESA: ${r.MpesaReceipt}`, 20, 60);
  doc.text(`Date: ${r.VerifiedDate || "-"}`, 20, 70);
  doc.save(`Receipt_${r.PaymentID}.pdf`);
}
