FROM node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3002

COPY package*.json ./
RUN npm ci --omit=dev

COPY openapi.yaml ./
COPY src ./src

USER node

EXPOSE 3002

CMD ["node", "src/index.js"]
