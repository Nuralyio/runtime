FROM node:22-alpine AS ui-build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 4321
CMD ["npm", "run", "server"]