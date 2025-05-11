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
  
  it('mantém acessibilidade com diferentes variantes', async () => {
    const { container } = render(
      <>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('mantém acessibilidade quando usado como link', async () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Acessível</a>
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 