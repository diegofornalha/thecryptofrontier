import Action from "@/components/atoms/Action";
import Badge from "@/components/atoms/Badge";
import Link from "@/components/atoms/Link";
import { Button } from "@/components/ui/button";
import TextFormControl from "@/components/blocks/FormBlock/TextFormControl";
import EmailFormControl from "@/components/blocks/FormBlock/EmailFormControl";
import TextareaFormControl from "@/components/blocks/FormBlock/TextareaFormControl";
import CheckboxFormControl from "@/components/blocks/FormBlock/CheckboxFormControl";
import SelectFormControl from "@/components/blocks/FormBlock/SelectFormControl";
import SubmitButtonFormControl from "@/components/blocks/FormBlock/SubmitButtonFormControl";

export default function ComponentLab() {
  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Laboratório de Componentes Migrados</h1>
      
      <div className="grid gap-10">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Botões (Action)</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Comparação lado a lado */}
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Migrado com shadcn/ui</h3>
              <div className="flex flex-wrap gap-4">
                <Action label="Botão Primary" style="primary" />
                <Action label="Botão Secondary" style="secondary" />
                <Action label="Com Ícone" style="primary" showIcon icon="arrowRight" />
                <Action label="Ícone à Esquerda" style="secondary" showIcon icon="arrowRight" iconPosition="left" />
                <Action label="Link Externo" url="https://example.com" style="primary" />
              </div>
            </div>
            
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Botões shadcn/ui Nativos</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="destructive">Destructive Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="link">Link Button</Button>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Migrado com shadcn/ui</h3>
              <div className="flex flex-wrap gap-4">
                <Badge label="Novo" />
                <Badge label="Promoção" color="text-red-500" />
                <Badge label="Destaque" />
              </div>
            </div>
            
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Badges shadcn/ui Nativos</h3>
              <div className="flex flex-wrap gap-4">
                <Badge label="Default" />
                <Badge label="Secondary" className="bg-secondary text-secondary-foreground" />
                <Badge label="Outline" className="border border-primary bg-transparent text-primary" />
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Links</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Migrado com shadcn/ui</h3>
              <div className="flex flex-wrap gap-4">
                <Link href="/component-lab" className="text-primary">Link Interno</Link>
                <Link href="https://example.com" className="text-primary">Link Externo</Link>
              </div>
            </div>
            
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Botão como Link</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="link" asChild>
                  <Link href="/component-lab" className="no-underline">Link Via Button</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Controles de Formulário</h2>
          <form className="grid gap-8 md:grid-cols-2">
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Campos de Texto</h3>
              <div className="space-y-4">
                <TextFormControl 
                  name="nome" 
                  label="Nome Completo" 
                  isRequired 
                  placeholder="Digite seu nome" 
                />
                
                <EmailFormControl 
                  name="email" 
                  label="E-mail" 
                  isRequired 
                  placeholder="seu@email.com" 
                />
                
                <TextareaFormControl 
                  name="mensagem" 
                  label="Mensagem" 
                  isRequired 
                  placeholder="Digite sua mensagem..." 
                />
              </div>
            </div>
            
            <div className="border p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Outros Controles</h3>
              <div className="space-y-4">
                <SelectFormControl 
                  name="assunto" 
                  label="Assunto" 
                  isRequired 
                  defaultValue="Selecione um assunto"
                  options={["Suporte", "Vendas", "Informações", "Outros"]} 
                />
                
                <CheckboxFormControl 
                  name="aceito" 
                  label="Aceito os termos e condições" 
                  isRequired 
                />
                
                <div className="pt-4">
                  <SubmitButtonFormControl 
                    label="Enviar Formulário" 
                    style="primary" 
                    showIcon 
                    icon="arrowRight" 
                  />
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
} 