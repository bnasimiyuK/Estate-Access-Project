console.log("📘 payment.js loaded");

// ==============================
// ✅ CONFIG
// ==============================
const BASE_URL = "http://localhost:4050/api/payments";

const residentSelect = document.getElementById("residentId");
const msgDiv = document.getElementById("msg");
const paymentsBody = document.getElementById("paymentsBody");
const verifiedBody = document.getElementById("verifiedBody");
const balanceBody = document.getElementById("balanceBody");

// ==============================
// ✅ LOAD RESIDENTS
// ==============================
async function loadResidents() {
  try {
    const res = await fetch(`${BASE_URL}/residents/all`);
    if (!res.ok) throw new Error("Failed to fetch residents");

    const data = await res.json();
    residentSelect.innerHTML = `<option value="">Select Resident ID</option>`;
    data.forEach((r) => {
      residentSelect.innerHTML += `<option value="${r.ResidentID}">${r.ResidentID} - ${r.ResidentName}</option>`;
    });
    console.log("Residents:", data);
  } catch (err) {
    console.error("❌ Error loading residents:", err);
  }
}

// ==============================
// ✅ LOAD PAYMENT HISTORY
// ==============================
async function loadPayments() {
  try {
    const res = await fetch(`${BASE_URL}`);
    if (!res.ok) throw new Error("Failed to fetch payments");

    const data = await res.json();
    renderPayments(data);
  } catch (err) {
    console.error("❌ Error loading payments:", err);
  }
}

function renderPayments(payments) {
  paymentsBody.innerHTML = "";
  payments.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-2 py-1">${p.PaymentID}</td>
      <td class="px-2 py-1">${p.ResidentID}</td>
      <td class="px-2 py-1">${p.Amount}</td>
      <td class="px-2 py-1">${new Date(p.PaymentDate).toLocaleDateString()}</td>
      <td class="px-2 py-1">${p.Status}</td>
      <td class="px-2 py-1">${p.Reference}</td>
      <td class="px-2 py-1">${p.PaymentMethod}</td>
      <td class="px-2 py-1">
        ${
          p.Status === "Pending"
            ? `<button class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded verify-btn" data-id="${p.PaymentID}">Verify</button>`
            : `<span class="text-green-600 font-semibold">Verified</span>`
        }
      </td>
    `;
    paymentsBody.appendChild(row);
  });

  document.querySelectorAll(".verify-btn").forEach((btn) => {
    btn.addEventListener("click", () => verifyPayment(btn.dataset.id));
  });
}

// ==============================
// ✅ LOAD VERIFIED PAYMENTS
// ==============================
async function loadVerifiedPayments() {
  try {
    const res = await fetch(`${BASE_URL}/verifiedpayments`);
    if (!res.ok) throw new Error("Failed to fetch verified payments");

    const data = await res.json();
    verifiedBody.innerHTML = "";
    data.forEach((v) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-2 py-1">${v.PaymentID}</td>
        <td class="px-2 py-1">${v.ResidentID}</td>
        <td class="px-2 py-1">${v.ResidentName}</td>
        <td class="px-2 py-1">${v.Amount}</td>
        <td class="px-2 py-1">${v.Reference}</td>
        <td class="px-2 py-1">${new Date(v.VerifiedDate).toLocaleDateString()}</td>
      `;
      verifiedBody.appendChild(row);
    });
    console.log("Verified Payments:", data);
  } catch (err) {
    console.error("❌ Error loading verified payments:", err);
  }
}

// ==============================
// ✅ LOAD BALANCES
// ==============================
async function loadBalances() {
  try {
    const res = await fetch(`${BASE_URL}/balances`);
    if (!res.ok) throw new Error("Failed to fetch balances");

    const data = await res.json();
    balanceBody.innerHTML = "";
    data.forEach((b) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-2 py-1">${b.ResidentName} (${b.ResidentID})</td>
        <td class="px-2 py-1">KSh ${b.TotalPaid}</td>
        <td class="px-2 py-1">KSh ${b.TotalDue}</td>
        <td class="px-2 py-1 font-semibold ${b.Balance > 0 ? "text-red-600" : "text-green-600"}">KSh ${b.Balance}</td>
      `;
      balanceBody.appendChild(row);
    });
    console.log("Balances:", data);
  } catch (err) {
    console.error("❌ Error loading balances:", err);
  }
}

// ==============================
// ✅ VERIFY PAYMENT
// ==============================
async function verifyPayment(paymentId) {
  try {
    const res = await fetch(`${BASE_URL}/verify/${paymentId}`, { method: "POST" });
    const data = await res.json();

    alert(data.message || "Payment verified successfully!");
    loadPayments();
    loadVerifiedPayments();
    loadBalances();
  } catch (err) {
    console.error("❌ Error verifying payment:", err);
  }
}

// ==============================
// ✅ MAKE NEW PAYMENT
// ==============================
document.getElementById("makePaymentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ResidentID = residentSelect.value;
  const Amount = parseFloat(document.getElementById("amount").value);
  const PaymentMethod = document.getElementById("paymentMethod").value;
  const Reference = document.getElementById("reference").value.trim();

  if (!ResidentID || !Amount || !PaymentMethod || !Reference) {
    msgDiv.textContent = "⚠️ Please fill in all fields.";
    msgDiv.className = "text-red-600 text-sm mt-2";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/make`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ResidentID, Amount, PaymentMethod, Reference }),
    });
    const data = await res.json();

    msgDiv.textContent = data.message || "✅ Payment submitted successfully!";
    msgDiv.className = "text-green-600 text-sm mt-2";
    e.target.reset();

    loadPayments();
    loadBalances();
  } catch (err) {
    console.error("❌ Error submitting payment:", err);
    msgDiv.textContent = "❌ Error submitting payment.";
    msgDiv.className = "text-red-600 text-sm mt-2";
  }
});

// ==============================
// ✅ FILTER & EXPORT
// ==============================
document.getElementById("filterInput").addEventListener("input", (e) => {
  const filter = e.target.value.toLowerCase();
  paymentsBody.querySelectorAll("tr").forEach((row) => {
    const residentId = row.children[1].textContent.toLowerCase();
    row.style.display = residentId.includes(filter) ? "" : "none";
  });
});

document.getElementById("exportCsv").addEventListener("click", () => exportTableToCSV("payments.csv"));

// Multi-sheet Excel Export
document.getElementById("exportExcel").addEventListener("click", () => {
  const wb = XLSX.utils.book_new();

  // Payment History
  const paymentsTable = document.getElementById("paymentsTable");
  const ws1 = XLSX.utils.table_to_sheet(paymentsTable);
  XLSX.utils.book_append_sheet(wb, ws1, "Payment History");

  // Verified Payments
  const verifiedTable = document.getElementById("verifiedTable");
  const ws2 = XLSX.utils.table_to_sheet(verifiedTable);
  XLSX.utils.book_append_sheet(wb, ws2, "Verified Payments");

  // Balances
  const balanceTable = document.getElementById("balanceTable");
  const ws3 = XLSX.utils.table_to_sheet(balanceTable);
  XLSX.utils.book_append_sheet(wb, ws3, "Balances");

  // Save workbook
  XLSX.writeFile(wb, "EstatePayments.xlsx");
});

function exportTableToCSV(filename) {
  const rows = document.querySelectorAll("#paymentsTable tr");
  const csv = Array.from(rows)
    .map((row) => Array.from(row.children).map((cell) => cell.textContent).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ==============================
// ✅ INITIAL LOAD
// ==============================
window.addEventListener("DOMContentLoaded", async () => {
  await loadResidents();
  await loadPayments();
  await loadVerifiedPayments();
  await loadBalances();
});
