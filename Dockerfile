FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install ALL dependencies (devDeps needed for build)
COPY package.json package-lock.json ./
RUN npm ci --cache .npm --prefer-offline

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Prune devDependencies for a smaller runtime image
RUN npm prune --production --cache .npm

# Switch to a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the application
CMD ["npm", "start"]
