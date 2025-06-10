#!/usr/bin/env python3
"""
Automated Sanity Studio deployment
"""

import subprocess
import time
import sys

def deploy_studio():
    print("🚀 Starting Sanity Studio deployment...")
    print("Project ID: uvuq2a47")
    
    # Start the deploy process
    process = subprocess.Popen(
        ['npx', 'sanity', 'deploy'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0
    )
    
    try:
        # Wait a bit for the prompt to appear
        time.sleep(2)
        
        # Send arrow down to select "Create new studio hostname"
        process.stdin.write('\033[B\n')  # Arrow down + Enter
        process.stdin.flush()
        
        time.sleep(1)
        
        # Type the hostname
        hostname = "thecryptofrontier-new"
        print(f"Setting hostname: {hostname}")
        process.stdin.write(f"{hostname}\n")
        process.stdin.flush()
        
        # Wait for completion
        stdout, stderr = process.communicate(timeout=60)
        
        if process.returncode == 0:
            print(f"\n✅ Deploy successful!")
            print(f"Studio URL: https://{hostname}.sanity.studio")
        else:
            print(f"\n❌ Deploy failed with code {process.returncode}")
            print(f"Error: {stderr}")
            
    except subprocess.TimeoutExpired:
        process.kill()
        print("\n❌ Deploy timed out")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        process.kill()

if __name__ == "__main__":
    deploy_studio()