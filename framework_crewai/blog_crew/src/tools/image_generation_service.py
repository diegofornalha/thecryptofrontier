"""
Serviço unificado de geração de imagens para o Blog Crew
Combina todas as funcionalidades de geração, upload e gerenciamento de fila
"""

import os
import json
import time
import openai
import requests
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Union
from crewai.tools import tool
from dataclasses import dataclass
from enum import Enum

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== CONFIGURAÇÕES CENTRALIZADAS =====

@dataclass
class ServiceConfig:
    """Configurações centralizadas do serviço"""
    # OpenAI
    openai_api_key: str = os.getenv("OPENAI_API_KEY")
    openai_model: str = "dall-e-3"
    image_size: str = "1792x1024"
    image_quality: str = "hd"
    
    # Strapi/Sanity
    project_id: str = os.getenv("STRAPI_PROJECT_ID", "z4sx85c6")
    dataset: str = os.getenv("strapi_DATASET", "production")
    api_token: str = os.getenv("strapi_API_TOKEN")
    
    # Rate Limiting
    max_requests_per_minute: int = 5
    delay_between_requests: int = 15
    max_retries: int = 3
    retry_delay: int = 30
    batch_size: int = 3
    batch_delay: int = 60
    
    # Diretórios
    input_dir: str = "posts_formatados"
    output_dir: str = "posts_com_imagem"
    images_dir: str = "posts_imagens"
    
    def validate(self) -> bool:
        """Valida configurações essenciais"""
        if not self.openai_api_key:
            logger.error("OPENAI_API_KEY não configurada")
            return False
        if not all([self.project_id, self.api_token]):
            logger.error("Credenciais Strapi/Sanity não configuradas")
            return False
        return True

# ===== CONFIGURAÇÕES VISUAIS =====

class CryptoVisualConfig:
    """Configurações visuais para criptomoedas"""
    
    BRAND_STYLE = {
        "style": "3D photorealistic cryptocurrency rendering",
        "background": "Pure black (#000000) with subtle blue tech grid pattern",
        "lighting": "Blue rim lighting (#003366) with strong top-down key light",
        "effects": "Circular cyan energy waves radiating from center",
        "quality": "ultra high definition, sharp details, professional 3D rendering",
        "composition": "Centered composition with 20% margin safety zone",
        "format": "1792x1024 landscape"
    }
    
    CRYPTO_TEMPLATES = {
        "bitcoin": {
            "symbol": "Bitcoin logo 3D volumétrico dourado brilhante",
            "keywords": ["bitcoin", "btc"],
            "color": "golden orange metallic",
            "style": "classic coin with B symbol"
        },
        "ethereum": {
            "symbol": "Ethereum logo 3D prismático roxo e azul",
            "keywords": ["ethereum", "eth"],
            "color": "silver and blue metallic prismatic",
            "style": "diamond shape with sharp edges"
        },
        "xrp": {
            "symbol": "XRP logo 3D prata metálico",
            "keywords": ["xrp", "ripple"],
            "color": "black and white contrast with silver accents",
            "style": "modern minimalist sphere"
        },
        "bnb": {
            "symbol": "Binance Coin logo 3D amarelo vibrante",
            "keywords": ["bnb", "binance"],
            "color": "golden yellow metallic",
            "style": "angular diamond shape"
        },
        "solana": {
            "symbol": "Solana logo 3D gradiente roxo-verde",
            "keywords": ["solana", "sol"],
            "color": "purple to turquoise gradient metallic",
            "style": "three angular bars in motion"
        },
        "cardano": {
            "symbol": "Cardano logo 3D azul metálico",
            "keywords": ["cardano", "ada"],
            "color": "deep blue metallic",
            "style": "interlocking circular design"
        },
        "polkadot": {
            "symbol": "Polkadot logo 3D com pontos interconectados",
            "keywords": ["polkadot", "dot"],
            "color": "multicolor dots on dark background",
            "style": "network of connected nodes"
        },
        "chainlink": {
            "symbol": "Chainlink logo 3D hexágono azul",
            "keywords": ["chainlink", "link"],
            "color": "deep blue with white center",
            "style": "hexagonal chain pattern"
        },
        "avalanche": {
            "symbol": "Avalanche logo 3D vermelho cristalino",
            "keywords": ["avalanche", "avax"],
            "color": "red crystalline structure",
            "style": "angular mountain-like shape"
        },
        "polygon": {
            "symbol": "Polygon logo 3D roxo geométrico",
            "keywords": ["polygon", "matic"],
            "color": "purple geometric gradient",
            "style": "polygon shape with depth"
        },
        "dogecoin": {
            "symbol": "Dogecoin Shiba Inu 3D dourado",
            "keywords": ["dogecoin", "doge"],
            "color": "golden yellow with brown accents",
            "style": "friendly Shiba Inu face"
        },
        "shiba": {
            "symbol": "Shiba Inu logo 3D laranja vibrante",
            "keywords": ["shiba", "shib"],
            "color": "orange and red metallic",
            "style": "aggressive dog profile"
        },
        "litecoin": {
            "symbol": "Litecoin logo 3D prata e azul",
            "keywords": ["litecoin", "ltc"],
            "color": "silver with blue accents",
            "style": "stylized L symbol"
        },
        "uniswap": {
            "symbol": "Uniswap unicórnio 3D rosa",
            "keywords": ["uniswap", "uni"],
            "color": "pink and purple gradient",
            "style": "unicorn head profile"
        },
        "cosmos": {
            "symbol": "Cosmos logo 3D com galáxia de fundo",
            "keywords": ["cosmos", "atom"],
            "color": "cosmic purple with stars",
            "style": "atom-like orbital structure"
        },
        "sui": {
            "symbol": "Sui logo 3D gota d'água translúcida",
            "keywords": ["sui"],
            "color": "light blue translucent",
            "style": "water drop shape"
        },
        "tron": {
            "symbol": "Tron TRX logo 3D vermelho geométrico",
            "keywords": ["tron", "trx"],
            "color": "red geometric metallic",
            "style": "angular futuristic design"
        },
        "pepe": {
            "symbol": "PEPE logo 3D verde com rosto de sapo",
            "keywords": ["pepe"],
            "color": "green with orange accents",
            "style": "meme frog face"
        },
        "usdt": {
            "symbol": "Tether USDT logo 3D hexágono verde-azulado",
            "keywords": ["usdt", "tether"],
            "color": "teal and white",
            "style": "hexagon with T symbol"
        }
    }

# ===== SERVIÇO PRINCIPAL =====

class ImageGenerationService:
    """Serviço principal de geração de imagens"""
    
    def __init__(self, config: Optional[ServiceConfig] = None):
        self.config = config or ServiceConfig()
        self.visual_config = CryptoVisualConfig()
        
        # Validar configurações
        if not self.config.validate():
            raise ValueError("Configurações inválidas")
        
        # Configurar OpenAI
        openai.api_key = self.config.openai_api_key
        
        # Criar diretórios necessários
        for dir_name in [self.config.output_dir, self.config.images_dir]:
            Path(dir_name).mkdir(exist_ok=True)
    
    def detect_cryptocurrencies(self, text: str) -> List[str]:
        """Detecta criptomoedas mencionadas no texto com lógica avançada"""
        text_lower = text.lower()
        detected = []
        
        # Verificar cada crypto e suas keywords
        for crypto_id, crypto_info in self.visual_config.CRYPTO_TEMPLATES.items():
            for keyword in crypto_info["keywords"]:
                if keyword in text_lower and crypto_id not in detected:
                    detected.append(crypto_id)
                    break
        
        return detected
    
    def build_crypto_prompt(self, cryptos: List[str], title: str) -> str:
        """Constrói prompt otimizado para DALL-E baseado nas cryptos detectadas"""
        brand = self.visual_config.BRAND_STYLE
        
        if not cryptos:
            # Prompt genérico para crypto
            return f"""
            Abstract cryptocurrency concept with multiple 3D coins floating in space,
            Holographic blockchain network visualization,
            Visual style: {brand['style']}
            Background: {brand['background']}
            Lighting: {brand['lighting']}
            Effects: {brand['effects']}
            Composition: Dynamic arrangement of various crypto symbols
            Format: {brand['format']}
            Quality: {brand['quality']}
            No text, no words, no letters
            """
        
        if len(cryptos) == 1:
            # Uma única crypto - foco total nela
            crypto = self.visual_config.CRYPTO_TEMPLATES[cryptos[0]]
            return f"""
            {crypto['symbol']} as the main focal point,
            Visual style: {brand['style']}
            Color scheme: {crypto['color']}
            Design: {crypto['style']}
            Background: {brand['background']}
            Lighting: {brand['lighting']}
            Effects: {brand['effects']}
            Composition: Logo centered and floating with volumetric 3D appearance
            Format: {brand['format']}
            Quality: {brand['quality']}
            No text, no words, no letters
            """
        
        else:
            # Múltiplas cryptos - criar composição
            main_crypto = self.visual_config.CRYPTO_TEMPLATES[cryptos[0]]
            secondary_crypto = self.visual_config.CRYPTO_TEMPLATES[cryptos[1]]
            
            return f"""
            Dynamic composition featuring {main_crypto['symbol']} and {secondary_crypto['symbol']},
            Visual style: {brand['style']}
            Primary element: {main_crypto['symbol']} with {main_crypto['color']}
            Secondary element: {secondary_crypto['symbol']} with {secondary_crypto['color']}
            Background: {brand['background']}
            Lighting: {brand['lighting']}
            Effects: Energy streams connecting the logos, {brand['effects']}
            Composition: Balanced arrangement with dynamic interaction between elements
            Format: {brand['format']}
            Quality: {brand['quality']}
            No text, no words, no letters
            """
    
    def generate_image(self, title: str, excerpt: str = "") -> Dict:
        """Gera imagem usando DALL-E 3"""
        try:
            # Detectar criptomoedas
            full_text = f"{title} {excerpt}"
            detected_cryptos = self.detect_cryptocurrencies(full_text)
            
            # Construir prompt
            prompt = self.build_crypto_prompt(detected_cryptos, title)
            
            logger.info(f"🎨 Gerando imagem para: {title}")
            logger.info(f"🔍 Cryptos detectadas: {detected_cryptos or ['Genérica']}")
            
            # Gerar com DALL-E
            response = openai.images.generate(
                model=self.config.openai_model,
                prompt=prompt,
                size=self.config.image_size,
                quality=self.config.image_quality,
                n=1
            )
            
            image_url = response.data[0].url
            
            # Gerar alt text apropriado
            if detected_cryptos:
                crypto_names = [
                    self.visual_config.CRYPTO_TEMPLATES[c]["symbol"].split()[0] 
                    for c in detected_cryptos[:2]
                ]
                alt_text = f"Ilustração 3D de {' e '.join(crypto_names)}"
            else:
                alt_text = "Ilustração 3D de conceito de criptomoedas"
            
            return {
                "success": True,
                "image_url": image_url,
                "alt_text": alt_text,
                "detected_cryptos": detected_cryptos,
                "prompt_used": prompt[:200] + "..."  # Preview do prompt
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao gerar imagem: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def upload_to_strapi(self, image_url: str, filename: str, alt_text: str) -> Dict:
        """Faz upload da imagem para o Strapi/Sanity"""
        try:
            # Download da imagem
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # URL de upload
            upload_url = f"https://{self.config.project_id}.api.sanity.io/v2021-03-25/assets/images/{self.config.dataset}"
            
            headers = {
                "Authorization": f"Bearer {self.config.api_token}",
                "Content-Type": "image/png"
            }
            
            # Upload
            upload_response = requests.post(
                upload_url,
                headers=headers,
                data=response.content,
                params={"filename": filename}
            )
            
            if upload_response.status_code in [200, 201]:
                result = upload_response.json()
                asset_id = result.get("document", {}).get("_id")
                
                if asset_id:
                    logger.info(f"✅ Upload concluído: {asset_id}")
                    return {
                        "success": True,
                        "asset_id": asset_id,
                        "mainImage": {
                            "_type": "image",
                            "asset": {
                                "_type": "reference",
                                "_ref": asset_id
                            },
                            "alt": alt_text,
                            "caption": f"Imagem gerada automaticamente - {alt_text}"
                        }
                    }
                else:
                    return {"success": False, "error": "Asset ID não encontrado"}
            else:
                error_msg = f"Upload falhou: {upload_response.status_code} - {upload_response.text}"
                logger.error(error_msg)
                return {"success": False, "error": error_msg}
                
        except Exception as e:
            logger.error(f"❌ Erro no upload: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def process_single_post(self, post_data: Union[str, Dict], post_file: Optional[str] = None) -> Dict:
        """Processa um único post, gerando e fazendo upload da imagem"""
        try:
            # Parse dos dados se necessário
            if isinstance(post_data, str):
                if post_file:
                    # É um caminho de arquivo
                    with open(post_data, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                else:
                    # É JSON string
                    data = json.loads(post_data)
            else:
                data = post_data
            
            title = data.get("title", "")
            excerpt = data.get("excerpt", "")
            
            if not title:
                return {"success": False, "error": "Post sem título"}
            
            # Verificar se já tem imagem
            if data.get("mainImage") and data["mainImage"].get("asset"):
                return {
                    "success": True,
                    "message": "Post já possui imagem",
                    "asset_id": data["mainImage"]["asset"]["_ref"]
                }
            
            # Gerar imagem
            image_result = self.generate_image(title, excerpt)
            
            if not image_result.get("success"):
                return image_result
            
            # Preparar filename
            cryptos = image_result.get("detected_cryptos", [])
            crypto_name = cryptos[0] if cryptos else "general"
            timestamp = int(time.time())
            filename = f"crypto-{crypto_name}-{timestamp}.png"
            
            # Upload para Strapi
            upload_result = self.upload_to_strapi(
                image_result["image_url"],
                filename,
                image_result["alt_text"]
            )
            
            if not upload_result.get("success"):
                return upload_result
            
            # Atualizar dados do post
            data["mainImage"] = upload_result["mainImage"]
            
            # Salvar localmente se tiver arquivo
            if post_file:
                output_dir = Path(self.config.output_dir)
                output_file = output_dir / Path(post_file).name
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            
            # Salvar imagem localmente também
            img_dir = Path(self.config.images_dir)
            img_response = requests.get(image_result["image_url"])
            img_path = img_dir / filename
            with open(img_path, 'wb') as f:
                f.write(img_response.content)
            
            return {
                "success": True,
                "message": "Imagem gerada e uploaded com sucesso",
                "asset_id": upload_result["asset_id"],
                "image_path": str(img_path),
                "detected_cryptos": image_result["detected_cryptos"]
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar post: {str(e)}")
            return {"success": False, "error": str(e)}

# ===== GERENCIADOR DE FILA =====

class QueueStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ImageGenerationQueue:
    """Gerenciador de fila com rate limiting"""
    
    def __init__(self, service: ImageGenerationService):
        self.service = service
        self.queue_file = Path("image_generation_queue.json")
        self.processed_file = Path("image_generation_processed.json")
        self.failed_file = Path("image_generation_failed.json")
    
    def add_to_queue(self, post_file: str, priority: int = 5) -> bool:
        """Adiciona um post à fila"""
        queue = self.load_queue()
        
        # Evitar duplicatas
        if any(item['file'] == post_file for item in queue):
            logger.info(f"Post já está na fila: {post_file}")
            return False
        
        queue.append({
            'file': post_file,
            'priority': priority,
            'added_at': datetime.now().isoformat(),
            'attempts': 0,
            'status': QueueStatus.PENDING.value
        })
        
        # Ordenar por prioridade
        queue.sort(key=lambda x: x['priority'], reverse=True)
        self.save_queue(queue)
        logger.info(f"✅ Adicionado à fila: {post_file}")
        return True
    
    def load_queue(self) -> List[Dict]:
        """Carrega a fila"""
        if self.queue_file.exists():
            with open(self.queue_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_queue(self, queue: List[Dict]):
        """Salva a fila"""
        with open(self.queue_file, 'w') as f:
            json.dump(queue, f, indent=2)
    
    def load_processed(self) -> List[Dict]:
        """Carrega lista de processados"""
        if self.processed_file.exists():
            with open(self.processed_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_processed(self, processed: List[Dict]):
        """Salva lista de processados"""
        with open(self.processed_file, 'w') as f:
            json.dump(processed, f, indent=2)
    
    def load_failed(self) -> List[Dict]:
        """Carrega lista de falhos"""
        if self.failed_file.exists():
            with open(self.failed_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_failed(self, failed: List[Dict]):
        """Salva lista de falhos"""
        with open(self.failed_file, 'w') as f:
            json.dump(failed, f, indent=2)
    
    def get_next_batch(self, size: int = 3) -> List[Dict]:
        """Pega próximo lote para processar"""
        queue = self.load_queue()
        pending = [item for item in queue if item['status'] == QueueStatus.PENDING.value]
        return pending[:size]
    
    def mark_as_processed(self, post_file: str, result: Dict):
        """Marca como processado"""
        queue = self.load_queue()
        processed = self.load_processed()
        
        # Remover da fila
        queue = [item for item in queue if item['file'] != post_file]
        self.save_queue(queue)
        
        # Adicionar aos processados
        processed.append({
            'file': post_file,
            'processed_at': datetime.now().isoformat(),
            'result': result
        })
        self.save_processed(processed)
    
    def mark_as_failed(self, post_file: str, error: str):
        """Marca como falho"""
        queue = self.load_queue()
        
        for item in queue:
            if item['file'] == post_file:
                item['attempts'] += 1
                item['last_error'] = error
                item['last_attempt'] = datetime.now().isoformat()
                
                # Se excedeu tentativas
                if item['attempts'] >= self.service.config.max_retries:
                    item['status'] = QueueStatus.FAILED.value
                    failed = self.load_failed()
                    failed.append(item)
                    self.save_failed(failed)
                    queue = [i for i in queue if i['file'] != post_file]
                break
        
        self.save_queue(queue)
    
    def process_batch(self, batch_size: Optional[int] = None) -> Dict:
        """Processa um lote da fila"""
        batch_size = batch_size or self.service.config.batch_size
        batch = self.get_next_batch(batch_size)
        
        if not batch:
            return {
                "success": True,
                "message": "Fila vazia",
                "processed": 0
            }
        
        results = {
            "processed": 0,
            "success": 0,
            "failed": 0,
            "details": []
        }
        
        logger.info(f"🎯 Processando lote de {len(batch)} imagens...")
        
        for idx, item in enumerate(batch):
            post_file = item['file']
            logger.info(f"\n[{idx+1}/{len(batch)}] Processando: {Path(post_file).name}")
            
            try:
                # Processar post
                result = self.service.process_single_post(post_file, post_file=post_file)
                
                if result.get('success'):
                    self.mark_as_processed(post_file, result)
                    results['success'] += 1
                    results['details'].append(f"✅ {Path(post_file).name}")
                else:
                    error = result.get('error', 'Erro desconhecido')
                    self.mark_as_failed(post_file, error)
                    results['failed'] += 1
                    results['details'].append(f"❌ {Path(post_file).name}: {error}")
                
                results['processed'] += 1
                
                # Rate limiting
                if idx < len(batch) - 1:
                    delay = self.service.config.delay_between_requests
                    logger.info(f"⏳ Aguardando {delay}s...")
                    time.sleep(delay)
                    
            except Exception as e:
                logger.error(f"Erro ao processar {post_file}: {str(e)}")
                self.mark_as_failed(post_file, str(e))
                results['failed'] += 1
                results['details'].append(f"❌ {Path(post_file).name}: {str(e)}")
        
        logger.info(f"\n📊 Lote concluído: {results['success']} sucessos, {results['failed']} falhas")
        return results
    
    def get_status(self) -> Dict:
        """Retorna status da fila"""
        queue = self.load_queue()
        processed = self.load_processed()
        failed = self.load_failed()
        
        pending = [item for item in queue if item['status'] == QueueStatus.PENDING.value]
        
        return {
            "queue_size": len(queue),
            "pending": len(pending),
            "processed": len(processed),
            "failed": len(failed),
            "next_batch": [Path(item['file']).name for item in pending[:3]],
            "estimated_time_minutes": len(pending) * self.service.config.delay_between_requests / 60
        }

# ===== INSTÂNCIAS GLOBAIS =====

# Criar instâncias apenas se as configurações estiverem válidas
try:
    service = ImageGenerationService()
    queue_manager = ImageGenerationQueue(service)
except Exception as e:
    logger.error(f"Erro ao inicializar serviço: {str(e)}")
    service = None
    queue_manager = None

# ===== FERRAMENTAS CREWAI =====

@tool
def generate_image_for_post(post_data: str) -> str:
    """
    Gera e faz upload de imagem para um único post
    
    Args:
        post_data: JSON string com dados do post (title, excerpt) ou caminho do arquivo
    
    Returns:
        JSON com resultado da operação
    """
    if not service:
        return json.dumps({"success": False, "error": "Serviço não inicializado"})
    
    try:
        # Verificar se é um caminho de arquivo
        if post_data.endswith('.json') and Path(post_data).exists():
            result = service.process_single_post(post_data, post_file=post_data)
        else:
            result = service.process_single_post(post_data)
        
        return json.dumps(result, ensure_ascii=False)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@tool
def process_all_posts_with_images() -> str:
    """
    Processa todos os posts em posts_formatados adicionando imagens
    
    Returns:
        JSON com estatísticas do processamento
    """
    if not service:
        return json.dumps({"success": False, "error": "Serviço não inicializado"})
    
    try:
        input_dir = Path(service.config.input_dir)
        if not input_dir.exists():
            return json.dumps({
                "success": False,
                "error": f"Diretório {service.config.input_dir} não encontrado"
            })
        
        results = {
            "total": 0,
            "processed": 0,
            "success": 0,
            "failed": 0,
            "skipped": 0,
            "details": []
        }
        
        json_files = list(input_dir.glob("*.json"))
        results["total"] = len(json_files)
        
        logger.info(f"📋 Encontrados {len(json_files)} posts para processar")
        
        for json_file in json_files:
            try:
                # Verificar se já tem imagem
                with open(json_file, 'r', encoding='utf-8') as f:
                    post_data = json.load(f)
                
                if post_data.get("mainImage") and post_data["mainImage"].get("asset"):
                    results["skipped"] += 1
                    results["details"].append(f"⏭️ {json_file.name}: Já possui imagem")
                    continue
                
                # Processar
                result = service.process_single_post(str(json_file), post_file=str(json_file))
                
                if result.get("success"):
                    results["success"] += 1
                    results["details"].append(f"✅ {json_file.name}")
                else:
                    results["failed"] += 1
                    results["details"].append(f"❌ {json_file.name}: {result.get('error')}")
                
                results["processed"] += 1
                
                # Rate limiting
                time.sleep(service.config.delay_between_requests)
                
            except Exception as e:
                results["failed"] += 1
                results["details"].append(f"❌ {json_file.name}: {str(e)}")
        
        summary = (
            f"Total: {results['total']}, "
            f"Processados: {results['processed']}, "
            f"Sucesso: {results['success']}, "
            f"Falhas: {results['failed']}, "
            f"Pulados: {results['skipped']}"
        )
        results["summary"] = summary
        
        return json.dumps(results, ensure_ascii=False, indent=2)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@tool
def add_posts_to_image_queue() -> str:
    """
    Adiciona todos os posts formatados à fila de geração de imagens
    
    Returns:
        JSON com estatísticas da operação
    """
    if not queue_manager:
        return json.dumps({"success": False, "error": "Queue manager não inicializado"})
    
    try:
        input_dir = Path(service.config.input_dir)
        if not input_dir.exists():
            return json.dumps({
                "success": False,
                "error": f"Diretório {service.config.input_dir} não encontrado"
            })
        
        added = 0
        skipped = 0
        
        for post_file in sorted(input_dir.glob("*.json")):
            # Verificar se já tem imagem
            with open(post_file, 'r', encoding='utf-8') as f:
                post = json.load(f)
            
            if post.get('mainImage'):
                skipped += 1
                continue
            
            if queue_manager.add_to_queue(str(post_file)):
                added += 1
        
        return json.dumps({
            "success": True,
            "added_to_queue": added,
            "skipped": skipped,
            "message": f"Adicionados {added} posts à fila, {skipped} já tinham imagem"
        })
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@tool
def process_image_queue_batch(batch_size: int = 3) -> str:
    """
    Processa um lote da fila de imagens com rate limiting
    
    Args:
        batch_size: Número de imagens para processar (default: 3)
    
    Returns:
        JSON com estatísticas do processamento
    """
    if not queue_manager:
        return json.dumps({"success": False, "error": "Queue manager não inicializado"})
    
    try:
        results = queue_manager.process_batch(batch_size)
        return json.dumps(results, ensure_ascii=False, indent=2)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@tool
def get_queue_status() -> str:
    """
    Retorna o status atual da fila de geração de imagens
    
    Returns:
        JSON com estatísticas da fila
    """
    if not queue_manager:
        return json.dumps({"success": False, "error": "Queue manager não inicializado"})
    
    try:
        status = queue_manager.get_status()
        return json.dumps(status, ensure_ascii=False, indent=2)
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@tool
def check_and_fix_missing_images() -> str:
    """
    Verifica posts publicados sem imagem e tenta gerar
    
    Returns:
        JSON com estatísticas do processamento
    """
    if not service:
        return json.dumps({"success": False, "error": "Serviço não inicializado"})
    
    try:
        published_dir = Path("posts_publicados")
        if not published_dir.exists():
            return json.dumps({
                "success": False,
                "error": "Diretório posts_publicados não encontrado"
            })
        
        fixed = 0
        checked = 0
        errors = []
        
        for post_file in published_dir.glob("*.json"):
            checked += 1
            
            try:
                with open(post_file, 'r', encoding='utf-8') as f:
                    post = json.load(f)
                
                if not post.get('mainImage'):
                    logger.info(f"🔧 Corrigindo post sem imagem: {post_file.name}")
                    result = service.process_single_post(str(post_file), post_file=str(post_file))
                    
                    if result.get("success"):
                        fixed += 1
                    else:
                        errors.append(f"{post_file.name}: {result.get('error')}")
                        
            except Exception as e:
                errors.append(f"{post_file.name}: {str(e)}")
        
        return json.dumps({
            "success": True,
            "checked": checked,
            "fixed": fixed,
            "errors": errors,
            "message": f"Verificados {checked} posts, corrigidos {fixed} sem imagem"
        })
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@tool
def retry_failed_images() -> str:
    """
    Recoloca imagens falhas de volta na fila para nova tentativa
    
    Returns:
        JSON com número de imagens readicionadas
    """
    if not queue_manager:
        return json.dumps({"success": False, "error": "Queue manager não inicializado"})
    
    try:
        failed = queue_manager.load_failed()
        queue_manager.save_failed([])  # Limpar falhas
        
        readded = 0
        for item in failed:
            item['status'] = QueueStatus.PENDING.value
            item['attempts'] = 0
            queue = queue_manager.load_queue()
            queue.append(item)
            queue_manager.save_queue(queue)
            readded += 1
        
        return json.dumps({
            "success": True,
            "readded": readded,
            "message": f"{readded} imagens readicionadas à fila"
        })
        
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

# Exportar ferramentas principais
__all__ = [
    'ImageGenerationService',
    'ImageGenerationQueue',
    'generate_image_for_post',
    'process_all_posts_with_images',
    'add_posts_to_image_queue',
    'process_image_queue_batch',
    'get_queue_status',
    'check_and_fix_missing_images',
    'retry_failed_images'
]