// =====================================
// auth.js — Universal Authentication & API Handling
// =====================================

const base = "http://localhost:4050/api";

// -----------------------------
// Resident Registration
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("📘 auth.js loaded");

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const resident = {
        FullName: document.getElementById("regFullName").value.trim(),
        Email: document.getElementById("regEmail").value.trim(),
        Password: document.getElementById("regPassword").value,
        HouseNumber: document.getElementById("regHouse").value.trim(),
      };

      try {
        const res = await apiFetch(`${base}/auth/register`, {
          method: "POST",
          body: JSON.stringify(resident),
        });

        alert("Registered successfully. Please log in.");
        window.location.href = "login.html";
      } catch (err) {
        alert(err.message || "Error during registration");
      }
    });
  }
});

// =====================================
// Universal API Fetch with Token & Refresh
// =====================================
export async function apiFetch(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) {
    localStorage.clear();
    window.location.href = "login.html";
    throw new Error("Authentication token missing");
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  options.headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  let res = await fetch(url, options);

  // 401 → Token expired → refresh
  if (res.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(`${base}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        localStorage.clear();
        window.location.href = "login.html";
        throw new Error("Refresh token expired. Please log in again.");
      }

      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.accessToken);

      // Retry original request with new token
      options.headers["Authorization"] = `Bearer ${data.accessToken}`;
      res = await fetch(url, options);
    } catch (err) {
      localStorage.clear();
      window.location.href = "login.html";
      throw new Error("Token refresh failed. Please log in again.");
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return res.json();
}

// =====================================
// Protect Page Helper
// =====================================
export function protectPage() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("Authentication token missing. Please log in.");
    localStorage.clear();
    window.location.href = "login.html";
  }
}
