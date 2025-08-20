import axios from 'axios';
import { AgentState, DashboardMetrics, CommitResult } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/agent';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentApi = {
  // Status e métricas
  getStatus: () => api.get<AgentState>('/status').then(res => res.data),
  getMetrics: () => api.get<DashboardMetrics>('/metrics').then(res => res.data),
  
  // Controles
  pause: () => api.post('/pause').then(res => res.data),
  resume: () => api.post('/resume').then(res => res.data),
  forceCommit: (message?: string) => 
    api.post<CommitResult>('/commit', { message }).then(res => res.data),
  
  // SSH
  storeSSHKey: (key: string) => 
    api.post('/ssh/store', { key }).then(res => res.data),
  removeSSHKey: () => 
    api.delete('/ssh').then(res => res.data),
  
  // Configuração
  getConfig: () => 
    api.get('/config').then(res => res.data),
};