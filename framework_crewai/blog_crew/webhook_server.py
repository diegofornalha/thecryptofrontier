#!/usr/bin/env python3
"""
Servidor de Webhook para receber notificações do Strapi v5
Roda na porta 8000 e está configurado no Caddy para webhook-crewai.agentesintegrados.com
"""
import os
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, HTTPException, Header, BackgroundTasks
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

app = FastAPI(title="CrewAI Webhook Server")

# Token de segurança
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'crew-ai-webhook-secret-2025')

# Armazenar eventos recebidos (para debug)
events_received = []

@app.get("/")
async def root():
    """Endpoint de saúde"""
    return {
        "status": "online",
        "service": "CrewAI Webhook Server",
        "timestamp": datetime.now().isoformat(),
        "events_received": len(events_received)
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/webhook/strapi")
async def handle_strapi_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
    x_strapi_event: Optional[str] = Header(None)
):
    """
    Handler principal para webhooks do Strapi v5
    URL: https://webhook-crewai.agentesintegrados.com/webhook/strapi
    """
    
    # Validar autorização
    if not authorization or authorization != f"Bearer {WEBHOOK_SECRET}":
        logger.warning(f"Unauthorized webhook attempt from {request.client.host}")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Parse do payload
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Invalid JSON payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    # Log do evento
    event_data = {
        "timestamp": datetime.now().isoformat(),
        "event": x_strapi_event,
        "model": payload.get('model'),
        "entry_id": payload.get('entry', {}).get('id'),
        "payload": payload
    }
    
    logger.info(f"Webhook received: {x_strapi_event} for {payload.get('model')}")
    
    # Armazenar evento (limitar a últimos 100)
    events_received.append(event_data)
    if len(events_received) > 100:
        events_received.pop(0)
    
    # Processar evento em background
    background_tasks.add_task(process_webhook_event, x_strapi_event, payload)
    
    return JSONResponse(
        content={
            "status": "success",
            "event": x_strapi_event,
            "timestamp": datetime.now().isoformat()
        },
        status_code=200
    )

async def process_webhook_event(event: str, payload: Dict[str, Any]):
    """Processa o evento do webhook de forma assíncrona"""
    
    try:
        if event == 'entry.create':
            await handle_entry_create(payload)
        elif event == 'entry.update':
            await handle_entry_update(payload)
        elif event == 'entry.publish':
            await handle_entry_publish(payload)
        elif event == 'entry.unpublish':
            await handle_entry_unpublish(payload)
        elif event == 'media.create':
            await handle_media_create(payload)
        else:
            logger.info(f"Unhandled event type: {event}")
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")

async def handle_entry_create(payload: Dict[str, Any]):
    """Processa criação de entrada"""
    model = payload.get('model')
    entry = payload.get('entry', {})
    
    logger.info(f"New {model} created: ID {entry.get('id')} - {entry.get('title', 'Untitled')}")
    
    if model == 'post':
        # TODO: Integrar com CrewAI para enriquecimento de conteúdo
        logger.info("TODO: Trigger content enrichment pipeline")

async def handle_entry_update(payload: Dict[str, Any]):
    """Processa atualização de entrada"""
    model = payload.get('model')
    entry = payload.get('entry', {})
    
    logger.info(f"{model} updated: ID {entry.get('id')}")

async def handle_entry_publish(payload: Dict[str, Any]):
    """Processa publicação de entrada"""
    model = payload.get('model')
    entry = payload.get('entry', {})
    
    logger.info(f"{model} published: ID {entry.get('id')} - {entry.get('title', 'Untitled')}")
    
    if model == 'post':
        # TODO: Trigger distribution pipeline
        logger.info("TODO: Trigger content distribution")

async def handle_entry_unpublish(payload: Dict[str, Any]):
    """Processa despublicação de entrada"""
    model = payload.get('model')
    entry = payload.get('entry', {})
    
    logger.info(f"{model} unpublished: ID {entry.get('id')}")

async def handle_media_create(payload: Dict[str, Any]):
    """Processa upload de mídia"""
    media = payload.get('media', {})
    
    logger.info(f"Media uploaded: {media.get('name')} ({media.get('mime')})")

@app.get("/webhook/events")
async def get_events():
    """Retorna os últimos eventos recebidos (para debug)"""
    return {
        "total": len(events_received),
        "events": events_received[-10:]  # Últimos 10 eventos
    }

@app.post("/webhook/test")
async def test_webhook(request: Request):
    """Endpoint de teste para verificar se o webhook está funcionando"""
    body = await request.json()
    return {
        "status": "received",
        "timestamp": datetime.now().isoformat(),
        "data": body
    }

if __name__ == "__main__":
    # Rodar servidor na porta 8000
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )