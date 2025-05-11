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