let allReports = [];
let workers = [];

// Check authentication
if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'ADMIN') {
    window.location.href = '/login.html';
}

document.getElementById('userEmail').textContent = localStorage.getItem('email');

// Load data
async function loadReports() {
    try {
        const response = await fetch(`${API_URL}/admin/reports`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            allReports = await response.json();
            updateStats();
            displayReports(allReports);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

async function loadWorkers() {
    try {
        const response = await fetch(`${API_URL}/admin/workers`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            workers = await response.json();
            populateWorkerSelect();
        }
    } catch (error) {
        console.error('Error loading workers:', error);
    }
}

function updateStats() {
    const total = allReports.length;
    const open = allReports.filter(r => r.status === 'OPEN').length;
    const inProgress = allReports.filter(r => r.status === 'IN_PROGRESS').length;
    const closed = allReports.filter(r => r.status === 'CLOSED').length;
    
    document.getElementById('totalReports').textContent = total;
    document.getElementById('openReports').textContent = open;
    document.getElementById('inProgressReports').textContent = inProgress;
    document.getElementById('closedReports').textContent = closed;
}

function displayReports(reports) {
    const container = document.getElementById('reportsContainer');
    
    if (reports.length === 0) {
        container.innerHTML = '<p>No reports found.</p>';
        return;
    }
    
    container.innerHTML = reports.map(report => `
        <div class="report-card">
            <h3>${report.category}</h3>
            <p class="report-detail">${report.description}</p>
            <p class="report-detail"><strong>Reported by:</strong> ${report.by}</p>
            <p class="report-detail">
                <strong>Status:</strong> 
                <span class="status-badge status-${report.status.toLowerCase().replace('_', '-')}">${report.status.replace('_', ' ')}</span>
            </p>
            <p class="report-detail"><strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            ${report.assignedTo ? `<p class="report-detail"><strong>Assigned to:</strong> ${report.assignedTo.name}</p>` : ''}
            ${report.imageDataUrl ? `<img src="${report.imageDataUrl}" class="report-image" alt="Report">` : ''}
            <div class="report-actions">
                ${!report.assignedTo ? `<button onclick="openAssignModal('${report.id}')" class="btn btn-primary">Assign Worker</button>` : ''}
                ${report.status !== 'CLOSED' ? `<button onclick="updateStatus('${report.id}', 'CLOSED')" class="btn btn-secondary">Mark Closed</button>` : ''}
            </div>
        </div>
    `).join('');
}

function filterReports() {
    const status = document.getElementById('statusFilter').value;
    
    if (!status) {
        displayReports(allReports);
    } else {
        const filtered = allReports.filter(r => r.status === status);
        displayReports(filtered);
    }
}

function populateWorkerSelect() {
    const select = document.getElementById('workerSelect');
    select.innerHTML = '<option value="">Select Worker</option>' + 
        workers.map(w => `<option value="${w.email}">${w.username} (${w.email})</option>`).join('');
}

function openAssignModal(reportId) {
    document.getElementById('reportId').value = reportId;
    document.getElementById('assignModal').classList.add('show');
}

function closeAssignModal() {
    document.getElementById('assignModal').classList.remove('show');
}

document.getElementById('assignForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const reportId = document.getElementById('reportId').value;
    const workerEmail = document.getElementById('workerSelect').value;
    
    try {
        const response = await fetch(`${API_URL}/admin/reports/${reportId}/assign`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ workerEmail })
        });
        
        if (response.ok) {
            closeAssignModal();
            loadReports();
            alert('Worker assigned successfully!');
        } else {
            alert('Failed to assign worker. Please try again.');
        }
    } catch (error) {
        console.error('Error assigning worker:', error);
        alert('Network error. Please try again.');
    }
});

async function updateStatus(reportId, status) {
    try {
        const response = await fetch(`${API_URL}/admin/reports/${reportId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            loadReports();
            alert('Status updated successfully!');
        } else {
            alert('Failed to update status. Please try again.');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Network error. Please try again.');
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}

// Load data on page load
loadReports();
loadWorkers();
