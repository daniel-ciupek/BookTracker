FROM composer:2.8 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --no-interaction

FROM php:8.3-fpm-alpine

RUN apk add --no-cache libpq-dev autoconf g++ make \
    && docker-php-ext-install pdo pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /tmp/pear /var/cache/apk/*

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/entrypoint.sh"]
