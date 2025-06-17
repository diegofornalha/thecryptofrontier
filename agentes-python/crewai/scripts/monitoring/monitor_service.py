#!/usr/bin/env python3
"""
Serviço de monitoramento RSS com systemd
Para instalação como serviço do sistema
"""

import os
import sys
from pathlib import Path

# Adicionar diretório do projeto ao PYTHONPATH
project_dir = Path(__file__).parent
sys.path.insert(0, str(project_dir))

from rss_monitor import RSSMonitor

def create_systemd_service():
    """Cria arquivo de serviço systemd"""
    service_content = f"""[Unit]
Description=RSS Monitor para The Crypto Basic
After=network.target

[Service]
Type=simple
User={os.getenv('USER', 'strapi')}
WorkingDirectory={project_dir}
ExecStart=/usr/bin/python3 {project_dir}/rss_monitor.py
Restart=always
RestartSec=30
StandardOutput=append:{project_dir}/rss_monitor.log
StandardError=append:{project_dir}/rss_monitor_error.log

[Install]
WantedBy=multi-user.target
"""
    
    service_file = Path.home() / '.config' / 'systemd' / 'user' / 'rss-monitor.service'
    service_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(service_file, 'w') as f:
        f.write(service_content)
    
    print(f"Serviço criado em: {service_file}")
    print("\nPara instalar o serviço:")
    print("systemctl --user daemon-reload")
    print("systemctl --user enable rss-monitor.service")
    print("systemctl --user start rss-monitor.service")
    print("\nPara verificar status:")
    print("systemctl --user status rss-monitor.service")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--install-service':
        create_systemd_service()
    else:
        # Executar monitor
        monitor = RSSMonitor()
        monitor.run()