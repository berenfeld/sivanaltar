<?php
/**
 * env_loader.php - Load environment variables from .env file
 */

/**
 * Load environment variables from a .env file
 * @param string $path Path to .env file
 * @return bool True if loaded successfully, false otherwise
 */
function loadEnv($path = null) {
    // Default to .env file in the current directory if no path specified
    if ($path === null) {
        $path = __DIR__ . '/.env';
    }

    // Return early if file doesn't exist
    if (!file_exists($path)) {
        return false;
    }

    // Read the .env file line by line
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return false;
    }

    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Split by the first equals sign
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue; // Skip lines that don't have an equals sign
        }

        // Extract key and value
        $key = trim($parts[0]);
        $value = trim($parts[1]);

        // Remove quotes if present
        if (preg_match('/^([\'"])(.*)\1$/', $value, $matches)) {
            $value = $matches[2];
        }

        // Set environment variable
        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }

    return true;
}

// Load the .env file
$env_loaded = loadEnv();

// Optional: Check if .env was loaded
if (!$env_loaded) {
    // For development, you could show a warning
    // For production, you might want to silently continue or log this
    if (php_sapi_name() !== 'cli' && (!isset($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') !== false)) {
        echo "<!-- Warning: .env file not found or could not be loaded -->\n";
    }
}
?>