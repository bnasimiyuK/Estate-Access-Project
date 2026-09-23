/* ============================================================
   ATHI SOKO CONNECT — SHARED DATA LAYER
   ------------------------------------------------------------
   This file simulates a backend using localStorage so the demo
   pages can register providers, create bookings, track status,
   log complaints/referrals, and run reports without a server.

   TO CONNECT A REAL BACKEND:
   Replace the body of each function below with a fetch() call
   to your API (e.g. GET/POST /api/providers, /api/bookings...).
   Every page only calls the functions in this file, so that is
   the only place you need to change.
   ============================================================ */

const DB_KEYS = {
    providers: "asc_providers",
    services: "asc_services",
    bookings: "asc_bookings",
    complaints: "asc_complaints",
    referrals: "asc_referrals"
};

/* ---------- low level helpers ---------- */

function dbGet(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        return [];
    }
}

function dbSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function nextId(list) {
    return list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
}

/* ---------- seed data (first run only) ---------- */

function seedDatabase() {
    if (localStorage.getItem("asc_seeded")) return;

    const providers = [
        { id: 1, businessName: "Athi Clean Homes", ownerName: "Grace Wambui", category: "Cleaning", court: "Estate-wide", phone: "0712 345 678", email: "info@athicleanhomes.co.ke", description: "Professional house cleaning including floors, bathrooms, kitchen and general household cleaning.", hours: "Mon–Sat, 8:00am – 6:00pm", verificationStatus: "Verified", rating: 4.8, reviewCount: 42, joined: "2025-11-02" },
        { id: 2, businessName: "Mwangangi Plumbing Services", ownerName: "Peter Mwangangi", category: "Plumbing", court: "Phase II", phone: "0722 111 222", email: "mwangangi.plumbing@gmail.com", description: "Fast plumbing repairs for leaking pipes, taps, sinks, toilets and blocked drainage.", hours: "Mon–Sun, 7:00am – 8:00pm", verificationStatus: "Verified", rating: 4.7, reviewCount: 35, joined: "2025-09-14" },
        { id: 3, businessName: "Athi Power Solutions", ownerName: "James Kioko", category: "Electrical", court: "Central", phone: "0733 222 333", email: "athipower@gmail.com", description: "Domestic electrical repairs, socket installation, lighting and troubleshooting.", hours: "Mon–Sat, 8:00am – 6:00pm", verificationStatus: "Verified", rating: 4.6, reviewCount: 27, joined: "2025-10-01" },
        { id: 4, businessName: "Beauty at Your Door", ownerName: "Faith Njeri", category: "Beauty", court: "Riverside", phone: "0700 555 444", email: "faith.beauty@gmail.com", description: "Convenient beauty and wellness services provided at your home.", hours: "Tue–Sun, 9:00am – 5:00pm", verificationStatus: "Pending", rating: 4.3, reviewCount: 22, joined: "2026-08-20" },
        { id: 5, businessName: "Reliable Handyman", ownerName: "Samuel Otieno", category: "Repairs", court: "Estate-wide", phone: "0711 999 888", email: "reliablehandyman@gmail.com", description: "General household repairs, furniture assembly and minor maintenance jobs.", hours: "Mon–Sat, 8:00am – 6:00pm", verificationStatus: "Under Review", rating: 4.2, reviewCount: 18, joined: "2026-09-01" }
    ];

    const services = [
        { id: 1, providerId: 1, name: "Professional House Cleaning", category: "Cleaning", price: 1500, priceUnit: "per visit", available: true, icon: "fa-broom" },
        { id: 2, providerId: 2, name: "Plumbing & Leak Repairs", category: "Plumbing", price: 1000, priceUnit: "from", available: true, icon: "fa-faucet-drip" },
        { id: 3, providerId: 3, name: "Electrical Installation & Repairs", category: "Electrical", price: 1200, priceUnit: "from", available: true, icon: "fa-bolt" },
        { id: 4, providerId: 4, name: "Home Beauty Services", category: "Beauty", price: 1200, priceUnit: "from", available: true, icon: "fa-spa" },
        { id: 5, providerId: 5, name: "General Handyman Services", category: "Repairs", price: 900, priceUnit: "from", available: false, icon: "fa-screwdriver-wrench" }
    ];

    const bookings = [
        { id: 1, serviceId: 1, providerId: 1, serviceName: "Professional House Cleaning", residentName: "John Kamau", residentPhone: "0798 111 222", court: "Riverside", date: "2026-09-25", time: "10:00", notes: "2 bedroom house", status: "accepted", createdAt: "2026-09-20" },
        { id: 2, serviceId: 2, providerId: 2, serviceName: "Plumbing & Leak Repairs", residentName: "Mary Wanjiru", residentPhone: "0798 333 444", court: "Phase II", date: "2026-09-22", time: "14:00", notes: "Leaking kitchen tap", status: "completed", createdAt: "2026-09-18" },
        { id: 3, serviceId: 5, providerId: 5, serviceName: "General Handyman Services", residentName: "Alice Mutiso", residentPhone: "0798 555 666", court: "Central", date: "2026-09-24", time: "09:00", notes: "Fix wardrobe door", status: "pending", createdAt: "2026-09-21" }
    ];

    const complaints = [
        { id: 1, bookingId: 2, providerId: 2, residentName: "Mary Wanjiru", category: "Service Quality", description: "Plumber arrived 2 hours late.", status: "open", createdAt: "2026-09-22" }
    ];

    const referrals = [
        { id: 1, providerId: 1, referredBy: "John Kamau", referredName: "Ann Mueni", referredContact: "0798 777 888", status: "pending", createdAt: "2026-09-19" }
    ];

    dbSet(DB_KEYS.providers, providers);
    dbSet(DB_KEYS.services, services);
    dbSet(DB_KEYS.bookings, bookings);
    dbSet(DB_KEYS.complaints, complaints);
    dbSet(DB_KEYS.referrals, referrals);
    localStorage.setItem("asc_seeded", "true");
}

seedDatabase();

/* ---------- providers ---------- */

function getProviders() { return dbGet(DB_KEYS.providers); }

function getProvider(id) {
    return getProviders().find(p => p.id === Number(id));
}

function registerProvider(data) {
    const providers = getProviders();
    const provider = {
        id: nextId(providers),
        verificationStatus: "Pending",
        rating: 0,
        reviewCount: 0,
        joined: new Date().toISOString().slice(0, 10),
        ...data
    };
    providers.push(provider);
    dbSet(DB_KEYS.providers, providers);
    return provider;
}

function updateProvider(id, changes) {
    const providers = getProviders().map(p =>
        p.id === Number(id) ? { ...p, ...changes } : p
    );
    dbSet(DB_KEYS.providers, providers);
}

function setVerificationStatus(id, status) {
    updateProvider(id, { verificationStatus: status });
}

/* ---------- services ---------- */

function getServices() { return dbGet(DB_KEYS.services); }

function getServicesByProvider(providerId) {
    return getServices().filter(s => s.providerId === Number(providerId));
}

function addService(data) {
    const services = getServices();
    const service = { id: nextId(services), available: true, ...data };
    services.push(service);
    dbSet(DB_KEYS.services, services);
    return service;
}

function updateService(id, changes) {
    const services = getServices().map(s =>
        s.id === Number(id) ? { ...s, ...changes } : s
    );
    dbSet(DB_KEYS.services, services);
}

function deleteService(id) {
    dbSet(DB_KEYS.services, getServices().filter(s => s.id !== Number(id)));
}

/* ---------- bookings ---------- */

function getBookings() { return dbGet(DB_KEYS.bookings); }

function getBookingsByProvider(providerId) {
    return getBookings().filter(b => b.providerId === Number(providerId));
}

function createBooking(data) {
    const bookings = getBookings();
    const booking = {
        id: nextId(bookings),
        status: "pending",
        createdAt: new Date().toISOString().slice(0, 10),
        ...data
    };
    bookings.push(booking);
    dbSet(DB_KEYS.bookings, bookings);
    return booking;
}

function updateBookingStatus(id, status) {
    const bookings = getBookings().map(b =>
        b.id === Number(id) ? { ...b, status } : b
    );
    dbSet(DB_KEYS.bookings, bookings);
}

/* ---------- complaints ---------- */

function getComplaints() { return dbGet(DB_KEYS.complaints); }

function fileComplaint(data) {
    const complaints = getComplaints();
    const complaint = {
        id: nextId(complaints),
        status: "open",
        createdAt: new Date().toISOString().slice(0, 10),
        ...data
    };
    complaints.push(complaint);
    dbSet(DB_KEYS.complaints, complaints);
    return complaint;
}

function resolveComplaint(id) {
    const complaints = getComplaints().map(c =>
        c.id === Number(id) ? { ...c, status: "resolved" } : c
    );
    dbSet(DB_KEYS.complaints, complaints);
}

/* ---------- referrals ---------- */

function getReferrals() { return dbGet(DB_KEYS.referrals); }

function addReferral(data) {
    const referrals = getReferrals();
    const referral = {
        id: nextId(referrals),
        status: "pending",
        createdAt: new Date().toISOString().slice(0, 10),
        ...data
    };
    referrals.push(referral);
    dbSet(DB_KEYS.referrals, referrals);
    return referral;
}

/* ---------- utility ---------- */

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatKES(n) {
    return new Intl.NumberFormat("en-KE").format(n);
}
