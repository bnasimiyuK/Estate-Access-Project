let currentProviderId = Number(localStorage.getItem("asc_currentProviderId")) || getProviders()[0].id;

/* --- tabs --- */
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
});

/* --- provider switcher (demo convenience) --- */
function populateSwitcher() {
    const select = document.getElementById("providerSwitch");
    select.innerHTML = getProviders().map(p =>
        `<option value="${p.id}" ${p.id === currentProviderId ? "selected" : ""}>${escapeHTML(p.businessName)}</option>`
    ).join("");
}

document.getElementById("providerSwitch").addEventListener("change", (e) => {
    currentProviderId = Number(e.target.value);
    localStorage.setItem("asc_currentProviderId", currentProviderId);
    renderAll();
});

/* --- profile --- */
function loadProfileForm() {
    const p = getProvider(currentProviderId);
    document.getElementById("pBusinessName").value = p.businessName;
    document.getElementById("pOwnerName").value = p.ownerName;
    document.getElementById("pCategory").value = p.category;
    document.getElementById("pCourt").value = p.court;
    document.getElementById("pPhone").value = p.phone;
    document.getElementById("pEmail").value = p.email;
    document.getElementById("pHours").value = p.hours;
    document.getElementById("pDescription").value = p.description;

    const note = document.getElementById("statusNote");
    const cls = { "Verified": "status-Verified", "Pending": "status-Pending", "Under Review": "status-UnderReview", "Suspended": "status-Suspended" }[p.verificationStatus];
    note.className = "status-note " + cls;
    note.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Verification status: <strong>${p.verificationStatus}</strong>` +
        (p.verificationStatus === "Verified" ? " — your profile is publicly visible." : " — visible to admins only until verified.");
}

document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    updateProvider(currentProviderId, {
        businessName: document.getElementById("pBusinessName").value.trim(),
        ownerName: document.getElementById("pOwnerName").value.trim(),
        category: document.getElementById("pCategory").value,
        court: document.getElementById("pCourt").value,
        phone: document.getElementById("pPhone").value.trim(),
        email: document.getElementById("pEmail").value.trim(),
        hours: document.getElementById("pHours").value.trim(),
        description: document.getElementById("pDescription").value.trim()
    });
    populateSwitcher();
    alert("Profile updated.");
});

/* --- services --- */
function renderServices() {
    const services = getServicesByProvider(currentProviderId);
    document.getElementById("servicesList").innerHTML = services.map(s => `
        <div class="service-item">
            <div>
                <strong>${escapeHTML(s.name)}</strong>
                <div style="color:#6b7280;font-size:11px;">${escapeHTML(s.category)} · KES ${formatKES(s.price)} ${escapeHTML(s.priceUnit)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
                <label class="availability-toggle">
                    <input type="checkbox" ${s.available ? "checked" : ""} onchange="toggleAvailability(${s.id}, this.checked)">
                    Available
                </label>
                <button class="btn btn-danger" onclick="removeService(${s.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join("") || "<p style='color:#6b7280;font-size:13px;'>No services added yet.</p>";
}

function toggleAvailability(serviceId, checked) {
    updateService(serviceId, { available: checked });
}

function removeService(serviceId) {
    if (confirm("Remove this service?")) {
        deleteService(serviceId);
        renderServices();
    }
}

document.getElementById("serviceForm").addEventListener("submit", (e) => {
    e.preventDefault();
    addService({
        providerId: currentProviderId,
        name: document.getElementById("sName").value.trim(),
        category: document.getElementById("sCategory").value.trim(),
        price: Number(document.getElementById("sPrice").value),
        priceUnit: document.getElementById("sPriceUnit").value.trim(),
        icon: "fa-briefcase"
    });
    e.target.reset();
    renderServices();
});

/* --- bookings --- */
function renderBookings() {
    const bookings = getBookingsByProvider(currentProviderId);
    document.getElementById("bookingsBody").innerHTML = bookings.map(b => `
        <tr>
            <td>${escapeHTML(b.residentName)}<br><span style="color:#9ca3af;font-size:11px;">${escapeHTML(b.residentPhone)}</span></td>
            <td>${escapeHTML(b.serviceName)}</td>
            <td>${escapeHTML(b.date)} ${escapeHTML(b.time || "")}</td>
            <td><span class="badge badge-${b.status}">${b.status}</span></td>
            <td>
                <div class="row-actions">
                    ${b.status === "pending" ? `<button class="btn btn-primary" onclick="setStatus(${b.id},'accepted')">Accept</button>
                        <button class="btn btn-danger" onclick="setStatus(${b.id},'cancelled')">Decline</button>` : ""}
                    ${b.status === "accepted" ? `<button class="btn btn-primary" onclick="setStatus(${b.id},'completed')">Mark Completed</button>` : ""}
                    ${(b.status === "completed" || b.status === "cancelled") ? "—" : ""}
                </div>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="5" style="color:#6b7280;">No booking requests yet.</td></tr>`;
}

function setStatus(bookingId, status) {
    updateBookingStatus(bookingId, status);
    renderBookings();
}

function renderAll() {
    document.getElementById("providerSwitch").value = currentProviderId;
    loadProfileForm();
    renderServices();
    renderBookings();
}

populateSwitcher();
renderAll();