"""
Integração Auto Commit Agent + Mem0
Gerencia histórico de chaves SSH e notificações
"""

from mem0 import MemoryClient
from pathlib import Path
import json
from datetime import datetime
from typing import Optional, Dict, Any

class AutoCommitMem0Integration:
    """Integração do Auto Commit Agent com Mem0 para gestão de credenciais"""
    
    def __init__(self, mem0_client: MemoryClient, user_id: str = "auto-commit-agent"):
        self.mem0 = mem0_client
        self.user_id = user_id
        self.credentials_path = Path.cwd() / '.diego-tools' / 'credentials'
        self.notifications_path = Path.cwd() / '.diego-tools' / 'notifications.json'
    
    async def check_for_key_failures(self) -> Optional[Dict[str, Any]]:
        """Verifica se há notificações de falha de chave"""
        if not self.notifications_path.exists():
            return None
        
        try:
            with open(self.notifications_path, 'r') as f:
                notifications = json.load(f)
            
            # Procurar por falhas recentes
            key_failures = [n for n in notifications if n['type'] == 'ssh-key-failure']
            
            if key_failures:
                latest = key_failures[-1]
                # Armazenar no Mem0
                await self.mem0.add(
                    [{"role": "system", "content": f"SSH key failure detected at {latest['timestamp']}. User needs to provide new SSH key."}],
                    user_id=self.user_id,
                    metadata={"type": "ssh_key_failure", "timestamp": latest['timestamp']}
                )
                return latest
        except Exception as e:
            print(f"Erro ao verificar notificações: {e}")
        
        return None
    
    async def store_key_rotation(self, old_key_info: Dict, new_key_info: Dict):
        """Armazena histórico de rotação de chaves no Mem0"""
        rotation_info = {
            "event": "ssh_key_rotation",
            "timestamp": datetime.now().isoformat(),
            "old_key": {
                "created_at": old_key_info.get('createdAt'),
                "agent": old_key_info.get('agent')
            },
            "new_key": {
                "created_at": new_key_info.get('createdAt'),
                "agent": new_key_info.get('agent')
            }
        }
        
        # Armazenar no Mem0
        await self.mem0.add(
            [{"role": "system", "content": f"SSH key rotated. Old key from {old_key_info.get('createdAt')} replaced with new key."}],
            user_id=self.user_id,
            metadata=rotation_info
        )
    
    async def get_key_history(self) -> list:
        """Recupera histórico de chaves do Mem0"""
        # Buscar todas as memórias relacionadas a chaves SSH
        memories = await self.mem0.search(
            "SSH key rotation history",
            user_id=self.user_id
        )
        
        return memories.get('results', [])
    
    async def request_new_key(self) -> str:
        """Cria solicitação de nova chave SSH"""
        request = {
            "type": "key_request",
            "timestamp": datetime.now().isoformat(),
            "reason": "Previous key failed authentication",
            "status": "pending"
        }
        
        # Armazenar solicitação no Mem0
        await self.mem0.add(
            [{"role": "assistant", "content": "Diego, preciso de uma nova chave SSH. A chave anterior falhou na autenticação. Por favor, forneça uma nova chave SSH privada."}],
            user_id=self.user_id,
            metadata=request
        )
        
        return "🔑 Solicitação de nova chave SSH criada. Diego, por favor forneça uma nova chave."
    
    async def validate_and_store_new_key(self, ssh_key: str) -> Dict[str, Any]:
        """Valida e armazena nova chave com histórico"""
        # Verificar formato básico
        if not ("BEGIN" in ssh_key and "END" in ssh_key):
            return {"success": False, "error": "Formato de chave inválido"}
        
        # Obter informação da chave antiga se existir
        old_key_info = None
        if self.credentials_path.exists():
            with open(self.credentials_path, 'r') as f:
                old_key_info = json.load(f)
        
        # Criar nova entrada de credenciais
        new_key_info = {
            "type": "ssh-key",
            "path": str(Path.cwd() / '.diego-tools' / 'ssh-key'),
            "createdAt": datetime.now().isoformat(),
            "agent": "auto-commit-agent",
            "validated": True
        }
        
        # Se tinha chave antiga, registrar rotação
        if old_key_info:
            await self.store_key_rotation(old_key_info, new_key_info)
        
        # Armazenar sucesso no Mem0
        await self.mem0.add(
            [{"role": "system", "content": f"New SSH key successfully stored and validated at {new_key_info['createdAt']}"}],
            user_id=self.user_id,
            metadata={"type": "key_storage", "success": True}
        )
        
        return {"success": True, "info": new_key_info}

# Funções para adicionar ao MCP Mem0
def add_auto_commit_tools_to_mem0(mcp, mem0_client):
    """Adiciona ferramentas de gestão de chaves SSH ao MCP Mem0"""
    
    integration = AutoCommitMem0Integration(mem0_client)
    
    @mcp.tool(
        description="Verifica se há falhas de autenticação SSH e solicita nova chave se necessário"
    )
    async def check_ssh_key_status() -> str:
        """Verifica status da chave SSH e falhas recentes"""
        failure = await integration.check_for_key_failures()
        
        if failure:
            return await integration.request_new_key()
        
        # Verificar se existe chave atual
        if integration.credentials_path.exists():
            with open(integration.credentials_path, 'r') as f:
                creds = json.load(f)
            return f"✅ Chave SSH ativa desde {creds.get('createdAt')}"
        
        return "❌ Nenhuma chave SSH configurada. Diego, forneça uma chave SSH."
    
    @mcp.tool(
        description="Armazena nova chave SSH com validação e histórico"
    )
    async def store_new_ssh_key(ssh_key: str) -> str:
        """Armazena e valida nova chave SSH"""
        result = await integration.validate_and_store_new_key(ssh_key)
        
        if result['success']:
            # Também precisa salvar fisicamente a chave
            key_path = Path.cwd() / '.diego-tools' / 'ssh-key'
            key_path.parent.mkdir(exist_ok=True, mode=0o700)
            key_path.write_text(ssh_key)
            key_path.chmod(0o600)
            
            # Salvar metadados
            integration.credentials_path.write_text(json.dumps(result['info'], indent=2))
            
            return f"✅ Nova chave SSH armazenada com sucesso!\n📅 Criada em: {result['info']['createdAt']}"
        
        return f"❌ Erro ao armazenar chave: {result.get('error')}"
    
    @mcp.tool(
        description="Mostra histórico de rotação de chaves SSH"
    )
    async def get_ssh_key_history() -> str:
        """Recupera histórico de chaves SSH"""
        history = await integration.get_key_history()
        
        if not history:
            return "📋 Nenhum histórico de chaves encontrado"
        
        output = "📋 Histórico de Chaves SSH:\n"
        for memory in history:
            output += f"- {memory.get('memory', 'N/A')}\n"
        
        return output
    
    return mcp