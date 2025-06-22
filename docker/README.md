# Sivan Altar Website - Docker Setup

This Docker setup provides a complete development environment for the Sivan Altar website with Apache, MySQL, and PHP.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

1. **Navigate to the docker directory:**
   ```bash
   cd docker
   ```

2. **Build and start the container:**
   ```bash
   docker-compose up --build
   ```

3. **Access the website:**
   - Website: http://localhost:8000

## Container Details

### Services
- **Apache**: Web server running on port 80 (mapped to 8000)
- **MySQL**: Database server running on port 3306
- **PHP**: PHP 8.3 with common extensions

### Database Configuration
- **Database Name**: sivanaltar_db
- **Username**: sivanaltar_user
- **Password**: sivanaltar_password
- **Root Password**: sivanaltar_root_password

### Volumes

## Configuration Files

### Apache Configuration (`apache.conf`)
- Virtual host configuration
- Security headers
- Compression settings
- Cache control for development
- File handling for PHP

### PHP Configuration (`php.ini`)
- File upload limits (50MB)
- Memory and execution time limits
- Error reporting settings
- Session security
- OpCache optimization

### MySQL Configuration (`mysql.cnf`)
- Character set (UTF8MB4)
- InnoDB optimization
- Connection settings
- Query cache
- Logging configuration

### .htaccess Configuration (`.htaccess`)
- URL rewriting rules
- Security headers
- Cache control for development and static assets
- File access restrictions
- Compression settings
- Character encoding

### Startup Script (`start-services.sh`)
- MySQL initialization
- Database and user creation
- Permission setup
- Service startup coordination

### Environment Configuration (`env.example`)
- Database connection settings
- Application configuration
- Google Sign-In settings
- File upload limits
- Session and logging configuration

## Useful Commands

### Start the container
```bash
docker-compose up -d
```

### Stop the container
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Access container shell
```bash
docker exec -it sivanaltar-website bash
```

### Access MySQL
```bash
docker exec -it sivanaltar-website mysql -u sivanaltar_user -p sivanaltar_db
```

## Development

### Making Changes
1. Make your changes to the PHP files
2. The changes will be reflected immediately due to volume mounting
3. If you modify the Dockerfile or configuration files, rebuild with:
   ```bash
   docker-compose up --build
   ```

### Database Setup
The database and user are automatically created when the container starts. If you need to run the database initialization script:

```bash
docker exec -it sivanaltar-website php /var/www/html/init_db.php
```

## Troubleshooting

### Container won't start
Check the logs:
```bash
docker-compose logs
```

### Database connection issues
1. Ensure the container is running: `docker-compose ps`
2. Check MySQL is running: `docker exec -it sivanaltar-website service mysql status`
3. Verify database exists: `docker exec -it sivanaltar-website mysql -e "SHOW DATABASES;"`

### Permission issues
If you encounter permission issues with uploads:
```bash
docker exec -it sivanaltar-website chown -R www-data:www-data /var/www/html/uploads
```

### Configuration changes
If you modify any configuration files (apache.conf, php.ini, mysql.cnf), rebuild the container:
```bash
docker-compose down
docker-compose up --build
```

## Production Considerations

This setup is designed for development and testing. For production:

1. Use environment variables for sensitive data
2. Implement proper SSL/TLS certificates
3. Configure proper backup strategies
4. Use a reverse proxy (nginx)
5. Implement proper security measures
6. Disable error reporting in php.ini
7. Configure proper logging levels

## File Structure

```
docker/
├── Dockerfile              # Main container definition
├── docker-compose.yml      # Container orchestration
├── apache.conf            # Apache virtual host configuration
├── php.ini                # PHP configuration
├── mysql.cnf              # MySQL configuration
├── .htaccess              # Apache .htaccess configuration
├── start-services.sh      # Service startup script
├── env.example            # Environment configuration template
├── .dockerignore          # Docker build exclusions
└── README.md              # This file
```