// google_login.js - Handle Google Sign-In authentication

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Global elements
let loginButton, userInfo, user_name, userAvatar, logoutButton;
let isLoading = false;

// Initialize auth elements and check status
function initAuth() {
    // Get desktop elements
    loginButton = document.getElementById('login-button');
    userInfo = document.getElementById('user-info');
    user_name = document.getElementById('user-name');
    userAvatar = document.getElementById('user-avatar');
    logoutButton = document.getElementById('logout-button');

    // Add logout event listeners
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Initialize Google Sign-In
    google.accounts.id.initialize({
        client_id: '737149879159-k8sksf67g8o8e769u1qvnjjmojv7i8sl.apps.googleusercontent.com',
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        context: 'signin'  // Explicitly set the context
    });

    // Render the sign-in button
    if (loginButton) {
        google.accounts.id.renderButton(
            loginButton,
            {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: 250
            }
        );
    }

    // Check login status
    checkLoginStatus();
}

// Handle Google credential response
function handleGoogleCredential(response) {
    if (isLoading) return; // Prevent multiple submissions
    setLoading(true);

    // Send the token to our server for verification
    fetch('backend/google_login/auth_callback.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ credential: response.credential })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            updateUIWithUserInfo(data.user);
            showNotification('Successfully logged in!', 'success');
        } else {
            throw new Error(data.message || 'Authentication failed');
        }
    })
    .catch(error => {
        console.error('Error during authentication:', error);
        showNotification(error.message || 'Failed to authenticate. Please try again.', 'error');
    })
    .finally(() => {
        setLoading(false);
    });
}

// Check if user is already logged in
function checkLoginStatus() {
    setLoading(true);
    fetch('backend/google_login/auth_status.php', {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.loggedIn) {
            updateUIWithUserInfo(data.user);

            // If user is admin, show admin controls
            if (data.user.is_admin) {
                showAdminControls();
            }
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        showNotification('Failed to check login status. Please refresh the page.', 'error');
    })
    .finally(() => {
        setLoading(false);
    });
}

// Update UI with user information
function updateUIWithUserInfo(user) {
    console.log("Updating UI with user:", user);

    // Update desktop UI
    if (loginButton) loginButton.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (userAvatar) userAvatar.src = user.picture || user.profile_picture;
    if (user_name) user_name.textContent = user.name;

    // Update admin badge
    const adminBadge = document.getElementById('admin-badge');
    if (adminBadge) {
        adminBadge.style.display = user.is_admin ? 'inline-block' : 'none';
    }

    // Show/hide admin controls based on admin status
    if (user.is_admin) {
        showAdminControls();
    } else {
        hideAdminControls();
    }
}

// Handle logout
function handleLogout() {
    if (isLoading) return; // Prevent multiple submissions
    setLoading(true);
    console.log("Logging out...");

    fetch('backend/google_login/auth_logout.php', {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Reset UI
            if (loginButton) loginButton.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';

            // Hide admin controls
            hideAdminControls();

            showNotification('Successfully logged out!', 'success');

            // Reload to ensure clean state
            window.location.reload();
        } else {
            throw new Error(data.message || 'Logout failed');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
        showNotification(error.message || 'Failed to logout. Please try again.', 'error');
        // Fallback reload
        window.location.reload();
    })
    .finally(() => {
        setLoading(false);
    });
}

// Show admin controls
function showAdminControls() {
    document.querySelectorAll('.admin-only').forEach(element => {
        element.style.display = 'block';
    });
}

// Hide admin controls
function hideAdminControls() {
    document.querySelectorAll('.admin-only').forEach(element => {
        element.style.display = 'none';
    });
}

// Set loading state
function setLoading(loading) {
    isLoading = loading;
    if (loginButton) {
        loginButton.disabled = loading;
        loginButton.style.opacity = loading ? '0.7' : '1';
    }
    if (logoutButton) {
        logoutButton.disabled = loading;
        logoutButton.style.opacity = loading ? '0.7' : '1';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}