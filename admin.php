<?php
// Ensure no whitespace before this opening PHP tag
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Start session safely
if (!headers_sent()) {
    session_start();
} else {
    echo "Warning: Could not start session - headers already sent<br>";
}

// Include database configuration
require_once __DIR__ . '/db_config.php';  // Use absolute path with __DIR__

// Determine environment more robustly
$is_cli = (php_sapi_name() === 'cli');
$is_production = false;
if (!$is_cli && isset($_SERVER['HTTP_HOST'])) {
    $is_production = (stripos($_SERVER['HTTP_HOST'], 'infinityfree.com') !== false ||
                     stripos($_SERVER['HTTP_HOST'], 'sivanaltar.com') !== false);
}

// Security check with better handling for CLI vs web
$allowed_ips = ['127.0.0.1', '::1', 'localhost'];
$is_local = $is_cli ||
            (isset($_SERVER['REMOTE_ADDR']) && in_array($_SERVER['REMOTE_ADDR'], $allowed_ips)) ||
            (isset($_SERVER['SERVER_NAME']) && in_array($_SERVER['SERVER_NAME'], $allowed_ips));


// Function to display table structure
function displayTableStructure($conn, $tableName) {
    $output = "<h3>Structure for table '$tableName'</h3>";

    try {
        $stmt = $conn->query("DESCRIBE `$tableName`");

        if ($stmt) {
            $output .= "<table border='1' cellpadding='5'>";
            $output .= "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $output .= "<tr>";
                $output .= "<td>{$row['Field']}</td>";
                $output .= "<td>{$row['Type']}</td>";
                $output .= "<td>{$row['Null']}</td>";
                $output .= "<td>{$row['Key']}</td>";
                $output .= "<td>" . (is_null($row['Default']) ? "NULL" : $row['Default']) . "</td>";
                $output .= "<td>{$row['Extra']}</td>";
                $output .= "</tr>";
            }

            $output .= "</table>";
        } else {
            $output .= "<p>Error getting table structure</p>";
        }
    } catch (PDOException $e) {
        $output .= "<p>Error getting table structure: " . $e->getMessage() . "</p>";
    }

    return $output;
}

// Function to display table data preview
function displayTableDataPreview($conn, $tableName, $limit = 5) {
    $output = "<h3>Data preview for table '$tableName' (up to $limit rows)</h3>";

    try {
        $stmt = $conn->query("SELECT * FROM `$tableName` LIMIT $limit");

        if ($stmt) {
            if ($stmt->rowCount() > 0) {
                $output .= "<table border='1' cellpadding='5'>";

                // Get the first row to determine column names
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                // Table header
                $output .= "<tr>";
                foreach ($row as $key => $value) {
                    $output .= "<th>{$key}</th>";
                }
                $output .= "</tr>";

                // Output first row
                $output .= "<tr>";
                foreach ($row as $value) {
                    $output .= "<td>" . (is_null($value) ? "NULL" : htmlspecialchars($value)) . "</td>";
                }
                $output .= "</tr>";

                // Output remaining rows
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $output .= "<tr>";
                    foreach ($row as $value) {
                        $output .= "<td>" . (is_null($value) ? "NULL" : htmlspecialchars($value)) . "</td>";
                    }
                    $output .= "</tr>";
                }

                $output .= "</table>";
            } else {
                $output .= "<p>No data in this table</p>";
            }
        } else {
            $output .= "<p>Error querying table</p>";
        }
    } catch (PDOException $e) {
        $output .= "<p>Error querying table: " . $e->getMessage() . "</p>";
    }

    return $output;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Admin Information</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        h1, h2, h3 {
            color: #333;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }
        th, td {
            text-align: left;
            padding: 8px;
            border: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .environment {
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
        }
        .prod {
            background-color: #ffcccc;
        }
        .dev {
            background-color: #ccffcc;
        }
    </style>
</head>
<body>
    <h1>Database Admin Information</h1>

    <p>Current environment:
        <span class="environment <?php echo $is_production ? 'prod' : 'dev'; ?>">
            <?php echo $is_production ? 'PRODUCTION' : 'DEVELOPMENT'; ?>
        </span>
    </p>

    <section>
        <h2>Database Connection</h2>
        <?php
        try {
            // Create connection using PDO
            $conn = getDbConnection();

            echo "<p style='color:green;'>✅ Connected successfully to database <strong>$db_name</strong> on <strong>$db_host</strong></p>";

            // Get MySQL version
            $stmt = $conn->query("SELECT VERSION() AS version");
            $mysql_version = $stmt->fetch(PDO::FETCH_ASSOC)['version'];
            echo "<p><strong>MySQL Version:</strong> $mysql_version</p>";

            // Get server info (may not work with all PDO drivers)
            try {
                $serverInfo = $conn->getAttribute(PDO::ATTR_SERVER_INFO);
                echo "<p><strong>MySQL Server Info:</strong> " . $serverInfo . "</p>";
            } catch (PDOException $e) {
                echo "<p><strong>MySQL Server Info:</strong> Not available via PDO</p>";
            }

            // Get connection stats
            try {
                $serverStats = $conn->getAttribute(PDO::ATTR_SERVER_VERSION);
                echo "<p><strong>MySQL Server Version:</strong> " . $serverStats . "</p>";
            } catch (PDOException $e) {
                echo "<p><strong>MySQL Server Version:</strong> Not available via PDO</p>";
            }

        } catch (Exception $e) {
            echo "<p style='color:red;'>❌ " . $e->getMessage() . "</p>";
            exit; // Stop execution if we can't connect
        }
        ?>
    </section>

    <section>
        <h2>Database Tables</h2>
        <?php
        // Check for existing tables
        $tables = [];
        try {
            $result = $conn->query("SHOW TABLES");
            if ($result) {
                while ($row = $result->fetch(PDO::FETCH_NUM)) {
                    $tables[] = $row[0];
                }

                if (count($tables) > 0) {
                    echo "<p>Found " . count($tables) . " table(s):</p>";
                    echo "<ul>";
                    foreach ($tables as $table) {
                        echo "<li>$table</li>";
                    }
                    echo "</ul>";
                } else {
                    echo "<p>No tables found in the database.</p>";
                }
            } else {
                echo "<p>Error retrieving tables</p>";
            }
        } catch (PDOException $e) {
            echo "<p>Error retrieving tables: " . $e->getMessage() . "</p>";
        }
        ?>
    </section>

    <?php foreach($tables as $table): ?>
    <section>
        <?php
        echo displayTableStructure($conn, $table);
        echo displayTableDataPreview($conn, $table);
        ?>
    </section>
    <?php endforeach; ?>

    <section>
        <h2>Server Information</h2>
        <table>
            <tr>
                <th>PHP Version</th>
                <td><?php echo phpversion(); ?></td>
            </tr>
            <tr>
                <th>Server Software</th>
                <td><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Not available'; ?></td>
            </tr>
            <tr>
                <th>Server Name</th>
                <td><?php echo $_SERVER['SERVER_NAME'] ?? 'Not available'; ?></td>
            </tr>
            <tr>
                <th>Document Root</th>
                <td><?php echo $_SERVER['DOCUMENT_ROOT'] ?? ''; ?></td>
            </tr>
            <tr>
                <th>Server IP</th>
                <td><?php echo $_SERVER['SERVER_ADDR'] ?? 'Not available'; ?></td>
            </tr>
            <tr>
                <th>Client IP</th>
                <td><?php echo $_SERVER['REMOTE_ADDR'] ?? 'Not available'; ?></td>
            </tr>
        </table>

        <h3>PHP Extensions</h3>
        <pre><?php print_r(get_loaded_extensions()); ?></pre>

        <h3>PHP Configuration</h3>
        <pre><?php
            // Display select important PHP configuration values
            $important_settings = [
                'display_errors', 'max_execution_time', 'memory_limit',
                'post_max_size', 'upload_max_filesize', 'date.timezone'
            ];

            foreach ($important_settings as $setting) {
                echo $setting . ': ' . ini_get($setting) . "\n";
            }
        ?></pre>
    </section>

    <?php
    // Close the connection
    $conn = null;
    ?>
</body>
</html>