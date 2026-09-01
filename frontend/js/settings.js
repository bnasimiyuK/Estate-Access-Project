document.addEventListener('DOMContentLoaded', () => {
  // Explicitly target Express server on port 4050
  const API_URL = 'http://localhost:4050/api';
  let admins = [];

  const roleLabel = { full: 'Full Admin', finance: 'Finance Admin', guard: 'Security Guard' };
  const roleBadgeClass = { full: 'full', finance: 'finance', guard: 'guard' };

  /* ================= Tab Switching ================= */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById('panel-' + btn.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  /* ================= Toast Helper ================= */
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ================= Centralized Auth-Aware Fetch ================= */
  function getToken() {
    return localStorage.getItem('token');
  }

  function redirectToLogin(reason) {
    localStorage.removeItem('token');
    showToast(reason || 'Session expired. Redirecting to login…');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 900);
  }

  /**
   * Wraps fetch with auth header + 401/403 handling.
   * Returns parsed JSON body, or null if the request failed
   * and the caller should stop (a toast/redirect has already happened).
   */
  async function apiFetch(path, options = {}) {
    const token = getToken();
    if (!token) {
      redirectToLogin('User not authenticated. Please log in.');
      return null;
    }

    let res;
    try {
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          ...(options.headers || {})
        }
      });
    } catch (err) {
      console.error(`Network error calling ${path}:`, err);
      showToast('Server communication error');
      return null;
    }

    if (res.status === 401 || res.status === 403) {
      redirectToLogin('Session expired. Please log in again.');
      return null;
    }

    let data = null;
    try {
      data = await res.json();
    } catch (err) {
      // Non-JSON response (e.g. empty body on some 204s) — treat as success shell
      data = { success: res.ok };
    }

    if (!res.ok) {
      showToast(data.message || `Server returned HTTP ${res.status}`);
      return null;
    }

    return data;
  }

  /* ================= Fetch Real-Time System Settings ================= */
  async function loadSettings() {
    const data = await apiFetch('/settings');
    if (!data) return;

    if (data.success === false) {
      showToast(data.message || 'Failed to fetch settings');
      return;
    }

    const s = data.settings || {};

    // Populate Input fields dynamically by element ID
    Object.keys(s).forEach(key => {
      const el = document.getElementById(key);
      if (el) {
        if (el.type === 'checkbox') {
          el.checked = Boolean(s[key]);
        } else {
          el.value = s[key];
        }
      }
    });
  }

  /* ================= Save Changes per Panel ================= */
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const panel = btn.closest('.panel');
      if (!panel) return;

      const inputs = panel.querySelectorAll('input, select');
      const payload = {};

      inputs.forEach(input => {
        // Exclude inputs without IDs and new admin fields from settings updates
        if (!input.id || input.id.startsWith('newAdmin')) return;

        if (input.type === 'checkbox') {
          payload[input.id] = input.checked;
        } else if (input.type === 'number') {
          payload[input.id] = Number(input.value);
        } else {
          payload[input.id] = input.value;
        }
      });

      if (Object.keys(payload).length === 0) {
        showToast('No panel settings to save');
        return;
      }

      const originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Saving…';

      try {
        const data = await apiFetch('/settings', {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });

        if (data && data.success !== false) {
          showToast((btn.dataset.save || 'Settings') + ' saved successfully');
        }
        // apiFetch already toasts on failure/redirects on auth error
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    });
  });

  /* ================= Real-Time Admin CRUD ================= */
  const adminsTableBody = document.querySelector('#adminsTable tbody');

  function getAdminRole(admin) {
    return admin.Role || admin.role || '';
  }

  function getAdminActive(admin) {
    if (typeof admin.IsActive === 'boolean') return admin.IsActive;
    if (typeof admin.active === 'boolean') return admin.active;
    return Boolean(admin.IsActive ?? admin.active);
  }

  function getAdminId(admin) {
    return admin.AdminID ?? admin.UserID ?? admin.id ?? admin.ID;
  }

  async function loadAdmins() {
    if (!adminsTableBody) return;
    const data = await apiFetch('/admins');
    if (!data) return;

    admins = Array.isArray(data) ? data : (data.admins || []);
    renderAdmins();
  }

  function renderAdmins() {
    adminsTableBody.innerHTML = '';
    if (!Array.isArray(admins) || admins.length === 0) {
      adminsTableBody.innerHTML = '<tr><td colspan="5">No admins found</td></tr>';
      return;
    }

    admins.forEach((admin) => {
      const tr = document.createElement('tr');
      const isActive = getAdminActive(admin);
      const adminId = getAdminId(admin);
      const role = getAdminRole(admin);

      tr.innerHTML = `
        <td>${escapeHtml(admin.FullName || admin.name)}</td>
        <td>${escapeHtml(admin.Email || admin.email)}</td>
        <td><span class="badge ${roleBadgeClass[role] || ''}">${roleLabel[role] || escapeHtml(role) || 'Unknown'}</span></td>
        <td>${isActive ? 'Active' : 'Disabled'}</td>
        <td class="row-actions">
          <button data-action="toggle" data-id="${adminId}" data-active="${isActive}">${isActive ? 'Disable' : 'Enable'}</button>
          <button data-action="remove" data-id="${adminId}" class="danger">Remove</button>
        </td>
      `;
      adminsTableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  if (adminsTableBody) {
    adminsTableBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === 'remove') {
        if (!confirm('Remove this admin account?')) return;
        btn.disabled = true;
        const data = await apiFetch(`/admins/${id}`, { method: 'DELETE' });
        if (data !== null) {
          showToast('Admin deleted');
          loadAdmins();
        } else {
          btn.disabled = false;
        }
      }

      if (action === 'toggle') {
        const currentActive = btn.dataset.active === 'true';
        btn.disabled = true;
        const data = await apiFetch(`/admins/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ active: !currentActive })
        });
        if (data !== null) {
          showToast('Admin status updated');
          loadAdmins();
        } else {
          btn.disabled = false;
        }
      }
    });
  }

  /* ================= Add New Admin ================= */
  const addAdminBtn = document.getElementById('addAdminBtn');
  if (addAdminBtn) {
    addAdminBtn.addEventListener('click', async () => {
      const nameEl = document.getElementById('newAdminName');
      const emailEl = document.getElementById('newAdminEmail');
      const roleEl = document.getElementById('newAdminRole');
      const nationalIdEl = document.getElementById('newAdminNationalId');
      const phoneNumberEl = document.getElementById('newAdminPhoneNumber');

      const name = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const role = roleEl ? roleEl.value : 'guard';
      const nationalId = nationalIdEl ? nationalIdEl.value.trim() : '';
      const phoneNumber = phoneNumberEl ? phoneNumberEl.value.trim() : '';

      if (!name || !email) {
        showToast('Enter name and email');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showToast('Enter a valid email address');
        return;
      }

      addAdminBtn.disabled = true;
      const originalLabel = addAdminBtn.textContent;
      addAdminBtn.textContent = 'Adding…';

      try {
        const data = await apiFetch('/admins', {
          method: 'POST',
          body: JSON.stringify({ name, email, role, nationalId, phoneNumber })
        });

        if (data && data.success !== false) {
          showToast('New admin added');
          if (nameEl) nameEl.value = '';
          if (emailEl) emailEl.value = '';
          if (nationalIdEl) nationalIdEl.value = '';
          if (phoneNumberEl) phoneNumberEl.value = '';
          loadAdmins();
        }
      } finally {
        addAdminBtn.disabled = false;
        addAdminBtn.textContent = originalLabel;
      }
    });
  }

  /* ================= Backup Trigger ================= */
  const backupBtn = document.getElementById('backupNowBtn');
  if (backupBtn) {
    backupBtn.addEventListener('click', async () => {
      backupBtn.disabled = true;
      backupBtn.textContent = 'Backing up…';

      try {
        const data = await apiFetch('/settings/backup', { method: 'POST' });
        if (data) {
          showToast(data.message || 'Backup completed');
        }
      } finally {
        backupBtn.disabled = false;
        backupBtn.textContent = 'Back up now';
      }
    });
  }

  /* ================= Initialization ================= */
  loadSettings();
  loadAdmins();
});