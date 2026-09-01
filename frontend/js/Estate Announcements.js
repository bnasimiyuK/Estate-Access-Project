// Announcements modal
const openAnnouncementsBtn = document.getElementById("openAnnouncementsBtn");
const announcementsSection = document.getElementById("announcementsSection");
const closeAnnouncementsBtn = document.getElementById("closeAnnouncementsBtn");
const closeAnnouncementsBtnBottom = document.getElementById("closeAnnouncementsBtnBottom");

// Open announcements
openAnnouncementsBtn.addEventListener("click", () => {
  announcementsSection.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
});

// Close announcements
const closeAnnouncements = () => {
  announcementsSection.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
};

closeAnnouncementsBtn.addEventListener("click", closeAnnouncements);
closeAnnouncementsBtnBottom.addEventListener("click", closeAnnouncements);
