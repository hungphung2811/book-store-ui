FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite nhúng VITE_* vào bundle lúc build, đổi giá trị thì phải build lại image
ARG VITE_SHOP_CODE=demo
ARG VITE_API_BASE=
ENV VITE_SHOP_CODE=$VITE_SHOP_CODE VITE_API_BASE=$VITE_API_BASE
RUN npx vite build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
