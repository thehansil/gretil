FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
RUN npm install -g typescript
COPY . .
RUN npx tsc
CMD ["node", "dist/index.js"]
