docker build ./Keycloack --file ./Keycloack/Dockerfile --tag nuraly/keycloack
docker build  --build-arg DOMAIN=$HOST_DOMAIN ./Nginx --file ./Nginx/Dockerfile --tag nuraly/nginx 