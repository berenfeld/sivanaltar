<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'No image ID provided']);
    exit;
}

require_once 'db_config.php';

try {
    $conn = getDbConnection();

    // First get the image path
    $stmt = $conn->prepare("SELECT image_path FROM gallery WHERE id = ?");
    $stmt->execute([$data['id']]);
    $image = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$image) {
        echo json_encode(['success' => false, 'message' => 'Image not found']);
        exit;
    }

    // Delete from database
    $stmt = $conn->prepare("DELETE FROM gallery WHERE id = ?");
    $stmt->execute([$data['id']]);

    // Delete the actual image file
    $image_path = $image['image_path'];
    if (file_exists($image_path)) {
        unlink($image_path);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error']);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error deleting image']);
}
?>