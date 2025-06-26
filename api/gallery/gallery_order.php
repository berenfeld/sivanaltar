<?php
// Include common backend functionality
require_once __DIR__ . '/../common.php';

// Include database configuration
require_once __DIR__ . '/../../db_config.php';

// Include logger
require_once __DIR__ . '/../logger/logger.php';

// Initialize logger
$logger = new Logger();

// Require admin access
requireAdmin();

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

    // Get current order for comparison
    $currentOrder = [];
    $stmt = $conn->prepare("SELECT id, display_order FROM gallery WHERE id IN (" . str_repeat('?,', count($data) - 1) . "?)");
    $ids = array_column($data, 'id');
    $stmt->execute($ids);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $currentOrder[$row['id']] = $row['display_order'];
    }

    // Update each item's display order
    $stmt = $conn->prepare("UPDATE gallery SET display_order = :order WHERE id = :id");

    $orderChanges = [];
    foreach ($data as $item) {
        if (!isset($item['id']) || !isset($item['order'])) {
            throw new Exception('Invalid item data');
        }

        $oldOrder = $currentOrder[$item['id']] ?? 'unknown';
        $newOrder = $item['order'];

        $orderChanges[] = [
            'id' => $item['id'],
            'old_order' => $oldOrder,
            'new_order' => $newOrder
        ];

        $stmt->execute([
            ':order' => $item['order'],
            ':id' => $item['id']
        ]);
    }

    $conn->commit();

    // Log successful order update
    $logger->logGalleryAction([
        'action' => 'REORDER',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'items_count' => count($data),
        'order_changes' => $orderChanges
    ]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }

    // Log failed order update
    $logger->logGalleryAction([
        'action' => 'REORDER_FAILED',
        'user_id' => $_SESSION['user_id'] ?? 'unknown',
        'user_email' => $_SESSION['user_email'] ?? 'unknown',
        'user_name' => $_SESSION['user_name'] ?? 'unknown',
        'error' => $e->getMessage(),
        'items_count' => count($data)
    ]);

    error_log("Error updating gallery order: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}