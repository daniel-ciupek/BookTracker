FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --ignore-scripts
COPY frontend/ .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
