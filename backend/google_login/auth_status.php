<?php
// auth_status.php - Return current authentication status
session_start();
header('Content-Type: application/json');

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