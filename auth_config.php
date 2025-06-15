<?php
// auth_config.php - Configuration for authentication

// Check if environment variables are loaded
if (empty($GLOBALS['GOOGLE_CLIENT_ID'])) {
    require_once 'env_loader.php';
}

// Google OAuth configuration
define('GOOGLE_CLIENT_ID', $GLOBALS['GOOGLE_CLIENT_ID'] ?: '');
define('GOOGLE_CLIENT_SECRET', $GLOBALS['GOOGLE_CLIENT_SECRET'] ?: '');

// Site URL configuration
$site_url = $GLOBALS['SITE_URL'] ?: (
    isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http"
) . "://" . $_SERVER['HTTP_HOST'];

// Admin configuration
define('ADMIN_EMAIL', $GLOBALS['ADMIN_EMAIL'] ?: 'admin@example.com');

// Initialize Google Client
$client = new Google_Client();
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_CLIENT_SECRET);
$client->setRedirectUri($site_url . '/auth_callback.php');
$client->addScope('email');
$client->addScope('profile');

// Check if user is logged in
$is_logged_in = false;
$google_user = null;

if (isset($_SESSION['google_user'])) {
    $is_logged_in = true;
    $google_user = $_SESSION['google_user'];
    $is_admin = $google_user['email'] == $GLOBALS['ADMIN_EMAIL'];
}

// Function to process Google user data
function processGoogleUser($google_user) {
    try {
        $conn = getDbConnection();

        // Check if user exists
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$google_user['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Is this an admin email?
        $is_admin = $google_user['email'] == $GLOBALS['ADMIN_EMAIL'];

        if ($user) {
            // Update existing user
            $stmt = $conn->prepare("
                UPDATE users SET
                    name = ?,
                    profile_picture = ?,
                    is_admin = ?,
                    last_login = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $google_user['name'],
                $google_user['picture'],
                $is_admin,
                $user['id']
            ]);

            return [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $google_user['name'],
                'profile_picture' => $google_user['picture'],
                'is_admin' => $is_admin
            ];
        } else {
            // Create new user
            $stmt = $conn->prepare("
                INSERT INTO users (email, name, profile_picture, is_admin, last_login)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $google_user['email'],
                $google_user['name'],
                $google_user['picture'],
                $is_admin
            ]);

            return [
                'id' => $conn->lastInsertId(),
                'email' => $google_user['email'],
                'name' => $google_user['name'],
                'profile_picture' => $google_user['picture'],
                'is_admin' => $is_admin
            ];
        }
    } catch (Exception $e) {
        error_log("Error processing Google user: " . $e->getMessage());
        return false;
    }
}
?>