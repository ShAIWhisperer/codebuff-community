# Docker Container Knowledge

## Native Dependencies

When containerizing Node.js applications with native dependencies:

- Always include Python 3 and build tools (make, g++)
- Use `python-is-python3` package to ensure `python` command exists
- Clean up apt cache after installing dependencies
- Include these even if native deps are optional - better to have them ready
- Required for node-gyp and native module compilation:
  - python3 (and python symlink)
  - make
  - g++
  - git (for npm packages from git)
- Clean up apt cache after installing to reduce image size
- Install build tools before npm install to avoid compilation errors

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