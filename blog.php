<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
    <title>בלוג - הבלוג שלי</title>
    <link rel="stylesheet" href="css/blog.css">
</head>
<body>
    <?php include 'nav.php'; ?>

    <!-- Blog Header Section -->
    <section class="blog-header-section">
        <div class="container">
            <h1 class="section-title">הבלוג שלי</h1>
            <h2 class="section-subtitle">שיתוף במחשבות והגיגים שלי</h2>
        </div>
    </section>

    <!-- Blog Content Section -->
    <section class="blog-content-section">
        <div class="container">
            <div class="blog-grid">
                <?php if ($GLOBALS['isAdmin']): ?>
                <article class="blog-card add-new-blog-card hide-on-mobile" onclick="createNewBlog()">
                    <div class="blog-card-image add-new-image">
                        <div class="add-new-content">
                            <i class="fas fa-plus-circle"></i>
                            <h3>הוסף פוסט חדש</h3>
                            <p>צור פוסט חדש לבלוג</p>
                        </div>
                    </div>
                </article>
                <?php endif; ?>

                <!-- Container for dynamically loaded blog posts -->
                <div id="blog-posts-container">
                    <!-- Blog posts will be loaded dynamically via JavaScript -->
                </div>

                <!-- Blog post template (hidden by default) -->
                <article class="blog-card" id="blog-post-template" style="display: none;">
                    <div class="blog-card-image">
                        <img id="blog-post-image" src="" alt="">
                    </div>
                    <div class="blog-card-content">
                        <h3 class="blog-card-title" id="blog-post-title"></h3>
                        <div class="blog-card-date" id="blog-post-date"></div>
                        <div class="blog-card-excerpt" id="blog-post-excerpt"></div>
                        <div class="blog-card-tag" id="blog-post-category"></div>
                        <div class="blog-post-status" id="blog-post-status" style="display: none;">
                            <span class="unpublished-label">לא מאושר לפרסום</span>
                        </div>
                        <div class="blog-admin-controls" id="blog-admin-controls" style="display: none;">
                            <button class="blog-edit-button hide-on-mobile" id="blog-edit-button">
                                <i class="fas fa-edit"></i> ערוך
                            </button>
                            <button class="blog-delete-button hide-on-mobile" id="blog-delete-button">
                                <i class="fas fa-trash"></i> מחק
                            </button>
                        </div>
                    </div>
                </article>
            </div>

            <!-- Blog Categories -->
            <aside class="blog-sidebar">
                <div class="blog-categories">
                    <h3>קטגוריות</h3>
                    <ul>
                        <li><a href="#" class="active" data-category="all">הכל</a></li>
                        <li><a href="#" data-category="הגיגים">הגיגים</a></li>
                        <li><a href="#" data-category="תובנות">תובנות</a></li>
                        <li><a href="#" data-category="שיטת סאטיה">שיטת סאטיה</a></li>
                        <li><a href="#" data-category="צמיחה אישית">צמיחה אישית</a></li>
                        <li><a href="#" data-category="אימון רגשי">אימון רגשי</a></li>
                    </ul>
                </div>
            </aside>
        </div>
    </section>

    <?php include 'footer.php'; ?>
    <script src="js/blog.js"></script>
</body>
</html>