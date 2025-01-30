from typing import Dict
from git import Repo
from datetime import datetime, timezone
from collections import defaultdict


def analyze_commit_frequency(repo_path: str) -> Dict[str, int]:
    """Analyze commit frequency by day for a git repository."""
    repo = Repo(repo_path)
    frequency: Dict[str, int] = defaultdict(int)

    for commit in repo.iter_commits():
        date = datetime.fromtimestamp(commit.committed_date, timezone.utc)
        day = date.strftime("%Y-%m-%d")
        frequency[day] += 1

    return dict(frequency)


def analyze_commit_frequency_by_weekday(repo_path: str) -> Dict[str, int]:
    """
    Analyze commit frequency by weekday (e.g., Monday, Tuesday).
    """
    repo = Repo(repo_path)
    # Initialize all weekdays with zero count
    frequency = {
        "Monday": 0,
        "Tuesday": 0,
        "Wednesday": 0,
        "Thursday": 0,
        "Friday": 0,
        "Saturday": 0,
        "Sunday": 0,
    }

    for commit in repo.iter_commits():
        date = datetime.fromtimestamp(commit.committed_date, timezone.utc)
        weekday = date.strftime("%A")  # e.g., "Monday"
        frequency[weekday] += 1

    return frequency


def analyze_commit_frequency_by_hour(repo_path: str) -> Dict[str, int]:
    """
    Analyze commit frequency by hour of day (0-23).
    """
    repo = Repo(repo_path)
    # Initialize all hours with zero count
    frequency = {f"{hour:02d}": 0 for hour in range(24)}

    for commit in repo.iter_commits():
        date = datetime.fromtimestamp(commit.committed_date, timezone.utc)
        hour = date.strftime("%H")  # e.g., "13" for 1pm
        frequency[hour] += 1

    return frequency


def analyze_average_commit_size(repo_path: str) -> Dict[str, float]:
    """
    Compute the average commit size (approximate lines added or removed per commit).
    """
    repo = Repo(repo_path)
    total_changes = 0
    commit_count = 0

    for commit in repo.iter_commits():
        # If the commit has no parent (e.g., the initial commit), skip
        if not commit.parents:
            continue

        # Compare commit to its first parent
        diffs = commit.diff(commit.parents[0], create_patch=True)
        changes_in_commit = 0
        for diff in diffs:
            if not diff.diff:
                continue
            # diff.diff can be either string or bytes
            # A rough approach is to count the number of lines that start with "+" or "-"
            # ignoring lines that start with "+++" or "---" in the patch header
            if isinstance(diff.diff, bytes):
                patch_lines = diff.diff.decode("utf-8", errors="ignore").split("\n")
            else:
                patch_lines = diff.diff.split("\n")
            for line in patch_lines:
                if line.startswith("+") and not line.startswith("+++"):
                    changes_in_commit += 1
                elif line.startswith("-") and not line.startswith("---"):
                    changes_in_commit += 1

        total_changes += changes_in_commit
        commit_count += 1

    average_changes = total_changes / commit_count if commit_count else 0
    return {"average_commit_size": average_changes}


def analyze_file_change_frequency(repo_path: str) -> Dict[str, int]:
    """
    Analyze how often each file is changed in the repository.
    """
    repo = Repo(repo_path)
    file_frequency: Dict[str, int] = defaultdict(int)

    for commit in repo.iter_commits():
        # Skip the initial commit (no parent to compare against)
        if not commit.parents:
            continue

        parent = commit.parents[0]
        # diff() returns a list of diff objects representing file changes
        diffs = commit.diff(parent)

        for diff in diffs:
            # a_path and b_path might be different if the file was renamed
            file_path = diff.a_path or diff.b_path
            if file_path:  # Only count if we have a valid path
                file_frequency[file_path] += 1

    return dict(file_frequency)


def analyze_contributor_activity(repo_path: str) -> Dict[str, int]:
    """Analyze commit count per contributor in a git repository."""
    repo = Repo(repo_path)
    activity: Dict[str, int] = defaultdict(int)

    for commit in repo.iter_commits():
        author = f"{commit.author.name} <{commit.author.email}>"
        activity[author] += 1

    return dict(activity)
