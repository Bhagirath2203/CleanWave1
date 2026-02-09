cwAuth.requireRole("WORKER");
const { email: userEmail } = cwAuth.getAuth();

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("userName").textContent = userEmail || 'Worker';
  loadTasks();
});

// Load assigned tasks
async function loadTasks() {
  try {
    document.getElementById('loadingIndicator').style.display = 'block';
    const tasks = await cwApi.get("/worker/my-assignments");
    document.getElementById('loadingIndicator').style.display = 'none';

    if (tasks.length === 0) {
      document.getElementById('noTasks').style.display = 'block';
      document.getElementById('reportsContainer').innerHTML = '';
      updateStats([]);
      return;
    }

    document.getElementById('noTasks').style.display = 'none';
    updateStats(tasks);

    document.getElementById('reportsContainer').innerHTML = tasks.map(task => `
      <div class="report-card" data-status="${task.status}">
        <div class="report-header">
          <h3>${task.category}</h3>
          <span class="status-badge status-${task.status?.toLowerCase() || 'open'}">${task.status || 'OPEN'}</span>
        </div>
        <div class="report-detail"><strong>Reporter:</strong> ${task.createdBy || 'Unknown'}</div>
        <div class="report-detail"><strong>Description:</strong> ${task.description?.substring(0, 80)}...</div>
        <div class="report-detail"><strong>Location:</strong> ${
          task.location
            ? `${task.location.lat.toFixed(4)}, ${task.location.lng.toFixed(4)}`
            : 'Not specified'
        }</div>
        <div class="report-detail"><strong>Date:</strong> ${new Date(task.createdAt).toLocaleDateString()}</div>
        ${task.imageDataUrl ? `<img src="${task.imageDataUrl}" alt="Task image" class="report-image">` : ''}
        <div class="report-actions">
          <button onclick="showTaskDetails(${task.id})" class="btn btn-primary btn-small">View Details</button>
          ${task.status !== 'CLOSED' ? `<button onclick="showStatusModal(${task.id})" class="btn btn-secondary btn-small">Update Status</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading tasks:', error);
    document.getElementById('reportsContainer').innerHTML = '<div class="error-message">Failed to load tasks. Please try again.</div>';
  }
}

// Update stats
function updateStats(tasks) {
  const total = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter(t => t.status === 'CLOSED').length;
  const pending = tasks.filter(t => t.status === 'OPEN').length;

  document.getElementById('totalAssignments').textContent = total;
  document.getElementById('inProgressCount').textContent = inProgress;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('pendingCount').textContent = pending;
}

// Filter tasks
function filterTasks() {
  const status = document.getElementById('statusFilter').value;
  const cards = document.querySelectorAll('[data-status]');
  
  cards.forEach(card => {
    if (!status || card.dataset.status === status) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Show task details
function showTaskDetails(taskId) {
  cwApi.get(`/reports/${taskId}`).then(task => {
    const html = `
      <h2>${task.category}</h2>
      <div class="report-detail"><strong>Status:</strong> <span class="status-badge status-${task.status?.toLowerCase()}">${task.status}</span></div>
      <div class="report-detail"><strong>Reporter:</strong> ${task.createdBy}</div>
      <div class="report-detail"><strong>Description:</strong> ${task.description}</div>
      <div class="report-detail"><strong>Location:</strong> ${
        task.location
          ? `${task.location.lat.toFixed(4)}, ${task.location.lng.toFixed(4)}`
          : 'Not specified'
      }</div>
      <div class="report-detail"><strong>Date Reported:</strong> ${new Date(task.createdAt).toLocaleDateString()}</div>
      ${task.imageDataUrl ? `<img src="${task.imageDataUrl}" alt="Task image" class="report-image">` : ''}
      <div style="margin-top: 1rem;">
        ${task.status !== 'CLOSED' ? `<button onclick="showStatusModal(${task.id})" class="btn btn-primary">Update Status</button>` : ''}
      </div>
    `;
    document.getElementById('taskDetailsContent').innerHTML = html;
    document.getElementById('taskDetailsModal').classList.add('show');
  }).catch(error => {
    console.error('Error loading task details:', error);
  });
}

function closeTaskDetailsModal() {
  document.getElementById('taskDetailsModal').classList.remove('show');
}

// Show update status modal
function showStatusModal(reportId) {
  document.getElementById('reportId').value = reportId;
  document.getElementById('statusModal').classList.add('show');
  document.getElementById('statusForm').reset();
}

function closeStatusModal() {
  document.getElementById('statusModal').classList.remove('show');
}

// Update status form submission
const statusFormEl = document.getElementById('statusForm');
if (statusFormEl) statusFormEl.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const reportId = document.getElementById('reportId').value;
  const status = document.getElementById('statusSelect').value;
  const notes = document.getElementById('notes').value;

  try {
    await cwApi.putJson(`/worker/reports/${reportId}/status`, { status, notes });
    alert('Status updated successfully!');
    closeStatusModal();
    loadTasks();
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Error updating status. Please try again.');
  }
});

function logout() {
  cwAuth.logout();
}

// Modal close on outside click
window.onclick = function(event) {
  const statusModal = document.getElementById('statusModal');
  const detailsModal = document.getElementById('taskDetailsModal');
  if (event.target == statusModal) statusModal.classList.remove('show');
  if (event.target == detailsModal) detailsModal.classList.remove('show');
}
