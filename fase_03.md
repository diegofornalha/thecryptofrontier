# Plano de Migração para shadcn/ui: Fase 3 - Testes e Refinamento

## 1. Introdução e Objetivos

A Fase 3 é dedicada ao refinamento e validação da migração para o shadcn/ui. Neste estágio, todos os componentes prioritários já foram implementados, e o foco agora é garantir que eles funcionem perfeitamente juntos, sem regressões visuais ou funcionais, e atendam aos padrões de qualidade estabelecidos.

**Objetivos:**
- Realizar testes abrangentes de todos os componentes migrados
- Identificar e corrigir inconsistências visuais e funcionais
- Otimizar o desempenho dos componentes
- Validar acessibilidade e responsividade
- Coletar e incorporar feedback dos usuários
- Finalizar a documentação para desenvolvedores

## 2. Metodologia de Testes

### 2.1. Níveis de Teste

#### Testes Unitários

Usaremos Jest com React Testing Library para testes unitários:

```tsx
// src/components/ui/__tests__/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renderiza corretamente', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Clique aqui');
  });

  it('dispara evento onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('aplica variante corretamente', () => {
    render(<Button variant="destructive">Excluir</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });
});
```

#### Testes de Integração

Para testar como os componentes funcionam juntos:

```tsx
// src/components/__tests__/form-integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from '../blocks/ContactForm';

describe('ContactForm', () => {
  it('valida campos corretamente', async () => {
    render(<ContactForm />);
    
    // Submeter formulário vazio
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    // Verificar mensagens de erro
    await waitFor(() => {
      expect(screen.getByText(/nome deve ter pelo menos/i)).toBeInTheDocument();
      expect(screen.getByText(/insira um email válido/i)).toBeInTheDocument();
    });
    
    // Preencher formulário corretamente
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'joao@exemplo.com' } });
    fireEvent.change(screen.getByLabelText(/mensagem/i), { target: { value: 'Esta é uma mensagem de teste para o formulário.' } });
    
    // Submeter novamente
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    // Verificar que não há mais erros
    await waitFor(() => {
      expect(screen.queryByText(/nome deve ter pelo menos/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/insira um email válido/i)).not.toBeInTheDocument();
    });
  });
});
```

#### Testes Visuais de Regressão

Configurar Storybook com Chromatic para capturar e comparar screenshots:

```jsx
// src/components/ui/button.stories.jsx
import { Button } from './button';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      control: { type: 'select' }
    },
    size: {
      options: ['default', 'sm', 'lg', 'icon'],
      control: { type: 'select' }
    }
  }
};

export const Default = {
  args: {
    children: 'Botão Padrão',
    variant: 'default',
    size: 'default'
  }
};

export const AllVariants = () => (
  <div className="flex flex-wrap gap-4">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
);

export const AllSizes = () => (
  <div className="flex items-center gap-4">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">🔍</Button>
  </div>
);
```

Configuração do Chromatic:

```bash
# Instalar Chromatic
npm install --save-dev chromatic

# Publicar Stories para teste visual
npx chromatic --project-token=YOUR_PROJECT_TOKEN
```

#### Testes de Acessibilidade

Usando axe-core para verificar problemas de acessibilidade:

```tsx
// src/tests/a11y/button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('não deve ter violações de acessibilidade', async () => {
    const { container } = render(
      <Button>Botão Acessível</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('mantém acessibilidade quando desabilitado', async () => {
    const { container } = render(
      <Button disabled>Botão Desabilitado</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

Script para executar testes de acessibilidade:

```bash
# package.json
{
  "scripts": {
    "test:a11y": "jest --testPathPattern=a11y"
  }
}
```

#### Testes de Desempenho

Configurar Lighthouse para avaliar o desempenho:

```javascript
// scripts/performance-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse('http://localhost:3000/component-lab', options);
  const reportHtml = runnerResult.report;
  
  fs.writeFileSync('performance-report.html', reportHtml);
  
  console.log('Relatório gerado:', runnerResult.lhr.categories.performance.score * 100);
  
  await chrome.kill();
}

runLighthouse();
```

### 2.2. Matriz de Testes

Para cada componente migrado, criar uma matriz de testes:

| Componente | Unitário | Integração | Visual | Acessibilidade | Desempenho | Compatibilidade |
|------------|:--------:|:----------:|:------:|:--------------:|:----------:|:--------------:|
| Button     | ✅       | ✅         | ✅     | ✅             | ✅         | ✅             |
| Badge      | ✅       | ✅         | ✅     | ✅             | ✅         | ✅             |
| Input      | ✅       | ✅         | ✅     | ✅             | ✅         | ✅             |
| Form       | ✅       | ✅         | ✅     | ✅             | ✅         | ✅             |
| Card       | ✅       | ✅         | ✅     | ✅             | ✅         | ✅             |
| Dialog     | ✅       | ✅         | ✅     | ✅             | ✅         | ✅             |

## 3. Processo de Refinamento

### 3.1. Identificação e Classificação de Problemas

Implementar um sistema de classificação para problemas encontrados:

| Nível    | Descrição                                                  | SLA para Correção |
|----------|------------------------------------------------------------|--------------------|
| Crítico  | Impede funcionalidade principal, bloqueia usuário          |    |
| Alto     | Afeta funcionalidade importante, tem contorno              |            |
| Médio    | Problema visual ou UX, não bloqueia funcionalidade         |           |
| Baixo    | Melhoria, não é problema crítico                           | Próxima iteração   |

### 3.2. Fluxo de Trabalho para Refinamento

Para cada problema identificado:

1. **Documentar**
   - Registrar problema com capturas de tela
   - Descrever comportamento esperado vs. atual
   - Classificar severidade
   - Registrar em sistema de tracking (ex: GitHub Issues)

2. **Priorizar**
   - Avaliar impacto
   - Atribuir prioridade
   - Agendar correção de acordo com SLA

3. **Corrigir**
   - Implementar correção
   - Documentar a abordagem
   - Adicionar testes específicos

4. **Validar**
   - Testes automatizados
   - Revisão manual
   - Verificação de regressões

### 3.3. Exemplo de Processo de Refinamento

**Problema:** Inconsistência no espaçamento entre ícone e texto em botões

**Documentação:**
```md
## Problema de Espaçamento em Botões com Ícones

**Severidade:** Média

**Descrição:**
O espaçamento entre ícones e texto nos botões está inconsistente em diferentes contextos.
- Quando usado dentro de formulários: 8px de espaçamento
- Quando usado em cards: 12px de espaçamento
- Quando usado em dialogs: 6px de espaçamento

**Comportamento Esperado:**
Espaçamento consistente de 8px entre ícone e texto em todos os contextos.

**Capturas de Tela:**
[Link para capturas de tela]

**Contextos Afetados:**
- Formulários
- Cards
- Dialogs
```

**Correção:**
```tsx
// Antes
<Button className={className}>
  {iconPosition === 'left' && icon && <span className="mr-2">{icon}</span>}
  {children}
  {iconPosition === 'right' && icon && <span className="ml-2">{icon}</span>}
</Button>

// Depois - com espaçamento consistente
import { cn } from "@/lib/utils";

<Button className={cn("flex items-center gap-2", className)}>
  {iconPosition === 'left' && icon}
  <span>{children}</span>
  {iconPosition === 'right' && icon}
</Button>
```

## 4. Feedback dos Usuários

### 4.1. Métodos de Coleta de Feedback

#### Pesquisa para Desenvolvedores

Criar um formulário para desenvolvedores internos:

```
# Pesquisa de Satisfação: Migração para shadcn/ui

1. Quão satisfeito você está com os novos componentes? (1-5)
2. Os componentes migrados mantêm todas as funcionalidades anteriores? (Sim/Não)
3. Quais problemas você encontrou ao usar os novos componentes?
4. Quais componentes podem ser melhorados e como?
5. A documentação é clara e suficiente? (1-5)
6. O que você gostaria de ver na próxima iteração?
```

#### Testes com Usuários

Realizar sessões de observação:

1. Preparar cenários de uso comuns
2. Observar desenvolvedores utilizando os componentes
3. Registrar pontos de confusão ou frustração
4. Coletar sugestões de melhoria

### 4.2. Análise de Feedback

Criar categorias para o feedback recebido:

- Problemas de funcionalidade
- Inconsistências visuais
- Dificuldades de implementação
- Sugestões de melhoria
- Documentação insuficiente

### 4.3. Implementação de Melhorias

Baseado no feedback, priorizar melhorias:

1. Correção de bugs e problemas funcionais
2. Melhorias de usabilidade para desenvolvedores
3. Expansão da documentação
4. Novos recursos ou extensões

## 5. Otimizações de Desempenho

### 5.1. Análise de Desempenho

Comparar métricas antes e depois da migração:

| Métrica                 | Antes  | Depois | Diferença |
|-------------------------|--------|--------|-----------|
| Tamanho total do bundle | 245 KB | 210 KB | -35 KB    |
| Tempo de carregamento   | 1.8s   | 1.5s   | -0.3s     |
| Tempo de renderização   | 350ms  | 280ms  | -70ms     |
| Score Lighthouse        | 76     | 92     | +16       |

### 5.2. Otimizações Específicas

#### Code Splitting e Lazy Loading

```tsx
// src/components/complex/DataTable/index.tsx
import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loading para componente pesado
const DataTableFull = lazy(() => import('./DataTableFull'));

export function DataTable(props) {
  if (props.isSimpleView) {
    return <DataTableSimple {...props} />;
  }

  return (
    <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
      <DataTableFull {...props} />
    </Suspense>
  );
}
```

#### Redução de CSS Não Utilizado

Configurar análise de CSS não utilizado:

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // outras configurações
});
```

Executar análise:

```bash
ANALYZE=true npm run build
```

### 5.3. Testes de Desempenho Comparativos

Criar testes automatizados para medir desempenho:

```js
// src/tests/performance/render-time.js
import { Profiler } from 'react';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`Componente: ${id}`);
  console.log(`Fase: ${phase}`);
  console.log(`Duração atual: ${actualDuration.toFixed(2)}ms`);
  console.log(`Duração base: ${baseDuration.toFixed(2)}ms`);
}

describe('Desempenho de renderização', () => {
  it('mede o tempo de renderização do Button', () => {
    render(
      <Profiler id="Button" onRender={onRenderCallback}>
        <Button>Teste de desempenho</Button>
      </Profiler>
    );
  });
});
```

## 6. Documentação Final

### 6.1. Estrutura da Documentação

Criar uma estrutura de documentação abrangente:

```
docs/
├── componentes/
│   ├── atoms/
│   │   ├── button.md
│   │   ├── input.md
│   │   └── ...
│   ├── blocks/
│   │   ├── form.md
│   │   ├── card.md
│   │   └── ...
│   └── ...
├── guias/
│   ├── migracao.md
│   ├── extensao-de-componentes.md
│   └── melhores-praticas.md
├── design-system/
│   ├── cores.md
│   ├── tipografia.md
│   └── espacamento.md
└── README.md
```

### 6.2. Exemplo de Página de Documentação

```md
# Button

O componente `Button` representa um botão interativo ou link que pode ser usado para ações, navegação ou envio de formulários.

## Importação

```tsx
import { Button } from "@/components/ui/button";
```

## Uso Básico

```tsx
<Button>Clique aqui</Button>
```

## Variantes

O componente `Button` suporta as seguintes variantes:

- `default` - botão primário (padrão)
- `destructive` - para ações destrutivas
- `outline` - botão com contorno
- `secondary` - botão secundário
- `ghost` - botão sem fundo
- `link` - botão que parece um link

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Tamanhos

O componente `Button` suporta os seguintes tamanhos:

- `default` - tamanho padrão
- `sm` - pequeno
- `lg` - grande
- `icon` - para botões que contêm apenas ícones

```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><IconSearch /></Button>
```

## Como Usar com Ícones

```tsx
import { IconSearch } from "@/components/icons";

<Button>
  <IconSearch className="mr-2 h-4 w-4" />
  Pesquisar
</Button>

<Button>
  Próximo
  <IconArrowRight className="ml-2 h-4 w-4" />
</Button>
```

## Como Link

Use a prop `asChild` junto com um elemento `<Link>` para criar um botão que funciona como link:

```tsx
import Link from "next/link";

<Button asChild>
  <Link href="/about">Sobre nós</Link>
</Button>
```

## Props

| Prop     | Tipo                                                     | Padrão    | Descrição                                     |
|----------|---------------------------------------------------------|-----------|-----------------------------------------------|
| variant  | `default` \| `destructive` \| `outline` \| `secondary` \| `ghost` \| `link` | `default` | Estilo visual do botão                       |
| size     | `default` \| `sm` \| `lg` \| `icon`                     | `default` | Tamanho do botão                              |
| asChild  | `boolean`                                               | `false`   | Passar props para elemento filho              |
| disabled | `boolean`                                               | `false`   | Desabilita o botão                            |
```

### 6.3. Exemplos Interativos

Configurar exemplos interativos usando CodeSandbox ou similar:

```md
## Botão com Estado

<iframe
  src="https://codesandbox.io/embed/button-state-example"
  style={{ width: '100%', height: '500px', border: 0, borderRadius: '4px', overflow: 'hidden' }}
  title="Exemplo de Botão com Estado"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>
```

## 7. Cronograma e Marcos

### 7.1. Cronograma Detalhado

|                                                               | Entregáveis                                 |
|--------|----------------------------------|---------------------------------------------------------------------------|---------------------------------------------|
| 1      | Configuração e Testes            | - Configurar ambiente de testes<br>- Implementar testes unitários<br>- Configurar Storybook<br>- Implementar testes de acessibilidade | - Ambiente de testes configurado<br>- Suite de testes inicial |
| 2      | Testes Abrangentes               | - Testes para todos os componentes<br>- Testes de integração<br>- Testes visuais<br>- Testes de desempenho | - Relatório de resultados de testes<br>- Lista de problemas identificados |
| 3      | Refinamento                      | - Correção de problemas (alta prioridade)<br>- Otimizações<br>- Melhoria de UX para desenvolvedores | - Componentes refinados<br>- Relatório de otimizações |
| 4      | Documentação e Preparação Final  | - Finalizar documentação<br>- Feedback final<br>- Preparação para lançamento | - Documentação completa<br>- Plano de lançamento |

### 7.2. Marcos Principais

- **M1:** Todos os testes configurados e ambiente pronto 
- **M2:** Todos os componentes testados e problemas identificados
- **M3:** Problemas críticos e de alta prioridade resolvidos 
- **M4:** Todos os componentes otimizados e refinados
- **M5:** Documentação completa e validada

## 8. Checklist de Conclusão

Para considerar a Fase 3 concluída, verificar:

- [ ] Todos os componentes prioritários testados
- [ ] Todos os problemas críticos e de alta prioridade resolvidos
- [ ] Testes de acessibilidade: Nível AA ou melhor
- [ ] Performance: Score Lighthouse > 90
- [ ] Feedback de desenvolvedores: Satisfação > 4/5
- [ ] Documentação completa e revisada
- [ ] Compatível com browsers suportados
- [ ] Sem regressões visuais ou funcionais

## 9. Transição para a Fase 4

À medida que a Fase 3 se aproxima da conclusão, prepare-se para a Fase 4 (Limpeza e Finalização):

1. **Documentação Completa**
   - Garantir documentação de todos os componentes
   - Certificar-se de que exemplos estão funcionando
   - Validar guias de migração

2. **Treinamento**
   - Preparar materiais de treinamento
   - Planejar sessões de capacitação
   - Criar recursos de referência rápida

3. **Plano de Lançamento**
   - Definir estratégia de lançamento gradual
   - Preparar comunicação interna
   - Estabelecer processo de suporte

4. **Métricas de Sucesso**
   - Definir KPIs para acompanhamento
   - Configurar dashboards de monitoramento
   - Estabelecer processo de feedback contínuo

## 10. Lições Aprendidas

### 10.1. Registro de Aprendizados

Criar um documento de lições aprendidas:

```md
# Lições Aprendidas - Migração para shadcn/ui

## O que funcionou bem
- Abordagem de migração por camadas (atoms → blocks → layouts → sections)
- Testes visuais com Storybook para capturar regressões
- Documentação paralela à implementação

## O que poderia ser melhorado
- Estimativas de tempo para componentes complexos
- Processo de comunicação de mudanças para desenvolvedores
- Ferramentas de análise de bundle size configuradas mais cedo

## Recomendações para projetos futuros
- Começar com design tokens bem definidos
- Implementar testes automatizados desde o início
- Incluir desenvolvedores no processo de design e decisões
- Criar um sistema de feedback contínuo mais estruturado
```

### 10.2. Melhores Práticas Estabelecidas

Documentar as melhores práticas que emergiram durante a migração:

1. **Extensão de Componentes**
   - Como estender componentes mantendo consistência
   - Padrões para props e variants

2. **Composição vs. Configuração**
   - Quando usar composição
   - Quando usar configuração via props

3. **Integração com Sistemas Existentes**
   - Estratégias para compatibilidade
   - Abordagens de migração gradual