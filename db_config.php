<?php
// Load environment variables if not already loaded
if (!getenv('DB_HOST')) {
    require_once __DIR__ . '/env_loader.php';
}

// Determine if we're in production based on DEPLOYMENT variable
$deployment = getenv('DEPLOYMENT') ?: 'Development';
$is_production = ($deployment === 'Production');

// Use the same database variables regardless of environment
$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_user = getenv('DB_USER') ?: '';
$db_pass = getenv('DB_PASS') ?: '';
$db_name = getenv('DB_NAME') ?: '';

// Function to get PDO database connection
function getDbConnection() {
    global $db_host, $db_user, $db_pass, $db_name;

    try {
        $dsn = "mysql:host=$db_host;dbname=$db_name";
        $conn = new PDO($dsn, $db_user, $db_pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        throw new Exception("Connection failed: " . $e->getMessage());
    }
}
?>