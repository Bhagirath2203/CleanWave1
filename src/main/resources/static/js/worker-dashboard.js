let myAssignments = [];

// Check authentication
if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'WORKER') {
    window.location.href = '/login.html';
}

document.getElementById('userEmail').textContent = localStorage.getItem('email');

// Load assignments
async function loadAssignments() {
    try {
        const response = await fetch(`${API_URL}/worker/my-assignments`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            myAssignments = await response.json();
            updateStats();
            displayReports(myAssignments);
        }
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

function updateStats() {
    const total = myAssignments.length;
    const inProgress = myAssignments.filter(r => r.status === 'IN_PROGRESS').length;
    const completed = myAssignments.filter(r => r.status === 'CLOSED').length;
    
    document.getElementById('totalAssignments').textContent = total;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('completedCount').textContent = completed;
}

function displayReports(reports) {
    const container = document.getElementById('reportsContainer');
    
    if (reports.length === 0) {
        container.innerHTML = '<p>No assignments yet.</p>';
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
            <p class="report-detail"><strong>Assigned on:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            <p class="report-detail"><strong>Location:</strong> ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}</p>
            ${report.imageDataUrl ? `<img src="${report.imageDataUrl}" class="report-image" alt="Report">` : ''}
            <div class="report-actions">
                ${report.status !== 'CLOSED' ? `<button onclick="openStatusModal('${report.id}')" class="btn btn-primary">Update Status</button>` : ''}
            </div>
        </div>
    `).join('');
}

function openStatusModal(reportId) {
    document.getElementById('reportId').value = reportId;
    document.getElementById('statusModal').classList.add('show');
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.remove('show');
}

document.getElementById('statusForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const reportId = document.getElementById('reportId').value;
    const status = document.getElementById('statusSelect').value;
    
    try {
        const response = await fetch(`${API_URL}/worker/reports/${reportId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            closeStatusModal();
            loadAssignments();
            alert('Status updated successfully!');
        } else {
            alert('Failed to update status. Please try again.');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Network error. Please try again.');
    }
});

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
loadAssignments();
