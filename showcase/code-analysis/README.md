# Code Analysis CLI

A Python CLI application for analyzing GitHub repository complexity.

## Setup

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -e .

# Install development dependencies (optional)
pip install -e ".[dev]"
```

## Usage

```bash
# List available commands
python -m cli --help

# Analyze commit frequency for a repository
python -m cli analyze_commit_frequency /path/to/git/repo

# Output results in JSON format
python -m cli analyze_commit_frequency /path/to/git/repo --json
```

## Features

- analyze_commit_frequency: Analyze commit frequency by day
- More features coming soon!

## Development

```bash
# Run type checker
mypy cli app

# Format code
black cli app

# Run FastAPI server
uvicorn app.main:app --reload
```

The FastAPI app will be available at http://localhost:8000 with automatic API documentation at http://localhost:8000/docs.
