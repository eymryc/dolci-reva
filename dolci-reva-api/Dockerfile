# =============================================================================
# Dolci Rêva — runtime PHP-FPM 8.3 (extensions + Composer)
# PHP 8.3 requis par maennchen/zipstream-php (Spatie Media Library).
# Le code applicatif est monté depuis l'hôte via docker-compose.
# =============================================================================
FROM php:8.3-fpm-bookworm

ENV COMPOSER_HOME=/tmp/composer \
    COMPOSER_CACHE_DIR=/tmp/composer/cache \
    COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip curl \
        libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
        libzip-dev libicu-dev libonig-dev \
        libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /tmp/composer/cache \
    && chown -R www-data:www-data /tmp/composer

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-dolci.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-dolci.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p /var/www/html \
    && chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html

# php-fpm workers = www-data (www.conf) ; rester root pour composer / chown volumes
USER root

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm", "-F"]
