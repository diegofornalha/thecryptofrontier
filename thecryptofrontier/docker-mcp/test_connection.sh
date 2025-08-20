#!/bin/bash
# Test Docker MCP connection

echo "Testing Docker MCP connection..."
echo ""

# Kill any existing docker-mcp processes
pkill -f "docker_mcp" 2>/dev/null
sleep 1

# List all MCP servers
echo "Current MCP servers:"
claude mcp list | grep docker-mcp
echo ""

# Try to connect with debug
echo "Testing connection..."
claude --mcp-debug "test" 2>&1 | grep -A 2 -B 2 "docker-mcp" | head -20