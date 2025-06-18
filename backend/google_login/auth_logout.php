<?php
// logout.php - Handle user logout
// Start session if not already started
session_start();

// Set content type for JSON response
header('Content-Type: application/json');

// Include logger
require_once __DIR__ . '/../logger/logger.php';

// Initialize logger
$logger = new Logger();

// For debugging
error_log('Logout requested. Session before: ' . print_r($_SESSION, true));

try {
    // Get user data before clearing session
    $userData = null;
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
        $userData = [
            'id' => $_SESSION['user_id'] ?? 'unknown',
            'email' => $_SESSION['user_email'] ?? 'unknown',
            'name' => $_SESSION['user_name'] ?? 'unknown',
            'is_admin' => $_SESSION['is_admin'] ?? false
        ];
    }

    // 1. Clear all of the session variables
    $_SESSION = array();

    // 2. Delete the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
        error_log('Session cookie deletion attempted');
    }

    // 3. Destroy the session
    $destroy_result = session_destroy();
    error_log('Session destroy result: ' . ($destroy_result ? 'success' : 'failed'));

    // 4. Log the logout
    if ($userData) {
        $logger->logLogout($userData);
    } else {
        $logger->logLogout();
    }

    // 5. Output success response
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful',
        'time' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    // Log error and return failure response
    $logger->logFailedLogout($e->getMessage());
    error_log('Logout error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Logout failed: ' . $e->getMessage()
    ]);
}
?>