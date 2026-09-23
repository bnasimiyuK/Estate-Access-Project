
function badgeClass(status) {
    return { "Verified": "badge-verified", "Pending": "badge-pending", "Under Review": "badge-review", "Suspended": "badge-suspended" }[status] || "badge-pending";
}

function render() {
    const params = new URLSearchParams(window.location.search);
    const providerId = params.get("id") || 1;
    const provider = getProvider(providerId);
    const container = document.getElementById("profileContainer");

    if (!provider) {
        container.innerHTML = "<p>Provider not found.</p>";
        return;
    }

    const services = getServicesByProvider(provider.id);

    const servicesHTML = services.map(s => `
        <div class="service-row">
            <div>
                <span class="name">${escapeHTML(s.name)}</span>
                ${s.available ? "" : '<span class="unavailable-tag">Unavailable</span>'}
            </div>
            <div class="price">KES ${formatKES(s.price)} <span style="color:#6b7280;font-weight:400;">${escapeHTML(s.priceUnit)}</span></div>
        </div>
    `).join("") || "<p style='color:#6b7280;font-size:13px;'>No services listed yet.</p>";

    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-top">
                <div class="profile-name-row">
                    <div class="profile-icon"><i class="fa-solid fa-store"></i></div>
                    <div>
                        <div class="profile-name">${escapeHTML(provider.businessName)}</div>
                        <div class="owner">Owner: ${escapeHTML(provider.ownerName)}</div>
                        <div class="rating-row">
                            ${"★".repeat(Math.round(provider.rating))}${"☆".repeat(5 - Math.round(provider.rating))}
                            <span>${provider.rating} out of 5 (${provider.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
                <span class="badge ${badgeClass(provider.verificationStatus)}">${provider.verificationStatus}</span>
            </div>

            <div class="info-grid">
                <div class="info-item"><div class="label">Category</div><div class="value">${escapeHTML(provider.category)}</div></div>
                <div class="info-item"><div class="label">Court / Location</div><div class="value">${escapeHTML(provider.court)}</div></div>
                <div class="info-item"><div class="label">Operating Hours</div><div class="value">${escapeHTML(provider.hours)}</div></div>
                <div class="info-item"><div class="label">Contact</div><div class="value">${escapeHTML(provider.phone)}</div></div>
                <div class="info-item"><div class="label">Email</div><div class="value">${escapeHTML(provider.email)}</div></div>
                <div class="info-item"><div class="label">Member Since</div><div class="value">${escapeHTML(provider.joined)}</div></div>
            </div>

            <div class="section-title">About</div>
            <p class="description">${escapeHTML(provider.description)}</p>

            <div class="section-title">Services Offered</div>
            <div class="services-list">${servicesHTML}</div>

            <div style="margin-top:26px;">
                <button class="btn btn-primary" onclick="window.location.href='service-booking.html?providerId=${provider.id}'">
                    <i class="fa-solid fa-calendar-plus"></i> Book a Service
                </button>
            </div>
        </div>
    `;
}

render();