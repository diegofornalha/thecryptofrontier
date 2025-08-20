#!/usr/bin/env node
/**
 * Auto-Commit Smart - Com mensagens inteligentes
 * Monitora arquivos e faz commit + push com mensagens descritivas
 */

import * as chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const run = promisify(exec);
let timer: NodeJS.Timeout;

// Tipos de commit convencionais
type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'perf' | 'build' | 'ci';

interface FileChange {
  path: string;
  status: 'A' | 'M' | 'D' | 'R' | '??';
}

/**
 * Analisa mudanças e determina o tipo de commit
 */
async function analyzeChanges(): Promise<{ type: CommitType; message: string; files: FileChange[] }> {
  const { stdout } = await run('git status --porcelain');
  const lines = stdout.trim().split('\n').filter(Boolean);
  
  const changes: FileChange[] = lines.map(line => ({
    status: line.substring(0, 2).trim() as FileChange['status'],
    path: line.substring(3)
  }));

  // Análise por tipo de arquivo e mudança
  const hasNewFeatures = changes.some(c => 
    c.status === 'A' && 
    (c.path.includes('/src/') || c.path.includes('/components/') || c.path.includes('/features/'))
  );
  
  const hasTests = changes.some(c => 
    c.path.includes('.test.') || c.path.includes('.spec.') || c.path.includes('__tests__')
  );
  
  const hasDocs = changes.some(c => 
    c.path.endsWith('.md') || c.path.includes('/docs/')
  );
  
  const hasConfig = changes.some(c => 
    c.path.includes('package.json') || 
    c.path.includes('tsconfig.json') || 
    c.path.includes('.json') ||
    c.path.includes('.yml') ||
    c.path.includes('.yaml')
  );
  
  const hasStyles = changes.some(c => 
    c.path.endsWith('.css') || c.path.endsWith('.scss') || c.path.endsWith('.less')
  );
  
  const hasFixes = changes.some(c => 
    c.status === 'M' && (c.path.includes('/src/') || c.path.includes('.ts') || c.path.includes('.js'))
  );

  // Determinar tipo e mensagem
  let type: CommitType = 'chore';
  let message = '';

  if (hasNewFeatures) {
    type = 'feat';
    const newFiles = changes.filter(c => c.status === 'A').map(c => path.basename(c.path, path.extname(c.path)));
    message = `adicionar ${newFiles.slice(0, 3).join(', ')}${newFiles.length > 3 ? ' e mais' : ''}`;
  } else if (hasTests) {
    type = 'test';
    message = 'atualizar testes';
  } else if (hasDocs) {
    type = 'docs';
    const docFiles = changes.filter(c => c.path.endsWith('.md')).map(c => path.basename(c.path, '.md'));
    message = `atualizar ${docFiles.slice(0, 2).join(' e ')}${docFiles.length > 2 ? ' e outros' : ''}`;
  } else if (hasConfig) {
    type = 'build';
    message = 'atualizar configurações';
  } else if (hasStyles) {
    type = 'style';
    message = 'ajustar estilos';
  } else if (hasFixes) {
    type = 'fix';
    const modifiedFiles = changes.filter(c => c.status === 'M').map(c => path.basename(c.path, path.extname(c.path)));
    message = `corrigir ${modifiedFiles.slice(0, 2).join(' e ')}${modifiedFiles.length > 2 ? ' e outros' : ''}`;
  } else {
    // Análise genérica
    const actions: string[] = [];
    const added = changes.filter(c => c.status === 'A').length;
    const modified = changes.filter(c => c.status === 'M').length;
    const deleted = changes.filter(c => c.status === 'D').length;
    
    if (added > 0) actions.push(`${added} arquivo${added > 1 ? 's' : ''} adicionado${added > 1 ? 's' : ''}`);
    if (modified > 0) actions.push(`${modified} arquivo${modified > 1 ? 's' : ''} modificado${modified > 1 ? 's' : ''}`);
    if (deleted > 0) actions.push(`${deleted} arquivo${deleted > 1 ? 's' : ''} removido${deleted > 1 ? 's' : ''}`);
    
    message = actions.join(', ');
  }

  return { type, message, files: changes };
}

/**
 * Analisa conteúdo de arquivos para mensagem mais específica
 */
async function getDetailedMessage(files: FileChange[]): Promise<string | null> {
  // Para arquivos TypeScript/JavaScript, tenta extrair nomes de funções/classes
  const codeFiles = files.filter(f => 
    (f.path.endsWith('.ts') || f.path.endsWith('.js')) && 
    f.status === 'A'
  ).slice(0, 2);

  if (codeFiles.length > 0) {
    try {
      const { stdout } = await run(`git diff --cached --name-only`);
      const cachedFiles = stdout.trim().split('\n').filter(Boolean);
      
      // Se há arquivos no stage, analisa o diff
      if (cachedFiles.length > 0) {
        const { stdout: diffOut } = await run(`git diff --cached --unified=0`);
        
        // Procura por declarações de função/classe
        const functionMatches = diffOut.match(/\+\s*(export\s+)?(async\s+)?function\s+(\w+)|class\s+(\w+)/g);
        if (functionMatches) {
          const names = functionMatches.map(m => {
            const match = m.match(/function\s+(\w+)|class\s+(\w+)/);
            return match ? (match[1] || match[2]) : null;
          }).filter(Boolean);
          
          if (names.length > 0) {
            return names.slice(0, 2).join(' e ');
          }
        }
      }
    } catch {
      // Ignora erros de análise
    }
  }
  
  return null;
}

// Inicia monitoramento
const watcher = chokidar.watch('.', {
  ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
  persistent: true,
  ignoreInitial: true
});

console.log('🤖 Auto-commit inteligente ativado! Commits com mensagens descritivas.');

// Processa mudanças
async function commit() {
  try {
    const { stdout } = await run('git status --porcelain');
    if (!stdout) return;

    // Adiciona arquivos
    await run('git add .');
    
    // Analisa mudanças
    const { type, message, files } = await analyzeChanges();
    
    // Tenta obter mensagem mais detalhada
    const detailedPart = await getDetailedMessage(files);
    const finalMessage = detailedPart ? `${type}: ${detailedPart}` : `${type}: ${message}`;
    
    // Faz commit
    await run(`git commit -m "${finalMessage}"`);
    
    // Push
    await run('git push').catch(() => run('git push -u origin main'));
    
    console.log(`✅ Commit realizado: ${finalMessage}`);
  } catch (e: any) {
    console.error('❌ Erro:', e.message);
  }
}

// Monitora mudanças
watcher.on('all', () => {
  clearTimeout(timer);
  timer = setTimeout(commit, 3000);
});

// Para com Ctrl+C
process.on('SIGINT', () => {
  watcher.close();
  console.log('\n👋 Auto-commit inteligente parado!');
  process.exit(0);
});

// Se executado diretamente, mostra exemplos
if (require.main === module) {
  console.log(`
📝 Exemplos de mensagens que serão geradas:

- feat: adicionar UserController
- fix: corrigir validação de email
- docs: atualizar README
- test: adicionar testes para auth
- style: ajustar estilos do header
- build: atualizar dependências
- refactor: reorganizar estrutura de pastas
- chore: 3 arquivos modificados, 1 arquivo removido

O tipo é determinado automaticamente baseado nos arquivos modificados!
  `);
}