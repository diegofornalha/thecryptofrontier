"""
Claude CLI Adapter para Blog Crew
Sistema simplificado para automação de blog usando Claude CLI (custo zero)
"""

__version__ = "0.1.0"
__author__ = "Blog Crew Team"

from .claude_agent import ClaudeAgent
from .pipeline import SimplePipeline

__all__ = [
    "ClaudeAgent",
    "SimplePipeline"
]