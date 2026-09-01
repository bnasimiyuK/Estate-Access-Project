const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const captureBtn = document.getElementById("captureBtn");
    const submitBtn = document.getElementById("submitBtn");
    const msg = document.getElementById("msg");

    // ✅ Start webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { video.srcObject = stream; })
      .catch(err => { msg.textContent = "Camera access denied!"; });

    let faceImage = null;

    // 📸 Capture image
    captureBtn.addEventListener("click", () => {
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, 320, 240);
      faceImage = canvas.toDataURL("image/png");
      msg.textContent = "Face captured successfully!";
      msg.className = "text-green-700 text-sm mt-2";
      submitBtn.classList.remove("hidden");
    });

    // 🚀 Submit captured image
    submitBtn.addEventListener("click", async () => {
      const memberId = document.getElementById("memberId").value.trim();
      if (!memberId || !faceImage) {
        msg.textContent = "Please provide Request ID and capture face first.";
        msg.className = "text-red-600 text-sm mt-2";
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:4050/api/biometric/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, faceImage }),
        });

        const data = await res.json();
        msg.textContent = data.message;
        msg.className = res.ok ? "text-green-700 text-sm mt-2" : "text-red-700 text-sm mt-2";
      } catch (error) {
        console.error("Error uploading biometric:", error);
        msg.textContent = "Failed to upload biometric.";
        msg.className = "text-red-700 text-sm mt-2";
      }
    });