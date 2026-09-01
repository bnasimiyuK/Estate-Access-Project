// residentdashboardoverview.js
// Base URL for the API
const API_BASE_URL = "http://localhost:4050/api";

// -----------------------------
// DOM Elements
// -----------------------------
const currentPaymentStatus = document.getElementById("currentPaymentStatus");
const nextPaymentDueDate = document.getElementById("nextPaymentDueDate");
const accessPrivileges = document.getElementById("accessPrivileges");
const accessChartEl = document.getElementById("accessChart");

// -----------------------------
// Helper: Get Auth Headers
// -----------------------------
/**
 * Retrieves the authorization token from Local Storage.
 * Redirects to the login page if the token is missing.
 * @returns {HeadersInit} The headers object with Content-Type and Authorization.
 */
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Authentication token missing. Redirecting to login.");
        // Stop execution and force a redirect if the crucial token is gone
        window.location.href = 'login.html'; 
        // Return an empty object so the function doesn't crash, 
        // though the redirect prevents the subsequent fetch.
        return {}; 
    }
    
    // The previously misplaced closing brace '}' was here, 
    // prematurely ending the function. It is now correctly placed below.
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
} // <--- Correct closing brace for getAuthHeaders

// -----------------------------
// Fetch resident operations data
// -----------------------------
/**
 * Fetches the primary resident overview data from the API.
 * Requires both ResidentID and a valid token.
 */
async function fetchResidentOverview() {
    const residentId = localStorage.getItem("ResidentID");
    
    // Check for both ResidentID and Token. 
    // Note: getAuthHeaders() already checks and redirects on missing token, 
    // but checking ResidentID here is essential since it's used in the URL.
    if (!residentId) {
        console.error("Resident ID not found in local storage. Redirecting to login.");
        window.location.href = 'login.html';
        return;
    }

    // Endpoint tailored for a single resident's overview
    const overviewUrl = `${API_BASE_URL}/residents/${residentId}/overview`;

    try {
        // getAuthHeaders() will redirect if the token is missing
        const headers = getAuthHeaders();

        // If getAuthHeaders() redirects, this fetch won't execute.
        const response = await fetch(overviewUrl, {
            headers: headers
        });
        
        if (!response.ok) {
            // Handle 401 Unauthorized or other HTTP errors
            throw new Error(`Failed to fetch overview: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Ensure data structure matches expected keys
        const overviewData = data.data || data; 

        // Update DOM
        currentPaymentStatus.textContent = overviewData.currentPaymentStatus || "N/A";
        nextPaymentDueDate.textContent = overviewData.nextPaymentDueDate || "N/A";
        accessPrivileges.textContent = overviewData.accessPrivileges || "0%"; 

    } catch (error) {
        console.error("❌ Error fetching resident overview data:", error);

        currentPaymentStatus.textContent = "Error";
        nextPaymentDueDate.textContent = "Error";
        accessPrivileges.textContent = "Error";
    }
}

// -----------------------------
// Render access chart
// -----------------------------
/**
 * Fetches access log data and renders a chart using the Chart.js library.
 */
async function renderAccessChart() {
    if (!accessChartEl) return;
    
    const residentId = localStorage.getItem("ResidentID");
    // If ID is missing, we stop here (the overview fetch should handle the redirect)
    if (!residentId) return;

    // Endpoint for access logs/chart data (Example: last 7 days)
    const chartUrl = `${API_BASE_URL}/accesslogs/${residentId}/weekly-summary`;
    let chartData = { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [0, 0, 0, 0, 0, 0, 0] };

    try {
        const response = await fetch(chartUrl, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const apiData = await response.json();
            // Assuming API returns { labels: [...], data: [...] }
            if (apiData.labels && apiData.data) {
                chartData.labels = apiData.labels;
                chartData.data = apiData.data;
            }
        }
    } catch (error) {
        console.warn("Could not fetch chart data, using default:", error);
        // Fallback to default/mock data if API call fails
    }

    // Ensure Chart.js is loaded before trying to use 'new Chart'
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library is not loaded.");
        return;
    }

    const ctx = accessChartEl.getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: chartData.labels,
            datasets: [{
                label: "Access Attempts",
                data: chartData.data,
                borderColor: "rgba(37, 99, 235, 1)",
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                tension: 0.3,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allows the chart to respect the CSS height
            plugins: {
                legend: { display: true, position: "top" },
                tooltip: { enabled: true }
            },
            scales: {
                y: { beginAtZero: true, stepSize: 1 },
            }
        }
    });
}

// -----------------------------
// Initialize
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
    fetchResidentOverview();
    renderAccessChart();
});