```javascript
/* ============================================================
   ATHI SOKO CONNECT
   Athi Highway Estate Access Management System

   Frontend module:
   - Provider directory
   - Service categories
   - Search
   - Filters
   - Provider profiles
   - Bookings
   - Service requests
   - Referrals
   - Provider registration

   Backend API can be connected later through API_BASE.
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const API_BASE = "http://localhost:4050/api";

const USE_DEMO_DATA = true;


/* ============================================================
   DEMO PROVIDER DATA
   Replace this with API data when backend endpoints are ready.
============================================================ */

const demoProviders = [

  {
    providerId: 1,

    providerName: "John Plumbing Services",

    contactPerson: "John Mwangi",

    category: "Home & Maintenance",

    services: [
      {
        serviceId: 101,
        name: "Tap Repair",
        priceFrom: 500,
        priceTo: 1000,
        pricingUnit: "per job"
      },
      {
        serviceId: 102,
        name: "Toilet Repair",
        priceFrom: 1000,
        priceTo: 2500,
        pricingUnit: "per job"
      },
      {
        serviceId: 103,
        name: "Pipe Repair",
        priceFrom: 1500,
        priceTo: 3500,
        pricingUnit: "per job"
      }
    ],

    phone: "0700000001",

    whatsapp: "0700000001",

    email: "john@example.com",

    location: "Athi Highway Estate",

    courts: [
      "Riverside",
      "Phase II"
    ],

    description:
      "Professional plumbing and water-system repair services.",

    verificationStatus: "Verified",

    status: "Active",

    rating: 4.7,

    completedJobs: 48,

    referrals: 21,

    emergency: true,

    available: true,

    hours:
      "Monday–Saturday: 8:00 AM–6:00 PM",

    emergencyText:
      "Emergency services available."
  },


  {
    providerId: 2,

    providerName: "Athi Electrical Solutions",

    contactPerson: "Peter Kamau",

    category: "Home & Maintenance",

    services: [
      {
        serviceId: 201,
        name: "Electrical Repair",
        priceFrom: 800,
        priceTo: 2000,
        pricingUnit: "per job"
      },
      {
        serviceId: 202,
        name: "Socket Installation",
        priceFrom: 500,
        priceTo: 1200,
        pricingUnit: "per socket"
      },
      {
        serviceId: 203,
        name: "Lighting Installation",
        priceFrom: 1000,
        priceTo: 3000,
        pricingUnit: "per job"
      }
    ],

    phone: "0700000002",

    whatsapp: "0700000002",

    email: "athi.electrical@example.com",

    location: "Athi Highway Estate",

    courts: [
      "Riverside",
      "Green Court",
      "Phase II"
    ],

    description:
      "Domestic electrical installation, repair and maintenance.",

    verificationStatus: "Verified",

    status: "Active",

    rating: 4.6,

    completedJobs: 63,

    referrals: 18,

    emergency: true,

    available: true,

    hours:
      "Monday–Saturday: 8:00 AM–6:00 PM",

    emergencyText:
      "Emergency electrical support available."
  },


  {
    providerId: 3,

    providerName: "Mary's Laundry Services",

    contactPerson: "Mary Wanjiku",

    category: "Personal Care",

    services: [
      {
        serviceId: 301,
        name: "Laundry Service",
        priceFrom: 300,
        priceTo: 1200,
        pricingUnit: "per load"
      },
      {
        serviceId: 302,
        name: "Dry Cleaning",
        priceFrom: 500,
        priceTo: 1500,
        pricingUnit: "per item"
      }
    ],

    phone: "0700000003",

    whatsapp: "0700000003",

    email: "mary.laundry@example.com",

    location: "Riverside",

    courts: [
      "Riverside",
      "Phase II"
    ],

    description:
      "Laundry, ironing and dry-cleaning services for residents.",

    verificationStatus: "Verified",

    status: "Active",

    rating: 4.7,

    completedJobs: 72,

    referrals: 26,

    emergency: false,

    available: true,

    hours:
      "Monday–Saturday: 7:00 AM–7:00 PM",

    emergencyText:
      ""
  },


  {
    providerId: 4,

    providerName: "Athi Fresh Vegetables",

    contactPerson: "Grace Akinyi",

    category: "Food & Agriculture",

    services: [
      {
        serviceId: 401,
        name: "Fresh Vegetables",
        priceFrom: 50,
        priceTo: 500,
        pricingUnit: "per order"
      },
      {
        serviceId: 402,
        name: "Home Delivery",
        priceFrom: 100,
        priceTo: 300,
        pricingUnit: "per delivery"
      }
    ],

    phone: "0700000004",

    whatsapp: "0700000004",

    email: "athi.fresh@example.com",

    location: "Phase II",

    courts: [
      "Phase II",
      "Riverside"
    ],

    description:
      "Fresh vegetables and household food deliveries.",

    verificationStatus: "Verified",

    status: "Active",

    rating: 4.5,

    completedJobs: 41,

    referrals: 14,

    emergency: false,

    available: true,

    hours:
      "Monday–Saturday: 6:00 AM–6:00 PM",

    emergencyText:
      ""
  },


  {
    providerId: 5,

    providerName: "Athi Car Wash",

    contactPerson: "David Otieno",

    category: "Personal Care",

    services: [
      {
        serviceId: 501,
        name: "Exterior Car Wash",
        priceFrom: 300,
        priceTo: 500,
        pricingUnit: "per vehicle"
      },
      {
        serviceId: 502,
        name: "Full Car Wash",
        priceFrom: 600,
        priceTo: 1200,
        pricingUnit: "per vehicle"
      }
    ],

    phone: "0700000005",

    whatsapp: "0700000005",

    email: "athi.carwash@example.com",

    location: "Athi Highway Estate",

    courts: [
      "Riverside",
      "Phase II",
      "Green Court"
    ],

    description:
      "Professional vehicle cleaning and detailing services.",

    verificationStatus: "Pending",

    status: "Active",

    rating: 4.3,

    completedJobs: 29,

    referrals: 9,

    emergency: false,

    available: true,

    hours:
      "Monday–Sunday: 8:00 AM–6:00 PM",

    emergencyText:
      ""
  },


  {
    providerId: 6,

    providerName: "Athi Boda Riders",

    contactPerson: "Samuel Kiplagat",

    category: "Transport & Mobility",

    services: [
      {
        serviceId: 601,
        name: "Boda Boda Transport",
        priceFrom: 100,
        priceTo: 500,
        pricingUnit: "per trip"
      },
      {
        serviceId: 602,
        name: "Small Deliveries",
        priceFrom: 100,
        priceTo: 400,
        pricingUnit: "per delivery"
      }
    ],

    phone: "0700000006",

    whatsapp: "0700000006",

    email: "athi.riders@example.com",

    location: "Athi Highway Estate",

    courts: [
      "Riverside",
      "Phase II",
      "Green Court"
    ],

    description:
      "Local transport and small-item delivery services.",

    verificationStatus: "Pending",

    status: "Active",

    rating: 4.2,

    completedJobs: 37,

    referrals: 12,

    emergency: false,

    available: true,

    hours:
      "Monday–Sunday: 6:00 AM–9:00 PM",

    emergencyText:
      ""
  }

];


/* ============================================================
   APPLICATION STATE
============================================================ */

let providers = [];

let currentProvider = null;

let currentService = null;


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

  document.getElementById("year").textContent =
    new Date().getFullYear();

  if (USE_DEMO_DATA) {

    providers = demoProviders;

  } else {

    await loadProvidersFromAPI();

  }

  renderProviders(providers);

  setupSearch();

  setupCategoryButtons();

  setupForms();

  loadBookings();

});


/* ============================================================
   LOAD PROVIDERS
============================================================ */

async function loadProvidersFromAPI() {

  try {

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/soko/providers`,
      {
        headers: {
          "Authorization": token
            ? `Bearer ${token}`
            : ""
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        `Provider API returned ${response.status}`
      );

    }

    const data = await response.json();

    providers =
      Array.isArray(data)
        ? data
        : data.providers || [];

  } catch (error) {

    console.error(
      "Unable to load Soko providers:",
      error
    );

    providers = [];

    showNotification(
      "Unable to load providers from the server.",
      "error"
    );

  }

}


/* ============================================================
   RENDER PROVIDERS
============================================================ */

function renderProviders(list) {

  const grid =
    document.getElementById("providerGrid");

  const count =
    document.getElementById("providerCount");

  count.textContent =
    `${list.length} provider${list.length === 1 ? "" : "s"}`;


  if (!list.length) {

    grid.innerHTML = `
      <div class="col-span-full glass rounded-2xl p-8 text-center">

        <div class="text-4xl mb-3">
          🔍
        </div>

        <h3 class="font-semibold text-lg">
          No providers found
        </h3>

        <p class="text-sm text-slate-400 mt-2">
          Try another service, category or search term.
        </p>

      </div>
    `;

    return;

  }


  grid.innerHTML = list.map(provider => {

    const verified =
      provider.verificationStatus === "Verified";


    const firstService =
      provider.services?.[0];


    const price =
      firstService
        ? formatPrice(firstService.priceFrom, firstService.priceTo)
        : "Contact provider";


    return `

      <article
        class="service-card glass rounded-2xl p-5"
      >

        <div class="flex justify-between items-start gap-3">

          <div>

            <h3 class="text-lg font-semibold">
              ${escapeHtml(provider.providerName)}
            </h3>

            <p class="text-sm text-green-400 mt-1">
              ${escapeHtml(provider.category)}
            </p>

          </div>


          ${
            verified
              ? `
                <span
                  class="text-xs
                         bg-green-500/10
                         text-green-400
                         border border-green-500/20
                         px-2 py-1
                         rounded-full
                         whitespace-nowrap"
                >
                  ✓ Verified
                </span>
              `
              : `
                <span
                  class="text-xs
                         bg-yellow-500/10
                         text-yellow-300
                         border border-yellow-500/20
                         px-2 py-1
                         rounded-full
                         whitespace-nowrap"
                >
                  Verification Pending
                </span>
              `
          }

        </div>


        <p class="text-sm text-slate-400 mt-3 line-clamp-2">
          ${escapeHtml(provider.description || "")}
        </p>


        <div class="grid grid-cols-2 gap-2 mt-4">

          <div class="bg-slate-900/60 rounded-lg p-3">

            <p class="text-xs text-slate-500">
              Rating
            </p>

            <p class="font-semibold">
              ⭐ ${provider.rating || "N/A"}
            </p>

          </div>


          <div class="bg-slate-900/60 rounded-lg p-3">

            <p class="text-xs text-slate-500">
              From
            </p>

            <p class="font-semibold">
              ${price}
            </p>

          </div>

        </div>


        <div class="flex items-center gap-2
                    text-xs text-slate-400 mt-4">

          <span>📍</span>

          <span>
            ${escapeHtml(provider.location || "Athi Estate")}
          </span>

        </div>


        <div class="flex items-center gap-2
                    text-xs text-slate-400 mt-2">

          <span>🕐</span>

          <span>
            ${escapeHtml(provider.hours || "Contact provider")}
          </span>

        </div>


        <div class="flex gap-2 mt-5">

          <button
            onclick="viewProvider(${provider.providerId})"
            class="flex-1
                   bg-slate-700
                   hover:bg-slate-600
                   py-2
                   rounded-lg
                   text-sm
                   font-medium"
          >
            View
          </button>


          <button
            onclick="startBooking(${provider.providerId})"
            class="flex-1
                   bg-green-600
                   hover:bg-green-700
                   py-2
                   rounded-lg
                   text-sm
                   font-medium"
          >
            Book
          </button>

        </div>

      </article>

    `;

  }).join("");

}


/* ============================================================
   SEARCH AND FILTER
============================================================ */

function setupSearch() {

  const search =
    document.getElementById("serviceSearch");

  const category =
    document.getElementById("categoryFilter");

  const verification =
    document.getElementById("verificationFilter");

  const button =
    document.getElementById("searchButton");


  function performSearch() {

    const term =
      search.value.trim().toLowerCase();

    const categoryValue =
      category.value;

    const verificationValue =
      verification.value;


    const filtered =
      providers.filter(provider => {

        const matchesTerm =
          !term ||
          provider.providerName
            .toLowerCase()
            .includes(term) ||

          provider.category
            .toLowerCase()
            .includes(term) ||

          provider.description
            .toLowerCase()
            .includes(term) ||

          provider.services.some(service =>
            service.name
              .toLowerCase()
              .includes(term)
          );


        const matchesCategory =
          !categoryValue ||
          provider.category === categoryValue;


        const matchesVerification =
          !verificationValue ||
          provider.verificationStatus === verificationValue;


        return (
          matchesTerm &&
          matchesCategory &&
          matchesVerification
        );

      });


    renderProviders(filtered);

  }


  search.addEventListener(
    "input",
    performSearch
  );

  category.addEventListener(
    "change",
    performSearch
  );

  verification.addEventListener(
    "change",
    performSearch
  );

  button.addEventListener(
    "click",
    performSearch
  );

}


/* ============================================================
   CATEGORY BUTTONS
============================================================ */

function setupCategoryButtons() {

  document
    .querySelectorAll("[data-category]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const category =
          button.dataset.category;

        document.getElementById(
          "categoryFilter"
        ).value = category;


        document.getElementById(
          "serviceSearch"
        ).value = "";


        document.getElementById(
          "categoryFilter"
        ).dispatchEvent(
          new Event("change")
        );


        document
          .getElementById("directory")
          .scrollIntoView({
            behavior: "smooth"
          });

      });

    });

}


/* ============================================================
   PROVIDER DETAILS
============================================================ */

function viewProvider(providerId) {

  currentProvider =
    providers.find(
      provider =>
        provider.providerId === providerId
    );


  if (!currentProvider) {

    showNotification(
      "Provider not found.",
      "error"
    );

    return;

  }


  const modal =
    document.getElementById(
      "providerModal"
    );

  const title =
    document.getElementById(
      "providerModalTitle"
    );

  const content =
    document.getElementById(
      "providerModalContent"
    );


  title.textContent =
    currentProvider.providerName;


  const verified =
    currentProvider.verificationStatus === "Verified";


  const services =
    currentProvider.services || [];


  content.innerHTML = `

    <div class="space-y-6">

      <!-- Header -->

      <div>

        <div class="flex flex-wrap items-center gap-2">

          <h3 class="text-2xl font-bold">
            ${escapeHtml(currentProvider.providerName)}
          </h3>

          ${
            verified
              ? `
                <span
                  class="bg-green-500/10
                         text-green-400
                         border border-green-500/20
                         px-3 py-1
                         rounded-full
                         text-xs"
                >
                  ✓ Verified Provider
                </span>
              `
              : `
                <span
                  class="bg-yellow-500/10
                         text-yellow-300
                         border border-yellow-500/20
                         px-3 py-1
                         rounded-full
                         text-xs"
                >
                  Registered Provider —
                  Verification Pending
                </span>
              `
          }

        </div>


        <p class="text-green-400 mt-1">
          ${escapeHtml(currentProvider.category)}
        </p>


        <div class="flex flex-wrap gap-4
                    text-sm text-slate-400 mt-3">

          <span>
            ⭐ ${currentProvider.rating || "N/A"} / 5
          </span>

          <span>
            ✓ ${currentProvider.completedJobs || 0}
            completed jobs
          </span>

          <span>
            🤝 ${currentProvider.referrals || 0}
            referrals
          </span>

        </div>

      </div>


      <!-- Description -->

      <div>

        <h4 class="font-semibold mb-2">
          About Provider
        </h4>

        <p class="text-sm text-slate-300">
          ${escapeHtml(currentProvider.description || "")}
        </p>

      </div>


      <!-- Services -->

      <div>

        <h4 class="font-semibold mb-3">
          Services & Indicative Fees
        </h4>

        <div class="space-y-2">

          ${
            services.map(service => `

              <div
                class="bg-slate-900/70
                       border border-slate-800
                       rounded-xl
                       p-4
                       flex items-center
                       justify-between gap-3"
              >

                <div>

                  <p class="font-medium">
                    ${escapeHtml(service.name)}
                  </p>

                  <p class="text-xs text-slate-500">
                    ${escapeHtml(service.pricingUnit || "")}
                  </p>

                </div>


                <p class="text-green-400 font-semibold">
                  ${formatPrice(
                    service.priceFrom,
                    service.priceTo
                  )}
                </p>

              </div>

            `).join("")
          }

        </div>

      </div>


      <!-- Availability -->

      <div>

        <h4 class="font-semibold mb-2">
          Availability
        </h4>

        <p class="text-sm text-slate-300">
          🕐 ${escapeHtml(currentProvider.hours || "Contact provider")}
        </p>

        ${
          currentProvider.emergency
            ? `
              <p class="text-sm text-green-400 mt-2">
                🚨 ${escapeHtml(
                  currentProvider.emergencyText ||
                  "Emergency service available."
                )}
              </p>
            `
            : ""
        }

      </div>


      <!-- Areas -->

      <div>

        <h4 class="font-semibold mb-2">
          Areas Served
        </h4>

        <div class="flex flex-wrap gap-2">

          ${
            (currentProvider.courts || [])
              .map(court => `
                <span
                  class="bg-slate-800
                         px-3 py-1
                         rounded-full
                         text-xs"
                >
                  ${escapeHtml(court)}
                </span>
              `)
              .join("")
          }

        </div>

      </div>


      <!-- Contact -->

      <div>

        <h4 class="font-semibold mb-3">
          Contact
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">

          <a
            href="tel:${currentProvider.phone}"
            class="bg-blue-600
                   hover:bg-blue-700
                   rounded-xl
                   py-3
                   text-center
                   text-sm
                   font-medium"
          >
            📞 Call
          </a>


          <a
            href="https://wa.me/${normalizePhone(
              currentProvider.whatsapp
            )}"
            target="_blank"
            rel="noopener"
            class="bg-green-600
                   hover:bg-green-700
                   rounded-xl
                   py-3
                   text-center
                   text-sm
                   font-medium"
          >
            💬 WhatsApp
          </a>


          <button
            onclick="startBooking(${currentProvider.providerId})"
            class="bg-indigo-600
                   hover:bg-indigo-700
                   rounded-xl
                   py-3
                   text-sm
                   font-medium"
          >
            📅 Book
          </button>

        </div>

      </div>


      <!-- Trust notice -->

      <div
        class="bg-yellow-500/5
               border border-yellow-500/20
               rounded-xl
               p-4"
      >

        <p class="text-xs text-yellow-200">

          <strong>Important:</strong>
          Verification means the provider's submitted information
          has been reviewed by Athi Estate administration.
          Residents should independently confirm prices, service
          details and terms before engaging a provider.

        </p>

      </div>


      <!-- Referral / Report -->

      <div class="flex flex-wrap gap-3">

        <button
          onclick="referCurrentProvider()"
          class="bg-slate-700
                 hover:bg-slate-600
                 px-4 py-2
                 rounded-lg
                 text-sm"
        >
          🤝 Refer Provider
        </button>


        <button
          onclick="reportProvider(${currentProvider.providerId})"
          class="bg-red-600/80
                 hover:bg-red-600
                 px-4 py-2
                 rounded-lg
                 text-sm"
        >
          ⚠ Report Provider
        </button>

      </div>

    </div>

  `;


  modal.classList.remove("hidden");

}


/* ============================================================
   CLOSE PROVIDER MODAL
============================================================ */

function closeProviderModal() {

  document
    .getElementById("providerModal")
    .classList.add("hidden");

}


/* ============================================================
   BOOKING
============================================================ */

function startBooking(providerId, serviceId = null) {

  currentProvider =
    providers.find(
      provider =>
        provider.providerId === providerId
    );


  if (!currentProvider) {

    showNotification(
      "Provider not found.",
      "error"
    );

    return;

  }


  currentService =
    serviceId
      ? currentProvider.services.find(
          service =>
            service.serviceId === serviceId
        )
      : currentProvider.services?.[0];


  document.getElementById(
    "bookingProviderId"
  ).value =
    currentProvider.providerId;


  document.getElementById(
    "bookingProviderName"
  ).value =
    currentProvider.providerName;


  document.getElementById(
    "bookingServiceId"
  ).value =
    currentService?.serviceId || "";


  document.getElementById(
    "bookingServiceName"
  ).value =
    currentService?.name || "Service";


  closeProviderModal();


  document
    .getElementById("bookingModal")
    .classList.remove("hidden");

}


/* ============================================================
   CLOSE BOOKING
============================================================ */

function closeBookingModal() {

  document
    .getElementById("bookingModal")
    .classList.add("hidden");

}


/* ============================================================
   BOOKING FORM
============================================================ */

function setupForms() {

  const bookingForm =
    document.getElementById(
      "bookingForm"
    );


  bookingForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const booking = {

        providerId:
          Number(
            document.getElementById(
              "bookingProviderId"
            ).value
          ),

        serviceId:
          Number(
            document.getElementById(
              "bookingServiceId"
            ).value
          ),

        bookingDate:
          document.getElementById(
            "bookingDate"
          ).value,

        bookingTime:
          document.getElementById(
            "bookingTime"
          ).value,

        houseNumber:
          document.getElementById(
            "bookingLocation"
          ).value,

        description:
          document.getElementById(
            "bookingDescription"
          ).value.trim(),

        status: "Pending",

        createdAt:
          new Date().toISOString()

      };


      if (USE_DEMO_DATA) {

        saveDemoBooking(booking);

      } else {

        await submitBookingToAPI(booking);

      }

    }
  );


  const requestForm =
    document.getElementById(
      "requestForm"
    );


  requestForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const request = {

        serviceName:
          document.getElementById(
            "requestService"
          ).value.trim(),

        location:
          document.getElementById(
            "requestLocation"
          ).value.trim(),

        description:
          document.getElementById(
            "requestDescription"
          ).value.trim(),

        status: "Open",

        createdAt:
          new Date().toISOString()

      };


      if (USE_DEMO_DATA) {

        saveDemoRequest(request);

      } else {

        await submitServiceRequestToAPI(request);

      }

    }
  );


  const referralForm =
    document.getElementById(
      "referralForm"
    );


  referralForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const referral = {

        providerName:
          document.getElementById(
            "referralProvider"
          ).value.trim(),

        service:
          document.getElementById(
            "referralService"
          ).value.trim(),

        comment:
          document.getElementById(
            "referralComment"
          ).value.trim(),

        status: "Submitted",

        createdAt:
          new Date().toISOString()

      };


      if (USE_DEMO_DATA) {

        saveDemoReferral(referral);

      } else {

        await submitReferralToAPI(referral);

      }

    }
  );

}


/* ============================================================
   SUBMIT BOOKING API
============================================================ */

async function submitBookingToAPI(booking) {

  try {

    const token =
      localStorage.getItem("token");


    const response =
      await fetch(
        `${API_BASE}/soko/bookings`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${token}`
          },

          body:
            JSON.stringify(booking)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Booking could not be submitted."
      );

    }


    showNotification(
      "Booking submitted successfully.",
      "success"
    );


    closeBookingModal();

    document
      .getElementById("bookingForm")
      .reset();


    loadBookings();


  } catch (error) {

    console.error(error);

    showNotification(
      error.message,
      "error"
    );

  }

}


/* ============================================================
   SERVICE REQUEST API
============================================================ */

async function submitServiceRequestToAPI(request) {

  try {

    const token =
      localStorage.getItem("token");


    const response =
      await fetch(
        `${API_BASE}/soko/requests`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${token}`
          },

          body:
            JSON.stringify(request)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Service request failed."
      );

    }


    showNotification(
      "Service request submitted.",
      "success"
    );


    closeRequestModal();

    document
      .getElementById("requestForm")
      .reset();


  } catch (error) {

    console.error(error);

    showNotification(
      error.message,
      "error"
    );

  }

}


/* ============================================================
   REFERRAL API
============================================================ */

async function submitReferralToAPI(referral) {

  try {

    const token =
      localStorage.getItem("token");


    const response =
      await fetch(
        `${API_BASE}/soko/referrals`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${token}`
          },

          body:
            JSON.stringify(referral)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Referral could not be submitted."
      );

    }


    showNotification(
      "Provider referral submitted.",
      "success"
    );


    closeReferralModal();

    document
      .getElementById("referralForm")
      .reset();


  } catch (error) {

    console.error(error);

    showNotification(
      error.message,
      "error"
    );

  }

}


/* ============================================================
   BOOKINGS
============================================================ */

async function loadBookings() {

  const container =
    document.getElementById(
      "bookingList"
    );


  if (USE_DEMO_DATA) {

    const bookings =
      JSON.parse(
        localStorage.getItem(
          "athiSokoBookings"
        ) || "[]"
      );


    if (!bookings.length) {

      container.innerHTML = `

        <div class="text-center py-8">

          <div class="text-3xl mb-2">
            📅
          </div>

          <p class="text-slate-400 text-sm">
            You do not have any bookings yet.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      bookings.map(
        renderBooking
      ).join("");


    return;

  }


  try {

    const token =
      localStorage.getItem("token");


    const response =
      await fetch(
        `${API_BASE}/soko/bookings/my`,
        {
          headers: {
            "Authorization":
              `Bearer ${token}`
          }
        }
      );


    const data =
      await response.json();


    const bookings =
      Array.isArray(data)
        ? data
        : data.bookings || [];


    container.innerHTML =
      bookings.length
        ? bookings.map(
            renderBooking
          ).join("")
        : `
          <p class="text-slate-400 text-sm">
            You do not have any bookings yet.
          </p>
        `;


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p class="text-red-400 text-sm">
        Unable to load bookings.
      </p>
    `;

  }

}


/* ============================================================
   RENDER BOOKING
============================================================ */

function renderBooking(booking) {

  const provider =
    providers.find(
      p =>
        p.providerId ===
        booking.providerId
    );


  const providerName =
    provider?.providerName ||
    booking.providerName ||
    "Provider";


  return `

    <div
      class="bg-slate-900/70
             border border-slate-800
             rounded-xl
             p-4"
    >

      <div class="flex justify-between gap-3">

        <div>

          <h4 class="font-semibold">
            ${escapeHtml(providerName)}
          </h4>

          <p class="text-sm text-green-400">
            ${escapeHtml(
              booking.serviceName ||
              "Service"
            )}
          </p>

        </div>


        <span
          class="text-xs
                 px-2 py-1
                 rounded-full
                 bg-yellow-500/10
                 text-yellow-300"
        >
          ${escapeHtml(
            booking.status || "Pending"
          )}
        </span>

      </div>


      <div
        class="grid grid-cols-2
               md:grid-cols-4
               gap-3
               text-xs
               text-slate-400
               mt-4"
      >

        <span>
          📅 ${escapeHtml(
            booking.bookingDate || "-"
          )}
        </span>

        <span>
          🕐 ${escapeHtml(
            booking.bookingTime || "-"
          )}
        </span>

        <span>
          📍 ${escapeHtml(
            booking.houseNumber || "-"
          )}
        </span>

        <span>
          💰 ${booking.estimatedCost
            ? `KSh ${booking.estimatedCost}`
            : "Pending quotation"}
        </span>

      </div>

    </div>

  `;

}


/* ============================================================
   DEMO BOOKING
============================================================ */

function saveDemoBooking(booking) {

  const bookings =
    JSON.parse(
      localStorage.getItem(
        "athiSokoBookings"
      ) || "[]"
    );


  const provider =
    providers.find(
      p =>
        p.providerId ===
        booking.providerId
    );


  booking.providerName =
    provider?.providerName ||
    "Provider";


  booking.serviceName =
    currentService?.name ||
    "Service";


  bookings.push(booking);


  localStorage.setItem(
    "athiSokoBookings",
    JSON.stringify(bookings)
  );


  showNotification(
    "Booking submitted successfully.",
    "success"
  );


  closeBookingModal();


  document
    .getElementById("bookingForm")
    .reset();


  loadBookings();

}


/* ============================================================
   DEMO REQUEST
============================================================ */

function saveDemoRequest(request) {

  const requests =
    JSON.parse(
      localStorage.getItem(
        "athiSokoRequests"
      ) || "[]"
    );


  requests.push(request);


  localStorage.setItem(
    "athiSokoRequests",
    JSON.stringify(requests)
  );


  showNotification(
    "Service request submitted successfully.",
    "success"
  );


  closeRequestModal();


  document
    .getElementById("requestForm")
    .reset();

}


/* ============================================================
   DEMO REFERRAL
============================================================ */

function saveDemoReferral(referral) {

  const referrals =
    JSON.parse(
      localStorage.getItem(
        "athiSokoReferrals"
      ) || "[]"
    );


  referrals.push(referral);


  localStorage.setItem(
    "athiSokoReferrals",
    JSON.stringify(referrals)
  );


  showNotification(
    "Provider referral submitted successfully.",
    "success"
  );


  closeReferralModal();


  document
    .getElementById("referralForm")
    .reset();

}


/* ============================================================
   REQUEST MODAL
============================================================ */

function openRequestModal() {

  document
    .getElementById("requestModal")
    .classList.remove("hidden");

}


function closeRequestModal() {

  document
    .getElementById("requestModal")
    .classList.add("hidden");

}


/* ============================================================
   REFERRAL MODAL
============================================================ */

function openReferralModal() {

  document
    .getElementById("referralModal")
    .classList.remove("hidden");

}


function closeReferralModal() {

  document
    .getElementById("referralModal")
    .classList.add("hidden");

}


/* ============================================================
   REFER CURRENT PROVIDER
============================================================ */

function referCurrentProvider() {

  if (!currentProvider) {

    return;

  }


  closeProviderModal();

  openReferralModal();


  document.getElementById(
    "referralProvider"
  ).value =
    currentProvider.providerName;


  document.getElementById(
    "referralService"
  ).value =
    currentProvider.services?.[0]?.name ||
    currentProvider.category;

}


/* ============================================================
   REPORT PROVIDER
============================================================ */

function reportProvider(providerId) {

  const provider =
    providers.find(
      p =>
        p.providerId === providerId
    );


  if (!provider) {

    return;

  }


  const reason =
    prompt(
      `Report ${provider.providerName}\n\n` +
      `Enter reason:\n` +
      `1. Poor service\n` +
      `2. No-show\n` +
      `3. Misrepresentation\n` +
      `4. Unexpected charge\n` +
      `5. Suspicious activity\n` +
      `6. Other`
    );


  if (!reason) {

    return;

  }


  const complaint = {

    providerId,

    providerName:
      provider.providerName,

    reason,

    status: "Open",

    createdAt:
      new Date().toISOString()

  };


  const complaints =
    JSON.parse(
      localStorage.getItem(
        "athiSokoComplaints"
      ) || "[]"
    );


  complaints.push(complaint);


  localStorage.setItem(
    "athiSokoComplaints",
    JSON.stringify(complaints)
  );


  showNotification(
    "Provider report submitted to estate administration.",
    "success"
  );

}


/* ============================================================
   PROVIDER REGISTRATION
============================================================ */

function openProviderModal() {

  const modal =
    document.getElementById(
      "providerModal"
    );

  const title =
    document.getElementById(
      "providerModalTitle"
    );

  const content =
    document.getElementById(
      "providerModalContent"
    );


  title.textContent =
    "Register as a Service Provider";


  content.innerHTML = `

    <form
      id="providerRegistrationForm"
      class="space-y-4"
    >

      <div>

        <label class="block text-sm mb-1">
          Business / Provider Name
        </label>

        <input
          id="providerBusinessName"
          required
          class="w-full bg-slate-900
                 border border-slate-700
                 rounded-xl px-4 py-3"
        >

      </div>


      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

        <div>

          <label class="block text-sm mb-1">
            Contact Person
          </label>

          <input
            id="providerContactPerson"
            required
            class="w-full bg-slate-900
                   border border-slate-700
                   rounded-xl px-4 py-3"
          >

        </div>


        <div>

          <label class="block text-sm mb-1">
            Phone
          </label>

          <input
            id="providerPhone"
            required
            class="w-full bg-slate-900
                   border border-slate-700
                   rounded-xl px-4 py-3"
          >

        </div>

      </div>


      <div>

        <label class="block text-sm mb-1">
          Email
        </label>

        <input
          id="providerEmail"
          type="email"
          class="w-full bg-slate-900
                 border border-slate-700
                 rounded-xl px-4 py-3"
        >

      </div>


      <div>

        <label class="block text-sm mb-1">
          Category
        </label>

        <select
          id="providerCategory"
          required
          class="w-full bg-slate-900
                 border border-slate-700
                 rounded-xl px-4 py-3"
        >

          <option value="">
            Select category
          </option>

          <option>
            Home & Maintenance
          </option>

          <option>
            Food & Agriculture
          </option>

          <option>
            Shopping
          </option>

          <option>
            Transport & Mobility
          </option>

          <option>
            Personal Care
          </option>

          <option>
            Education
          </option>

          <option>
            Community & Faith
          </option>

          <option>
            Professional & Other
          </option>

        </select>

      </div>


      <div>

        <label class="block text-sm mb-1">
          Services Offered
        </label>

        <input
          id="providerServices"
          required
          placeholder="e.g. Plumbing, Tap Repair, Pipe Repair"
          class="w-full bg-slate-900
                 border border-slate-700
                 rounded-xl px-4 py-3"
        >

      </div>


      <div>

        <label class="block text-sm mb-1">
          Location / Court
        </label>

        <input
          id="providerLocation"
          required
          placeholder="e.g. Riverside"
          class="w-full bg-slate-900
                 border border-slate-700
                 rounded-xl px-4 py-3"
        >

      </div>


      <div>

        <label class="block text-sm mb-1">
          Description
        </label>

        <textarea
          id="providerDescription"
          rows="4"
          required
          class="w-full bg-slate-900
                 border border-slate-700
                 rounded-xl px-4 py-3"
        ></textarea>

      </div>


      <div>

        <label class="block text-sm mb-1">
          Operating Hours
        </label>

        <input
          id="providerHours"
          placeholder="e.g. Monday–Saturday 8:00 AM–6:00 PM"
          class="w-full bg-slate-900
                 border border-slate-700
                 rounded-xl px-4 py-3"
        >

      </div>


      <button
        type="submit"
        class="w-full
               bg-green-600
               hover:bg-green-700
               py-3
               rounded-xl
               font-semibold"
      >
        Submit Provider Registration
      </button>


      <p class="text-xs text-slate-500">

        New providers are initially registered as
        <strong>Verification Pending</strong>.
        Estate administration can review the submitted
        information before granting verified status.

      </p>

    </form>

  `;


  modal.classList.remove("hidden");


  document
    .getElementById(
      "providerRegistrationForm"
    )
    .addEventListener(
      "submit",
      submitProviderRegistration
    );

}


/* ============================================================
   SUBMIT PROVIDER REGISTRATION
============================================================ */

async function submitProviderRegistration(event) {

  event.preventDefault();


  const provider = {

    providerName:
      document.getElementById(
        "providerBusinessName"
      ).value.trim(),

    contactPerson:
      document.getElementById(
        "providerContactPerson"
      ).value.trim(),

    phone:
      document.getElementById(
        "providerPhone"
      ).value.trim(),

    email:
      document.getElementById(
        "providerEmail"
      ).value.trim(),

    category:
      document.getElementById(
        "providerCategory"
      ).value,

    services:
      document.getElementById(
        "providerServices"
      ).value.trim(),

    location:
      document.getElementById(
        "providerLocation"
      ).value.trim(),

    description:
      document.getElementById(
        "providerDescription"
      ).value.trim(),

    hours:
      document.getElementById(
        "providerHours"
      ).value.trim(),

    verificationStatus:
      "Pending",

    status:
      "Active",

    createdAt:
      new Date().toISOString()

  };


  if (USE_DEMO_DATA) {

    const registrations =
      JSON.parse(
        localStorage.getItem(
          "athiSokoProviderRegistrations"
        ) || "[]"
      );


    registrations.push(provider);


    localStorage.setItem(
      "athiSokoProviderRegistrations",
      JSON.stringify(registrations)
    );


    showNotification(
      "Provider registration submitted for review.",
      "success"
    );


    closeProviderModal();


    return;

  }


  try {

    const token =
      localStorage.getItem("token");


    const response =
      await fetch(
        `${API_BASE}/soko/providers/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${token}`
          },

          body:
            JSON.stringify(provider)
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Provider registration failed."
      );

    }


    showNotification(
      "Provider registration submitted.",
      "success"
    );


    closeProviderModal();


  } catch (error) {

    console.error(error);

    showNotification(
      error.message,
      "error"
    );

  }

}


/* ============================================================
   SHOW SECTION
============================================================ */

function showSection(sectionId) {

  const element =
    document.getElementById(
      sectionId
    );


  if (!element) {

    return;

  }


  element.scrollIntoView({
    behavior: "smooth"
  });

}


/* ============================================================
   NOTIFICATION
============================================================ */

function showNotification(
  message,
  type = "success"
) {

  const notification =
    document.createElement("div");


  notification.className =
    `
      fixed
      top-5
      right-5
      z-[999]
      max-w-sm
      px-5
      py-4
      rounded-xl
      shadow-2xl
      border
      ${
        type === "error"
          ? "bg-red-950 border-red-700 text-red-200"
          : "bg-green-950 border-green-700 text-green-200"
      }
    `;


  notification.innerHTML = `

    <div class="flex items-start gap-3">

      <span class="text-xl">
        ${type === "error" ? "⚠️" : "✓"}
      </span>

      <p class="text-sm">
        ${escapeHtml(message)}
      </p>

    </div>

  `;


  document.body.appendChild(
    notification
  );


  setTimeout(() => {

    notification.remove();

  }, 4000);

}


/* ============================================================
   FORMAT PRICE
============================================================ */

function formatPrice(
  from,
  to
) {

  if (
    from === undefined ||
    from === null
  ) {

    return "Contact";

  }


  const fromFormatted =
    Number(from).toLocaleString(
      "en-KE"
    );


  if (
    to !== undefined &&
    to !== null &&
    Number(to) !== Number(from)
  ) {

    return `KSh ${fromFormatted}–${Number(to).toLocaleString("en-KE")}`;

  }


  return `KSh ${fromFormatted}+`;

}


/* ============================================================
   NORMALIZE WHATSAPP PHONE
============================================================ */

function normalizePhone(phone) {

  if (!phone) {

    return "";

  }


  let number =
    phone.replace(/\D/g, "");


  if (number.startsWith("0")) {

    number =
      "254" + number.substring(1);

  }


  if (!number.startsWith("254")) {

    number =
      "254" + number;

  }


  return number;

}


/* ============================================================
   ESCAPE HTML
   Prevents user/provider data from injecting HTML.
============================================================ */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

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
   CLOSE MODALS WHEN CLICKING BACKDROP
============================================================ */

document.addEventListener(
  "click",
  event => {

    const modals = [
      "providerModal",
      "bookingModal",
      "requestModal",
      "referralModal"
    ];


    modals.forEach(id => {

      const modal =
        document.getElementById(id);


      if (
        event.target === modal
      ) {

        modal.classList.add(
          "hidden"
        );

      }

    });

  }
);


/* ============================================================
   ESCAPE KEY
============================================================ */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) {

      return;

    }


    closeProviderModal();

    closeBookingModal();

    closeRequestModal();

    closeReferralModal();

  }
);


/* ============================================================
   EXPORT GLOBAL FUNCTIONS

   Allows inline HTML onclick handlers to access them.
============================================================ */

window.viewProvider =
  viewProvider;

window.startBooking =
  startBooking;

window.closeProviderModal =
  closeProviderModal;

window.closeBookingModal =
  closeBookingModal;

window.openRequestModal =
  openRequestModal;

window.closeRequestModal =
  closeRequestModal;

window.openReferralModal =
  openReferralModal;

window.closeReferralModal =
  closeReferralModal;

window.openProviderModal =
  openProviderModal;

window.referCurrentProvider =
  referCurrentProvider;

window.reportProvider =
  reportProvider;

window.showSection =
  showSection;

window.loadBookings =
  loadBookings;
```
