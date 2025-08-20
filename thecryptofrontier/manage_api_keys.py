#!/usr/bin/env python3
"""
Script para gerenciar chaves API do Gemini
Permite adicionar novas chaves, ver status e resetar contadores
"""

import sys
import os
from pathlib import Path
import argparse
import json
from datetime import datetime

# Adicionar o diretório src ao path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from utils.api_key_manager import get_api_key_manager, reload_api_key_manager

def add_key(new_key: str):
    """Adiciona uma nova chave API"""
    print(f"🔑 Adicionando nova chave API...")
    
    manager = get_api_key_manager()
    if manager.add_api_key(new_key):
        print("✅ Chave adicionada com sucesso!")
        # Recarregar para pegar as novas chaves
        reload_api_key_manager()
        show_status()
    else:
        print("❌ Falha ao adicionar chave (pode já existir)")

def show_status():
    """Mostra status atual de todas as chaves"""
    manager = reload_api_key_manager()  # Sempre recarregar para pegar estado mais atual
    status = manager.get_status()
    
    print("\n" + "="*60)
    print(f"📊 STATUS DAS CHAVES API GEMINI - {status['date']}")
    print("="*60)
    print(f"📈 Total de requests hoje: {status['total_requests_today']}/{status['max_requests_today']}")
    print(f"🔑 Total de chaves: {status['total_keys']}")
    print()
    
    for key_info in status['keys_status']:
        icon = "🟢" if not key_info['exhausted'] else "🔴"
        current = " [ATUAL]" if key_info['is_current'] else ""
        
        print(f"{icon} Chave #{key_info['index']}{current}")
        print(f"   ID: {key_info['key']}")
        print(f"   Usado: {key_info['requests_used']}/50")
        print(f"   Restante: {key_info['requests_remaining']}")
        print(f"   Status: {'Esgotada' if key_info['exhausted'] else 'Disponível'}")
        print()

def reset_usage():
    """Reseta contadores de uso (simula novo dia)"""
    print("🔄 Resetando contadores de uso...")
    
    manager = reload_api_key_manager()
    # Forçar reset criando dados para "novo dia"
    manager.usage_data = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'keys': {key: {'count': 0, 'exhausted': False} for key in manager.api_keys}
    }
    manager._save_usage_data()
    
    print("✅ Contadores resetados!")
    show_status()

def update_env_file(new_key: str):
    """Atualiza arquivo .env com nova chave adicional"""
    env_file = Path(".env")
    
    if not env_file.exists():
        print("❌ Arquivo .env não encontrado")
        return
    
    # Ler conteúdo atual
    with open(env_file, 'r') as f:
        lines = f.readlines()
    
    # Encontrar próximo número de chave
    key_numbers = []
    for line in lines:
        if line.startswith("GOOGLE_API_KEY_"):
            try:
                num = int(line.split("_")[3].split("=")[0])
                key_numbers.append(num)
            except:
                pass
    
    next_number = max(key_numbers) + 1 if key_numbers else 2
    new_env_line = f"GOOGLE_API_KEY_{next_number}={new_key}\n"
    
    # Adicionar nova linha
    with open(env_file, 'a') as f:
        f.write(new_env_line)
    
    print(f"✅ Chave adicionada ao .env como GOOGLE_API_KEY_{next_number}")

def test_key(key: str):
    """Testa se uma chave API funciona"""
    print(f"🧪 Testando chave API...")
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content("Responda apenas: OK")
        
        if "OK" in response.text.upper():
            print("✅ Chave funcionando corretamente!")
            return True
        else:
            print("⚠️ Chave respondeu, mas resposta inesperada")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao testar chave: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Gerenciador de Chaves API Gemini")
    
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponíveis')
    
    # Comando status
    subparsers.add_parser('status', help='Mostra status atual das chaves')
    
    # Comando add
    add_parser = subparsers.add_parser('add', help='Adiciona nova chave API')
    add_parser.add_argument('key', help='Nova chave API para adicionar')
    add_parser.add_argument('--test', action='store_true', help='Testar chave antes de adicionar')
    add_parser.add_argument('--env', action='store_true', help='Adicionar também ao arquivo .env')
    
    # Comando reset
    subparsers.add_parser('reset', help='Reset contadores de uso')
    
    # Comando test
    test_parser = subparsers.add_parser('test', help='Testa uma chave API')
    test_parser.add_argument('key', help='Chave API para testar')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == 'status':
        show_status()
        
    elif args.command == 'add':
        valid_key = True
        
        if args.test:
            valid_key = test_key(args.key)
        
        if valid_key:
            add_key(args.key)
            
            if args.env:
                update_env_file(args.key)
        else:
            print("❌ Chave inválida, não foi adicionada")
            
    elif args.command == 'reset':
        reset_usage()
        
    elif args.command == 'test':
        test_key(args.key)

if __name__ == "__main__":
    main() 