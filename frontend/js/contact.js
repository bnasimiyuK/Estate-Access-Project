
    // Display current year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Simple feedback
    document.getElementById('contactForm').addEventListener('submit', e => {
      e.preventDefault();
      const box = document.getElementById('contactMsg');
      box.textContent = "✅ Message sent successfully! We'll get back to you soon.";
      box.classList.remove('hidden');
      box.classList.add('text-green-600');
      e.target.reset();
    });
