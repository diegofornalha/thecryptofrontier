#!/usr/bin/env python3
"""
Script para testar a conexão com o Redis
Verifica se a conexão com Redis está funcionando e mostra configurações
"""

import sys
import time
from redis_tools import (
    redis_client, get_redis_client, 
    RedisMemoryTool, RedisFeedCache, RedisArticleQueue,
    REDIS_HOST, REDIS_PORT, REDIS_DB
)

def print_header(text):
    """Imprime um cabeçalho formatado no console."""
    print("\n" + "=" * 60)
    print(f" {text.upper()}")
    print("=" * 60)

def test_connection():
    """Testa a conexão básica com o Redis."""
    print_header("VERIFICANDO CONEXÃO COM REDIS")
    
    print(f"Configuração:")
    print(f"- Host: {REDIS_HOST}")
    print(f"- Porta: {REDIS_PORT}")
    print(f"- DB: {REDIS_DB}")
    
    try:
        # Testar conexão com o cliente Redis global
        if redis_client is None:
            print("\n❌ Cliente Redis global indisponível")
            print("Tentando criar um novo cliente com retry...")
            
            # Tentar criar um novo cliente
            client = get_redis_client()
            
            if client:
                print("✅ Novo cliente Redis criado com sucesso")
                pong = client.ping()
                print(f"Resposta do PING: {pong}")
            else:
                print("❌ Falha ao criar novo cliente Redis")
                return False
                
        else:
            print("\nTestando cliente Redis global...")
            # Testar o cliente global
            pong = redis_client.ping()
            print(f"✅ Resposta do PING: {pong}")
            
            # Validar versão do Redis
            info = redis_client.info()
            print(f"Versão do Redis: {info.get('redis_version')}")
            print(f"Modo: {info.get('redis_mode', 'standalone')}")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro ao conectar com Redis: {str(e)}")
        print("Verifique se o servidor Redis está em execução")
        print("Verifique se a porta 6380 está correta (docker run -p 6380:6379)")
        return False

def test_memory_tool():
    """Testa a ferramenta RedisMemoryTool."""
    print_header("TESTANDO REDIS MEMORY TOOL")
    
    try:
        # Criar instância
        memory_tool = RedisMemoryTool()
        print("Instância RedisMemoryTool criada")
        
        # Salvar dados
        agent_id = "test_agent"
        key = "test_context"
        data = {
            "timestamp": time.time(),
            "message": "Teste de contexto",
            "metadata": {
                "version": "1.0",
                "environment": "test"
            }
        }
        
        print(f"Salvando contexto para agente '{agent_id}', chave '{key}'...")
        result = memory_tool.save_context(agent_id, key, data)
        
        if result:
            print("✅ Contexto salvo com sucesso")
        else:
            print("❌ Falha ao salvar contexto")
            return False
            
        # Recuperar dados
        print(f"Recuperando contexto para agente '{agent_id}', chave '{key}'...")
        retrieved_data = memory_tool.get_context(agent_id, key)
        
        if retrieved_data:
            print("✅ Contexto recuperado com sucesso")
            print(f"Dados recuperados: {retrieved_data}")
            
            # Verificar se os dados são iguais
            if retrieved_data == data:
                print("✅ Dados recuperados correspondem aos dados salvos")
            else:
                print("⚠️ Dados recuperados NÃO correspondem aos dados salvos")
        else:
            print("❌ Falha ao recuperar contexto")
            return False
            
        # Listar contextos
        print(f"Listando contextos para agente '{agent_id}'...")
        contexts = memory_tool.list_contexts(agent_id)
        print(f"Contextos encontrados: {contexts}")
        
        # Deletar contexto
        print(f"Deletando contexto para agente '{agent_id}', chave '{key}'...")
        result = memory_tool.delete_context(agent_id, key)
        
        if result:
            print("✅ Contexto deletado com sucesso")
            
            # Confirmar deleção
            check = memory_tool.get_context(agent_id, key)
            if check is None:
                print("✅ Contexto não encontrado após deleção (correto)")
            else:
                print("⚠️ Contexto ainda existe após deleção (incorreto)")
        else:
            print("❌ Falha ao deletar contexto")
            
        return True
            
    except Exception as e:
        print(f"❌ Erro ao testar RedisMemoryTool: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def test_article_queue():
    """Testa a fila de artigos RedisArticleQueue."""
    print_header("TESTANDO REDIS ARTICLE QUEUE")
    
    try:
        # Criar instância
        queue = RedisArticleQueue()
        print("Instância RedisArticleQueue criada")
        
        # Verificar estatísticas iniciais
        stats = queue.get_queue_stats()
        print(f"Estatísticas iniciais: {stats}")
        
        # Criar artigo de teste
        article = {
            "title": "Artigo de Teste Redis",
            "content": "Este é um artigo de teste para verificar a funcionalidade da fila Redis.",
            "timestamp": time.time(),
            "tags": ["test", "redis", "queue"]
        }
        
        # Enfileirar artigo
        print("Enfileirando artigo de teste...")
        result = queue.queue_article(article)
        
        if result:
            print("✅ Artigo enfileirado com sucesso")
        else:
            print("❌ Falha ao enfileirar artigo")
            return False
            
        # Verificar estatísticas após enfileirar
        stats_after_queue = queue.get_queue_stats()
        print(f"Estatísticas após enfileirar: {stats_after_queue}")
        
        # Obter próximo artigo
        print("Obtendo próximo artigo da fila...")
        next_article = queue.get_next_article()
        
        if next_article:
            print("✅ Artigo obtido com sucesso")
            print(f"Título do artigo: {next_article.get('title')}")
            
            # Verificar se é o mesmo artigo
            if next_article.get('title') == article.get('title'):
                print("✅ Artigo obtido corresponde ao artigo enfileirado")
            else:
                print("⚠️ Artigo obtido NÃO corresponde ao artigo enfileirado")
        else:
            print("❌ Falha ao obter próximo artigo")
            return False
            
        # Verificar estatísticas após obter
        stats_after_get = queue.get_queue_stats()
        print(f"Estatísticas após obter: {stats_after_get}")
        
        # Marcar como concluído
        print("Marcando artigo como concluído...")
        result = queue.mark_completed(next_article)
        
        if result:
            print("✅ Artigo marcado como concluído com sucesso")
        else:
            print("❌ Falha ao marcar artigo como concluído")
            
        # Verificar estatísticas finais
        stats_final = queue.get_queue_stats()
        print(f"Estatísticas finais: {stats_final}")
        
        # Verificar consistência das estatísticas
        if (stats_final.get('pending', 0) == stats.get('pending', 0) and 
            stats_final.get('completed', 0) > stats.get('completed', 0) and
            stats_final.get('processing', 0) == stats.get('processing', 0)):
            print("✅ Estatísticas consistentes com o fluxo de processamento")
        else:
            print("⚠️ Estatísticas inconsistentes com o fluxo de processamento")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar RedisArticleQueue: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

def main():
    """Função principal."""
    print("\n🧪 TESTE DE INTEGRAÇÃO COM REDIS\n")
    
    # Testar conexão
    connection_ok = test_connection()
    
    if not connection_ok:
        print("\n❌ Teste de conexão falhou. Abortando testes adicionais.")
        sys.exit(1)
    
    # Testar RedisMemoryTool
    memory_ok = test_memory_tool()
    
    # Testar RedisArticleQueue
    queue_ok = test_article_queue()
    
    # Resumo
    print_header("RESUMO DOS TESTES")
    print(f"Conexão Redis: {'✅ OK' if connection_ok else '❌ FALHA'}")
    print(f"RedisMemoryTool: {'✅ OK' if memory_ok else '❌ FALHA'}")
    print(f"RedisArticleQueue: {'✅ OK' if queue_ok else '❌ FALHA'}")
    
    # Status geral
    if connection_ok and memory_ok and queue_ok:
        print("\n✅ TODOS OS TESTES PASSARAM COM SUCESSO")
        print("O Redis está configurado corretamente e pronto para uso.")
    else:
        print("\n❌ ALGUNS TESTES FALHARAM")
        print("Verifique os logs acima para identificar e corrigir os problemas.")
    
if __name__ == "__main__":
    main()