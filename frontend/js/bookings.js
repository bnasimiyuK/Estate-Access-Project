async function loadMyBookings() {

    const token =
        localStorage.getItem("token");

    const response = await fetch(
        `${API_BASE}/service-requests/my`,
        {
            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );

    const data =
        await response.json();

    renderBookings(data.requests);
}


function renderBookings(requests) {

    const container =
        document.getElementById("bookingsContainer");

    container.innerHTML = "";

    requests.forEach(request => {

        const card =
            document.createElement("div");

        card.className = "booking-card";

        card.innerHTML = `

            <h3>
                ${escapeHTML(request.serviceName)}
            </h3>

            <p>
                Provider:
                ${escapeHTML(request.providerName)}
            </p>

            <p>
                Requested:
                ${escapeHTML(request.requestDate)}
            </p>

            <strong>
                Status:
                ${escapeHTML(request.status)}
            </strong>

        `;

        container.appendChild(card);

    });
}