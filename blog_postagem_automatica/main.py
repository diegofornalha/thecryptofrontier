# main.py
import os
import sys
import time
from datetime import datetime

# Adiciona o diretório do ambiente virtual ao caminho de busca do Python
current_dir = os.path.dirname(os.path.abspath(__file__))
site_packages = os.path.join(current_dir, 'fresh_env', 'lib', 'python3.11', 'site-packages')
sys.path.insert(0, site_packages)
sys.path.insert(0, current_dir)

# Importa os módulos do sistema
import rss_monitor
import translator
import markdown_generator
import config
import formatar_conteudo

# Tratamento especial para publisher que pode não existir
class DummyPublisher:
    @staticmethod
    def publish_post(**kwargs):
        print("Módulo publisher não encontrado. Post não publicado.")
        return False, "Módulo publisher não encontrado"

try:
    import publisher
except ImportError:
    publisher = DummyPublisher()

# Diretório para armazenar os arquivos gerados
OUTPUT_DIR = "posts_traduzidos"

# Configuração para publicação direta
PUBLISH_DIRECTLY = True  # Define se deve publicar diretamente ou apenas gerar arquivo local
PUBLISHING_PLATFORM = "sanity"  # Plataforma para publicação (wordpress, sanity, etc.)
DEFAULT_CATEGORY = config.DEFAULT_CATEGORY  # Categoria padrão para posts
DEFAULT_TAGS = config.DEFAULT_TAGS  # Tags padrão para posts

# Formato de saída - 'html' ou 'markdown'
OUTPUT_FORMAT = "markdown"  # Altere para 'html' se desejar o formato HTML

def setup():
    """Configura o ambiente, criando diretórios necessários."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Diretório de saída criado: {OUTPUT_DIR}")
    else:
        print(f"Diretório de saída já existe: {OUTPUT_DIR}")

def process_new_items():
    """Busca novos itens do feed, traduz e gera páginas HTML/Markdown ou publica diretamente."""
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando processamento de novos itens...")
    
    # Busca novos itens do RSS feed
    new_items = rss_monitor.fetch_new_items()
    
    if not new_items:
        print("Nenhum novo item para processar.")
        return 0
    
    print(f"Encontrados {len(new_items)} novos itens para processar.")
    
    processed_count = 0
    for item in new_items:
        try:
            # Extrai informações do item
            title = item["title"]
            content = item["content"]
            guid = item["guid"]
            
            print(f"\nProcessando item: {title}")
            
            try:
                # Traduz o título e o conteúdo
                title_translated = translator.translate_text_via_mcp(title)
                print(f"Título traduzido: {title_translated[:50]}...")
                print(f"Tipo de título traduzido: {type(title_translated)}")
                
                content_translated = translator.translate_text_via_mcp(content)
                print(f"Conteúdo traduzido (primeiras 50 chars): {content_translated[:50]}...")
                print(f"Tipo de conteúdo traduzido: {type(content_translated)}")
            except Exception as translate_error:
                print(f"Erro ao traduzir: {translate_error}")
                continue
            
            # Garantir que o título e conteúdo traduzidos sejam strings
            if isinstance(title_translated, list):
                title_translated = " ".join(title_translated)
                print("Convertido título de lista para string")
                
            if isinstance(content_translated, list):
                content_translated = "\n".join(content_translated)
                print("Convertido conteúdo de lista para string")
            
            # Gerar tags dinâmicas com o Gemini
            dynamic_tags = translator.generate_tags_for_content(title_translated, content_translated)
            
            # Se não for possível gerar tags dinâmicas, usar as tags padrão
            tags_to_use = dynamic_tags if dynamic_tags else DEFAULT_TAGS
            print(f"Tags a serem usadas: {', '.join(tags_to_use)}")
            
            # Gera o conteúdo no formato configurado
            try:
                if OUTPUT_FORMAT.lower() == 'markdown':
                    output_content = markdown_generator.generate_post_markdown(title_translated, content_translated)
                    file_extension = ".md"
                else:
                    output_content = html_generator.generate_post_html(title_translated, content_translated)
                    file_extension = ".html"
                    
                print(f"Conteúdo gerado no formato {OUTPUT_FORMAT}")
            except Exception as format_error:
                print(f"Erro ao gerar conteúdo no formato {OUTPUT_FORMAT}: {format_error}")
                # Como fallback, salvamos o conteúdo traduzido diretamente
                output_content = content_translated
                file_extension = ".txt"
                print("Usando conteúdo traduzido como fallback")
                
            if PUBLISH_DIRECTLY:
                # Processa e formata o conteúdo antes de publicar
                try:
                    print("Formatando conteúdo para publicação...")
                    post_formatado = formatar_conteudo.limpar_formatacao(output_content)
                    
                    # Usar o título e tags do conteúdo formatado se disponíveis
                    title_to_publish = post_formatado["title"] if post_formatado["title"] else title_translated
                    content_to_publish = post_formatado["content"]
                    
                    # Usar tags do conteúdo formatado ou as tags dinâmicas
                    if post_formatado["tags"] and len(post_formatado["tags"]) > 0:
                        tags_to_use = post_formatado["tags"]
                        print(f"Usando tags do conteúdo formatado: {', '.join(tags_to_use)}")
                    
                    print(f"Conteúdo formatado com sucesso. Título: {title_to_publish[:50]}...")
                except Exception as format_error:
                    print(f"Erro ao formatar conteúdo: {format_error}")
                    # Uso o conteúdo original como fallback
                    title_to_publish = title_translated
                    content_to_publish = output_content
                    print("Usando conteúdo original como fallback")
                
                # Publica diretamente na plataforma configurada
                try:
                    print(f"Tentando publicar no {PUBLISHING_PLATFORM}...")
                    success, message = publisher.publish_post(
                        title=title_to_publish,
                        html_content=content_to_publish,
                        platform=PUBLISHING_PLATFORM,
                        tags=tags_to_use,
                        category=DEFAULT_CATEGORY
                    )
                    
                    # Verificar se foi publicado com sucesso
                    if success or (not success and message.startswith("Post criado com sucesso") or "post-" in message):
                        print(f"Post publicado com sucesso: {message}")
                        processed_count += 1
                    else:
                        print(f"Falha ao publicar post: {message}")
                        print(f"Salvando como {OUTPUT_FORMAT} como fallback...")
                        # Cria um nome de arquivo baseado no GUID como fallback
                        safe_filename = "".join([c if c.isalnum() else "_" for c in guid])
                        safe_filename = safe_filename[-40:] if len(safe_filename) > 40 else safe_filename
                        output_path = os.path.join(OUTPUT_DIR, f"{safe_filename}{file_extension}")
                        
                        # Salva o conteúdo gerado
                        with open(output_path, "w", encoding="utf-8") as f:
                            f.write(output_content)
                        print(f"{OUTPUT_FORMAT.upper()} de fallback gerado e salvo em: {output_path}")
                except Exception as publish_error:
                    print(f"Exceção ao publicar: {publish_error}")
                    # Salvamento de fallback
                    safe_filename = "".join([c if c.isalnum() else "_" for c in guid])
                    safe_filename = safe_filename[-40:] if len(safe_filename) > 40 else safe_filename
                    output_path = os.path.join(OUTPUT_DIR, f"{safe_filename}{file_extension}")
                    
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(output_content)
                    print(f"Conteúdo salvo como fallback em: {output_path}")
            else:
                # Fluxo original - salva como arquivo local
                safe_filename = "".join([c if c.isalnum() else "_" for c in guid])
                safe_filename = safe_filename[-40:] if len(safe_filename) > 40 else safe_filename
                output_path = os.path.join(OUTPUT_DIR, f"{safe_filename}{file_extension}")
                
                # Salva o conteúdo gerado
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(output_content)
                print(f"{OUTPUT_FORMAT.upper()} gerado e salvo em: {output_path}")
            
            # Marca o item como processado - agora incluindo conteúdo e título para evitar duplicatas
            rss_monitor.save_processed_item(guid, content, title)
            
        except Exception as e:
            import traceback
            print(f"Erro ao processar item {item.get('title', 'desconhecido')}: {e}")
            print(f"Traceback: {traceback.format_exc()}")
    
    print(f"\nProcessamento concluído. {processed_count} itens processados com sucesso.")
    return processed_count

def run_single_cycle():
    """Executa um ciclo completo de processamento."""
    setup()
    return process_new_items()

def run_monitor(interval_minutes=30):
    """Executa o monitor em loop, verificando novos itens periodicamente."""
    setup()
    
    print(f"Iniciando monitor RSS. Verificando a cada {interval_minutes} minutos.")
    print(f"Modo de saída: {'Publicação Direta' if PUBLISH_DIRECTLY else 'Arquivo Local'} - Formato: {OUTPUT_FORMAT.upper()}")
    print(f"Plataforma de publicação: {PUBLISHING_PLATFORM if PUBLISH_DIRECTLY else 'N/A'}")
    
    try:
        while True:
            processed = process_new_items()
            print(f"\nAguardando {interval_minutes} minutos até a próxima verificação...")
            time.sleep(interval_minutes * 60)
    except KeyboardInterrupt:
        print("\nMonitor interrompido pelo usuário.")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--loop":
        # Executa em loop, verificando periodicamente
        interval = 30  # minutos
        if len(sys.argv) > 2:
            try:
                interval = int(sys.argv[2])
            except ValueError:
                print(f"Intervalo inválido: {sys.argv[2]}. Usando padrão de 30 minutos.")
        
        run_monitor(interval)
    else:
        # Executa uma única vez
        run_single_cycle() 