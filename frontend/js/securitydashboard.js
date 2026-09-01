/**
 * securitydashboard.js
 *
 * This script handles:
 * 1. Asynchronously loading content into the main area based on sidebar clicks.
 * 2. Initializing the dashboard by loading the default content.
 * 3. Handling the user profile dropdown and logout functionality.
 */

// ================================
// 0️⃣ Utility Function: Get Logged-in User Name
// ================================
const getLoggedInUserName = () => {
    // Retrieves the user's name from localStorage, prioritizing 'userName' or 'fullName'.
    // Defaults to 'Security Officer' if no key is found.
    return localStorage.getItem("userName") || localStorage.getItem("fullName") || "Security Officer";
};


// ================================
// 1️⃣ Content Loading Function
// ================================

/**
 * Loads an HTML fragment from a given URL into the main content area.
 * @param {string} url - The URL of the HTML fragment to load.
 */
async function loadContent(url) {
    const mainContentArea = document.getElementById("main-content-area");
    if (!mainContentArea) {
        console.error("Main content area element not found.");
        return;
    }

    // Display a loading spinner while fetching content
    mainContentArea.innerHTML = 
        `<div class="text-center p-10 text-gray-500">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto mb-3"></div>
            <p>Loading ${url}...</p>
        </div>`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const htmlContent = await response.text();
        mainContentArea.innerHTML = htmlContent;

        // ⚠️ IMPORTANT: <script> tags inside HTML injected via innerHTML do NOT
        // execute automatically — this is a browser security restriction, not a bug.
        // Without this step, files like payment.js, navbar.js, etc. would silently
        // never run whenever their page is loaded through this SPA shell, which is
        // why fetched data (e.g. payment history) previously appeared empty.
        //
        // Fix: manually re-create each <script> tag so the browser actually runs it.
        const scripts = Array.from(mainContentArea.querySelectorAll("script"));
        for (const oldScript of scripts) {
            const newScript = document.createElement("script");

            // Copy any attributes (e.g. src, type)
            for (const attr of oldScript.attributes) {
                newScript.setAttribute(attr.name, attr.value);
            }

            if (oldScript.src) {
                // External script: wait for it to finish loading before moving to
                // the next one, so scripts that depend on load order (e.g.
                // payment.js before navbar.js) still run correctly.
                await new Promise((resolve, reject) => {
                    newScript.onload = resolve;
                    newScript.onerror = reject;
                    oldScript.replaceWith(newScript);
                });
            } else {
                // Inline script: just copy its content over.
                newScript.textContent = oldScript.textContent;
                oldScript.replaceWith(newScript);
            }
        }

    } catch (error) {
        console.error("❌ Failed to load content:", error);
        mainContentArea.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error loading content!</strong>
                <span class="block sm:inline">Could not load: ${url}</span>
                <p class="text-sm mt-1">Check the file path and server configuration.</p>
            </div>
        `;
    }
}

// ================================
// 2️⃣ Initialization & Event Handlers
// ================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🛡️ Security Dashboard Initialized");

    const sidebarButtons = document.querySelectorAll(".sidebarBtn");
    const userMenuBtn = document.getElementById("userMenuBtn");
    const userMenuDropdown = document.getElementById("userMenuDropdown");
    const logoutBtn = document.getElementById("logoutBtn");
    const loggedInUserName = document.getElementById("loggedInUserName");
    
    // Retrieve the dynamic user name
    const userName = getLoggedInUserName();

    // -------------------------------
    // Setup User Display
    // -------------------------------
    if (loggedInUserName) {
        loggedInUserName.textContent = userName;
    }

    // -------------------------------
    // Sidebar Navigation Logic
    // -------------------------------
    sidebarButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const targetUrl = event.currentTarget.getAttribute("data-target");
            
            // Update active state
            sidebarButtons.forEach(btn => btn.classList.remove('bg-gray-700', 'font-bold'));
            event.currentTarget.classList.add('bg-gray-700', 'font-bold');

            // Load the new content
            loadContent(targetUrl);
        });
    });

    // -------------------------------
    // User Dropdown Logic
    // -------------------------------
    userMenuBtn.addEventListener('click', () => {
        userMenuDropdown.classList.toggle('hidden');
    });

    // Close the dropdown if the user clicks outside of it
    document.addEventListener('click', (event) => {
        if (!userMenuBtn.contains(event.target) && !userMenuDropdown.contains(event.target)) {
            userMenuDropdown.classList.add('hidden');
        }
    });

    // -------------------------------
    // Logout Handler (Fixed) 🚪
    // -------------------------------
    logoutBtn.addEventListener('click', () => {
        console.log("Logging out user...");
        
        // Clear authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userName'); 
        localStorage.removeItem('fullName');
        
        // Redirect to the login page immediately
        window.location.href = 'login.html'; 
    });

    // -------------------------------
    // Initial Load: Dashboard Overview
    // -------------------------------
    const defaultDashboardBtn = document.querySelector('[data-tab="dashboard"]');
    if (defaultDashboardBtn) {
        // Automatically click the Dashboard button on load
        defaultDashboardBtn.click();
    } else {
        loadContent('securitydashboardoverview.html');
    }
});