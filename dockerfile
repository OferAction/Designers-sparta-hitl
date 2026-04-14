# Multi-stage build for React application

# Stage 1: Build the React application
FROM node:18-slim AS build

# Set working directory
WORKDIR /app

# Add package files and install dependencies
# Splitting these steps allows better caching
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline


# Copy source code
COPY . .

# Explicitly install Rollup with needed architecture support
RUN npm install rollup @rollup/rollup-linux-x64-gnu --no-save

# Build the application
ARG ENVIRONMENT=development
ARG VITE_API_BASE_URL
ARG VITE_API_FLOW_STORAGE_URL
ARG VITE_NOTIFICATION_HUB_URL
ARG VITE_AZURE_REDIRECT_URI
ARG VITE_AZURE_CLIENT_ID
ARG VITE_AZURE_TENANT_ID
ARG VITE_AZURE_SCOPE
ARG VITE_GENONE_BASE_URL
ARG VITE_COLLAB_WS
ARG VITE_MODE=development

ENV REACT_APP_ENVIRONMENT=${ENVIRONMENT}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_FLOW_STORAGE_URL=${VITE_API_FLOW_STORAGE_URL}
ENV VITE_NOTIFICATION_HUB_URL=${VITE_NOTIFICATION_HUB_URL}
ENV VITE_AZURE_REDIRECT_URI=${VITE_AZURE_REDIRECT_URI}
ENV VITE_AZURE_CLIENT_ID=${VITE_AZURE_CLIENT_ID}
ENV VITE_AZURE_TENANT_ID=${VITE_AZURE_TENANT_ID}
ENV VITE_AZURE_SCOPE=${VITE_AZURE_SCOPE}
ENV VITE_GENONE_BASE_URL=${VITE_GENONE_BASE_URL}
ENV VITE_COLLAB_WS=${VITE_COLLAB_WS}
ENV VITE_MODE=${VITE_MODE}
ENV NODE_OPTIONS="--max_old_space_size=4096"

RUN npm run build

# Stage 2: Create the production image
FROM nginx:alpine

# Update packages to fix libxml2 vulnerabilities
RUN apk update && apk upgrade libxml2

# Copy custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add healthcheck
# HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
