import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Esquema de validação Zod para o formulário
const formSchema = z.object({
  email: z.string().email('Insira um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

// Tipo gerado a partir do esquema
type FormValues = z.infer<typeof formSchema>;

// Componente de formulário para testar
const LoginForm = ({ onSubmit = jest.fn() }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Form.Field
          control={form.control}
          name="email"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Email</Form.Label>
              <Form.Control>
                <Input placeholder="Email" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="password"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Senha</Form.Label>
              <Form.Control>
                <Input type="password" placeholder="Senha" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit">Entrar</Button>
      </form>
    </Form>
  );
};

describe('Formulário de Login', () => {
  it('valida campos corretamente', async () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Submeter formulário vazio
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar mensagens de erro
    await waitFor(() => {
      expect(screen.getByText(/insira um email válido/i)).toBeInTheDocument();
      expect(screen.getByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });
    
    // Preencher formulário com dados inválidos
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'email-invalido' } });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), { target: { value: '12345' } });
    
    // Submeter novamente
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar que ainda há erros
    await waitFor(() => {
      expect(screen.getByText(/insira um email válido/i)).toBeInTheDocument();
      expect(screen.getByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });
    
    // Preencher formulário corretamente
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'usuario@exemplo.com' } });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), { target: { value: '123456' } });
    
    // Submeter formulário válido
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar que o formulário foi submetido corretamente
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        {
          email: 'usuario@exemplo.com',
          password: '123456',
        },
        expect.anything()
      );
    });
  });
}); 