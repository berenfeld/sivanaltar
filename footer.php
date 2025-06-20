<!-- Footer -->
<footer class="site-footer">
    <div class="container">
        <div class="contact-info">
            <p class="phone-link">
                <i class="fas fa-phone-alt"></i>&nbsp;&nbsp;טלפון:&nbsp;&nbsp;
                <a href="tel:+972545999671">054-5999671</a>
            </p>
            <p class="email-link">
                <i class="fas fa-envelope"></i>&nbsp;&nbsp;אימייל:&nbsp;&nbsp;
                <a href="mailto:sivanaltar@gmail.com">sivanaltar@gmail.com</a>
            </p>
        </div>
        <div class="social-links">
            <a href="https://www.facebook.com/sivan.hackam" target="_blank" aria-label="Facebook">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/sivanhackam/" target="_blank" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/sivan-hackam-altarovici-561737/" target="_blank" aria-label="LinkedIn">
                <i class="fab fa-linkedin-in"></i>
            </a>
        </div>
        <div class="copyright">
            <p>© 2025 סיון אלטרוביץ - כל הזכויות שמורות</p>
        </div>
    </div>
</footer>

<!-- Global Scripts - Always load this -->
<script src="js/scripts.js"></script>
<!-- Include the authentication script first -->
<script src="js/google_login.js"></script>

<?php
// Page-specific scripts
$current_page = basename($_SERVER['PHP_SELF']);

// Add page-specific scripts
if ($current_page == 'blog.php') {
    echo '<script src="js/blog.js"></script>';
} else if ($current_page == 'gallery.php') {
    echo '<script src="js/gallery.js"></script>';
}
// Add more conditions for other pages as needed
?>
