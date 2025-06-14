<?php
// auth_config.php - Configuration for authentication

// Load environment variables
require_once __DIR__ . '/env_loader.php';

// Google OAuth Configuration
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');

// Get site URL from environment or construct a default
$site_url = getenv('SITE_URL') ?: (
    (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://") .
    (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost')
);

define('GOOGLE_REDIRECT_URI', $site_url . '/auth_callback.php');

// Admin email - only used for reference, not for authorization
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'admin@example.com');

// Function to process Google user data
function processGoogleUser($google_user) {
    try {
        $conn = getDbConnection();

        // Check if user exists
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$google_user['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Is this an admin email?
        $is_admin = $google_user['email'] == getenv('ADMIN_EMAIL');

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