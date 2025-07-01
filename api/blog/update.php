<?php
// Load common backend functionality
require_once __DIR__ . '/../common.php';

// Include logger
require_once __DIR__ . '/../logger/logger.php';

// Include database configuration
require_once __DIR__ . '/../../db_config.php';

// Initialize logger
$logger = new Logger();

// Require admin access
requireAdmin();

// Validate that required functions are available
if (!function_exists('getDbConnection')) {
    $logger->logBlogAction([
        'action' => 'FUNCTION_MISSING',
        'error' => 'getDbConnection function not found',
        'user_id' => $_SESSION['user_id'] ?? 'unknown'
    ]);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server configuration error'
    ]);
    exit();
}

if (!function_exists('decodeContent')) {
    $logger->logBlogAction([
        'action' => 'FUNCTION_MISSING',
        'error' => 'decodeContent function not found',
        'user_id' => $_SESSION['user_id'] ?? 'unknown'
    ]);

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server configuration error'
    ]);
    exit();
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    // Log the failed JSON parsing
    $logger->logBlogAction([
        'action' => 'JSON_PARSE_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'raw_input' => file_get_contents('php://input'),
        'json_error' => json_last_error_msg()
    ]);

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON input'
    ]);
    exit();
}

// Log the incoming request for debugging
$logger->logBlogAction([
    'action' => 'REQUEST_RECEIVED',
    'user_id' => $_SESSION['user_id'] ?? 'unknown',
    'user_email' => $_SESSION['user_email'] ?? 'unknown',
    'user_name' => $_SESSION['user_name'] ?? 'unknown',
    'blog_id' => $input['id'] ?? null,
    'title' => $input['title'] ?? null,
    'category' => $input['category'] ?? null,
    'is_published' => $input['is_published'] ?? null,
    'has_image' => isset($input['image']) ? 'yes' : 'no',
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
]);

// Extract data from input
$blog_id = $input['id'] ?? null;
$title = trim($input['title'] ?? '');
$content = trim($input['content'] ?? '');
$category = $input['category'] ?? 'הגיגים';
$is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
$image_data = $input['image'] ?? null; // Base64 encoded image data
$updated_at = $input['updated_at'] ?? null; // Custom updated_at timestamp

// Decode content from base64
try {
    $content = decodeContent($content);
} catch (Exception $e) {
    // Log the decoding error
    $logger->logBlogAction([
        'action' => 'DECODE_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'blog_id' => $blog_id ?? 'unknown',
        'title' => $title,
        'category' => $category,
        'error' => $e->getMessage(),
        'error_type' => 'DecodeException',
        'request_data' => $input
    ]);

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid content format'
    ]);
    exit();
}

// Validate required fields
if (empty($title)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Title is required'
    ]);
    exit();
}

if (empty($content)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Content is required'
    ]);
    exit();
}

try {
    // Get database connection
    $conn = getDbConnection();

    $is_new_blog = empty($blog_id);

    if ($is_new_blog) {
        // Create new blog post - always use the provided updated_at
        $insert_sql = "INSERT INTO blog (title, content, category, is_published, image_path, created_at, updated_at)
                       VALUES (:title, :content, :category, :is_published, :image_path, CURRENT_TIMESTAMP, :updated_at)";

        $stmt = $conn->prepare($insert_sql);
        $stmt->execute([
            'title' => $title,
            'content' => $content,
            'category' => $category,
            'is_published' => $is_published ? 1 : 0,
            'image_path' => null, // Will be updated if image is provided
            'updated_at' => $updated_at
        ]);

        $blog_id = $conn->lastInsertId();
        $action = 'created';

        // Log successful blog creation
        $logger->logBlogAction([
            'action' => 'CREATE',
            'user_id' => $_SESSION['user_id'] ?? 'unknown',
            'user_email' => $_SESSION['user_email'] ?? 'unknown',
            'user_name' => $_SESSION['user_name'] ?? 'unknown',
            'blog_id' => $blog_id,
            'title' => $title,
            'category' => $category,
            'is_published' => $is_published,
            'content' => $content
        ]);

    } else {
        // Update existing blog post
        $blog_id = (int)$blog_id;

        // Check if blog post exists and get current data for logging
        $check_sql = "SELECT id, title, content, category, is_published, image_path FROM blog WHERE id = :id";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->execute(['id' => $blog_id]);
        $existing_blog = $check_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing_blog) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Blog post not found'
            ]);
            exit();
        }

        // Update existing blog post - always use the provided updated_at
        $update_sql = "UPDATE blog SET
                       title = :title,
                       content = :content,
                       category = :category,
                       is_published = :is_published,
                       updated_at = :updated_at
                       WHERE id = :id";

        $stmt = $conn->prepare($update_sql);
        $stmt->execute([
            'title' => $title,
            'content' => $content,
            'category' => $category,
            'is_published' => $is_published ? 1 : 0,
            'updated_at' => $updated_at,
            'id' => $blog_id
        ]);

        $action = 'updated';

        // Log successful blog update
        $logger->logBlogAction([
            'action' => 'UPDATE',
            'user_id' => $_SESSION['user_id'] ?? 'unknown',
            'user_email' => $_SESSION['user_email'] ?? 'unknown',
            'user_name' => $_SESSION['user_name'] ?? 'unknown',
            'blog_id' => $blog_id,
            'old_title' => $existing_blog['title'],
            'new_title' => $title,
            'old_category' => $existing_blog['category'],
            'new_category' => $category,
            'old_published' => (bool)$existing_blog['is_published'],
            'new_published' => $is_published,
            'content' => $content
        ]);
    }

    // Handle image upload if provided
    $image_path = null;
    if ($image_data) {
        // Handle base64 image data from frontend
        if (strpos($image_data, 'data:image/') === 0) {
            // Extract image data from data URL
        $image_parts = explode(',', $image_data);
        if (count($image_parts) === 2) {
            $image_base64 = $image_parts[1];
                $image_header = $image_parts[0];

                // Extract MIME type from header
                if (preg_match('/data:image\/([^;]+)/', $image_header, $matches)) {
                    $mime_type = 'image/' . $matches[1];
                $extension = '';

                // Determine file extension from MIME type
                switch ($mime_type) {
                    case 'image/jpeg':
                        $extension = 'jpg';
                        break;
                    case 'image/png':
                        $extension = 'png';
                        break;
                    case 'image/gif':
                        $extension = 'gif';
                        break;
                    case 'image/webp':
                        $extension = 'webp';
                        break;
                    default:
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Invalid image type. Only JPG, PNG, GIF, and WebP are allowed.'
                        ]);
                        exit();
                }

                // Create images/blog directory if it doesn't exist
                $imagesDir = __DIR__ . '/../../images/blog/';
                if (!is_dir($imagesDir)) {
                    mkdir($imagesDir, 0777, true);
                }

                // Generate unique filename
                $filename = uniqid() . '.' . $extension;
                $filepath = $imagesDir . $filename;

                // Save the image
                if (file_put_contents($filepath, base64_decode($image_base64))) {
                    $image_path = 'images/blog/' . $filename;

                    // Update database with image path
                    $image_update_sql = "UPDATE blog SET image_path = :image_path WHERE id = :id";
                    $image_stmt = $conn->prepare($image_update_sql);
                    $image_stmt->execute([
                        'image_path' => $image_path,
                        'id' => $blog_id
                    ]);
                    }
                }
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "Blog post $action successfully",
        'data' => [
            'id' => $blog_id,
            'title' => $title,
            'category' => $category,
            'is_published' => $is_published,
            'image_path' => $image_path,
            'action' => $action
        ]
    ]);

} catch (PDOException $e) {
    // Log failed operation
    $logger->logBlogAction([
        'action' => $is_new_blog ? 'CREATE_FAILED' : 'UPDATE_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'blog_id' => $blog_id ?? 'unknown',
        'title' => $title,
        'category' => $category,
        'error' => $e->getMessage(),
        'error_type' => 'PDOException',
        'request_data' => $input
    ]);

    // Log error for debugging
    error_log("Blog update API Error: " . $e->getMessage());
    error_log("Blog update API Stack trace: " . $e->getTraceAsString());

    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $GLOBALS['DEPLOYMENT'] !== 'Production' ? $e->getMessage() : null
    ]);
} catch (Exception $e) {
    // Log failed operation
    $logger->logBlogAction([
        'action' => $is_new_blog ? 'CREATE_FAILED' : 'UPDATE_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'blog_id' => $blog_id ?? 'unknown',
        'title' => $title,
        'category' => $category,
        'error' => $e->getMessage(),
        'error_type' => 'Exception',
        'request_data' => $input
    ]);

    // Log error for debugging
    error_log("Blog update API Error: " . $e->getMessage());
    error_log("Blog update API Stack trace: " . $e->getTraceAsString());

    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing the blog post',
        'error' => $GLOBALS['DEPLOYMENT'] !== 'Production' ? $e->getMessage() : null
    ]);
}
?>