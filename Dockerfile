# Use official Node.js LTS lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package metadata and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start command
CMD ["npm", "start"]
