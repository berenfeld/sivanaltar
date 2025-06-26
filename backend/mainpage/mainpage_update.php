<?php
// Load common backend functionality
require_once __DIR__ . '/../common.php';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed'
    ]);
    exit;
}

// Require admin access
requireAdmin();

// Get the content from POST data
$content = $_POST['content'] ?? '';

if (empty($content)) {
    echo json_encode([
        'success' => false,
        'message' => 'Content is required'
    ]);
    exit;
}

try {
    // Get database connection
    $db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
    $db_user = $GLOBALS['DB_USER'] ?: '';
    $db_pass = $GLOBALS['DB_PASS'] ?: '';
    $db_name = $GLOBALS['DB_NAME'] ?: '';

    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Insert new mainpage content
    $sql = "INSERT INTO mainpage (content) VALUES (:content)";
    $stmt = $conn->prepare($sql);
    $stmt->execute(['content' => $content]);

    echo json_encode([
        'success' => true,
        'message' => 'Mainpage content updated successfully',
        'id' => $conn->lastInsertId()
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>