document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role") || "resident";
    const roleId = Number(localStorage.getItem("roleId")) || 2;
    
    // Get the current page filename (e.g., "admindashboard.html")
    const currentPage = window.location.pathname.split("/").pop();

    // 💡 DEBUG LOGGING ADDED HERE
    console.log("--- GUARD CHECK DATA ---");
    console.log(`Stored Role: ${storedRole}`);
    console.log(`Stored Role ID: ${roleId}`);
    console.log(`Current Page: ${currentPage}`);
    console.log("------------------------");
    // 💡 END DEBUG LOGGING
    
    if (!token) {
        alert("Please log in to access this page.");
        window.location.href = "login.html";
        return;
    }

    // Normalize role
    const displayRole = storedRole.toString().trim();
    const normalizedRole = displayRole.toLowerCase();

    const accessRules = {
        // Admin's array is maintained for reference but not strictly used in the logic below
        admin: [
            "dashboardoverview.html",
            "admindashboard.html", 
            "residents.html",
            "payments.html",
            "reports.html",
            "membership.html",
            "membershiprecords.html",
            "verifiedpayments.html",
            "visitorsaccesss.html"
        ],
        security: [
            "securitydashboard.html", 
            "visitorapprovals.html",
            "securitylogs.html"
        ],
        resident: [
            "residentdashboard.html", // Crucial: Check for typos here
            "residents.html",
            "payments.html",
            "verifiedpayments.html",
            "reports.html",
            "residentdashboardoverview.html"
        ],
    };

    const isAllowed = () => {
        // 1. 👑 Admin Check: Returns true to grant access to ALL pages.
        if (normalizedRole === "admin" || roleId === 1) {
            return true; 
        }
        
        // 2. 👮 Security Check: Allows access only to pages in the security array.
        if (normalizedRole === "security" || roleId === 3) {
            // Check if the current page is in the Security access list
            return accessRules.security.includes(currentPage);
        }
        
        // 3. 🏠 Resident Check: Allows access only to pages in the resident array.
        if (normalizedRole === "resident" || roleId === 2) {
            // Check if the current page is in the Resident access list
            return accessRules.resident.includes(currentPage);
        }
        
        // Default deny for unhandled roles
        return false;
    };

    // Check if the user is authorized to view the current page
    if (!isAllowed()) {
        // 💡 Add the check result to the console output
        const pageIsAllowed = accessRules[normalizedRole]?.includes(currentPage) || false;

        alert("🚫 Access denied. You are not authorized to view this page.");
        console.error(`Access Denied! 
        Role: ${displayRole} (Normalized: ${normalizedRole})
        Attempted Page: ${currentPage} 
        Rule Match: ${pageIsAllowed} (Expected: true)`);
        
        window.location.href = "unauthorized.html";
        return;
    }

    console.log(`✅ Access granted | Role: ${displayRole} | RoleID: ${roleId} | Page: ${currentPage}`);
});