// google_login.js - Handle Google Sign-In authentication

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Global elements
let loginButton, userInfo, user_name, userAvatar, logoutButton;
let loginButtonMobile, userInfoMobile, userNameMobile, userAvatarMobile, logoutButtonMobile;

// Initialize auth elements and check status
function initAuth() {
    // Get desktop elements
    loginButton = document.getElementById('login-button');
    userInfo = document.getElementById('user-info');
    user_name = document.getElementById('user-name');
    userAvatar = document.getElementById('user-avatar');
    logoutButton = document.getElementById('logout-button');

    // Get mobile elements
    loginButtonMobile = document.getElementById('login-button-mobile');
    userInfoMobile = document.getElementById('user-info-mobile');
    userNameMobile = document.getElementById('user-name-mobile');
    userAvatarMobile = document.getElementById('user-avatar-mobile');
    logoutButtonMobile = document.getElementById('logout-button-mobile');

    // Add logout event listeners
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    if (logoutButtonMobile) {
        logoutButtonMobile.addEventListener('click', handleLogout);
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogleSignIn;
    document.head.appendChild(script);

    // Check login status
    checkLoginStatus();
}

// Add this function to your google_login.js
function initGoogleSignIn() {
    // Configure Google Sign-In
    // Configure Google Sign-In with advanced settings
    google.accounts.id.initialize({
        client_id: '737149879159-k8sksf67g8o8e769u1qvnjjmojv7i8sl.apps.googleusercontent.com',
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        context: 'signin'  // Explicitly set the context
    });

    // Render the sign-in button
    const loginButton = document.getElementById('login-button');

    if (loginButton) {
        // Use different options based on screen size
        const isMobile = window.innerWidth <= 768;

        google.accounts.id.renderButton(
            loginButton,
            {
                theme: 'outline',
                size: isMobile ? 'large' : 'medium',
                text: 'signin_with',
                shape: 'rectangular',
                width: isMobile ? 'max' : undefined
            }
        );
    }
}

// Update the window resize handler
window.addEventListener('resize', function() {
    // Re-render the Google button when window is resized across breakpoints
    const currentIsMobile = window.innerWidth <= 768;
    if (currentIsMobile !== (window.lastIsMobile || false)) {
        window.lastIsMobile = currentIsMobile;

        // Only re-render if Google is loaded
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            initGoogleSignIn();
        }
    }
});

// Handle Google credential response
function handleGoogleCredential(response) {
    // Send the token to our server for verification
    fetch('auth_callback.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'credential=' + encodeURIComponent(response.credential)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateUIWithUserInfo(data.user);
        } else {
            console.error('Authentication failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during authentication:', error);
    });
}

// Check if user is already logged in
function checkLoginStatus() {
    fetch('auth_status.php')
    .then(response => response.json())
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

    // Update admin badge on desktop
    const adminBadge = document.getElementById('admin-badge');
    if (adminBadge) {
        adminBadge.style.display = user.is_admin ? 'inline-block' : 'none';
    }

    // Update mobile UI
    if (loginButtonMobile) loginButtonMobile.style.display = 'none';
    if (userInfoMobile) userInfoMobile.style.display = 'flex';
    if (userAvatarMobile) userAvatarMobile.src = user.picture || user.profile_picture;
    if (userNameMobile) userNameMobile.textContent = user.name;

    // Update admin badge on mobile
    const adminBadgeMobile = document.getElementById('admin-badge-mobile');
    if (adminBadgeMobile) {
        adminBadgeMobile.style.display = user.is_admin ? 'inline-block' : 'none';
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
    console.log("Logging out...");

    fetch('auth_logout.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reset desktop UI
            if (loginButton) loginButton.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';

            // Reset mobile UI
            if (loginButtonMobile) loginButtonMobile.style.display = 'flex';
            if (userInfoMobile) userInfoMobile.style.display = 'none';

            // Hide admin controls
            hideAdminControls();

            // Reload to ensure clean state
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
        // Fallback reload
        window.location.reload();
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