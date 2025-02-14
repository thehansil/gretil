FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
RUN npm install -g typescript
COPY . .
RUN npx tsc
RUN node dist/register-commands.js
CMD ["node", "dist/index.js"]
