FROM node:latest AS ui-build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 4321

CMD ["npm", "start"]