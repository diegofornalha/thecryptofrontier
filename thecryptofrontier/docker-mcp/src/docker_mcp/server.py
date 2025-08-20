import asyncio
import signal
import sys
from typing import List, Dict, Any
import mcp.types as types
from mcp.server import NotificationOptions, Server
from mcp.server.models import InitializationOptions
import mcp.server.stdio
from .handlers import DockerHandlers

server = Server("docker-mcp")


@server.list_prompts()
async def handle_list_prompts() -> List[types.Prompt]:
    return [
        types.Prompt(
            name="deploy-stack",
            description="Generate and deploy a Docker stack based on requirements",
            arguments=[
                types.PromptArgument(
                    name="requirements",
                    description="Description of the desired Docker stack",
                    required=True
                ),
                types.PromptArgument(
                    name="project_name",
                    description="Name for the Docker Compose project",
                    required=True
                )
            ]
        )
    ]


@server.get_prompt()
async def handle_get_prompt(name: str, arguments: Dict[str, str] | None) -> types.GetPromptResult:
    if name != "deploy-stack":
        raise ValueError(f"Unknown prompt: {name}")

    if not arguments or "requirements" not in arguments or "project_name" not in arguments:
        raise ValueError("Missing required arguments")

    system_message = (
        "You are a Docker deployment specialist. Generate appropriate Docker Compose YAML or "
        "container configurations based on user requirements. For simple single-container "
        "deployments, use the create-container tool. For multi-container deployments, generate "
        "a docker-compose.yml and use the deploy-compose tool. To access logs, first use the "
        "list-containers tool to discover running containers, then use the get-logs tool to "
        "retrieve logs for a specific container."
    )

    user_message = f"""Please help me deploy the following stack:
Requirements: {arguments['requirements']}
Project name: {arguments['project_name']}

Analyze if this needs a single container or multiple containers. Then:
1. For single container: Use the create-container tool with format:
{{
    "image": "image-name",
    "name": "container-name",
    "ports": {{"80": "80"}},
    "environment": {{"ENV_VAR": "value"}}
}}

2. For multiple containers: Use the deploy-compose tool with format:
{{
    "project_name": "example-stack",
    "compose_yaml": "version: '3.8'\\nservices:\\n  service1:\\n    image: image1:latest\\n    ports:\\n      - '8080:80'"
}}"""

    return types.GetPromptResult(
        description="Generate and deploy a Docker stack",
        messages=[
            types.PromptMessage(
                role="system",
                content=types.TextContent(
                    type="text",
                    text=system_message
                )
            ),
            types.PromptMessage(
                role="user",
                content=types.TextContent(
                    type="text",
                    text=user_message
                )
            )
        ]
    )


@server.list_tools()
async def handle_list_tools() -> List[types.Tool]:
    return [
        types.Tool(
            name="create-container",
            description="Create a new standalone Docker container",
            inputSchema={
                "type": "object",
                "properties": {
                    "image": {"type": "string"},
                    "name": {"type": "string"},
                    "ports": {
                        "type": "object",
                        "additionalProperties": {"type": "string"}
                    },
                    "environment": {
                        "type": "object",
                        "additionalProperties": {"type": "string"}
                    }
                },
                "required": ["image"]
            }
        ),
        types.Tool(
            name="deploy-compose",
            description="Deploy a Docker Compose stack from YAML content or local file",
            inputSchema={
                "type": "object",
                "properties": {
                    "compose_yaml": {"type": "string", "description": "Docker Compose YAML content (if not using compose_file)"},
                    "compose_file": {"type": "string", "description": "Path to local docker-compose.yml file (if not using compose_yaml)"},
                    "project_name": {"type": "string", "description": "Name for the Docker Compose project"}
                },
                "required": ["project_name"]
            }
        ),
        types.Tool(
            name="get-logs",
            description="Retrieve logs for a specified Docker container with optional filtering",
            inputSchema={
                "type": "object",
                "properties": {
                    "container_name": {"type": "string", "description": "Container name or ID"},
                    "tail": {"type": "integer", "description": "Number of lines to show from the end (default: 100)", "default": 100},
                    "follow": {"type": "boolean", "description": "Follow log output (default: false)", "default": False},
                    "timestamps": {"type": "boolean", "description": "Show timestamps (default: false)", "default": False},
                    "since": {"type": "string", "description": "Show logs since timestamp (e.g., '2h', '2023-01-01T00:00:00')"},
                    "until": {"type": "string", "description": "Show logs until timestamp"}
                },
                "required": ["container_name"]
            }
        ),
        types.Tool(
            name="list-containers",
            description="List all Docker containers with detailed information and filtering options",
            inputSchema={
                "type": "object",
                "properties": {
                    "all": {
                        "type": "boolean",
                        "description": "Show all containers (default shows only running)",
                        "default": True
                    },
                    "filters": {
                        "type": "object",
                        "description": "Filter containers by various criteria",
                        "properties": {
                            "status": {"type": "string", "description": "Filter by status (created, restarting, running, removing, paused, exited, dead)"},
                            "label": {"type": "string", "description": "Filter by label (e.g., 'app=web' or just 'app')"},
                            "network": {"type": "string", "description": "Filter by network name"},
                            "name": {"type": "string", "description": "Filter by container name pattern"},
                            "id": {"type": "string", "description": "Filter by container ID prefix"}
                        }
                    }
                }
            }
        ),
        types.Tool(
            name="stop-container",
            description="Stop a running Docker container",
            inputSchema={
                "type": "object",
                "properties": {
                    "container_name": {"type": "string"}
                },
                "required": ["container_name"]
            }
        ),
        types.Tool(
            name="start-container",
            description="Start a stopped Docker container",
            inputSchema={
                "type": "object",
                "properties": {
                    "container_name": {"type": "string"}
                },
                "required": ["container_name"]
            }
        ),
        types.Tool(
            name="remove-container",
            description="Remove a Docker container",
            inputSchema={
                "type": "object",
                "properties": {
                    "container_name": {"type": "string"},
                    "force": {
                        "type": "boolean",
                        "description": "Force removal of running container",
                        "default": False
                    }
                },
                "required": ["container_name"]
            }
        ),
        types.Tool(
            name="list-images",
            description="List all Docker images available locally",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        types.Tool(
            name="pull-image",
            description="Download or update a Docker image",
            inputSchema={
                "type": "object",
                "properties": {
                    "image": {"type": "string", "description": "Image name with optional tag (e.g. nginx:latest)"}
                },
                "required": ["image"]
            }
        ),
        types.Tool(
            name="remove-image",
            description="Remove a Docker image",
            inputSchema={
                "type": "object",
                "properties": {
                    "image": {"type": "string", "description": "Image name or ID"},
                    "force": {
                        "type": "boolean",
                        "description": "Force removal even if used by containers",
                        "default": False
                    }
                },
                "required": ["image"]
            }
        ),
        types.Tool(
            name="list-volumes",
            description="List all Docker volumes",
            inputSchema={
                "type": "object",
                "properties": {
                    "filters": {
                        "type": "object",
                        "description": "Filter volumes (e.g. {'dangling': 'true'})",
                        "additionalProperties": {"type": "string"}
                    }
                }
            }
        ),
        types.Tool(
            name="remove-volume",
            description="Remove a Docker volume",
            inputSchema={
                "type": "object",
                "properties": {
                    "volume_name": {"type": "string", "description": "Volume name or ID"},
                    "force": {
                        "type": "boolean",
                        "description": "Force removal even if in use",
                        "default": False
                    }
                },
                "required": ["volume_name"]
            }
        ),
        types.Tool(
            name="compose-down",
            description="Stop and remove a Docker Compose stack",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_name": {"type": "string", "description": "Name of the Docker Compose project"},
                    "compose_file": {"type": "string", "description": "Optional path to docker-compose.yml file"},
                    "remove_volumes": {
                        "type": "boolean",
                        "description": "Also remove named volumes declared in the volumes section",
                        "default": False
                    },
                    "remove_images": {
                        "type": "boolean", 
                        "description": "Remove images used by services",
                        "default": False
                    }
                },
                "required": ["project_name"]
            }
        ),
        types.Tool(
            name="get-container-stats",
            description="Get real-time resource usage statistics for a container",
            inputSchema={
                "type": "object",
                "properties": {
                    "container_name": {"type": "string", "description": "Container name or ID"}
                },
                "required": ["container_name"]
            }
        ),
        types.Tool(
            name="exec-container",
            description="Execute a command inside a running container",
            inputSchema={
                "type": "object",
                "properties": {
                    "container_name": {"type": "string", "description": "Container name or ID"},
                    "command": {"type": "string", "description": "Command to execute"},
                    "user": {"type": "string", "description": "Username or UID to run the command as"},
                    "workdir": {"type": "string", "description": "Working directory inside the container"},
                    "env": {
                        "type": "object",
                        "description": "Environment variables to set",
                        "additionalProperties": {"type": "string"}
                    },
                    "privileged": {"type": "boolean", "description": "Run command with extended privileges", "default": False},
                    "detach": {"type": "boolean", "description": "Run command in background", "default": False}
                },
                "required": ["container_name", "command"]
            }
        ),
        types.Tool(
            name="compose-ps",
            description="List containers for a specific Docker Compose project",
            inputSchema={
                "type": "object", 
                "properties": {
                    "project_name": {"type": "string", "description": "Name of the Docker Compose project"},
                    "all": {"type": "boolean", "description": "Show all containers including stopped ones", "default": False}
                },
                "required": ["project_name"]
            }
        ),
        types.Tool(
            name="compose-logs",
            description="Get aggregated logs from all services in a Docker Compose project",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_name": {"type": "string", "description": "Name of the Docker Compose project"},
                    "service": {"type": "string", "description": "Specific service name (optional, shows all if not specified)"},
                    "tail": {"type": "integer", "description": "Number of lines to show from the end", "default": 100},
                    "follow": {"type": "boolean", "description": "Follow log output", "default": False},
                    "timestamps": {"type": "boolean", "description": "Show timestamps", "default": False}
                },
                "required": ["project_name"]
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any] | None) -> List[types.TextContent]:
    if not arguments and name not in ["list-containers", "list-images", "list-volumes"]:
        raise ValueError("Missing arguments")

    try:
        if name == "create-container":
            return await DockerHandlers.handle_create_container(arguments)
        elif name == "deploy-compose":
            return await DockerHandlers.handle_deploy_compose(arguments)
        elif name == "get-logs":
            return await DockerHandlers.handle_get_logs(arguments)
        elif name == "list-containers":
            return await DockerHandlers.handle_list_containers(arguments)
        elif name == "stop-container":
            return await DockerHandlers.handle_stop_container(arguments)
        elif name == "start-container":
            return await DockerHandlers.handle_start_container(arguments)
        elif name == "remove-container":
            return await DockerHandlers.handle_remove_container(arguments)
        elif name == "list-images":
            return await DockerHandlers.handle_list_images(arguments)
        elif name == "pull-image":
            return await DockerHandlers.handle_pull_image(arguments)
        elif name == "remove-image":
            return await DockerHandlers.handle_remove_image(arguments)
        elif name == "list-volumes":
            return await DockerHandlers.handle_list_volumes(arguments)
        elif name == "remove-volume":
            return await DockerHandlers.handle_remove_volume(arguments)
        elif name == "compose-down":
            return await DockerHandlers.handle_compose_down(arguments)
        elif name == "get-container-stats":
            return await DockerHandlers.handle_get_container_stats(arguments)
        elif name == "exec-container":
            return await DockerHandlers.handle_exec_container(arguments)
        elif name == "compose-ps":
            return await DockerHandlers.handle_compose_ps(arguments)
        elif name == "compose-logs":
            return await DockerHandlers.handle_compose_logs(arguments)
        else:
            raise ValueError(f"Unknown tool: {name}")
    except Exception as e:
        return [types.TextContent(type="text", text=f"Error: {str(e)} | Arguments: {arguments}")]


async def main():
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="docker-mcp",
                server_version="0.3.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


def handle_shutdown(signum, frame):
    print("Shutting down gracefully...")
    sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
