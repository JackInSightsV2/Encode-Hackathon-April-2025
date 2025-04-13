FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_LINT_IGNORE_LINT=1
ENV NEXT_IGNORE_TS_ERRORS=1

# Build the application
RUN npm run build

# Create a new stage for production
FROM node:20-alpine AS runner
WORKDIR /app

# Copy standalone build
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Start the server
CMD ["node", "server.js"] 