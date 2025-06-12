/**
 * Global scripts for all pages - navigation, common UI elements
 */
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    initializeMobileMenu();

    // Add active class to current navigation item
    highlightCurrentNavItem();

    // Other global functions as needed...
});

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    // Check if elements exist
    if (!menuToggle || !mainNav) return;

    // Create menu overlay if it doesn't exist
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    // Toggle menu on button click
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        overlay.classList.toggle('active');

        // Prevent scrolling when menu is open
        if (mainNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close menu when clicking links (for mobile)
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) { // Only on mobile
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

// Highlight current navigation item based on URL
function highlightCurrentNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Check if current page matches link
        if (currentPath.endsWith(linkPath)) {
            link.classList.add('active');
        }
        // Special case for home page
        else if ((currentPath === '/' || currentPath.endsWith('/index.php')) &&
                 (linkPath === 'index.php' || linkPath === '/')) {
            link.classList.add('active');
        }
    });
}