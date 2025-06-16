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
        expect(button).toHaveClass('destructive');
    });
    it('aplica tamanho corretamente', () => {
        render(<Button size="sm">Botão Pequeno</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('sm');
    });
    it('suporta componente asChild', () => {
        render(<Button asChild>
        <a href="/test">Link como botão</a>
      </Button>);
        expect(screen.getByRole('link')).toHaveTextContent('Link como botão');
        expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });
    it('fica desabilitado quando a prop disabled é true', () => {
        render(<Button disabled>Botão Desabilitado</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
