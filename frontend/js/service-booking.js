const API_BASE = "http://localhost:4050/api";

const bookingForm =
    document.getElementById("bookingForm");

const params =
    new URLSearchParams(window.location.search);

const serviceId =
    params.get("id");

const token =
    localStorage.getItem("token");


document.addEventListener(
    "DOMContentLoaded",
    loadService
);


async function loadService() {

    const stored =
        localStorage.getItem("selectedService");

    if (!stored) {
        return;
    }

    const service =
        JSON.parse(stored);

    document.getElementById("serviceName").value =
        `${service.name} - ${service.provider}`;
}


bookingForm.addEventListener(
    "submit",
    submitBooking
);


async function submitBooking(event) {

    event.preventDefault();

    const booking = {

        serviceId: Number(serviceId),

        preferredDate:
            document.getElementById(
                "preferredDate"
            ).value,

        preferredTime:
            document.getElementById(
                "preferredTime"
            ).value,

        requestDetails:
            document.getElementById(
                "requestDetails"
            ).value,

        additionalInformation:
            document.getElementById(
                "additionalInformation"
            ).value

    };


    try {

        const response = await fetch(
            `${API_BASE}/service-requests`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(booking)
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to submit request."
            );

        }


        alert(
            "Service request submitted successfully."
        );


        window.location.href =
            "my-bookings.html";


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}