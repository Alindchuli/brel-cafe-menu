// Admin Login System
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        // Form submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Toggle password visibility
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = togglePassword.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });

        // Enter key handling
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin();
            }
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorMessage = document.getElementById('errorMessage');
        const loginBtn = document.getElementById('loginBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');

        // Basic validation
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        // Show loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        loadingOverlay.style.display = 'flex';

        try {
            // Send login request to server
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    rememberMe: rememberMe
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Store authentication token
                if (rememberMe) {
                    localStorage.setItem('adminToken', result.token);
                } else {
                    sessionStorage.setItem('adminToken', result.token);
                }

                // Store admin info
                localStorage.setItem('adminInfo', JSON.stringify({
                    username: result.username,
                    loginTime: new Date().toISOString(),
                    rememberMe: rememberMe
                }));

                // Success animation
                loginBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                loginBtn.style.background = '#10b981';

                // Redirect to admin panel
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);

            } else {
                this.showError(result.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Connection error. Please try again.');
        } finally {
            // Hide loading
            loadingOverlay.style.display = 'none';
            
            // Reset button if not successful
            setTimeout(() => {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                loginBtn.style.background = '';
            }, 2000);
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.querySelector('span').textContent = message;
        errorMessage.style.display = 'flex';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    checkExistingSession() {
        // Check if user is already logged in
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const adminInfo = localStorage.getItem('adminInfo');

        if (token && adminInfo) {
            // Verify token with server
            this.verifyToken(token);
        }
    }

    async verifyToken(token) {
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Token is valid, redirect to admin panel
                window.location.href = 'admin.html';
            } else {
                // Token is invalid, clear storage
                this.clearAuthData();
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.clearAuthData();
        }
    }

    clearAuthData() {
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
    }
}

// Utility functions for other pages to use
window.AdminAuth = {
    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        return !!token;
    },

    // Get authentication token
    getToken() {
        return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    },

    // Get admin info
    getAdminInfo() {
        const info = localStorage.getItem('adminInfo');
        return info ? JSON.parse(info) : null;
    },

    // Logout
    logout() {
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = 'login.html';
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Add some security measures
document.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Disable right-click context menu
});

document.addEventListener('keydown', (e) => {
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});