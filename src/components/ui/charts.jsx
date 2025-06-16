"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
// Componente de gráfico de barras
export function BarChart({ data, height = 200, className, labelClassName, valueClassName, showValues = true }) {
    const maxValue = Math.max(...data.map(item => item.value));
    return (<div className={cn("w-full", className)}>
      <div className="flex items-end space-x-2 overflow-x-auto pb-4" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (<div key={index} className="flex flex-col items-center flex-shrink-0 min-w-16">
              <div className="relative flex flex-col items-center justify-end flex-1 w-full">
                {showValues && (<span className={cn("text-xs mb-1", valueClassName)}>
                    {item.value}
                  </span>)}
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${percentage}%` }}/>
              </div>
              <span className={cn("text-xs mt-2 truncate max-w-full text-center", labelClassName)}>
                {item.label}
              </span>
            </div>);
        })}
      </div>
    </div>);
}
// Componente de gráfico de linhas
export function LineChart({ data, height = 200, className, labelClassName, valueClassName, showValues = true }) {
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
    return (<div className={cn("w-full", className)}>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={pathData} fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"/>
        </svg>
        
        {points.map((point, index) => (<div key={index} className="absolute w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2" style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
            }}/>))}
        
        {showValues && (<div className="flex justify-between mt-2">
            {points.map((point, index) => (<div key={index} className="flex flex-col items-center">
                <span className={cn("text-xs", valueClassName)}>
                  {point.value}
                </span>
                <span className={cn("text-xs mt-1 max-w-16 truncate text-center", labelClassName)}>
                  {point.label}
                </span>
              </div>))}
          </div>)}
      </div>
    </div>);
}
// Componente de gráfico de pizza
export function PieChart({ data, height = 200, className, labelClassName, valueClassName, showValues = true }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = [
        "bg-blue-500", "bg-purple-500", "bg-green-500",
        "bg-yellow-500", "bg-red-500", "bg-indigo-500",
        "bg-pink-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
    ];
    let startAngle = 0;
    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const segmentData = {
            percentage,
            color: colors[index % colors.length],
            startAngle,
            endAngle: startAngle + angle
        };
        startAngle += angle;
        return { ...item, ...segmentData };
    });
    return (<div className={cn("w-full flex", className)}>
      <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {segments.map((segment, index) => {
            return (<div key={index} className={`absolute inset-0 ${segment.color}`} style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((segment.startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((segment.startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((segment.endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((segment.endAngle - 90) * Math.PI / 180)}%)`
                }}/>);
        })}
        </div>
      </div>
      
      {showValues && (<div className="ml-4 flex flex-col justify-center space-y-2">
          {segments.map((segment, index) => (<div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-sm ${segment.color} mr-2`}/>
              <span className={cn("text-sm font-medium", labelClassName)}>
                {segment.label}
              </span>
              <span className={cn("text-sm ml-2", valueClassName)}>
                {segment.value} ({segment.percentage.toFixed(1)}%)
              </span>
            </div>))}
        </div>)}
    </div>);
}
