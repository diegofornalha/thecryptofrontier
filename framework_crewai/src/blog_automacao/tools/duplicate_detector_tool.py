"""
Ferramenta para detecção e remoção de artigos duplicados já publicados.
"""

import os
import json
import sqlite3
import requests
from datetime import datetime
from pathlib import Path
from pydantic import Field
from typing import Dict, List, Optional
from crewai.tools.base_tool import Tool

class DuplicateDetectorTool(Tool):
    """Ferramenta para detectar e remover artigos duplicados do Sanity CMS."""
    
    project_id: Optional[str] = Field(default=None)
    dataset: str = Field(default="production")
    token: Optional[str] = Field(default=None)
    api_version: str = Field(default="2023-05-03")
    db_path: str = Field(default="posts_database.sqlite")
    
    def __init__(self):
        """Inicializa a ferramenta de detecção de duplicatas."""
        super().__init__(
            name="DuplicateDetectorTool",
            description="Detecta e remove artigos duplicados no Sanity CMS, verificando os últimos 20 artigos publicados.",
            func=self._run,
            return_direct=False
        )
        
        # Obter configurações do Sanity
        self.project_id = os.environ.get("NEXT_PUBLIC_SANITY_PROJECT_ID", os.environ.get("SANITY_PROJECT_ID", self.project_id))
        self.dataset = os.environ.get("NEXT_PUBLIC_SANITY_DATASET", "production")
        self.api_version = os.environ.get("NEXT_PUBLIC_SANITY_API_VERSION", "2023-05-03")
        self.token = os.environ.get("SANITY_API_TOKEN", self.token)
        # Verificar também SANITY_DEV_TOKEN e SANITY_DEPLOY_TOKEN
        if not self.token:
            self.token = os.environ.get("SANITY_DEV_TOKEN", self.token)
        if not self.token:
            self.token = os.environ.get("SANITY_DEPLOY_TOKEN", self.token)
        
        if not self.project_id or not self.token:
            print("⚠️ Aviso: Configurações do Sanity incompletas (SANITY_PROJECT_ID, SANITY_API_TOKEN/SANITY_DEV_TOKEN/SANITY_DEPLOY_TOKEN). A detecção de duplicatas pode falhar.")
    
    def _get_recent_posts(self, limit=20) -> List[Dict]:
        """Obtém os posts mais recentes do Sanity CMS.
        
        Args:
            limit: Número máximo de posts para obter
            
        Returns:
            Lista de posts ordenados do mais recente para o mais antigo
        """
        if not self.project_id or not self.token:
            return {"error": "Configuração do Sanity (ID do Projeto ou Token) ausente."}
        
        # Construir query GROQ para obter posts recentes
        query = f"*[_type == 'post'] | order(publishedAt desc)[0...{limit}]"
        url = f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/query/{self.dataset}?query={query}"
        
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            posts = response.json().get('result', [])
            return posts
        except Exception as e:
            print(f"Erro ao obter posts recentes: {e}")
            return []
    
    def _find_duplicates(self, posts: List[Dict]) -> List[Dict]:
        """Encontra posts duplicados na lista.
        
        Args:
            posts: Lista de posts do Sanity
            
        Returns:
            Lista de posts duplicados com informações sobre as duplicatas
        """
        # Dicionário para armazenar posts por título normalizado
        title_map = {}
        duplicates = []
        
        for post in posts:
            post_id = post.get('_id')
            title = post.get('title', '')
            pub_date = post.get('publishedAt', '')
            slug = post.get('slug', {}).get('current', '')
            
            # Normalizar título (converter para minúsculas, remover espaços extras e caracteres especiais)
            import re
            normalized_title = title.lower().strip()
            normalized_title = re.sub(r'[^\w\s]', '', normalized_title)  # Remove pontuação
            normalized_title = re.sub(r'\s+', ' ', normalized_title)     # Normaliza espaços
            
            # Verificar por duplicatas exatas ou muito similares
            similarity_threshold = 0.85  # 85% de similaridade para considerar como duplicata
            
            # Verificar título exato primeiro
            if normalized_title in title_map:
                # Encontrou duplicata exata
                original_post = title_map[normalized_title]
                duplicates.append({
                    'id': post_id,
                    'title': title,
                    'publishedAt': pub_date,
                    'slug': slug,
                    'duplicate_of': {
                        'id': original_post['id'],
                        'title': original_post['title'],
                        'publishedAt': original_post['publishedAt'],
                        'slug': original_post['slug']
                    },
                    'similarity': 1.0,
                    'reason': 'Título idêntico após normalização'
                })
            else:
                # Verificar por títulos similares
                found_similar = False
                
                for known_title, known_post in title_map.items():
                    # Calcular similaridade usando distância de Levenshtein
                    similarity = self._calculate_similarity(normalized_title, known_title)
                    
                    if similarity >= similarity_threshold:
                        # Encontrou título similar
                        duplicates.append({
                            'id': post_id,
                            'title': title,
                            'publishedAt': pub_date,
                            'slug': slug,
                            'duplicate_of': {
                                'id': known_post['id'],
                                'title': known_post['title'],
                                'publishedAt': known_post['publishedAt'],
                                'slug': known_post['slug']
                            },
                            'similarity': round(similarity, 2),
                            'reason': f'Alta similaridade no título ({int(similarity*100)}%)'
                        })
                        found_similar = True
                        break
                
                if not found_similar:
                    # Registrar post para verificações futuras
                    title_map[normalized_title] = {
                        'id': post_id,
                        'title': title,
                        'publishedAt': pub_date,
                        'slug': slug
                    }
        
        return duplicates
        
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calcula a similaridade entre dois textos usando distância de Levenshtein.
        
        Args:
            text1: Primeiro texto
            text2: Segundo texto
            
        Returns:
            Valor entre 0 e 1, onde 1 é identidade perfeita
        """
        try:
            # Implementação simples de distância de Levenshtein
            if text1 == text2:
                return 1.0
                
            if not text1 or not text2:
                return 0.0
                
            len1, len2 = len(text1), len(text2)
            
            # Matriz para programação dinâmica
            matrix = [[0 for _ in range(len2 + 1)] for _ in range(len1 + 1)]
            
            # Inicializar a primeira linha e coluna
            for i in range(len1 + 1):
                matrix[i][0] = i
            for j in range(len2 + 1):
                matrix[0][j] = j
                
            # Preencher a matriz
            for i in range(1, len1 + 1):
                for j in range(1, len2 + 1):
                    if text1[i-1] == text2[j-1]:
                        cost = 0
                    else:
                        cost = 1
                    matrix[i][j] = min(
                        matrix[i-1][j] + 1,      # Deleção
                        matrix[i][j-1] + 1,      # Inserção
                        matrix[i-1][j-1] + cost  # Substituição
                    )
            
            # Calcular similaridade normalizada
            distance = matrix[len1][len2]
            max_len = max(len1, len2)
            
            if max_len == 0:
                return 1.0  # Ambos vazios são idênticos
                
            return 1.0 - (distance / max_len)
            
        except Exception as e:
            print(f"Erro ao calcular similaridade: {e}")
            # Fallback para comparação básica
            return 1.0 if text1 == text2 else 0.0
    
    def _remove_post(self, post_id: str) -> Dict:
        """Remove um post do Sanity CMS.
        
        Args:
            post_id: ID do post a ser removido
            
        Returns:
            Dicionário com resultado da operação
        """
        if not self.project_id or not self.token:
            return {"error": "Configuração do Sanity (ID do Projeto ou Token) ausente."}
        
        url = f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/mutate/{self.dataset}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
        body = {
            "mutations": [
                {
                    "delete": {
                        "id": post_id
                    }
                }
            ]
        }
        
        try:
            response = requests.post(url, headers=headers, json=body)
            if response.status_code == 200:
                print(f"Post {post_id} removido com sucesso.")
                
                # Atualizar status no banco de dados SQLite
                self._update_post_status_in_db(post_id, 'deleted')
                
                return {
                    "success": True,
                    "message": f"Post {post_id} removido com sucesso."
                }
            else:
                print(f"Erro ao remover post {post_id}: {response.text}")
                return {
                    "success": False,
                    "message": f"Erro ao remover post: {response.status_code}",
                    "details": response.text[:500]
                }
        except Exception as e:
            print(f"Erro ao remover post {post_id}: {e}")
            return {
                "error": f"Erro ao remover post: {str(e)}"
            }
    
    def _update_post_status_in_db(self, post_id: str, status: str) -> bool:
        """Atualiza o status de um post no banco de dados SQLite.
        
        Args:
            post_id: ID do post
            status: Novo status ('deleted', 'duplicate', etc.)
            
        Returns:
            True se atualizado com sucesso, False caso contrário
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verificar se existe entrada para este post_id
            cursor.execute("SELECT id FROM posts WHERE guid LIKE ?", (f"%{post_id}%",))
            result = cursor.fetchone()
            
            if result:
                # Atualizar status
                cursor.execute(
                    "UPDATE posts SET status = ? WHERE guid LIKE ?",
                    (status, f"%{post_id}%")
                )
                conn.commit()
                print(f"Status do post {post_id} atualizado para '{status}' no banco de dados.")
                success = True
            else:
                print(f"Post {post_id} não encontrado no banco de dados.")
                success = False
            
            conn.close()
            return success
        except Exception as e:
            print(f"Erro ao atualizar status no banco de dados: {e}")
            return False
    
    def _run(self, action="detect", limit=20) -> Dict:
        """Executa a detecção e remoção de artigos duplicados.
        
        Args:
            action: Ação a ser executada ('detect' para apenas detectar, 'remove' para detectar e remover)
            limit: Número de posts recentes a verificar
            
        Returns:
            Dicionário com resultados da operação
        """
        try:
            # Obter posts recentes
            posts = self._get_recent_posts(limit)
            
            if isinstance(posts, dict) and 'error' in posts:
                return posts
            
            # Encontrar duplicatas
            duplicates = self._find_duplicates(posts)
            
            if not duplicates:
                return {
                    "success": True,
                    "message": "Nenhum post duplicado encontrado.",
                    "duplicates": []
                }
            
            # Remover duplicatas se solicitado
            if action == "remove":
                removed = []
                for duplicate in duplicates:
                    result = self._remove_post(duplicate['id'])
                    duplicate['removed'] = result.get('success', False)
                    if duplicate['removed']:
                        removed.append(duplicate)
                
                return {
                    "success": True,
                    "message": f"Encontrados {len(duplicates)} posts duplicados. Removidos {len(removed)} posts.",
                    "duplicates": duplicates
                }
            else:
                # Apenas detectar duplicatas
                return {
                    "success": True,
                    "message": f"Encontrados {len(duplicates)} posts duplicados.",
                    "duplicates": duplicates
                }
                
        except Exception as e:
            import traceback
            print(f"Erro inesperado na DuplicateDetectorTool: {e}\n{traceback.format_exc()}")
            return {
                "error": f"Erro inesperado: {str(e)}"
            } 