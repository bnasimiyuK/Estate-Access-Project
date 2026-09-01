// ===============================
    // Check JWT and show admin features
    // ===============================
    const token = localStorage.getItem("token");
    const tableContainer = document.getElementById("membershipTableContainer");
    const notAdminMsg = document.getElementById("notAdminMsg");

    if (!token) {
      window.location.href = "login.html";
    } else {
      try {
        const decoded = jwt_decode(token);

        // Show admin table only if user role is Admin
        if (decoded.role === "Admin") {
          tableContainer.classList.remove("hidden");
          fetchMembershipRequests();
        } else {
          notAdminMsg.classList.remove("hidden");
        }

      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
    }

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });

    // ===============================
    // Fetch Membership Requests (example)
    // ===============================
    async function fetchMembershipRequests() {
      try {
        const res = await fetch("/api/membership/pending", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        populateTable(data.requests || []);
      } catch (err) {
        console.error("Failed to fetch membership requests:", err);
      }
    }

    function populateTable(requests) {
      const tbody = document.getElementById("membershipTableBody");
      tbody.innerHTML = "";

      if (requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">No pending requests</td></tr>`;
        return;
      }

      requests.forEach(req => {
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-100";
        tr.innerHTML = `
          <td class="py-2 px-4">${req.name}</td>
          <td class="py-2 px-4">${req.email}</td>
          <td class="py-2 px-4">${req.status}</td>
          <td class="py-2 px-4">
            <button class="approveBtn bg-green-500 text-white px-3 py-1 rounded" data-id="${req.id}">Approve</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Add click events to approve buttons
      document.querySelectorAll(".approveBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          await approveMembership(id);
        });
      });
    }

    async function approveMembership(id) {
      try {
        const res = await fetch("/api/membership/approve", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ residentId: id })
        });
        const data = await res.json();
        alert(data.message);
        fetchMembershipRequests();
      } catch (err) {
        console.error("Failed to approve:", err);
      }
    }

