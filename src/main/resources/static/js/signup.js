document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Store user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.email);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);
            
            // Redirect based on role
            if (data.role === 'ADMIN') {
                window.location.href = '/admin-dashboard.html';
            } else if (data.role === 'WORKER') {
                window.location.href = '/worker-dashboard.html';
            } else {
                window.location.href = '/citizen-dashboard.html';
            }
        } else {
            const error = await response.text();
            showError(error || 'Signup failed. Please try again.');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}
