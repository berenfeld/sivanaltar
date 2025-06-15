<?php
session_start();
require_once 'db_config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

try {
    $conn = getDbConnection();
    $conn->beginTransaction();

    // Update each item's display order
    $stmt = $conn->prepare("UPDATE gallery SET display_order = :order WHERE id = :id");

    foreach ($data as $item) {
        if (!isset($item['id']) || !isset($item['order'])) {
            throw new Exception('Invalid item data');
        }

        $stmt->execute([
            ':order' => $item['order'],
            ':id' => $item['id']
        ]);
    }

    $conn->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    error_log("Error updating gallery order: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}