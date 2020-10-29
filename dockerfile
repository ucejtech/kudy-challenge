# build base image
FROM node:latest as build-stage

# set working directory
WORKDIR /app

# install app dependencies and run build
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

# production base image
FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf