#!/usr/bin/env python3
"""Direct server runner for Docker MCP"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Import and run server directly
from docker_mcp.server import main
import asyncio

if __name__ == "__main__":
    asyncio.run(main())