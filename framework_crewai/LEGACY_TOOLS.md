# Legacy Tools Documentation

This document provides a comprehensive overview of the legacy tools and utilities that were previously used in the framework_crewai project. These tools have been deprecated in favor of the new modular structure, but their functionality is documented here for reference purposes.

## Project Evolution

The project has evolved through two major phases:

1. **Initial Implementation**: A collection of standalone scripts and utilities for RSS monitoring, article translation, and publishing to Sanity CMS.

2. **Modular Refactoring**: Restructuring the codebase into a more organized, modular system with clear separation of concerns, now using Redis for queue management.

## Legacy Tools Overview

### Content Processing Scripts

| File | Description | Current Status |
|------|-------------|----------------|
| `execute_flow.py` | Orchestrates the complete workflow for processing articles | Replaced by `app_modular.py` |
| `tradutor.py` | Standalone utility for translating a single article | Functionality integrated into the Translation Agent |
| `process_all_articles.py` | Bulk processes pending articles from the database | Replaced by Redis queue-based system |
| `publish_to_sanity.py` | Publishes translated content to Sanity CMS | Integrated into `sanity_tools.py` |
| `script_verificar_duplicatas.py` | Detects and removes duplicate posts | Integrated into `duplicate_detector_tool.py` |

### Sanity CMS Utilities

| File | Description |
|------|-------------|
| `configuracao-sanity.js` | Sets up Sanity CMS configuration |
| `corrigir_schema_posts.js` | Fixes schema issues in posts |
| `excluir-postagem.js` | Deletes posts from Sanity CMS |
| `listar-autores.js` | Lists authors in Sanity CMS |
| `listar_categorias_sanity.js` | Lists categories in Sanity CMS |
| `publicar_posts_traduzidos.js` | JavaScript utility to publish translated posts |
| `teste-conexao-sanity.js` | Tests connection to Sanity CMS |
| `teste-exclusao-post.js` | Tests post deletion functionality |
| `teste_publicar_schema.js` | Tests publishing with proper schema |

### Utility Scripts

| File | Description |
|------|-------------|
| `limpar_cache.sh` | Clears application cache |
| `migrate_to_modular.sh` | Migration script to the modular structure |
| `reiniciar_app.sh` | Restarts the application |
| `colors.js` | Color utilities for console output |
| `config.js` | Configuration utilities |
| `slugify.js` | Utility to create URL-friendly slugs |

## Key Legacy Functionality

### Article Processing Workflow

1. **Monitor RSS Feeds**:
   - Fetch articles from RSS feeds
   - Filter based on relevance
   - Save to local database

2. **Translate Articles**:
   - Process article content
   - Translate to Portuguese
   - Format with proper metadata

3. **Publish to Sanity**:
   - Convert to Sanity schema format
   - Check for duplicates
   - Publish to Sanity CMS
   - Update database status

### Duplicate Detection

The duplicate detection system used the following approach:

1. Extract keywords from article titles
2. Query Sanity CMS for existing articles
3. Compare titles using keyword matching
4. Mark duplicate articles in database

### File Format Conversion

The system supported multiple file format conversions:

- JSON → Markdown conversion for article publishing
- RSS feed → JSON for initial processing
- Markdown → Sanity Schema for CMS publishing

## Migration to Modern Architecture

The legacy codebase has been replaced with a more structured approach:

1. **Modular Design**: Clear separation between business logic, UI, and tools
2. **Redis Queue**: Reliable message queue for article processing
3. **Docker Support**: Containerized deployment for consistency
4. **Streamlined UI**: Improved Streamlit interface
5. **Standardized Error Handling**: Better error reporting and recovery

## Recommendations for Legacy Code Users

If you need to reference or use any legacy functionality:

1. Check the new modular structure first to see if the functionality exists there
2. For Sanity CMS operations, use the tools in `src/blog_automacao/tools/sanity_tools.py`
3. For article processing, use the Redis queue-based system
4. For UI components, refer to `src/blog_automacao/ui/`

---

All the legacy code files have been preserved in the `utils_backup_legado` directory for historical reference but should not be used in new development.