FROM node:20-alpine AS dev
WORKDIR /app 
COPY package*.json .
COPY tsconfig*.json .
COPY drizzle*.config.ts .
RUN npm install
COPY . . 
CMD ["npm", "run", "dev"]


FROM node:20-alpine AS builder
WORKDIR /app 
RUN apk add --no-cache python3 make g++
COPY package*.json .
RUN npm ci 
COPY tsconfig*.json .
COPY src ./src 
RUN npm run build 

FROM node:20-alpine AS prod 
WORKDIR /app 
COPY package*.json .
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
