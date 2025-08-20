import os
import shutil
from python_on_whales import DockerClient

print(f"PATH: {os.environ.get('PATH')}")
print(f"Docker location: {shutil.which('docker')}")

try:
    client = DockerClient()
    version = client.version()
    print(f"Docker version: {version}")
except Exception as e:
    print(f"Error: {e}")