# Plano de Migração para shadcn/ui: Fase 2 - Implementação

## 1. Introdução e Objetivos

A Fase 2 é o coração da migração para o shadcn/ui, onde transformamos o planejamento em implementação concreta. Nesta fase, migramos efetivamente os componentes seguindo a priorização e estrutura definidas na Fase 1.

**Objetivos:**
- Implementar os componentes shadcn/ui seguindo a ordem de prioridade
- Manter a compatibilidade com a API existente
- Garantir consistência visual e comportamental
- Implementar testes e validação para cada componente
- Documentar o processo e as decisões tomadas

## 2. Metodologia de Implementação

### 2.1. Abordagem Geral

Para cada componente, seguiremos este fluxo de trabalho:

1. **Preparação**
   - Revisar a auditoria do componente da Fase 1
   - Instalar o componente base do shadcn/ui, se ainda não instalado
   - Criar uma branch específica para o componente

2. **Implementação**
   - Criar uma nova versão do componente usando shadcn/ui
   - Manter a mesma API externa (props, eventos, etc.)
   - Adaptar estilos e comportamentos específicos

3. **Testes**
   - Testar em isolamento na página de testes
   - Testar no contexto real de uso
   - Validar acessibilidade e responsividade

4. **Integração**
   - Revisar o código com o time
   - Mesclar na branch principal
   - Atualizar a documentação

### 2.2. Estratégia de Migração por Camadas

Seguiremos a abordagem de "dentro para fora":

```
Componentes Atômicos → Blocos → Layouts → Seções → Páginas
```

Isso permite construir sobre componentes já migrados, garantindo consistência.

### 2.3. Implementação Paralela

Para minimizar riscos, adotaremos uma estratégia de implementação paralela:

```tsx
// Abordagem para componentes críticos
import { OldComponent } from "@/components/old-component";
import { NewComponent } from "@/components/new-component";

// Feature flag simples (pode ser refinado com sistema de flags)
const USE_NEW_COMPONENTS = process.env.NEXT_PUBLIC_USE_NEW_COMPONENTS === 'true';

export function MyComponent(props) {
  if (USE_NEW_COMPONENTS) {
    return <NewComponent {...props} />;
  }
  return <OldComponent {...props} />;
}
```

## 3. Grupos de Implementação

Baseado na priorização da Fase 1, implementaremos os componentes nos seguintes grupos:

### 3.1. Grupo 1 - Componentes Atômicos

**Componentes:**
- Button (Action)
- Badge
- Link
- Avatar
- Input

**Processo:**
1. Instalar componentes base do shadcn/ui
2. Implementar versões compatíveis com a API existente
3. Testar extensivamente
4. Substituir no código base

**Exemplo de Migração do Button:**

```tsx
// src/components/atoms/Action/index.tsx

// ANTES
export default function Action(props) {
    const { elementId, className, label, url, showIcon, icon, style = 'primary' } = props;
    const IconComponent = icon ? iconMap[icon] : null;
    
    return (
        <Link
            href={url}
            className={classNames(
                'sb-component-button',
                { 'sb-component-button-primary': style === 'primary' },
                { 'sb-component-button-secondary': style === 'secondary' },
                className
            )}
        >
            {label}
            {showIcon && IconComponent && <IconComponent />}
        </Link>
    );
}

// DEPOIS
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Action(props) {
    const { elementId, className, label, url, showIcon, icon, style = 'primary' } = props;
    const IconComponent = icon ? iconMap[icon] : null;
    
    // Mapear estilos antigos para variantes do shadcn/ui
    const variant = style === 'primary' ? 'default' : 'secondary';
    
    if (url) {
        return (
            <Button variant={variant} className={className} asChild>
                <Link href={url}>
                    {label}
                    {showIcon && IconComponent && <IconComponent className="ml-2" />}
                </Link>
            </Button>
        );
    }
    
    return (
        <Button variant={variant} className={className}>
            {label}
            {showIcon && IconComponent && <IconComponent className="ml-2" />}
        </Button>
    );
}
```

### 3.2. Grupo 2 - Componentes de Formulário 

**Componentes:**
- Form
- Checkbox
- Select
- Textarea
- RadioGroup

**Desafio:** Integração com o modelo de formulário existente.

**Abordagem:**
1. Migrar para react-hook-form (usado pelo shadcn/ui)
2. Manter compatibilidade com a validação existente
3. Preservar a experiência do usuário

**Exemplo de Migração de Formulário:**

```tsx
// src/components/blocks/FormBlock/index.tsx

// ANTES
export default function FormBlock(props) {
    const { fields, submitLabel } = props;
    const [formData, setFormData] = useState({});
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de envio
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {fields.map((field) => {
                switch (field.type) {
                    case 'text':
                        return <TextFormControl {...field} onChange={(val) => setFormData({...formData, [field.name]: val})} />;
                    case 'email':
                        return <EmailFormControl {...field} onChange={(val) => setFormData({...formData, [field.name]: val})} />;
                    // Outros campos
                }
            })}
            <button type="submit">{submitLabel}</button>
        </form>
    );
}

// DEPOIS
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export default function FormBlock(props) {
    const { fields, submitLabel } = props;
    
    // Construir schema zod dinamicamente baseado nos campos
    const formSchema = z.object(
        fields.reduce((acc, field) => {
            switch (field.type) {
                case 'email':
                    acc[field.name] = z.string().email(field.errorMessage || "Email inválido");
                    break;
                case 'text':
                default:
                    acc[field.name] = z.string().min(1, field.errorMessage || "Campo obrigatório");
            }
            return acc;
        }, {})
    );
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: fields.reduce((acc, field) => {
            acc[field.name] = "";
            return acc;
        }, {})
    });
    
    function onSubmit(data) {
        // Lógica de envio (manter a mesma do componente original)
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((field) => {
                    switch (field.type) {
                        case 'text':
                            return (
                                <Form.Field
                                    key={field.name}
                                    control={form.control}
                                    name={field.name}
                                    render={({ field: formField }) => (
                                        <TextFormControl
                                            label={field.label}
                                            {...formField}
                                        />
                                    )}
                                />
                            );
                        case 'email':
                            return (
                                <Form.Field
                                    key={field.name}
                                    control={form.control}
                                    name={field.name}
                                    render={({ field: formField }) => (
                                        <EmailFormControl
                                            label={field.label}
                                            {...formField}
                                        />
                                    )}
                                />
                            );
                        // Outros tipos de campo
                    }
                })}
                <Button type="submit">{submitLabel}</Button>
            </form>
        </Form>
    );
}
```

### 3.3. Grupo 3 - Componentes de Layout 

**Componentes:**
- Card
- AspectRatio
- Sheet
- Separator
- Tabs

**Desafio:** Manter layouts consistentes durante a transição.

**Abordagem:**
1. Migrar do mais simples para o mais complexo
2. Testar extensivamente em diferentes dispositivos
3. Validar com designers

### 3.4. Grupo 4 - Componentes Complexos 

**Componentes:**
- SearchBlock
- DropdownMenu
- NavigationMenu
- Dialog
- FeaturedItemsSection

**Desafio:** Componentes com lógica complexa e interações específicas.

**Abordagem:**
1. Decomposição em partes menores
2. Migração incremental
3. Testes extensivos de interatividade

## 4. Estratégias para Componentes Personalizados

### 4.1. Extensão de Componentes shadcn/ui

Para componentes que precisam de funcionalidades extras:

```tsx
// src/components/ui/button-with-icon.tsx
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface ButtonWithIconProps extends ButtonProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function ButtonWithIcon({
  children,
  icon,
  iconPosition = 'right',
  className,
  ...props
}: ButtonWithIconProps) {
  return (
    <Button 
      className={cn("flex items-center gap-2", className)} 
      {...props}
    >
      {iconPosition === 'left' && icon}
      {children}
      {iconPosition === 'right' && icon}
    </Button>
  );
}
```

### 4.2. Composição de Componentes

Para funcionalidades complexas, usar composição:

```tsx
// src/components/ui/search-with-autocomplete.tsx
import { useState } from "react";
import { Input } from "./input";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "./command";

interface SearchWithAutocompleteProps {
  items: Array<{ id: string; title: string }>;
  onSelect: (item: { id: string; title: string }) => void;
  placeholder?: string;
}

export function SearchWithAutocomplete({
  items,
  onSelect,
  placeholder = "Pesquisar...",
}: SearchWithAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        className="w-full"
      />
      
      {open && (
        <div className="absolute top-full w-full z-10 mt-1">
          <Command>
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {items
                  .filter(item => 
                    item.title.toLowerCase().includes(value.toLowerCase())
                  )
                  .map(item => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        onSelect(item);
                        setValue(item.title);
                        setOpen(false);
                      }}
                    >
                      {item.title}
                    </CommandItem>
                  ))
                }
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
```

### 4.3. Variantes Personalizadas

Para estilos específicos, adicionar variantes aos componentes:

```tsx
// src/components/ui/card.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Adicionar variantes personalizadas além das padrão
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        feature: "border-primary bg-primary/5",
        highlight: "border-2 border-primary",
        subtle: "bg-muted/50 border-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Estender a interface para incluir as novas variantes
interface CardProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

// Exportar o restante dos componentes...
```

## 5. Testes e Validação

### 5.1. Níveis de Teste

Para cada componente migrado, realizar:

1. **Testes Unitários**
   - Verificar renderização com diferentes props
   - Verificar comportamentos esperados
   - Testar casos de borda

2. **Testes Visuais**
   - Capturar screenshots antes e depois
   - Verificar consistência entre temas (claro/escuro)
   - Validar em diferentes tamanhos de tela

3. **Testes de Integração**
   - Verificar integração com outros componentes
   - Validar em contextos reais de uso
   - Testar fluxos de usuário completos

### 5.2. Checklist de Validação

Para cada componente migrado:

- [ ] Mantém a API existente (props, eventos)
- [ ] Segue o design system (cores, espaçamentos, tipografia)
- [ ] Responsivo em todos os breakpoints
- [ ] Tema claro e escuro funcionando corretamente
- [ ] Acessível (contraste, ARIA, navegação por teclado)
- [ ] Desempenho similar ou melhor ao original
- [ ] Compatível com todos os navegadores suportados

### 5.3. Ambiente de Testes

Configurar página dedicada para testes visuais:

```tsx
// src/app/component-lab/page.tsx
export default function ComponentLab() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Laboratório de Componentes</h1>
      
      <div className="grid gap-10">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Botões</h2>
          <div className="flex flex-wrap gap-4">
            {/* Comparação lado a lado */}
            <div className="border p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Original</h3>
              {/* Componente original */}
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">shadcn/ui</h3>
              {/* Componente migrado */}
            </div>
          </div>
        </section>
        
        {/* Outros componentes */}
      </div>
    </div>
  );
}
```

## 6. Processo de Revisão e Integração

### 6.1. Fluxo de Revisão

Para cada componente migrado:

1. **Revisão de Código**
   - Revisor designado analisa o código
   - Verificar aderência aos padrões
   - Verificar compatibilidade com a API existente

2. **Revisão de Design**
   - Designer verifica consistência visual
   - Validar em diferentes contextos
   - Confirmar acessibilidade

3. **Teste em Ambiente de Desenvolvimento**
   - Testar em ambiente integrado
   - Verificar integrações com outros componentes
   - Validar desempenho

### 6.2. Documentação Durante a Implementação

Para cada componente, documentar:

- Decisões de design tomadas
- Adaptações necessárias
- Limitações conhecidas
- Exemplos de uso

Exemplo de documentação:

```md
# Button (Migrado do Action)

## Implementação

O componente `Action` foi migrado para usar o componente `Button` do shadcn/ui.

## Adaptações

- Mapeamento de estilos:
  - `primary` → `default`
  - `secondary` → `secondary`
  - `link` → `link`

- Suporte a ícones:
  - Adicionada lógica para posicionar ícones (esquerda/direita)
  - Mantida compatibilidade com `iconMap`

## Uso

```tsx
// Como botão
<Action 
  label="Clique aqui" 
  style="primary" 
  showIcon 
  icon="arrowRight" 
/>

// Como link
<Action 
  label="Saiba mais" 
  url="/sobre" 
  style="secondary" 
/>
```

## Notas

- O componente mantém total compatibilidade com a API anterior
- Novos recursos disponíveis através de props adicionais
```

## 8. Gerenciamento de Riscos

### 8.1. Riscos Potenciais

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Componentes complexos sem equivalentes | Média | Alto | Criar componentes personalizados com mesmo design system |
| Regressão visual | Alta | Médio | Testes visuais automatizados, comparações antes/depois |
| Comportamentos específicos não suportados | Média | Alto | Documentar e estender componentes conforme necessário |
| Impacto no desempenho | Baixa | Médio | Monitorar métricas, otimizar conforme necessário |
| Aceitação do usuário | Média | Alto | Testes A/B, coletar feedback, ajustar conforme necessário |

### 8.2. Planos de Contingência

**Se a migração for mais complexa que o esperado:**
- Reduzir escopo da fase inicial
- Focar em componentes de maior impacto
- Estender cronograma para componentes complexos

**Se houver problemas de compatibilidade:**
- Manter componentes legados em paralelo
- Implementar estratégia de feature toggle
- Documentar limitações e planejar fase futura

## 9. Métricas de Sucesso

### 9.1. Métricas Quantitativas

- Número de componentes migrados: Meta 100% dos priorizados
- Porcentagem de código usando shadcn/ui: Meta >80%
- Redução de CSS personalizado: Meta -70%
- Redução de duplicação de código: Meta -50%

### 9.2. Métricas Qualitativas

- Consistência visual (avaliação por designers): Meta 9/10
- Facilidade de uso para desenvolvedores: Meta 8/10
- Experiência do usuário mantida ou melhorada: Meta 9/10
- Acessibilidade (avaliação automática): Meta AA ou superior

### 9.3. Critérios de Conclusão da Fase 2

- Todos os componentes priorizados migrados
- Documentação atualizada
- Testes passando
- Equipe confortável com os novos componentes
- Preparação para Fase 3 concluída

## 10. Exemplos Completos de Migração

### 10.1. Componente Badge

**Antes:**
```tsx
// src/components/atoms/Badge/index.tsx
export default function Badge({ text, style = 'default', className }) {
  return (
    <span
      className={classNames(
        'sb-component-badge',
        {
          'sb-component-badge-default': style === 'default',
          'sb-component-badge-secondary': style === 'secondary',
        },
        className
      )}
    >
      {text}
    </span>
  );
}
```

**Depois:**
```tsx
// src/components/atoms/Badge/index.tsx
import { Badge as ShadcnBadge } from "@/components/ui/badge";

export default function Badge({ text, style = 'default', className }) {
  // Mapear estilos antigos para variantes do shadcn/ui
  const variantMap = {
    default: 'default',
    secondary: 'secondary',
    outline: 'outline',
  };
  
  const variant = variantMap[style] || 'default';
  
  return (
    <ShadcnBadge variant={variant} className={className}>
      {text}
    </ShadcnBadge>
  );
}
```

### 10.2. Componente de Formulário Completo

**Formulário de contato migrado completo:**

```tsx
// src/components/blocks/ContactForm/index.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

// Schema de validação
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  message: z.string().min(10, {
    message: "Mensagem deve ter pelo menos 10 caracteres.",
  }),
});

export function ContactForm() {
  // Define o formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  // Função de envio
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Lógica de envio do formulário
    console.log(values);
    
    // Feedback ao usuário
    toast({
      title: "Formulário enviado!",
      description: "Entraremos em contato em breve.",
    });
    
    // Limpa o formulário
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Nome</Form.Label>
              <Form.Control>
                <Input placeholder="Seu nome" {...field} />
              </Form.Control>
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
                <Input placeholder="seu@email.com" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        
        <Form.Field
          control={form.control}
          name="message"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Mensagem</Form.Label>
              <Form.Control>
                <Textarea
                  placeholder="Sua mensagem aqui..."
                  className="min-h-32"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        
        <Button type="submit" className="w-full">
          Enviar mensagem
        </Button>
      </form>
    </Form>
  );
}
```

## 11. Preparação para a Fase 3

À medida que a implementação avança, prepare-se para a Fase 3 (Testes e Refinamento):

1. **Documentação Completa**
   - Documentar todos os componentes migrados
   - Registrar decisões de design
   - Criar guias de uso

2. **Métricas e Analytics**
   - Configurar métricas para acompanhamento
   - Estabelecer linha de base para comparação

3. **Feedback de Usuários**
   - Preparar mecanismos para coletar feedback
   - Definir processo de priorização de ajustes

4. **Plano de Polimento**
   - Identificar áreas que precisarão de refinamento
   - Preparar abordagem para otimizações
