#!/bin/bash

# Check if a project path was provided
if [ -z "$PROJECT_PATH" ]; then
    echo "Error: PROJECT_PATH environment variable not set"
    echo "Usage: docker run -e PROJECT_PATH=/path/to/project -v /host/path:/workspace codebuff"
    exit 1
fi

# Strip any leading slashes from PROJECT_PATH to make it relative
RELATIVE_PATH="${PROJECT_PATH#/}"

# Debug output
echo "Original PROJECT_PATH: $PROJECT_PATH"
echo "Relative path: $RELATIVE_PATH"
echo "Workspace contents:"
ls -la /workspace

# Check if the project directory exists
if [ ! -d "/workspace/$RELATIVE_PATH" ]; then
    echo "Error: Project directory not found at /workspace/$RELATIVE_PATH"
    echo "Make sure you mounted the correct directory and provided the right PROJECT_PATH"
    exit 1
fi

# Create a working directory for this session
WORK_DIR="/tmp/codebuff_workspace/$RELATIVE_PATH"
mkdir -p "$(dirname "$WORK_DIR")"

# Copy project files to working directory
echo "Copying project files to working directory..."
cp -r "/workspace/$RELATIVE_PATH" "$WORK_DIR"

# Change to the working directory
cd "$WORK_DIR"

echo "Checking for codebuff updates..."
npm update -g codebuff
echo "Starting codebuff..."
exec codebuff
