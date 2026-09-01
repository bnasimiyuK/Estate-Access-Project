document.addEventListener('DOMContentLoaded', () => {
  // Configurable API Endpoints
  const API_ENDPOINTS = {
    GET_NOTIFICATIONS: '/api/notifications',
    MARK_READ: '/api/notifications/mark-read',
    DISMISS: '/api/notifications/dismiss'
  };

  // DOM Elements
  const notificationList = document.getElementById('notificationList');
  const severityFilter = document.getElementById('severityFilter');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');
  const btnRefresh = document.getElementById('btnRefresh');
  const criticalBanner = document.getElementById('criticalAlertBanner');

  // Local state cache
  let currentNotifications = [];

  // Initialize Module
  fetchNotifications();

  // Event Listeners
  severityFilter.addEventListener('change', renderNotifications);
  btnRefresh.addEventListener('click', fetchNotifications);
  btnMarkAllRead.addEventListener('click', handleMarkAllRead);

  // FETCH: Get Notifications from Server API
  async function fetchNotifications() {
    try {
      notificationList.innerHTML = '<li style="text-align: center; padding: 20px; color: #64748b;">Fetching real-time alerts...</li>';

      const response = await fetch(API_ENDPOINTS.GET_NOTIFICATIONS);
      if (!response.ok) throw new Error('Network error loading notifications');

      currentNotifications = await response.json();

      checkCriticalAlerts(currentNotifications);
      renderNotifications();

    } catch (error) {
      console.error('Notification API Error:', error);
      notificationList.innerHTML = `<li style="text-align: center; padding: 20px; color: #ef4444;">Failed to load notifications. Retrying connection...</li>`;
    }
  }

  // RENDER: Filter and Populate Notification Feed
  function renderNotifications() {
    const filter = severityFilter.value;
    const filteredData = currentNotifications.filter(item => {
      if (filter === 'all') return true;
      return item.severity === filter;
    });

    if (filteredData.length === 0) {
      notificationList.innerHTML = '<li style="text-align: center; padding: 20px; color: #94a3b8;">No notifications found.</li>';
      return;
    }

    notificationList.innerHTML = filteredData.map(item => `
      <li class="notification-item ${item.read ? '' : 'unread'}" data-id="${item.id}">
        <div class="notification-content">
          <span class="status-dot ${getDotClass(item.severity)}"></span>
          <div>
            <h4 class="notification-title">${escapeHTML(item.title)}</h4>
            <p class="notification-desc">${escapeHTML(item.message)}</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span class="notification-time">${item.timestamp}</span>
          <button class="btn-dismiss" title="Dismiss" onclick="dismissNotification('${item.id}')">&times;</button>
        </div>
      </li>
    `).join('');
  }

  // Check and Trigger Top Critical Alert Banner
  function checkCriticalAlerts(notifications) {
    const activeCritical = notifications.find(n => n.severity === 'critical' && !n.read);
    
    if (activeCritical) {
      document.getElementById('bannerTitle').textContent = activeCritical.title;
      document.getElementById('bannerMessage').textContent = activeCritical.message;
      criticalBanner.classList.add('active');
    } else {
      criticalBanner.classList.remove('active');
    }
  }

  // API Handler: Mark All Read
  async function handleMarkAllRead() {
    try {
      await fetch(API_ENDPOINTS.MARK_READ, { method: 'POST' });
      currentNotifications = currentNotifications.map(n => ({ ...n, read: true }));
      renderNotifications();
      criticalBanner.classList.remove('active');
    } catch (error) {
      console.error('Failed to update read state:', error);
    }
  }

  // Global Scope Function for Dismissing Individual Notifications
  window.dismissNotification = async function(id) {
    try {
      await fetch(`${API_ENDPOINTS.DISMISS}/${id}`, { method: 'DELETE' });
      currentNotifications = currentNotifications.filter(n => n.id !== id);
      renderNotifications();
      checkCriticalAlerts(currentNotifications);
    } catch (error) {
      console.error(`Failed to dismiss notification ${id}:`, error);
    }
  };

  // Global Scope Function to Hide Banner
  window.dismissBanner = function() {
    criticalBanner.classList.remove('active');
  };

  // Helper Utility: Return Color Dot Class
  function getDotClass(severity) {
    switch (severity) {
      case 'critical': return 'dot-critical';
      case 'warning': return 'dot-warning';
      case 'info': return 'dot-info';
      default: return 'dot-info';
    }
  }

  // Security Helper: Escape Input XSS
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});