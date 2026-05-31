#!/bin/sh
set -e

# Wait for DB to be ready (optional but good practice, though depends_on with healthcheck handles this)
php artisan migrate --force --seed || true

php artisan config:cache
php artisan route:cache

exec php-fpm
