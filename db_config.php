<?php
// Determine if we're in production or development
$is_cli = (php_sapi_name() === 'cli');
$is_production = !$is_cli && (
    isset($_SERVER['HTTP_HOST']) && (
        stripos($_SERVER['HTTP_HOST'], 'infinityfree.com') !== false ||
        stripos($_SERVER['HTTP_HOST'], 'sivanaltar.com') !== false
    )
);

// Configure database connection parameters
if ($is_production) {
    // Production database settings
    $db_host = "sql107.infinityfree.com";  // InfinityFree MySQL host
    $db_user = "if0_39000738";
    $db_pass = "dosu20oLXQ";  // Replace with actual production password
    $db_name = "if0_39000738_sivanaltar";
} else {
    // Development database settings (local Docker)
    $db_host = "127.0.0.1";
    $db_user = "if0_39000738";
    $db_pass = "dosu20oLXQ";
    $db_name = "if0_39000738_sivanaltar";
}

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