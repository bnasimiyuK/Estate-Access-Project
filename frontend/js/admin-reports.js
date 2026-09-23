/* ============================================================
   ADMIN REPORTS
   Requires shared-api.js and Chart.js to be loaded first.
   ============================================================ */

document.addEventListener("DOMContentLoaded", loadReport);

async function loadReport() {
    const stateEl = document.getElementById("reportState");
    const gridEl = document.getElementById("reportGrid");

    try {
        const [bookings, complaints, providers] = await Promise.all([
            getBookings(),
            getComplaints(),
            getProviders()
        ]);

        stateEl.style.display = "none";
        gridEl.style.display = "grid";

        renderBookingsChart(bookings);
        renderComplaintsChart(complaints);
        renderPerformanceTable(providers, bookings, complaints);
        renderComplaintsTable(complaints, providers);

    } catch (error) {
        stateEl.className = "state error";
        stateEl.textContent = "Couldn't load report data: " + error.message;
    }
}

function renderBookingsChart(bookings) {
    const statusCounts = { pending: 0, accepted: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => { if (statusCounts[b.status] !== undefined) statusCounts[b.status]++; });

    new Chart(document.getElementById("bookingsChart"), {
        type: "doughnut",
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{ data: Object.values(statusCounts), backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444"] }]
        },
        options: { plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } } }
    });
}

function renderComplaintsChart(complaints) {
    const categories = {};
    complaints.forEach(c => { categories[c.category] = (categories[c.category] || 0) + 1; });

    const labels = Object.keys(categories).length ? Object.keys(categories) : ["No complaints"];
    const data = Object.values(categories).length ? Object.values(categories) : [0];

    new Chart(document.getElementById("complaintsChart"), {
        type: "bar",
        data: { labels, datasets: [{ data, backgroundColor: "#1d4ed8" }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

function renderPerformanceTable(providers, bookings, complaints) {
    document.getElementById("performanceTable").innerHTML = providers
        .map(p => {
            const providerBookings = bookings.filter(b => b.providerId === p.id);
            const completed = providerBookings.filter(b => b.status === "completed").length;
            const providerComplaints = complaints.filter(c => c.providerId === p.id).length;
            return { p, total: providerBookings.length, completed, providerComplaints };
        })
        .sort((a, b) => b.p.rating - a.p.rating)
        .map(row => `
            <tr>
                <td>${escapeHTML(row.p.businessName)}</td>
                <td>${escapeHTML(row.p.category)}</td>
                <td>${row.p.rating}</td>
                <td>${row.total}</td>
                <td>${row.completed}</td>
                <td>${row.providerComplaints}</td>
            </tr>
        `).join("") || `<tr><td colspan="6" class="state">No providers yet.</td></tr>`;
}

function renderComplaintsTable(complaints, providers) {
    document.getElementById("complaintsTable").innerHTML = complaints.length
        ? complaints.map(c => {
            const provider = providers.find(p => p.id === c.providerId);
            return `
                <tr>
                    <td>${escapeHTML(c.createdAt)}</td>
                    <td>${escapeHTML(provider ? provider.businessName : "—")}</td>
                    <td>${escapeHTML(c.category)}</td>
                    <td>${escapeHTML(c.status)}</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="4" class="state">No complaints logged.</td></tr>`;
}
