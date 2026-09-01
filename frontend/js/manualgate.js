// manualgatecontrol.js

(() => {

```
"use strict";


// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const manualGateForm =
    document.getElementById("manualGateForm");

const tableBody =
    document.getElementById("manualAccessTableBody");

const emptyState =
    document.getElementById("emptyManualAccess");

const searchInput =
    document.getElementById("searchManualAccess");

const entriesToday =
    document.getElementById("manualEntriesToday");

const exitsToday =
    document.getElementById("manualExitsToday");

const currentlyInside =
    document.getElementById("currentlyInside");


// ==========================================
// 2. CHECK REQUIRED ELEMENTS
// ==========================================

if (!manualGateForm || !tableBody) {

    console.error(
        "❌ Manual Gate Control: Required HTML elements were not found."
    );

    return;
}


// ==========================================
// 3. LOAD SAVED RECORDS
// ==========================================

let manualRecords = [];

try {

    manualRecords =
        JSON.parse(
            localStorage.getItem("manualGateRecords")
        ) || [];

} catch (error) {

    console.error(
        "❌ Failed to load manual gate records:",
        error
    );

    manualRecords = [];
}


// ==========================================
// 4. SAVE RECORDS
// ==========================================

function saveRecords() {

    try {

        localStorage.setItem(
            "manualGateRecords",
            JSON.stringify(manualRecords)
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Failed to save manual gate records:",
            error
        );

        return false;
    }
}


// ==========================================
// 5. ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// 6. FORMAT DATE AND TIME
// ==========================================

function formatDateTime(timestamp) {

    const date =
        new Date(timestamp);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";
    }

    return date.toLocaleString();
}


// ==========================================
// 7. UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const today =
        new Date().toDateString();


    const todaysRecords =
        manualRecords.filter(record => {

            if (!record.timestamp) {
                return false;
            }

            const recordDate =
                new Date(record.timestamp);

            return (
                !Number.isNaN(
                    recordDate.getTime()
                ) &&
                recordDate.toDateString() === today
            );

        });


    const entryCount =
        todaysRecords.filter(
            record =>
                record.accessType === "ENTRY"
        ).length;


    const exitCount =
        todaysRecords.filter(
            record =>
                record.accessType === "EXIT"
        ).length;


    const insideCount =
        Math.max(
            entryCount - exitCount,
            0
        );


    if (entriesToday) {

        entriesToday.textContent =
            entryCount;
    }


    if (exitsToday) {

        exitsToday.textContent =
            exitCount;
    }


    if (currentlyInside) {

        currentlyInside.textContent =
            insideCount;
    }
}


// ==========================================
// 8. RENDER TABLE
// ==========================================

function renderRecords(
    records = manualRecords
) {

    tableBody.innerHTML = "";


    if (
        !records ||
        records.length === 0
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );
        }

        return;
    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );
    }


    // Newest records first
    const sortedRecords =
        [...records].sort(
            (a, b) =>
                new Date(b.timestamp) -
                new Date(a.timestamp)
        );


    sortedRecords.forEach(record => {

        const row =
            document.createElement("tr");


        // ==================================
        // ENTRY / EXIT BADGE
        // ==================================

        let actionBadge;


        if (
            record.accessType === "ENTRY"
        ) {

            actionBadge = `
                <span
                    class="px-3 py-1 text-xs font-semibold
                           rounded-full bg-green-100 text-green-700">
                    ENTRY
                </span>
            `;

        } else {

            actionBadge = `
                <span
                    class="px-3 py-1 text-xs font-semibold
                           rounded-full bg-blue-100 text-blue-700">
                    EXIT
                </span>
            `;
        }


        // ==================================
        // CREATE TABLE ROW
        // ==================================

        row.innerHTML = `

            <td class="px-6 py-4 whitespace-nowrap">

                <div class="font-medium text-gray-800">

                    ${escapeHTML(
                        record.visitorName
                    )}

                </div>

                <div class="text-sm text-gray-500">

                    ${escapeHTML(
                        record.visitorPhone
                    )}

                </div>

            </td>


            <td class="px-6 py-4 whitespace-nowrap
                       text-sm text-gray-700">

                ${escapeHTML(
                    record.houseNumber
                )}

            </td>


            <td class="px-6 py-4 whitespace-nowrap
                       text-sm text-gray-700">

                ${escapeHTML(
                    record.gate
                )}

            </td>


            <td class="px-6 py-4 whitespace-nowrap">

                ${actionBadge}

            </td>


            <td class="px-6 py-4 whitespace-nowrap
                       text-sm text-gray-500">

                ${formatDateTime(
                    record.timestamp
                )}

            </td>


            <td class="px-6 py-4 whitespace-nowrap">

                <span
                    class="px-3 py-1 text-xs font-semibold
                           rounded-full bg-gray-100 text-gray-700">

                    Recorded

                </span>

            </td>

        `;


        tableBody.appendChild(row);

    });
}


// ==========================================
// 9. GET FORM VALUE
// ==========================================

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";
}


// ==========================================
// 10. VALIDATE PHONE NUMBER
// ==========================================

function isValidPhone(phone) {

    return (
        /^07\d{8}$/.test(phone) ||
        /^\+2547\d{8}$/.test(phone) ||
        /^2547\d{8}$/.test(phone)
    );
}


// ==========================================
// 11. SUBMIT FORM
// ==========================================

manualGateForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ----------------------------------
        // Get values
        // ----------------------------------

        const visitorName =
            getValue("visitorName");

        const visitorPhone =
            getValue("visitorPhone");

        const visitorId =
            getValue("visitorId");

        const houseNumber =
            getValue("houseNumber");

        const gate =
            getValue("gate");

        const accessType =
            getValue("accessType");

        const reason =
            getValue("reason");


        // ----------------------------------
        // Validate visitor name
        // ----------------------------------

        if (!visitorName) {

            alert(
                "Please enter the visitor's name."
            );

            return;
        }


        // ----------------------------------
        // Validate phone
        // ----------------------------------

        if (!visitorPhone) {

            alert(
                "Please enter the visitor's phone number."
            );

            return;
        }


        if (
            !isValidPhone(
                visitorPhone
            )
        ) {

            alert(
                "Please enter a valid Kenyan phone number.\n\n" +
                "Examples:\n" +
                "07XXXXXXXX\n" +
                "+2547XXXXXXXX\n" +
                "2547XXXXXXXX"
            );

            return;
        }


        // ----------------------------------
        // Validate ID
        // ----------------------------------

        if (!visitorId) {

            alert(
                "Please enter the visitor ID or passport number."
            );

            return;
        }


        // ----------------------------------
        // Validate house
        // ----------------------------------

        if (!houseNumber) {

            alert(
                "Please enter the house number or resident."
            );

            return;
        }


        // ----------------------------------
        // Validate gate
        // ----------------------------------

        if (!gate) {

            alert(
                "Please select a gate."
            );

            return;
        }


        // ----------------------------------
        // Validate access type
        // ----------------------------------

        if (!accessType) {

            alert(
                "Please select Entry or Exit."
            );

            return;
        }


        // ----------------------------------
        // Validate reason
        // ----------------------------------

        if (!reason) {

            alert(
                "Please provide the reason for manual access."
            );

            return;
        }


        // ==================================
        // CREATE RECORD
        // ==================================

        const record = {

            id:
                Date.now().toString(),

            visitorName:
                visitorName,

            visitorPhone:
                visitorPhone,

            visitorId:
                visitorId,

            houseNumber:
                houseNumber,

            gate:
                gate,

            accessType:
                accessType,

            reason:
                reason,

            timestamp:
                new Date().toISOString(),

            recordedBy:
                localStorage.getItem(
                    "userName"
                ) ||
                localStorage.getItem(
                    "fullName"
                ) ||
                "Security Officer"

        };


        // ==================================
        // ADD RECORD
        // ==================================

        manualRecords.push(
            record
        );


        // ==================================
        // SAVE RECORD
        // ==================================

        const saved =
            saveRecords();


        if (!saved) {

            alert(
                "The gate access could not be saved."
            );

            return;
        }


        // ==================================
        // REFRESH TABLE
        // ==================================

        renderRecords();

        updateStatistics();


        // ==================================
        // CLEAR FORM
        // ==================================

        manualGateForm.reset();


        // ==================================
        // SUCCESS MESSAGE
        // ==================================

        alert(
            "Gate access recorded successfully."
        );


        console.log(
            "✅ Manual gate access recorded:",
            record
        );

    }
);


// ==========================================
// 12. SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function (event) {

            const searchTerm =
                event.target.value
                    .toLowerCase()
                    .trim();


            if (!searchTerm) {

                renderRecords();

                return;
            }


            const filteredRecords =
                manualRecords.filter(
                    record => {

                        const name =
                            String(
                                record.visitorName || ""
                            ).toLowerCase();


                        const phone =
                            String(
                                record.visitorPhone || ""
                            ).toLowerCase();


                        const house =
                            String(
                                record.houseNumber || ""
                            ).toLowerCase();


                        const gate =
                            String(
                                record.gate || ""
                            ).toLowerCase();


                        const id =
                            String(
                                record.visitorId || ""
                            ).toLowerCase();


                        return (
                            name.includes(
                                searchTerm
                            ) ||

                            phone.includes(
                                searchTerm
                            ) ||

                            house.includes(
                                searchTerm
                            ) ||

                            gate.includes(
                                searchTerm
                            ) ||

                            id.includes(
                                searchTerm
                            )
                        );

                    }
                );


            renderRecords(
                filteredRecords
            );

        }
    );
}


// ==========================================
// 13. INITIALIZE
// ==========================================

renderRecords();

updateStatistics();


console.log(
    "🛡️ Manual Gate Control initialized successfully."
);
```

})();
