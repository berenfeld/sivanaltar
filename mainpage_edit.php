<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
    <!-- TinyMCE - Self-hosted free version -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.2/tinymce.min.js" referrerpolicy="origin"></script>
    <!-- SweetAlert2 for notifications -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body class="mainpage_edit_body">

    <?php include 'nav.php'; ?>

    <div class="mainpage_edit_editor-container">
        <div class="mainpage_edit_editor-header">
            <h1>עורך דף ראשי - TinyMCE</h1>
        </div>

        <div class="mainpage_edit_editor-content">
            <h3>עורך TinyMCE:</h3>
            <div id="mainpage-editor" class="mainpage_edit_mainpage-editor">
                <!-- Content will be loaded here -->
            </div>
        </div>
    </div>

    <?php include 'footer.php'; ?>
    <script src="js/mainpage_edit.js"></script>
</body>
</html>