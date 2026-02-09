#!/bin/sh
# Substitute MAIN_DOMAIN env var in nginx config (default to localhost)
export MAIN_DOMAIN=${MAIN_DOMAIN:-localhost}
envsubst '$MAIN_DOMAIN' < /usr/local/openresty/nginx/conf/nginx.conf.template > /usr/local/openresty/nginx/conf/nginx.conf
exec /usr/local/openresty/bin/openresty -g 'daemon off;'
