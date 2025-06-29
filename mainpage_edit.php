<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
    <!-- TinyMCE - Self-hosted free version -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.2/tinymce.min.js" referrerpolicy="origin"></script>
</head>
<body class="mainpage_edit_body">

    <?php include 'nav.php'; ?>

    <div class="mainpage_edit_editor-container">
        <h1>עריכת דף ראשי</h1>

        <div class="mainpage_edit_editor-content">
            <div id="mainpage-editor" class="mainpage_edit_mainpage-editor">
                <!-- Content will be loaded here -->
            </div>
        </div>
    </div>

    <?php include 'footer.php'; ?>
    <script src="js/mainpage_edit.js"></script>
</body>
</html>