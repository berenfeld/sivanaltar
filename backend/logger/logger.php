<?php
/**
 * Logger Class - Handles user authentication logging
 * Logs login/logout events with detailed information in text format
 */

class Logger {
    private $logDir;
    private $logFile;

    public function __construct($logDir = null) {
        if ($logDir === null) {
            $this->logDir = __DIR__ . '/../../logs';
        } else {
            $this->logDir = $logDir;
        }

        // Create logs directory if it doesn't exist
        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }

        // Set log file name with current date
        $this->logFile = $this->logDir . '/log_' . date('Y-m-d') . '.log';
    }

    /**
     * Log user login event
     */
    public function logLogin($userData) {
        $logEntry = sprintf(
            "[%s] LOGIN - User: %s (ID: %s, Email: %s, Admin: %s) - IP: %s - Session: %s\n",
            date('Y-m-d H:i:s'),
            $userData['name'] ?? 'Unknown',
            $userData['id'] ?? 'unknown',
            $userData['email'] ?? 'unknown',
            ($userData['is_admin'] ?? false) ? 'Yes' : 'No',
            $this->getClientIP(),
            session_id()
        );

        $this->writeLog($logEntry);
    }

    /**
     * Log user logout event
     */
    public function logLogout($userData = null) {
        if ($userData) {
            $logEntry = sprintf(
                "[%s] LOGOUT - User: %s (ID: %s, Email: %s, Admin: %s) - IP: %s - Session: %s\n",
                date('Y-m-d H:i:s'),
                $userData['name'] ?? 'Unknown',
                $userData['id'] ?? 'unknown',
                $userData['email'] ?? 'unknown',
                ($userData['is_admin'] ?? false) ? 'Yes' : 'No',
                $this->getClientIP(),
                session_id()
            );
        } else {
            $logEntry = sprintf(
                "[%s] LOGOUT - Unknown User - IP: %s - Session: %s\n",
                date('Y-m-d H:i:s'),
                $this->getClientIP(),
                session_id()
            );
        }

        $this->writeLog($logEntry);
    }

    /**
     * Log failed login attempt
     */
    public function logFailedLogin($email, $reason) {
        $logEntry = sprintf(
            "[%s] LOGIN_FAILED - Email: %s - Reason: %s - IP: %s - Session: %s\n",
            date('Y-m-d H:i:s'),
            $email,
            $reason,
            $this->getClientIP(),
            session_id()
        );

        $this->writeLog($logEntry);
    }

    /**
     * Log failed logout attempt
     */
    public function logFailedLogout($reason) {
        $logEntry = sprintf(
            "[%s] LOGOUT_FAILED - Reason: %s - IP: %s - Session: %s\n",
            date('Y-m-d H:i:s'),
            $reason,
            $this->getClientIP(),
            session_id()
        );

        $this->writeLog($logEntry);
    }

    /**
     * Write log entry to file
     */
    private function writeLog($logEntry) {
        if (file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX) === false) {
            error_log("Failed to write to log file: " . $this->logFile);
        }
    }

    /**
     * Get client IP address
     */
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];

        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    /**
     * Get user agent string
     */
    private function getUserAgent() {
        return $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    }

    /**
     * Get log file path
     */
    public function getLogFile() {
        return $this->logFile;
    }

    /**
     * Read recent log entries (for admin purposes)
     */
    public function getRecentLogs($limit = 100) {
        if (!file_exists($this->logFile)) {
            return [];
        }

        $lines = file($this->logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $logs = [];

        foreach (array_reverse($lines) as $line) {
            $logs[] = $line;
            if (count($logs) >= $limit) {
                break;
            }
        }

        return array_reverse($logs);
    }
}
?>