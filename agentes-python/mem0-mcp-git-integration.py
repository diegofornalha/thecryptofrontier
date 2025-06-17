"""
Integração do MCP Mem0 com Auto Commit Agent
Permite que o MCP Mem0 use as credenciais SSH armazenadas pelo Auto Commit Agent
"""

from mcp.server.fastmcp import FastMCP
import json
import os
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any

# Adicionar ao seu MCP Mem0 existente
def add_git_tools_to_mem0_mcp(mcp: FastMCP):
    """Adiciona ferramentas Git ao MCP Mem0 usando credenciais do Auto Commit Agent"""
    
    # Caminho para credenciais compartilhadas
    CREDENTIALS_PATH = Path.cwd() / '.diego-tools' / 'credentials'
    SSH_KEY_PATH = Path.cwd() / '.diego-tools' / 'ssh-key'
    
    def get_ssh_command() -> Optional[str]:
        """Obtém comando SSH se credenciais existirem"""
        if CREDENTIALS_PATH.exists():
            try:
                with open(CREDENTIALS_PATH, 'r') as f:
                    creds = json.load(f)
                    if creds.get('type') == 'ssh-key' and SSH_KEY_PATH.exists():
                        return f'ssh -i {SSH_KEY_PATH} -o StrictHostKeyChecking=no'
            except:
                pass
        return None
    
    def execute_git_command(command: str) -> Dict[str, Any]:
        """Executa comando git com SSH do Auto Commit Agent"""
        env = os.environ.copy()
        ssh_cmd = get_ssh_command()
        
        if ssh_cmd:
            env['GIT_SSH_COMMAND'] = ssh_cmd
            
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
                'output': result.stdout,
                'error': result.stderr
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @mcp.tool(
        description="Faz commit e push automático usando credenciais SSH do Auto Commit Agent. "
                   "Útil para salvar código e fazer backup automaticamente."
    )
    async def auto_commit_and_push(message: str, files: Optional[str] = ".") -> str:
        """Commit e push usando credenciais do Auto Commit Agent
        
        Args:
            message: Mensagem do commit
            files: Arquivos para adicionar (padrão: todos)
        """
        # Verificar se tem credenciais
        if not get_ssh_command():
            return "❌ Sem credenciais SSH. O Auto Commit Agent precisa configurar uma chave primeiro."
        
        # Git add
        add_result = execute_git_command(f"git add {files}")
        if not add_result['success']:
            return f"❌ Erro no git add: {add_result['error']}"
        
        # Git commit
        commit_result = execute_git_command(f'git commit -m "{message}"')
        if not commit_result['success']:
            if "nothing to commit" in commit_result['error']:
                return "ℹ️ Nada para commitar"
            return f"❌ Erro no commit: {commit_result['error']}"
        
        # Git push
        push_result = execute_git_command("git push")
        if push_result['success']:
            return f"✅ Commit e push realizados!\n{commit_result['output']}"
        else:
            # Tentar com upstream
            branch_result = execute_git_command("git branch --show-current")
            if branch_result['success']:
                branch = branch_result['output'].strip()
                upstream_result = execute_git_command(f"git push -u origin {branch}")
                if upstream_result['success']:
                    return f"✅ Commit e push realizados (com upstream)!\n{commit_result['output']}"
            
            return f"❌ Erro no push: {push_result['error']}"
    
    @mcp.tool(
        description="Verifica status das credenciais SSH compartilhadas pelo Auto Commit Agent"
    )
    async def check_git_credentials() -> str:
        """Verifica se existem credenciais SSH configuradas"""
        if not CREDENTIALS_PATH.exists():
            return "❌ Nenhuma credencial encontrada. O Auto Commit Agent precisa armazenar uma chave SSH primeiro."
        
        try:
            with open(CREDENTIALS_PATH, 'r') as f:
                creds = json.load(f)
            
            info = f"✅ Credenciais encontradas:\n"
            info += f"  Tipo: {creds.get('type')}\n"
            info += f"  Agente: {creds.get('agent')}\n"
            info += f"  Criado em: {creds.get('createdAt')}\n"
            info += f"  Chave SSH existe: {'Sim' if SSH_KEY_PATH.exists() else 'Não'}"
            
            return info
        except Exception as e:
            return f"❌ Erro ao ler credenciais: {str(e)}"
    
    @mcp.tool(
        description="Armazena código no Mem0 e faz backup automático no git"
    )
    async def store_code_with_backup(code: str, description: str, commit_message: Optional[str] = None) -> str:
        """Armazena código no Mem0 e faz commit/push automático
        
        Args:
            code: Código para armazenar
            description: Descrição do código para o Mem0
            commit_message: Mensagem do commit (opcional)
        """
        # Primeiro armazenar no Mem0
        from . import add_coding_preference
        mem0_result = await add_coding_preference(f"{description}\n\n```\n{code}\n```")
        
        # Depois fazer backup no git
        if not commit_message:
            commit_message = f"[Mem0] Backup: {description[:50]}..."
        
        git_result = await auto_commit_and_push(commit_message)
        
        return f"{mem0_result}\n\n{git_result}"
    
    return mcp

# Exemplo de uso: adicionar ao seu servidor MCP existente
# if __name__ == "__main__":
#     mcp = FastMCP("mem0-mcp")
#     mcp = add_git_tools_to_mem0_mcp(mcp)
#     # ... resto do código do servidor ...