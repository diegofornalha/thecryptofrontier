#!/usr/bin/env node

/**
 * Guardian Unificado Simplificado - Versão JavaScript
 * Sistema completo de gestão e otimização de projetos
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UnifiedGuardianSimple {
  constructor(config = {}) {
    this.config = {
      projectPath: process.cwd(),
      port: 3003,
      ...config
    };
    
    this.analysisHistory = [];
  }

  // Detecta o tipo de projeto
  detectProjectType() {
    const projectPath = this.config.projectPath;
    const indicators = {
      'Next.js': ['next.config.js', 'pages', 'app'],
      'Strapi': ['strapi', 'api', 'config/database.js'],
      'Docker': ['docker-compose.yml', 'Dockerfile'],
      'Monorepo': ['lerna.json', 'packages', 'apps'],
      'React': ['package.json', 'src/App.tsx', 'src/App.js'],
      'Node.js': ['package.json', 'index.js', 'server.js']
    };

    for (const [type, files] of Object.entries(indicators)) {
      const found = files.filter(file => 
        fs.existsSync(path.join(projectPath, file))
      ).length;
      
      if (found >= 2) {
        return type;
      }
    }

    // Verificar package.json
    const pkgPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.dependencies?.next) return 'Next.js';
      if (pkg.dependencies?.strapi) return 'Strapi';
      if (pkg.dependencies?.react) return 'React';
    }

    return 'Unknown';
  }

  // Calcula score de organização
  calculateOrganizationScore() {
    const checks = {
      hasReadme: fs.existsSync(path.join(this.config.projectPath, 'README.md')),
      hasGitignore: fs.existsSync(path.join(this.config.projectPath, '.gitignore')),
      hasPackageJson: fs.existsSync(path.join(this.config.projectPath, 'package.json')),
      hasDocsFolder: fs.existsSync(path.join(this.config.projectPath, 'docs')),
      hasTestsFolder: fs.existsSync(path.join(this.config.projectPath, 'tests')) || 
                      fs.existsSync(path.join(this.config.projectPath, '__tests__')),
      hasCI: fs.existsSync(path.join(this.config.projectPath, '.github/workflows')) ||
             fs.existsSync(path.join(this.config.projectPath, '.gitlab-ci.yml')),
      hasEnvironmentExample: fs.existsSync(path.join(this.config.projectPath, '.env.example')),
      hasTypeScript: fs.existsSync(path.join(this.config.projectPath, 'tsconfig.json')),
      hasESLint: fs.existsSync(path.join(this.config.projectPath, '.eslintrc.json')) ||
                 fs.existsSync(path.join(this.config.projectPath, '.eslintrc.js')),
      hasPrettier: fs.existsSync(path.join(this.config.projectPath, '.prettierrc'))
    };

    const score = Object.values(checks).filter(Boolean).length * 10;
    return Math.min(score, 100);
  }

  // Analisa o projeto
  async analyzeProject() {
    console.log('🔍 Iniciando análise unificada do projeto...');

    const projectType = this.detectProjectType();
    console.log(`📁 Tipo de projeto detectado: ${projectType}`);

    const organizationScore = this.calculateOrganizationScore();
    console.log(`📊 Score de organização: ${organizationScore}%`);

    // Análise de estrutura
    const issues = [];
    const recommendations = [];

    // Verificar estrutura básica
    if (!fs.existsSync(path.join(this.config.projectPath, 'README.md'))) {
      issues.push('README.md não encontrado');
      recommendations.push('Criar README.md com documentação do projeto');
    }

    if (!fs.existsSync(path.join(this.config.projectPath, '.gitignore'))) {
      issues.push('.gitignore não encontrado');
      recommendations.push('Criar .gitignore apropriado para o projeto');
    }

    if (!fs.existsSync(path.join(this.config.projectPath, 'docs'))) {
      recommendations.push('Criar pasta docs/ para documentação');
    }

    // Criar resultado completo
    const result = {
      projectType,
      organizationScore,
      score: organizationScore, // Adicionar score para compatibilidade
      issues,
      recommendations,
      timestamp: new Date().toISOString(),
      projectPath: this.config.projectPath,
      stats: {
        totalFiles: 0,
        wellOrganizedFiles: 0,
        filesNeedingAttention: issues.length,
        duplicateFiles: 0,
        messyFolders: []
      },
      maxScore: 100
    };

    // Adicionar ao histórico no formato esperado pelo MCP
    const historyEntry = {
      id: `analysis-${Date.now()}`,
      timestamp: result.timestamp,
      projectPath: result.projectPath,
      score: result.organizationScore,
      issueCount: issues.length,
      projectType: result.projectType
    };
    this.analysisHistory.push(historyEntry);

    // Gerar relatório
    this.generateReport(result);

    return result;
  }

  // Gera relatório
  generateReport(result) {
    const reportPath = path.join(this.config.projectPath, 'GUARDIAN-REPORT.md');
    
    const report = `# 🛡️ Guardian Unified Report

**Generated at:** ${result.timestamp}
**Project Type:** ${result.projectType}
**Organization Score:** ${result.organizationScore}%

## 📊 Summary

### Issues Found: ${result.issues.length}
${result.issues.map(issue => `- ❗ ${issue}`).join('\n')}

### Recommendations: ${result.recommendations.length}
${result.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

## 🎯 Next Steps

1. Address all issues found
2. Implement recommendations
3. Re-run analysis after fixes
4. Maintain organization score above 80%

---
*Generated by Unified Guardian*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Relatório salvo em: ${reportPath}`);
  }

  // Inicia servidor
  startServer() {
    const app = express();
    app.use(express.json());

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        analysisCount: this.analysisHistory.length,
        projectPath: this.config.projectPath
      });
    });

    // Analyze endpoint
    app.post('/analyze', async (req, res) => {
      try {
        const result = await this.analyzeProject();
        
        // Adicionar campos de compatibilidade com MCP
        result.issues = result.issues.map((issue, index) => ({
          type: 'structure',
          severity: index === 0 ? 'critical' : 'major',
          description: issue,
          solution: result.recommendations[index] || 'Verificar documentação',
          points: index === 0 ? 30 : 20
        }));
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // History endpoint
    app.get('/history', (req, res) => {
      res.json(this.analysisHistory);
    });

    // Status endpoint
    app.get('/status', (req, res) => {
      const lastAnalysis = this.analysisHistory[this.analysisHistory.length - 1];
      res.json({
        projectPath: this.config.projectPath,
        lastAnalysis: lastAnalysis || null,
        version: '1.0.0-simple'
      });
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        service: 'Unified Guardian',
        version: '1.0.0-simple',
        endpoints: ['/health', '/status', '/analyze', '/history']
      });
    });

    app.listen(this.config.port, () => {
      console.log(`🚀 Unified Guardian running on port ${this.config.port}`);
      console.log(`✅ Health check available at http://localhost:${this.config.port}/health`);
    });
  }
}

// CLI
if (require.main === module) {
  const guardian = new UnifiedGuardianSimple({
    projectPath: '/workspace',
    port: 3003
  });

  // Análise inicial
  guardian.analyzeProject().then(() => {
    console.log('✅ Análise inicial concluída');
  }).catch(error => {
    console.error('❌ Erro na análise inicial:', error);
  });

  // Iniciar servidor
  guardian.startServer();
}