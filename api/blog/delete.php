<?php
// Load common backend functionality
require_once __DIR__ . '/../common.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Require admin access
requireAdmin();

// Load environment variables
require_once '../../env_loader.php';

// Get database configuration
$db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
$db_user = $GLOBALS['DB_USER'] ?: '';
$db_pass = $GLOBALS['DB_PASS'] ?: '';
$db_name = $GLOBALS['DB_NAME'] ?: '';

try {
    // Create database connection
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id']) || !is_numeric($input['id'])) {
        throw new Exception('Invalid blog post ID');
    }

    $blogId = (int)$input['id'];

    // Get blog post info for image deletion and logging
    $stmt = $pdo->prepare("SELECT id, title, category, content, image_path FROM blog WHERE id = ?");
    $stmt->execute([$blogId]);
    $blogPost = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$blogPost) {
        throw new Exception('Blog post not found');
    }

    // Delete the blog post
    $stmt = $pdo->prepare("DELETE FROM blog WHERE id = ?");
    $result = $stmt->execute([$blogId]);

    if (!$result) {
        // Log failed delete
        $logger = new Logger();
        $logger->logBlogAction([
            'action' => 'DELETE_FAILED',
            'user_name' => $_SESSION['user_name'] ?? 'Unknown',
            'user_id' => $_SESSION['user_id'] ?? 'unknown',
            'user_email' => $_SESSION['user_email'] ?? 'unknown',
            'blog_id' => $blogId,
            'title' => $blogPost['title'] ?? '',
            'category' => $blogPost['category'] ?? '',
            'content' => $blogPost['content'] ?? '',
            'error' => 'Failed to delete blog post'
        ]);
        throw new Exception('Failed to delete blog post');
    }

    // Delete associated image file if it exists
    if ($blogPost['image_path'] && file_exists($blogPost['image_path'])) {
        unlink($blogPost['image_path']);
    }

    // Log successful delete
    $logger = new Logger();
    $logger->logBlogAction([
        'action' => 'DELETE',
        'user_name' => $_SESSION['user_name'] ?? 'Unknown',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'blog_id' => $blogId,
        'title' => $blogPost['title'] ?? '',
        'category' => $blogPost['category'] ?? '',
        'content' => $blogPost['content'] ?? ''
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Blog post deleted successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>