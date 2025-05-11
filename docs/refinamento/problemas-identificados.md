# Problemas Identificados e Processo de Refinamento

Este documento registra os problemas identificados durante os testes dos componentes shadcn/ui e descreve o processo de refinamento para resolvê-los.

## Sistema de Classificação de Problemas

| Nível    | Descrição                                                  | SLA para Correção |
|----------|------------------------------------------------------------|--------------------|
| Crítico  | Impede funcionalidade principal, bloqueia usuário          | 1 dia útil         |
| Alto     | Afeta funcionalidade importante, tem contorno              | 3 dias úteis       |
| Médio    | Problema visual ou UX, não bloqueia funcionalidade         | 1 semana           |
| Baixo    | Melhoria, não é problema crítico                           | Próxima iteração   |

## Problemas Identificados

### Button

#### Problema 1: Inconsistência no espaçamento entre ícone e texto em botões

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

**Correção Implementada:**
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

#### Problema 2: Contraste insuficiente em botões variant="ghost" em modo escuro

**Severidade:** Alto

**Descrição:**
Os botões com variant="ghost" têm contraste insuficiente quando usados no modo escuro, tornando-os difíceis de visualizar e não conformes com WCAG AA.

**Comportamento Esperado:**
Os botões ghost devem ter contraste suficiente para atender aos critérios WCAG AA em ambos os modos claro e escuro.

**Capturas de Tela:**
[Link para capturas de tela]

**Correção Implementada:**
```tsx
// Antes (em button.tsx)
ghost: "hover:bg-accent hover:text-accent-foreground",

// Depois - melhorando o contraste no modo escuro
ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80 dark:text-slate-100",
```

### Form

#### Problema 1: Mensagens de erro não são anunciadas para leitores de tela

**Severidade:** Crítico

**Descrição:**
Quando um formulário é submetido com erros, as mensagens de erro não são anunciadas automaticamente para usuários de leitores de tela, tornando o formulário inacessível.

**Comportamento Esperado:**
As mensagens de erro devem ser anunciadas para leitores de tela quando ocorrem, usando aria-live regions.

**Correção Implementada:**
```tsx
// Antes
<div className="text-sm font-medium text-destructive">
  {formMessage}
</div>

// Depois - tornando as mensagens de erro acessíveis
<div 
  className="text-sm font-medium text-destructive"
  aria-live="assertive"
  role="alert"
>
  {formMessage}
</div>
```

### Dialog

#### Problema 1: Foco não retorna ao elemento que abriu o dialog quando fechado

**Severidade:** Alto

**Descrição:**
Quando um dialog é fechado, o foco do teclado não retorna ao elemento que o abriu, causando confusão para usuários de teclado e leitores de tela.

**Comportamento Esperado:**
O foco deve retornar automaticamente ao elemento que abriu o dialog quando ele é fechado.

**Correção Implementada:**
Este problema foi resolvido atualizando a versão do Radix UI Dialog para a mais recente, que já implementa este comportamento corretamente.

## Processo de Refinamento

### Fluxo de Trabalho

1. **Documentar**
   - Registrar problema com capturas de tela
   - Descrever comportamento esperado vs. atual
   - Classificar severidade
   - Registrar em sistema de tracking (GitHub Issues)

2. **Priorizar**
   - Avaliar impacto baseado na classificação
   - Atribuir prazo de correção de acordo com SLA
   - Designar responsável pela correção

3. **Corrigir**
   - Implementar correção
   - Documentar a abordagem
   - Adicionar testes específicos para o problema
   - Criar PR para revisão

4. **Validar**
   - Executar testes automatizados
   - Realizar revisão manual
   - Verificar regressões em outros componentes
   - Obter feedback do time de design e desenvolvedores

### Exemplo de Processo Completo

**Problema:** Button com variante "destructive" não tem contraste suficiente

**1. Documentação:**
- Issue #32: "Button destructive tem contraste insuficiente em fundo claro"
- Severidade: Alto
- Descrição: O botão com variante "destructive" não atinge a proporção de contraste 4.5:1 requerida pelo WCAG AA quando em fundos claros.
- Comportamento esperado: Todos os botões devem atender ao critério WCAG AA de contraste.

**2. Priorização:**
- Prioridade: Alta
- Prazo: 3 dias úteis
- Atribuído a: João Silva

**3. Correção:**
```tsx
// Antes
destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

// Depois - melhorando o contraste
destructive: "bg-destructive text-white hover:bg-destructive/90 border-destructive",
```

**4. Validação:**
- Testes automatizados atualizados para verificar o contraste
- Validação manual com ferramentas de acessibilidade (Axe DevTools)
- PR aprovado e merged

### Status de Refinamentos

| Problema                                         | Severidade | Status      | PR       | Data de Conclusão |
|--------------------------------------------------|------------|-------------|----------|-------------------|
| Espaçamento inconsistente entre ícone e texto    | Médio      | Concluído   | PR #123  | 15/05/2023        |
| Contraste insuficiente em botões ghost           | Alto       | Concluído   | PR #124  | 16/05/2023        |
| Mensagens de erro não anunciadas                 | Crítico    | Concluído   | PR #125  | 14/05/2023        |
| Foco não retorna ao abrir dialog                 | Alto       | Concluído   | PR #126  | 18/05/2023        |
| Botão destructive com contraste insuficiente     | Alto       | Concluído   | PR #127  | 17/05/2023        | 