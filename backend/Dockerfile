FROM node:20-alpine
WORKDIR /app 
COPY package*.json .
COPY tsconfig*.json .
COPY drizzle*.config.ts .
RUN npm install
COPY . . 
CMD ["npm", "run", "dev"]
