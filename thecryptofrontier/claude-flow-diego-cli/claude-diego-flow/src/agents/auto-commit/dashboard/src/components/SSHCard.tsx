import { Key, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { SSHKeyInfo } from '@/types';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/lib/api';
import clsx from 'clsx';

interface SSHCardProps {
  sshStatus?: SSHKeyInfo;
}

export function SSHCard({ sshStatus }: SSHCardProps) {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [sshKey, setSSHKey] = useState('');
  const queryClient = useQueryClient();

  const storeKeyMutation = useMutation({
    mutationFn: (key: string) => agentApi.storeSSHKey(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setShowKeyInput(false);
      setSSHKey('');
    },
  });

  const removeKeyMutation = useMutation({
    mutationFn: () => agentApi.removeSSHKey(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const handleStoreKey = () => {
    if (sshKey.trim()) {
      storeKeyMutation.mutate(sshKey);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <Key className="w-5 h-5 mr-2 text-primary-600" />
          Chave SSH
        </h2>
        <div className="flex items-center">
          {sshStatus?.isValid ? (
            <CheckCircle className="w-5 h-5 text-success-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning-600" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="metric">
          <span className="metric-label">Status</span>
          <span className={clsx('status-badge', 
            sshStatus?.isValid ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-600'
          )}>
            <Shield className="w-3 h-3 mr-1" />
            {sshStatus?.isValid ? 'Configurada' : 'Não Configurada'}
          </span>
        </div>

        {sshStatus?.isValid && (
          <>
            <div className="metric">
              <span className="metric-label">Falhas de Autenticação</span>
              <span className={clsx('metric-value', 
                sshStatus.failureCount > 0 && 'text-danger-600'
              )}>
                {sshStatus.failureCount}
              </span>
            </div>

            {sshStatus.fingerprint && (
              <div className="metric">
                <span className="metric-label">Fingerprint</span>
                <span className="text-xs font-mono text-gray-600">
                  {sshStatus.fingerprint}
                </span>
              </div>
            )}
          </>
        )}

        <div className="pt-3 space-y-2">
          {!sshStatus?.isValid && !showKeyInput && (
            <button
              onClick={() => setShowKeyInput(true)}
              className="btn btn-primary w-full"
            >
              Configurar Chave SSH
            </button>
          )}

          {showKeyInput && (
            <div className="space-y-2">
              <textarea
                value={sshKey}
                onChange={(e) => setSSHKey(e.target.value)}
                placeholder="Cole sua chave SSH privada aqui..."
                className="w-full h-32 px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleStoreKey}
                  disabled={!sshKey.trim() || storeKeyMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  {storeKeyMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setShowKeyInput(false);
                    setSSHKey('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {sshStatus?.isValid && (
            <button
              onClick={() => removeKeyMutation.mutate()}
              disabled={removeKeyMutation.isPending}
              className="btn btn-danger w-full"
            >
              {removeKeyMutation.isPending ? 'Removendo...' : 'Remover Chave'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}