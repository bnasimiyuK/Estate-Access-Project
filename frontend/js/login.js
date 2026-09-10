document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  // Choose the right backend depending on where this page is being loaded from:
  // - Deployed (GitHub Pages, or any real domain) -> always use the live Vercel backend,
  //   so ANY device (phone, laptop, anywhere with internet) can log in
  // - Opened locally (localhost or a LAN IP like 192.168.x.x) -> use the local dev
  //   server, so phones on the same WiFi can still hit your laptop during development
  const DEPLOYED_API_URL = "https://estate-access-project.vercel.app";

  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname);

  const API_URL = isLocalHost
    ? `http://${window.location.hostname}:4050`
    : DEPLOYED_API_URL;

  // Map roles to dashboard pages
  const ROLES = {
    ADMIN: { id: 1, name: "admin", page: "admindashboard.html" },
    RESIDENT: { id: 2, name: "resident", page: "residentdashboard.html" },
    SECURITY: { id: 3, name: "security", page: "securitydashboard.html" },
  };

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const Email = document.getElementById("Email").value.trim();
    const Password = document.getElementById("Password").value.trim();

    if (!Email || !Password) {
      alert("Please enter both Email and Password.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email, Password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || res.statusText || "Server error during login.";
        alert(errorMessage);
        console.error("Login Failed:", res.status, errorMessage);
        return;
      }

      const data = await res.json();
      console.log("Login data:", data);

      if (!data.accessToken) {
        alert(data.message || "Invalid email or password.");
        return;
      }

      // Normalize role string safely
      let roleString = data.role;
      if (Array.isArray(roleString)) roleString = roleString[0];
      const normalizedRole = (roleString?.toString().toLowerCase() || ROLES.RESIDENT.name);
      const finalRole = Object.values(ROLES).find(r => r.name === normalizedRole) || ROLES.RESIDENT;

      // User display name fallback
      const userDisplayName = data.fullName || data.FullName || "User";

      // Store core info in localStorage
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("role", finalRole.name);
      localStorage.setItem("roleId", finalRole.id);
      localStorage.setItem("fullName", userDisplayName);
      localStorage.setItem("userId", data.userId);

      // Resident-specific info
      if (finalRole.name === "resident") {
        if (!data.ResidentID) {
          console.warn("Backend did not return ResidentID for resident user");
          localStorage.setItem("ResidentID", data.userId); // fallback
        } else {
          localStorage.setItem("ResidentID", data.ResidentID);
        }
        localStorage.setItem("PhoneNumber", data.PhoneNumber || "");
      }

      // Redirect to dashboard
      window.location.href = finalRole.page;

    } catch (err) {
      console.error("Login Network Error:", err);
      alert("Login failed. Could not connect to the authentication server.");
    }
  });
});