#!/usr/bin/env bash
set -e

# ------------------------------------------------------------------------------
#  start-codebuff.sh
#  A helper script to guide you through setting up and running Codebuff in Docker
# ------------------------------------------------------------------------------

# ANSI color codes - using simpler codes for better compatibility
GRAY="$(tput setaf 8 2>/dev/null || echo '\033[90m')"  # Fallback to 90m if tput not available
RESET="$(tput sgr0 2>/dev/null || echo '\033[0m')"
GREEN="$(tput setaf 2 2>/dev/null || echo '\033[32m')"
YELLOW="$(tput setaf 3 2>/dev/null || echo '\033[33m')"
RED="$(tput setaf 1 2>/dev/null || echo '\033[31m')"

# ------------------------- Check if Docker Installed ---------------------------
if ! command -v docker &> /dev/null
then
  echo "Docker is not installed or not in your PATH."
  echo "Visit Docker installation docs for more info:"
  echo "  Linux:   https://docs.docker.com/engine/install/"
  echo "  macOS:   https://docs.docker.com/desktop/install/mac-install/"
  echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
  exit 1
fi

# ------------------------- Prompt for Docker Build -----------------------------
echo "Checking if the 'codebuff' image exists..."
IMAGE_EXISTS=$(docker images --format "{{.Repository}}" | grep "^codebuff$" || true)

if [[ -z "$IMAGE_EXISTS" ]]; then
  printf "No 'codebuff' image found. Would you like to build it now? [%sY%s/n] " "${GRAY}" "${RESET}"
  read -r BUILD_CHOICE
  if [[ -z "$BUILD_CHOICE" || "$BUILD_CHOICE" =~ ^[Yy]$ ]]; then
    echo "Building Docker image 'codebuff' (this may take a while)..."
    docker build -t codebuff .
    echo "Docker image 'codebuff' built successfully."
  else
    echo "Cannot proceed without 'codebuff' image. Exiting."
    exit 1
  fi
else
  echo "Docker image 'codebuff' already exists."
fi

# ------------------------- Get Project Path ------------------------------------
DEFAULT_PATH="$(pwd)"
printf "Enter the project path (%s%s%s): " "${GRAY}" "${DEFAULT_PATH}" "${RESET}"
read -r SELECTED_PROJECT_PATH

if [ -z "$SELECTED_PROJECT_PATH" ]; then
  SELECTED_PROJECT_PATH="$DEFAULT_PATH"
fi

# Validate that the selected path exists
if [ ! -d "$SELECTED_PROJECT_PATH" ]; then
  printf "%sError: Directory does not exist: %s%s\n" "${RED}" "$SELECTED_PROJECT_PATH" "${RESET}"
  exit 1
fi

# Convert to absolute path
SELECTED_PROJECT_PATH=$(cd "$SELECTED_PROJECT_PATH" && pwd)

# ------------------------- Get Host Base Directory -----------------------------
# This is the path you want to mount on the host side. By default, use parent of project dir
HOST_MOUNT_DIR=$(dirname "$SELECTED_PROJECT_PATH")
printf "Enter the host path (%s%s%s): " "${GRAY}" "${HOST_MOUNT_DIR}" "${RESET}"
read -r NEW_MOUNT

if [ -n "$NEW_MOUNT" ]; then
  # Validate that the new mount directory exists
  if [ ! -d "$NEW_MOUNT" ]; then
    printf "%sError: Directory does not exist: %s%s\n" "${RED}" "$NEW_MOUNT" "${RESET}"
    exit 1
  fi
  HOST_MOUNT_DIR="$NEW_MOUNT"
fi

# Convert to absolute path and normalize
HOST_MOUNT_DIR=$(cd "$HOST_MOUNT_DIR" && pwd)

# Get the relative path for PROJECT_PATH
if [[ "$SELECTED_PROJECT_PATH" = /* ]]; then
  # If absolute path provided, make it relative to HOST_MOUNT_DIR
  if [[ "$SELECTED_PROJECT_PATH" == "$HOST_MOUNT_DIR"* ]]; then
    # Path is under HOST_MOUNT_DIR, so we can make it relative
    RELATIVE_PATH="${SELECTED_PROJECT_PATH#$HOST_MOUNT_DIR/}"
    # If empty after stripping, use "." for current directory
    if [ -z "$RELATIVE_PATH" ]; then
      RELATIVE_PATH="."
    fi
  else
    printf "%sError: Selected project path must be within the mounted directory\n"
    echo "Project path: $SELECTED_PROJECT_PATH"
    echo "Mount directory: $HOST_MOUNT_DIR%s\n" "${RESET}"
    exit 1
  fi
else
  # For relative paths, just use as-is
  RELATIVE_PATH="$SELECTED_PROJECT_PATH"
fi

# Remove any double slashes, trailing slashes, and leading slashes
RELATIVE_PATH=$(echo "$RELATIVE_PATH" | sed 's#^/##' | sed 's#/\+#/#g' | sed 's#/$##')

# Debug output
echo
printf "%sPath resolution:%s\n" "${GREEN}" "${RESET}"
echo "  Host mount dir: $HOST_MOUNT_DIR"
echo "  Selected path: $SELECTED_PROJECT_PATH"
echo "  Resolved to: $RELATIVE_PATH"
echo

# ------------------------- Show Command & Prompt to Run -----------------------
DOCKER_CMD="docker run -it --rm -e PROJECT_PATH=$RELATIVE_PATH -v \"$HOST_MOUNT_DIR:/workspace\" codebuff"

printf "%sHere's the Docker command that will be run:%s\n" "${GREEN}" "${RESET}"
echo
echo "   $DOCKER_CMD"
echo
printf "%sNotes:%s\n" "${YELLOW}" "${RESET}"
echo " • '-it' runs Docker interactively with a TTY so you can see output."
echo " • '--rm' removes the container after exit."
echo " • '-e PROJECT_PATH=...' sets the folder name to open (within /workspace)."
echo " • '-v \"$HOST_MOUNT_DIR:/workspace\"' mounts your host project directory at /workspace."
echo

printf "Would you like to run this command now? [%sY%s/n] " "${GRAY}" "${RESET}"
read -r RUN_CHOICE

if [[ -z "$RUN_CHOICE" || "$RUN_CHOICE" =~ ^[Yy]$ ]]; then
    echo "Starting Codebuff in Docker..."
    echo
    eval "$DOCKER_CMD"
else
    echo "You can run this command later by copying and pasting it."
    echo "Remember to replace $RELATIVE_PATH with your actual project folder name if different."
fi

exit 0