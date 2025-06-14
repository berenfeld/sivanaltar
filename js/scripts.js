/**
 * nav.js - Dedicated JavaScript for navigation functionality
 * Handles mobile menu toggle and Google authentication integration
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile navigation
    initMobileNav();

    // No need to initialize Google auth here - that's handled by google_login.js
});

/**
 * Initialize mobile navigation functionality
 */
function initMobileNav() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    // Return early if navigation elements don't exist
    if (!menuToggle || !mainNav) {
        console.warn('Navigation elements not found');
        return;
    }

    // Create overlay for mobile menu if it doesn't exist
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    // Toggle menu functionality
    menuToggle.addEventListener('click', function() {
        toggleMobileMenu(this, mainNav, overlay);
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        closeMobileMenu(menuToggle, mainNav, overlay);
    });

    // Close menu when clicking any navigation link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu(menuToggle, mainNav, overlay);
        });
    });

    // Handle escape key to close menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMobileMenu(menuToggle, mainNav, overlay);
        }
    });
}

/**
 * Toggle mobile menu state
 * @param {HTMLElement} menuToggle - The menu toggle button
 * @param {HTMLElement} mainNav - The main navigation element
 * @param {HTMLElement} overlay - The overlay element
 */
function toggleMobileMenu(menuToggle, mainNav, overlay) {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');

    // Accessibility
    const expanded = menuToggle.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', expanded);

    // Prevent background scrolling when menu is open
    document.body.style.overflow = expanded ? 'hidden' : '';
}

/**
 * Close mobile menu
 * @param {HTMLElement} menuToggle - The menu toggle button
 * @param {HTMLElement} mainNav - The main navigation element
 * @param {HTMLElement} overlay - The overlay element
 */
function closeMobileMenu(menuToggle, mainNav, overlay) {
    menuToggle.classList.remove('active');
    mainNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
}

/**
 * Update the active state of navigation links based on current page
 * Call this function if you want to highlight the current page in the nav
 */
function updateActiveNavLinks() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        // Remove any existing active class
        link.classList.remove('active');

        // Get the path from the href attribute
        const linkPath = new URL(link.href, window.location.origin).pathname;

        // Check if this link matches the current path
        if (currentPath === linkPath ||
            (currentPath === '/' && linkPath === '/index.php') ||
            (currentPath !== '/' && linkPath !== '/index.php' && currentPath.includes(linkPath))) {
            link.classList.add('active');
        }
    });
}

// Highlight the current page in the navigation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof updateActiveNavLinks === 'function') {
        updateActiveNavLinks();
    }
});
