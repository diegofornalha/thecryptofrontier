"use client"

import React from 'react'
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração do Bloco de Formulário
export function FormBlockMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (FormBlock legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do FormBlock atual */}
          <form className="sb-component sb-component-block sb-component-form-block p-4 border rounded-md">
            <div className="w-full flex flex-wrap gap-8">
              {/* Input de texto */}
              <div className="w-full sm:w-[calc(50%-1rem)]">
                <label className="sb-component sb-component-block-field-label mb-2 block" htmlFor="name">
                  Nome <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required 
                  className="sb-component sb-component-block-field-input w-full p-2 border rounded-md focus:border-primary"
                />
              </div>
              
              {/* Input de email */}
              <div className="w-full sm:w-[calc(50%-1rem)]">
                <label className="sb-component sb-component-block-field-label mb-2 block" htmlFor="email">
                  Email <span className="text-red-600">*</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  required 
                  className="sb-component sb-component-block-field-input w-full p-2 border rounded-md focus:border-primary"
                />
              </div>
              
              {/* Select */}
              <div className="w-full">
                <label className="sb-component sb-component-block-field-label mb-2 block" htmlFor="subject">
                  Assunto
                </label>
                <select 
                  name="subject" 
                  id="subject" 
                  className="sb-component sb-component-block-field-select w-full p-2 border rounded-md focus:border-primary"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="geral">Informações Gerais</option>
                  <option value="suporte">Suporte Técnico</option>
                  <option value="vendas">Vendas</option>
                </select>
              </div>
              
              {/* Textarea */}
              <div className="w-full">
                <label className="sb-component sb-component-block-field-label mb-2 block" htmlFor="message">
                  Mensagem <span className="text-red-600">*</span>
                </label>
                <textarea 
                  name="message" 
                  id="message" 
                  required 
                  rows={4}
                  className="sb-component sb-component-block-field-textarea w-full p-2 border rounded-md focus:border-primary"
                ></textarea>
              </div>
              
              {/* Checkbox */}
              <div className="w-full">
                <label className="sb-component sb-component-block-field-label inline-flex items-center" htmlFor="terms">
                  <input 
                    type="checkbox" 
                    name="terms" 
                    id="terms" 
                    required 
                    className="sb-component sb-component-block-field-checkbox mr-2"
                  />
                  <span>Concordo com os termos e condições</span>
                </label>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex">
              <button 
                type="submit" 
                className="sb-component sb-component-block sb-component-button sb-component-button-primary py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// FormBlock atual
export default function FormBlock(props) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const { fields = [], elementId, submitButton, className, styles = {}, 'data-sb-field-path': fieldPath } = props;

    if (fields.length === 0) {
        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (formRef.current) {
            const data = new FormData(formRef.current);
            const value = Object.fromEntries(data.entries());
            alert(\`Form data: \${JSON.stringify(value)}\`);
        }
    }

    return (
        <form
            className={classNames(
                'sb-component sb-component-block sb-component-form-block',
                className,
                styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined,
                styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : undefined,
                styles?.self?.borderWidth && styles?.self?.borderWidth !== 0 && styles?.self?.borderStyle !== 'none'
                    ? mapStyles({
                        borderWidth: styles?.self?.borderWidth,
                        borderStyle: styles?.self?.borderStyle,
                        borderColor: styles?.self?.borderColor ?? 'border-primary'
                    })
                    : undefined,
                styles?.self?.borderRadius ? mapStyles({ borderRadius: styles?.self?.borderRadius }) : undefined
            )}
            name={elementId}
            id={elementId}
            onSubmit={handleSubmit}
            ref={formRef}
            data-sb-field-path={fieldPath}
        >
            <div
                className={classNames('w-full flex flex-wrap gap-8', mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }))}
                {...(fieldPath && { 'data-sb-field-path': '.fields' })}
            >
                <input type="hidden" name="form-name" value={elementId} />
                {fields.map((field, index) => {
                    const modelName = field.__metadata.modelName;
                    if (!modelName) {
                        throw new Error(\`form field does not have the 'modelName' property\`);
                    }
                    const FormControl = getComponent(modelName);
                    if (!FormControl) {
                        throw new Error(\`no component matching the form field model name: \${modelName}\`);
                    }
                    return <FormControl key={index} {...field} {...(fieldPath && { 'data-sb-field-path': \`.\${index}\` })} />;
                })}
            </div>
            {submitButton && (
                <div className={classNames('mt-8 flex', mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }))}>
                    <SubmitButtonFormControl {...submitButton} {...(fieldPath && { 'data-sb-field-path': '.submitButton' })} />
                </div>
            )}
        </form>
    );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* FormBlock migrado usando componentes de form do shadcn/ui */}
          <ExampleForm />
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// FormBlock migrado usando shadcn/ui
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Definindo schema de validação com zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  subject: z.string().optional(),
  message: z.string().min(5, { message: 'Mensagem deve ter pelo menos 5 caracteres' }),
  terms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos e condições',
  }),
});

export function FormBlock({
  elementId = 'contact-form',
  className,
  fields = [],
  submitButton,
  styles = {},
  ...props
}) {
  // Transformando fields em um formato compatível com o schema
  const defaultValues = React.useMemo(() => {
    const values = {};
    fields.forEach(field => {
      if (field.name) {
        values[field.name] = field.defaultValue || '';
      }
    });
    return values;
  }, [fields]);

  // Configurando react-hook-form com validação zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(data) {
    console.log(data);
    // Implementar lógica de envio do formulário
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)}
        name={elementId}
        id={elementId}
        className={cn(
          "space-y-6 p-4 border rounded-md",
          styles?.self?.padding && \`p-\${styles.self.padding}\`,
          styles?.self?.margin && \`m-\${styles.self.margin}\`,
          styles?.self?.borderRadius && \`rounded-\${styles.self.borderRadius}\`,
          className
        )}
        {...props}
      >
        <div className="w-full grid gap-4 sm:grid-cols-2">
          {/* Renderizando campos do formulário baseados na propriedade fields */}
          {fields.map((field, index) => {
            switch (field.type) {
              case 'text':
                return (
                  <FormField
                    key={field.name || index}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                        <FormControl>
                          <Input 
                            {...formField} 
                            placeholder={field.placeholder} 
                            required={field.required} 
                          />
                        </FormControl>
                        {field.description && <FormDescription>{field.description}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              case 'email':
                return (
                  <FormField
                    key={field.name || index}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                        <FormControl>
                          <Input 
                            {...formField} 
                            type="email"
                            placeholder={field.placeholder} 
                            required={field.required} 
                          />
                        </FormControl>
                        {field.description && <FormDescription>{field.description}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              case 'select':
                return (
                  <FormField
                    key={field.name || index}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                        <Select 
                          onValueChange={formField.onChange} 
                          defaultValue={formField.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.description && <FormDescription>{field.description}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              case 'textarea':
                return (
                  <FormField
                    key={field.name || index}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{field.label} {field.required && <span className="text-destructive">*</span>}</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...formField} 
                            placeholder={field.placeholder} 
                            rows={field.rows || 4} 
                            required={field.required} 
                          />
                        </FormControl>
                        {field.description && <FormDescription>{field.description}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              case 'checkbox':
                return (
                  <FormField
                    key={field.name || index}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={formField.value}
                            onCheckedChange={formField.onChange}
                            required={field.required}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">{field.label}</FormLabel>
                          {field.description && <FormDescription>{field.description}</FormDescription>}
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
        
        {/* Botão de envio */}
        <Button 
          type="submit" 
          className={cn(
            submitButton?.style === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : '',
            submitButton?.style === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : ''
          )}
        >
          {submitButton?.label || 'Enviar'}
        </Button>
      </form>
    </Form>
  );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guia de Migração</h3>
        <div className="p-4 bg-muted/50 rounded-md space-y-2">
          <h4 className="font-medium">Principais mudanças:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Integração com React Hook Form para gerenciamento de estado</li>
            <li>Validação de formulários com Zod</li>
            <li>Componentes específicos para cada tipo de campo</li>
            <li>Feedback visual de erros integrado</li>
            <li>Melhor acessibilidade com labels e descrições</li>
            <li>Sistema de grid para layout responsivo</li>
            <li>Utilização de tokens de design do shadcn/ui</li>
          </ul>
          
          <h4 className="font-medium mt-4">Benefícios da migração:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Validação robusta de formulários</li>
            <li>Feedback imediato para os usuários sobre erros</li>
            <li>Melhor experiência em dispositivos móveis</li>
            <li>Maior acessibilidade (ARIA attributes, keyboard navigation)</li>
            <li>Tipagem forte com TypeScript</li>
            <li>Suporte a diferentes estados visuais (erro, foco, hover)</li>
            <li>Consistência visual com o resto do sistema</li>
          </ul>
          
          <h4 className="font-medium mt-4">Considerações de implementação:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Necessidade de configurar schema de validação com Zod</li>
            <li>Adaptação para trabalhar com a estrutura de campos dinâmicos</li>
            <li>Transformação dos dados do formulário para envio</li>
            <li>Importância de adicionar aria-labels e descrições para acessibilidade</li>
            <li>Considerar estilização específica para estados de erro e sucesso</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Exemplo de formulário para demonstração
function ExampleForm() {
  // Definir schema de validação
  const formSchema = z.object({
    name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
    email: z.string().email({ message: 'Email inválido' }),
    subject: z.string().optional(),
    message: z.string().min(5, { message: 'Mensagem deve ter pelo menos 5 caracteres' }),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'Você deve aceitar os termos e condições' }),
    }),
  })
  
  // Inicializar formulário com hook-form e zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      terms: false,
    },
  })
  
  // Função para lidar com o envio do formulário
  function onSubmit(data) {
    console.log(data)
    alert('Formulário enviado com sucesso!')
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-md">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Campo de Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Campo de Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu-email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Campo de Assunto */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Assunto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="geral">Informações Gerais</SelectItem>
                    <SelectItem value="suporte">Suporte Técnico</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Campo de Mensagem */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Mensagem <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Digite sua mensagem..." 
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Checkbox para Termos */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    Concordo com os termos e condições
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
        
        {/* Botão de Envio */}
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  )
} 