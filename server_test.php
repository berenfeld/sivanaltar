<?php
// Set content type to plain text
header('Content-Type: text/plain');

// Load environment variables
require_once 'env_loader.php';

// Get environment variables
$db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
$db_user = $GLOBALS['DB_USER'] ?: '';
$db_pass = $GLOBALS['DB_PASS'] ?: '';
$db_name = $GLOBALS['DB_NAME'] ?: '';
$deployment = $GLOBALS['DEPLOYMENT'] ?: 'Development';
$admin_email = $GLOBALS['ADMIN_EMAIL'] ?: '';

// Check if we're in development mode
$is_development = $deployment === 'Development';

// Function to format output
function formatOutput($label, $value, $hide = false) {
    if ($hide && !$GLOBALS['is_development']) {
        return "$label: [value hidden]";
    }
    return "$label: $value";
}

// Get .env file path
$env_path = dirname($_SERVER['DOCUMENT_ROOT']) . '/.env';

// Output server information
echo "Server Test\n";
echo "----------\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "HTTP Host: " . $_SERVER['HTTP_HOST'] . "\n";
echo "Remote Address: " . $_SERVER['REMOTE_ADDR'] . "\n\n";

// Output environment file debug information
echo "Environment File Debug:\n";
echo "----------------------\n";
echo "Looking for .env at: " . $env_path . "\n";
echo "File exists: " . (file_exists($env_path) ? "Yes" : "No") . "\n\n";

if (file_exists($env_path)) {
    $content = file_get_contents($env_path);
    echo "Successfully read file content\n";
    echo "Content length: " . strlen($content) . " bytes\n";
    echo "Has Windows line endings: " . (strpos($content, "\r\n") !== false ? "Yes" : "No") . "\n";

    $lines = explode("\n", $content);
    echo "Successfully read " . count($lines) . " lines\n\n";

    echo "File content:\n";
    echo "---------------------------\n";
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            echo $line . "\n";
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        // Only hide sensitive values in production
        if ($is_development) {
            echo "$key = $value\n";
        } else {
            echo "$key = [value hidden]\n";
        }
    }
    echo "---------------------------\n\n";
}

// Check PDO availability
echo "PDO Available: " . (extension_loaded('pdo') ? "Yes" : "No") . "\n";
if (extension_loaded('pdo')) {
    echo "PDO Drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
}
echo "\n";

// Check MySQLi availability
echo "MySQLi Available: " . (extension_loaded('mysqli') ? "Yes" : "No") . "\n\n";

// Check if environment variables were loaded
echo "Environment Variables Loaded: " . (!empty($db_host) && !empty($db_user) ? "Yes" : "No") . "\n";
if (!empty($db_host) && !empty($db_user)) {
    echo formatOutput("DB_HOST", $db_host) . "\n";
    echo formatOutput("DB_NAME", $db_name) . "\n";
    echo formatOutput("DB_USER", $db_user) . "\n";
    echo formatOutput("DEPLOYMENT", $deployment) . "\n";
    echo formatOutput("ADMIN_EMAIL", $admin_email) . "\n";
}
echo "\n";

// Test database connection
try {
    require_once 'db_config.php';
    echo "db_config.php loaded successfully\n\n";

    // Get database configuration from db_config.php
    $config_db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
    $config_db_name = $GLOBALS['DB_NAME'] ?: '';
    $config_db_user = $GLOBALS['DB_USER'] ?: '';

    echo formatOutput("Database Host (from db_config.php)", $config_db_host) . "\n";
    echo formatOutput("Database Name (from db_config.php)", $config_db_name) . "\n";
    echo formatOutput("Database User (from db_config.php)", $config_db_user) . "\n\n";

    echo "Testing connection...\n";
    $conn = getDbConnection();
    echo "Connection successful!\n\n";

    // Get MySQL version
    $version = $conn->query('SELECT VERSION()')->fetchColumn();
    echo "MySQL Version: " . $version . "\n";

} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>