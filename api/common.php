<?php
// Backend common functionality
// This file should be included at the top of all backend pages

// Set content type for JSON responses
header('Content-Type: application/json; charset=utf-8');

// Add security headers to indicate this is a legitimate API
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// disable caching at all for backend calls
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// Enable CORS for AJAX requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Load environment variables
require_once __DIR__ . '/../env_loader.php';

// Load Logger class
require_once __DIR__ . '/logger/logger.php';

// Set error reporting for development
if (defined('DEPLOYMENT') && DEPLOYMENT === 'Development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set global isAdmin variable
$GLOBALS['isAdmin'] = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] && isset($_SESSION['is_admin']) && $_SESSION['is_admin'];

/**
 * Require admin access - redirects to error if not admin
 * @return void
 */
function requireAdmin() {
    // Initialize logger
    $logger = new Logger();

    // Get user information from session
    $userData = [
        'user_name' => $_SESSION['user_name'] ?? 'Unknown',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
    ];

    // Debug: Log the admin status for troubleshooting
    $debug_info = array_merge($userData, [
        'session_logged_in' => isset($_SESSION['logged_in']) ? ($_SESSION['logged_in'] ? 'true' : 'false') : 'not set',
        'session_is_admin' => isset($_SESSION['is_admin']) ? ($_SESSION['is_admin'] ? 'true' : 'false') : 'not set',
        'global_isAdmin' => $GLOBALS['isAdmin'] ? 'true' : 'false'
    ]);

    $logger->logAdminAccess(array_merge($debug_info, ['action' => 'ACCESS_CHECK_DEBUG']));

    // Check if admin access is granted
    if (!$GLOBALS['isAdmin']) {
        // Log the failed admin access attempt
        $logger->logAdminAccess(array_merge($userData, ['action' => 'ACCESS_DENIED']));

        // Return error response
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Admin access required'
        ]);
        exit();
    }

    // Log successful admin access
    $logger->logAdminAccess(array_merge($userData, ['action' => 'ACCESS_GRANTED']));
}

/**
 * Encode content to base64 for transmission
 * @param string $content The content to encode
 * @return string Base64 encoded content
 */
function encodeContent($content) {
    if (empty($content)) {
        return '';
    }

    // Ensure content is UTF-8 encoded
    if (!mb_check_encoding($content, 'UTF-8')) {
        $content = mb_convert_encoding($content, 'UTF-8', 'auto');
    }

    // Convert to base64
    return base64_encode($content);
}

/**
 * Decode content from base64
 * @param string $base64Content The base64 encoded content
 * @return string Decoded content
 */
function decodeContent($base64Content) {
    if (empty($base64Content)) {
        return '';
    }

    // Decode from base64
    $decoded = base64_decode($base64Content, true);

    if ($decoded === false) {
        // If base64 decode fails, return original content
        return $base64Content;
    }

    // Ensure content is UTF-8 encoded
    if (!mb_check_encoding($decoded, 'UTF-8')) {
        $decoded = mb_convert_encoding($decoded, 'UTF-8', 'auto');
    }

    return $decoded;
}
?>