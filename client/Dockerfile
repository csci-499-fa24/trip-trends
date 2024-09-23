# Pull base image from Node official image from dockerhub, version 22 of node
FROM node:22-alpine3.19

# Create and cd to app directory
WORKDIR /app

# Copy the list of dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all client files in the container
COPY . .

# Open the port to React
EXPOSE 3000

# Compiles app 
RUN npm run build

# Run app
CMD ["npm", "start"]