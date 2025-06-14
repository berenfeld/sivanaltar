<?php
// user_actions.php - Handle user management actions
session_start();
header('Content-Type: application/json');

// Include database configuration
require_once 'db_config.php';

// Security check - only allow admin users
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. Admin privileges required.'
    ]);
    exit;
}

// Check if action is specified
if (!isset($_POST['action'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No action specified'
    ]);
    exit;
}

// Get database connection
try {
    $conn = getDbConnection();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection error: ' . $e->getMessage()
    ]);
    exit;
}

// Handle different actions
$action = $_POST['action'];

switch ($action) {
    case 'delete':
        // Delete user
        if (!isset($_POST['userId']) || empty($_POST['userId'])) {
            echo json_encode([
                'success' => false,
                'message' => 'User ID is required'
            ]);
            exit;
        }

        $userId = (int)$_POST['userId'];

        // Don't allow deleting your own account
        if ($userId == $_SESSION['user_id']) {
            echo json_encode([
                'success' => false,
                'message' => 'You cannot delete your own account'
            ]);
            exit;
        }

        try {
            // First check if user exists
            $stmt = $conn->prepare("SELECT id, name FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                exit;
            }

            // Delete user
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            // Log the deletion
            error_log("User deleted: ID=$userId, Name={$user['name']} by Admin={$_SESSION['user_email']}");

            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting user: ' . $e->getMessage()
            ]);
        }
        break;

    case 'update':
        // Update user
        if (!isset($_POST['userId']) || empty($_POST['userId']) ||
            !isset($_POST['userName']) || empty($_POST['userName']) ||
            !isset($_POST['userEmail']) || empty($_POST['userEmail'])) {

            echo json_encode([
                'success' => false,
                'message' => 'User ID, name and email are required'
            ]);
            exit;
        }

        $userId = (int)$_POST['userId'];
        $userName = trim($_POST['userName']);
        $userEmail = trim($_POST['userEmail']);
        $isAdmin = isset($_POST['isAdmin']) ? (int)$_POST['isAdmin'] : 0;

        try {
            // First check if user exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            if (!$stmt->fetch()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                exit;
            }

            // Check if email is already used by another user
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([$userEmail, $userId]);

            if ($stmt->fetch()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Email address is already in use by another user'
                ]);
                exit;
            }

            // Update user
            $stmt = $conn->prepare("
                UPDATE users SET
                    name = ?,
                    email = ?,
                    is_admin = ?
                WHERE id = ?
            ");
            $stmt->execute([$userName, $userEmail, $isAdmin, $userId]);

            // If updating current user, update session data
            if ($userId == $_SESSION['user_id']) {
                $_SESSION['user_name'] = $userName;
                $_SESSION['user_email'] = $userEmail;
                $_SESSION['is_admin'] = (bool)$isAdmin;
            }

            // Log the update
            error_log("User updated: ID=$userId, Name=$userName, Email=$userEmail, Admin=$isAdmin by Admin={$_SESSION['user_email']}");

            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error updating user: ' . $e->getMessage()
            ]);
        }
        break;

    default:
        echo json_encode([
            'success' => false,
            'message' => 'Unknown action: ' . $action
        ]);
        break;
}
?>