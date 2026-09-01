document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ gallery.js loaded");

  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      console.log("Next clicked!");
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      console.log("Previous clicked!");
    });
  }
});
