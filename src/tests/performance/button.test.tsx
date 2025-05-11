import React, { Profiler } from 'react';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

// Função de callback para o Profiler
function onRenderCallback(
  id: string,
  phase: "mount" | "update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  // Em um ambiente de teste real, você pode armazenar essas métricas
  // em uma base de dados ou compará-las com valores de referência
  console.log(`Componente: ${id}`);
  console.log(`Fase: ${phase}`);
  console.log(`Duração atual: ${actualDuration.toFixed(2)}ms`);
  console.log(`Duração base: ${baseDuration.toFixed(2)}ms`);
}

describe('Desempenho de renderização do Button', () => {
  it('mede o tempo de renderização do Button', () => {
    render(
      <Profiler id="Button" onRender={onRenderCallback}>
        <Button>Teste de desempenho</Button>
      </Profiler>
    );
  });
  
  it('mede o tempo de renderização do Button com diferentes variantes', () => {
    render(
      <>
        <Profiler id="Button-default" onRender={onRenderCallback}>
          <Button variant="default">Default</Button>
        </Profiler>
        <Profiler id="Button-destructive" onRender={onRenderCallback}>
          <Button variant="destructive">Destructive</Button>
        </Profiler>
        <Profiler id="Button-outline" onRender={onRenderCallback}>
          <Button variant="outline">Outline</Button>
        </Profiler>
      </>
    );
  });
  
  it('compara desempenho de renderização com e sem asChild', () => {
    render(
      <>
        <Profiler id="Button-regular" onRender={onRenderCallback}>
          <Button>Botão Regular</Button>
        </Profiler>
        <Profiler id="Button-asChild" onRender={onRenderCallback}>
          <Button asChild>
            <a href="/test">Link como Botão</a>
          </Button>
        </Profiler>
      </>
    );
  });
}); 