<?php
session_start();

// Check if user is admin
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    header('HTTP/1.0 403 Forbidden');
    echo "Access Denied";
    exit;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.0 405 Method Not Allowed');
    echo "Method Not Allowed";
    exit;
}

// Validate required fields
$required_fields = ['id', 'title', 'description'];
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        header('HTTP/1.0 400 Bad Request');
        echo "Missing required field: $field";
        exit;
    }
}

// Include database configuration
require_once 'db_config.php';

try {
    // Get database connection
    $conn = getDbConnection();

    // Prepare update statement
    $sql = "UPDATE gallery SET
            title = :title,
            description = :description
            WHERE id = :id";

    $stmt = $conn->prepare($sql);

    // Execute with parameters
    $result = $stmt->execute([
        'id' => $_POST['id'],
        'title' => $_POST['title'],
        'description' => $_POST['description']
    ]);

    if ($result) {
        // Redirect back to gallery with success message
        header('Location: gallery.php?message=updated');
    } else {
        throw new Exception("Failed to update gallery item");
    }

} catch (Exception $e) {
    // Log error
    error_log("Error updating gallery item: " . $e->getMessage());

    // Redirect back with error message
    header('Location: gallery.php?error=update_failed');
}
exit;