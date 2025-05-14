#!/usr/bin/env python3
"""Script principal para o fluxo RSS -> Sanity"""

from crew import RSSToSanityCrew
import os
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path para poder importar o módulo redis_tools
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from backup_legado_aprendizados.redis_tools import RedisArticleQueue, redis_client

# Feeds RSS de criptomoedas
CRYPTO_RSS_FEEDS = [
    "https://cointelegraph.com/rss",
    "https://decrypt.co/feed",
    "https://bitcoinmagazine.com/.rss/full/"
]

def check_redis_connection():
    """Verifica se o Redis está disponível"""
    try:
        redis_client.ping()
        print("✅ Conexão com Redis estabelecida com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar com Redis: {str(e)}")
        print("Por favor, certifique-se que o Redis está em execução.")
        print("Você pode instalar o Redis com: sudo apt-get install redis-server")
        print("E iniciá-lo com: sudo service redis-server start")
        return False

def main():
    """Executa a crew de RSS para Sanity"""
    # Verificar se o Redis está disponível
    if not check_redis_connection():
        print("⚠️ Continuando sem Redis (funcionalidades como cache serão limitadas)...")
    
    # Criar diretório de saída se não existir
    Path("output").mkdir(exist_ok=True)
    
    # Inicializar e executar a crew
    print("🚀 Iniciando o processamento de RSS para Sanity...")
    
    # Exibir estatísticas de fila
    article_queue = RedisArticleQueue()
    stats = article_queue.get_queue_stats()
    print(f"📊 Estatísticas de artigos: {stats['pending']} pendentes, {stats['processing']} em processamento, {stats['completed']} concluídos")
    
    # Inicializar a crew com as variáveis necessárias
    crew = RSSToSanityCrew()
    result = crew.kickoff(variables={"rss_feeds": CRYPTO_RSS_FEEDS})
    
    # Atualizar estatísticas finais
    stats = article_queue.get_queue_stats()
    
    print("\n\n" + "="*50)
    print("✅ Fluxo RSS para Sanity concluído!")
    print("="*50)
    print(result)
    print("\n📊 Estatísticas finais de artigos:")
    print(f"  Pendentes: {stats['pending']}")
    print(f"  Em processamento: {stats['processing']}")
    print(f"  Concluídos: {stats['completed']}")

if __name__ == "__main__":
    main() 