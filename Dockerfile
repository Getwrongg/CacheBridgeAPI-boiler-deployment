# Use official Node.js LTS
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy app source
COPY . .

# Set non-root user for security
USER node

# Expose port (from env)
EXPOSE ${PORT}

# Start app
CMD ["node", "app.js"]
