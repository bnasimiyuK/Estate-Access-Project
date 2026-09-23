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

function renderStats() {
    const providers = getProviders();
    const bookings = getBookings();
    const complaints = getComplaints();

    document.getElementById("statRow").innerHTML = `
        <div class="stat-card"><div class="num">${providers.length}</div><div class="label">Total Providers</div></div>
        <div class="stat-card"><div class="num">${providers.filter(p => p.verificationStatus === "Pending").length}</div><div class="label">Pending Verification</div></div>
        <div class="stat-card"><div class="num">${bookings.length}</div><div class="label">Total Bookings</div></div>
        <div class="stat-card"><div class="num">${complaints.filter(c => c.status === "open").length}</div><div class="label">Open Complaints</div></div>
    `;
}

function renderProviders() {
    const statuses = ["Pending", "Under Review", "Verified", "Suspended"];
    document.getElementById("providersBody").innerHTML = getProviders().map(p => `
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

function changeStatus(providerId, status) {
    setVerificationStatus(providerId, status);
    renderProviders();
    renderStats();
}

function renderBookings() {
    document.getElementById("bookingsBody").innerHTML = getBookings().map(b => {
        const provider = getProvider(b.providerId);
        return `
        <tr>
            <td>${escapeHTML(b.residentName)}</td>
            <td>${escapeHTML(b.serviceName)}</td>
            <td>${escapeHTML(provider ? provider.businessName : "—")}</td>
            <td>${escapeHTML(b.date)}</td>
            <td><span class="badge ${badgeClass(b.status)}">${b.status}</span></td>
        </tr>
    `; }).join("");
}

function renderComplaints() {
    document.getElementById("complaintsBody").innerHTML = getComplaints().map(c => {
        const provider = getProvider(c.providerId);
        return `
        <tr>
            <td>${escapeHTML(c.residentName)}</td>
            <td>${escapeHTML(provider ? provider.businessName : "—")}</td>
            <td>${escapeHTML(c.category)}</td>
            <td>${escapeHTML(c.description)}</td>
            <td><span class="badge ${badgeClass(c.status)}">${c.status}</span></td>
            <td>${c.status === "open" ? `<button class="btn" onclick="markResolved(${c.id})">Resolve</button>` : "—"}</td>
        </tr>
    `; }).join("");
}

function markResolved(id) {
    resolveComplaint(id);
    renderComplaints();
    renderStats();
}

function renderReferrals() {
    document.getElementById("referralsBody").innerHTML = getReferrals().map(r => {
        const provider = getProvider(r.providerId);
        return `
        <tr>
            <td>${escapeHTML(provider ? provider.businessName : "—")}</td>
            <td>${escapeHTML(r.referredBy)}</td>
            <td>${escapeHTML(r.referredName)}</td>
            <td>${escapeHTML(r.referredContact)}</td>
            <td><span class="badge ${badgeClass(r.status)}">${r.status}</span></td>
        </tr>
    `; }).join("");
}

function renderPerformance() {
    const bookings = getBookings();
    const complaints = getComplaints();

    document.getElementById("performanceBody").innerHTML = getProviders().map(p => {
        const providerBookings = bookings.filter(b => b.providerId === p.id);
        const completed = providerBookings.filter(b => b.status === "completed").length;
        const providerComplaints = complaints.filter(c => c.providerId === p.id).length;

        return `
        <tr>
            <td>${escapeHTML(p.businessName)}</td>
            <td><span class="stars">${"★".repeat(Math.round(p.rating))}${"☆".repeat(5 - Math.round(p.rating))}</span> ${p.rating}</td>
            <td>${providerBookings.length}</td>
            <td>${completed}</td>
            <td>${providerComplaints}</td>
        </tr>
    `; }).join("");
}

renderStats();
renderProviders();
renderBookings();
renderComplaints();
renderReferrals();
renderPerformance();