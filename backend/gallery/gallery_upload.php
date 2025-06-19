<?php
session_start();
header('Content-Type: application/json');

// Include database configuration
require_once __DIR__ . '/../../db_config.php';

// Include logger
require_once __DIR__ . '/../logger/logger.php';

// Initialize logger
$logger = new Logger();

// Check if user is logged in and is admin
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    $logger->logFailedLogin($_SESSION['user_email'] ?? 'unknown', 'Unauthorized gallery upload attempt');
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $conn = getDbConnection();

        // Shift all existing items' display_order by 1 to make room for new item at position 1
        $stmt = $conn->prepare("UPDATE gallery SET display_order = display_order + 1");
        $stmt->execute();

        // Set the new item's display_order to 1 (first position after "add new" item)
        $nextOrder = 1;

        // Handle file upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $tempUploadDir = __DIR__ . '/../../uploads/gallery/';
            if (!file_exists($tempUploadDir)) {
                mkdir($tempUploadDir, 0777, true);
            }

            $fileExtension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($fileExtension, $allowedExtensions)) {
                throw new Exception('Invalid file type. Only JPG, JPEG, PNG and GIF files are allowed.');
            }

            // Get original filename without extension
            $originalName = pathinfo($_FILES['image']['name'], PATHINFO_FILENAME);

            // First, upload to temporary location
            $tempFileName = uniqid() . '.' . $fileExtension;
            $tempUploadFile = $tempUploadDir . $tempFileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $tempUploadFile)) {
                // Now move to images/ folder with proper naming
                $imagesDir = __DIR__ . '/../../images/';
                if (!file_exists($imagesDir)) {
                    mkdir($imagesDir, 0777, true);
                }

                // Generate unique filename for images/ folder
                $finalFileName = $originalName . '.' . $fileExtension;
                $counter = 1;
                $finalPath = $imagesDir . $finalFileName;

                // Check for duplicates and add _1, _2, etc.
                while (file_exists($finalPath)) {
                    $finalFileName = $originalName . '_' . $counter . '.' . $fileExtension;
                    $finalPath = $imagesDir . $finalFileName;
                    $counter++;
                }

                // Move file from temp location to images/ folder
                if (rename($tempUploadFile, $finalPath)) {
                    $imagePath = 'images/' . $finalFileName; // This is the path stored in database

                    // Insert into database
                    $stmt = $conn->prepare("INSERT INTO gallery (title, description, image_path, display_order) VALUES (:title, :description, :image_path, :display_order)");

                    $stmt->execute([
                        ':title' => $_POST['title'],
                        ':description' => $_POST['description'],
                        ':image_path' => $imagePath,
                        ':display_order' => $nextOrder
                    ]);

                    $newId = $conn->lastInsertId();

                    // Log successful upload
                    $logger->logGalleryAction([
                        'action' => 'UPLOAD',
                        'user_id' => $_SESSION['user_id'] ?? 'unknown',
                        'user_email' => $_SESSION['user_email'] ?? 'unknown',
                        'user_name' => $_SESSION['user_name'] ?? 'unknown',
                        'gallery_id' => $newId,
                        'title' => $_POST['title'],
                        'description' => $_POST['description'],
                        'file_name' => $_FILES['image']['name'],
                        'final_file_name' => $finalFileName,
                        'file_size' => $_FILES['image']['size'],
                        'file_type' => $_FILES['image']['type'],
                        'uploaded_file' => $imagePath,
                        'display_order' => $nextOrder
                    ]);

                    // Return success response with the new item data
                    echo json_encode([
                        'success' => true,
                        'item' => [
                            'id' => $newId,
                            'title' => $_POST['title'],
                            'description' => $_POST['description'],
                            'image_path' => $imagePath,
                            'display_order' => $nextOrder
                        ]
                    ]);
                    exit;
                } else {
                    // Clean up temp file if move failed
                    unlink($tempUploadFile);
                    throw new Exception('Failed to move file to images directory.');
                }
            }

            throw new Exception('Failed to move uploaded file.');
        } else {
            throw new Exception('No file uploaded or upload error occurred.');
        }
    } catch (Exception $e) {
        // Log failed upload
        $logger->logGalleryAction([
            'action' => 'UPLOAD_FAILED',
            'user_id' => $_SESSION['user_id'] ?? 'unknown',
            'user_email' => $_SESSION['user_email'] ?? 'unknown',
            'user_name' => $_SESSION['user_name'] ?? 'unknown',
            'error' => $e->getMessage(),
            'file_name' => $_FILES['image']['name'] ?? 'none',
            'file_size' => $_FILES['image']['size'] ?? 0,
            'file_type' => $_FILES['image']['type'] ?? 'none'
        ]);

        error_log("Error uploading gallery image: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}
?>