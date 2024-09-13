FROM node:21

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
USER node
RUN npm install

COPY --chown=node:node . .

RUN npx prisma generate

RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]