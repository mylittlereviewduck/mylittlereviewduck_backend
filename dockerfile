FROM node

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["sh", "-c", "sleep 30 && node dist/src/main.js"]
