# Pull base image from Node official image from dockerhub, version 22 of node
FROM node:22-alpine3.19

# Create and cd to app directory
WORKDIR /app

# Copy the list of dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all server files in the container
COPY . .

# Open the port for the Express server
EXPOSE 8080

# Run Express 
CMD ["npm", "run", "start"]