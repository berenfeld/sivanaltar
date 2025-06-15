# Sivan's website
--------------------

## Development

### setup .env

see `.env.dev`

### Running mysql serer locally

docker run --name sivans-mysql \
  -e MYSQL_ROOT_PASSWORD=dosu20oLXQ \
  -e MYSQL_DATABASE=if0_39000738_sivanaltar \
  -e MYSQL_USER=if0_39000738 \
  -e MYSQL_PASSWORD=dosu20oLXQ \
  -p 3306:3306 \
  -d mariadb:10.6

### Running phpmyadmin locally

docker run --name sivans-phpmyadmin -d --link sivans-mysql:db -p 8080:80 phpmyadmin/phpmyadmin

## Production

### PHP my admin

https://php-myadmin.net/db_structure.php?db=if0_39000738_sivanaltar