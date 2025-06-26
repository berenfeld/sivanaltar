<?php
// Security Headers for all pages
// This file should be included at the very beginning of all pages

// Prevent MIME type sniffing
header('X-Content-Type-Options: nosniff');

// Prevent clickjacking
header('X-Frame-Options: DENY');

// Enable XSS protection
header('X-XSS-Protection: 1; mode=block');

// Set referrer policy
header('Referrer-Policy: strict-origin-when-cross-origin');

// Content Security Policy
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://accounts.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com; frame-src https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'");

// Permissions Policy
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

// Strict Transport Security (uncomment for HTTPS)
// header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');

// Cache control for HTML pages
if (strpos($_SERVER['REQUEST_URI'], '.php') !== false || strpos($_SERVER['REQUEST_URI'], '.html') !== false) {
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
}

// Set character encoding
header('Content-Type: text/html; charset=utf-8');
?>
