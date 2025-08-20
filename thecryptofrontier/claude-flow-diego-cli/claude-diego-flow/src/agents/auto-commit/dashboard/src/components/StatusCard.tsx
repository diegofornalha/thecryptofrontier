import { Activity, Pause, Play, AlertCircle } from 'lucide-react';
import { AgentState } from '@/types';
import clsx from 'clsx';

interface StatusCardProps {
  status?: AgentState;
}

export function StatusCard({ status }: StatusCardProps) {
  const getStatusInfo = () => {
    if (!status?.isRunning) {
      return {
        label: 'Parado',
        className: 'status-stopped',
        icon: AlertCircle,
      };
    }
    
    if (status.isPaused) {
      return {
        label: 'Pausado',
        className: 'status-paused',
        icon: Pause,
      };
    }
    
    return {
      label: 'Executando',
      className: 'status-running',
      icon: Play,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary-600" />
          Status do Agente
        </h2>
        <span className={clsx('status-badge', statusInfo.className)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusInfo.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="metric">
          <span className="metric-label">Diretório Monitorado</span>
          <span className="text-sm font-mono text-gray-700">
            {status?.config.watchPath || '-'}
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Tempo de Debounce</span>
          <span className="metric-value">
            {status?.config.debounceTime ? `${status.config.debounceTime}ms` : '-'}
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Mudanças Pendentes</span>
          <span className="metric-value text-primary-600">
            {status?.pendingChanges.length || 0}
          </span>
        </div>

        {status?.lastError && (
          <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-md">
            <p className="text-sm text-danger-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {status.lastError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}