// REGISTER RESIDENT
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const houseNumber = document.getElementById("houseNumber").value;

    const res = await fetch("http://127.0.0.1:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, houseNumber }),
    });
    const data = await res.json();
    const msg = document.getElementById("regMsg");
    msg.textContent = data.message;
    msg.className = data.success ? "text-green-600" : "text-red-600";
  });
}

// LOGIN RESIDENT
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch("http://127.0.0.1:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    const msg = document.getElementById("loginMsg");
    msg.textContent = data.success ? `Welcome, ${data.resident.FullName}!` : data.message;
    msg.className = data.success ? "text-green-600" : "text-red-600";
  });
}
