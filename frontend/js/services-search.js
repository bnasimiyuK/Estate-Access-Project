```javascript
/*
 * ============================================================
 * ATHI ESTATE CONNECT
 * Services Search Page
 * ============================================================
 *
 * File: services-search.js
 *
 * Purpose:
 * - Search services
 * - Filter service providers
 * - Sort search results
 * - Display service cards
 * - Connect the page to the backend API later
 *
 * ============================================================
 */


/* ============================================================
   CONFIGURATION
   ============================================================ */

const API_BASE = "http://localhost:4050/api";


/* ============================================================
   SAMPLE SERVICES
   ============================================================
   
   These records allow the page to work immediately.

   Later, replace loadServices() with an API request such as:

   GET /api/services

   The backend can then return the services from SQL Server.
   ============================================================ */

const sampleServices = [

    {
        id: 1,
        name: "Professional House Cleaning",
        provider: "Athi Clean Homes",
        category: "Cleaning",
        court: "Estate-wide",
        price: 1500,
        priceUnit: "per visit",
        rating: 4.8,
        reviews: 42,
        verified: true,
        available: true,
        icon: "fa-broom",
        description:
            "Professional house cleaning including floors, bathrooms, kitchen and general household cleaning."
    },

    {
        id: 2,
        name: "Plumbing & Leak Repairs",
        provider: "Mwangangi Plumbing Services",
        category: "Plumbing",
        court: "Phase II",
        price: 1000,
        priceUnit: "from",
        rating: 4.7,
        reviews: 35,
        verified: true,
        available: true,
        icon: "fa-faucet-drip",
        description:
            "Fast plumbing repairs for leaking pipes, taps, sinks, toilets and blocked drainage."
    },

    {
        id: 3,
        name: "Electrical Installation & Repairs",
        provider: "Athi Power Solutions",
        category: "Electrical",
        court: "Central",
        price: 1200,
        priceUnit: "from",
        rating: 4.6,
        reviews: 27,
        verified: true,
        available: true,
        icon: "fa-bolt",
        description:
            "Domestic electrical repairs, socket installation, lighting and troubleshooting."
    },

    {
        id: 4,
        name: "Garden Maintenance",
        provider: "Green Estate Gardens",
        category: "Gardening",
        court: "Riverside",
        price: 800,
        priceUnit: "per visit",
        rating: 4.5,
        reviews: 19,
        verified: true,
        available: true,
        icon: "fa-seedling",
        description:
            "Lawn mowing, hedge trimming, gardening and general compound maintenance."
    },

    {
        id: 5,
        name: "Laundry & Ironing",
        provider: "FreshCare Laundry",
        category: "Laundry",
        court: "Phase I",
        price: 500,
        priceUnit: "from",
        rating: 4.4,
        reviews: 31,
        verified: true,
        available: true,
        icon: "fa-shirt",
        description:
            "Convenient washing, drying, folding and ironing services for estate residents."
    },

    {
        id: 6,
        name: "Home Computer Support",
        provider: "Athi Tech Solutions",
        category: "Technology",
        court: "Estate-wide",
        price: 1000,
        priceUnit: "per visit",
        rating: 4.9,
        reviews: 16,
        verified: true,
        available: true,
        icon: "fa-laptop",
        description:
            "Computer troubleshooting, Wi-Fi setup, printer support and basic technology assistance."
    },

    {
        id: 7,
        name: "Home Beauty Services",
        provider: "Beauty at Your Door",
        category: "Beauty",
        court: "Riverside",
        price: 1200,
        priceUnit: "from",
        rating: 4.3,
        reviews: 22,
        verified: false,
        available: true,
        icon: "fa-spa",
        description:
            "Convenient beauty and wellness services provided at your home."
    },

    {
        id: 8,
        name: "Private Mathematics Tutor",
        provider: "Athi Learning Hub",
        category: "Tutoring",
        court: "Phase II",
        price: 700,
        priceUnit: "per hour",
        rating: 4.8,
        reviews: 14,
        verified: true,
        available: false,
        icon: "fa-book-open",
        description:
            "One-on-one mathematics tutoring and academic support for school-going students."
    },

    {
        id: 9,
        name: "Home Security Assessment",
        provider: "Estate Secure Solutions",
        category: "Security",
        court: "Estate-wide",
        price: 2000,
        priceUnit: "per assessment",
        rating: 4.7,
        reviews: 11,
        verified: true,
        available: true,
        icon: "fa-shield-halved",
        description:
            "Assessment of home security risks with recommendations for improving household safety."
    },

    {
        id: 10,
        name: "Home Catering",
        provider: "Athi Home Catering",
        category: "Food",
        court: "Central",
        price: 2500,
        priceUnit: "from",
        rating: 4.6,
        reviews: 24,
        verified: true,
        available: true,
        icon: "fa-utensils",
        description:
            "Home catering for family gatherings, meetings and small estate events."
    },

    {
        id: 11,
        name: "General Handyman Services",
        provider: "Reliable Handyman",
        category: "Repairs",
        court: "Estate-wide",
        price: 900,
        priceUnit: "from",
        rating: 4.2,
        reviews: 18,
        verified: false,
        available: true,
        icon: "fa-screwdriver-wrench",
        description:
            "General household repairs, furniture assembly and minor maintenance jobs."
    },

    {
        id: 12,
        name: "Local Estate Transport",
        provider: "Athi Ride Services",
        category: "Transport",
        court: "Estate-wide",
        price: 300,
        priceUnit: "from",
        rating: 4.5,
        reviews: 37,
        verified: true,
        available: true,
        icon: "fa-car",
        description:
            "Local transport services for residents, shopping trips and scheduled journeys."
    }

];


/* ============================================================
   APPLICATION STATE
   ============================================================ */

let allServices = [];
let filteredServices = [];


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const courtFilter =
    document.getElementById("courtFilter");

const minPrice =
    document.getElementById("minPrice");

const maxPrice =
    document.getElementById("maxPrice");

const verifiedFilter =
    document.getElementById("verifiedFilter");

const availableFilter =
    document.getElementById("availableFilter");

const sortFilter =
    document.getElementById("sortFilter");

const clearFilters =
    document.getElementById("clearFilters");

const servicesGrid =
    document.getElementById("servicesGrid");

const emptyState =
    document.getElementById("emptyState");

const resultsCount =
    document.getElementById("resultsCount");

const profileBtn =
    document.getElementById("profileBtn");


/* ============================================================
   INITIALIZE PAGE
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    loadServices();

    attachEventListeners();

});


/* ============================================================
   LOAD SERVICES
   ============================================================ */

async function loadServices() {

    /*
     * For now the application uses sample data.
     *
     * When the backend is ready, this can be changed to:
     *
     * const response = await fetch(`${API_BASE}/services`);
     *
     * const data = await response.json();
     *
     * allServices = data.services;
     */

    allServices = [...sampleServices];

    applyFilters();

}


/* ============================================================
   EVENT LISTENERS
   ============================================================ */

function attachEventListeners() {

    searchForm.addEventListener("submit", function (event) {

        event.preventDefault();

        applyFilters();

    });


    searchInput.addEventListener("input", debounce(() => {

        applyFilters();

    }, 250));


    categoryFilter.addEventListener(
        "change",
        applyFilters
    );


    courtFilter.addEventListener(
        "change",
        applyFilters
    );


    minPrice.addEventListener(
        "input",
        applyFilters
    );


    maxPrice.addEventListener(
        "input",
        applyFilters
    );


    verifiedFilter.addEventListener(
        "change",
        applyFilters
    );


    availableFilter.addEventListener(
        "change",
        applyFilters
    );


    sortFilter.addEventListener(
        "change",
        applyFilters
    );


    clearFilters.addEventListener(
        "click",
        clearAllFilters
    );


    profileBtn.addEventListener("click", () => {

        /*
         * Change this URL to the correct resident dashboard
         * in your existing application.
         */

        window.location.href = "dashboard.html";

    });

}


/* ============================================================
   APPLY FILTERS
   ============================================================ */

function applyFilters() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedCategory =
        categoryFilter.value;


    const selectedCourt =
        courtFilter.value;


    const minimum =
        parseFloat(minPrice.value);


    const maximum =
        parseFloat(maxPrice.value);


    const verifiedOnly =
        verifiedFilter.checked;


    const availableOnly =
        availableFilter.checked;


    filteredServices = allServices.filter(service => {

        /*
         * SEARCH
         */

        const searchableText = [
            service.name,
            service.provider,
            service.category,
            service.court,
            service.description
        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            !searchTerm ||
            searchableText.includes(searchTerm);


        /*
         * CATEGORY
         */

        const matchesCategory =
            !selectedCategory ||
            service.category === selectedCategory;


        /*
         * COURT
         */

        const matchesCourt =
            !selectedCourt ||
            service.court === selectedCourt;


        /*
         * MINIMUM PRICE
         */

        const matchesMinimum =
            isNaN(minimum) ||
            service.price >= minimum;


        /*
         * MAXIMUM PRICE
         */

        const matchesMaximum =
            isNaN(maximum) ||
            service.price <= maximum;


        /*
         * VERIFIED
         */

        const matchesVerified =
            !verifiedOnly ||
            service.verified === true;


        /*
         * AVAILABILITY
         */

        const matchesAvailability =
            !availableOnly ||
            service.available === true;


        return (
            matchesSearch &&
            matchesCategory &&
            matchesCourt &&
            matchesMinimum &&
            matchesMaximum &&
            matchesVerified &&
            matchesAvailability
        );

    });


    sortServices();

    renderServices();

}


/* ============================================================
   SORT SERVICES
   ============================================================ */

function sortServices() {

    const sortValue =
        sortFilter.value;


    switch (sortValue) {

        case "rating":

            filteredServices.sort(
                (a, b) => b.rating - a.rating
            );

            break;


        case "price-low":

            filteredServices.sort(
                (a, b) => a.price - b.price
            );

            break;


        case "price-high":

            filteredServices.sort(
                (a, b) => b.price - a.price
            );

            break;


        case "name":

            filteredServices.sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            );

            break;


        case "recommended":

        default:

            /*
             * Verified services are shown first,
             * followed by rating.
             */

            filteredServices.sort((a, b) => {

                if (
                    a.verified !== b.verified
                ) {

                    return a.verified ? -1 : 1;

                }

                return b.rating - a.rating;

            });

            break;

    }

}


/* ============================================================
   RENDER SERVICES
   ============================================================ */

function renderServices() {

    servicesGrid.innerHTML = "";


    resultsCount.textContent =
        `${filteredServices.length} service${
            filteredServices.length === 1
                ? ""
                : "s"
        } found`;


    if (filteredServices.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filteredServices.forEach(service => {

        const card =
            createServiceCard(service);

        servicesGrid.appendChild(card);

    });

}


/* ============================================================
   CREATE SERVICE CARD
   ============================================================ */

function createServiceCard(service) {

    const card =
        document.createElement("article");


    card.className =
        "service-card";


    const verifiedBadge =
        service.verified

            ? `
                <span class="verified">
                    <i class="fa-solid fa-circle-check"></i>
                    Verified
                </span>
              `

            : "";


    const availabilityText =
        service.available
            ? "Available today"
            : "Currently unavailable";


    const availabilityIcon =
        service.available
            ? "fa-circle-check"
            : "fa-clock";


    card.innerHTML = `

        <div class="service-image">

            <i class="fa-solid ${service.icon}"></i>

        </div>


        <div class="service-content">

            <div class="service-top">

                <div>

                    <h4 class="service-name">
                        ${escapeHTML(service.name)}
                    </h4>

                    <p class="provider">
                        ${escapeHTML(service.provider)}
                    </p>

                </div>

                ${verifiedBadge}

            </div>


            <div class="rating">

                ${generateStars(service.rating)}

                <span>
                    ${service.rating}
                    (${service.reviews} reviews)
                </span>

            </div>


            <p class="description">

                ${escapeHTML(service.description)}

            </p>


            <div class="service-details">

                <div>

                    <div class="price">

                        KES ${formatNumber(service.price)}

                    </div>

                    <div class="location">

                        ${escapeHTML(service.priceUnit)}

                    </div>

                </div>


                <div class="location">

                    <i class="fa-solid fa-location-dot"></i>

                    ${escapeHTML(service.court)}

                </div>

            </div>


            <div class="location" style="margin-top:8px;">

                <i class="fa-solid ${availabilityIcon}"></i>

                ${availabilityText}

            </div>


            <div class="card-actions">

                <button
                    class="btn btn-outline"
                    onclick="viewService(${service.id})"
                >

                    <i class="fa-solid fa-eye"></i>

                    View Details

                </button>


                <button
                    class="btn btn-primary"
                    onclick="bookService(${service.id})"
                    ${service.available ? "" : "disabled"}
                >

                    <i class="fa-solid fa-calendar-plus"></i>

                    Book Service

                </button>

            </div>

        </div>

    `;


    return card;

}


/* ============================================================
   GENERATE STAR RATING
   ============================================================ */

function generateStars(rating) {

    let stars = "";


    const fullStars =
        Math.floor(rating);


    const hasHalfStar =
        rating % 1 >= 0.5;


    for (
        let i = 0;
        i < fullStars;
        i++
    ) {

        stars +=
            '<i class="fa-solid fa-star"></i>';

    }


    if (hasHalfStar) {

        stars +=
            '<i class="fa-solid fa-star-half-stroke"></i>';

    }


    const emptyStars =
        5 -
        fullStars -
        (hasHalfStar ? 1 : 0);


    for (
        let i = 0;
        i < emptyStars;
        i++
    ) {

        stars +=
            '<i class="fa-regular fa-star"></i>';

    }


    return stars;

}


/* ============================================================
   VIEW SERVICE
   ============================================================ */

function viewService(serviceId) {

    const service =
        allServices.find(
            item => item.id === serviceId
        );


    if (!service) {

        return;

    }


    /*
     * Store selected service so the details page
     * can retrieve it.
     */

    localStorage.setItem(
        "selectedService",
        JSON.stringify(service)
    );


    /*
     * Change this to your actual details page.
     */

    window.location.href =
        `service-details.html?id=${serviceId}`;

}


/* ============================================================
   BOOK SERVICE
   ============================================================ */

function bookService(serviceId) {

    const service =
        allServices.find(
            item => item.id === serviceId
        );


    if (!service) {

        return;

    }


    if (!service.available) {

        alert(
            "This service is currently unavailable."
        );

        return;

    }


    /*
     * Store selected service for the booking page.
     */

    localStorage.setItem(
        "selectedService",
        JSON.stringify(service)
    );


    /*
     * Redirect to booking page.
     */

    window.location.href =
        `service-booking.html?id=${serviceId}`;

}


/* ============================================================
   CLEAR FILTERS
   ============================================================ */

function clearAllFilters() {

    searchInput.value = "";

    categoryFilter.value = "";

    courtFilter.value = "";

    minPrice.value = "";

    maxPrice.value = "";

    verifiedFilter.checked = false;

    availableFilter.checked = false;

    sortFilter.value = "recommended";


    applyFilters();

}


/* ============================================================
   NUMBER FORMAT
   ============================================================ */

function formatNumber(number) {

    return new Intl.NumberFormat(
        "en-KE"
    ).format(number);

}


/* ============================================================
   HTML SECURITY
   ============================================================
   
   Prevents service information returned by the backend
   from being inserted as executable HTML.
   ============================================================ */

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   DEBOUNCE
   ============================================================ */

function debounce(callback, delay) {

    let timer;


    return function (...args) {

        clearTimeout(timer);


        timer = setTimeout(
            () => callback.apply(this, args),
            delay
        );

    };

}
```
