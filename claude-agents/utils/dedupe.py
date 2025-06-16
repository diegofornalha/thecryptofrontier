#!/usr/bin/env python3
"""
Utilitário de deduplicação extraído e simplificado do CrewAI
Sem dependências do framework, apenas funcionalidade pura
"""
import json
import os
from typing import List, Dict, Set
import hashlib

class DedupeHelper:
    """Helper simples para evitar duplicatas"""
    
    def __init__(self, cache_file='processed_items.json'):
        self.cache_file = cache_file
        self.processed_ids = self.load_cache()
        
    def load_cache(self) -> Set[str]:
        """Carrega IDs já processados"""
        if os.path.exists(self.cache_file):
            with open(self.cache_file, 'r') as f:
                return set(json.load(f))
        return set()
    
    def save_cache(self):
        """Salva cache de IDs processados"""
        with open(self.cache_file, 'w') as f:
            json.dump(list(self.processed_ids), f)
    
    def generate_id(self, item: Dict) -> str:
        """Gera ID único baseado em título e link"""
        text = f"{item.get('title', '')}-{item.get('link', '')}"
        return hashlib.md5(text.encode()).hexdigest()
    
    def is_duplicate(self, item: Dict) -> bool:
        """Verifica se item é duplicata"""
        item_id = self.generate_id(item)
        return item_id in self.processed_ids
    
    def mark_processed(self, item: Dict):
        """Marca item como processado"""
        item_id = self.generate_id(item)
        self.processed_ids.add(item_id)
        self.save_cache()
    
    def filter_duplicates(self, items: List[Dict]) -> List[Dict]:
        """Filtra lista removendo duplicatas"""
        unique_items = []
        for item in items:
            if not self.is_duplicate(item):
                unique_items.append(item)
        return unique_items