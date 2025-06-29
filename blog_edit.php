<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
    <!-- TinyMCE - Self-hosted free version -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.2/tinymce.min.js" referrerpolicy="origin"></script>
</head>
<body class="blog_edit_body">

    <?php include 'nav.php'; ?>

    <div class="blog_edit_editor-container">
        <h1 id="blog-edit-title">עריכת פוסט בלוג</h1>

        <div class="blog_edit_editor-content">
            <form id="blog-edit-form" enctype="multipart/form-data">
                <input type="hidden" id="blog-id" name="id" value="">

                <div class="form-group">
                    <label for="blog-title">כותרת הפוסט:</label>
                    <input type="text" id="blog-title" name="title" required>
                </div>

                <div class="form-group">
                    <label for="blog-category">קטגוריה:</label>
                    <select id="blog-category" name="category" required>
                        <option value="הגיגים">הגיגים</option>
                        <option value="תובנות">תובנות</option>
                        <option value="שיטת סאטיה">שיטת סאטיה</option>
                        <option value="צמיחה אישית">צמיחה אישית</option>
                        <option value="אימון רגשי">אימון רגשי</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="blog-image">תמונה:</label>
                    <input type="file" id="blog-image" name="image" accept="image/*">
                    <div id="current-image-container" style="display: none;">
                        <p>תמונה נוכחית:</p>
                        <img id="current-image" src="" alt="תמונה נוכחית" style="max-width: 200px; max-height: 150px;">
                    </div>
                </div>

                <div class="form-group">
                    <label for="blog-published">
                        <input type="checkbox" id="blog-published" name="is_published" checked>
                        מאושר לפרסום
                    </label>
                </div>

                <div class="form-group">
                    <label for="blog-content">תוכן הפוסט:</label>
                    <div id="blog-editor" class="blog_edit_blog-editor">
                        <!-- Content will be loaded here -->
                    </div>
                    <div class="editor-info">
                        <span id="char-count">0 תווים</span>
                        <span id="word-count">0 מילים</span>
                    </div>
                    <div id="editor-loading" class="editor-loading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <span>טוען עורך...</span>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="save-button">שמור פוסט</button>
                    <button type="button" class="cancel-button" onclick="handleCancel()">ביטול</button>
                </div>
            </form>
        </div>
    </div>

    <?php include 'footer.php'; ?>
    <script src="js/blog_edit.js"></script>
</body>
</html>