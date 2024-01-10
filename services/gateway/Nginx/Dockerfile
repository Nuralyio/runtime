FROM openresty/openresty:alpine-fat
ARG DOMAIN
RUN echo "$DOMAIN"

COPY ./nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY  ./replace-domain.sh  .
RUN  ./replace-domain.sh  /usr/local/openresty/nginx/conf/nginx.conf localhost "${DOMAIN}"
COPY ./main.lua ~/lua/main.lua
RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-openidc
