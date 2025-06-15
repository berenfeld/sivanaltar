<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $conn = getDbConnection();

        // Get the highest display_order
        $stmt = $conn->query("SELECT MAX(display_order) as max_order FROM gallery");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextOrder = ($result['max_order'] ?? 0) + 1;

        // Handle file upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/gallery/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileExtension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($fileExtension, $allowedExtensions)) {
                throw new Exception('Invalid file type. Only JPG, JPEG, PNG and GIF files are allowed.');
            }

            $fileName = uniqid() . '.' . $fileExtension;
            $uploadFile = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                // Insert into database
                $stmt = $conn->prepare("INSERT INTO gallery (title, description, image_path, display_order) VALUES (:title, :description, :image_path, :display_order)");

                $stmt->execute([
                    ':title' => $_POST['title'],
                    ':description' => $_POST['description'],
                    ':image_path' => $uploadFile,
                    ':display_order' => $nextOrder
                ]);

                $newId = $conn->lastInsertId();

                // Return success response with the new item data
                echo json_encode([
                    'success' => true,
                    'item' => [
                        'id' => $newId,
                        'title' => $_POST['title'],
                        'description' => $_POST['description'],
                        'image_path' => $uploadFile,
                        'display_order' => $nextOrder
                    ]
                ]);
                exit;
            }

            throw new Exception('Failed to move uploaded file.');
        } else {
            throw new Exception('No file uploaded or upload error occurred.');
        }
    } catch (Exception $e) {
        error_log("Error uploading gallery image: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}
?>