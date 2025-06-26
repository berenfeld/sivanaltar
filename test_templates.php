<?php
// Test email templates
require_once 'api/mail/template_loader.php';

echo "<h2>Email Template Test</h2>";

try {
    $templateLoader = new TemplateLoader();

    // Test 1: Check available templates
    echo "<h3>Test 1: Available Templates</h3>";
    $templates = $templateLoader->getAvailableTemplates();
    if (!empty($templates)) {
        echo "✅ Found templates: " . implode(', ', $templates) . "<br>";
    } else {
        echo "❌ No templates found<br>";
    }

    // Test 2: Test contact template
    echo "<h3>Test 2: Contact Template</h3>";
    $contactData = [
        'name' => 'ישראל ישראלי',
        'email' => 'test@example.com',
        'date' => date('d/m/Y H:i'),
        'message' => 'זוהי הודעת בדיקה לבדיקת תבנית האימייל.'
    ];

    $contactTemplate = $templateLoader->loadTemplate('contact_template', $contactData);
    if ($contactTemplate) {
        echo "✅ Contact template loaded successfully<br>";
        echo "<details><summary>Preview Contact Template</summary>";
        echo "<div style='border: 1px solid #ccc; padding: 10px; margin: 10px 0;'>";
        echo $contactTemplate;
        echo "</div></details>";
    } else {
        echo "❌ Failed to load contact template<br>";
    }

    // Test 3: Test newsletter template
    echo "<h3>Test 3: Newsletter Template</h3>";
    $newsletterData = [
        'name' => 'ישראל ישראלי',
        'email' => 'test@example.com',
        'date' => date('d/m/Y H:i')
    ];

    $newsletterTemplate = $templateLoader->loadTemplate('newsletter_template', $newsletterData);
    if ($newsletterTemplate) {
        echo "✅ Newsletter template loaded successfully<br>";
        echo "<details><summary>Preview Newsletter Template</summary>";
        echo "<div style='border: 1px solid #ccc; padding: 10px; margin: 10px 0;'>";
        echo $newsletterTemplate;
        echo "</div></details>";
    } else {
        echo "❌ Failed to load newsletter template<br>";
    }

    // Test 4: Test template with missing data
    echo "<h3>Test 4: Template with Missing Data</h3>";
    $incompleteData = [
        'name' => 'ישראל ישראלי'
        // Missing email, date, message
    ];

    $incompleteTemplate = $templateLoader->loadTemplate('contact_template', $incompleteData);
    if ($incompleteTemplate) {
        echo "✅ Template loaded with missing data (placeholders remain)<br>";
        echo "<details><summary>Preview with Missing Data</summary>";
        echo "<div style='border: 1px solid #ccc; padding: 10px; margin: 10px 0;'>";
        echo $incompleteTemplate;
        echo "</div></details>";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<h3>Template System Features:</h3>";
echo "<ul>";
echo "<li>✅ Separate HTML template files</li>";
echo "<li>✅ Dynamic placeholder replacement</li>";
echo "<li>✅ RTL support for Hebrew</li>";
echo "<li>✅ Responsive email design</li>";
echo "<li>✅ Professional styling</li>";
echo "<li>✅ Easy to maintain and modify</li>";
echo "</ul>";

echo "<h3>Available Placeholders:</h3>";
echo "<ul>";
echo "<li><code>{{NAME}}</code> - User's name</li>";
echo "<li><code>{{EMAIL}}</code> - User's email</li>";
echo "<li><code>{{DATE}}</code> - Current date and time</li>";
echo "<li><code>{{MESSAGE}}</code> - User's message (contact form only)</li>";
echo "</ul>";
?>