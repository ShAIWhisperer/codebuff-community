# Codebuff Docker Container Knowledge

## Docker Image Distribution
- Build images locally rather than distributing via registry
- Benefits:
  - Self-contained, no external dependencies
  - Users can inspect/modify Dockerfile
  - Works offline after first build
  - Automatically stays in sync with code
  - No registry maintenance needed

## Communication Protocol
- Uses `.codebuff/comm` directory in project root
- Files:
  - `messages.txt`: Commands from host to container
  - `responses.txt`: Container output and status
- Permissions: 666 to allow container read/write

## Container Lifecycle
- Build image if:
  1. Image doesn't exist
  2. Dockerfile modified since last build
- Container starts with:
  1. Project directory mount
  2. Credentials mount
  3. Communication directory mount
- Waits for "CONTAINER READY" signal before proceeding

## Container Setup
- Base image: node:20-slim
- Additional packages: git, python3, make, g++, procps
- Working directory: /workspace
- Project files copied to /tmp/codebuff_workspace/[PROJECT_PATH]
- Container must run with --privileged flag for filesystem access

## Communication System
Two approaches available:
1. Named Pipes (FIFO)
   - More traditional but can be tricky with blocking
   - Requires careful handling of read/write operations
   - Better for streaming data

2. File-Based (Current Implementation)
   - More reliable for debugging
   - Uses messages.txt for host→container
   - Uses responses.txt for container→host
   - Monitor file size changes to detect new messages
   - Keep only latest message by overwriting instead of appending
   - Use inotifywait for efficient file change detection when available
   - Fall back to modification time polling if inotifywait not available
   - Append-only operation (>>) for atomic writes
   - Set 666 permissions on shared files

### Test Scripts
- test-comm.sh: Continuous bidirectional testing
- message-bridge.sh: Interactive messaging interface
- test-message.sh: Single message testing utility

## Named Pipe Communication
When using named pipes (FIFOs) for bidirectional communication:
- Create pipes before starting communication
- Handle pipe reads/writes in background to avoid blocking
- Use traps to clean up background processes
- Keep pipe operations simple and robust
- Prefer background writes with & to avoid blocking
- Use sleep between operations to prevent busy waiting
- Set appropriate permissions (666) for pipes
- Clean up pipes on exit
- Docker mounts preserve pipe functionality across container boundary
- Pipe redirection must happen inside container context when using docker exec
- Test pipe communication manually before running complex scripts

## File-Based Communication
For reliable container communication:
- Use regular files instead of pipes for simpler debugging
- Keep only latest message by overwriting instead of appending
- Use inotifywait for efficient file change detection when available
- Fall back to modification time polling if inotifywait not available
- Set 666 permissions on shared files
- Mount comm directory separately from workspace

## Best Practices
- Always use exec in entrypoint.sh to replace shell process
- Log extensively during development
- Test communication before adding application logic
- Clean up resources on container exit
- Use separate volume mounts for code vs communication
- Label all logs with source (HOST/CONTAINER) and timestamp
- Use background writes to avoid blocking
- Monitor file sizes for changes instead of continuous reads
- Keep communication files outside of project directory (in comm/)

## Container Best Practices

- Use node:slim as base to minimize image size
- Clean up package manager cache after installing deps
- Set WORKDIR before COPY/RUN commands that use it
- Make entrypoint scripts executable in Dockerfile
- Never write to mounted volumes - copy to working directory instead
- Keep image names simple and context-aware
- Avoid redundant suffixes like '-docker' in image names
- Use descriptive but concise container and image names
- Order RUN commands by stability:
  - System packages first (apt-get)
  - Build tools second (python, make, g++)
  - npm installs last
- This ordering maximizes Docker layer cache hits
- Cache apt-get lists cleanup in same RUN layer as install

## Path Handling

When mounting directories in Docker:
- Always use relative paths inside container
- Strip leading slashes from paths before concatenating
- Convert host paths to absolute before mounting
- When user provides absolute path, make it relative to mount point
- Handle both relative and absolute paths in bootstrap scripts
- Verify project paths are within mounted directory
- Clean up paths by removing double slashes and trailing slashes
- Add debug output in entrypoint scripts for path diagnostics
- Handle special case where project path is mount directory (".")
- Normalize paths in both bootstrap and entrypoint scripts
- Show explicit path resolution steps in debug output
- Remove leading slashes before any path concatenation
- For project paths, mount the parent directory and use the last component as PROJECT_PATH
- Support both interactive prompts and command-line arguments for automation
- Add debug output showing path resolution steps for easier troubleshooting
- Validate directory existence before proceeding
- Convert paths to absolute form for validation
- Use current directory as default when appropriate
- Show clear error messages for missing directories

## Terminal UI Best Practices

- Use `read -e` for path auto-completion in supported shells
- Show default values in gray using ANSI color codes
- Allow accepting defaults by pressing Enter
- Use colors consistently for different types of output:
  - Gray for defaults/suggestions (including default options in Y/n prompts)
  - Green for success/status
  - Yellow for notes/warnings
  - Red for errors
- Provide visual separation between sections with headers
- Show command previews before execution
- Support both interactive and automated usage through command-line args
- Show default values inline with prompt text
- Use parentheses around default values for clarity
- Keep prompt and input on same line
- Detect shell capabilities for better readline support
- Provide fallbacks for shells without readline
- Format yes/no prompts consistently with other prompts
- Show default option in gray: [Y/n] or [y/N]

### Terminal Color Handling

- Use tput when available for better terminal compatibility
- Provide ANSI color code fallbacks when tput is not available
- Always quote color variables in printf statements
- Use setaf for foreground colors (1=red, 2=green, 3=yellow, 8=gray)
- Use sgr0 to reset all attributes
- Redirect tput stderr to /dev/null to handle non-terminal cases
- Test color output in both terminal and non-terminal environments

## Script Distribution

- Prefer bash scripts over Node.js for setup tools
- Bash provides better cross-platform compatibility
- Avoid unnecessary dependencies on runtimes (Node, Python, etc.)
- Shell scripts work on most Unix-like systems out of the box
- Windows users typically have Git Bash or WSL available
- Keep terminal UI simple and compatible with basic shells
- Stick to standard Unix conventions for prompts and input

## Session Management

Avoid using tmux or other session managers in Docker when:
- The main process is already interactive
- The container is designed to run a single process
- Session management would create recursive execution

Instead:
- Run the interactive process directly
- Use Docker's built-in TTY and interactive mode (-it flags)
- Let Docker handle the container lifecycle

## Terminal Handling
- Use `script` command with `-qf` flags for reliable PTY handling
- Install `bsdutils` package for script command
- Create PTY file with 666 permissions
- Use `tail -f` to continuously read PTY output
- Write to `/dev/pts/0` for PTY input
- When sending input to Node.js readline:
  - Add delay (0.5-1s) between message and Enter key
  - Send \r for Enter key
  - Node.js needs time to process input before receiving Enter
- Use expect's exp_internal 1 for debugging terminal interactions

## File-Based Communication
- Use regular files instead of pipes for simpler debugging
- Keep only latest message by overwriting instead of appending
- Use inotifywait for efficient file change detection when available
- Fall back to modification time polling if inotifywait not available
- Set 666 permissions on shared files
- Mount comm directory separately from workspace

## Error Handling
- Add cleanup trap for process termination
- Check file permissions on startup
- Verify required directories exist
- Kill background processes on exit
- Handle missing files gracefully

## Process Management
- Use background processes with & for async operations
- Store PIDs for cleanup
- Wait for main process to exit
- Use exec to replace shell in entrypoint
- Signal container readiness through response file

## Package Requirements
- inotify-tools: For file change monitoring
- bsdutils: For script command and PTY handling
- procps: For process management
- util-linux: Alternative for script command

## Testing
- Use test mode for verifying communication
- Echo server for basic verification
- Timeout handling for stuck processes
- Clear error messages for debugging

## Interactive Program Handling
- Use expect for interactive program automation
- Wait for specific prompts before sending input
- Clear input files after sending to prevent duplicate sends
- Use inotifywait to detect file changes efficiently
- Flush output buffers after sending commands