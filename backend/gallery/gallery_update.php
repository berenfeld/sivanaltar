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

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['id', 'title', 'description'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

// Include database configuration
require_once __DIR__ . '/../../db_config.php';

try {
    // Get database connection
    $conn = getDbConnection();

    // Get the original item data for logging
    $stmt = $conn->prepare("SELECT * FROM gallery WHERE id = ?");
    $stmt->execute([$data['id']]);
    $originalItem = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$originalItem) {
        throw new Exception("Gallery item not found");
    }

    // Prepare update statement
    $sql = "UPDATE gallery SET
            title = :title,
            description = :description
            WHERE id = :id";

    $stmt = $conn->prepare($sql);

    // Execute with parameters
    $result = $stmt->execute([
        'id' => $data['id'],
        'title' => $data['title'],
        'description' => $data['description']
    ]);

    if ($result) {
        // Log successful update
        $logger->logGalleryAction([
            'action' => 'UPDATE',
            'user_id' => $_SESSION['user_id'] ?? 'unknown',
            'user_email' => $_SESSION['user_email'] ?? 'unknown',
            'user_name' => $_SESSION['user_name'] ?? 'unknown',
            'gallery_id' => $data['id'],
            'old_title' => $originalItem['title'],
            'new_title' => $data['title'],
            'old_description' => $originalItem['description'],
            'new_description' => $data['description'],
            'image_path' => $originalItem['image_path']
        ]);

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Gallery item updated successfully'
        ]);
    } else {
        throw new Exception("Failed to update gallery item");
    }

} catch (Exception $e) {
    // Log failed update
    $logger->logGalleryAction([
        'action' => 'UPDATE_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'gallery_id' => $data['id'] ?? 'unknown',
        'error' => $e->getMessage(),
        'title' => $data['title'] ?? 'unknown',
        'description' => $data['description'] ?? 'unknown'
    ]);

    // Log error
    error_log("Error updating gallery item: " . $e->getMessage());

    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update gallery item: ' . $e->getMessage()
    ]);
}
?>