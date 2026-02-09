const API_URL = "http://localhost:8080/api";
const token = localStorage.getItem("token");
const userEmail = localStorage.getItem("email");

if (!token) {
  window.location.href = "/login.html";
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("userName").textContent = userEmail || 'User';
  document.getElementById("userGreeting").textContent = `Welcome back, ${userEmail}! Help us keep our city clean.`;
  loadReports();
  loadStats();
});

// Character counter
document.getElementById('description')?.addEventListener('input', function() {
  const count = this.value.length;
  document.getElementById('charCount').textContent = `${count}/500 characters`;
});

async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/reports/my-reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) return;

    const reports = await response.json();
    const total = reports.length;
    const resolved = reports.filter(r => r.status === 'CLOSED').length;
    const inProgress = reports.filter(r => r.status === 'IN_PROGRESS').length;
    const pending = reports.filter(r => r.status === 'OPEN').length;

    document.getElementById('myReportsCount').textContent = total;
    document.getElementById('resolvedCount').textContent = resolved;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('pendingCount').textContent = pending;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadReports() {
  try {
    document.getElementById('loadingIndicator').style.display = 'block';
    const response = await fetch(`${API_URL}/reports/my-reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load reports');

    const reports = await response.json();
    document.getElementById('loadingIndicator').style.display = 'none';

    if (reports.length === 0) {
      document.getElementById('noReports').style.display = 'block';
      document.getElementById('reportsContainer').innerHTML = '';
      return;
    }

    document.getElementById('noReports').style.display = 'none';
    document.getElementById('reportsContainer').innerHTML = reports.map(r => `
      <div class="report-card">
        <div class="report-header">
          <h3>${r.category}</h3>
          <span class="status-badge status-${r.status?.toLowerCase() || 'open'}">${r.status || 'OPEN'}</span>
        </div>
        <div class="report-detail"><strong>Description:</strong> ${r.description?.substring(0, 100)}...</div>
        <div class="report-detail"><strong>Location:</strong> ${r.location?.name || 'Not specified'}</div>
        <div class="report-detail"><strong>Date:</strong> ${new Date(r.createdAt).toLocaleDateString()}</div>
        ${r.image ? `<img src="data:image/jpeg;base64,${r.image}" alt="Report image" class="report-image">` : ''}
        <div class="report-actions">
          <button onclick="showReportDetails(${r.id})" class="btn btn-primary btn-small">View Details</button>
          ${r.status === 'OPEN' ? `<button onclick="deleteReport(${r.id})" class="btn btn-danger btn-small">Delete</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading reports:', error);
    document.getElementById('reportsContainer').innerHTML = '<div class="error-message">Failed to load reports. Please try again later.</div>';
  }
}

function filterReports() {
  const status = document.getElementById('statusFilter').value;
  const cards = document.querySelectorAll('.report-card');
  
  cards.forEach(card => {
    const badge = card.querySelector('.status-badge');
    if (!status || badge.textContent.trim() === status) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function showReportModal() {
  document.getElementById('reportModal').classList.add('show');
  document.getElementById('reportError').innerHTML = '';
}

function closeReportModal() {
  document.getElementById('reportModal').classList.remove('show');
  document.getElementById('reportForm').reset();
}

function showReportDetails(reportId) {
  const report = document.querySelector(`[data-report-id="${reportId}"]`);
  if (report) {
    const modal = document.getElementById('reportDetailsModal');
    modal.classList.add('show');
  }
}

function closeReportDetailsModal() {
  document.getElementById('reportDetailsModal').classList.remove('show');
}

async function deleteReport(id) {
  if (!confirm('Are you sure you want to delete this report?')) return;
  
  try {
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      alert('Report deleted successfully!');
      loadReports();
    } else {
      alert('Failed to delete report.');
    }
  } catch (error) {
    console.error('Error deleting report:', error);
  }
}

// Report Form Submission
document.getElementById('reportForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  try {
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const useLocation = document.getElementById('useCurrentLocation').checked;

    if (!category || !description) {
      alert('Please fill in all required fields.');
      return;
    }

    let locationData = null;
    if (useLocation) {
      locationData = await getLocation();
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    
    if (locationData) {
      formData.append('latitude', locationData.latitude);
      formData.append('longitude', locationData.longitude);
    }

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (response.ok) {
      alert('Report submitted successfully!');
      closeReportModal();
      loadReports();
      loadStats();
    } else {
      const error = await response.text();
      document.getElementById('reportError').innerHTML = `Error: ${error}`;
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    document.getElementById('reportError').innerHTML = 'Error submitting report. Please try again.';
  }
});

// Geolocation
function getLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          document.getElementById('locationInfo').innerHTML = 
            `📍 Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          document.getElementById('locationInfo').innerHTML = 
            'Unable to get location. Please enable location services.';
          reject(error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      reject(new Error('Geolocation not supported'));
    }
  });
}

// Chatbot
function showChatbot() {
  document.getElementById('chatbotModal').classList.add('show');
  document.getElementById('chatMessages').innerHTML = '<div class="chat-message bot">Hello! How can I help you today?</div>';
}

function closeChatbot() {
  document.getElementById('chatbotModal').classList.remove('show');
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;

  const messagesDiv = document.getElementById('chatMessages');
  messagesDiv.innerHTML += `<div class="chat-message user">${message}</div>`;
  input.value = '';

  try {
    const response = await fetch(`${API_URL}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const data = await response.json();
      messagesDiv.innerHTML += `<div class="chat-message bot">${data.response}</div>`;
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function logout() {
  localStorage.clear();
  window.location.href = "/login.html";
}

// Modal close on outside click
window.onclick = function(event) {
  const reportModal = document.getElementById('reportModal');
  const chatbotModal = document.getElementById('chatbotModal');
  if (event.target == reportModal) reportModal.classList.remove('show');
  if (event.target == chatbotModal) chatbotModal.classList.remove('show');
}
