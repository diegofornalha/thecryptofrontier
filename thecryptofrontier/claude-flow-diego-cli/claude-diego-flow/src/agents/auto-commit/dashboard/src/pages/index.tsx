import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { Layout } from '@/components/Layout';
import { StatusCard } from '@/components/StatusCard';
import { MetricsCard } from '@/components/MetricsCard';
import { SSHCard } from '@/components/SSHCard';
import { ControlsCard } from '@/components/ControlsCard';
import { ActivityLog } from '@/components/ActivityLog';
import { CommitChart } from '@/components/CommitChart';

export default function Dashboard() {
  const queryClient = useQueryClient();

  // Queries
  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: agentApi.getStatus,
  });

  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: agentApi.getMetrics,
  });

  // WebSocket
  useEffect(() => {
    wsClient.connect();

    const unsubMetrics = wsClient.on('metrics', (data) => {
      queryClient.setQueryData(['metrics'], data);
    });

    const unsubCommit = wsClient.on('commit', () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['status'] });
    });

    return () => {
      unsubMetrics();
      unsubCommit();
      wsClient.disconnect();
    };
  }, [queryClient]);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status */}
        <StatusCard status={status} />

        {/* Métricas */}
        <MetricsCard metrics={metrics} />

        {/* SSH Status */}
        <SSHCard sshStatus={metrics?.sshKeyStatus} />

        {/* Controles */}
        <ControlsCard 
          isRunning={status?.isRunning}
          isPaused={status?.isPaused}
        />

        {/* Gráfico de Commits */}
        <div className="lg:col-span-2">
          <CommitChart />
        </div>

        {/* Log de Atividades */}
        <div className="lg:col-span-3">
          <ActivityLog />
        </div>
      </div>
    </Layout>
  );
}