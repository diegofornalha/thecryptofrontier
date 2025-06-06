#!/usr/bin/env python3
"""
Pipeline completo: CrewAI + Geração de Imagens + Publicação
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(cmd, description):
    """Executa um comando e mostra o resultado"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")
    
    # Usar bash ao invés de sh
    result = subprocess.run(f"bash -c '{cmd}'", shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ Sucesso!")
        if result.stdout:
            print(result.stdout[:500])  # Primeiras 500 chars
    else:
        print(f"❌ Erro!")
        if result.stderr:
            print(result.stderr)
    
    return result.returncode == 0

def main():
    """Pipeline completo"""
    print("""
╔══════════════════════════════════════════════════════════════╗
║           PIPELINE COMPLETO COM GERAÇÃO DE IMAGENS           ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Mudar para o diretório correto
    os.chdir("/home/sanity/thecryptofrontier/framework_crewai/blog_crew")
    
    # 1. Executar CrewAI
    limit = sys.argv[1] if len(sys.argv) > 1 else "3"
    success = run_command(
        f"source venv/bin/activate && python run_crew.py --limit {limit}",
        f"Executando CrewAI para {limit} artigos"
    )
    
    if not success:
        print("\n⚠️  CrewAI falhou, mas vamos continuar...")
    
    # 2. Aguardar um pouco
    print("\n⏳ Aguardando 2 segundos...")
    time.sleep(2)
    
    # 3. Gerar imagens
    success = run_command(
        "source venv/bin/activate && python process_images_working.py",
        "Gerando imagens com DALL-E 3"
    )
    
    if not success:
        print("\n❌ Falha na geração de imagens!")
        return
    
    # 4. Aguardar
    print("\n⏳ Aguardando 2 segundos...")
    time.sleep(2)
    
    # 5. Publicar no Sanity
    success = run_command(
        "source venv/bin/activate && python publish_simple.py",
        "Publicando no Sanity (sem tags)"
    )
    
    if success:
        print("""
╔══════════════════════════════════════════════════════════════╗
║                    🎉 PIPELINE COMPLETO! 🎉                   ║
║                                                              ║
║   ✅ Posts processados pelo CrewAI                           ║
║   ✅ Imagens geradas com DALL-E 3                           ║
║   ✅ Posts publicados no Sanity                             ║
╚══════════════════════════════════════════════════════════════╝
        """)
    else:
        print("\n❌ Falha na publicação!")

if __name__ == "__main__":
    main()