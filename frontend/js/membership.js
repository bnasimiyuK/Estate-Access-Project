console.log("membership.js loaded");
// Use whatever host this page was loaded from (localhost, LAN IP, or a real
// domain later) instead of hardcoding 'localhost', so this also works when
// the page is opened from a phone or any other device on the network.
const API_BASE = `http://${window.location.hostname}:4050`;

// ---------------- Helper to show messages ----------------
function displayMessage(msg, type = "info") {
  const el = document.getElementById("feedbackMessage");
  if (!el) return;

  el.textContent = msg;
  el.className = "mt-2 text-center p-2 rounded";

  if (type === "success") el.classList.add("bg-green-100", "text-green-700");
  else if (type === "error") el.classList.add("bg-red-100", "text-red-700");
  else el.classList.add("bg-gray-200", "text-gray-800");

  setTimeout(() => {
    el.textContent = "";
    el.className = "mt-2 text-center p-2 rounded text-sm";
  }, 4000);
}

// ---------------- Load courts from API ----------------
async function loadCourts() {
  const dropdown = document.getElementById("courtDropdown");
  dropdown.innerHTML = '<option value="">Loading courts...</option>';
  try {
    const response = await axios.get(`${API_BASE}/api/courts/all`);
    if (!Array.isArray(response.data)) throw new Error("Invalid response");

    dropdown.innerHTML = '<option value="">Select Court</option>';
    response.data.forEach(court => {
      dropdown.innerHTML += `<option value="${court.CourtName}">${court.CourtName}</option>`;
    });
  } catch (err) {
    console.error("Failed to load courts", err);
    dropdown.innerHTML = '<option disabled>Failed to load courts</option>';
    displayMessage("Failed to load courts", "error");
  }
}

// ---------------- Format Kenyan phone number ----------------
function formatKenyanPhone(phone) {
  if (!phone) return null;
  phone = phone.toString().trim();

  if (phone.startsWith("0") && phone.length === 10) {
    return "254" + phone.slice(1); // 07XXXXXXXX -> 2547XXXXXXXX
  }
  if (phone.startsWith("+254") && phone.length === 13) {
    return phone.slice(1); // +2547XXXXXXXX -> 2547XXXXXXXX
  }
  if (phone.startsWith("254") && phone.length === 12) {
    return phone; // already correct
  }
  return null; // invalid format
}

// ---------------- Form validation ----------------
function validateForm() {
  const fullName = document.getElementById("ResidentName").value.trim();
  const nationalId = document.getElementById("NationalID").value.trim();
  const phone = document.getElementById("PhoneNumber").value.trim();
  const email = document.getElementById("Email").value.trim();

  const nameRegex = /^[A-Z][a-zA-Z\s]*$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const formattedPhone = formatKenyanPhone(phone);

  if (!nameRegex.test(fullName)) {
    displayMessage("Full Name must start with a capital letter and contain only letters.", "error");
    return false;
  }

  if (!/^\d{8}$/.test(nationalId)) {
    displayMessage("National ID must be exactly 8 digits.", "error");
    return false;
  }

  if (!formattedPhone) {
    displayMessage("Phone number must start with +254XXXXXXXXX or 0XXXXXXXXX", "error");
    return false;
  }

  if (!emailRegex.test(email)) {
    displayMessage("Email must be valid.", "error");
    return false;
  }

  return true;
}

// ---------------- Handle form submission ----------------
async function submitForm(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const data = {
    ResidentName: document.getElementById("ResidentName").value.trim(),
    NationalID: document.getElementById("NationalID").value.trim(),
    PhoneNumber: formatKenyanPhone(document.getElementById("PhoneNumber").value.trim()),
    Email: document.getElementById("Email").value.trim(),
    HouseNumber: document.getElementById("HouseNumber").value.trim(),
    CourtName: document.getElementById("courtDropdown").value.trim(),
    RoleName: document.getElementById("RoleName").value.trim(),
    Action: document.getElementById("Action").value.trim(),
  };

  try {
    const response = await axios.post(`${API_BASE}/api/membership/request`, data);
    if (response.status === 200) {
      displayMessage("Membership request submitted successfully!", "success");
      document.getElementById("membershipForm").reset();
    } else {
      displayMessage("Unexpected response from server", "error");
    }
  } catch (err) {
    console.error(err);
    const errorMessage = err.response?.data?.message || err.message || "Submission failed";
    displayMessage(errorMessage, "error");
  }
}

// ---------------- Bulk upload ----------------
async function uploadBulk() {
  const fileInput = document.getElementById("bulkFile");
  if (!fileInput.files.length) {
    displayMessage("Please select a CSV file", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await axios.post(`${API_BASE}/api/membership/bulk`, formData, { 
      headers: { "Content-Type": "multipart/form-data" } 
    });
    displayMessage(`Uploaded: ${res.data.inserted}, Failed: ${res.data.failed}`, "success");
    console.table(res.data.errors);
  } catch (err) {
    console.error(err);
    displayMessage("Bulk upload failed", "error");
  }
}

// ---------------- Download CSV template ----------------
function downloadTemplate() {
  const headers = ["ResidentName", "NationalID", "PhoneNumber", "Email", "HouseNumber", "CourtName", "RoleName", "Action"];
  const csvContent = headers.join(",") + "\n";

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bulk_membership_template.csv";
  link.click();
}

// ---------------- Init ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadCourts();
  document.getElementById("membershipForm").addEventListener("submit", submitForm);
  document.getElementById("uploadBulkBtn").addEventListener("click", uploadBulk);
  document.getElementById("downloadTemplateBtn").addEventListener("click", downloadTemplate);
});