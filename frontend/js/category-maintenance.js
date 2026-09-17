"use strict";

/*
 * ============================================================
 * ATHI ESTATE CONNECT
 * CATEGORY MAINTENANCE
 * ============================================================
 */

const API_BASE = "http://localhost:4050/api";
const STORAGE_KEY = "athiEstateServiceCategories";


/* ============================================================
   DEFAULT CATEGORY DATA
   ============================================================ */

const defaultCategories = [
    {
        id: 1,
        name: "Cleaning",
        description: "House cleaning, office cleaning and general cleaning services.",
        icon: "fa-broom",
        status: "Active",
        serviceCount: 18,
        createdDate: "2026-01-15"
    },
    {
        id: 2,
        name: "Plumbing",
        description: "Plumbing installation, repairs, drainage and leak detection.",
        icon: "fa-faucet-drip",
        status: "Active",
        serviceCount: 12,
        createdDate: "2026-01-18"
    },
    {
        id: 3,
        name: "Electrical",
        description: "Electrical installation, repairs, lighting and troubleshooting.",
        icon: "fa-bolt",
        status: "Active",
        serviceCount: 14,
        createdDate: "2026-01-20"
    },
    {
        id: 4,
        name: "Security",
        description: "Security assessments, CCTV support and home security services.",
        icon: "fa-shield-halved",
        status: "Active",
        serviceCount: 8,
        createdDate: "2026-02-02"
    },
    {
        id: 5,
        name: "Gardening",
        description: "Lawn care, gardening, landscaping and compound maintenance.",
        icon: "fa-seedling",
        status: "Active",
        serviceCount: 9,
        createdDate: "2026-02-05"
    },
    {
        id: 6,
        name: "Beauty & Wellness",
        description: "Beauty, personal care and wellness services for residents.",
        icon: "fa-spa",
        status: "Active",
        serviceCount: 11,
        createdDate: "2026-02-10"
    },
    {
        id: 7,
        name: "Transport",
        description: "Local transport, delivery and scheduled transportation services.",
        icon: "fa-car",
        status: "Active",
        serviceCount: 15,
        createdDate: "2026-02-13"
    },
    {
        id: 8,
        name: "Repairs & Maintenance",
        description: "General handyman, furniture, appliance and household repairs.",
        icon: "fa-screwdriver-wrench",
        status: "Active",
        serviceCount: 21,
        createdDate: "2026-02-20"
    },
    {
        id: 9,
        name: "Food & Catering",
        description: "Home catering, food delivery, baking and event catering.",
        icon: "fa-utensils",
        status: "Active",
        serviceCount: 16,
        createdDate: "2026-03-01"
    },
    {
        id: 10,
        name: "Tutoring",
        description: "Academic tutoring, homework support and educational services.",
        icon: "fa-book-open",
        status: "Active",
        serviceCount: 7,
        createdDate: "2026-03-05"
    },
    {
        id: 11,
        name: "Technology",
        description: "Computer support, networking, Wi-Fi and technology services.",
        icon: "fa-laptop",
        status: "Active",
        serviceCount: 10,
        createdDate: "2026-03-09"
    },
    {
        id: 12,
        name: "Laundry",
        description: "Laundry, ironing, dry cleaning and clothes care services.",
        icon: "fa-shirt",
        status: "Inactive",
        serviceCount: 4,
        createdDate: "2026-03-12"
    }
];


/* ============================================================
   APPLICATION STATE
   ============================================================ */

let categories = [];
let editingCategoryId = null;


/* ============================================================
   DOM REFERENCES
   ============================================================ */

let addCategoryBtn;
let categoryModal;
let categoryForm;
let modalTitle;
let categoryId;
let categoryName;
let categoryDescription;
let categoryIcon;
let categoryStatus;
let closeModalBtn;
let cancelModalBtn;
let categorySearch;
let statusFilter;
let sortFilter;
let categoryTableBody;
let emptyState;
let totalCategories;
let activeCategories;
let inactiveCategories;
let totalServices;
let adminName;
let toast;


/* ============================================================
   INITIALIZE AFTER HTML HAS LOADED
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    console.log("==========================================");
    console.log("Athi Estate Connect");
    console.log("Category Maintenance JavaScript loaded");
    console.log("==========================================");

    initializeElements();

    initializePage();

});


/* ============================================================
   INITIALIZE DOM ELEMENTS
   ============================================================ */

function initializeElements() {

    addCategoryBtn = document.getElementById("addCategoryBtn");

    categoryModal = document.getElementById("categoryModal");

    categoryForm = document.getElementById("categoryForm");

    modalTitle = document.getElementById("modalTitle");

    categoryId = document.getElementById("categoryId");

    categoryName = document.getElementById("categoryName");

    categoryDescription = document.getElementById("categoryDescription");

    categoryIcon = document.getElementById("categoryIcon");

    categoryStatus = document.getElementById("categoryStatus");

    closeModalBtn = document.getElementById("closeModal");

    cancelModalBtn = document.getElementById("cancelModal");

    categorySearch = document.getElementById("categorySearch");

    statusFilter = document.getElementById("statusFilter");

    sortFilter = document.getElementById("sortFilter");

    categoryTableBody = document.getElementById("categoryTableBody");

    emptyState = document.getElementById("emptyState");

    totalCategories = document.getElementById("totalCategories");

    activeCategories = document.getElementById("activeCategories");

    inactiveCategories = document.getElementById("inactiveCategories");

    totalServices = document.getElementById("totalServices");

    adminName = document.getElementById("adminName");

    toast = document.getElementById("toast");


    /*
     * DEBUG INFORMATION
     */

    console.log("DOM CHECK:");
    console.log("addCategoryBtn:", addCategoryBtn);
    console.log("categoryModal:", categoryModal);
    console.log("categoryForm:", categoryForm);
    console.log("categoryName:", categoryName);


    /*
     * IMPORTANT:
     * If this prints null for addCategoryBtn,
     * the HTML is not loading the expected element.
     */

    if (!addCategoryBtn) {

        console.error(
            'ERROR: #addCategoryBtn was NOT found.'
        );

    }

}


/* ============================================================
   PAGE INITIALIZATION
   ============================================================ */

function initializePage() {

    loadAdminName();

    loadCategories();

    setupEventListeners();

}


/* ============================================================
   ADMIN NAME
   ============================================================ */

function loadAdminName() {

    if (!adminName) {
        return;
    }

    try {

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {

            adminName.textContent = "Administrator";

            return;
        }

        const user = JSON.parse(storedUser);

        adminName.textContent =
            user.fullName ||
            user.FullName ||
            user.username ||
            user.Username ||
            "Administrator";

    }

    catch (error) {

        console.error(
            "Error loading administrator:",
            error
        );

        adminName.textContent = "Administrator";

    }

}


/* ============================================================
   LOAD CATEGORIES
   ============================================================ */

function loadCategories() {

    try {

        const savedCategories =
            localStorage.getItem(STORAGE_KEY);


        if (savedCategories) {

            categories =
                JSON.parse(savedCategories);

        }

        else {

            categories =
                [...defaultCategories];

            saveCategories();

        }

    }

    catch (error) {

        console.error(
            "Error loading categories:",
            error
        );

        categories =
            [...defaultCategories];

    }


    updateStatistics();

    renderCategories();

}


/* ============================================================
   EVENT LISTENERS
   ============================================================ */

function setupEventListeners() {

    console.log(
        "Setting up Category Maintenance event listeners..."
    );


    /* ========================================================
       ADD CATEGORY BUTTON
       ======================================================== */

    if (addCategoryBtn) {

        /*
         * Remove any previous listener by cloning the button.
         *
         * This prevents another script from interfering with
         * the button event.
         */

        const newButton =
            addCategoryBtn.cloneNode(true);

        addCategoryBtn.parentNode.replaceChild(
            newButton,
            addCategoryBtn
        );

        addCategoryBtn = newButton;


        addCategoryBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                console.log(
                    "ADD CATEGORY BUTTON CLICKED"
                );

                openAddModal();

            }
        );


        console.log(
            "Add Category button event listener attached successfully."
        );

    }

    else {

        console.error(
            'Cannot attach Add Category listener because #addCategoryBtn does not exist.'
        );

    }


    /* ========================================================
       SEARCH
       ======================================================== */

    if (categorySearch) {

        categorySearch.addEventListener(
            "input",
            renderCategories
        );

    }


    /* ========================================================
       STATUS FILTER
       ======================================================== */

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderCategories
        );

    }


    /* ========================================================
       SORT FILTER
       ======================================================== */

    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            renderCategories
        );

    }


    /* ========================================================
       CLOSE BUTTON
       ======================================================== */

    if (closeModalBtn) {

        closeModalBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeModal();

            }
        );

    }


    /* ========================================================
       CANCEL BUTTON
       ======================================================== */

    if (cancelModalBtn) {

        cancelModalBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeModal();

            }
        );

    }


    /* ========================================================
       FORM
       ======================================================== */

    if (categoryForm) {

        categoryForm.addEventListener(
            "submit",
            saveCategory
        );

    }


    /* ========================================================
       MODAL BACKGROUND
       ======================================================== */

    if (categoryModal) {

        categoryModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === categoryModal
                ) {

                    closeModal();

                }

            }
        );

    }


    /* ========================================================
       ESC KEY
       ======================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                categoryModal &&
                categoryModal.classList.contains("show")
            ) {

                closeModal();

            }

        }
    );

}


/* ============================================================
   OPEN ADD CATEGORY MODAL
   ============================================================ */

function openAddModal() {

    console.log(
        "openAddModal() executed"
    );


    editingCategoryId = null;


    if (!categoryModal) {

        console.error(
            "ERROR: categoryModal does not exist."
        );

        alert(
            "Category modal was not found. Please check category-maintenance.html."
        );

        return;

    }


    if (modalTitle) {

        modalTitle.textContent =
            "Add Service Category";

    }


    if (categoryForm) {

        categoryForm.reset();

    }


    if (categoryId) {

        categoryId.value = "";

    }


    if (categoryIcon) {

        categoryIcon.value =
            "fa-layer-group";

    }


    if (categoryStatus) {

        categoryStatus.value =
            "Active";

    }


    /*
     * FORCE MODAL TO DISPLAY
     */

    categoryModal.style.display = "flex";

    categoryModal.classList.add("show");

    categoryModal.setAttribute(
        "aria-hidden",
        "false"
    );


    console.log(
        "Category modal opened successfully."
    );


    if (categoryName) {

        setTimeout(
            function () {

                categoryName.focus();

            },
            100
        );

    }

}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeModal() {

    if (!categoryModal) {
        return;
    }


    categoryModal.classList.remove("show");

    categoryModal.style.display = "none";

    categoryModal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (categoryForm) {

        categoryForm.reset();

    }


    editingCategoryId = null;

}


/* ============================================================
   EDIT CATEGORY
   ============================================================ */

function editCategory(id) {

    const category =
        categories.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!category) {

        showToast(
            "Category not found.",
            "error"
        );

        return;

    }


    editingCategoryId =
        category.id;


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Service Category";

    }


    if (categoryId) {

        categoryId.value =
            category.id;

    }


    if (categoryName) {

        categoryName.value =
            category.name;

    }


    if (categoryDescription) {

        categoryDescription.value =
            category.description;

    }


    if (categoryIcon) {

        categoryIcon.value =
            category.icon;

    }


    if (categoryStatus) {

        categoryStatus.value =
            category.status;

    }


    if (categoryModal) {

        categoryModal.style.display =
            "flex";

        categoryModal.classList.add(
            "show"
        );

        categoryModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    if (categoryName) {

        setTimeout(
            function () {

                categoryName.focus();

            },
            100
        );

    }

}


/* ============================================================
   FILTER CATEGORIES
   ============================================================ */

function getFilteredCategories() {

    const searchTerm =
        categorySearch
            ? categorySearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    let result =
        categories.filter(
            category => {

                const searchableText = [

                    category.name,

                    category.description

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !searchTerm ||
                    searchableText.includes(
                        searchTerm
                    );


                const matchesStatus =
                    !selectedStatus ||
                    category.status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    const sortValue =
        sortFilter
            ? sortFilter.value
            : "name";


    if (sortValue === "services") {

        result.sort(
            (a, b) =>
                Number(b.serviceCount) -
                Number(a.serviceCount)
        );

    }

    else if (sortValue === "newest") {

        result.sort(
            (a, b) =>
                new Date(b.createdDate) -
                new Date(a.createdDate)
        );

    }

    else {

        result.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    return result;

}


/* ============================================================
   RENDER CATEGORIES
   ============================================================ */

function renderCategories() {

    if (!categoryTableBody) {

        console.error(
            "categoryTableBody not found."
        );

        return;

    }


    const filteredCategories =
        getFilteredCategories();


    categoryTableBody.innerHTML = "";


    if (
        filteredCategories.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    filteredCategories.forEach(
        category => {

            const row =
                document.createElement("tr");


            const statusClass =
                category.status === "Active"
                    ? "status-active"
                    : "status-inactive";


            const statusIcon =
                category.status === "Active"
                    ? "fa-circle-check"
                    : "fa-circle-pause";


            const toggleIcon =
                category.status === "Active"
                    ? "fa-toggle-on"
                    : "fa-toggle-off";


            const toggleTitle =
                category.status === "Active"
                    ? "Deactivate category"
                    : "Activate category";


            row.innerHTML = `

                <td>
                    <div class="category-icon">
                        <i class="fa-solid ${escapeHTML(category.icon)}"></i>
                    </div>
                </td>

                <td>
                    <div class="category-name">
                        ${escapeHTML(category.name)}
                    </div>
                </td>

                <td>
                    <div class="category-description">
                        ${escapeHTML(category.description)}
                    </div>
                </td>

                <td>
                    <span class="service-count">
                        ${formatNumber(category.serviceCount)}
                    </span>
                </td>

                <td>
                    <span class="status ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i>
                        ${escapeHTML(category.status)}
                    </span>
                </td>

                <td>
                    ${formatDate(category.createdDate)}
                </td>

                <td>

                    <div class="actions">

                        <button
                            type="button"
                            class="action-btn edit-btn"
                            title="Edit category"
                            data-action="edit"
                            data-id="${category.id}"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn toggle-btn"
                            title="${toggleTitle}"
                            data-action="toggle"
                            data-id="${category.id}"
                        >
                            <i class="fa-solid ${toggleIcon}"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn delete-btn"
                            title="Delete category"
                            data-action="delete"
                            data-id="${category.id}"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </td>
            `;


            categoryTableBody.appendChild(
                row
            );

        }
    );


    attachTableActions();

}


/* ============================================================
   TABLE ACTIONS
   ============================================================ */

function attachTableActions() {

    if (!categoryTableBody) {
        return;
    }


    const buttons =
        categoryTableBody.querySelectorAll(
            "[data-action]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const action =
                        this.dataset.action;

                    const id =
                        Number(
                            this.dataset.id
                        );


                    if (action === "edit") {

                        editCategory(id);

                    }

                    else if (
                        action === "toggle"
                    ) {

                        toggleCategory(id);

                    }

                    else if (
                        action === "delete"
                    ) {

                        deleteCategory(id);

                    }

                }
            );

        }
    );

}


/* ============================================================
   UPDATE STATISTICS
   ============================================================ */

function updateStatistics() {

    const total =
        categories.length;


    const active =
        categories.filter(
            category =>
                category.status === "Active"
        ).length;


    const inactive =
        categories.filter(
            category =>
                category.status === "Inactive"
        ).length;


    const services =
        categories.reduce(
            (sum, category) =>
                sum +
                Number(
                    category.serviceCount || 0
                ),
            0
        );


    if (totalCategories) {

        totalCategories.textContent =
            formatNumber(total);

    }


    if (activeCategories) {

        activeCategories.textContent =
            formatNumber(active);

    }


    if (inactiveCategories) {

        inactiveCategories.textContent =
            formatNumber(inactive);

    }


    if (totalServices) {

        totalServices.textContent =
            formatNumber(services);

    }

}


/* ============================================================
   SAVE CATEGORY
   ============================================================ */

function saveCategory(event) {

    event.preventDefault();


    if (!categoryName) {

        return;

    }


    const name =
        categoryName.value.trim();


    const description =
        categoryDescription
            ? categoryDescription.value.trim()
            : "";


    const icon =
        categoryIcon
            ? categoryIcon.value.trim()
            : "fa-layer-group";


    const status =
        categoryStatus
            ? categoryStatus.value
            : "Active";


    if (!name) {

        showToast(
            "Category name is required.",
            "error"
        );

        categoryName.focus();

        return;

    }


    const duplicate =
        categories.find(
            category => {

                return (
                    category.name
                        .trim()
                        .toLowerCase() ===
                    name
                        .toLowerCase()
                    &&
                    Number(category.id) !==
                    Number(editingCategoryId)
                );

            }
        );


    if (duplicate) {

        showToast(
            "This category already exists.",
            "error"
        );

        return;

    }


    /* ========================================================
       EDIT
       ======================================================== */

    if (
        editingCategoryId !== null
    ) {

        const index =
            categories.findIndex(
                category =>
                    Number(category.id) ===
                    Number(editingCategoryId)
            );


        if (index === -1) {

            showToast(
                "Category could not be found.",
                "error"
            );

            return;

        }


        categories[index].name =
            name;

        categories[index].description =
            description;

        categories[index].icon =
            icon || "fa-layer-group";

        categories[index].status =
            status;


        saveCategories();

        updateStatistics();

        renderCategories();

        closeModal();


        showToast(
            "Category updated successfully.",
            "success"
        );


        return;

    }


    /* ========================================================
       ADD NEW CATEGORY
       ======================================================== */

    const newCategory = {

        id:
            generateCategoryId(),

        name:
            name,

        description:
            description,

        icon:
            icon || "fa-layer-group",

        status:
            status,

        serviceCount:
            0,

        createdDate:
            getToday()

    };


    categories.push(
        newCategory
    );


    saveCategories();

    updateStatistics();

    renderCategories();

    closeModal();


    showToast(
        "Category added successfully.",
        "success"
    );

}


/* ============================================================
   TOGGLE CATEGORY
   ============================================================ */

function toggleCategory(id) {

    const category =
        categories.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!category) {

        showToast(
            "Category not found.",
            "error"
        );

        return;

    }


    const newStatus =
        category.status === "Active"
            ? "Inactive"
            : "Active";


    const action =
        newStatus === "Active"
            ? "activate"
            : "deactivate";


    if (
        !confirm(
            `Are you sure you want to ${action} "${category.name}"?`
        )
    ) {

        return;

    }


    category.status =
        newStatus;


    saveCategories();

    updateStatistics();

    renderCategories();


    showToast(
        `"${category.name}" is now ${newStatus.toLowerCase()}.`,
        "success"
    );

}


/* ============================================================
   DELETE CATEGORY
   ============================================================ */

function deleteCategory(id) {

    const category =
        categories.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!category) {

        showToast(
            "Category not found.",
            "error"
        );

        return;

    }


    if (
        Number(category.serviceCount) > 0
    ) {

        alert(
            `"${category.name}" cannot be deleted because ${category.serviceCount} service(s) are currently assigned to it.\n\nDeactivate the category instead.`
        );

        return;

    }


    if (
        !confirm(
            `Are you sure you want to permanently delete "${category.name}"?`
        )
    ) {

        return;

    }


    categories =
        categories.filter(
            item =>
                Number(item.id) !==
                Number(id)
        );


    saveCategories();

    updateStatistics();

    renderCategories();


    showToast(
        "Category deleted successfully.",
        "success"
    );

}


/* ============================================================
   GENERATE CATEGORY ID
   ============================================================ */

function generateCategoryId() {

    if (
        categories.length === 0
    ) {

        return 1;

    }


    const ids =
        categories.map(
            category =>
                Number(category.id)
        );


    return (
        Math.max(...ids) + 1
    );

}


/* ============================================================
   SAVE LOCAL STORAGE
   ============================================================ */

function saveCategories() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(categories)
        );

    }

    catch (error) {

        console.error(
            "Unable to save categories:",
            error
        );

    }

}


/* ============================================================
   FORMAT NUMBER
   ============================================================ */

function formatNumber(value) {

    return new Intl.NumberFormat(
        "en-KE"
    ).format(
        Number(value) || 0
    );

}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-KE",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ============================================================
   TODAY
   ============================================================ */

function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(
    message,
    type = "success"
) {

    if (!toast) {

        console.log(
            `[${type}] ${message}`
        );

        return;

    }


    toast.textContent =
        message;


    toast.className =
        `toast show ${type}`;


    setTimeout(
        function () {

            toast.className =
                "toast";

        },
        3000
    );

}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   MAKE OPEN ADD MODAL AVAILABLE
   ============================================================ */

window.openAddModal =
    openAddModal;


/* ============================================================
   MAKE OTHER FUNCTIONS AVAILABLE
   ============================================================ */

window.editCategory =
    editCategory;

window.toggleCategory =
    toggleCategory;

window.deleteCategory =
    deleteCategory;


/* ============================================================
   END
   ============================================================ */