"use client"

import React from 'react'
import { BarChart, LineChart, PieChart } from '@/components/ui/charts'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Dados de exemplo para os gráficos
const sampleData = [
  { label: 'Jan', value: 65 },
  { label: 'Fev', value: 40 },
  { label: 'Mar', value: 85 },
  { label: 'Abr', value: 50 },
  { label: 'Mai', value: 70 },
  { label: 'Jun', value: 30 },
]

// Componente para demonstrar a migração de charts
export function ChartsMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componentes Atuais (Charts)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">BarChart</p>
            <Card className="p-4">
              <BarChart data={sampleData} height={180} />
            </Card>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">LineChart</p>
            <Card className="p-4">
              <LineChart data={sampleData} height={180} />
            </Card>
          </div>
        </div>
        
        <pre className="p-4 bg-muted rounded-md overflow-x-auto mt-4">
          <code>{`// Componente atual
<BarChart 
  data={[
    { label: 'Jan', value: 65 },
    { label: 'Fev', value: 40 },
    // ...
  ]} 
  height={180} 
/>

<LineChart 
  data={chartData} 
  height={180} 
/>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componentes Migrados (Usando princípios shadcn/ui)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">MigratedBarChart</p>
            <Card className="p-4">
              <MigratedBarChart data={sampleData} height={180} />
            </Card>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">MigratedLineChart</p>
            <Card className="p-4">
              <MigratedLineChart data={sampleData} height={180} />
            </Card>
          </div>
        </div>
        
        <pre className="p-4 bg-muted rounded-md overflow-x-auto mt-4">
          <code>{`// Componente migrado
<Chart.Bar 
  data={chartData}
  height={180}
  variant="default"
  showLabels
/>

<Chart.Line
  data={chartData}
  height={180}
  variant="primary"
  showLabels
/>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Criar um namespace <code>Chart</code> com subcomponentes para melhor organização</li>
          <li>Implementar sistema de variantes consistente com shadcn/ui</li>
          <li>Usar <code>cn()</code> para composição de classes</li>
          <li>Implementar temas para gráficos (cores, estilos consistentes)</li>
          <li>Adicionar animações e interatividade</li>
          <li>Melhorar acessibilidade com descrições e aria-labels</li>
          <li>Adotar a abordagem "composition over configuration"</li>
        </ul>
      </div>
    </div>
  )
}

// Componente migrado de gráfico de barras
interface ChartProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
  showLabels?: boolean;
}

function MigratedBarChart({
  data,
  height = 200,
  className,
  variant = 'default',
  showLabels = true
}: ChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  // Mapear variantes para estilos
  const variantStyles = {
    default: 'bg-blue-500',
    primary: 'bg-primary',
    secondary: 'bg-purple-500',
  };
  
  const barColor = variantStyles[variant];
  
  return (
    <div className={cn("w-full", className)}>
      <div 
        className="flex items-end space-x-2 overflow-x-auto pb-4" 
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-shrink-0 min-w-16 group">
              <div className="relative flex flex-col items-center justify-end flex-1 w-full">
                {showLabels && (
                  <span className="text-xs mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}
                  </span>
                )}
                <div
                  className={cn(
                    "w-full rounded-t transition-all duration-300 ease-in-out group-hover:brightness-110",
                    barColor
                  )}
                  style={{ 
                    height: `${percentage}%`,
                    // Animação de crescimento com delay baseado no índice
                    animation: `grow-bar 1s ${index * 0.1}s ease-out forwards`,
                    transform: 'scaleY(0)',
                    transformOrigin: 'bottom'
                  }}
                />
              </div>
              {showLabels && (
                <span className="text-xs mt-2 truncate max-w-full text-center">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes grow-bar {
          to {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

// Componente migrado de gráfico de linhas
function MigratedLineChart({
  data,
  height = 200,
  className,
  variant = 'default',
  showLabels = true
}: ChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.value / maxValue) * 100;
    return { x, y, ...item };
  });
  
  // Gerar path para o SVG
  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ');
  
  // Mapear variantes para estilos
  const variantStyles = {
    default: 'stroke-blue-500',
    primary: 'stroke-primary',
    secondary: 'stroke-purple-500',
  };
  
  const lineColor = variantStyles[variant];
  const dotColor = lineColor.replace('stroke-', 'bg-');
  
  return (
    <div className={cn("w-full", className)}>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfico de linha mostrando tendência de valores"
        >
          {/* Grade de fundo para melhor visualização */}
          <g className="stroke-muted stroke-[0.5]">
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} />
            ))}
            {points.map((point, i) => (
              <line key={i} x1={point.x} y1="0" x2={point.x} y2="100" />
            ))}
          </g>
          
          {/* Área sob a linha */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            className={`${dotColor} opacity-10 fill-current`}
          />
          
          {/* Linha principal */}
          <path
            d={pathData}
            fill="none"
            className={cn(
              "stroke-2 stroke-current transition-all ease-in-out duration-1000",
              lineColor
            )}
            strokeDasharray="500"
            strokeDashoffset="500"
            style={{ animation: 'draw-line 1.5s ease-out forwards' }}
          />
        </svg>
        
        {/* Pontos na linha */}
        {points.map((point, index) => (
          <div
            key={index}
            className={cn(
              "absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
              "opacity-0 scale-0 hover:scale-125",
              dotColor,
              { "opacity-100 scale-100": true }
            )}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              animation: `pop-in 0.3s ${index * 0.1 + 1}s ease-out forwards`
            }}
          >
            {showLabels && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-background shadow-md rounded px-2 py-1 text-xs pointer-events-none">
                {point.label}: {point.value}
              </div>
            )}
          </div>
        ))}
        
        {/* Rótulos no eixo X (condicional) */}
        {showLabels && (
          <div className="flex justify-between mt-6 px-[10px]">
            {points.map((point, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-xs max-w-16 truncate text-center text-muted-foreground">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pop-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
} 