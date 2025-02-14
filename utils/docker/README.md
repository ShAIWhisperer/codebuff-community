# Codebuff Docker Container

This Docker container provides a standardized environment for running codebuff on any local project directory. It handles native dependencies and provides consistent behavior across different host systems.

## Quick Start

From the project root directory:

```bash
./utils/docker/start-codebuff.sh [optional-project-path]
```

This script will:

1. Check if Docker is installed
2. Build the Docker image if needed
3. Set up communication channels between host and container
4. Mount your project directory and credentials
5. Start codebuff in an isolated environment

## Architecture

The system consists of several key components:

### 1. Container Setup (`Dockerfile`)
- Based on node:20-slim for minimal size
- Includes essential build tools and dependencies
- Pre-installs codebuff globally
- Sets up communication scripts

### 2. Entry Point (`entrypoint.sh`)
- Validates environment variables and paths
- Creates communication directory structure
- Sets up working directory with project files
- Handles npm dependencies
- Copies credentials from host
- Launches the codebuff wrapper

### 3. Communication Bridge
The system uses a bidirectional communication system between host and container:

- `message-bridge.sh`: Handles host-side communication
- `codebuff-wrapper.sh`: Manages container-side interaction using expect
- Communication files:
  - `messages.txt`: Commands from host to container
  - `responses.txt`: Output from container to host

### 4. Project Management
- Creates isolated workspace in container
- Preserves original files in mounted volume
- Supports npm package installation
- Handles credentials via ~/.config/manicode mount

## Usage

### Basic Usage
```bash
./utils/docker/start-codebuff.sh
```

When prompted, enter your project path or press Enter to use current directory.

### Advanced Usage
```bash
./utils/docker/start-codebuff.sh /path/to/your/project
```

### Environment Variables
- `DEBUG`: Set to true for verbose logging and automatic container cleanup
- `PROJECT_PATH`: Project directory name (set automatically)
- `PROJECT_NAME`: Project name for prompt (set automatically)

## Directory Structure

The container expects this structure:

```
/workspace/           # Mount point for host directory
  └── your-project/  # Your project files
      └── .codebuff/ # Communication directory
          └── comm/  # Contains messages.txt and responses.txt
```

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure write permissions on project directory
   - Check if .codebuff/comm directory exists and is writable
   - Verify Docker has necessary permissions

2. **Communication Issues**
   - Check if comm files exist and are writable
   - Verify container is running (`docker ps`)
   - Check container logs (`docker logs <container-id>`)

3. **Path Issues**
   - Use absolute paths when possible
   - Verify project directory exists
   - Check for proper directory structure

### Windows Users
- Use appropriate path format:
  - Git Bash: `/c/Users/YourName/projects`
  - PowerShell: `C:/Users/YourName/projects`
  - WSL: Use native Linux paths

## Security Notes

- Container runs with limited privileges
- Credentials are mounted read-only
- Project files are copied to isolated workspace
- Communication channels are local to project directory

## Development

To modify the container:

1. Update Dockerfile if adding dependencies
2. Modify communication scripts as needed
3. Test with DEBUG=true for verbose logging
4. Rebuild image after changes

## Technical Details

- Uses expect for reliable terminal interaction
- Implements file-based communication protocol
- Supports credential persistence
- Handles npm package management
- Provides isolated workspace per session
