FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci || npm install
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 3003
CMD ["node", "dist/server.js"]
