<?php
// Test email sending configuration
echo "<h2>Email Sending Test</h2>";

// Test 1: Check if mail() function is available
echo "<h3>Test 1: Mail Function</h3>";
if (function_exists('mail')) {
    echo "✅ PHP mail() function is available<br>";
} else {
    echo "❌ PHP mail() function is not available<br>";
}

// Test 2: Check Postfix status
echo "<h3>Test 2: Postfix Status</h3>";
$postfix_status = shell_exec('systemctl is-active postfix 2>/dev/null');
if (trim($postfix_status) === 'active') {
    echo "✅ Postfix is running<br>";
} else {
    echo "❌ Postfix is not running. Status: " . $postfix_status . "<br>";
}

// Test 3: Check mail queue
echo "<h3>Test 3: Mail Queue</h3>";
$mailq = shell_exec('mailq 2>/dev/null | head -5');
if ($mailq) {
    echo "✅ Mail queue is accessible<br>";
    echo "<pre>" . htmlspecialchars($mailq) . "</pre>";
} else {
    echo "✅ Mail queue is empty or accessible<br>";
}

// Test 4: Test sending a simple email
echo "<h3>Test 4: Send Test Email</h3>";
if (isset($_POST['send_test'])) {
    $to = 'sivanaltar@gmail.com';
    $subject = 'Test Email from sivanaltar.com';
    $message = 'This is a test email from your website to verify email sending configuration.';
    $headers = 'From: sivanaltar@gmail.com' . "\r\n" .
               'Reply-To: sivanaltar@gmail.com' . "\r\n" .
               'X-Mailer: PHP/' . phpversion();

    if (mail($to, $subject, $message, $headers)) {
        echo "✅ Test email sent successfully!<br>";
        echo "Check your email at sivanaltar@gmail.com<br>";
        echo "If you don't receive it, check your spam folder.<br>";
    } else {
        echo "❌ Failed to send test email<br>";
        echo "Check the mail log: <code>sudo tail -f /var/log/mail.log</code><br>";
    }
} else {
    echo '<form method="post">';
    echo '<input type="submit" name="send_test" value="Send Test Email">';
    echo '</form>';
}

// Test 5: Check PHP configuration
echo "<h3>Test 5: PHP Mail Configuration</h3>";
echo "sendmail_path: " . ini_get('sendmail_path') . "<br>";
echo "SMTP: " . ini_get('SMTP') . "<br>";
echo "smtp_port: " . ini_get('smtp_port') . "<br>";

// Test 6: Check Postfix configuration
echo "<h3>Test 6: Postfix Configuration</h3>";
$relayhost = shell_exec('postconf relayhost 2>/dev/null');
if ($relayhost) {
    echo "✅ Relay host configured: " . trim($relayhost) . "<br>";
} else {
    echo "❌ No relay host configured<br>";
}

echo "<hr>";
echo "<h3>Setup Instructions:</h3>";
echo "<ol>";
echo "<li><strong>Run the setup script:</strong><br>";
echo "<code>chmod +x setup_email_sending.sh && ./setup_email_sending.sh</code></li>";
echo "<li><strong>Get Gmail App Password:</strong><br>";
echo "Go to Google Account → Security → App passwords → Generate password for 'Mail'</li>";
echo "<li><strong>Update SMTP password:</strong><br>";
echo "<code>sudo nano /etc/postfix/sasl_passwd</code><br>";
echo "Replace 'your-app-password-here' with your actual Gmail App Password</li>";
echo "<li><strong>Apply changes:</strong><br>";
echo "<code>sudo postmap /etc/postfix/sasl_passwd && sudo systemctl restart postfix</code></li>";
echo "<li><strong>Test email sending:</strong><br>";
echo "Use this page to send a test email</li>";
echo "</ol>";

echo "<h3>Alternative: Use AWS SES</h3>";
echo "If you prefer to use AWS SES instead of Gmail:<br>";
echo "1. Set up AWS SES in your AWS console<br>";
echo "2. Get SMTP credentials from SES<br>";
echo "3. Update the relayhost in Postfix configuration<br>";
echo "4. Update the sasl_passwd file with SES credentials";
?>