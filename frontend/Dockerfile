#Only used in docker-compose.local.yml
FROM node:22-alpine AS dev
WORKDIR /app 
COPY package.json . 
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

#Will use everything below for CI/CD pipeline
FROM node:22-alpine AS builder
WORKDIR /app 
COPY package*.json . 
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 8080


