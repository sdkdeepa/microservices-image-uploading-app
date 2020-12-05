# Use NodeJS base image
FROM node:13

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

#This will used only if i need them during the building of the image. eg i might need the value during a bash script run
#the actual env variables to be used by the code will bet set in docker runtime or k8s runtime for containers
#ARG SOME_VALUE
#ENV SOME_VALUE=$SOME_VALUE

#Use npm ci when running in continuous integration, 
#or if you want to install dependencies without modifying the package-lock.json
#it is faster than regular npm i and mre reliable
RUN npm ci

# Bundle app source
COPY . .

# Bind the port that the image will run on
EXPOSE 8080

# Define the Docker image's behavior at runtime
CMD [ "npm", "run", "prod" ]