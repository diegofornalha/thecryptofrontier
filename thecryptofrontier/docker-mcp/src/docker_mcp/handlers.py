from typing import List, Dict, Any
import asyncio
import os
import yaml
import platform
from python_on_whales import DockerClient
from mcp.types import TextContent, Tool, Prompt, PromptArgument, GetPromptResult, PromptMessage
from .docker_executor import DockerComposeExecutor

# Ensure docker is in PATH
if '/usr/bin' not in os.environ.get('PATH', ''):
    os.environ['PATH'] = f"/usr/bin:{os.environ.get('PATH', '')}"

docker_client = DockerClient()


async def parse_port_mapping(host_key: str, container_port: str | int) -> tuple[str, str] | tuple[str, str, str]:
    if '/' in str(host_key):
        host_port, protocol = host_key.split('/')
        if protocol.lower() == 'udp':
            return (str(host_port), str(container_port), 'udp')
        return (str(host_port), str(container_port))

    if isinstance(container_port, str) and '/' in container_port:
        port, protocol = container_port.split('/')
        if protocol.lower() == 'udp':
            return (str(host_key), port, 'udp')
        return (str(host_key), port)

    return (str(host_key), str(container_port))


class DockerHandlers:
    TIMEOUT_AMOUNT = 200

    @staticmethod
    async def handle_create_container(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            image = arguments["image"]
            container_name = arguments.get("name")
            ports = arguments.get("ports", {})
            environment = arguments.get("environment", {})

            if not image:
                raise ValueError("Image name cannot be empty")

            port_mappings = []
            for host_key, container_port in ports.items():
                mapping = await parse_port_mapping(host_key, container_port)
                port_mappings.append(mapping)

            async def pull_and_run():
                if not docker_client.image.exists(image):
                    await asyncio.to_thread(docker_client.image.pull, image)

                container = await asyncio.to_thread(
                    docker_client.container.run,
                    image,
                    name=container_name,
                    publish=port_mappings,
                    envs=environment,
                    detach=True
                )
                return container

            container = await asyncio.wait_for(pull_and_run(), timeout=DockerHandlers.TIMEOUT_AMOUNT)
            return [TextContent(type="text", text=f"Created container '{container.name}' (ID: {container.id})")]
        except asyncio.TimeoutError:
            return [TextContent(type="text", text=f"Operation timed out after {DockerHandlers.TIMEOUT_AMOUNT} seconds")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error creating container: {str(e)} | Arguments: {arguments}")]

    @staticmethod
    async def handle_deploy_compose(arguments: Dict[str, Any]) -> List[TextContent]:
        debug_info = []
        try:
            compose_yaml = arguments.get("compose_yaml")
            compose_file = arguments.get("compose_file")
            project_name = arguments.get("project_name")

            if not project_name:
                raise ValueError("Missing required project_name")
            
            if not compose_yaml and not compose_file:
                raise ValueError("Either compose_yaml or compose_file must be provided")

            # Handle local file path
            if compose_file:
                if not os.path.exists(compose_file):
                    raise ValueError(f"Docker Compose file not found: {compose_file}")
                compose_path = compose_file
                debug_info.append(f"Using local compose file: {compose_file}")
                cleanup_needed = False
            else:
                # Handle inline YAML content
                yaml_content = DockerHandlers._process_yaml(
                    compose_yaml, debug_info)
                compose_path = DockerHandlers._save_compose_file(
                    yaml_content, project_name)
                cleanup_needed = True

            try:
                result = await DockerHandlers._deploy_stack(compose_path, project_name, debug_info)
                return [TextContent(type="text", text=result)]
            finally:
                if cleanup_needed:
                    DockerHandlers._cleanup_files(compose_path)

        except Exception as e:
            debug_output = "\n".join(debug_info)
            return [TextContent(type="text", text=f"Error deploying compose stack: {str(e)}\n\nDebug Information:\n{debug_output}")]

    @staticmethod
    def _process_yaml(compose_yaml: str, debug_info: List[str]) -> dict:
        debug_info.append("=== Original YAML ===")
        debug_info.append(compose_yaml)

        try:
            yaml_content = yaml.safe_load(compose_yaml)
            debug_info.append("\n=== Loaded YAML Structure ===")
            debug_info.append(str(yaml_content))
            return yaml_content
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML format: {str(e)}")

    @staticmethod
    def _save_compose_file(yaml_content: dict, project_name: str) -> str:
        compose_dir = os.path.join(os.getcwd(), "docker_compose_files")
        os.makedirs(compose_dir, exist_ok=True)

        compose_yaml = yaml.safe_dump(
            yaml_content, default_flow_style=False, sort_keys=False)
        compose_path = os.path.join(
            compose_dir, f"{project_name}-docker-compose.yml")

        with open(compose_path, 'w', encoding='utf-8') as f:
            f.write(compose_yaml)
            f.flush()
            if platform.system() != 'Windows':
                os.fsync(f.fileno())

        return compose_path

    @staticmethod
    async def _deploy_stack(compose_path: str, project_name: str, debug_info: List[str]) -> str:
        compose = DockerComposeExecutor(compose_path, project_name)

        for command in [compose.down, compose.up]:
            try:
                code, out, err = await command()
                debug_info.extend([
                    f"\n=== {command.__name__.capitalize()} Command ===",
                    f"Return Code: {code}",
                    f"Stdout: {out}",
                    f"Stderr: {err}"
                ])

                if code != 0 and command == compose.up:
                    raise Exception(f"Deploy failed with code {code}: {err}")
            except Exception as e:
                if command != compose.down:
                    raise e
                debug_info.append(f"Warning during {command.__name__}: {str(e)}")

        code, out, err = await compose.ps()
        service_info = out if code == 0 else "Unable to list services"

        return (f"Successfully deployed compose stack '{project_name}'\n"
                f"Running services:\n{service_info}\n\n"
                f"Debug Info:\n{chr(10).join(debug_info)}")

    @staticmethod
    def _cleanup_files(compose_path: str) -> None:
        try:
            if os.path.exists(compose_path):
                os.remove(compose_path)
            compose_dir = os.path.dirname(compose_path)
            if os.path.exists(compose_dir) and not os.listdir(compose_dir):
                os.rmdir(compose_dir)
        except Exception as e:
            print(f"Warning during cleanup: {str(e)}")

    @staticmethod
    async def handle_get_logs(arguments: Dict[str, Any]) -> List[TextContent]:
        debug_info = []
        try:
            container_name = arguments.get("container_name")
            if not container_name:
                raise ValueError("Missing required container_name")
            
            # Optional parameters
            tail = arguments.get("tail", 100)
            follow = arguments.get("follow", False)
            timestamps = arguments.get("timestamps", False)
            since = arguments.get("since", None)
            until = arguments.get("until", None)

            debug_info.append(f"Fetching logs for container '{container_name}' (tail={tail}, follow={follow}, timestamps={timestamps})")
            
            # First, check if container exists and get its current state
            try:
                container_info = await asyncio.to_thread(docker_client.container.inspect, container_name)
                container_state = container_info.state.status
                debug_info.append(f"Container state: {container_state}")
                
                if container_state in ["dead", "removing"]:
                    return [TextContent(type="text", text=f"Container '{container_name}' is {container_state} and cannot provide logs")]
            except Exception as inspect_error:
                debug_info.append(f"Could not inspect container: {str(inspect_error)}")
                # Continue anyway, the logs command might still work
            
            # Build kwargs for logs command
            log_kwargs = {
                "tail": tail,
                "follow": follow,
                "timestamps": timestamps
            }
            if since:
                log_kwargs["since"] = since
            if until:
                log_kwargs["until"] = until
            
            # Get logs
            logs = await asyncio.to_thread(docker_client.container.logs, container_name, **log_kwargs)
            
            # Format the output
            output = f"Logs for container '{container_name}'"
            if since or until:
                output += f" (from {since or 'start'} to {until or 'now'})"
            output += f":\n{logs}"

            return [TextContent(type="text", text=output)]
        except Exception as e:
            error_msg = str(e)
            # Provide more helpful error messages
            if "dead or marked for removal" in error_msg:
                return [TextContent(type="text", text=f"Container '{container_name}' has been removed or recreated. Please use 'list-containers' to find the current container name.")]
            elif "No such container" in error_msg:
                return [TextContent(type="text", text=f"Container '{container_name}' not found. Please use 'list-containers' to see available containers.")]
            else:
                debug_output = "\n".join(debug_info)
                return [TextContent(type="text", text=f"Error retrieving logs: {error_msg}\n\nDebug Information:\n{debug_output}")]

    @staticmethod
    async def handle_list_containers(arguments: Dict[str, Any] | None) -> List[TextContent]:
        debug_info = []
        try:
            show_all = True if not arguments else arguments.get("all", True)
            filters = arguments.get("filters", {}) if arguments else {}
            
            debug_info.append(f"Listing Docker containers (all={show_all}, filters={filters})")
            
            # Get all containers first
            containers = await asyncio.to_thread(docker_client.container.list, all=show_all)
            
            # Apply filters manually if needed
            if filters:
                filtered_containers = []
                for c in containers:
                    # Status filter
                    if filters.get("status") and c.state.status != filters["status"]:
                        continue
                    
                    # Name filter (pattern matching)
                    if filters.get("name") and filters["name"] not in c.name:
                        continue
                    
                    # ID filter (prefix matching)
                    if filters.get("id") and not c.id.startswith(filters["id"]):
                        continue
                    
                    # Label filter
                    if filters.get("label"):
                        label_match = False
                        if "=" in filters["label"]:
                            key, value = filters["label"].split("=", 1)
                            if c.config.labels.get(key) == value:
                                label_match = True
                        else:
                            # Just check if label key exists
                            if filters["label"] in c.config.labels:
                                label_match = True
                        if not label_match:
                            continue
                    
                    # Network filter
                    if filters.get("network"):
                        try:
                            inspect_data = await asyncio.to_thread(docker_client.container.inspect, c.name)
                            if filters["network"] not in inspect_data.network_settings.networks:
                                continue
                        except:
                            continue
                    
                    filtered_containers.append(c)
                containers = filtered_containers
            
            container_info = []
            for c in containers:
                ports = []
                
                # Try to get port bindings from inspect data
                try:
                    inspect_data = await asyncio.to_thread(docker_client.container.inspect, c.name)
                    port_bindings = inspect_data.network_settings.ports
                    
                    if port_bindings:
                        for container_port, host_bindings in port_bindings.items():
                            if host_bindings:
                                for binding in host_bindings:
                                    host_ip = binding.get('HostIp', '0.0.0.0')
                                    host_port = binding.get('HostPort', '')
                                    if host_port:
                                        ports.append(f"{host_ip}:{host_port}->{container_port}")
                except:
                    # Fallback to basic port info
                    if hasattr(c, 'ports') and c.ports:
                        for port_mapping in c.ports.items():
                            ports.append(f"{port_mapping[0]}->{port_mapping[1]}")
                
                ports_str = ", ".join(ports) if ports else "No ports"
                
                status = c.state.status
                if status == "running" and hasattr(c.state, 'started_at'):
                    status = f"Up {c.state.running_for}" if hasattr(c.state, 'running_for') else "Running"
                    
                    # Check health status
                    try:
                        if hasattr(inspect_data.state, 'health') and inspect_data.state.health:
                            health_status = inspect_data.state.health.status
                            if health_status:
                                status = f"{status} ({health_status})"
                    except:
                        pass
                        
                elif status == "exited":
                    status = f"Exited ({c.state.exit_code})"
                
                info = f"• {c.name} ({c.id[:12]})\n  Image: {c.config.image}\n  Status: {status}\n  Ports: {ports_str}"
                container_info.append(info)
            
            result = "\n\n".join(container_info) if container_info else "No containers found"
            
            # Add filter summary if filters were applied
            output = "Docker Containers"
            if filters:
                filter_desc = []
                for key, value in filters.items():
                    filter_desc.append(f"{key}={value}")
                output += f" (filtered by: {', '.join(filter_desc)})"
            output += f":\n\n{result}"
            
            # Add count summary
            if container_info:
                output += f"\n\nTotal: {len(container_info)} container(s)"
            
            return [TextContent(type="text", text=output)]
        except Exception as e:
            debug_output = "\n".join(debug_info)
            return [TextContent(type="text", text=f"Error listing containers: {str(e)}\n\nDebug Information:\n{debug_output}")]

    @staticmethod
    async def handle_stop_container(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            container_name = arguments.get("container_name")
            if not container_name:
                raise ValueError("Missing required container_name")
            
            await asyncio.to_thread(docker_client.container.stop, container_name)
            
            return [TextContent(type="text", text=f"Successfully stopped container '{container_name}'")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error stopping container: {str(e)}")]

    @staticmethod
    async def handle_start_container(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            container_name = arguments.get("container_name")
            if not container_name:
                raise ValueError("Missing required container_name")
            
            await asyncio.to_thread(docker_client.container.start, container_name)
            
            return [TextContent(type="text", text=f"Successfully started container '{container_name}'")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error starting container: {str(e)}")]

    @staticmethod
    async def handle_remove_container(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            container_name = arguments.get("container_name")
            force = arguments.get("force", False)
            
            if not container_name:
                raise ValueError("Missing required container_name")
            
            # Check if container is running and force is not set
            if not force:
                try:
                    container_info = await asyncio.to_thread(docker_client.container.inspect, container_name)
                    if container_info.state.status == "running":
                        return [TextContent(type="text", text=f"Container '{container_name}' is running. Use force=true to remove it, or stop it first.")]
                except:
                    pass
            
            await asyncio.to_thread(docker_client.container.remove, container_name, force=force)
            
            return [TextContent(type="text", text=f"Successfully removed container '{container_name}'")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error removing container: {str(e)}")]

    @staticmethod
    async def handle_list_images(arguments: Dict[str, Any] | None) -> List[TextContent]:
        try:
            images = await asyncio.to_thread(docker_client.image.list)
            
            image_info = []
            for img in images:
                # Get tags
                tags = img.repo_tags if hasattr(img, 'repo_tags') else []
                tag_str = ", ".join(tags) if tags else "<none>"
                
                # Get size
                size_mb = img.size / (1024 * 1024) if hasattr(img, 'size') else 0
                size_str = f"{size_mb:.1f}MB"
                
                # Get created time
                created = img.attrs.get('Created', 'Unknown') if hasattr(img, 'attrs') else 'Unknown'
                
                info = f"• {tag_str}\n  ID: {img.id[:12]}\n  Size: {size_str}\n  Created: {created}"
                image_info.append(info)
            
            result = "\n\n".join(image_info) if image_info else "No images found"
            
            return [TextContent(type="text", text=f"Docker Images:\n\n{result}")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error listing images: {str(e)}")]

    @staticmethod
    async def handle_pull_image(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            image = arguments.get("image")
            if not image:
                raise ValueError("Missing required image name")
            
            # Pull the image
            result = await asyncio.to_thread(docker_client.image.pull, image)
            
            return [TextContent(type="text", text=f"Successfully pulled image '{image}'")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error pulling image: {str(e)}")]

    @staticmethod
    async def handle_remove_image(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            image = arguments.get("image")
            force = arguments.get("force", False)
            
            if not image:
                raise ValueError("Missing required image name or ID")
            
            # Remove the image
            await asyncio.to_thread(docker_client.image.remove, image, force=force)
            
            return [TextContent(type="text", text=f"Successfully removed image '{image}'")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error removing image: {str(e)}")]

    @staticmethod
    async def handle_list_volumes(arguments: Dict[str, Any] | None) -> List[TextContent]:
        try:
            filters = arguments.get("filters", {}) if arguments else {}
            
            volumes = await asyncio.to_thread(docker_client.volume.list, filters=filters)
            
            volume_info = []
            for vol in volumes:
                # Get volume details
                name = vol.name if hasattr(vol, 'name') else 'Unknown'
                driver = vol.driver if hasattr(vol, 'driver') else 'local'
                mountpoint = vol.mountpoint if hasattr(vol, 'mountpoint') else 'Unknown'
                
                # Get labels
                labels = vol.labels if hasattr(vol, 'labels') else {}
                label_str = ", ".join([f"{k}={v}" for k, v in labels.items()]) if labels else "No labels"
                
                # Get scope
                scope = vol.scope if hasattr(vol, 'scope') else 'local'
                
                info = f"• {name}\n  Driver: {driver}\n  Scope: {scope}\n  Mountpoint: {mountpoint}\n  Labels: {label_str}"
                volume_info.append(info)
            
            result = "\n\n".join(volume_info) if volume_info else "No volumes found"
            
            return [TextContent(type="text", text=f"Docker Volumes:\n\n{result}")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error listing volumes: {str(e)}")]

    @staticmethod
    async def handle_remove_volume(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            volume_name = arguments.get("volume_name")
            force = arguments.get("force", False)
            
            if not volume_name:
                raise ValueError("Missing required volume_name")
            
            # Remove the volume
            await asyncio.to_thread(docker_client.volume.remove, volume_name, force=force)
            
            return [TextContent(type="text", text=f"Successfully removed volume '{volume_name}'")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error removing volume: {str(e)}")]

    @staticmethod
    async def handle_compose_down(arguments: Dict[str, Any]) -> List[TextContent]:
        debug_info = []
        try:
            project_name = arguments.get("project_name")
            compose_file = arguments.get("compose_file")
            remove_volumes = arguments.get("remove_volumes", False)
            remove_images = arguments.get("remove_images", False)
            
            if not project_name:
                raise ValueError("Missing required project_name")
            
            # If compose_file is provided, use it
            if compose_file:
                if not os.path.exists(compose_file):
                    raise ValueError(f"Docker Compose file not found: {compose_file}")
                compose_path = compose_file
                debug_info.append(f"Using local compose file: {compose_file}")
            else:
                # Try to find existing compose file for the project
                compose_dir = os.path.join(os.getcwd(), "docker_compose_files")
                compose_path = os.path.join(compose_dir, f"{project_name}-docker-compose.yml")
                
                # If no file exists, we'll try to stop by project name only
                if not os.path.exists(compose_path):
                    compose_path = None
                    debug_info.append(f"No compose file found, attempting to stop by project name: {project_name}")
            
            # Execute docker-compose down
            compose = DockerComposeExecutor(compose_path, project_name)
            
            # Build additional flags
            extra_args = []
            if remove_volumes:
                extra_args.append("--volumes")
            if remove_images:
                extra_args.append("--rmi")
                extra_args.append("all")
            
            # Custom down method with extra arguments
            async def down_with_options():
                if compose_path:
                    cmd = ["docker-compose", "-f", compose_path, "-p", project_name, "down"] + extra_args
                else:
                    cmd = ["docker-compose", "-p", project_name, "down"] + extra_args
                
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                return process.returncode, stdout.decode(), stderr.decode()
            
            code, out, err = await down_with_options()
            
            debug_info.extend([
                f"\n=== Docker Compose Down ===",
                f"Return Code: {code}",
                f"Stdout: {out}",
                f"Stderr: {err}"
            ])
            
            if code == 0:
                result = f"Successfully stopped and removed compose stack '{project_name}'"
                if remove_volumes:
                    result += " (volumes removed)"
                if remove_images:
                    result += " (images removed)"
                result += f"\n\nOutput:\n{out}"
            else:
                result = f"Failed to stop compose stack '{project_name}': {err}"
            
            return [TextContent(type="text", text=f"{result}\n\nDebug Info:\n{chr(10).join(debug_info)}")]
            
        except Exception as e:
            debug_output = "\n".join(debug_info)
            return [TextContent(type="text", text=f"Error stopping compose stack: {str(e)}\n\nDebug Information:\n{debug_output}")]

    @staticmethod
    async def handle_get_container_stats(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            container_name = arguments.get("container_name")
            if not container_name:
                raise ValueError("Missing required container_name")
            
            # Get stats directly from docker_client.container.stats
            stats_list = await asyncio.to_thread(docker_client.container.stats, container_name)
            
            # python-on-whales returns a list of ContainerStats objects
            if not stats_list or len(stats_list) == 0:
                return [TextContent(type="text", text=f"No stats available for container '{container_name}'")]
            
            # Get the first (and usually only) stats object
            stats = stats_list[0]
            
            # Extract data from ContainerStats object
            # The stats object has attributes instead of dict keys
            try:
                # CPU percentage (already calculated by python-on-whales)
                cpu_percent = stats.cpu_percentage if hasattr(stats, 'cpu_percentage') else 0.0
                
                # Memory usage
                memory_usage = stats.memory_used if hasattr(stats, 'memory_used') else 0
                memory_limit = stats.memory_limit if hasattr(stats, 'memory_limit') else 0
                memory_percent = stats.memory_percentage if hasattr(stats, 'memory_percentage') else 0
                
                # Network I/O (might be aggregated)
                network_rx = stats.network_rx_bytes if hasattr(stats, 'network_rx_bytes') else 0
                network_tx = stats.network_tx_bytes if hasattr(stats, 'network_tx_bytes') else 0
                
                # Block I/O
                block_read = stats.blkio_read_bytes if hasattr(stats, 'blkio_read_bytes') else 0
                block_write = stats.blkio_write_bytes if hasattr(stats, 'blkio_write_bytes') else 0
                
                # Format the stats
                stats_info = f"""Container Stats for '{container_name}':

CPU Usage: {cpu_percent:.2f}%
Memory Usage: {memory_usage / (1024*1024):.2f} MB / {memory_limit / (1024*1024):.2f} MB ({memory_percent:.2f}%)
Network I/O: RX {network_rx / (1024*1024):.2f} MB / TX {network_tx / (1024*1024):.2f} MB
Block I/O: Read {block_read / (1024*1024):.2f} MB / Write {block_write / (1024*1024):.2f} MB"""
                
                return [TextContent(type="text", text=stats_info)]
                
            except AttributeError as ae:
                # If the object doesn't have expected attributes, show what it has
                available_attrs = [attr for attr in dir(stats) if not attr.startswith('_')]
                return [TextContent(type="text", text=f"Error: ContainerStats object structure is different than expected.\nAvailable attributes: {', '.join(available_attrs)}\nError: {str(ae)}")]
                
        except Exception as e:
            return [TextContent(type="text", text=f"Error getting container stats: {str(e)}")]
    
    @staticmethod
    async def handle_exec_container(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            container_name = arguments.get("container_name")
            command = arguments.get("command")
            
            if not container_name or not command:
                raise ValueError("Missing required container_name or command")
            
            # Optional parameters
            user = arguments.get("user")
            workdir = arguments.get("workdir")
            env = arguments.get("env", {})
            privileged = arguments.get("privileged", False)
            detach = arguments.get("detach", False)
            
            # Build exec kwargs
            exec_kwargs = {}
            if user:
                exec_kwargs["user"] = user
            if workdir:
                exec_kwargs["workdir"] = workdir
            if env:
                exec_kwargs["environment"] = env
            if privileged:
                exec_kwargs["privileged"] = privileged
            if detach:
                exec_kwargs["detach"] = detach
            
            # Execute the command
            # Split command into list if it's a string
            if isinstance(command, str):
                import shlex
                command_list = shlex.split(command)
            else:
                command_list = command
            
            result = await asyncio.to_thread(
                docker_client.container.execute,
                container_name,
                command_list,
                **exec_kwargs
            )
            
            if detach:
                return [TextContent(type="text", text=f"Command executed in background in container '{container_name}'")]
            else:
                # Format output
                output = f"Executed in container '{container_name}':\n$ {command}\n\n"
                if result:
                    output += str(result)
                else:
                    output += "(No output)"
                
                return [TextContent(type="text", text=output)]
                
        except Exception as e:
            error_msg = str(e)
            if "No such container" in error_msg:
                return [TextContent(type="text", text=f"Container '{container_name}' not found. Please use 'list-containers' to see available containers.")]
            elif "is not running" in error_msg:
                return [TextContent(type="text", text=f"Container '{container_name}' is not running. Only running containers can execute commands.")]
            else:
                return [TextContent(type="text", text=f"Error executing command: {error_msg}")]
    
    @staticmethod
    async def handle_compose_ps(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            project_name = arguments.get("project_name")
            if not project_name:
                raise ValueError("Missing required project_name")
            
            show_all = arguments.get("all", False)
            
            # Get containers with compose project label
            containers = await asyncio.to_thread(docker_client.container.list, all=show_all)
            
            # Filter by compose project
            compose_containers = []
            for c in containers:
                labels = c.config.labels
                if labels.get("com.docker.compose.project") == project_name:
                    compose_containers.append(c)
            
            if not compose_containers:
                return [TextContent(type="text", text=f"No containers found for project '{project_name}'")]
            
            # Format output similar to docker-compose ps
            output_lines = [f"Containers for project '{project_name}':", ""]
            output_lines.append(f"{'SERVICE':<20} {'STATUS':<20} {'PORTS'}")
            output_lines.append("-" * 70)
            
            for c in compose_containers:
                service_name = c.config.labels.get("com.docker.compose.service", "unknown")
                status = c.state.status
                
                # Get ports
                ports = []
                try:
                    inspect_data = await asyncio.to_thread(docker_client.container.inspect, c.name)
                    port_bindings = inspect_data.network_settings.ports
                    if port_bindings:
                        for container_port, host_bindings in port_bindings.items():
                            if host_bindings:
                                for binding in host_bindings:
                                    host_port = binding.get('HostPort', '')
                                    if host_port:
                                        ports.append(f"{host_port}->{container_port}")
                except:
                    pass
                
                ports_str = ", ".join(ports) if ports else "No ports"
                output_lines.append(f"{service_name:<20} {status:<20} {ports_str}")
            
            output_lines.append(f"\nTotal: {len(compose_containers)} container(s)")
            
            return [TextContent(type="text", text="\n".join(output_lines))]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Error listing compose containers: {str(e)}")]
    
    @staticmethod
    async def handle_compose_logs(arguments: Dict[str, Any]) -> List[TextContent]:
        try:
            project_name = arguments.get("project_name")
            if not project_name:
                raise ValueError("Missing required project_name")
            
            service = arguments.get("service")
            tail = arguments.get("tail", 100)
            follow = arguments.get("follow", False)
            timestamps = arguments.get("timestamps", False)
            
            # Get containers for the project
            containers = await asyncio.to_thread(docker_client.container.list, all=True)
            
            # Filter by compose project and optionally by service
            target_containers = []
            for c in containers:
                labels = c.config.labels
                if labels.get("com.docker.compose.project") == project_name:
                    if not service or labels.get("com.docker.compose.service") == service:
                        target_containers.append(c)
            
            if not target_containers:
                if service:
                    return [TextContent(type="text", text=f"No containers found for service '{service}' in project '{project_name}'")]
                else:
                    return [TextContent(type="text", text=f"No containers found for project '{project_name}'")]
            
            # Collect logs from all containers
            output_lines = [f"Logs for project '{project_name}'"]
            if service:
                output_lines[0] += f" (service: {service})"
            output_lines.append("=" * 60)
            
            for c in target_containers:
                service_name = c.config.labels.get("com.docker.compose.service", "unknown")
                container_num = c.config.labels.get("com.docker.compose.container-number", "1")
                
                # Build log kwargs
                log_kwargs = {
                    "tail": tail,
                    "follow": follow,
                    "timestamps": timestamps
                }
                
                try:
                    logs = await asyncio.to_thread(docker_client.container.logs, c.name, **log_kwargs)
                    
                    # Add service prefix to each log line
                    if logs:
                        log_lines = logs.strip().split('\n')
                        for line in log_lines:
                            output_lines.append(f"[{service_name}_{container_num}] {line}")
                except Exception as e:
                    output_lines.append(f"[{service_name}_{container_num}] Error getting logs: {str(e)}")
            
            return [TextContent(type="text", text="\n".join(output_lines))]
            
        except Exception as e:
            return [TextContent(type="text", text=f"Error getting compose logs: {str(e)}")]
