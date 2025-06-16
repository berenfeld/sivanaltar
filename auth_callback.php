<?php
// Add this at the top of your pages
header("Cross-Origin-Opener-Policy: same-origin-allow-popups");
?>

<?php
// auth_callback.php
// Start with necessary setup
error_reporting(0); // Disable error reporting in production
session_start();

// Load environment variables
require_once __DIR__ . '/env_loader.php';

// IMPORTANT: Set content type to JSON *before* any output
header('Content-Type: application/json');

// Include database configuration
require_once 'db_config.php';

// Check if credential was provided
if (!isset($_POST['credential'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No credential provided'
    ]);
    exit;
}

$id_token = $_POST['credential'];

try {
    // Decode the JWT token to get user information
    $token_parts = explode('.', $id_token);
    if (count($token_parts) !== 3) {
        throw new Exception('Invalid token format');
    }

    $payload = json_decode(base64_decode(str_replace(
        ['-', '_'],
        ['+', '/'],
        $token_parts[1]
    )), true);

    if (!$payload || !isset($payload['email'])) {
        throw new Exception('Invalid token or missing email');
    }

    // Extract user data from token
    $user_email = $payload['email'];
    $user_name = $payload['name'] ?? 'Unknown User';
    $user_picture = $payload['picture'] ?? '';

    // Get database connection
    $conn = getDbConnection();

    // Check if user exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$user_email]);
    $existing_user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing_user) {
        // Existing user: update last login time and use stored admin status
        $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$existing_user['id']]);

        // Use the admin status directly from database
        $user_id = $existing_user['id'];
        $is_admin = (bool)$existing_user['is_admin'];

        // Optional: Log the login for auditing
        error_log("User login: {$user_email}, Admin: " . ($is_admin ? "Yes" : "No"));
    } else {
        // New user: create with default non-admin status
        $stmt = $conn->prepare("
            INSERT INTO users (email, name, profile_picture, is_admin, last_login)
            VALUES (?, ?, ?, 0, NOW())
        ");
        $stmt->execute([
            $user_email,
            $user_name,
            $user_picture
        ]);

        $user_id = $conn->lastInsertId();
        $is_admin = false; // New users are not admins by default

        error_log("New user created: {$user_email}");
    }

    // Set session variables
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_email'] = $user_email;
    $_SESSION['user_name'] = $user_name;
    $_SESSION['user_picture'] = $user_picture;
    $_SESSION['is_admin'] = $is_admin;
    $_SESSION['logged_in'] = true;

    // Return success response as JSON
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user_id,
            'email' => $user_email,
            'name' => $user_name,
            'picture' => $user_picture,
            'is_admin' => $is_admin
        ]
    ]);

} catch (Exception $e) {
    // Return error as JSON
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>