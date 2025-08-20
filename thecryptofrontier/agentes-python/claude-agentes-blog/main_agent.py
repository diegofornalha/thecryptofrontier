import asyncio
import sys
from typing import List

from hybrid_blog_agent import HybridBlogAgent
from simple_hybrid_blog_agent import SimpleHybridBlogAgent
from rss_blog_agent import RSSBlogAgent
from llm_interface import ClaudeLLM, GeminiLLM, LLMInterface

async def main():
    print("\n🤖 Agente Orquestrador de Blog 🤖")
    print("=================================")
    print("Escolha uma opção:")
    print("1. Criar nova postagem (usando LLM)")
    print("2. Importar postagens via RSS")
    print("3. Sair")

    choice = input("Digite o número da opção: ")

    if choice == '1':
        print("\n--- Criar Nova Postagem ---")
        llm_choice = input("Escolha o LLM (gemini/claude): ").lower()
        if llm_choice not in ['gemini', 'claude']:
            print("Escolha de LLM inválida. Use 'gemini' ou 'claude'.")
            return

        topic = input("Digite o tópico da postagem: ")
        keywords_str = input("Digite as palavras-chave (separadas por vírgula): ")
        keywords = [k.strip() for k in keywords_str.split(',') if k.strip()]

        llm_instance: LLMInterface
        if llm_choice == 'claude':
            llm_instance = ClaudeLLM()
        else:
            llm_instance = GeminiLLM()

        agent = SimpleHybridBlogAgent(llm_instance)
        post = await agent.create_blog_post(topic=topic, keywords=keywords)

        if post:
            print(f"✅ Postagem criada pelo {llm_choice.upper()}: {post['title']}")
            publish = input("Deseja publicar esta postagem no Strapi? (s/n): ").lower()
            if publish == 's':
                result = await agent.publish_to_strapi(post)
                if result:
                    print(f"✅ Postagem publicada com sucesso! ID: {result['data']['id']}")
                else:
                    print("❌ Falha ao publicar a postagem.")
        else:
            print("❌ Falha ao criar a postagem.")

    elif choice == '2':
        print("\n--- Importar Postagens via RSS ---")
        limit_str = input("Quantos artigos deseja importar (padrão: 5)? ")
        limit = int(limit_str) if limit_str.isdigit() else 5

        rss_agent = RSSBlogAgent()
        results = await rss_agent.run_import(limit)

        print(f"\nImportação RSS concluída:")
        print(f"  Total de artigos encontrados: {results['total']}")
        print(f"  Artigos publicados com sucesso: {results['success']}")
        print(f"  Falhas na publicação: {results['failed']}")
        if results['posts']:
            print("\nPosts criados:")
            for post in results['posts']:
                print(f"  - [{post['id']}] {post['title']}")

    elif choice == '3':
        print("Saindo...")
        sys.exit(0)

    else:
        print("Opção inválida. Por favor, tente novamente.")

    await main() # Loop para continuar o menu

if __name__ == "__main__":
    asyncio.run(main())