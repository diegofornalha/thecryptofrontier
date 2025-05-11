// src/lib/analytics.ts

type TrackingEvent = {
  component: string;
  props: string[];
  timestamp: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: TrackingEvent[] = [];
  private isEnabled: boolean = false;

  private constructor() {
    // Singleton
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  trackComponentUsage(componentName: string, props: Record<string, any> = {}) {
    if (!this.isEnabled || typeof window === 'undefined') return;
    
    const event: TrackingEvent = {
      component: componentName,
      props: Object.keys(props),
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    
    // Envia para o servidor a cada 10 eventos ou podemos 
    // adicionar um debounce para enviar periodicamente
    if (this.events.length >= 10) {
      this.sendEvents();
    }
  }

  private async sendEvents() {
    if (this.events.length === 0) return;
    
    try {
      const eventsToSend = [...this.events];
      this.events = [];
      
      await fetch('/api/design-system/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (error) {
      console.error('Erro ao enviar eventos de analytics:', error);
      // Se falhar, podemos tentar novamente mais tarde ou descartar
    }
  }

  // Método para buscar estatísticas de uso (usado pelo dashboard)
  async getUsageStatistics() {
    try {
      const res = await fetch('/api/design-system/analytics');
      if (!res.ok) throw new Error('Falha ao obter estatísticas');
      return await res.json();
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }
}

// Hook para componentes React
export function useComponentTracking() {
  const analytics = AnalyticsService.getInstance();
  
  return {
    trackComponentUsage: analytics.trackComponentUsage.bind(analytics)
  };
}

// Função standalone para componentes 
export function trackComponentUsage(componentName: string, props: Record<string, any> = {}) {
  const analytics = AnalyticsService.getInstance();
  analytics.trackComponentUsage(componentName, props);
}

export default AnalyticsService.getInstance(); 