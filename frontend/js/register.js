document.getElementById('year').textContent = new Date().getFullYear();

    // Google sign-in callback
    function handleCredentialResponse(response) {
      const data = jwt_decode(response.credential);
      alert(`Welcome, ${data.name}!\nEmail: ${data.email}`);
    }

    // Biometrics logic
    const bioMsg = document.getElementById('bioMsg');

    async function startBiometric(type) {
      if (!window.PublicKeyCredential) {
        alert('Your browser does not support WebAuthn biometrics.');
        return;
      }

      try {
        const publicKey = {
          challenge: new Uint8Array(26),
          rp: { name: "Athi Estate Access System" },
          user: {
            id: new Uint8Array(16),
            name: "resident@example.com",
            displayName: "Resident User",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        };

        const credential = await navigator.credentials.create({ publicKey });
        console.log(`${type} Biometric Credential:`, credential);
        bioMsg.textContent = `✅ ${type} biometric registration successful!`;
        bioMsg.classList.remove('hidden');
      } catch (err) {
        alert(`${type} registration failed: ${err.message}`);
      }
    }

    // Event Listeners
    document.getElementById('fingerprintBtn').addEventListener('click', () => startBiometric('Fingerprint'));
    document.getElementById('faceBtn').addEventListener('click', () => startBiometric('Face'));
    // This function is triggered when Google returns the credential token
  async function handleCredentialResponse(response) {
    try {
      // Decode the ID token from Google (it’s a JWT)
      const user = jwt_decode(response.credential);
      console.log("Google User:", user);

      // Send user info to backend for registration
      const res = await fetch("http://127.0.0.1:4050/auth/google/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: user.sub,
          name: user.name,
          email: user.email,
          picture: user.picture
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Welcome, ${user.name}! Registration successful.`);
        window.location.href = "home.html";
      } else {
        alert(`⚠️ Registration failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Google Sign-In error:", err);
      alert("Google Sign-In failed. Check console for details.");
    }
  }
  // Show current year
document.getElementById("year").textContent = new Date().getFullYear();

// Fingerprint / WebAuthn
document.getElementById('fingerprintBtn').addEventListener('click', async () => {
  if (!window.PublicKeyCredential) {
    alert('WebAuthn not supported on this device/browser.');
    return;
  }

  try {
    const publicKey = {
      challenge: Uint8Array.from('randomChallenge', c => c.charCodeAt(0)),
      rp: { name: "Athi Estate Access System" },
      user: {
        id: Uint8Array.from('resident123', c => c.charCodeAt(0)),
        name: "resident@example.com",
        displayName: "Resident"
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: { authenticatorAttachment: "platform" },
      timeout: 60000,
      attestation: "direct"
    };

    const credential = await navigator.credentials.create({ publicKey });
    console.log('WebAuthn credential:', credential);

    const msg = document.getElementById('bioMsg');
    msg.classList.remove('hidden');
    msg.classList.add('text-green-600');
    msg.textContent = "✅ Fingerprint / device biometric registered successfully!";
  } catch (err) {
    console.error(err);
    alert("Biometric registration failed or canceled.");
  }
});

// Facial Scan (Camera API)
document.getElementById('faceBtn').addEventListener('click', async () => {
  const video = document.getElementById('cameraPreview');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.classList.remove('hidden');

    const bioMsg = document.getElementById('bioMsg');
    bioMsg.classList.remove('hidden');
    bioMsg.textContent = "📸 Facial scan active... look at the camera.";
    bioMsg.classList.add('text-blue-600');

    // Simulate capture after 5s
    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());
      video.classList.add('hidden');
      bioMsg.textContent = "✅ Facial data captured successfully!";
      bioMsg.classList.replace('text-blue-600', 'text-green-600');
    }, 5000);
  } catch (err) {
    console.error(err);
    alert("Camera access denied or unavailable.");
  }
});
