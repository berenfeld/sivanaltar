#!/bin/bash

# Postfix Configuration Script for Ubuntu 24
# This script configures Postfix for email sending

echo "Configuring Postfix for email sending..."

# Backup original configuration
sudo cp /etc/postfix/main.cf /etc/postfix/main.cf.backup

# Configure Postfix main.cf
sudo tee -a /etc/postfix/main.cf > /dev/null <<EOF

# Email Configuration
myhostname = sivanaltar.com
mydomain = sivanaltar.com
myorigin = \$mydomain
inet_interfaces = all
inet_protocols = ipv4
mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain
mynetworks = 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
home_mailbox = Maildir/
smtpd_banner = \$myhostname ESMTP \$mail_name (Ubuntu)
biff = no
append_dot_mydomain = no
readme_directory = no
compatibility_level = 2

# TLS Configuration
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls = yes
smtpd_tls_session_cache_database = btree:\${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:\${data_directory}/smtp_scache

# Authentication
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = \$myhostname
smtpd_recipient_restrictions = permit_sasl_authenticated, permit_mynetworks, reject_unauth_destination
EOF

# Restart Postfix
sudo systemctl restart postfix
sudo systemctl enable postfix

echo "Postfix configuration completed!"
echo "You may need to configure your domain's DNS records for proper email delivery."