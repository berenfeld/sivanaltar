<?php
/**
 * Environment Variables Loader
 * Loads environment variables from .env file into global variables
 */

// Define global variables
$GLOBALS['DB_HOST'] = '';
$GLOBALS['DB_USER'] = '';
$GLOBALS['DB_PASS'] = '';
$GLOBALS['DB_NAME'] = '';
$GLOBALS['DEPLOYMENT'] = '';
$GLOBALS['SITE_URL'] = '';
$GLOBALS['INIT_DB_TOKEN'] = '';
$GLOBALS['ADMIN_EMAIL'] = '';
$GLOBALS['GOOGLE_CLIENT_ID'] = '';
$GLOBALS['GOOGLE_CLIENT_SECRET'] = '';

function loadEnv($path = null) {
    // If no path provided, look for .env in the parent directory of document root
    if ($path === null) {
        $path = dirname($_SERVER['DOCUMENT_ROOT']) . '/.env';
    }

    // Check if file exists
    if (!file_exists($path)) {
        if ($GLOBALS['DEPLOYMENT'] === 'development') {
            echo "Warning: .env file not found at: " . $path . "\n";
        }
        return false;
    }

    // Read file content
    $content = file_get_contents($path);
    if ($content === false) {
        if ($GLOBALS['DEPLOYMENT'] === 'development') {
            echo "Warning: Could not read .env file at: " . $path . "\n";
        }
        return false;
    }

    // Convert Windows line endings to Unix if needed
    $content = str_replace("\r\n", "\n", $content);

    // Parse each line
    $lines = explode("\n", $content);
    foreach ($lines as $line) {
        $line = trim($line);

        // Skip empty lines and comments
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }

        // Split on first equals sign
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);

        // Remove quotes if present
        if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        } elseif (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1) {
            $value = substr($value, 1, -1);
        }

        // Set global variable
        $GLOBALS[$key] = $value;
    }

    return true;
}

// Load environment variables
loadEnv();

// Optional: Check if .env was loaded
if (!$env_loaded) {
    // For development, you could show a warning
    // For production, you might want to silently continue or log this
    if (php_sapi_name() !== 'cli' && (!isset($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') !== false)) {
        echo "<!-- Warning: .env file not found or could not be loaded -->\n";
    }
}
?>