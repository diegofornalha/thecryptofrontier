#!/usr/bin/env python3
"""
Pipeline COMPLETO 100% automatizado
Usa o pipeline_manual.py + process_images_working.py + publish_simple.py
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(cmd, description, timeout=300):
    """Executa um comando e mostra o resultado"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        if result.returncode == 0:
            print(f"✅ Sucesso!")
            if result.stdout:
                # Mostrar parte relevante da saída
                lines = result.stdout.strip().split('\n')
                # Mostrar últimas 20 linhas
                for line in lines[-20:]:
                    print(line)
        else:
            print(f"❌ Erro!")
            if result.stderr:
                print(result.stderr[:500])
                
        return result.returncode == 0
        
    except subprocess.TimeoutExpired:
        print(f"⏱️ Timeout após {timeout} segundos")
        return False
    except Exception as e:
        print(f"❌ Erro ao executar: {e}")
        return False

def main():
    """Pipeline completo automatizado"""
    
    # Verificar se estamos no diretório correto
    if not Path("feeds.json").exists():
        print("❌ Arquivo feeds.json não encontrado. Execute este script no diretório blog_crew")
        sys.exit(1)
        
    # Pegar limite dos argumentos
    limit = "3"
    if len(sys.argv) > 1:
        limit = sys.argv[1]
        
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║           PIPELINE COMPLETO 100% AUTOMATIZADO                ║
║                                                              ║
║   1. Pipeline Manual (RSS → Tradução → Formatação)           ║
║   2. Geração de Imagens (DALL-E 3)                          ║
║   3. Publicação no Sanity (sem tags)                        ║
║                                                              ║
║   Processando {limit} artigos...                            ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Etapa 1: Pipeline Manual (RSS → Tradução → Formatação)
    success = run_command(
        f"{sys.executable} pipeline_manual.py {limit}",
        f"Pipeline Manual - Processando {limit} artigos",
        timeout=600  # 10 minutos
    )
    
    if not success:
        print("\n⚠️ Pipeline manual teve problemas, mas vamos continuar...")
        
    # Verificar se há posts formatados
    formatted_dir = Path("posts_formatados")
    if formatted_dir.exists():
        formatted_files = list(formatted_dir.glob("*.json"))
        print(f"\n📁 Posts formatados encontrados: {len(formatted_files)}")
        
        if len(formatted_files) == 0:
            print("❌ Nenhum post formatado encontrado. Abortando...")
            sys.exit(1)
    else:
        print("❌ Diretório posts_formatados não existe. Abortando...")
        sys.exit(1)
        
    # Aguardar um pouco
    print("\n⏳ Aguardando 2 segundos...")
    time.sleep(2)
    
    # Etapa 2: Gerar imagens
    success = run_command(
        f"{sys.executable} process_images_working.py",
        "Gerando imagens com DALL-E 3",
        timeout=300  # 5 minutos
    )
    
    if not success:
        print("\n❌ Falha na geração de imagens!")
        print("💡 Dica: Verifique se a API key do OpenAI está configurada")
        return
        
    # Aguardar
    print("\n⏳ Aguardando 2 segundos...")
    time.sleep(2)
    
    # Etapa 3: Publicar no Sanity
    success = run_command(
        f"{sys.executable} publish_simple.py",
        "Publicando no Sanity (sem tags)",
        timeout=120  # 2 minutos
    )
    
    if success:
        # Verificar posts publicados
        published_dir = Path("posts_publicados")
        if published_dir.exists():
            published_files = list(published_dir.glob("*.json"))
            
            print(f"""
╔══════════════════════════════════════════════════════════════╗
║                    🎉 PIPELINE COMPLETO! 🎉                   ║
║                                                              ║
║   ✅ Posts processados com sucesso                           ║
║   ✅ Imagens geradas com DALL-E 3                           ║
║   ✅ {len(published_files)} posts publicados no Sanity       ║
║                                                              ║
║   Acesse o Sanity Studio para visualizar!                   ║
╚══════════════════════════════════════════════════════════════╝
            """)
        else:
            print("\n✅ Pipeline executado, mas não foi possível verificar posts publicados")
    else:
        print("\n❌ Falha na publicação!")
        print("💡 Dica: Verifique as credenciais do Sanity")

if __name__ == "__main__":
    main()