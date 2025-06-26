<?php
// Include common backend functionality
require_once __DIR__ . '/../common.php';

// Include database configuration
require_once __DIR__ . '/../../db_config.php';

// auth_status.php - Return current authentication status

// Return the login status
$response = [
    'loggedIn' => isset($_SESSION['logged_in']) && $_SESSION['logged_in'],
];

// If logged in, include user info
if ($response['loggedIn']) {
    $response['user'] = [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email'],
        'picture' => $_SESSION['user_picture'],
        'is_admin' => $_SESSION['is_admin']
    ];
}

echo json_encode($response);
?>