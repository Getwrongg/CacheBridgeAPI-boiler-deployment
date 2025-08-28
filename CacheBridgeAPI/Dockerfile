FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

USER node
EXPOSE ${PORT}

CMD ["node", "app.js"]
