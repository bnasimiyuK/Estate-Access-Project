document.addEventListener('DOMContentLoaded', () => {
  // API Endpoints Config (Update these URLs to match your backend endpoints)
  const API_ENDPOINTS = {
    ANALYTICS: '/api/analytics',
    REPORTS: '/api/reports',
    EXPORT: '/api/reports/export'
  };

  // DOM Elements
  const btnAnalytics = document.getElementById('btnAnalytics');
  const btnReports = document.getElementById('btnReports');
  const tabAnalytics = document.getElementById('analyticsTab');
  const tabReports = document.getElementById('reportsTab');
  const filterForm = document.getElementById('filterForm');
  const btnExport = document.getElementById('btnExport');
  const tableBody = document.getElementById('reportsTableBody');

  // Chart Instances
  let trafficChartInstance = null;
  let methodsChartInstance = null;

  // Initialize UI & Load Initial Data
  initTabs();
  loadAnalyticsData();
  loadReportsData();

  // Tab Navigation Handler
  function initTabs() {
    btnAnalytics.addEventListener('click', () => switchTab(tabAnalytics, btnAnalytics));
    btnReports.addEventListener('click', () => switchTab(tabReports, btnReports));
  }

  function switchTab(activeTab, activeBtn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    activeTab.classList.add('active');
    activeBtn.classList.add('active');
  }

  // FETCH 1: Load Analytics Summary & Charts
  async function loadAnalyticsData() {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYTICS);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const data = await response.json();

      // Update Metric Cards
      document.getElementById('statTotalEntries').textContent = data.summary.totalEntries.toLocaleString();
      document.getElementById('statEntriesChange').textContent = `${data.summary.entriesChange} vs yesterday`;
      document.getElementById('statActiveVisitors').textContent = data.summary.activeVisitors;
      document.getElementById('statIncidents').textContent = data.summary.incidents;

      // Render Charts with Backend Data
      renderTrafficChart(data.traffic.labels, data.traffic.values);
      renderMethodsChart(data.entryMethods.labels, data.entryMethods.values);

    } catch (error) {
      console.error('Analytics Error:', error);
    }
  }

  // FETCH 2: Load Table Reports
  async function loadReportsData(filters = {}) {
    try {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading data...</td></tr>';
      
      // Build Query String from Filters
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${API_ENDPOINTS.REPORTS}?${queryParams}` : API_ENDPOINTS.REPORTS;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reports data');
      const reports = await response.json();

      // Populate Table
      if (reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No records found.</td></tr>';
        return;
      }

      tableBody.innerHTML = reports.map(item => `
        <tr>
          <td>${item.timestamp}</td>
          <td>${item.eventType}</td>
          <td>${item.subject}</td>
          <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
          <td>${item.location}</td>
        </tr>
      `).join('');

    } catch (error) {
      console.error('Reports Error:', error);
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444;">Failed to load report logs.</td></tr>';
    }
  }

  // Filter Form Submit Handler
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const filters = {
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      reportType: document.getElementById('reportType').value
    };
    loadReportsData(filters);
  });

  // CSV Export Button Handler
  btnExport.addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reportType = document.getElementById('reportType').value;
    
    // Trigger download endpoint directly
    window.location.href = `${API_ENDPOINTS.EXPORT}?startDate=${startDate}&endDate=${endDate}&type=${reportType}`;
  });

  // Helper: Status Badges
  function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
      case 'approved': return 'badge-success';
      case 'logged': return 'badge-warning';
      case 'denied': return 'badge-danger';
      default: return 'badge-warning';
    }
  }

  // Chart 1: Traffic Line Chart
  function renderTrafficChart(labels, values) {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    if (trafficChartInstance) trafficChartInstance.destroy();

    trafficChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Access Events',
          data: values,
          borderColor: '#10b981',
          tension: 0.3
        }]
      }
    });
  }

  // Chart 2: Entry Methods Doughnut Chart
  function renderMethodsChart(labels, values) {
    const ctx = document.getElementById('methodsChart').getContext('2d');
    if (methodsChartInstance) methodsChartInstance.destroy();

    methodsChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
        }]
      }
    });
  }
});