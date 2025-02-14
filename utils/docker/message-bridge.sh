#!/bin/bash
set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

debug() {
    if [ "${DEBUG:-false}" = "true" ]; then
        log "DEBUG: $*"
    fi
}

cleanup() {
    log "Cleaning up..."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Get the project directory from the command line argument
if [ -z "$1" ]; then
    echo "Usage: $0 <project-path>"
    exit 1
fi

PROJECT_DIR="$1"
COMM_DIR="$PROJECT_DIR/.codebuff/comm"
debug "Using comm directory: $COMM_DIR"

# Wait for comm directory and files to exist
log "Waiting for comm directory and files..."
while [ ! -f "$COMM_DIR/responses.txt" ]; do
    sleep 0.1
done

# Main loop - tail the responses file
log "Starting to tail responses.txt..."
tail -f "$COMM_DIR/responses.txt"
