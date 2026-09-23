/* ============================================================
   ADMIN DASHBOARD
   Requires shared-api.js to be loaded first.
   ============================================================ */

let providersCache = [];
let bookingsCache = [];
let complaintsCache = [];
let referralsCache = [];

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
});

function badgeClass(status) {
    return "badge-" + status.toLowerCase().replace(/\s+/g, "");
}

document.addEventListener("DOMContentLoaded", loadAll);

async function loadAll() {
    try {
        [providersCache, bookingsCache, complaintsCache, referralsCache] = await Promise.all([
            getProviders(),
            getBookings(),
            getComplaints(),
            getReferrals()
        ]);

        renderStats();
        renderProviders();
        renderBookings();
        renderComplaints();
        renderReferrals();
        renderPerformance();

    } catch (error) {
        document.getElementById("providersBody").innerHTML =
            `<tr><td colspan="5" class="state error">Couldn't load dashboard data: ${escapeHTML(error.message)}</td></tr>`;
    }
}

function renderStats() {
    document.getElementById("statRow").innerHTML = `
        <div class="stat-card"><div class="num">${providersCache.length}</div><div class="label">Total Providers</div></div>
        <div class="stat-card"><div class="num">${providersCache.filter(p => p.verificationStatus === "Pending").length}</div><div class="label">Pending Verification</div></div>
        <div class="stat-card"><div class="num">${bookingsCache.length}</div><div class="label">Total Bookings</div></div>
        <div class="stat-card"><div class="num">${complaintsCache.filter(c => c.status === "open").length}</div><div class="label">Open Complaints</div></div>
    `;
}

function renderProviders() {
    const statuses = ["Pending", "Under Review", "Verified", "Suspended"];
    document.getElementById("providersBody").innerHTML = providersCache.map(p => `
        <tr>
            <td><strong>${escapeHTML(p.businessName)}</strong><br><span style="color:#9ca3af;font-size:11px;">${escapeHTML(p.ownerName)}</span></td>
            <td>${escapeHTML(p.category)}</td>
            <td>${escapeHTML(p.court)}</td>
            <td><span class="badge ${badgeClass(p.verificationStatus)}">${p.verificationStatus}</span></td>
            <td>
                <select class="status-select" onchange="changeStatus(${p.id}, this.value)">
                    ${statuses.map(s => `<option value="${s}" ${s === p.verificationStatus ? "selected" : ""}>${s}</option>`).join("")}
                </select>
            </td>
        </tr>
    `).join("");
}

async function changeStatus(providerId, status) {
    try {
        await setVerificationStatus(providerId, status);
        providersCache = await getProviders();
        renderProviders();
        renderStats();
        renderPerformance();
    } catch (error) {
        alert("Couldn't update status: " + error.message);
        renderProviders();
    }
}

function renderBookings() {
    document.getElementById("bookingsBody").innerHTML = bookingsCache.map(b => {
        const provider = providersCache.find(p => p.id === b.providerId);
        return `
        <tr>
            <td>${escapeHTML(b.residentName)}</td>
            <td>${escapeHTML(b.serviceName)}</td>
            <td>${escapeHTML(provider ? provider.businessName : "—")}</td>
            <td>${escapeHTML(b.date)}</td>
            <td><span class="badge ${badgeClass(b.status)}">${b.status}</span></td>
        </tr>
    `; }).join("") || `<tr><td colspan="5" class="state">No bookings yet.</td></tr>`;
}

function renderComplaints() {
    document.getElementById("complaintsBody").innerHTML = complaintsCache.map(c => {
        const provider = providersCache.find(p => p.id === c.providerId);
        return `
        <tr>
            <td>${escapeHTML(c.residentName)}</td>
            <td>${escapeHTML(provider ? provider.businessName : "—")}</td>
            <td>${escapeHTML(c.category)}</td>
            <td>${escapeHTML(c.description)}</td>
            <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
            <td>${c.status === "open" ? `<button class="btn" onclick="markResolved(${c.id})">Resolve</button>` : "—"}</td>
        </tr>
    `; }).join("") || `<tr><td colspan="6" class="state">No complaints logged.</td></tr>`;
}

async function markResolved(id) {
    try {
        await resolveComplaint(id);
        complaintsCache = await getComplaints();
        renderComplaints();
        renderStats();
        renderPerformance();
    } catch (error) {
        alert("Couldn't resolve complaint: " + error.message);
    }
}

function renderReferrals() {
    document.getElementById("referralsBody").innerHTML = referralsCache.map(r => {
        const provider = providersCache.find(p => p.id === r.providerId);
        return `
        <tr>
            <td>${escapeHTML(provider ? provider.businessName : "—")}</td>
            <td>${escapeHTML(r.referredBy)}</td>
            <td>${escapeHTML(r.referredName)}</td>
            <td>${escapeHTML(r.referredContact)}</td>
            <td><span class="badge ${badgeClass(r.status)}">${r.status}</span></td>
        </tr>
    `; }).join("") || `<tr><td colspan="5" class="state">No referrals logged.</td></tr>`;
}

function renderPerformance() {
    document.getElementById("performanceBody").innerHTML = providersCache.map(p => {
        const providerBookings = bookingsCache.filter(b => b.providerId === p.id);
        const completed = providerBookings.filter(b => b.status === "completed").length;
        const providerComplaints = complaintsCache.filter(c => c.providerId === p.id).length;

        return `
        <tr>
            <td>${escapeHTML(p.businessName)}</td>
            <td><span class="stars">${"★".repeat(Math.round(p.rating))}${"☆".repeat(5 - Math.round(p.rating))}</span> ${p.rating}</td>
            <td>${providerBookings.length}</td>
            <td>${completed}</td>
            <td>${providerComplaints}</td>
        </tr>
    `; }).join("") || `<tr><td colspan="5" class="state">No providers yet.</td></tr>`;
}
