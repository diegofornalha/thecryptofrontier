import { BarChart3, Clock, GitCommit, FileText } from 'lucide-react';
import { DashboardMetrics } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricsCardProps {
  metrics?: DashboardMetrics;
}

export function MetricsCard({ metrics }: MetricsCardProps) {
  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
          Métricas
        </h2>
      </div>

      <div className="space-y-3">
        <div className="metric">
          <span className="metric-label flex items-center">
            <GitCommit className="w-4 h-4 mr-1" />
            Total de Commits
          </span>
          <span className="metric-value text-success-600">
            {metrics?.totalCommits || 0}
          </span>
        </div>

        <div className="metric">
          <span className="metric-label flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Mudanças Processadas
          </span>
          <span className="metric-value">
            {metrics?.totalChanges || 0}
          </span>
        </div>

        <div className="metric">
          <span className="metric-label flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Tempo Ativo
          </span>
          <span className="metric-value">
            {metrics?.uptime ? formatUptime(metrics.uptime) : '0h 0m'}
          </span>
        </div>

        {metrics?.lastCommit && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Último Commit</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {metrics.lastCommit.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(metrics.lastCommit.timestamp), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}