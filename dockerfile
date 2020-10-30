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
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]