cwAuth.requireRole("CITIZEN");
const { token, email: userEmail } = cwAuth.getAuth();

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("userName").textContent = userEmail || 'User';
  document.getElementById("userGreeting").textContent = `Welcome back, ${userEmail}! Help us keep our city clean.`;
  loadReports();
  loadStats();
});

// Character counter
const descriptionEl = document.getElementById('description');
if (descriptionEl) {
  descriptionEl.addEventListener('input', function() {
    const count = this.value.length;
    document.getElementById('charCount').textContent = `${count}/500 characters`;
  });
}

async function loadStats() {
  try {
    const reports = await cwApi.get("/reports/my-reports");
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
    const reports = await cwApi.get("/reports/my-reports");
    document.getElementById('loadingIndicator').style.display = 'none';

    if (reports.length === 0) {
      document.getElementById('noReports').style.display = 'block';
      document.getElementById('reportsContainer').innerHTML = '';
      return;
    }

    document.getElementById('noReports').style.display = 'none';
    document.getElementById('reportsContainer').innerHTML = reports.map(r => {
      const locationText = r.location
        ? `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}`
        : 'Not specified';
      return `
      <div class="report-card" data-report-id="${r.id}">
        <div class="report-header">
          <h3>${r.category}</h3>
          <span class="status-badge status-${r.status?.toLowerCase() || 'open'}">${r.status || 'OPEN'}</span>
        </div>
        <div class="report-detail"><strong>Description:</strong> ${r.description?.substring(0, 100)}...</div>
        <div class="report-detail"><strong>Location:</strong> ${locationText}</div>
        <div class="report-detail"><strong>Date:</strong> ${new Date(r.createdAt).toLocaleDateString()}</div>
        ${r.imageDataUrl ? `<img src="${r.imageDataUrl}" alt="Report image" class="report-image">` : ''}
        <div class="report-actions">
          <button onclick="showReportDetails(${r.id})" class="btn btn-primary btn-small">View Details</button>
          ${r.status === 'OPEN' ? `<button onclick="deleteReport(${r.id})" class="btn btn-danger btn-small">Delete</button>` : ''}
        </div>
      </div>
    `; }).join('');
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
    await cwApi.delete(`/reports/${id}`);
    alert('Report deleted successfully!');
    loadReports();
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

    const imageFile = document.getElementById('image').files[0];
    if (!imageFile) {
      alert('Please upload an image as proof of the issue.');
      return;
    }
    const imageDataUrl = await fileToDataUrl(imageFile);

    const payload = {
      category,
      description,
      location: locationData
        ? { lat: locationData.latitude, lng: locationData.longitude }
        : null,
      imageDataUrl
    };

    await cwApi.postJson("/reports", payload);
    alert('Report submitted successfully!');
    closeReportModal();
    loadReports();
    loadStats();
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

// Help Assistant (menu-based, no free text)
const assistantResponses = {
  report: `To submit a report:
1. Click the "Report New Issue" button.
2. Choose the category (Road Damage, Waste Management, etc.).
3. Describe the issue in detail.
4. (Optional) Upload a clear photo of the problem.
5. Keep "Use Current Location" checked so we can find the spot.
6. Click "Submit Report".

You can then track its status from this dashboard.`,
  categories: `We handle these categories:
- Road Damage: Potholes, broken roads.
- Waste Management: Garbage overflow, littering.
- Street Light: Lights not working or flickering.
- Water Supply: Leaks, low pressure, water quality.
- Drainage: Blocked drains, flooding.
- Other: Any civic issue that doesn't fit above.`,
  status: `Each report has a status:
- OPEN: Just submitted, waiting for review.
- IN_PROGRESS: Assigned to a worker and being resolved.
- CLOSED: The issue has been resolved.

You can see the status for each report card and in your stats.`,
  photos: `Photos help us:
- Verify the issue quickly.
- Understand how serious it is.
- Assign the right team.

Try to upload clear photos that show the problem from useful angles.`,
  location: `Location helps us:
- Find the exact place of the issue.
- Send workers to the right spot.
- Understand which areas have more problems.

Please keep location services enabled and make sure the map/coordinates look correct before submitting.`,
  notifications: `Email notifications:
- You'll get an email when your report is created.
- You'll get emails when the status changes (for example: to IN_PROGRESS or CLOSED).

Make sure your email is correct when you sign up so you don't miss updates.`
};

function showHelpAssistant() {
  const modal = document.getElementById('chatbotModal');
  const messagesDiv = document.getElementById('chatMessages');
  modal.classList.add('show');
  messagesDiv.innerHTML =
    '<div class="chat-message bot">Hi! I can help you understand how CleanWave works. Choose a topic below to learn more.</div>';
}

function closeChatbot() {
  document.getElementById('chatbotModal').classList.remove('show');
}

function showAssistantTopic(topicKey) {
  const messagesDiv = document.getElementById('chatMessages');
  const text = assistantResponses[topicKey] || assistantResponses.report;
  messagesDiv.innerHTML += `<div class="chat-message bot">${text.replace(/\n/g, '<br>')}</div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function logout() {
  cwAuth.logout();
}

// Modal close on outside click
window.onclick = function(event) {
  const reportModal = document.getElementById('reportModal');
  const chatbotModal = document.getElementById('chatbotModal');
  if (event.target == reportModal) reportModal.classList.remove('show');
  if (event.target == chatbotModal) chatbotModal.classList.remove('show');
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
