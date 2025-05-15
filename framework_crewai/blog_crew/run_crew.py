#!/usr/bin/env python3
"""
Entry point for running the blog crew via the CrewAI CLI
"""

from crew import crew

def main():
    """Run the crew workflow"""
    result = crew.kickoff()
    return result

if __name__ == "__main__":
    main()