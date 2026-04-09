FROM node:20-alpine
WORKDIR /app 
COPY package*.json .
COPY tsconfig*.json .
COPY drizzle*.config.ts .
RUN npm install
COPY . . 
EXPOSE 3000
EXPOSE 3001
CMD ["sh", "-c", "sleep 5 && npx drizzle-kit push && npm run dev"]
