// Frontend Configuration
// This file contains the API endpoint configuration

const CONFIG = {
    // Railway backend URL (will be updated after deployment)
    API_BASE_URL: 'http://localhost:3000/api', // For local development
    // API_BASE_URL: 'https://your-app.up.railway.app/api', // For production (update after deployment)
    
    // Application settings
    APP_NAME: 'Cement Production Planner',
    VERSION: '1.0.0',
    
    // Date settings
    TIMELINE_DAYS_PAST: 30,
    TIMELINE_DAYS_FUTURE: 60,
    
    // Default values
    DEFAULT_KILN_TPD: 2000,
    DEFAULT_MILL_TPD: 1800,
    DEFAULT_SILO_CAPACITY: 5000
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, apiCall };
}
