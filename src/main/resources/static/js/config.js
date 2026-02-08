// API Configuration
// Automatically use the same origin as the frontend
const API_URL = window.location.origin + '/api';

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_URL };
}
