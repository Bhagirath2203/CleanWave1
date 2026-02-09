cwAuth.requireRole("ADMIN");
const { email: userEmail } = cwAuth.getAuth();
let allWorkers = [];
let pendingWorkerRequests = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("userName").textContent = userEmail || 'Admin';
  loadStats();
  loadReports();
  loadWorkers();
});

// Load statistics
async function loadStats() {
  try {
    const reports = await cwApi.get("/admin/reports");
    const total = reports.length;
    const open = reports.filter(r => r.status === 'OPEN').length;
    const inProgress = reports.filter(r => r.status === 'IN_PROGRESS').length;
    const closed = reports.filter(r => r.status === 'CLOSED').length;

    document.getElementById('totalReports').textContent = total;
    document.getElementById('openReports').textContent = open;
    document.getElementById('inProgressReports').textContent = inProgress;
    document.getElementById('closedReports').textContent = closed;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load all reports
async function loadReports() {
  try {
    document.getElementById('loadingIndicator').style.display = 'block';
    const reports = await cwApi.get("/admin/reports");
    document.getElementById('loadingIndicator').style.display = 'none';

    if (reports.length === 0) {
      document.getElementById('reportsContainer').innerHTML = '<div class="error-message">No reports found.</div>';
      return;
    }

    document.getElementById('reportsContainer').innerHTML = reports.map(r => {
      const statusLower = r.status ? r.status.toLowerCase() : 'open';
      const locationText = r.location
        ? `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}`
        : 'Not specified';
      const assignBtn = r.status === 'OPEN' ? `<button onclick="showAssignModal(${r.id})" class="btn btn-secondary btn-small">Assign</button>` : '';
      return `
        <div class="report-card" data-status="${r.status}" data-category="${r.category}">
          <div class="report-header">
            <h3>${r.category}</h3>
            <span class="status-badge status-${statusLower}">${r.status || 'OPEN'}</span>
          </div>
          <div class="report-detail"><strong>Reporter:</strong> ${r.createdBy || 'Unknown'}</div>
          <div class="report-detail"><strong>Description:</strong> ${r.description?.substring(0, 80)}...</div>
          <div class="report-detail"><strong>Location:</strong> ${locationText}</div>
          <div class="report-detail"><strong>Date:</strong> ${new Date(r.createdAt).toLocaleDateString()}</div>
          ${r.imageDataUrl ? `<img src="${r.imageDataUrl}" alt="Report image" class="report-image">` : ''}
          <div class="report-actions">
            <button onclick="showReportDetails(${r.id})" class="btn btn-primary btn-small">View</button>
            ${assignBtn}
            <button onclick="changeStatus(${r.id})" class="btn btn-warning btn-small">Status</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading reports:', error);
    document.getElementById('reportsContainer').innerHTML = '<div class="error-message">Failed to load reports.</div>';
  }
}

// Load workers
async function loadWorkers() {
  try {
    allWorkers = await cwApi.get("/admin/workers");
    updateWorkerSelect();
    updateWorkersView();
  } catch (error) {
    console.error('Error loading workers:', error);
  }
}

async function loadWorkerRequests() {
  try {
    pendingWorkerRequests = await cwApi.get("/admin/worker-requests");
    updateWorkerRequestsView();
  } catch (error) {
    console.error('Error loading worker requests:', error);
  }
}

function updateWorkerSelect() {
  const select = document.getElementById('workerSelect');
  select.innerHTML = '<option value="">Select a Worker</option>' +
    allWorkers.map(w => `<option value="${w.id}">${w.email}</option>`).join('');
}

// Filter reports
function filterReports() {
  const status = document.getElementById('statusFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase();
  const cards = document.querySelectorAll('[data-status]');
  
  cards.forEach(card => {
    const matchStatus = !status || card.dataset.status === status;
    const matchSearch = !search || card.dataset.category.toLowerCase().includes(search);
    card.style.display = matchStatus && matchSearch ? '' : 'none';
  });
}

// Show assign modal
function showAssignModal(reportId) {
  document.getElementById('reportId').value = reportId;
  document.getElementById('assignModal').classList.add('show');
}

function closeAssignModal() {
  document.getElementById('assignModal').classList.remove('show');
  document.getElementById('assignForm').reset();
}

// Assign worker to report
const assignFormEl = document.getElementById('assignForm');
if (assignFormEl) assignFormEl.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const reportId = document.getElementById('reportId').value;
  const workerId = document.getElementById('workerSelect').value;
  
  try {
    await cwApi.putJson(`/admin/reports/${reportId}/assign`, { workerId });
    alert('Worker assigned successfully!');
    closeAssignModal();
    loadReports();
    loadStats();
  } catch (error) {
    console.error('Error assigning worker:', error);
  }
});

// Change report status
async function changeStatus(reportId) {
  const newStatus = prompt('Enter new status (OPEN, IN_PROGRESS, CLOSED):');
  if (!newStatus) return;

  try {
    await cwApi.putJson(`/admin/reports/${reportId}/status`, { status: newStatus });
    alert('Status updated successfully!');
    loadReports();
    loadStats();
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

// Show report details
function showReportDetails(reportId) {
  document.getElementById('reportDetailsModal').classList.add('show');
}

function closeReportDetailsModal() {
  document.getElementById('reportDetailsModal').classList.remove('show');
}

// Show worker management
function showWorkerManagement() {
  updateWorkersView();
  loadWorkerRequests();
  document.getElementById('workerModal').classList.add('show');
}

function filterWorkers() {
  const search = document.getElementById('workerSearch').value.toLowerCase();
  const filtered = allWorkers.filter(w => w.email.toLowerCase().includes(search));
  displayWorkers(filtered);
}

function updateWorkersView() {
  displayWorkers(allWorkers);
}

function displayWorkers(workers) {
  document.getElementById('workersContainer').innerHTML = workers.map(w => `
    <div class="worker-card">
      <h3>${w.email}</h3>
      <p><strong>Role:</strong> ${w.role}</p>
      <p><strong>Status:</strong> <span class="status-badge status-open">Active</span></p>
      <button onclick="removeWorker(${w.id})" class="btn btn-danger btn-small">Remove</button>
    </div>
  `).join('');
}

function closeWorkerModal() {
  document.getElementById('workerModal').classList.remove('show');
}

async function removeWorker(workerId) {
  if (!confirm('Are you sure you want to remove this worker?')) return;
  
  try {
    await cwApi.delete(`/admin/workers/${workerId}`);
    alert('Worker removed successfully!');
    loadWorkers();
  } catch (error) {
    console.error('Error removing worker:', error);
  }
}

function updateWorkerRequestsView() {
  const container = document.getElementById('workerRequestsContainer');
  if (!container) return;

  if (!pendingWorkerRequests.length) {
    container.innerHTML = '<div class="info-box">No pending requests.</div>';
    return;
  }

  container.innerHTML = pendingWorkerRequests.map(r => `
    <div class="worker-card">
      <h3>${r.email}</h3>
      <p><strong>Name:</strong> ${r.username}</p>
      <p><strong>Requested Role:</strong> ${r.requestedRole}</p>
      <p><strong>Status:</strong> <span class="status-badge status-open">${r.status}</span></p>
      <div class="report-actions">
        <button onclick="approveWorkerRequest('${r.id}')" class="btn btn-primary btn-small">Approve</button>
        <button onclick="rejectWorkerRequest('${r.id}')" class="btn btn-danger btn-small">Reject</button>
      </div>
    </div>
  `).join('');
}

async function approveWorkerRequest(requestId) {
  if (!confirm('Approve this worker request?')) return;
  try {
    await cwApi.postJson(`/admin/worker-requests/${requestId}/approve`, {});
    alert('Worker request approved.');
    await loadWorkers();
    await loadWorkerRequests();
  } catch (error) {
    console.error('Error approving worker request:', error);
  }
}

async function rejectWorkerRequest(requestId) {
  if (!confirm('Reject this worker request?')) return;
  try {
    await cwApi.postJson(`/admin/worker-requests/${requestId}/reject`, {});
    alert('Worker request rejected.');
    await loadWorkerRequests();
  } catch (error) {
    console.error('Error rejecting worker request:', error);
  }
}

// Export reports
function exportReports() {
  cwApi.get("/admin/reports")
  .then(reports => {
    const csv = 'Category,Reporter,Status,Date\n' +
      reports.map(r => `"${r.category}","${r.createdBy}","${r.status}","${new Date(r.createdAt).toLocaleDateString()}"`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports.csv';
    a.click();
  })
  .catch(error => {
    console.error('Error exporting reports:', error);
  });
}

function logout() {
  cwAuth.logout();
}

// Modal close on outside click
window.onclick = function(event) {
  const assignModal = document.getElementById('assignModal');
  const workerModal = document.getElementById('workerModal');
  const detailsModal = document.getElementById('reportDetailsModal');
  if (event.target == assignModal) assignModal.classList.remove('show');
  if (event.target == workerModal) workerModal.classList.remove('show');
  if (event.target == detailsModal) detailsModal.classList.remove('show');
}