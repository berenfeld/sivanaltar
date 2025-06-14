<?php
// Basic server and PHP configuration test
header('Content-Type: text/plain');
echo "Server Test\n";
echo "----------\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
echo "Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "\n";
echo "HTTP Host: " . ($_SERVER['HTTP_HOST'] ?? 'Unknown') . "\n";
echo "Remote Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n\n";

echo "PDO Available: " . (class_exists('PDO') ? 'Yes' : 'No') . "\n";
if (class_exists('PDO')) {
    echo "PDO Drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n\n";
}

echo "MySQLi Available: " . (class_exists('mysqli') ? 'Yes' : 'No') . "\n\n";

try {
    require_once 'db_config.php';
    echo "db_config.php loaded successfully\n";
    echo "Database Host: $db_host\n";
    echo "Database Name: $db_name\n";
    echo "Database User: $db_user\n\n";

    echo "Testing connection...\n";
    $conn = getDbConnection();
    echo "Connection successful!\n";

    $stmt = $conn->query("SELECT VERSION() AS version");
    $version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];
    echo "MySQL Version: $version\n";

    $conn = null;
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>