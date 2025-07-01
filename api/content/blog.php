<?php
// Load common backend functionality
require_once __DIR__ . '/../common.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables
require_once '../../env_loader.php';

// Get database configuration
$db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
$db_user = $GLOBALS['DB_USER'] ?: '';
$db_pass = $GLOBALS['DB_PASS'] ?: '';
$db_name = $GLOBALS['DB_NAME'] ?: '';

try {
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if requesting a specific blog post
    $blog_id = $_GET['id'] ?? null;

    if ($blog_id && is_numeric($blog_id)) {
        // Get single blog post
        $sql = "SELECT id, title, content, image_path, category, is_published, display_order, updated_at
                FROM blog
                WHERE id = :id";

        $stmt = $conn->prepare($sql);
        $stmt->execute(['id' => (int)$blog_id]);
        $blog_post = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$blog_post) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'הבלוג לא נמצא'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Encode content as base64
        $blog_post['content'] = encodeContent($blog_post['content']);

        // Format the response for single post
        $response = [
            'success' => true,
            'data' => $blog_post,
            'message' => 'הבלוג נטען בהצלחה'
        ];
    } else {
        // Get blog posts - all for admins, only published for regular users
        $sql = "SELECT id, title, content, image_path, category, is_published, display_order, updated_at
                FROM blog";

        // Add WHERE clause based on user admin status
        if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
            $sql .= " WHERE is_published = TRUE";
        }

        $sql .= " ORDER BY updated_at DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $blog_posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Encode content as base64 for each post
        foreach ($blog_posts as &$post) {
            // Encode the HTML content as base64 using the common function
            $post['content'] = encodeContent($post['content']);
        }

        // Format the response for multiple posts
        $response = [
            'success' => true,
            'data' => [
                'posts' => $blog_posts
            ],
            'message' => 'תוכן הבלוג נטען בהצלחה'
        ];
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Log error for debugging
    error_log("Blog API Error: " . $e->getMessage());
    error_log("Blog API Stack trace: " . $e->getTraceAsString());

    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'אירעה שגיאה במסד הנתונים',
        'error' => $GLOBALS['DEPLOYMENT'] !== 'Production' ? $e->getMessage() : null
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    // Log error for debugging
    error_log("Blog API Error: " . $e->getMessage());
    error_log("Blog API Stack trace: " . $e->getTraceAsString());

    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'אירעה שגיאה בטעינת תוכן הבלוג',
        'error' => $GLOBALS['DEPLOYMENT'] !== 'Production' ? $e->getMessage() : null
    ], JSON_UNESCAPED_UNICODE);
}
?>