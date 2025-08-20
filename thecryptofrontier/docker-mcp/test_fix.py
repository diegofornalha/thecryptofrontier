#!/usr/bin/env python3
import asyncio
from python_on_whales import DockerClient

async def test_stop():
    docker_client = DockerClient()
    
    # Lista containers primeiro
    containers = await asyncio.to_thread(docker_client.container.list, all=True)
    print("Containers disponíveis:")
    for c in containers[:5]:  # Mostra apenas os primeiros 5
        print(f"  - {c.name} ({c.state.status})")
    
    # Tenta parar o container agentes-sse-proxy
    try:
        print("\nParando container agentes-sse-proxy...")
        await asyncio.to_thread(docker_client.container.stop, "agentes-sse-proxy")
        print("✓ Container parado com sucesso!")
    except Exception as e:
        print(f"✗ Erro ao parar container: {e}")
        
        # Tenta o método antigo (que deveria falhar)
        try:
            print("\nTestando método antigo (deve falhar)...")
            container = await asyncio.to_thread(docker_client.containers.get, "agentes-sse-proxy")
            print("Isso não deveria funcionar!")
        except AttributeError as ae:
            print(f"✓ Confirmado: {ae}")

if __name__ == "__main__":
    asyncio.run(test_stop())