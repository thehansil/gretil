FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
RUN npx tsc
CMD ["node", "dist/index.js"]
