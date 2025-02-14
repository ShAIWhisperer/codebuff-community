FROM node:20-slim

# Install required packages
RUN apt-get update && \
    apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    procps \
    inotify-tools \
    npm \
    build-essential \
    bsdutils \
    expect \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install/Update codebuff globally and verify installation
RUN npm install -g codebuff

# Copy scripts
COPY codebuff-wrapper.sh /codebuff-wrapper.sh
COPY entrypoint.sh /entrypoint.sh
COPY message-bridge.sh /message-bridge.sh

# Make scripts executable
RUN chmod +x /codebuff-wrapper.sh /entrypoint.sh /message-bridge.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
