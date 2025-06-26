<?php
// Include common backend functionality
require_once __DIR__ . '/../common.php';

// Include database configuration
require_once __DIR__ . '/../../db_config.php';

// Include logger
require_once __DIR__ . '/../logger/logger.php';

// Initialize logger
$logger = new Logger();

// Check if credential was provided
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['credential'])) {
    $logger->logFailedLogin('unknown', 'No credential provided');
    echo json_encode([
        'success' => false,
        'message' => 'No credential provided'
    ]);
    exit;
}

$id_token = $input['credential'];

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

        // Log the login
        $logger->logLogin([
            'id' => $user_id,
            'email' => $user_email,
            'name' => $user_name,
            'is_admin' => $is_admin
        ]);
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

        // Log the new user login
        $logger->logLogin([
            'id' => $user_id,
            'email' => $user_email,
            'name' => $user_name,
            'is_admin' => $is_admin
        ]);
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
    // Log failed login
    $logger->logFailedLogin($user_email ?? 'unknown', $e->getMessage());

    // Return error as JSON
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>