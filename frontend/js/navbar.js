// ✅ navbar.js — Unified Left-Sliding Sidebars for All Menus
document.addEventListener("DOMContentLoaded", async () => {
    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    try {
        // 💡 FIX APPLIED: Changed path to "partials/header.html" 
        // to resolve the 404 Not Found error, assuming the file is in a 'partials' folder.
        const res = await fetch("partials/header.html"); 
        
        if (!res.ok) throw new Error(`Header not found. Status: ${res.status}`);

        headerContainer.innerHTML = await res.text();
        
        // Ensure initializeNavbar runs after the DOM is fully updated
        setTimeout(() => initializeNavbar(), 50); // Reduced delay for faster UI load
    } catch (err) {
        console.error("❌ Navbar load failed:", err);
    }
});

function initializeNavbar() {
    const loginLink = document.getElementById("loginLink");
    const profileMenu = document.getElementById("profileMenu");
    const usernameDisplay = document.getElementById("usernameDisplay");

    const adminMenu = document.getElementById("adminMenu");
    const residentMenu = document.getElementById("residentMenu");
    const securityMenu = document.getElementById("securityMenu");

    // ✅ Fetch and clean localStorage values
    const usernameRaw = localStorage.getItem("username");
    const fullNameRaw = localStorage.getItem("fullName");
    const roleRaw = localStorage.getItem("role");
    const roleIdRaw = localStorage.getItem("roleId");
    const token = localStorage.getItem("token");

    const clean = (val) =>
        val && val !== "undefined" && val !== "null" && val.trim() !== ""
            ? val.trim()
            : "";

    const username = clean(usernameRaw);
    const fullName = clean(fullNameRaw);
    const role = clean(roleRaw).toLowerCase();
    const roleId = parseInt(clean(roleIdRaw) || "0");

    // ✅ Choose best display name
    const displayName = fullName || username || "User";

    // ✅ Always show public links initially
    document.querySelectorAll(".public-link").forEach((link) => link.classList.remove("hidden"));

    // 🟢 Logged-in user
    if (token && (role || roleId)) {
        loginLink?.classList.add("hidden");
        profileMenu?.classList.remove("hidden");
        if (usernameDisplay) usernameDisplay.textContent = displayName;

        // 🟢 ADMIN
        if (role === "admin" || roleId === 1) {
            // Ensure elements exist before modifying classList
            adminMenu?.classList.remove("hidden");
            residentMenu?.classList.remove("hidden");
            securityMenu?.classList.remove("hidden");
            
            // 💡 FIX 2: Set text for the menu button if it's empty
            if (residentMenu) residentMenu.textContent = "Resident Dashboard";
            if (securityMenu) securityMenu.textContent = "Security Dashboard";


            adminMenu?.addEventListener("click", () => openSidebar("Admin Dashboard", [
                { name: "Dashboard Overview", href: "dashboardoverview.html" },
                { name: "Membership Enrollment", href: "membership.html" },
                { name: "Membership Records", href: "membershiprecords.html" },
                { name: "Residents", href: "residents.html" },
                { name: "Visitor Access", href: "visitorsaccess.html" },
                { name: "Access Logs", href: "accesslogs.html" },
                { name: "Payments", href: "payments.html" },
            ]));

            residentMenu?.addEventListener("click", () => openSidebar("Resident Dashboard", [
                { name: "Dashboard Overview", href: "residentdashboardoverview.html" },
                { name: "Payments", href: "payments.html" },
                {name: "Resident Profiles", href: "residents.html"},
                { name: "Visitors Pre-Approval", href: "visitorsaccess.html" },
                { name: "Access Logs", href: "accesslogs.html" },
                { name: "Notifications", href: "notifications.html" },
            ]));

            securityMenu?.addEventListener("click", () => openSidebar("Security Dashboard", [
                { name: "Dashboard Overview", href: "securitydashboardoverview.html" },
                { name: "Access Logs", href: "accesslogs.html" },
                { name: "Visitor Management", href: "visitorsaccess.html" },
                { name: "Manual Gate Control", href: "manualgatecontrol.html" },
                { name: "Resident Management", href: "residents.html" },
                { name: "Payment Verification", href: "payments.html" },
                { name: "Reports & Analytics", href: "reportsanalysis.html"},
                { name: "Notification & Alerts", href: "notoficationalerts.html" },
                { name: "Security & Role Management", href: "securitydashboard" },
                { name: "System Integration", href: "systemintegration.html" },
            ]));
        }

        // 🟢 RESIDENT
        else if (role.includes("resident") || roleId === 2) {
            residentMenu?.classList.remove("hidden");
            
            // 💡 FIX 2: Set text for the menu button
            if (residentMenu) residentMenu.textContent = "Resident Dashboard";
            
            residentMenu?.addEventListener("click", () => openSidebar("Resident Dashboard", [
                { name: "Dashboard Overview", href: "residentdashboardoverview.html" },
                { name: "Payments", href: "payments.html" },
                {name: "Resident Profiles", href: "residents.html"},
                { name: "Visitors Pre-Approval", href: "visitorsaccess.html" },
                { name: "Access Logs", href: "accesslogs.html" },
                { name: "Notifications", href: "notifications.html" },
            ]));
        }

        // 🔵 SECURITY
        else if (role.includes("security") || roleId === 3) {
            securityMenu?.classList.remove("hidden");
            
            // 💡 FIX 2: Set text for the menu button
            if (securityMenu) securityMenu.textContent = "Security Dashboard";
            
            securityMenu?.addEventListener("click", () => openSidebar("Security Dashboard", [
                { name: "Dashboard Overview", href: "securitydashboardoverview.html" },
                { name: "Access Logs", href: "accesslogs.html" },
                { name: "Visitor Management", href: "visitorsaccess.html" },
                { name: "Manual Gate Control", href: "manualgate.html" },
                { name: "Resident Management", href: "residents.html" },
                { name: "Payment Verification", href: "payments.html" },
                { name: "Reports & Analytics", href: "reportsanalysis.html"},
                { name: "Notification & Alerts", href: "notificationalerts.html" },
                { name: "Security & Role Management", href: "securitydashboard" },
                { name: "System Integration", href: "systemintegration.html" },
            ]));
        }

        setupDropdown();
        setupLogoutButton();
        setupServicesSidebar();
    } else {
        // 🔴 Not logged in
        profileMenu?.classList.add("hidden");
        loginLink?.classList.remove("hidden");
        adminMenu?.classList.add("hidden");
        residentMenu?.classList.add("hidden");
        securityMenu?.classList.add("hidden");
    }
}

/* ======================================================
    🧭 Shared Sidebar Handler
====================================================== */
function openSidebar(title, links) {
    const sidebar = document.getElementById("sidebarMenu");
    const titleEl = document.getElementById("sidebarTitle");
    const linksEl = document.getElementById("sidebarLinks");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar || !titleEl || !linksEl || !overlay) {
        console.error("Sidebar elements not found.");
        return;
    }
    
    titleEl.textContent = title;
    linksEl.innerHTML = links
        .map(
            (l) =>
                `<a href="${l.href}" class="block px-6 py-3 text-gray-200 hover:bg-gray-700 hover:text-yellow-400 transition">${l.name}</a>`
        )
        .join("");

    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    overlay.addEventListener("click", closeSidebar);
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebarMenu");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar || !overlay) return;
    
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
}

/* ======================================================
    🟡 Services Sidebar (Left Slide)
====================================================== */
function setupServicesSidebar() {
    const btn = document.getElementById("servicesBtn");
    const sidebar = document.getElementById("servicesSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const linksEl = document.getElementById("servicesSidebarLinks");
    const closeBtn = document.getElementById("closeServicesSidebar");

    if (!btn || !sidebar || !overlay || !linksEl || !closeBtn) return; // Added null checks here

    const links = [
        { name: "Visitor Pre-Approval", href: "visitor-pre-approval.html" },
        { name: "Payment Status", href: "payments.html" },
        { name: "Estate Announcements", href: "estate-announcements.html" },
        { name: "Resident Portal", href: "resident-portal.html" },
        { name: "Generate Visitor Pass", href: "generate-access-pass.html" },
    ];

    btn.addEventListener("click", () => {
        linksEl.innerHTML = links
            .map(
                (l) =>
                    `<a href="${l.href}" class="block px-6 py-3 text-gray-200 hover:bg-gray-700 hover:text-yellow-400 transition">${l.name}</a>`
            )
            .join("");
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
    });

    const close = () => {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
    };

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
}

/* ======================================================
    🔽 Profile Dropdown + Logout
====================================================== */
function setupDropdown() {
    const btn = document.getElementById("profileBtn");
    const menu = document.getElementById("dropdownMenu");
    const parent = document.getElementById("profileMenu");

    if (!btn || !menu || !parent) return; // Added check for parent (profileMenu)

    btn.addEventListener("click", () => menu.classList.toggle("hidden"));
    document.addEventListener("click", (e) => {
        // Check if the click is outside the entire profile menu wrapper
        if (!parent.contains(e.target)) menu.classList.add("hidden"); 
    });
}

function setupLogoutButton() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.clear();
            alert("✅ You have been logged out successfully.");
            window.location.href = "login.html";
        }
    });
}