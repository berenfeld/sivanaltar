<?php
// Load common backend functionality
require_once __DIR__ . '/../common.php';

// Check if request is coming from mainpage_edit.php (requires admin access)
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$isFromEditor = strpos($referer, 'mainpage_edit.php') !== false;

if ($isFromEditor) {
    // Require admin access for editor requests
    requireAdmin();
}

try {
    // Get database connection
    $db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
    $db_user = $GLOBALS['DB_USER'] ?: '';
    $db_pass = $GLOBALS['DB_PASS'] ?: '';
    $db_name = $GLOBALS['DB_NAME'] ?: '';

    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the latest mainpage content
    $sql = "SELECT content, updated_at FROM mainpage ORDER BY id DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        // Ensure content is properly UTF-8 encoded before base64 encoding
        $content = $result['content'];
        if (!mb_check_encoding($content, 'UTF-8')) {
            $content = mb_convert_encoding($content, 'UTF-8', 'auto');
        }

        // Encode the HTML content as base64 to avoid UTF-8 encoding issues
        $encodedContent = base64_encode($content);

        echo json_encode([
            'success' => true,
            'content' => $encodedContent,
            'updated_at' => $result['updated_at']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No mainpage content found'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>