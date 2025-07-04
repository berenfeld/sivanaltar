<?php
// Include common backend functionality
require_once __DIR__ . '/../common.php';

// Include database configuration
require_once __DIR__ . '/../../db_config.php';

// Include logger
require_once __DIR__ . '/../logger/logger.php';

// Initialize logger
$logger = new Logger();

// Require admin access
requireAdmin();

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'No image ID provided']);
    exit;
}

require_once __DIR__ . '/../../db_config.php';

try {
    $conn = getDbConnection();

    // First get the image details for logging
    $stmt = $conn->prepare("SELECT * FROM gallery WHERE id = ?");
    $stmt->execute([$data['id']]);
    $image = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$image) {
        $logger->logGalleryAction([
            'action' => 'DELETE_FAILED',
            'user_id' => $_SESSION['user_id'] ?? 'unknown',
            'user_email' => $_SESSION['user_email'] ?? 'unknown',
            'user_name' => $_SESSION['user_name'] ?? 'unknown',
            'gallery_id' => $data['id'],
            'error' => 'Image not found'
        ]);

        echo json_encode(['success' => false, 'message' => 'Image not found']);
        exit;
    }

    // Delete from database
    $stmt = $conn->prepare("DELETE FROM gallery WHERE id = ?");
    $result = $stmt->execute([$data['id']]);

    if ($result) {
        // Delete the actual image file
        $image_path = $image['image_path'];
        $absolute_image_path = __DIR__ . '/../../' . $image_path;
        $fileDeleted = false;
        if (file_exists($absolute_image_path)) {
            $fileDeleted = unlink($absolute_image_path);
        } else {
            // Log that file was not found (might have been manually deleted)
            error_log("Image file not found for deletion: " . $absolute_image_path);
        }

        // Log successful deletion
        $logger->logGalleryAction([
            'action' => 'DELETE',
            'user_id' => $_SESSION['user_id'] ?? 'unknown',
            'user_email' => $_SESSION['user_email'] ?? 'unknown',
            'user_name' => $_SESSION['user_name'] ?? 'unknown',
            'gallery_id' => $data['id'],
            'title' => $image['title'],
            'description' => $image['description'],
            'image_path' => $image['image_path'],
            'display_order' => $image['display_order'],
            'file_deleted' => $fileDeleted
        ]);

        echo json_encode(['success' => true]);
    } else {
        throw new Exception("Failed to delete from database");
    }
} catch (PDOException $e) {
    // Log failed deletion
    $logger->logGalleryAction([
        'action' => 'DELETE_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'gallery_id' => $data['id'],
        'error' => 'Database error: ' . $e->getMessage()
    ]);

    error_log("Database error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error']);
} catch (Exception $e) {
    // Log failed deletion
    $logger->logGalleryAction([
        'action' => 'DELETE_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'gallery_id' => $data['id'],
        'error' => $e->getMessage()
    ]);

    error_log("Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error deleting image']);
}
?>