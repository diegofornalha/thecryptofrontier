import { Play, Pause, GitCommit, Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/lib/api';
import { useState } from 'react';

interface ControlsCardProps {
  isRunning?: boolean;
  isPaused?: boolean;
}

export function ControlsCard({ isRunning, isPaused }: ControlsCardProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const queryClient = useQueryClient();

  const pauseMutation = useMutation({
    mutationFn: () => agentApi.pause(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => agentApi.resume(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
  });

  const commitMutation = useMutation({
    mutationFn: (message?: string) => agentApi.forceCommit(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setShowCommitDialog(false);
      setCommitMessage('');
    },
  });

  const handlePauseResume = () => {
    if (isPaused) {
      resumeMutation.mutate();
    } else {
      pauseMutation.mutate();
    }
  };

  const handleCommit = () => {
    commitMutation.mutate(commitMessage || undefined);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary-600" />
          Controles
        </h2>
      </div>

      <div className="space-y-3">
        {isRunning && (
          <button
            onClick={handlePauseResume}
            disabled={pauseMutation.isPending || resumeMutation.isPending}
            className="btn btn-secondary w-full flex items-center justify-center"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                {resumeMutation.isPending ? 'Resumindo...' : 'Resumir'}
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                {pauseMutation.isPending ? 'Pausando...' : 'Pausar'}
              </>
            )}
          </button>
        )}

        <button
          onClick={() => setShowCommitDialog(true)}
          className="btn btn-primary w-full flex items-center justify-center"
        >
          <GitCommit className="w-4 h-4 mr-2" />
          Forçar Commit
        </button>

        {showCommitDialog && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem do Commit (opcional)
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Deixe vazio para mensagem automática"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCommit}
                disabled={commitMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {commitMutation.isPending ? 'Commitando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => {
                  setShowCommitDialog(false);
                  setCommitMessage('');
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>

            {commitMutation.isError && (
              <div className="p-2 bg-danger-50 border border-danger-200 rounded text-sm text-danger-700">
                Erro ao fazer commit
              </div>
            )}
          </div>
        )}

        <div className="pt-3 text-xs text-gray-500">
          <p>• Pausar: Interrompe temporariamente o monitoramento</p>
          <p>• Forçar Commit: Faz commit imediato das mudanças pendentes</p>
        </div>
      </div>
    </div>
  );
}