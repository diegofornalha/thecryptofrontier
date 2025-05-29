# Solução de Problemas Comuns

## Erro de Renderização React (Objetos Sanity)

### Problema
```
Uncaught Error: Objects are not valid as a React child (found: object with keys {_ref, _type})
```

Este erro ocorre quando objetos do Sanity CMS (que contêm campos como `_ref` e `_type`) são renderizados diretamente como filhos React. Geralmente acontece após atualizações na estrutura de dados ou quando o cache do Next.js mantém referências desatualizadas.

### Solução
Limpar o cache de compilação do Next.js resolvendo a incompatibilidade:

```bash
# Remover o diretório .next que contém o cache do Next.js
rm -rf .next
npm run dev
```

### Quando Usar
- Após atualizações no schema do Sanity
- Quando alternar entre branches com diferentes estruturas de dados
- Quando aparecem erros inexplicáveis na renderização de componentes
- Após atualizações de dependências relacionadas ao React ou Sanity

### Explicação Técnica
O Next.js armazena em cache compilações e dados para otimizar o desempenho. Quando a estrutura de dados muda (especialmente em integrações com CMS), o cache pode conter referências incompatíveis com o código atual, resultando em erros de renderização. 