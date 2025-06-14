# Sivan's website
--------------------

## Development

### setup .env

### Running mysql serer locally


docker run --name sivans-mysql \
  -e MYSQL_ROOT_PASSWORD=dosu20oLXQ \
  -e MYSQL_DATABASE=if0_39000738_sivanaltar \
  -e MYSQL_USER=if0_39000738 \
  -e MYSQL_PASSWORD=dosu20oLXQ \
  -p 3306:3306 \
  -d mariadb:10.6
