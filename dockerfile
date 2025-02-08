FROM node

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["node","dist/src/main.js"] 