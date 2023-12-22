FROM openresty/openresty:alpine-fat
COPY ./Nginx/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY ./Nginx/main.lua ~/lua/main.lua
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-openidc
