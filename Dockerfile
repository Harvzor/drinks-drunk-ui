# BUILD IMAGE
FROM node:12 as build

WORKDIR /app

# Install npm packages
COPY ./package-lock.json ./
COPY ./package.json ./
RUN npm ci

COPY . .
RUN npm run build

# RUNTIME IMAGE
FROM nginx:alpine as production

WORKDIR /usr/share/nginx/html/

# Copy and replace files
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
COPY --from=build /app/dist ./
COPY env.sh ./env.sh
COPY .env ./.env

# CMD nginx -g 'daemon off;'

CMD ["/bin/sh", "-c", "./env.sh && nginx -g \"daemon off;\""]
