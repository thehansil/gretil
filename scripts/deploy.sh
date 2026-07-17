#!/bin/bash
set -euo pipefail

IMAGE_NAME="hansil/gretil"
CONTAINER_NAME="gretil"
NEW_CONTAINER_NAME="${CONTAINER_NAME}-new"

echo "Pulling latest image..."
docker pull "$IMAGE_NAME:latest"

echo "Removing any previous failed deployment..."
docker rm -f "$NEW_CONTAINER_NAME" 2>/dev/null || true

echo "Starting new container..."
docker run \
    -d \
    --name "$NEW_CONTAINER_NAME" \
    --restart unless-stopped \
    --network naswork \
    --env-file /mnt/user/appdata/gretil/.env \
    "$IMAGE_NAME:latest"

echo "Waiting for container to start..."
sleep 5

echo "Checking container status..."
if [ "$(docker inspect -f '{{.State.Running}}' "$NEW_CONTAINER_NAME")" != "true" ]; then
    echo "New container failed to start!"
    echo "Container logs:"
    docker logs "$NEW_CONTAINER_NAME"
    docker rm -f "$NEW_CONTAINER_NAME"
    exit 1
fi

echo "Stopping old container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true

echo "Removing old container..."
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Renaming new container..."
docker rename "$NEW_CONTAINER_NAME" "$CONTAINER_NAME"

echo "Cleaning unused images..."
docker image prune -f

echo "Deployment complete!"