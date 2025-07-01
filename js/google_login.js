// google_login.js - Handle Google Sign-In authentication

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Global elements
let loginButton, userInfo, user_name, userAvatar, logoutButton;
let isLoading = false;

// Dynamically load Google Sign-In script
function loadGoogleSignInScript() {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.google && window.google.accounts) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';

        script.onload = () => {
            console.log('Google Sign-In script loaded successfully');
            resolve();
        };

        script.onerror = () => {
            console.error('Failed to load Google Sign-In script');
            reject(new Error('Failed to load Google Sign-In script'));
        };

        document.head.appendChild(script);
    });
}

// Initialize auth elements and check status
async function initAuth() {
    // Get desktop elements
    loginButton = document.getElementById('login-button');
    userInfo = document.getElementById('user-info');
    user_name = document.getElementById('user-name');
    userAvatar = document.getElementById('user-avatar');
    logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', handleLogout);

    try {
        // Load Google Sign-In script first
        await loadGoogleSignInScript();

        // Initialize Google Sign-In
        google.accounts.id.initialize({
            client_id: '737149879159-k8sksf67g8o8e769u1qvnjjmojv7i8sl.apps.googleusercontent.com',
            callback: handleGoogleCredential,
            auto_select: true,  // Enable auto-selection for better UX
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

        // Check login status first, then decide whether to show one-tap
        checkLoginStatus().then((isLoggedIn) => {
            // Only show one-tap if user is not logged in
            if (!isLoggedIn) {
        setTimeout(() => {
            try {
                console.log('Attempting to show one-tap sign-in...');
                google.accounts.id.prompt((notification) => {
                    console.log('One-tap notification:', notification);
                    // Use FedCM-compatible methods
                    if (notification.isNotDisplayed()) {
                        console.log('One-tap not displayed:', notification.getNotDisplayedReason());
                    } else if (notification.isSkippedMoment()) {
                        console.log('One-tap skipped:', notification.getSkippedReason());
                    } else if (notification.isDismissedMoment()) {
                        console.log('One-tap dismissed:', notification.getDismissedReason());
                    }
                });
            } catch (error) {
                console.error('Error showing one-tap sign-in:', error);
            }
        }, 1000); // Wait 1 second after initialization
            } else {
                console.log('User is already logged in, skipping one-tap prompt');
            }
        }).catch((error) => {
            console.error('Error checking login status, showing one-tap as fallback:', error);
            // Show one-tap as fallback if we can't determine login status
            setTimeout(() => {
                try {
                    console.log('Showing one-tap sign-in as fallback...');
                    google.accounts.id.prompt((notification) => {
                        console.log('One-tap notification:', notification);
                        if (notification.isNotDisplayed()) {
                            console.log('One-tap not displayed:', notification.getNotDisplayedReason());
                        } else if (notification.isSkippedMoment()) {
                            console.log('One-tap skipped:', notification.getSkippedReason());
                        } else if (notification.isDismissedMoment()) {
                            console.log('One-tap dismissed:', notification.getDismissedReason());
                        }
                    });
                } catch (error) {
                    console.error('Error showing one-tap sign-in:', error);
                }
            }, 1000);
        });
    } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        showNotification('Failed to load Google Sign-In. Please refresh the page.', 'error');
    }
}

// Handle Google credential response
function handleGoogleCredential(response) {
    console.log('=== Google Credential Callback Started ===');
    console.log('Response object:', response);
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response));

    if (!response || !response.credential) {
        console.error('Invalid response received:', response);
        showNotification('Invalid authentication response. Please try again.', 'error');
        return;
    }

    if (isLoading) {
        console.log('Already processing authentication, ignoring duplicate call');
        return; // Prevent multiple submissions
    }

    console.log('Starting authentication process...');
    setLoading(true);

    // Send the token to our server for verification
    fetch('api/google_login/auth_callback.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ credential: response.credential })
    })
    .then(response => {
        console.log('Server response status:', response.status);
        console.log('Server response headers:', response.headers);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Server response data:', data);
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
        console.log('Authentication process completed');
        setLoading(false);
    });
}

// Check if user is already logged in
function checkLoginStatus() {
    setLoading(true);
    return fetch('api/google_login/auth_status.php', {
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
            return true;
        }
        return false;
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        showNotification('Failed to check login status. Please refresh the page.', 'error');
        return false;
    })
    .finally(() => {
        setLoading(false);
    });
}

// Update UI with user information
function updateUIWithUserInfo(user) {
    console.log("Updating UI with user:", user);

    // Set global admin status for window.isAdmin method
    window.isAdmin = user.is_admin || false;

    // Update desktop UI
    if (loginButton) loginButton.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (userAvatar) userAvatar.src = user.picture || user.profile_picture;
    if (user_name) user_name.textContent = user.name;

    // Show/hide admin controls based on admin status
    updateAdminControls()
}

// Handle logout
function handleLogout() {
    if (isLoading) return; // Prevent multiple submissions
    setLoading(true);
    console.log("Logging out...");

    fetch('api/google_login/auth_logout.php', {
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
            // Reset global admin status
            window.isAdmin = false;

            // Reset UI
            if (loginButton) loginButton.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';

            // Hide admin controls
            updateAdminControls();

            showNotification('Successfully logged out!', 'success');
        } else {
            throw new Error(data.message || 'Logout failed');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
        showNotification(error.message || 'Failed to logout. Please try again.', 'error');
    })
    .finally(() => {
        setLoading(false);
    });
}

// Show admin controls
function updateAdminControls() {
    document.querySelectorAll('.admin-only').forEach(element => {
        console.log("Updating admin controls for element:", element.id);
        console.log("isAdmin:", window.isAdmin);
        if (window.isAdmin) {
            element.classList.remove('admin-only-hidden');
        } else {
            element.classList.add('admin-only-hidden');
        }
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