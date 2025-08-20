#!/usr/bin/env python3
"""
Ponte de Credenciais entre TypeScript e Python
Permite que MCPs Python acessem credenciais armazenadas pelo Auto Commit Agent
"""

import json
import os
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

class CredentialsBridge:
    """Gerenciador de credenciais compartilhadas para Python MCP"""
    
    def __init__(self, base_path: Optional[str] = None):
        self.base_path = Path(base_path) if base_path else Path.cwd()
        self.credentials_dir = self.base_path / '.diego-tools'
        self.credentials_file = self.credentials_dir / 'credentials'
    
    def get_shared_credentials(self) -> Optional[Dict[str, Any]]:
        """Lê as credenciais compartilhadas"""
        try:
            if not self.credentials_file.exists():
                return None
            
            with open(self.credentials_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erro ao ler credenciais: {e}")
            return None
    
    def get_ssh_key_path(self) -> Optional[str]:
        """Obtém o caminho da chave SSH se disponível"""
        credentials = self.get_shared_credentials()
        
        if not credentials or credentials.get('type') != 'ssh-key':
            return None
        
        key_path = credentials.get('path')
        if key_path and Path(key_path).exists():
            return key_path
        
        return None
    
    def get_ssh_key_content(self) -> Optional[str]:
        """Obtém o conteúdo da chave SSH"""
        key_path = self.get_ssh_key_path()
        
        if not key_path:
            return None
        
        try:
            with open(key_path, 'r') as f:
                return f.read()
        except Exception as e:
            print(f"Erro ao ler chave SSH: {e}")
            return None
    
    def execute_git_with_ssh(self, command: str) -> Dict[str, Any]:
        """Executa comando git com SSH personalizado"""
        ssh_key_path = self.get_ssh_key_path()
        
        if ssh_key_path:
            # Configurar GIT_SSH_COMMAND
            env = os.environ.copy()
            env['GIT_SSH_COMMAND'] = f'ssh -i {ssh_key_path} -o StrictHostKeyChecking=no'
            
            print(f"🔑 Usando chave SSH compartilhada: {ssh_key_path}")
        else:
            env = os.environ.copy()
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                env=env
            )
            
            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def save_credentials(self, credentials: Dict[str, Any]) -> bool:
        """Salva novas credenciais (compatível com formato TypeScript)"""
        try:
            # Criar diretório se não existir
            self.credentials_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
            
            # Adicionar timestamp se não existir
            if 'createdAt' not in credentials:
                credentials['createdAt'] = datetime.now().isoformat()
            
            # Salvar credenciais
            with open(self.credentials_file, 'w') as f:
                json.dump(credentials, f, indent=2)
            
            # Definir permissões restritas
            os.chmod(self.credentials_file, 0o600)
            
            return True
        except Exception as e:
            print(f"Erro ao salvar credenciais: {e}")
            return False
    
    def has_credentials(self) -> bool:
        """Verifica se existem credenciais compartilhadas"""
        return self.credentials_file.exists()
    
    def get_credentials_info(self) -> Optional[Dict[str, Any]]:
        """Obtém informações sobre as credenciais sem expor o conteúdo"""
        credentials = self.get_shared_credentials()
        
        if not credentials:
            return None
        
        return {
            'type': credentials.get('type'),
            'agent': credentials.get('agent'),
            'createdAt': credentials.get('createdAt'),
            'hasKey': self.get_ssh_key_path() is not None
        }


# Funções utilitárias para uso direto
def git_push_with_shared_ssh(branch: Optional[str] = None) -> Dict[str, Any]:
    """Push usando credenciais compartilhadas"""
    bridge = CredentialsBridge()
    command = f"git push{f' origin {branch}' if branch else ''}"
    return bridge.execute_git_with_ssh(command)


def git_pull_with_shared_ssh(branch: Optional[str] = None) -> Dict[str, Any]:
    """Pull usando credenciais compartilhadas"""
    bridge = CredentialsBridge()
    command = f"git pull{f' origin {branch}' if branch else ''}"
    return bridge.execute_git_with_ssh(command)


def git_clone_with_shared_ssh(repo_url: str, directory: Optional[str] = None) -> Dict[str, Any]:
    """Clone usando credenciais compartilhadas"""
    bridge = CredentialsBridge()
    command = f"git clone {repo_url}{f' {directory}' if directory else ''}"
    return bridge.execute_git_with_ssh(command)


# Exemplo de uso
if __name__ == "__main__":
    bridge = CredentialsBridge()
    
    # Verificar status das credenciais
    print("Status das credenciais:")
    info = bridge.get_credentials_info()
    if info:
        print(f"  Tipo: {info['type']}")
        print(f"  Agente: {info['agent']}")
        print(f"  Criado em: {info['createdAt']}")
        print(f"  Tem chave: {'Sim' if info['hasKey'] else 'Não'}")
    else:
        print("  Nenhuma credencial encontrada")
    
    # Testar comando git
    if bridge.has_credentials():
        print("\nTestando git status com SSH:")
        result = bridge.execute_git_with_ssh("git status")
        if result['success']:
            print("✅ Comando executado com sucesso")
        else:
            print("❌ Erro na execução")