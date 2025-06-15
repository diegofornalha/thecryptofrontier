# Recomendação Guardian: Organização dos Arquivos .md

## Situação Atual

Existe um conflito entre:
1. **CLAUDE.md**: Indica que documentação deve ir para `/strapi/docs/`
2. **Pedido do usuário**: Solicita que arquivos .md fiquem na raiz
3. **Realidade**: O diretório `/strapi/docs/` não existe, mas existe `/docs/` na raiz

## Análise

- Atualmente existem ~40 arquivos .md em `/docs/` (na raiz)
- O diretório `/strapi/docs/` mencionado no CLAUDE.md não existe
- Já existe um padrão estabelecido com `/docs/` na raiz
- O arquivo GUARDIAN-REPORT.md já está na raiz

## Recomendação

### Para Arquivos de Documentação (.md)

1. **Manter o padrão atual**: Usar `/docs/` na raiz do projeto
2. **Exceção**: CLAUDE.md deve permanecer na raiz (como já está especificado)
3. **Atualizar CLAUDE.md** para refletir a realidade atual

### Estrutura Recomendada

```
/home/strapi/thecryptofrontier/
├── CLAUDE.md              # Permanece na raiz
├── docs/                  # Toda documentação do projeto
│   ├── guardian/          # Relatórios do Guardian
│   ├── docker/            # Documentação Docker
│   ├── strapi/            # Documentação específica do Strapi
│   └── crewai/            # Documentação do CrewAI
├── scripts/               # Scripts utilitários
├── framework_crewai/      # Framework CrewAI
├── strapi/                # Aplicação Strapi
└── src/                   # Código fonte Next.js
```

## Ação Necessária

Atualizar o CLAUDE.md para corrigir a localização da documentação de `/strapi/docs/` para `/docs/`.