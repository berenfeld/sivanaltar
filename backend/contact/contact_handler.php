<?php
session_start();
header('Content-Type: application/json');

// Include logger
require_once __DIR__ . '/../logger/logger.php';

// Include template loader
require_once __DIR__ . '/../mail/template_loader.php';

// Initialize logger and template loader
$logger = new Logger();
$templateLoader = new TemplateLoader();

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get form data
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');
$form_type = $_POST['form_type'] ?? 'contact'; // 'contact' or 'newsletter'

// Validate required fields
if (empty($name) || empty($email) || (empty($message) && $form_type === 'contact')) {
    echo json_encode(['success' => false, 'message' => 'נא למלא את כל השדות הנדרשים']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'כתובת האימייל אינה תקינה']);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

try {
    // Prepare template data
    $templateData = [
        'name' => $name,
        'email' => $email,
        'date' => date('d/m/Y H:i'),
        'message' => nl2br($message)
    ];

    // Load appropriate template
    if ($form_type === 'newsletter') {
        $subject = 'הרשמה חדשה לניוזלטר - ' . $name;
        $email_content = $templateLoader->loadTemplate('newsletter_template', $templateData);
    } else {
        $subject = 'פנייה חדשה מהאתר - ' . $name;
        $email_content = $templateLoader->loadTemplate('contact_template', $templateData);
    }

    // Send email using Gmail SMTP (you'll need to set up an App Password)
    $mail_sent = sendEmailViaSMTP($subject, $email_content, $name, $email);

    if ($mail_sent) {
        // Log successful email
        $logger->logContactAction([
            'action' => $form_type === 'newsletter' ? 'NEWSLETTER_SIGNUP' : 'CONTACT_FORM',
            'user_name' => $name,
            'user_email' => $email,
            'message' => $message,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);

        echo json_encode([
            'success' => true,
            'message' => $form_type === 'newsletter' ? 'ההרשמה לניוזלטר הושלמה בהצלחה!' : 'ההודעה נשלחה בהצלחה!'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }

} catch (Exception $e) {
    // Log failed email
    $logger->logContactAction([
        'action' => $form_type === 'newsletter' ? 'NEWSLETTER_SIGNUP_FAILED' : 'CONTACT_FORM_FAILED',
        'user_name' => $name,
        'user_email' => $email,
        'message' => $message,
        'error' => $e->getMessage(),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);

    // Log error
    error_log("Error sending email: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'אירעה שגיאה בשליחת ההודעה. אנא נסו שוב מאוחר יותר.'
    ]);
}

function sendEmailViaSMTP($subject, $html_content, $from_name, $from_email) {
    // Option 1: Using Gmail SMTP (recommended for simplicity)
    $smtp_host = 'smtp.gmail.com';
    $smtp_port = 587;
    $smtp_username = 'sivanaltar@gmail.com'; // Your Gmail address
    $smtp_password = 'your-app-password'; // Gmail App Password (not regular password)

    // Option 2: Using AWS SES (if you prefer)
    // $smtp_host = 'email-smtp.us-east-1.amazonaws.com';
    // $smtp_port = 587;
    // $smtp_username = 'your-ses-smtp-username';
    // $smtp_password = 'your-ses-smtp-password';

    $to_email = 'sivanaltar@gmail.com';

    // Set headers for SMTP
    $headers = array();
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-type: text/html; charset=UTF-8';
    $headers[] = 'From: ' . $from_name . ' <' . $smtp_username . '>';
    $headers[] = 'Reply-To: ' . $from_email;
    $headers[] = 'X-Mailer: PHP/' . phpversion();

    // For now, use the simple mail() function
    // In production, you should use PHPMailer or similar library for better SMTP support
    return mail($to_email, $subject, $html_content, implode("\r\n", $headers));
}
?>