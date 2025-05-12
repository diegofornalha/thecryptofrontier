import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Auditoria de Inputs</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Claro</h3>
            <div className="p-4 bg-white rounded-lg space-y-2">
              <Input placeholder="Input padrão" />
              <Input placeholder="Input desabilitado" disabled />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Escuro</h3>
            <div className="p-4 bg-gray-900 rounded-lg space-y-2">
              <Input placeholder="Input padrão" />
              <Input placeholder="Input desabilitado" disabled />
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Auditoria de Badges</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Claro</h3>
            <div className="p-4 bg-white rounded-lg flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Escuro</h3>
            <div className="p-4 bg-gray-900 rounded-lg flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Auditoria de Cards</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Claro</h3>
            <Card className="p-4">
              <h4 className="font-medium mb-2">Card de exemplo</h4>
              <p>Este é um exemplo de card no tema claro.</p>
            </Card>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Escuro</h3>
            <div className="bg-gray-900 p-1">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Card de exemplo</h4>
                <p>Este é um exemplo de card no tema escuro.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Auditoria de Avatares</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Claro</h3>
            <div className="p-4 bg-white rounded-lg flex gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Tema Escuro</h3>
            <div className="p-4 bg-gray-900 rounded-lg flex gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 