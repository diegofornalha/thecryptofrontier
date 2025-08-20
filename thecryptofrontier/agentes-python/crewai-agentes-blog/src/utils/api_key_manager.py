import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import google.generativeai as genai
from pathlib import Path

class GeminiAPIKeyManager:
    """
    Gerenciador de chaves API do Gemini com rotação automática
    Permite múltiplas chaves para aumentar o limite de requests diários
    """
    
    def __init__(self, data_file: str = "api_usage_data.json"):
        self.logger = logging.getLogger(__name__)
        self.data_file = Path(data_file)
        
        # Lista de chaves API - carregada do ambiente ou configuração
        self.api_keys = self._load_api_keys()
        
        # Dados de uso das chaves
        self.usage_data = self._load_usage_data()
        
        # Limite de requests por chave por dia
        self.daily_limit = 50
        
        # Chave atual ativa
        self.current_key_index = 0
        
        # Cliente Gemini configurado
        self.configured_key = None
        
    def _load_api_keys(self) -> List[str]:
        """Carrega as chaves API do ambiente"""
        keys = []
        
        # Primeira chave do .env
        primary_key = os.environ.get("GOOGLE_API_KEY")
        if primary_key:
            keys.append(primary_key)
            
        # Chaves adicionais (GOOGLE_API_KEY_2, GOOGLE_API_KEY_3, etc.)
        i = 2
        while True:
            additional_key = os.environ.get(f"GOOGLE_API_KEY_{i}")
            if additional_key:
                keys.append(additional_key)
                i += 1
            else:
                break
                
        # Se não tiver chaves no .env, usar a lista padrão
        if not keys:
            keys = [
                "AIzaSyALJKZfAQLrHp-pRJmUZDJvESIWYQ8561U",  # Chave atual
            ]
            
        self.logger.info(f"🔑 Carregadas {len(keys)} chaves API do Gemini")
        return keys
    
    def _load_usage_data(self) -> Dict:
        """Carrega dados de uso das chaves"""
        if self.data_file.exists():
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                # Verificar se os dados são do dia atual
                if data.get('date') == datetime.now().strftime('%Y-%m-%d'):
                    return data
            except Exception as e:
                self.logger.error(f"Erro ao carregar dados de uso: {e}")
        
        # Criar dados iniciais
        return {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'keys': {key: {'count': 0, 'exhausted': False} for key in self.api_keys}
        }
    
    def _save_usage_data(self):
        """Salva dados de uso das chaves"""
        try:
            with open(self.data_file, 'w') as f:
                json.dump(self.usage_data, f, indent=2)
        except Exception as e:
            self.logger.error(f"Erro ao salvar dados de uso: {e}")
    
    def _reset_daily_usage(self):
        """Reseta contadores se mudou o dia"""
        current_date = datetime.now().strftime('%Y-%m-%d')
        if self.usage_data.get('date') != current_date:
            self.logger.info("🔄 Resetando contadores diários das chaves API")
            self.usage_data = {
                'date': current_date,
                'keys': {key: {'count': 0, 'exhausted': False} for key in self.api_keys}
            }
            self._save_usage_data()
    
    def get_available_key(self) -> Optional[str]:
        """
        Retorna uma chave API disponível (que não atingiu o limite)
        Implementa rotação automática entre chaves
        """
        self._reset_daily_usage()
        
        # Verificar se a chave atual ainda tem quota
        current_key = self.api_keys[self.current_key_index]
        current_usage = self.usage_data['keys'].get(current_key, {'count': 0, 'exhausted': False})
        
        if not current_usage['exhausted'] and current_usage['count'] < self.daily_limit:
            return current_key
        
        # Procurar próxima chave disponível
        for i, key in enumerate(self.api_keys):
            key_usage = self.usage_data['keys'].get(key, {'count': 0, 'exhausted': False})
            if not key_usage['exhausted'] and key_usage['count'] < self.daily_limit:
                self.current_key_index = i
                self.logger.info(f"🔄 Rotacionando para chave API #{i+1}")
                return key
        
        # Nenhuma chave disponível
        return None
    
    def configure_gemini(self) -> bool:
        """
        Configura o cliente Gemini com uma chave disponível
        Retorna True se configurou com sucesso, False se nenhuma chave disponível
        """
        available_key = self.get_available_key()
        
        if not available_key:
            exhausted_keys = len([k for k, v in self.usage_data['keys'].items() if v['exhausted'] or v['count'] >= self.daily_limit])
            self.logger.error(f"❌ Todas as {len(self.api_keys)} chaves API esgotaram o limite diário de {self.daily_limit} requests")
            self.logger.error(f"💡 Chaves esgotadas: {exhausted_keys}/{len(self.api_keys)}")
            return False
        
        # Configurar apenas se mudou a chave
        if self.configured_key != available_key:
            try:
                genai.configure(api_key=available_key)
                self.configured_key = available_key
                key_index = self.api_keys.index(available_key) + 1
                self.logger.info(f"✅ Gemini configurado com chave API #{key_index}")
            except Exception as e:
                self.logger.error(f"Erro ao configurar Gemini: {e}")
                return False
        
        return True
    
    def record_request(self, success: bool = True):
        """
        Registra uso de uma request na chave atual
        Se falhar com erro de quota, marca a chave como esgotada
        """
        if not self.configured_key:
            return
        
        key_data = self.usage_data['keys'].get(self.configured_key, {'count': 0, 'exhausted': False})
        key_data['count'] += 1
        
        # Se chegou no limite ou falhou com quota exceeded
        if not success or key_data['count'] >= self.daily_limit:
            key_data['exhausted'] = True
            key_index = self.api_keys.index(self.configured_key) + 1
            self.logger.warning(f"⚠️ Chave API #{key_index} atingiu o limite ({key_data['count']}/{self.daily_limit})")
            
            # Verificar quantas chaves ainda estão disponíveis
            available_count = len([k for k, v in self.usage_data['keys'].items() 
                                 if not v['exhausted'] and v['count'] < self.daily_limit])
            
            if available_count == 0:
                self.logger.error("🚨 ATENÇÃO: Todas as chaves API esgotaram! Adicione mais chaves ou aguarde reset diário.")
            else:
                self.logger.info(f"🔄 {available_count} chaves ainda disponíveis para rotação")
        
        self.usage_data['keys'][self.configured_key] = key_data
        self._save_usage_data()
    
    def get_status(self) -> Dict:
        """Retorna status atual de todas as chaves"""
        self._reset_daily_usage()
        
        status = {
            'date': self.usage_data['date'],
            'total_keys': len(self.api_keys),
            'keys_status': [],
            'total_requests_today': 0,
            'max_requests_today': len(self.api_keys) * self.daily_limit
        }
        
        for i, key in enumerate(self.api_keys):
            key_data = self.usage_data['keys'].get(key, {'count': 0, 'exhausted': False})
            masked_key = f"{key[:12]}...{key[-8:]}"
            
            status['keys_status'].append({
                'index': i + 1,
                'key': masked_key,
                'requests_used': key_data['count'],
                'requests_remaining': max(0, self.daily_limit - key_data['count']),
                'exhausted': key_data['exhausted'],
                'is_current': (i == self.current_key_index)
            })
            
            status['total_requests_today'] += key_data['count']
        
        return status
    
    def add_api_key(self, new_key: str):
        """Adiciona uma nova chave API ao sistema"""
        if new_key not in self.api_keys:
            self.api_keys.append(new_key)
            self.usage_data['keys'][new_key] = {'count': 0, 'exhausted': False}
            self._save_usage_data()
            self.logger.info(f"✅ Nova chave API adicionada. Total: {len(self.api_keys)} chaves")
            return True

# Instância global do gerenciador - será criada quando necessário
api_key_manager = None

def get_api_key_manager():
    """Retorna instância do gerenciador, criando nova se necessário"""
    global api_key_manager
    if api_key_manager is None:
        api_key_manager = GeminiAPIKeyManager()
    return api_key_manager

def reload_api_key_manager():
    """Força recarregamento do gerenciador para pegar novas chaves"""
    global api_key_manager
    api_key_manager = GeminiAPIKeyManager()
    return api_key_manager
