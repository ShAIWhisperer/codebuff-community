# Python CLI Template Knowledge

## Project Overview
A minimal Python CLI application template with modern Python features and type hints.

## Key Features
- Uses virtual environments for isolation
- Type hints and mypy for static type checking
- Modern Python packaging with pyproject.toml
- Black for code formatting

## Verifying changes
After every change, run:
```bash
mypy cli app && black --check cli app
```
This will check for type errors and formatting issues.

## Project Structure
- `cli/`: Command-line interface for git analysis
- `app/`: FastAPI web service for git analysis
- `extension/`: Chrome extension for GitHub integration

## Chrome Extension
The extension activates on GitHub repository pages and provides:
- Analysis popup accessible via toolbar icon
- Direct integration with local FastAPI server
- JSON visualization of repository metrics

### Architecture Constraints
Git analysis requires a backend service because:
- GitPython needs filesystem access
- Git operations require system-level access
- Cannot run Python directly in extension

### Alternative Approaches Investigated
Client-side options have limitations:
- Pyodide (WASM Python): No filesystem/git access
- WebContainer API: Limited browser support, sandboxed
  - Requires 'wasm-unsafe-eval' in CSP
  - Must load from CDN or package
  - Resets on popup close
- isomorphic-git: Requires fetching full repo data first

## Project Structure
- `cli/`: Command-line interface for git analysis
- `app/`: FastAPI web service for git analysis
- `extension/`: Chrome extension for GitHub integration

## Chrome Extension
The extension activates on GitHub repository pages and provides:
- Analysis popup accessible via toolbar icon
- Direct integration with local FastAPI server
- JSON visualization of repository metrics

### Architecture Constraints
Git analysis requires a backend service because:
- GitPython needs filesystem access
- Git operations require system-level access
- Cannot run Python directly in extension

### Alternative Approaches Investigated
Client-side options have limitations:
- Pyodide (WASM Python): No filesystem/git access
- WebContainer API: Limited browser support, sandboxed
  - Requires 'wasm-unsafe-eval' in CSP
  - Must load from CDN or package
  - Resets on popup close
- isomorphic-git: Requires fetching full repo data first
