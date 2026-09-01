/* ============================================================
   ATHI ESTATE
   HARDWARE & GATE MONITORING
   ============================================================ */

const API_BASE_URL = "http://localhost:4050/api/hardware";


/* ============================================================
   DOM HELPERS
   ============================================================ */

const $ = (id) => document.getElementById(id);


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(value) {

    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleString();
}


/* ============================================================
   STATUS BADGE
   ============================================================ */

function statusBadge(status) {

    const value = String(status || "UNKNOWN").toUpperCase();

    let classes =
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ";

    switch (value) {

        case "ONLINE":
        case "OPEN":
        case "CLOSED":

            classes +=
                "bg-green-100 text-green-700";

            break;


        case "OPENING":
        case "CLOSING":
            classes +=
                "bg-yellow-100 text-yellow-700";

            break;


        case "FAULT":
            classes +=
                "bg-red-100 text-red-700";

            break;


        case "OFFLINE":
            classes +=
                "bg-gray-100 text-gray-600";

            break;


        default:
            classes +=
                "bg-gray-100 text-gray-600";
    }


    return `
        <span class="${classes}">
            <span class="status-dot
                ${
                    value === "ONLINE" ||
                    value === "OPEN" ||
                    value === "CLOSED"
                        ? "online-dot"
                        : value === "FAULT"
                            ? "offline-dot"
                            : "warning-dot"
                }">
            </span>

            ${escapeHtml(value)}
        </span>
    `;
}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ============================================================
   FETCH JSON
   ============================================================ */

async function fetchJSON(url, options = {}) {

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });


    if (!response.ok) {

        let errorMessage =
            `HTTP ${response.status}`;

        try {

            const errorData =
                await response.json();

            if (errorData.message) {
                errorMessage = errorData.message;
            }

        } catch {
            // Ignore invalid JSON error responses
        }

        throw new Error(errorMessage);
    }


    return response.json();
}


/* ============================================================
   LOAD SUMMARY
   ============================================================ */

async function loadSummary() {

    try {

        const data =
            await fetchJSON(
                `${API_BASE_URL}/summary`
            );


        if (!data.success) {
            throw new Error(
                data.message || "Failed to load summary"
            );
        }


        const summary =
            data.summary || {};


        $("totalDevices").textContent =
            summary.TotalDevices ?? 0;


        $("onlineDevices").textContent =
            summary.OnlineDevices ?? 0;


        $("offlineDevices").textContent =
            summary.OfflineDevices ?? 0;


        $("totalBarriers").textContent =
            summary.TotalBarriers ?? 0;


    } catch (error) {

        console.error(
            "Hardware summary error:",
            error
        );

    }
}


/* ============================================================
   LOAD BARRIERS
   ============================================================ */

async function loadBarriers() {

    const table =
        $("barriersTable");


    try {

        const data =
            await fetchJSON(
                `${API_BASE_URL}/barriers`
            );


        if (!data.success) {
            throw new Error(
                data.message || "Failed to load barriers"
            );
        }


        const barriers =
            data.barriers || [];


        if (barriers.length === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="px-6 py-10 text-center text-gray-400"
                    >
                        No gate barriers registered.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            barriers.map(barrier => `

                <tr class="hover:bg-gray-50">

                    <td class="px-6 py-4">

                        <div class="font-semibold text-gray-800">
                            ${escapeHtml(barrier.BarrierName)}
                        </div>

                        <div class="text-xs text-gray-400">
                            ID: ${escapeHtml(barrier.BarrierID)}
                        </div>

                    </td>


                    <td class="px-6 py-4 text-sm text-gray-700">
                        ${escapeHtml(barrier.GateName)}
                    </td>


                    <td class="px-6 py-4 text-sm text-gray-700">
                        ${escapeHtml(barrier.Direction || "—")}
                    </td>


                    <td class="px-6 py-4">

                        ${statusBadge(
                            barrier.BarrierStatus
                        )}

                    </td>


                    <td class="px-6 py-4">

                        <div class="text-sm font-medium text-gray-700">
                            ${escapeHtml(barrier.DeviceName)}
                        </div>

                        <div class="text-xs text-gray-400">
                            ${escapeHtml(barrier.DeviceCode)}
                        </div>

                        <div class="mt-1">
                            ${statusBadge(
                                barrier.DeviceStatus
                            )}
                        </div>

                    </td>


                    <td class="px-6 py-4 text-sm text-gray-500">
                        ${formatDate(
                            barrier.LastHeartbeat
                        )}
                    </td>

                </tr>

            `).join("");


    } catch (error) {

        console.error(
            "Barrier loading error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="px-6 py-10 text-center text-red-500"
                >
                    Failed to load gate barriers.
                </td>
            </tr>
        `;
    }
}


/* ============================================================
   LOAD DEVICES
   ============================================================ */

async function loadDevices() {

    const table =
        $("devicesTable");


    try {

        const data =
            await fetchJSON(
                `${API_BASE_URL}/devices`
            );


        if (!data.success) {
            throw new Error(
                data.message || "Failed to load devices"
            );
        }


        const devices =
            data.devices || [];


        if (devices.length === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="px-6 py-10 text-center text-gray-400"
                    >
                        No IoT devices registered.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            devices.map(device => {

                const signal =
                    device.SignalStrength !== null &&
                    device.SignalStrength !== undefined
                        ? `${device.SignalStrength}%`
                        : "—";


                return `

                    <tr class="hover:bg-gray-50">

                        <td class="px-6 py-4">

                            <div class="font-semibold text-gray-800">
                                ${escapeHtml(
                                    device.DeviceName
                                )}
                            </div>

                            <div class="text-xs text-gray-400">
                                ${escapeHtml(
                                    device.DeviceCode
                                )}
                            </div>

                        </td>


                        <td class="px-6 py-4 text-sm text-gray-700">

                            ${escapeHtml(
                                device.DeviceType
                            )}

                        </td>


                        <td class="px-6 py-4 text-sm text-gray-700">

                            ${escapeHtml(
                                device.GateName || "—"
                            )}

                        </td>


                        <td class="px-6 py-4">

                            ${statusBadge(
                                device.Status
                            )}

                        </td>


                        <td class="px-6 py-4 text-sm text-gray-700">

                            ${escapeHtml(
                                device.IPAddress || "—"
                            )}

                        </td>


                        <td class="px-6 py-4 text-sm text-gray-700">

                            ${signal}

                        </td>


                        <td class="px-6 py-4 text-sm text-gray-500">

                            ${formatDate(
                                device.LastSeen
                            )}

                        </td>

                    </tr>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Device loading error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="px-6 py-10 text-center text-red-500"
                >
                    Failed to load IoT devices.
                </td>
            </tr>
        `;
    }
}


/* ============================================================
   LOAD EVENTS
   ============================================================ */

async function loadEvents() {

    const container =
        $("eventsContainer");


    try {

        const data =
            await fetchJSON(
                `${API_BASE_URL}/events?limit=20`
            );


        if (!data.success) {
            throw new Error(
                data.message || "Failed to load events"
            );
        }


        const events =
            data.events || [];


        if (events.length === 0) {

            container.innerHTML = `
                <div class="p-6 text-center text-gray-400">
                    No hardware events recorded.
                </div>
            `;

            return;
        }


        container.innerHTML =
            events.map(event => `

                <div class="px-6 py-4">

                    <div class="flex items-start justify-between gap-4">

                        <div>

                            <div class="flex items-center gap-3">

                                <span class="font-semibold text-gray-800">
                                    ${escapeHtml(
                                        event.EventType
                                    )}
                                </span>

                                ${statusBadge(
                                    event.EventStatus
                                )}

                            </div>


                            <p class="text-sm text-gray-600 mt-1">

                                ${escapeHtml(
                                    event.Description || "Hardware event"
                                )}

                            </p>


                            <p class="text-xs text-gray-400 mt-1">

                                ${
                                    escapeHtml(
                                        event.DeviceName || "Unknown device"
                                    )
                                }

                                ${
                                    event.GateName
                                        ? ` · ${escapeHtml(event.GateName)}`
                                        : ""
                                }

                            </p>

                        </div>


                        <div class="text-xs text-gray-400 whitespace-nowrap">

                            ${formatDate(
                                event.CreatedAt
                            )}

                        </div>

                    </div>

                </div>

            `).join("");


    } catch (error) {

        console.error(
            "Event loading error:",
            error
        );


        container.innerHTML = `
            <div class="p-6 text-center text-red-500">
                Failed to load hardware events.
            </div>
        `;
    }
}


/* ============================================================
   CHECK OFFLINE DEVICES
   ============================================================ */

async function checkOfflineDevices() {

    try {

        await fetchJSON(
            `${API_BASE_URL}/check-offline`,
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.error(
            "Offline device check failed:",
            error
        );

    }
}


/* ============================================================
   LOAD EVERYTHING
   ============================================================ */

async function loadHardwareData() {

    try {

        await checkOfflineDevices();

        await Promise.all([
            loadSummary(),
            loadBarriers(),
            loadDevices(),
            loadEvents()
        ]);


        $("lastUpdated").textContent =
            new Date().toLocaleTimeString();

    } catch (error) {

        console.error(
            "Hardware monitoring error:",
            error
        );

    }
}


/* ============================================================
   MANUAL REFRESH
   ============================================================ */

$("refreshBtn").addEventListener(
    "click",
    async () => {

        const button =
            $("refreshBtn");


        button.disabled = true;

        button.textContent =
            "Refreshing...";


        await loadHardwareData();


        button.disabled = false;

        button.textContent =
            "Refresh";
    }
);


/* ============================================================
   AUTOMATIC REAL-TIME REFRESH
   ============================================================ */

loadHardwareData();


/*
   Refresh every 10 seconds.

   This means the frontend will continuously retrieve
   current database values without requiring the user
   to reload the browser.
*/

setInterval(
    loadHardwareData,
    10000
);