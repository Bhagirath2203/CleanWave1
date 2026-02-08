let currentLocation = null;

// Check authentication
if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
}

document.getElementById('userEmail').textContent = localStorage.getItem('email');

// Get current location
navigator.geolocation.getCurrentPosition(
    position => {
        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        updateLocationInfo();
    },
    error => console.error('Error getting location:', error)
);

function updateLocationInfo() {
    if (currentLocation) {
        document.getElementById('locationInfo').textContent = 
            `Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
    }
}

// Load reports
async function loadReports() {
    try {
        const response = await fetch(`${API_URL}/reports/my-reports`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const reports = await response.json();
            displayReports(reports);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

function displayReports(reports) {
    const container = document.getElementById('reportsContainer');
    
    if (reports.length === 0) {
        container.innerHTML = '<p>No reports yet. Create your first report!</p>';
        return;
    }
    
    container.innerHTML = reports.map(report => `
        <div class="report-card">
            <h3>${report.category}</h3>
            <p class="report-detail">${report.description}</p>
            <p class="report-detail">
                <strong>Status:</strong> 
                <span class="status-badge status-${report.status.toLowerCase().replaceAll('_', '-')}">${report.status.replaceAll('_', ' ')}</span>
            </p>
            <p class="report-detail"><strong>Submitted:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            ${report.assignedTo ? `<p class="report-detail"><strong>Assigned to:</strong> ${report.assignedTo.name}</p>` : ''}
            ${report.imageDataUrl ? `<img src="${report.imageDataUrl}" class="report-image" alt="Report">` : ''}
        </div>
    `).join('');
}

// Report form
document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];
    
    let imageDataUrl = null;
    if (imageFile) {
        imageDataUrl = await fileToBase64(imageFile);
    }
    
    const reportData = {
        category,
        description,
        location: currentLocation || { lat: 0, lng: 0 },
        imageDataUrl
    };
    
    try {
        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reportData)
        });
        
        if (response.ok) {
            closeReportModal();
            document.getElementById('reportForm').reset();
            loadReports();
            alert('Report submitted successfully!');
        } else {
            alert('Failed to submit report. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        alert('Network error. Please try again.');
    }
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showReportModal() {
    document.getElementById('reportModal').classList.add('show');
}

function closeReportModal() {
    document.getElementById('reportModal').classList.remove('show');
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// Chatbot functionality
let chatMessages = [];

function showChatbot() {
    document.getElementById('chatbotModal').classList.add('show');
    if (chatMessages.length === 0) {
        addBotMessage('Hello! I\'m here to help you report civic issues. You can ask me about:\n- How to submit a report\n- What categories are available\n- How to track your reports\n\nHow can I assist you today?');
    }
}

function closeChatbot() {
    document.getElementById('chatbotModal').classList.remove('show');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    // Simple chatbot responses
    setTimeout(() => {
        const response = getChatbotResponse(message.toLowerCase());
        addBotMessage(response);
    }, 500);
}

function getChatbotResponse(message) {
    if (message.includes('report') || message.includes('submit')) {
        return 'To submit a report:\n1. Click "Report New Issue" button\n2. Select a category\n3. Add description and photo\n4. Submit!\n\nYour report will be reviewed by our team.';
    } else if (message.includes('category') || message.includes('categories')) {
        return 'We handle these categories:\n- Road Damage\n- Waste Management\n- Street Light\n- Water Supply\n- Drainage\n- Other';
    } else if (message.includes('track') || message.includes('status')) {
        return 'You can track your reports on this dashboard. Each report shows its current status:\n- Open: Just submitted\n- In Progress: Being worked on\n- Closed: Resolved';
    } else if (message.includes('help') || message.includes('hi') || message.includes('hello')) {
        return 'I can help you with:\n- Submitting reports\n- Understanding categories\n- Tracking report status\n\nWhat would you like to know?';
    } else {
        return 'I\'m here to help with reporting civic issues. You can ask about submitting reports, categories, or tracking status.';
    }
}

function addUserMessage(text) {
    chatMessages.push({ type: 'user', text });
    updateChatDisplay();
}

function addBotMessage(text) {
    chatMessages.push({ type: 'bot', text });
    updateChatDisplay();
}

function updateChatDisplay() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = chatMessages.map(msg => `
        <div class="chat-message ${msg.type}">
            ${msg.text.replace(/\n/g, '<br>')}
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}

// Load reports on page load
loadReports();
