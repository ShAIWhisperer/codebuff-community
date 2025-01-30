import os
import tempfile
import logging
from git import Repo
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Union
from pydantic import BaseModel
from cli.git_analysis import (
    analyze_commit_frequency,
    analyze_contributor_activity,
    analyze_commit_frequency_by_weekday,
    analyze_commit_frequency_by_hour,
    analyze_average_commit_size,
    analyze_file_change_frequency,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Git Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*"],  # Allow requests from any Chrome extension
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store repo paths temporarily
repo_cache: Dict[str, str] = {}


class CloneRequest(BaseModel):
    url: str


@app.post("/clone")
async def clone_repository(request: CloneRequest) -> Dict[str, str]:
    """Clone a git repository and return a temporary ID to reference it."""
    try:
        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        logger.info(f"Created temp directory: {temp_dir}")

        # Clone the repository
        logger.info(f"Cloning repository from {request.url}")
        repo = Repo.clone_from(request.url, temp_dir)

        # Generate a simple ID (you might want to use UUID in production)
        repo_id = str(hash(request.url))

        # Store the mapping
        repo_cache[repo_id] = temp_dir
        logger.info(f"Successfully cloned repository. ID: {repo_id}")

        return {"repo_id": repo_id}
    except Exception as e:
        logger.error(f"Error cloning repository: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analyze/{analysis_type}")
async def analyze_repo(
    analysis_type: str, repo_id: str
) -> Dict[str, Union[int, float]]:
    """Analyze a git repository using the specified analysis type."""
    try:
        # Get repo path from cache
        repo_path = repo_cache.get(repo_id)
        if not repo_path:
            logger.error(f"Repository not found for ID: {repo_id}")
            raise HTTPException(
                status_code=404, detail="Repository not found. Please clone it first."
            )

        logger.info(f"Analyzing repository at {repo_path}")

        analysis_functions = {
            "commit-frequency": analyze_commit_frequency,
            "contributor-activity": analyze_contributor_activity,
            "commit-frequency-by-weekday": analyze_commit_frequency_by_weekday,
            "commit-frequency-by-hour": analyze_commit_frequency_by_hour,
            "average-commit-size": analyze_average_commit_size,
            "file-change-frequency": analyze_file_change_frequency,
        }

        if analysis_type not in analysis_functions:
            logger.error(f"Invalid analysis type: {analysis_type}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid analysis type. Must be one of: {', '.join(analysis_functions.keys())}",
            )  # Execute analysis
        logger.info(f"Running {analysis_type} analysis")
        results = analysis_functions[analysis_type](repo_path)
        logger.info(f"Analysis complete: {results}")

        # Cast the dictionary to the expected type
        if not isinstance(results, dict):
            raise HTTPException(
                status_code=500, detail="Analysis returned invalid type"
            )
        return results
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
