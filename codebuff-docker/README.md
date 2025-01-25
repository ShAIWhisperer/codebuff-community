# Codebuff Docker Container

This Docker container provides a standardized environment for running codebuff on any local project directory. It handles native dependencies and provides consistent behavior across different host systems.

## Quick Start

Run the interactive setup script:

```bash
./start-codebuff.sh
```

This script will:

1. Check if Docker is installed
2. Build the Docker image if needed
3. Guide you through mounting your project directory
4. Create a persistent tmux session for your project

## Manual Setup

If you prefer to set things up manually:

### Building the Image

```bash
docker build -t codebuff .
```

### Running the Container

Mount your project directory and run codebuff:

```bash
docker run -it --rm \
  -e PROJECT_PATH=myproject \
  -v /path/to/parent/dir:/workspace \
  codebuff
```

Where:

- `/path/to/parent/dir` is the parent directory containing your project
- `myproject` is the name of your project directory

Example:

```bash
# If your project is at /Users/me/projects/myapp
docker run -it --rm \
  -e PROJECT_PATH=myapp \
  -v /Users/me/projects:/workspace \
  codebuff
```

## Features

- Automatic handling of native dependencies
- Support for both relative and absolute paths
- Interactive setup with path auto-completion
- Consistent behavior across platforms
- Safe read-only access to host files (works on copy)

## Technical Details

- Based on node:slim for minimal image size
- Includes essential build tools (python3, make, g++)
- Handles native module compilation automatically
- Uses tmux for session persistence
- Supports both interactive and automated usage

## Path Handling

The container supports both absolute and relative paths:

- Host paths are mounted at /workspace
- Project paths are resolved relative to the mount point
- Paths are normalized to handle different formats
- Special case handling for current directory (".")

## Troubleshooting

### Windows Path Issues

If you're on Windows, use the appropriate path format:

- Git Bash: `/c/Users/YourName/projects`
- PowerShell: `C:/Users/YourName/projects`
- WSL: Use native Linux paths

### Permission Issues

If you encounter permission issues:

1. Ensure write permissions on your project directory
2. On Linux, run Docker with sudo or add your user to the docker group

