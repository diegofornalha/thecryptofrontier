#!/bin/bash

# Registrar aprendizado sobre content-types no Strapi v5
curl -X POST http://localhost:3007/process \
  -H "Content-Type: application/json" \
  -d '{
    "content": "SOLUÇÃO CONTENT-TYPES STRAPI V5: Para fazer os content-types aparecerem no admin e funcionarem, é necessário criar 4 arquivos: 1) routes com createCoreRouter, 2) controllers com createCoreController, 3) services com createCoreService, 4) index.ts exportando todos. Depois fazer build e restart. O comando ts:generate-types confirma se foram detectados."
  }'