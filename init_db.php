<?php
// init_db.php - Initialize database with only users table
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include environment loader and database configuration
require_once __DIR__ . '/env_loader.php';
require_once __DIR__ . '/db_config.php';

// Get initialization token from environment
$valid_init_token = getenv('INIT_DB_TOKEN') ?: 'setup_sivanaltar_2023';

// Get admin email from environment
$admin_email = getenv('ADMIN_EMAIL') ?: 'berenfeldran@gmail.com';

// Check for security token
$has_valid_token = isset($_GET['init_token']) && $_GET['init_token'] === $valid_init_token;

// Security check
if (!$has_valid_token) {
    header('HTTP/1.0 403 Forbidden');
    echo "<h1>Access Denied</h1>";
    echo "<p>You need to provide a valid initialization token.</p>";
    exit;
}

try {
    // Get database connection
    $conn = getDbConnection();

    echo "<h1>Database Initialization Script</h1>";

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

    // Add confirmation check for safety
    if (!isset($_GET['confirm']) || $_GET['confirm'] !== 'yes') {
        echo "<!DOCTYPE html>
        <html>
        <head>
            <title>Database Initialization</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .warning { color: #721c24; background-color: #f8d7da; padding: 15px; border-radius: 5px; }
                .button { display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white;
                         text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .button.cancel { background-color: #6c757d; margin-left: 10px; }
                h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                .info { background-color: #e2f0fb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>Database Initialization</h1>

            <div class='warning'>
                <strong>Warning!</strong> This will reset your database and delete all existing data!
            </div>

            <div class='info'>
                <p>This script will perform the following actions:</p>
                <ul>
                    <li>Drop any existing tables with foreign keys to users</li>
                    <li>Drop the users table</li>
                    <li>Create a new users table</li>
                    <li>Add initial admin user: <strong>" . htmlspecialchars($admin_email) . "</strong></li>
                </ul>
            </div>

            <p>Are you sure you want to proceed?</p>

            <a href='?confirm=yes&init_token=" . htmlspecialchars($valid_init_token) . "' class='button'>Yes, Initialize Database</a>
            <a href='index.php' class='button cancel'>Cancel</a>
        </body>
        </html>";
        exit;
    }

    // Environment information
    echo "<p>Environment: <strong>" . ($is_production ? "Production" : "Development") . "</strong></p>";
    echo "<p>Admin email: <strong>" . htmlspecialchars($admin_email) . "</strong></p>";

    // First check for existing tables that reference users
    echo "<h2>Checking Existing Tables</h2>";

    $tables_to_drop = [];

    try {
        // Query to find tables that reference users table
        $stmt = $conn->query("SHOW TABLES");
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $tables_to_drop[] = $row[0];
        }

        echo "<p>Found " . count($tables_to_drop) . " tables in database.</p>";
    } catch (PDOException $e) {
        echo "<p style='color:orange;'>Warning checking tables: " . $e->getMessage() . "</p>";
    }

    // Drop all tables - no foreign key checks
    echo "<h2>Dropping All Tables</h2>";

    try {
        // Disable foreign key checks to allow dropping tables in any order
        $conn->exec("SET FOREIGN_KEY_CHECKS = 0");

        // Drop each table
        foreach ($tables_to_drop as $table) {
            $conn->exec("DROP TABLE IF EXISTS `$table`");
            echo "<p>Table <code>$table</code> dropped.</p>";
        }

        // Re-enable foreign key checks
        $conn->exec("SET FOREIGN_KEY_CHECKS = 1");
    } catch (PDOException $e) {
        echo "<p style='color:red;'>Error dropping tables: " . $e->getMessage() . "</p>";
        // Continue anyway
    }

    // Create users table
    echo "<h2>Creating Users Table</h2>";

    $sql_users = "
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    $conn->exec($sql_users);
    echo "<p style='color:green;'>✓ Users table created successfully</p>";

    // Add admin user from environment variable
    echo "<h2>Adding Admin User</h2>";

    $admin_name = explode('@', $admin_email)[0]; // Simple name from email
    $sql_admin = "
    INSERT INTO users (email, name, is_admin) VALUES
    (:email, :name, TRUE)
    ";

    $stmt = $conn->prepare($sql_admin);
    $stmt->execute([
        'email' => $admin_email,
        'name' => $admin_name
    ]);

    echo "<p style='color:green;'>✓ Admin user <strong>" . htmlspecialchars($admin_email) . "</strong> added successfully</p>";

    echo "<h2 style='color:green;'>Database Initialization Complete</h2>";
    echo "<p>Users table has been created with admin user.</p>";

    // Show links
    echo '<p>';
    echo '<a href="admin.php" style="padding:10px 15px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:4px; margin-right:15px;">Go to Admin Panel</a>';
    echo '<a href="users.php" style="padding:10px 15px; background-color:#2196F3; color:white; text-decoration:none; border-radius:4px;">Manage Users</a>';
    echo '</p>';

} catch (PDOException $e) {
    // Show error details
    echo "<h2 style='color:red;'>Database Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";

    // Debug info for development
    if (!$is_production) {
        echo "<h3>Debug Information:</h3>";
        echo "<pre>";
        print_r($e->getTrace());
        echo "</pre>";
    }
}
?>