<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>סיון אלטרוביץ - מאמנת רגשית בשיטת סאטיה</title>

<!-- Basic Meta -->
<meta name="description" content="אימון וטיפול בגישת סאטיה לשחרור ממיינד ורגשות מעכבים ויצירת חיים מלאי משמעות, אהבה וריפוי">
<meta name="keywords" content="סיון אלטרוביץ, מאמנת סאטיה, טיפול סאטיה, אימון אישי, התפתחות אישית">

<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:locale" content="he_IL">
<meta property="og:type" content="website">
<meta property="og:title" content="סיון אלטרוביץ - מאמנת סאטיה">
<meta property="og:description" content="אימון וטיפול בגישת סאטיה לשחרור ממיינד ורגשות מעכבים">
<meta property="og:url" content="https://sivanaltar.com/">
<meta property="og:site_name" content="סיון אלטרוביץ">
<meta property="og:image" content="https://sivanaltar.com/images/logo.jpeg">
<meta property="og:image:secure_url" content="https://sivanaltar.com/images/logo.jpeg">
<meta property="og:image:width" content="1630">
<meta property="og:image:height" content="340">
<meta property="og:image:alt" content="סיון אלטרוביץ - מאמנת סאטיה">
<meta property="og:image:type" content="image/jpeg">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="סיון אלטרוביץ - מאמנת סאטיה">
<meta name="twitter:description" content="אימון וטיפול בגישת סאטיה לשחרור ממיינד ורגשות מעכבים">
<meta name="twitter:image" content="https://sivanaltar.com/images/logo.jpeg">

<!-- Other head elements -->
<link rel="icon" type="image/png" href="images/favicon.png">

<!-- Meta tags, title, etc. -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Add other meta tags as needed -->

<!-- Always include these base styles -->
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/nav.css">
<link rel="stylesheet" href="css/footer.css">

<!-- Page-specific CSS -->
<?php
$current_page = basename($_SERVER['PHP_SELF']);
switch($current_page) {
    case 'index.php':
        echo '<link rel="stylesheet" href="css/hero.css">';
        echo '<link rel="stylesheet" href="css/sections.css">';
        break;
    case 'blog.php':
        echo '<link rel="stylesheet" href="css/blog.css">';
        break;
    case 'gallery.php':
        echo '<link rel="stylesheet" href="css/gallery.css">';
        break;
    case 'contact.php':
        echo '<link rel="stylesheet" href="css/contact.css">';
        break;
    case 'thank-you.php':
        echo '<link rel="stylesheet" href="css/thank-you.css">';
        break;
    default:
        // For any other page, include sections.css as a fallback
        echo '<link rel="stylesheet" href="css/sections.css">';
}
?>

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Oswald:wght@300;400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&display=swap" rel="stylesheet">

<!-- Font Awesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">