#This section is only used for local docker
FROM node:22-alpine AS dev
WORKDIR /app 
COPY package*.json .
COPY tsconfig*.json .
COPY drizzle*.config.ts .
RUN npm install
COPY . . 
CMD ["npm", "run", "dev"]

#Everything below here is used for our Gitlab CI + prod
FROM node:22-alpine AS builder
WORKDIR /app 
RUN apk add --no-cache python3 make g++
COPY package*.json .
RUN npm ci 
COPY tsconfig*.json .
COPY src ./src 
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS prod
WORKDIR /app
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package*.json ./
COPY --chown=node:node drizzle.config.ts ./
COPY --chown=node:node drizzle ./drizzle
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
