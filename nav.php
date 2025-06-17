<?php
session_start();
// Set PHP isAdmin variable
$isAdmin = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] && isset($_SESSION['is_admin']) && $_SESSION['is_admin'];
?>
<script>
    // Set JavaScript isAdmin variable
    const isAdmin = <?php echo $isAdmin ? 'true' : 'false'; ?>;
</script>
<header class="site-header">
    <div class="container">
        <div class="logo">
            <a href="index.php">
                <img src="images/logo.png" alt="סיון אלטרוביץ - לוגו">
            </a>
        </div>

        <button class="mobile-menu-toggle" aria-label="תפריט" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <nav class="main-nav">
            <div class="mobile-menu-header">תפריט</div>
            <ul>
                <li><a href="index.php">בית</a></li>
                <li><a href="blog.php">בלוג</a></li>
                <li><a href="gallery.php">גלריה</a></li>
                <li><a href="contact.php">צור קשר</a></li>
                <li class="auth-item">
                    <div id="auth-container">
                        <div id="login-button"></div>
                        <div id="user-info">
                            <img id="user-avatar" src="" alt="תמונת פרופיל">
                            <span id="user-name"></span>
                            <span id="admin-badge" class="admin-badge" style="display: none;">מנהל</span>
                            <button id="logout-button">יציאה</button>
                        </div>
                    </div>
                </li>
            </ul>

            <div class="mobile-contact-info">
                <p>טלפון: <a href="tel:054-5999671">054-5999671</a></p>
                <p>אימייל: <a href="mailto:sivanaltar@gmail.com">sivanaltar@gmail.com</a></p>
            </div>
        </nav>
    </div>
</header>