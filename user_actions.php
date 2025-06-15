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
        if (!isset($_POST['user_id']) || empty($_POST['user_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'User ID is required'
            ]);
            exit;
        }

        $user_id = (int)$_POST['user_id'];

        // Don't allow deleting your own account
        if ($user_id == $_SESSION['user_id']) {
            echo json_encode([
                'success' => false,
                'message' => 'You cannot delete your own account'
            ]);
            exit;
        }

        try {
            // First check if user exists
            $stmt = $conn->prepare("SELECT id, name FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
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
            $stmt->execute([$user_id]);

            // Log the deletion
            error_log("User deleted: ID=$user_id, Name={$user['name']} by Admin={$_SESSION['user_email']}");

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
        if (!isset($_POST['user_id']) || empty($_POST['user_id']) ||
            !isset($_POST['user_name']) || empty($_POST['user_name']) ||
            !isset($_POST['user_email']) || empty($_POST['user_email'])) {

            echo json_encode([
                'success' => false,
                'message' => 'User ID, name and email are required'
            ]);
            exit;
        }

        $user_id = (int)$_POST['user_id'];
        $user_name = trim($_POST['user_name']);
        $user_email = trim($_POST['user_email']);
        $is_admin = isset($_POST['is_admin']) ? (int)$_POST['is_admin'] : 0;

        try {
            // First check if user exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$user_id]);

            if (!$stmt->fetch()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
                exit;
            }

            // Check if email is already used by another user
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([$user_email, $user_id]);

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
            $stmt->execute([$user_name, $user_email, $is_admin, $user_id]);

            // If updating current user, update session data
            if ($user_id == $_SESSION['user_id']) {
                $_SESSION['user_name'] = $user_name;
                $_SESSION['user_email'] = $user_email;
                $_SESSION['is_admin'] = (bool)$is_admin;
            }

            // Log the update
            error_log("User updated: ID=$user_id, Name=$user_name, Email=$user_email, is_admin=$is_admin by Admin={$_SESSION['user_email']}");

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