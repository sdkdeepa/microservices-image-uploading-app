
FROM node:13-alpine as build
WORKDIR /app
COPY *.json /app/
RUN npm install -g ionic
RUN npm install
COPY ./ /app/
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/www/ /usr/share/nginx/html/

# # Build
# FROM beevelop/ionic:latest AS ionic

# # Create app directory
# WORKDIR /usr/src/app

# # Install app dependencies by copying
# # package.json and package-lock.json
# COPY package*.json ./

# # Install app dependencies
# RUN npm install -g ionic
# RUN npm ci

# # Bundle app source
# COPY . .

# #transpile our ts files to js
# RUN ionic build

# ## Run 
# FROM nginx:alpine

# #COPY www /usr/share/nginx/html
# COPY --from=ionic  /usr/src/app/www /usr/share/nginx/html

