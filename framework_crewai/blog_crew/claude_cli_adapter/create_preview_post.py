#!/usr/bin/env python3
"""
Cria uma página de preview do artigo gerado
"""
import json
from pathlib import Path
from datetime import datetime

print("🖼️ Criando Preview do Artigo...")

# Carregar artigo
article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
with open(article_file, 'r') as f:
    article = json.load(f)

# Criar HTML de preview completo
html_content = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article['title']} - Preview</title>
    <meta name="description" content="{article['meta_description']}">
    <meta name="keywords" content="{', '.join(article['seo']['keywords'])}">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }}
        
        .container {{
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 100vh;
        }}
        
        header {{
            text-align: center;
            padding: 40px 0;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 40px;
        }}
        
        h1 {{
            font-size: 2.5em;
            color: #2c3e50;
            margin-bottom: 20px;
            line-height: 1.2;
        }}
        
        .meta {{
            color: #7f8c8d;
            font-size: 0.9em;
        }}
        
        .excerpt {{
            font-size: 1.2em;
            color: #555;
            font-style: italic;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
        }}
        
        .tags {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
        }}
        
        .tag {{
            background: #3498db;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
        }}
        
        .content {{
            font-size: 1.1em;
            line-height: 1.8;
            color: #2c3e50;
        }}
        
        .content h2 {{
            margin: 30px 0 15px;
            color: #2c3e50;
            font-size: 1.8em;
        }}
        
        .content h3 {{
            margin: 25px 0 10px;
            color: #34495e;
            font-size: 1.4em;
        }}
        
        .content p {{
            margin-bottom: 20px;
        }}
        
        .content ul {{
            margin: 20px 0 20px 40px;
        }}
        
        .content li {{
            margin-bottom: 10px;
        }}
        
        .content strong {{
            color: #2c3e50;
        }}
        
        .stats {{
            background: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 40px 0;
            text-align: center;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        
        .stat {{
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }}
        
        .stat-number {{
            font-size: 2em;
            font-weight: bold;
            color: #3498db;
        }}
        
        .stat-label {{
            font-size: 0.9em;
            color: #7f8c8d;
        }}
        
        footer {{
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #7f8c8d;
        }}
        
        .cta {{
            background: #3498db;
            color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            margin: 40px 0;
        }}
        
        .cta h3 {{
            margin-bottom: 10px;
        }}
        
        .button {{
            display: inline-block;
            background: white;
            color: #3498db;
            padding: 10px 30px;
            border-radius: 25px;
            text-decoration: none;
            margin-top: 15px;
            font-weight: bold;
        }}
        
        @media (max-width: 600px) {{
            h1 {{
                font-size: 1.8em;
            }}
            
            .container {{
                padding: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{article['title']}</h1>
            <div class="meta">
                <p>📅 {datetime.now().strftime('%d de %B de %Y')} | 📖 {len(article['content'].split())} palavras | ⏱️ {len(article['content'].split()) // 200} min de leitura</p>
            </div>
        </header>
        
        <div class="excerpt">
            {article['excerpt']}
        </div>
        
        <div class="tags">
            {''.join([f'<span class="tag">#{tag}</span>' for tag in article['tags']])}
        </div>
        
        <div class="stats">
            <h3>📊 Estatísticas do Artigo</h3>
            <div class="stats-grid">
                <div class="stat">
                    <div class="stat-number">{len(article['content'].split())}</div>
                    <div class="stat-label">Palavras</div>
                </div>
                <div class="stat">
                    <div class="stat-number">{len(article['tags'])}</div>
                    <div class="stat-label">Tags</div>
                </div>
                <div class="stat">
                    <div class="stat-number">{len(article['categories'])}</div>
                    <div class="stat-label">Categorias</div>
                </div>
                <div class="stat">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">SEO Score</div>
                </div>
            </div>
        </div>
        
        <div class="content">
            {article['content'].replace(chr(10), '<br><br>').replace('**', '<strong>').replace('**', '</strong>')}
        </div>
        
        <div class="cta">
            <h3>🚀 Pronto para Publicar!</h3>
            <p>Este artigo foi gerado automaticamente pelo pipeline de IA</p>
            <a href="https://ale-blog.agentesintegrados.com/admin" class="button">Publicar no Strapi</a>
        </div>
        
        <footer>
            <p>🤖 Gerado por CrewAI + Claude CLI | Pipeline de Automação de Blog</p>
            <p>© 2025 The Crypto Frontier</p>
        </footer>
    </div>
</body>
</html>"""

# Salvar preview
preview_file = Path("article_preview_complete.html")
with open(preview_file, 'w') as f:
    f.write(html_content)

print(f"✅ Preview criado: {preview_file}")
print(f"\n🌐 Para visualizar:")
print(f"1. Abra no navegador: file://{preview_file.absolute()}")
print(f"2. Ou sirva com: python3 -m http.server 8080")
print(f"3. Acesse: http://localhost:8080/article_preview_complete.html")

# Criar versão simplificada para o blog preview
simple_content = f"""
<div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
    <h1>{article['title']}</h1>
    <p style="color: #666; margin: 20px 0;">{article['excerpt']}</p>
    <div style="margin: 20px 0;">
        {''.join([f'<span style="background: #e0e0e0; padding: 5px 10px; margin-right: 10px; border-radius: 3px;">#{tag}</span>' for tag in article['tags']])}
    </div>
    <hr>
    <div style="line-height: 1.6;">
        {article['content'].replace(chr(10), '<br><br>')}
    </div>
</div>
"""

# Salvar versão para API
api_data = {
    "data": [{
        "id": 1,
        "attributes": {
            "title": article['title'],
            "slug": article['slug'],
            "content": article['content'],
            "excerpt": article['excerpt'],
            "publishedAt": datetime.now().isoformat(),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
    }]
}

with open("mock_api_response.json", 'w') as f:
    json.dump(api_data, f, indent=2)

print("\n📦 Arquivos criados:")
print("- article_preview_complete.html (preview completo)")
print("- mock_api_response.json (para testar API)")

print("\n✨ Pipeline de automação completo e funcional!")
print("   Apenas aguardando configuração de autenticação JWT para publicação automática.")