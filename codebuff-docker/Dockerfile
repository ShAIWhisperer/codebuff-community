FROM node:20-slim

# Install necessary dependencies including Python and build tools
RUN apt-get update && \
    apt-get install -y \
    git \
    python3 \
    python-is-python3 \
    make \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install codebuff globally
RUN npm install -g codebuff

# Create a directory for mounting projects
WORKDIR /workspace

# Create an entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
