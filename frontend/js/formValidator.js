// formValidator.js
export function showError(input, message) {
  const errorEl = input.nextElementSibling;
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
  input.classList.add("border-red-500");
}

export function clearError(input) {
  const errorEl = input.nextElementSibling;
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }
  input.classList.remove("border-red-500");
}

export function validateField(input) {
  clearError(input);
  const value = input.value.trim();

  if (input.dataset.required === "true" && !value) {
    showError(input, "This field is required.");
    return false;
  }

  // Full Name validation: letters and spaces, each word starts with capital
  if (input.dataset.type === "fullName") {
    if (!/^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/.test(value)) {
      showError(input, "Full name must start with a capital letter, letters only.");
      return false;
    }
  }

  // National ID: exactly 8 digits
  if (input.dataset.type === "nationalId") {
    if (!/^\d{8}$/.test(value)) {
      showError(input, "National ID must be exactly 8 digits.");
      return false;
    }
  }

  // Phone: starts with + and country code
  if (input.dataset.type === "phone") {
    if (!/^\+\d{9,15}$/.test(value)) {
      showError(input, "Phone number must include country code, e.g. +254712345678");
      return false;
    }
  }

  // Email: must contain @
  if (input.dataset.type === "email") {
    if (!/.+@.+\..+/.test(value)) {
      showError(input, "Please enter a valid email address.");
      return false;
    }
  }

  return true;
}

export function validateForm(form) {
  let valid = true;
  form.querySelectorAll(".validate-field").forEach(input => {
    if (!validateField(input)) valid = false;
  });
  return valid;
}
