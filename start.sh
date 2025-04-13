#!/bin/bash

echo "Starting AI Agent Marketplace services..."
echo "This will run both the frontend and backend services."
echo "- Frontend: http://localhost:3000"
echo "- Auth Backend: http://localhost:8000"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and Docker Compose first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start the services
echo "Building and starting services..."
docker compose up --build -d

echo ""
echo "Services are starting in the background. Use the following commands to view logs:"
echo "- View all logs: docker compose logs -f"
echo "- View frontend logs: docker compose logs -f frontend"
echo "- View auth service logs: docker compose logs -f auth-service"
echo ""
echo "To stop all services: docker compose down" 