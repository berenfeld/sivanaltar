#!/bin/bash

docker-compose down

docker-compose up --build -d

echo "Services started! Check status with: docker-compose ps"