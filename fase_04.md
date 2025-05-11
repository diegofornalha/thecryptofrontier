# Plano de Migração para shadcn/ui: Fase 4 - Limpeza e Finalização

## 1. Introdução e Objetivos

A Fase 4 representa a etapa final da migração para o shadcn/ui, focando na limpeza do código legado, consolidação do design system, e preparação para o uso contínuo da nova biblioteca de componentes. Neste estágio, garantimos que o sistema esteja pronto para uso produtivo e que a equipe esteja preparada para trabalhar com ele.

**Objetivos:**
- Remover componentes e estilos legados de forma segura
- Finalizar e consolidar a documentação completa
- Capacitar a equipe através de treinamento
- Lançar oficialmente o sistema migrado
- Estabelecer processos de manutenção e evolução


## 2. Limpeza de Código

### 2.1. Identificação de Código Legado

Utilize ferramentas automatizadas para identificar componentes e estilos não utilizados:

```bash
# Instalar dependências necessárias
npm install -D depcheck unused-exports

# Executar análise de dependências não utilizadas
npx depcheck

# Analisar exportações não utilizadas
npx unused-exports tsconfig.json
```

Script personalizado para identificar componentes legados específicos:

```javascript
// scripts/find-legacy-components.js
const glob = require('glob');
const fs = require('fs');
const path = require('path');

// Padrões para identificar componentes legados (com classes sb-*)
const LEGACY_PATTERNS = [
  /sb-component/,
  /sb-[a-z-]+/,
  /className={classNames\(/
];

// Buscar arquivos
const files = glob.sync('src/**/*.{jsx,tsx}');

// Resultados
const legacyComponents = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const matches = lines.filter(line => 
    LEGACY_PATTERNS.some(pattern => pattern.test(line))
  );
  
  if (matches.length > 0) {
    legacyComponents[file] = matches.length;
  }
});

console.log('Componentes legados encontrados:');
console.log(legacyComponents);
console.log(`Total: ${Object.keys(legacyComponents).length} arquivos`);
```

### 2.2. Estratégia de Remoção Segura

Implementar um processo gradual de remoção:

1. **Depreciação**:
   - Marcar componentes como depreciados
   - Adicionar avisos de console em desenvolvimento
   - Adicionar documentação indicando alternativas

2. **Remoção Dual**:
   - Manter componentes legados e novos em paralelo temporariamente
   - Usar feature flags para controlar qual versão é usada

3. **Remoção Completa**:
   - Remover código legado após confirmação de que não é usado

Exemplo de componente com aviso de depreciação:

```tsx
// src/components/legacy/OldButton.tsx
import { useEffect } from 'react';

export function OldButton(props) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'OldButton está depreciado. Use o componente Button do shadcn/ui. ' +
        'Será removido na versão 2.0.0.'
      );
    }
  }, []);
  
  return (
    <button 
      className={`sb-component sb-component-button ${props.className || ''}`}
      {...props}
    >
      {props.children}
    </button>
  );
}
```

### 2.3. Remoção de CSS Não Utilizado

Configurar PurgeCSS para remover estilos não utilizados:

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' 
      ? require('@fullhuman/postcss-purgecss')({
          content: [
            './src/**/*.{js,jsx,ts,tsx}',
            './public/index.html'
          ],
          defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
          safelist: {
            standard: [/^react-/, /^next-/],
            deep: [/shadcn/, /ui-/]
          }
        })
      : undefined,
  ].filter(Boolean)
};
```

### 2.4. Checklist para Remoção Segura

Para cada componente legado a ser removido:

- [ ] Verificar se há referências em todo o codebase
- [ ] Confirmar que existe um equivalente shadcn/ui implementado
- [ ] Avisar a equipe sobre a remoção
- [ ] Testar em ambiente de desenvolvimento
- [ ] Atualizar documentação para refletir a remoção
- [ ] Monitorar erros após a remoção

## 3. Consolidação do Design System

### 3.1. Auditoria Final de Consistência

Executar uma auditoria final do design system:

```jsx
// src/pages/design-audit.tsx
import { Button, Card, Input, Badge, Avatar } from '@/components/ui';

export default function DesignAudit() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-4">Auditoria de Botões</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Claro</h3>
            <div className="p-4 bg-white rounded-lg flex gap-2">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Escuro</h3>
            <div className="p-4 bg-gray-900 rounded-lg flex gap-2">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Repetir para outros componentes */}
    </div>
  );
}
```

### 3.2. Ajustes Finais de Temas

Garantir que as variáveis CSS estejam harmonizadas:

```css
/* src/css/theme-final-adjustments.css */
@layer base {
  :root {
    /* Ajustes finais de cores */
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    /* Adicionar novas variáveis específicas do projeto */
    --brand-gradient-1: linear-gradient(to right, hsl(var(--primary)), hsl(250 83.2% 53.3%));
    --feature-bg: 230 100% 98%;
  }
  
  .dark {
    /* Ajustes finais para tema escuro */
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    
    /* Variáveis específicas do tema escuro */
    --feature-bg: 230 20% 15%;
  }
}
```

### 3.3. Verificação Final de Acessibilidade

Executar verificações de acessibilidade em todos os componentes:

```bash
# Instalar ferramentas necessárias
npm install -D @axe-core/react jest-axe

# Executar testes de acessibilidade
npm run test:a11y
```

## 4. Documentação Final

### 4.1. Estrutura da Documentação

Organizar a documentação em categorias claras:

```
docs/
├── introdução/
│   ├── sobre.md
│   ├── instalação.md
│   └── primeiros-passos.md
├── componentes/
│   ├── básicos/
│   │   ├── button.md
│   │   ├── input.md
│   │   └── ...
│   ├── formulários/
│   │   ├── form.md
│   │   ├── select.md
│   │   └── ...
│   └── layout/
│       ├── card.md
│       ├── dialog.md
│       └── ...
├── guias/
│   ├── migração-do-legacy.md
│   ├── estenendo-componentes.md
│   └── melhores-práticas.md
└── recursos/
    ├── design-tokens.md
    ├── ícones.md
    └── utilitários.md
```

### 4.2. Documentação Interna vs. Externa

Separar documentação para diferentes públicos:

1. **Documentação pública:**
   - Guias de uso
   - Exemplos básicos
   - API de componentes

2. **Documentação interna:**
   - Detalhes de implementação
   - Extensões específicas do projeto
   - Decisões arquiteturais

### 4.3. Exemplo de Página de Documentação Completa

```md
# Form

O componente `Form` é uma abstração de formulários baseada no `react-hook-form` e `zod`, fornecendo validação integrada, gerenciamento de estado e acessibilidade para formulários.

## Importação

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
```

## Uso Básico

```tsx
// Define o schema de validação
const formSchema = z.object({
  username: z.string().min(2, {
    message: "O nome de usuário deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
});

// Use o hook useForm com resolver zod
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    username: "",
    email: "",
  },
});

// Função de submissão
function onSubmit(values: z.infer<typeof formSchema>) {
  console.log(values);
}

// Renderização do formulário
return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Form.Field
        control={form.control}
        name="username"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Nome de usuário</Form.Label>
            <Form.Control>
              <Input placeholder="johndoe" {...field} />
            </Form.Control>
            <Form.Description>
              Este é seu nome de usuário público.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="email"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Email</Form.Label>
            <Form.Control>
              <Input placeholder="email@exemplo.com" {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Button type="submit">Enviar</Button>
    </form>
  </Form>
);
```

## Componentes

O componente `Form` é composto por vários subcomponentes:

| Componente | Descrição |
|------------|-----------|
| `Form` | Componente raiz que recebe o form do react-hook-form |
| `Form.Field` | Conecta um campo ao react-hook-form |
| `Form.Item` | Contêiner para os elementos de um campo |
| `Form.Label` | Rótulo acessível para o campo |
| `Form.Control` | Wrapper para o controle de entrada |
| `Form.Description` | Texto descritivo opcional |
| `Form.Message` | Exibe mensagens de erro de validação |

## Campos Customizados

Exemplo de campo customizado:

```tsx
function CustomFormField({ control, name, label, ...props }) {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <div className="relative">
              <Input {...field} {...props} />
              <div className="absolute right-2 top-2">
                {/* Conteúdo customizado */}
              </div>
            </div>
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}
```

## Acessibilidade

Este componente segue as práticas recomendadas de acessibilidade:

- Usa elementos `<label>` adequadamente associados aos campos
- Mensagens de erro são anunciadas por leitores de tela
- Suporta navegação por teclado
- Estados de foco são claramente indicados

## Dicas e Boas Práticas

- Sempre defina um schema de validação com mensagens claras
- Use `Form.Description` para fornecer contexto adicional
- Agrupe campos relacionados em seções com cabeçalhos apropriados
- Para formulários complexos, considere dividir em etapas
```

## 5. Treinamento e Capacitação

### 5.1. Workshops de Treinamento

Estruturar workshops para diferentes equipes:

**Workshop 1: Introdução ao shadcn/ui**
- Duração: 2 horas
- Público: Todos os desenvolvedores
- Conteúdo:
  - Visão geral do design system
  - Conceitos fundamentais (composição, variantes, etc.)
  - Demonstração de componentes básicos
  - Exercícios práticos simples

**Workshop 2: Migração de Componentes Legados**
- Duração: 3 horas
- Público: Desenvolvedores experientes
- Conteúdo:
  - Estratégias de migração
  - Extensão de componentes
  - Tratamento de casos de borda
  - Exercícios de migração

**Workshop 3: Criação de Componentes Complexos**
- Duração: 4 horas
- Público: Líderes técnicos e arquitetos
- Conteúdo:
  - Composição avançada
  - Integração com APIs externas
  - Otimização de desempenho
  - Acessibilidade avançada

### 5.2. Materiais de Referência

Criar materiais de referência rápida:

- **Cheat sheet** de componentes mais usados
- Cartões de referência para padrões comuns
- Guia de migração passo a passo
- Vídeos curtos de tutoriais

### 5.3. Programa de Champions

Estabelecer um programa de champions por equipe:

1. Identificar um desenvolvedor por equipe para ser o "champion"
2. Fornecer treinamento avançado para os champions
3. Estabelecer reuniões regulares entre champions
4. Criar canal de suporte prioritário para champions

## 6. Lançamento e Comunicação

### 6.1. Estratégia de Lançamento

Implementar um lançamento gradual:

**Fase 1: Lançamento Interno**
- Aplicar em projetos internos não críticos
- Coletar feedback inicial
- Ajustar conforme necessário

**Fase 2: Lançamento em Projetos Piloto**
- Selecionar 2-3 projetos para adoção completa
- Fornecer suporte dedicado
- Documentar casos de uso reais

**Fase 3: Lançamento Geral**
- Comunicar adoção para toda a organização
- Estabelecer cronograma para projetos existentes
- Exigir uso em novos projetos

### 6.2. Plano de Comunicação

Template para comunicação de lançamento:

```md
# Anúncio: Lançamento Oficial do Novo Design System com shadcn/ui

Temos o prazer de anunciar o lançamento oficial do nosso novo design system baseado em shadcn/ui!

## O que mudou?

- Nova biblioteca de componentes com melhor acessibilidade
- Design consistente em toda a plataforma
- Documentação completa e exemplos
- Melhor desempenho e menor tamanho de bundle

## O que fazer agora?

1. Acesse a [documentação completa](link)
2. Participe dos workshops de treinamento
3. Converse com seu champion de design system
4. Planeje a migração do seu projeto

## Cronograma

- **Maio 2024**: Suporte para projetos piloto
- **Junho 2024**: Migração de projetos existentes
- **Julho 2024**: Todos os novos projetos devem usar o novo design system

## Suporte

Para dúvidas ou suporte, contacte [nome@email.com](mailto:nome@email.com) ou use o canal #design-system no Slack.
```

### 6.3. Checklist de Lançamento

Antes do lançamento oficial, verificar:

- [ ] Todos os componentes prioritários estão migrados e testados
- [ ] Documentação completa e revisada
- [ ] Workshops de treinamento preparados
- [ ] Processo de suporte estabelecido
- [ ] Plano de comunicação pronto
- [ ] Material de referência disponível
- [ ] Monitoramento configurado
- [ ] Plano de contingência definido

## 7. Monitoramento e Manutenção

### 7.1. Métricas de Sucesso

Estabelecer KPIs para medir o sucesso da migração:

| Métrica | Alvo | Método de Medição |
|---------|------|-------------------|
| Adoção de componentes | >90% em 3 meses | Análise de código |
| Velocidade de desenvolvimento | +20% | Métricas de produtividade |
| Tamanho de bundle | -15% | Análise de build |
| Satisfação dos desenvolvedores | >8/10 | Pesquisa |
| Consistência de UI | >95% | Auditoria visual |
| Problemas de acessibilidade | <5 por projeto | Testes automáticos |

### 7.2. Processo de Manutenção

Estabelecer um ciclo de vida para o design system:

1. **Releases Menores**: Correções e melhorias incrementais (mensal)
2. **Releases Médias**: Novos componentes e recursos (trimestral)
3. **Releases Maiores**: Mudanças significativas e atualizações do shadcn/ui (semestral)

Documentar processo de contribuição:

```md
# Contribuindo para o Design System

## Tipos de Contribuição

1. **Correção de bugs**
2. **Melhorias em componentes existentes**
3. **Novos componentes**
4. **Melhorias na documentação**

## Processo

1. Abra uma issue descrevendo a contribuição
2. Discuta a abordagem com o time
3. Implemente a mudança em uma branch separada
4. Adicione/atualize testes e documentação
5. Submeta um PR para revisão
6. Após aprovação, será mesclado na branch principal

## Diretrizes

- Mantenha a consistência com o design system existente
- Garanta acessibilidade (WCAG AA no mínimo)
- Escreva testes para todas as funcionalidades
- Documente APIs e exemplos de uso
```

### 7.3. Plano de Evolução Contínua

Planejamento para o futuro do design system:

**Curto prazo (3-6 meses):**
- Refinar componentes existentes
- Aprimorar documentação com mais exemplos
- Melhorar cobertura de testes

**Médio prazo (6-12 meses):**
- Adicionar novos componentes especializados
- Implementar integrações com outras ferramentas
- Desenvolver plugins específicos do projeto

**Longo prazo (12+ meses):**
- Revisão maior do design system
- Avaliação de novas tecnologias
- Possível expansão para outras plataformas

## 8. Lições Aprendidas e Conclusão

### 8.1. Registro de Lições Aprendidas

Documentar as principais lições do processo de migração:

```md
# Lições Aprendidas na Migração para shadcn/ui

## O que funcionou bem

- Abordagem gradual por camadas (atoms → blocks → layouts → sections)
- Testes visuais para capturar regressões
- Documentação paralela à implementação
- Champions por equipe

## Desafios enfrentados

- Componentes complexos com muitas dependências
- Inconsistências no design system anterior
- Resistência à mudança em algumas equipes
- Estimativas de tempo para componentes complexos

## Recomendações para o futuro

- Começar com auditoria mais detalhada
- Envolver designers desde o início
- Investir mais tempo em testes automatizados
- Comunicar benefícios de forma mais clara para todas as partes interessadas
```

### 8.2. Conclusão

A migração para o shadcn/ui representa um passo importante na evolução do nosso sistema de design. Com esta migração, alcançamos:

- **Maior consistência visual** em toda a plataforma
- **Melhor experiência para desenvolvedores** com componentes bem documentados
- **Maior acessibilidade** em todos os componentes
- **Melhor desempenho** com componentes otimizados
- **Base sólida** para evolução futura do design system
