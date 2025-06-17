<?php
session_start();
?>
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
</head>
<body class="gallery-page">

    <?php include 'nav.php'; ?>

    <!-- Blog Header Section -->
    <section class="gallery-header-section">
        <div class="container">
            <h1 class="section-title">גלריית תמונות</h1>
            <p class="section-subtitle">תמונות שצילמתי ואני אוהבת</p>
            <?php
            if (isset($_GET['message']) && $_GET['message'] === 'updated') {
                echo '<div class="alert alert-success">התמונה עודכנה בהצלחה</div>';
            }
            if (isset($_GET['error']) && $_GET['error'] === 'update_failed') {
                echo '<div class="alert alert-error">אירעה שגיאה בעדכון התמונה</div>';
            }
            ?>
        </div>
    </section>

    <!-- Gallery Section -->
    <section class="gallery-section">
        <div class="container">
            <div class="gallery-container">
                <div class="gallery-grid">
                    <?php if ($isAdmin): ?>
                    <div class="gallery-item add-new-item">
                        <button class="upload-button" onclick="openUploadModal()">
                            <i class="fas fa-plus"></i>
                            <span>הוסף תמונה חדשה</span>
                        </button>
                    </div>
                    <?php endif; ?>
                    <?php
                    // Include database configuration
                    require_once 'db_config.php';

                    try {
                        // Get database connection
                        $conn = getDbConnection();

                        // Get gallery items from database
                        $sql = "SELECT * FROM gallery ORDER BY display_order ASC";
                        $stmt = $conn->prepare($sql);
                        $stmt->execute();
                        $gallery_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        // Loop through each gallery item
                        foreach ($gallery_items as $item) {
                            ?>
                            <div class="gallery-item" data-id="<?php echo $item['id']; ?>" <?php echo $isAdmin ? 'draggable="true"' : ''; ?>>
                                <div class="gallery-image">
                                    <img src="<?php echo htmlspecialchars($item['image_path']); ?>"
                                         alt="<?php echo htmlspecialchars($item['title']); ?>"
                                         loading="lazy">
                                </div>
                                <div class="gallery-info">
                                    <h3><?php echo htmlspecialchars($item['title']); ?></h3>
                                    <p><?php echo htmlspecialchars($item['description']); ?></p>
                                </div>
                                <?php if ($isAdmin): ?>
                                <div class="gallery-admin-controls">
                                    <button class="edit-button" onclick="openEditModal(<?php echo htmlspecialchars(json_encode($item)); ?>)">
                                        <i class="fas fa-edit"></i> ערוך
                                    </button>
                                    <button class="delete-button" onclick="openDeleteModal(<?php echo htmlspecialchars(json_encode($item)); ?>)">
                                        <i class="fas fa-trash"></i> מחק
                                    </button>
                                </div>
                                <?php endif; ?>
                            </div>
                            <?php
                        }
                    } catch (PDOException $e) {
                        // Log error and show user-friendly message
                        error_log("Database error: " . $e->getMessage());
                        echo '<div class="error-message">מצטערים, אירעה שגיאה בטעינת הגלריה. אנא נסו שוב מאוחר יותר.</div>';
                    }
                    ?>
                </div>
            </div>
        </div>
    </section>

    <!-- Edit Modal -->
    <div id="editModal" class="edit-modal">
        <div class="edit-modal-content">
            <h2>עריכת תמונה</h2>
            <form id="editForm" method="POST" action="update_gallery.php">
                <input type="hidden" id="edit_id" name="id">
                <div>
                    <label for="edit_title">כותרת:</label>
                    <input type="text" id="edit_title" name="title" required>
                </div>
                <div>
                    <label for="edit_description">תיאור:</label>
                    <textarea id="edit_description" name="description" required></textarea>
                </div>
                <div class="edit-modal-buttons">
                    <button type="submit" class="save">שמור</button>
                    <button type="button" class="cancel" onclick="closeEditModal()">ביטול</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="delete-modal">
        <div class="delete-modal-content">
            <h2>מחיקת תמונה</h2>
            <p>האם אתה בטוח שברצונך למחוק את התמונה "<span id="delete-title"></span>"?</p>
            <p class="warning">פעולה זו אינה ניתנת לביטול!</p>
            <div class="delete-modal-buttons">
                <button class="confirm-delete" onclick="deleteImage()">מחק</button>
                <button class="cancel-delete" onclick="closeDeleteModal()">ביטול</button>
            </div>
        </div>
    </div>

    <!-- Upload Modal -->
    <div id="uploadModal" class="upload-modal">
        <div class="upload-modal-content">
            <h2>העלאת תמונה חדשה</h2>
            <form id="uploadForm" enctype="multipart/form-data" onsubmit="return false;">
                <div class="form-group">
                    <label for="image">בחר תמונה:</label>
                    <input type="file" id="image" name="image" accept="image/*" required>
                    <div id="imagePreview" class="image-preview"></div>
                </div>
                <div class="form-group">
                    <label for="title">כותרת:</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">תיאור:</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div class="form-buttons">
                    <button type="button" id="uploadSubmitButton" class="submit-button">העלה</button>
                    <button type="button" class="cancel-button" onclick="closeUploadModal()">ביטול</button>
                </div>
            </form>
        </div>
    </div>

    <?php include 'footer.php'; ?>

    <?php if ($isAdmin): ?>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <script src="gallery.js"></script>
    <?php endif; ?>
</body>
</html>