<?php
// logout.php - Handle user logout
// Start session if not already started
session_start();

// Set content type for JSON response
header('Content-Type: application/json');

// For debugging
error_log('Logout requested. Session before: ' . print_r($_SESSION, true));

try {
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

    // 4. Output success response
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful',
        'time' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    // Log error and return failure response
    error_log('Logout error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Logout failed: ' . $e->getMessage()
    ]);
}
?>