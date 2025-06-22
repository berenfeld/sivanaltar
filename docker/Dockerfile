FROM ubuntu:24.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Jerusalem

# Update package list and install required packages
RUN apt-get update && apt-get install -y \
    apache2 \
    mysql-client \
    php \
    php-mysql \
    php-curl \
    php-gd \
    php-mbstring \
    php-xml \
    php-zip \
    php-json \
    php-opcache \
    libapache2-mod-php \
    curl \
    wget \
    unzip \
    git \
    nano \
    vim \
    procps \
    iputils-ping \
    net-tools \
    iproute2 \
    dnsutils \
    telnet \
    traceroute \
    && rm -rf /var/lib/apt/lists/*

# Configure Apache
RUN a2enmod rewrite
RUN a2enmod ssl
RUN a2enmod headers
RUN a2enmod deflate
RUN a2enmod expires

# Copy Apache configuration
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Copy PHP configuration
COPY docker/php.ini /etc/php/8.3/apache2/conf.d/99-custom.ini

# Copy startup script
COPY docker/start-services.sh /usr/local/bin/start-services.sh
RUN chmod +x /usr/local/bin/start-services.sh

# Expose ports
EXPOSE 80

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Copy .htaccess file
COPY docker/.htaccess /var/www/html/.htaccess

# Create proper .env file with Docker database credentials
RUN echo "DEPLOYMENT=Development" > /var/www/.env && \
    echo "GOOGLE_CLIENT_ID=737149879159-k8sksf67g8o8e769u1qvnjjmojv7i8sl.apps.googleusercontent.com" >> /var/www/.env && \
    echo "GOOGLE_CLIENT_SECRET=" >> /var/www/.env && \
    echo "DB_HOST=mysql" >> /var/www/.env && \
    echo "DB_USER=sivanaltar_user" >> /var/www/.env && \
    echo "DB_PASS=sivanaltar_password" >> /var/www/.env && \
    echo "DB_NAME=sivanaltar_db" >> /var/www/.env && \
    echo "SITE_URL=http://localhost:8000" >> /var/www/.env && \
    echo "INIT_DB_TOKEN=your_init_token_here" >> /var/www/.env && \
    echo "ADMIN_EMAIL=berenfeldran@gmail.com" >> /var/www/.env

# Set proper permissions
RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 /var/www

# Start services
CMD ["/usr/local/bin/start-services.sh"]