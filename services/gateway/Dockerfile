FROM openresty/openresty:alpine-fat

RUN apk add --no-cache gettext

WORKDIR /usr/local/openresty/nginx

# Copy nginx config as template (contains ${MAIN_DOMAIN})
COPY Nginx/nginx-fully.conf /usr/local/openresty/nginx/conf/nginx.conf.template
COPY Nginx/config /usr/local/openresty/nginx/conf/config
COPY Nginx/locations /usr/local/openresty/nginx/conf/locations

# Copy Lua scripts to OpenResty's lualib directory where they can be accessed by worker processes
COPY Nginx/lua-lib/main.lua /usr/local/openresty/lualib/main.lua
COPY Nginx/lua-lib/userinfo.lua /usr/local/openresty/lualib/userinfo.lua

# Install lua-resty-openidc and its dependencies (including lua-resty-jwt)
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-openidc

# Create logs directory
RUN mkdir -p logs

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
