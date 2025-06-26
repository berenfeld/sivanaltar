<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
</head>
<body>
    <?php include 'nav.php'; ?>

    <div class="mainpage_main_div">
        <!-- Content will be loaded dynamically via JavaScript -->
    </div>

    <!-- Admin edit link - will be shown/hidden by JavaScript -->
    <div id="admin-edit-link" style="display: none; text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <a href="mainpage_edit.php" style="display: inline-block; padding: 12px 24px; background-color: #347494; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s;">
            <i class="fas fa-edit" style="margin-left: 8px;"></i>
            ערוך דף ראשי
        </a>
    </div>

    <?php include 'footer.php'; ?>

    <!-- Load mainpage content -->
    <script src="js/mainpage.js"></script>
</body>
</html>