// frontend/js/residents-profile.js

console.log("👤 residents-profile.js loaded");

let currentActiveResidentId = null;

// Ensure event listeners bind whether DOM is already loaded or loading
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupModalControls);
} else {
  setupModalControls();
}

// Expose openResidentProfile to global window scope
window.openResidentProfile = async function (residentId) {
  if (!residentId || residentId === "undefined") {
    console.error("❌ Invalid Resident ID passed to openResidentProfile");
    return;
  }

  console.log(`📖 Opening profile modal for Resident ID: ${residentId}`);
  currentActiveResidentId = residentId;

  const modal = document.getElementById("residentProfileModal");
  if (!modal) {
    console.error("❌ Profile modal element (#residentProfileModal) not found.");
    return;
  }

  // Ensure controls are set up in case initial setup loaded too early
  setupModalControls();

  // Display modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Fetch detailed resident data
  await fetchResidentProfileDetails(residentId);
};

function setupModalControls() {
  const modal = document.getElementById("residentProfileModal");
  const closeBtn = document.getElementById("closeProfileModalBtn");
  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const photoInput = document.getElementById("profilePhotoInput");

  if (!editBtn || !saveBtn) {
    console.warn("⚠️ Edit or Save buttons not ready during initial setup.");
    return;
  }

  // Remove existing listeners by cloning to avoid duplicate bindings
  const newEditBtn = editBtn.cloneNode(true);
  const newSaveBtn = saveBtn.cloneNode(true);
  editBtn.parentNode.replaceChild(newEditBtn, editBtn);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

  // Close modal click handlers
  if (closeBtn && modal) {
    closeBtn.onclick = () => closeModal(modal);
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeModal(modal);
    };
  }

  // Toggle EDIT Mode
  newEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("✏️ Edit button clicked");

    newEditBtn.classList.add("hidden");
    newSaveBtn.classList.remove("hidden");

    // Enable all editable profile fields
    document.querySelectorAll(".profileField").forEach((field) => {
      field.removeAttribute("readonly");
      field.removeAttribute("disabled");
      field.classList.add("border", "border-blue-500", "rounded", "p-1", "bg-white");
    });

    // Show action items meant for edit mode
    document.querySelectorAll(".edit-only").forEach((el) => {
      el.classList.remove("hidden");
    });
  });

  // Toggle SAVE Mode
  newSaveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("💾 Save button clicked");

    await saveResidentProfileChanges();

    newSaveBtn.classList.add("hidden");
    newEditBtn.classList.remove("hidden");

    // Re-lock all input fields
    document.querySelectorAll(".profileField").forEach((field) => {
      field.setAttribute("readonly", true);
      if (field.tagName === "SELECT") {
        field.setAttribute("disabled", true);
      }
      field.classList.remove("border", "border-blue-500", "rounded", "p-1", "bg-white");
    });

    // Hide edit-only UI elements
    document.querySelectorAll(".edit-only").forEach((el) => {
      el.classList.add("hidden");
    });
  });

  // Handle Profile Photo Upload Preview
  if (photoInput) {
    photoInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoImg = document.getElementById("profilePhoto");
          if (photoImg) photoImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
  }
}

function closeModal(modal) {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentActiveResidentId = null;
}

async function fetchResidentProfileDetails(residentId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:4050/api/residents/${residentId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const resident = await response.json();
    populateProfileModal(resident);

  } catch (err) {
    console.error(`❌ Failed to fetch resident details for ID ${residentId}:`, err);
  }
}

function populateProfileModal(data) {
  if (!data) return;

  document.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    if (data[key] !== undefined) {
      field.value = data[key] ?? "";
    }
  });

  const photoImg = document.getElementById("profilePhoto");
  if (photoImg) {
    photoImg.src = data.ProfilePhoto || data.PhotoUrl || "assets/Profile-Photo.jpeg";
  }
}

async function saveResidentProfileChanges() {
  if (!currentActiveResidentId) {
    console.warn("⚠️ No active resident ID found to update.");
    return;
  }

  const token = localStorage.getItem("token");
  const updatedPayload = {};

  document.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    updatedPayload[key] = field.value;
  });

  try {
    const response = await fetch(`http://localhost:4050/api/residents/${currentActiveResidentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(updatedPayload),
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    alert("Resident profile updated successfully!");

  } catch (err) {
    console.error("❌ Failed to update resident profile:", err);
    alert("Error saving profile changes. Check backend connection.");
  }
}