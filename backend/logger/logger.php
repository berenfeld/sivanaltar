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
            $this->logDir = __DIR__ . '/../../../logs';
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
     * Log contact form and newsletter submissions
     */
    public function logContactAction($data) {
        $action = $data['action'] ?? 'UNKNOWN';
        $userInfo = sprintf(
            "User: %s (Email: %s)",
            $data['user_name'] ?? 'Unknown',
            $data['user_email'] ?? 'unknown'
        );

        switch ($action) {
            case 'CONTACT_FORM':
                $logEntry = sprintf(
                    "[%s] CONTACT_FORM - %s - Message Length: %d chars - IP: %s - User Agent: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    strlen($data['message'] ?? ''),
                    $data['ip_address'] ?? $this->getClientIP(),
                    $this->getUserAgent()
                );
                break;

            case 'CONTACT_FORM_FAILED':
                $logEntry = sprintf(
                    "[%s] CONTACT_FORM_FAILED - %s - Error: %s - IP: %s - User Agent: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['error'] ?? 'unknown',
                    $data['ip_address'] ?? $this->getClientIP(),
                    $this->getUserAgent()
                );
                break;

            case 'NEWSLETTER_SIGNUP':
                $logEntry = sprintf(
                    "[%s] NEWSLETTER_SIGNUP - %s - IP: %s - User Agent: %s - Referrer: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['ip_address'] ?? $this->getClientIP(),
                    $this->getUserAgent(),
                    $_SERVER['HTTP_REFERER'] ?? 'unknown'
                );
                break;

            case 'NEWSLETTER_SIGNUP_FAILED':
                $logEntry = sprintf(
                    "[%s] NEWSLETTER_SIGNUP_FAILED - %s - Error: %s - IP: %s - User Agent: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['error'] ?? 'unknown',
                    $data['ip_address'] ?? $this->getClientIP(),
                    $this->getUserAgent()
                );
                break;

            default:
                $logEntry = sprintf(
                    "[%s] CONTACT_%s - %s - Data: %s\n",
                    date('Y-m-d H:i:s'),
                    $action,
                    $userInfo,
                    json_encode($data)
                );
        }

        $this->writeLog($logEntry);
    }

    /**
     * Log gallery actions (upload, update, delete, reorder)
     */
    public function logGalleryAction($data) {
        $action = $data['action'] ?? 'UNKNOWN';
        $userInfo = sprintf(
            "User: %s (ID: %s, Email: %s)",
            $data['user_name'] ?? 'Unknown',
            $data['user_id'] ?? 'unknown',
            $data['user_email'] ?? 'unknown'
        );

        switch ($action) {
            case 'UPLOAD':
                $logEntry = sprintf(
                    "[%s] GALLERY_UPLOAD - %s - Gallery ID: %s - Title: '%s' - File: %s (%s bytes, %s) - Order: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['gallery_id'] ?? 'unknown',
                    $data['title'] ?? 'unknown',
                    $data['file_name'] ?? 'unknown',
                    $data['file_size'] ?? 'unknown',
                    $data['file_type'] ?? 'unknown',
                    $data['display_order'] ?? 'unknown'
                );
                break;

            case 'UPLOAD_FAILED':
                $logEntry = sprintf(
                    "[%s] GALLERY_UPLOAD_FAILED - %s - Error: %s - File: %s (%s bytes, %s)\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['error'] ?? 'unknown',
                    $data['file_name'] ?? 'unknown',
                    $data['file_size'] ?? 'unknown',
                    $data['file_type'] ?? 'unknown'
                );
                break;

            case 'UPDATE':
                $logEntry = sprintf(
                    "[%s] GALLERY_UPDATE - %s - Gallery ID: %s - Title: '%s' -> '%s' - Description: '%s' -> '%s'\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['gallery_id'] ?? 'unknown',
                    $data['old_title'] ?? 'unknown',
                    $data['new_title'] ?? 'unknown',
                    $data['old_description'] ?? 'unknown',
                    $data['new_description'] ?? 'unknown'
                );
                break;

            case 'UPDATE_FAILED':
                $logEntry = sprintf(
                    "[%s] GALLERY_UPDATE_FAILED - %s - Gallery ID: %s - Error: %s - Title: '%s'\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['gallery_id'] ?? 'unknown',
                    $data['error'] ?? 'unknown',
                    $data['title'] ?? 'unknown'
                );
                break;

            case 'DELETE':
                $logEntry = sprintf(
                    "[%s] GALLERY_DELETE - %s - Gallery ID: %s - Title: '%s' - File: %s - File Deleted: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['gallery_id'] ?? 'unknown',
                    $data['title'] ?? 'unknown',
                    $data['image_path'] ?? 'unknown',
                    $data['file_deleted'] ? 'Yes' : 'No'
                );
                break;

            case 'DELETE_FAILED':
                $logEntry = sprintf(
                    "[%s] GALLERY_DELETE_FAILED - %s - Gallery ID: %s - Error: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['gallery_id'] ?? 'unknown',
                    $data['error'] ?? 'unknown'
                );
                break;

            case 'REORDER':
                $changes = [];
                foreach ($data['order_changes'] ?? [] as $change) {
                    $changes[] = sprintf("ID %s: %s -> %s",
                        $change['id'],
                        $change['old_order'],
                        $change['new_order']
                    );
                }
                $logEntry = sprintf(
                    "[%s] GALLERY_REORDER - %s - Items: %s - Changes: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['items_count'] ?? 'unknown',
                    implode(', ', $changes)
                );
                break;

            case 'REORDER_FAILED':
                $logEntry = sprintf(
                    "[%s] GALLERY_REORDER_FAILED - %s - Items: %s - Error: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['items_count'] ?? 'unknown',
                    $data['error'] ?? 'unknown'
                );
                break;

            default:
                $logEntry = sprintf(
                    "[%s] GALLERY_%s - %s - Data: %s\n",
                    date('Y-m-d H:i:s'),
                    $action,
                    $userInfo,
                    json_encode($data)
                );
        }

        $this->writeLog($logEntry);
    }

    /**
     * Log admin access attempts (successful and failed)
     */
    public function logAdminAccess($data) {
        $action = $data['action'] ?? 'UNKNOWN';
        $userInfo = sprintf(
            "User: %s (ID: %s, Email: %s)",
            $data['user_name'] ?? 'Unknown',
            $data['user_id'] ?? 'unknown',
            $data['user_email'] ?? 'unknown'
        );

        switch ($action) {
            case 'ACCESS_GRANTED':
                $logEntry = sprintf(
                    "[%s] ADMIN_ACCESS_GRANTED - %s - Request URI: %s - IP: %s - Session: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['request_uri'] ?? 'unknown',
                    $this->getClientIP(),
                    session_id()
                );
                break;

            case 'ACCESS_DENIED':
                $logEntry = sprintf(
                    "[%s] ADMIN_ACCESS_DENIED - %s - Request URI: %s - IP: %s - Session: %s - User Agent: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['request_uri'] ?? 'unknown',
                    $this->getClientIP(),
                    session_id(),
                    $this->getUserAgent()
                );
                break;

            case 'ACCESS_CHECK_DEBUG':
                $logEntry = sprintf(
                    "[%s] ADMIN_ACCESS_DEBUG - %s - Session Logged In: %s - Session Is Admin: %s - Global IsAdmin: %s - Request URI: %s\n",
                    date('Y-m-d H:i:s'),
                    $userInfo,
                    $data['session_logged_in'] ?? 'unknown',
                    $data['session_is_admin'] ?? 'unknown',
                    $data['global_isAdmin'] ?? 'unknown',
                    $data['request_uri'] ?? 'unknown'
                );
                break;

            default:
                $logEntry = sprintf(
                    "[%s] ADMIN_%s - %s - Data: %s\n",
                    date('Y-m-d H:i:s'),
                    $action,
                    $userInfo,
                    json_encode($data)
                );
        }

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
}
?>