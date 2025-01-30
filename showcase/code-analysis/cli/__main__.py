#!/usr/bin/env python3
from typing import Any, Callable, Dict
import argparse
from cli.git_analysis import (
    analyze_commit_frequency,
    analyze_contributor_activity,
    analyze_commit_frequency_by_weekday,
    analyze_commit_frequency_by_hour,
    analyze_average_commit_size,
    analyze_file_change_frequency,
)

# Dictionary mapping command names to their corresponding functions
COMMANDS: Dict[str, Callable[..., Dict[str, Any]]] = {
    "analyze_commit_frequency": analyze_commit_frequency,
    "analyze_contributor_activity": analyze_contributor_activity,
    "analyze_commit_frequency_by_weekday": analyze_commit_frequency_by_weekday,
    "analyze_commit_frequency_by_hour": analyze_commit_frequency_by_hour,
    "analyze_average_commit_size": analyze_average_commit_size,
    "analyze_file_change_frequency": analyze_file_change_frequency,
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze GitHub repository complexity")
    parser.add_argument(
        "command",
        choices=list(COMMANDS.keys()),
        help="The analysis command to run",
    )
    parser.add_argument(
        "repo_path",
        help="Path to the git repository to analyze",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format",
    )

    args = parser.parse_args()

    try:
        # Get the function corresponding to the command
        command_func = COMMANDS[args.command]

        # Execute the command and get the results
        results = command_func(args.repo_path)

        # Print results
        if args.json:
            import json

            print(json.dumps(results, indent=2))
        else:
            print(f"\n{args.command} results:")
            for key, value in sorted(results.items()):
                print(f"{key}: {value}")

    except Exception as e:
        print(f"Error analyzing repository: {e}")


if __name__ == "__main__":
    main()
