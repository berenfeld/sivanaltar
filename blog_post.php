<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
    <title>פוסט בלוג</title>
    <link rel="stylesheet" href="css/blog_post.css">
</head>
<body>
    <?php include 'nav.php'; ?>

    <!-- Blog Post Content Section -->
    <section class="blog-post-section">
        <div class="container">
            <div id="blog-post-container">
                <!-- Loading state -->
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>טוען פוסט...</p>
                </div>

                <!-- Blog post template (hidden by default) -->
                <article class="blog-post" id="blog-post-template" style="display: none;">
                    <div class="blog-post-header">
                        <h1 class="blog-post-title" id="blog-post-title"></h1>
                        <div class="blog-post-meta">
                            <span class="blog-post-date" id="blog-post-date"></span>
                            <span class="blog-post-category" id="blog-post-category"></span>
                        </div>
                    </div>

                    <div class="blog-post-image" id="blog-post-image" style="display: none;">
                        <img id="blog-post-image-src" src="" alt="">
                    </div>

                    <div class="blog-post-content" id="blog-post-content"></div>

                    <?php if ($GLOBALS['isAdmin']): ?>
                    <div class="blog-post-admin-controls" id="blog-post-admin-controls" style="display: none;">
                        <button class="blog-edit-button hide-on-mobile" id="blog-edit-button">
                            <i class="fas fa-edit"></i> ערוך פוסט
                        </button>
                        <button class="blog-delete-button hide-on-mobile" id="blog-delete-button">
                            <i class="fas fa-trash"></i> מחק פוסט
                        </button>
                    </div>
                    <?php endif; ?>

                    <div class="blog-post-footer">
                        <a href="blog.php" class="back-to-blog-button">
                            <i class="fas fa-arrow-right"></i> חזרה לבלוג
                        </a>
                    </div>
                </article>

                <!-- Error state (hidden by default) -->
                <div class="error-container" id="error-container" style="display: none;">
                    <h2>שגיאה</h2>
                    <p id="error-message"></p>
                    <a href="blog.php" class="back-to-blog-button">
                        <i class="fas fa-arrow-right"></i> חזרה לבלוג
                    </a>
                </div>
            </div>
        </div>
    </section>

    <?php include 'footer.php'; ?>
    <script src="js/blog_post.js"></script>
    <script>
    // Update the page title after loading the blog post
    function setBlogPageTitle(title) {
        document.title = title + ' - פוסט בלוג';
    }
    </script>
</body>
</html>