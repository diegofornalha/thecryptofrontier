#!/usr/bin/env python3
"""
Editor Agent - Adaptado para Claude CLI
Responsável por revisar e melhorar conteúdo
"""
from typing import Dict, Any, List
from .base_agent import BaseClaudeAgent


class EditorAgent(BaseClaudeAgent):
    """Agente especializado em edição e revisão de conteúdo"""
    
    def __init__(self):
        super().__init__(
            name="Editor",
            role="Editor Chefe de Conteúdo Cripto",
            goal="Garantir que todo conteúdo seja preciso, envolvente e livre de erros",
            backstory="""Você é um editor experiente com olhar crítico para:
            - Precisão técnica em blockchain
            - Clareza e fluidez do texto
            - Gramática e ortografia impecáveis
            - Consistência de tom e estilo
            - Fact-checking rigoroso
            - Otimização para publicação online
            
            Você tem padrões elevados e sempre busca elevar
            a qualidade do conteúdo ao máximo."""
        )
    
    def execute(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Executa tarefa de edição"""
        task_file = self.create_task(task, context)
        
        return {
            "status": "task_created",
            "task_file": task_file,
            "agent": self.name
        }
    
    def edit_article(self, content: str, focus_areas: List[str] = None) -> str:
        """
        Cria tarefa para editar artigo
        """
        task_description = f"""
## Editar e Revisar Artigo

### Áreas de Foco:
{chr(10).join(f'- {area}' for area in (focus_areas or ['gramática', 'clareza', 'precisão técnica']))}

### Conteúdo para Revisão:
```markdown
{content}
```

### Checklist de Edição:

#### 1. Precisão Técnica ⚙️
- [ ] Termos técnicos corretos
- [ ] Conceitos blockchain precisos
- [ ] Dados e estatísticas verificados
- [ ] Links funcionais
- [ ] Informações atualizadas

#### 2. Clareza e Fluidez 📖
- [ ] Parágrafos bem estruturados
- [ ] Transições suaves
- [ ] Frases concisas
- [ ] Eliminação de redundâncias
- [ ] Voz ativa predominante

#### 3. Gramática e Ortografia ✏️
- [ ] Ortografia correta
- [ ] Pontuação adequada
- [ ] Concordância verbal/nominal
- [ ] Uso correto de crase
- [ ] Padronização de termos

#### 4. SEO e Formatação 🔍
- [ ] Palavras-chave bem distribuídas
- [ ] Headers hierárquicos (H1, H2, H3)
- [ ] Meta descrição otimizada
- [ ] Alt text para imagens
- [ ] Links internos relevantes

#### 5. Engajamento 💡
- [ ] Título atrativo
- [ ] Introdução cativante
- [ ] CTAs claros
- [ ] Conclusão impactante
- [ ] Valor agregado evidente

### Sugestões de Melhoria:

Para cada problema encontrado, forneça:
1. Localização (parágrafo/linha)
2. Problema identificado
3. Sugestão de correção
4. Justificativa

### Output Esperado:

1. **Versão Editada** - Texto corrigido e melhorado
2. **Relatório de Edição** - Lista de mudanças feitas
3. **Score de Qualidade** - Avaliação 1-10 com justificativa
4. **Recomendações Adicionais** - Melhorias futuras
"""
        
        context = {
            "content": content,
            "focus_areas": focus_areas or ['all'],
            "style_guide": "professional but accessible"
        }
        
        return self.create_task(task_description, context)
    
    def fact_check(self, content: str, claims: List[str] = None) -> str:
        """
        Cria tarefa para verificação de fatos
        """
        task_description = f"""
## Verificação de Fatos

### Conteúdo para Verificar:
```markdown
{content}
```

### Claims Específicos para Verificar:
{chr(10).join(f'- {claim}' for claim in (claims or ['Todas as afirmações no texto']))}

### Processo de Fact-Checking:

1. **Identificar Afirmações**
   - Dados numéricos
   - Datas e eventos
   - Citações
   - Comparações
   - Previsões

2. **Verificar Cada Afirmação**
   - Fonte original
   - Credibilidade da fonte
   - Data da informação
   - Contexto completo
   - Consenso do mercado

3. **Classificar Veracidade**
   - ✅ Verdadeiro - Confirmado por múltiplas fontes
   - ⚠️ Parcialmente verdadeiro - Necessita contexto
   - ❌ Falso - Incorreto ou desatualizado
   - ❓ Não verificável - Falta informação

4. **Sugerir Correções**
   - Texto original
   - Correção sugerida
   - Fonte de referência
   - Nível de confiança

### Output:
Relatório detalhado de fact-checking com todas as verificações
e sugestões de correção para garantir 100% de precisão.
"""
        
        context = {
            "content": content,
            "claims": claims,
            "verification_level": "comprehensive"
        }
        
        return self.create_task(task_description, context)