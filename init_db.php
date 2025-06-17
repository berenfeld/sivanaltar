<?php
// Load environment variables first
require_once 'env_loader.php';

// Get initialization token and admin email
$valid_init_token = $GLOBALS['INIT_DB_TOKEN'] ?: 'setup_sivanaltar_2023';
$admin_email = $GLOBALS['ADMIN_EMAIL'] ?: 'berenfeldran@gmail.com';

// Check if token is provided and valid
if (!isset($_GET['init_token']) || $_GET['init_token'] !== $valid_init_token) {
    header('HTTP/1.0 403 Forbidden');
    echo "<h1>Access Denied</h1>";
    echo "<p>You need to provide a valid initialization token.</p>";
    exit;
}

// Get database configuration
$db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
$db_user = $GLOBALS['DB_USER'] ?: '';
$db_pass = $GLOBALS['DB_PASS'] ?: '';
$db_name = $GLOBALS['DB_NAME'] ?: '';

echo "<h1>Database Initialization Script</h1>";

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
                <li>Create database if it doesn't exist</li>
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
echo "<p>Environment: <strong>" . $GLOBALS['DEPLOYMENT'] . "</strong></p>";
echo "<p>Admin email: <strong>" . htmlspecialchars($admin_email) . "</strong></p>";

try {
    // Get database connection without database name
    $conn = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if it doesn't exist
    echo "<h2>Creating Database</h2>";
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p style='color:green;'>✓ Database created or already exists</p>";

    // Select the database
    $conn->exec("USE `$db_name`");
    echo "<p style='color:green;'>✓ Database selected</p>";

    // Set connection charset
    $conn->exec("SET NAMES utf8mb4");
    $conn->exec("SET CHARACTER SET utf8mb4");
    $conn->exec("SET character_set_connection=utf8mb4");

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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $conn->exec($sql_users);
    echo "<p style='color:green;'>✓ Users table created successfully</p>";

    // Create gallery table
    echo "<h2>Creating Gallery Table</h2>";

    $sql_gallery = "
    CREATE TABLE gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_path VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $conn->exec($sql_gallery);
    echo "<p style='color:green;'>✓ Gallery table created successfully</p>";

    // Insert gallery data
    echo "<h2>Populating Gallery Table</h2>";

    $gallery_data = [
        [
            'title' => 'רגע של התבוננות',
            'description' => 'צילום מיוחד שלכד רגע של שלווה פנימית',
            'image_path' => 'images/gallery-1.jpeg',
            'display_order' => 1
        ],
        [
            'title' => 'דרך חדשה',
            'description' => 'תחילתו של מסע אישי',
            'image_path' => 'images/gallery-2.jpeg',
            'display_order' => 2
        ],
        [
            'title' => 'שקיעה מרהיבה',
            'description' => 'סוף יום מלא השראה',
            'image_path' => 'images/gallery-3.jpeg',
            'display_order' => 3
        ],
        [
            'title' => 'טבע פראי',
            'description' => 'החיבור לטבע כחלק מתהליך ההתפתחות',
            'image_path' => 'images/gallery-4.jpeg',
            'display_order' => 4
        ],
        [
            'title' => 'אור בקצה המנהרה',
            'description' => 'תקווה והתחדשות',
            'image_path' => 'images/gallery-5.jpeg',
            'display_order' => 5
        ],
        [
            'title' => 'מבט אל האופק',
            'description' => 'לראות מעבר למה שנמצא כעת',
            'image_path' => 'images/gallery-6.jpeg',
            'display_order' => 6
        ],
        [
            'title' => 'צבעי החיים',
            'description' => 'הדרך שבה אנו רואים את העולם',
            'image_path' => 'images/gallery-7.jpeg',
            'display_order' => 7
        ],
        [
            'title' => 'דרכים מתפצלות',
            'description' => 'בחירות שמעצבות את המסע שלנו',
            'image_path' => 'images/gallery-8.jpeg',
            'display_order' => 8
        ],
        [
            'title' => 'שקט פנימי',
            'description' => 'רגע של מדיטציה והתבוננות',
            'image_path' => 'images/gallery-9.jpeg',
            'display_order' => 9
        ],
        [
            'title' => 'מרחבים פתוחים',
            'description' => 'האפשרויות האינסופיות שלפנינו',
            'image_path' => 'images/gallery-10.jpeg',
            'display_order' => 10
        ]
    ];

    $sql_insert = "
    INSERT INTO gallery (title, description, image_path, display_order)
    VALUES (:title, :description, :image_path, :display_order)
    ";

    $stmt = $conn->prepare($sql_insert);
    $inserted_count = 0;

    foreach ($gallery_data as $item) {
        try {
            $stmt->execute($item);
            $inserted_count++;
        } catch (PDOException $e) {
            echo "<p style='color:orange;'>Warning inserting gallery item: " . $e->getMessage() . "</p>";
        }
    }

    echo "<p style='color:green;'>✓ Successfully inserted $inserted_count gallery items</p>";

    // Add admin user
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
    echo '<a href="server_test.php" style="padding:10px 15px; background-color:#2196F3; color:white; text-decoration:none; border-radius:4px;">Server Test Page</a>';
    echo '</p>';

} catch (PDOException $e) {
    // Show error details
    echo "<h2 style='color:red;'>Database Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";

    // Debug info for development
    if ($GLOBALS['DEPLOYMENT'] !== 'Production') {
        echo "<h3>Debug Information:</h3>";
        echo "<pre>";
        print_r($e->getTrace());
        echo "</pre>";
    }
}
?>