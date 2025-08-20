import { ScrollText, GitCommit, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { wsClient } from '@/lib/websocket';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

interface LogEntry {
  id: string;
  type: 'commit' | 'error' | 'info';
  message: string;
  timestamp: Date;
  details?: any;
}

export function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Escutar eventos via WebSocket
    const unsubCommit = wsClient.on('commit', (data) => {
      addLog({
        type: 'commit',
        message: `Commit realizado: ${data.message}`,
        details: data,
      });
    });

    const unsubError = wsClient.on('error', (data) => {
      addLog({
        type: 'error',
        message: data.message || 'Erro desconhecido',
        details: data,
      });
    });

    const unsubNotification = wsClient.on('notification', (data) => {
      addLog({
        type: 'info',
        message: data.message,
        details: data,
      });
    });

    return () => {
      unsubCommit();
      unsubError();
      unsubNotification();
    };
  }, []);

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      {
        ...entry,
        id: Date.now().toString(),
        timestamp: new Date(),
      },
      ...prev.slice(0, 99), // Manter apenas 100 entradas
    ]);
  };

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'commit':
        return GitCommit;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getTypeStyles = (type: LogEntry['type']) => {
    switch (type) {
      case 'commit':
        return 'text-success-600 bg-success-50';
      case 'error':
        return 'text-danger-600 bg-danger-50';
      default:
        return 'text-primary-600 bg-primary-50';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <ScrollText className="w-5 h-5 mr-2 text-primary-600" />
          Log de Atividades
        </h2>
        {logs.length > 0 && (
          <button
            onClick={() => setLogs([])}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Aguardando atividades...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const Icon = getIcon(log.type);
              
              return (
                <div
                  key={log.id}
                  className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 animate-slide-in"
                >
                  <div className={clsx(
                    'p-1.5 rounded-full mr-3',
                    getTypeStyles(log.type)
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{log.message}</p>
                    
                    {log.details && (
                      <details className="mt-1">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  
                  <time className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {format(log.timestamp, 'HH:mm:ss', { locale: ptBR })}
                  </time>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}