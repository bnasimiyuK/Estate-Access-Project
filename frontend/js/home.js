    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("year").textContent = new Date().getFullYear();

      // Auth logic
      const loginBtn = document.getElementById("loginBtn");
      const logoutBtn = document.getElementById("logoutBtn");

      const token = localStorage.getItem("token");

      if (token) {
        // User logged in
        loginBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
      } else {
        // User not logged in
        loginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
      }

      // Redirect to login page
      loginBtn.addEventListener("click", () => {
        window.location.href = "login.html";
      });

      // Logout logic
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        alert("You have been logged out.");
        window.location.reload();
      });
    });