#!/bin/bash
set -euo pipefail

IMAGE_NAME="hansil/gretil"
CONTAINER_NAME="gretil"

echo "Pulling latest image..."
docker pull "$IMAGE_NAME:latest"

echo "Stopping existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true

echo "Removing old container..."
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Starting new container..."
docker run \
    -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    --network naswork \
    --env-file /mnt/user/appdata/gretil/.env \
    "$IMAGE_NAME:latest"

echo "Cleaning dangling images..."
docker image prune -f

echo "Deployment complete!"