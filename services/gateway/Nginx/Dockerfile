FROM openresty/openresty:alpine-fat
ARG DOMAIN
RUN echo "$DOMAIN"

COPY ./config /usr/local/openresty/nginx/conf/config
COPY ./locations /usr/local/openresty/nginx/conf/locations
COPY ./nginx-default.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY  ./replace-domain.sh  .
RUN  ./replace-domain.sh  /usr/local/openresty/nginx/conf/nginx.conf localhost "${DOMAIN}"
COPY ./errors /usr/local/openresty/nginx/conf/errors
COPY ./lua-lib/main.lua /usr/local/openresty/lualib/main.lua
COPY ./lua-lib/userinfo.lua /usr/local/openresty/lualib/userinfo.lua
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-openidc
