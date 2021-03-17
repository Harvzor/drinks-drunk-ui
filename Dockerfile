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

# Copy and replace files
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
COPY --from=build /app/dist /usr/share/nginx/html/

CMD nginx -g 'daemon off;'
