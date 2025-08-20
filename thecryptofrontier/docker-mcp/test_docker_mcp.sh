#!/bin/bash
# Test Docker MCP Server

echo "Testing Docker MCP Server..."

# Test 1: Python path
echo -e "\n1. Testing Python path:"
cd /root/.claude/docker-mcp
python3 -c "import sys; print('Python:', sys.executable)"

# Test 2: Import test
echo -e "\n2. Testing imports:"
python3 -c "
import sys
sys.path.insert(0, './src')
try:
    from docker_mcp.server import main
    print('✓ Import successful')
except Exception as e:
    print('✗ Import failed:', e)
"

# Test 3: Docker access
echo -e "\n3. Testing Docker access:"
if docker ps >/dev/null 2>&1; then
    echo "✓ Docker is accessible"
else
    echo "✗ Docker is not accessible"
fi

# Test 4: Run server briefly
echo -e "\n4. Testing server startup:"
timeout 2 python3 docker_mcp_server.py 2>&1 | head -20