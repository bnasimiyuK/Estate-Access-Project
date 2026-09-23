const API_BASE = "http://localhost:4050/api";

const params = new URLSearchParams(window.location.search);

const serviceId = params.get("id");

document.addEventListener("DOMContentLoaded", loadServiceDetails);

async function loadServiceDetails() {

    if (!serviceId) {
        showError("No service was selected.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/services/${serviceId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load service.");
        }

        const data = await response.json();

        displayProvider(data);

    } catch (error) {

        console.error(error);

        /*
         * For development you can temporarily
         * retrieve the service from localStorage.
         */

        const stored =
            localStorage.getItem("selectedService");

        if (stored) {

            displayProvider({
                service: JSON.parse(stored),
                services: [],
                reviews: []
            });

        } else {

            showError("Unable to load service information.");

        }
    }
}


function displayProvider(data) {

    const service = data.service;

    const profile =
        document.getElementById("providerProfile");

    profile.innerHTML = `

        <div class="provider-header">

            <div>

                <h1>
                    ${escapeHTML(service.provider)}
                </h1>

                <p>
                    ${escapeHTML(service.name)}
                </p>

                <p>
                    <i class="fa-solid fa-location-dot"></i>
                    ${escapeHTML(service.court)}
                </p>

            </div>

            ${
                service.verified
                    ? `
                        <span class="verified">
                            <i class="fa-solid fa-circle-check"></i>
                            Verified
                        </span>
                    `
                    : ""
            }

        </div>

        <hr>

        <p>
            ${escapeHTML(service.description)}
        </p>

        <p class="rating">
            ${generateStars(service.rating)}

            ${service.rating}
            (${service.reviews} reviews)
        </p>

        <p class="price">
            KES ${Number(service.price).toLocaleString()}
            ${escapeHTML(service.priceUnit)}
        </p>

        <button
            class="primary"
            onclick="bookService(${service.id})"
        >
            <i class="fa-solid fa-calendar-plus"></i>
            Request Service
        </button>

        <button
            class="danger"
            onclick="reportProvider(${service.id})"
        >
            <i class="fa-solid fa-flag"></i>
            Report Provider
        </button>

    `;
}


function bookService(id) {

    window.location.href =
        `service-booking.html?id=${id}`;
}


function reportProvider(id) {

    window.location.href =
        `report-provider.html?serviceId=${id}`;
}


function generateStars(rating) {

    let result = "";

    for (let i = 1; i <= 5; i++) {

        result += i <= Math.round(rating)
            ? '<i class="fa-solid fa-star"></i>'
            : '<i class="fa-regular fa-star"></i>';
    }

    return result;
}


function showError(message) {

    document.getElementById("providerProfile").innerHTML =
        `<p>${escapeHTML(message)}</p>`;
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}