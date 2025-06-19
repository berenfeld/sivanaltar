#!/bin/bash

# Simple Email Sending Setup for Ubuntu 24
# This script configures the system to send emails only (no receiving)

echo "Setting up email sending capability..."

# Install basic mail utilities
sudo apt update
sudo apt install -y mailutils

# Configure Postfix for sending only
sudo tee /etc/postfix/main.cf > /dev/null <<EOF
# Basic Postfix configuration for sending emails only
myhostname = sivanaltar.com
mydomain = sivanaltar.com
myorigin = \$mydomain
inet_interfaces = loopback-only
inet_protocols = ipv4
mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain
mynetworks = 127.0.0.0/8
home_mailbox = Maildir/
smtpd_banner = \$myhostname ESMTP \$mail_name (Ubuntu)
biff = no
append_dot_mydomain = no
readme_directory = no
compatibility_level = 2

# Relay configuration for Gmail SMTP
relayhost = [smtp.gmail.com]:587
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_sasl_mechanism_filter = plain, login
smtp_tls_security_level = encrypt
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
EOF

# Create SMTP password file (you'll need to edit this with your Gmail App Password)
sudo tee /etc/postfix/sasl_passwd > /dev/null <<EOF
[smtp.gmail.com]:587 sivanaltar@gmail.com:your-app-password-here
EOF

# Set proper permissions
sudo chmod 600 /etc/postfix/sasl_passwd

# Create hash database
sudo postmap /etc/postfix/sasl_passwd

# Restart Postfix
sudo systemctl restart postfix
sudo systemctl enable postfix

echo "Email sending setup completed!"
echo ""
echo "IMPORTANT: You need to edit /etc/postfix/sasl_passwd and replace 'your-app-password-here'"
echo "with your actual Gmail App Password."
echo ""
echo "To get a Gmail App Password:"
echo "1. Go to your Google Account settings"
echo "2. Enable 2-Step Verification if not already enabled"
echo "3. Go to Security > App passwords"
echo "4. Generate a new app password for 'Mail'"
echo "5. Use that password in the sasl_passwd file"
echo ""
echo "After updating the password, run: sudo postmap /etc/postfix/sasl_passwd && sudo systemctl restart postfix"