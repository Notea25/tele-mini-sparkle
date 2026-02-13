FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build  # Создает папку /dist

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD sh -c "sed -i 's/listen 80/listen '\"${PORT:-80}\"'/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"