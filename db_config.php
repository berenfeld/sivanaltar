<?php
// Check if environment variables are loaded
if (empty($GLOBALS['DB_HOST'])) {
    require_once 'env_loader.php';
}

// Database configuration
$db_host = $GLOBALS['DB_HOST'];
$db_user = $GLOBALS['DB_USER'];
$db_pass = $GLOBALS['DB_PASS'];
$db_name = $GLOBALS['DB_NAME'];

// Get database connection
function getDbConnection() {
    global $db_host, $db_user, $db_pass, $db_name;

    try {
        $conn = new PDO(
            "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
            $db_user,
            $db_pass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}
?>