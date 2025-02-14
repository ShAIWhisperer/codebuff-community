#!/bin/bash

# Enable error handling
set -e

# Always enable command printing for debugging
set -x

# Add timestamp to logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

debug() {
    log "DEBUG: $*"
}

error() {
    log "ERROR: $*"
    exit 1
}

# Check if a project path was provided
if [ -z "$PROJECT_PATH" ]; then
    error "PROJECT_PATH environment variable is required"
fi

# Strip any leading slashes from PROJECT_PATH to make it relative
RELATIVE_PATH="${PROJECT_PATH#/}"

# Set up communication directory
COMM_DIR="/workspace/$RELATIVE_PATH/.codebuff/comm"
debug "Setting up comm directory at: $COMM_DIR"
mkdir -p "$COMM_DIR" || error "Failed to create $COMM_DIR directory"
chmod 777 "$COMM_DIR" || error "Failed to set permissions on $COMM_DIR"

# Create communication files with proper permissions
touch "$COMM_DIR/messages.txt" "$COMM_DIR/responses.txt" || error "Failed to create communication files"
chmod 666 "$COMM_DIR/messages.txt" "$COMM_DIR/responses.txt" || error "Failed to set permissions on communication files"

# Create a working directory for this session
WORK_DIR="/tmp/codebuff_workspace/$RELATIVE_PATH"
mkdir -p "$WORK_DIR" || error "Failed to create working directory"

# Copy project files to working directory with error handling
debug "Copying project files to working directory..."
cd "/workspace/$RELATIVE_PATH" || error "Failed to change to source directory"

# Copy files individually
for file in .gitignore README.md eslint.config.js index.html knowledge.md package.json pnpm-lock.yaml tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts; do
    if [ -f "$file" ]; then
        debug "Copying file: $file"
        cp "$file" "$WORK_DIR/" || log "Failed to copy $file"
    fi
done

# Copy directories individually
for dir in public src; do
    if [ -d "$dir" ]; then
        debug "Copying directory: $dir"
        cp -r "$dir" "$WORK_DIR/" || log "Failed to copy $dir"
    fi
done

# Change to the working directory
cd "$WORK_DIR" || error "Failed to change to working directory"

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    debug "Setting up npm..."
    source /root/.bashrc
    log "Installing dependencies..."
    npm install --silent || error "Failed to install dependencies"
fi

# Set up credentials directory in container's home directory
CREDS_DIR="$HOME/.config/manicode"
mkdir -p "$CREDS_DIR" || error "Failed to create credentials directory"
if [ -f "/workspace/.config/manicode/credentials.json" ]; then
    if ! cp "/workspace/.config/manicode/credentials.json" "$CREDS_DIR/credentials.json"; then
        debug "Warning: Failed to copy credentials file, continuing without credentials"
    else
        debug "Credentials copied from host to container's home directory"
    fi
fi

# Verify codebuff is available and in PATH
PATH="/usr/local/bin:$PATH"
export PATH

which codebuff || error "codebuff command not found in PATH"
debug "Found codebuff at: $(which codebuff)"

# Start codebuff wrapper
log "Starting codebuff with communication layer..."
exec /codebuff-wrapper.sh
