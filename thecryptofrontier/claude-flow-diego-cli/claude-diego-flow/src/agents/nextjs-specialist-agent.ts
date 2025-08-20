#!/usr/bin/env npx tsx

import { MemoryEnhancedAgent } from '../core/memory-enhanced-agent';
import { Message, ToolCall } from '../types';
import { MCPClient } from '../mcp/mcp-client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class NextJSSpecialistAgent extends MemoryEnhancedAgent {
    protected mcpClient: MCPClient;
    private projectRoot: string;
    private nextConfigPath: string;
    private pagesDir: string;
    private appDir: string;
    private knowledgeBase: any;

    constructor() {
        super({
            id: 'nextjs-specialist',
            name: 'NextJS Specialist',
            description: 'Specialist in Next.js architecture, optimization, routing, SSR/SSG, and best practices',
            capabilities: [
                'Next.js configuration analysis',
                'App Router and Pages Router expertise',
                'Performance optimization',
                'SSR/SSG/ISR implementation',
                'API routes design',
                'Middleware configuration',
                'Image optimization',
                'Deployment strategies',
                'Next.js 13+ features',
                'React Server Components'
            ],
            memory: {
                category: 'nextjs-analysis',
                autoSave: true,
                retentionDays: 90
            }
        });

        this.projectRoot = '/home/strapi/thecryptofrontier';
        this.nextConfigPath = path.join(this.projectRoot, 'next.config.js');
        this.pagesDir = path.join(this.projectRoot, 'src/pages');
        this.appDir = path.join(this.projectRoot, 'src/app');
        
        this.mcpClient = new MCPClient({
            name: 'nextjs-mcp',
            version: '1.0.0'
        });

        this.initializeKnowledgeBase();
    }

    private initializeKnowledgeBase(): void {
        this.knowledgeBase = {
            coreConcepts: {
                routing: {
                    appRouter: {
                        structure: 'File-based routing with app directory',
                        features: ['Layouts', 'Loading UI', 'Error handling', 'Route groups'],
                        serverComponents: 'Default for all components in app directory'
                    },
                    pagesRouter: {
                        structure: 'Traditional pages directory routing',
                        features: ['_app.js', '_document.js', 'getServerSideProps', 'getStaticProps']
                    }
                },
                rendering: {
                    ssr: 'Server-Side Rendering - Dynamic content on each request',
                    ssg: 'Static Site Generation - Pre-built at build time',
                    isr: 'Incremental Static Regeneration - Update static pages after build',
                    csr: 'Client-Side Rendering - Traditional React rendering'
                },
                optimization: {
                    images: 'next/image component with automatic optimization',
                    fonts: 'next/font for optimized font loading',
                    scripts: 'next/script for optimized script loading',
                    bundling: 'Automatic code splitting and bundling'
                }
            },
            commonTasks: {
                'performance': [
                    'Enable React Strict Mode',
                    'Implement lazy loading',
                    'Optimize images with next/image',
                    'Use dynamic imports for code splitting',
                    'Configure caching headers'
                ],
                'seo': [
                    'Implement metadata API',
                    'Add structured data',
                    'Configure sitemap generation',
                    'Optimize Core Web Vitals'
                ],
                'deployment': [
                    'Configure for Vercel deployment',
                    'Set up Docker containerization',
                    'Configure environment variables',
                    'Set up CI/CD pipelines'
                ]
            },
            bestPractices: [
                'Use Server Components by default in app directory',
                'Implement proper error boundaries',
                'Optimize bundle size with dynamic imports',
                'Use proper caching strategies',
                'Implement proper TypeScript types',
                'Follow Next.js file conventions',
                'Use middleware for authentication',
                'Implement proper data fetching patterns'
            ]
        };
    }

    async initialize(): Promise<void> {
        try {
            await this.mcpClient.connect();
            console.log('NextJS Specialist Agent initialized successfully');
        } catch (error) {
            console.warn('MCP connection failed, continuing without MCP:', error);
        }
    }

    async processMessage(message: Message): Promise<Message> {
        const startTime = Date.now();
        
        try {
            const response = await this.analyzeRequest(message.content);
            
            return {
                role: 'assistant',
                content: response,
                metadata: {
                    agent: this.config.id,
                    timestamp: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    capabilities: this.config.capabilities
                }
            };
        } catch (error) {
            return {
                role: 'assistant',
                content: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    agent: this.config.id,
                    timestamp: new Date().toISOString(),
                    error: true
                }
            };
        }
    }

    private async analyzeRequest(request: string): Promise<string> {
        const lowerRequest = request.toLowerCase();
        
        // Specific analysis based on keywords
        if (lowerRequest.includes('performance') || lowerRequest.includes('optimize')) {
            return await this.analyzePerformance();
        }
        
        if (lowerRequest.includes('routing') || lowerRequest.includes('routes')) {
            return await this.analyzeRouting();
        }
        
        if (lowerRequest.includes('deploy') || lowerRequest.includes('production')) {
            return await this.analyzeDeployment();
        }
        
        if (lowerRequest.includes('config') || lowerRequest.includes('next.config')) {
            return await this.analyzeConfiguration();
        }
        
        if (lowerRequest.includes('ssr') || lowerRequest.includes('ssg') || lowerRequest.includes('render')) {
            return await this.analyzeRenderingStrategy();
        }
        
        // General Next.js analysis
        return await this.generalNextJSAnalysis();
    }

    private async analyzePerformance(): Promise<string> {
        let report = '# 🚀 Next.js Performance Analysis\n\n';
        
        // Buscar análises anteriores similares
        const previousAnalyses = await this.searchMemories('next.js performance optimization');
        if (previousAnalyses.length > 0) {
            report += '## 🧠 Insights from Previous Analyses\n';
            previousAnalyses.slice(0, 3).forEach(memory => {
                report += `- ${memory.content.split('\n')[0]}\n`;
            });
            report += '\n';
        }
        
        // Check for next.config.js optimizations
        const configExists = await this.fileExists(this.nextConfigPath);
        if (configExists) {
            const config = await fs.readFile(this.nextConfigPath, 'utf-8');
            report += '## Configuration Analysis\n';
            const configAnalysis = this.analyzeNextConfig(config);
            report += configAnalysis;
            
            // Salvar padrões de configuração encontrados
            if (configAnalysis.includes('optimization')) {
                await this.saveMemory(
                    `Next.js config optimization found: ${configAnalysis.substring(0, 200)}`,
                    ['performance', 'config', 'optimization']
                );
            }
        }
        
        // Check for image optimization
        const imageUsage = await this.checkImageOptimization();
        report += '\n## Image Optimization\n';
        report += imageUsage;
        
        // Salvar se encontrou problemas de imagem
        if (imageUsage.includes('not optimized')) {
            await this.savePattern(
                'Unoptimized images detected',
                1,
                'Performance analysis'
            );
        }
        
        // Check bundle analysis
        report += '\n## Bundle Optimization\n';
        const bundleAnalysis = await this.analyzeBundleOptimization();
        report += bundleAnalysis;
        
        // Performance recommendations
        report += '\n## 📋 Recommendations\n';
        const recommendations = this.generatePerformanceRecommendations();
        report += recommendations;
        
        // Salvar análise completa se encontrou problemas significativos
        const issuesFound = (report.match(/❌|⚠️/g) || []).length;
        if (issuesFound > 3) {
            await this.saveMemory(
                `Performance analysis found ${issuesFound} issues. Key recommendations: ${recommendations.substring(0, 300)}`,
                ['performance', 'analysis', 'issues'],
                { issuesCount: issuesFound, projectPath: this.projectRoot }
            );
        }
        
        return report;
    }

    private async analyzeRouting(): Promise<string> {
        let report = '# 🗺️ Next.js Routing Analysis\n\n';
        
        // Buscar padrões de roteamento conhecidos
        const routingPatterns = await this.searchMemories('next.js routing patterns');
        if (routingPatterns.length > 0) {
            report += '## 🧠 Known Routing Patterns\n';
            routingPatterns.slice(0, 2).forEach(memory => {
                report += `- ${memory.content.split('\n')[0]}\n`;
            });
            report += '\n';
        }
        
        // Check which routing system is used
        const hasAppDir = await this.fileExists(this.appDir);
        const hasPagesDir = await this.fileExists(this.pagesDir);
        
        report += '## Routing System\n';
        if (hasAppDir) {
            report += '✅ **App Router** detected (Next.js 13+)\n';
            report += await this.analyzeAppRouter();
        }
        
        if (hasPagesDir) {
            report += '✅ **Pages Router** detected\n';
            report += await this.analyzePagesRouter();
        }
        
        if (!hasAppDir && !hasPagesDir) {
            report += '⚠️ No routing directory found. Project might not be properly configured.\n';
        }
        
        // API Routes analysis
        report += '\n## API Routes\n';
        report += await this.analyzeAPIRoutes();
        
        return report;
    }

    private async analyzeDeployment(): Promise<string> {
        let report = '# 🚢 Next.js Deployment Analysis\n\n';
        
        // Check for deployment configurations
        report += '## Build Configuration\n';
        report += await this.checkBuildConfiguration();
        
        // Environment variables
        report += '\n## Environment Variables\n';
        report += await this.checkEnvironmentSetup();
        
        // Docker support
        report += '\n## Containerization\n';
        report += await this.checkDockerSetup();
        
        // Deployment recommendations
        report += '\n## 📋 Deployment Checklist\n';
        report += this.generateDeploymentChecklist();
        
        return report;
    }

    private async analyzeConfiguration(): Promise<string> {
        let report = '# ⚙️ Next.js Configuration Analysis\n\n';
        
        const configExists = await this.fileExists(this.nextConfigPath);
        if (!configExists) {
            report += '⚠️ No next.config.js found. Using default configuration.\n\n';
            report += '## Recommended Configuration\n';
            report += this.generateRecommendedConfig();
            return report;
        }
        
        const config = await fs.readFile(this.nextConfigPath, 'utf-8');
        report += '## Current Configuration\n';
        report += '```javascript\n' + config + '\n```\n\n';
        
        report += '## Configuration Analysis\n';
        report += this.analyzeNextConfig(config);
        
        return report;
    }

    private async analyzeRenderingStrategy(): Promise<string> {
        let report = '# 🎨 Next.js Rendering Strategy Analysis\n\n';
        
        // Analyze current rendering strategies
        report += '## Current Rendering Strategies\n';
        report += await this.detectRenderingStrategies();
        
        // Best practices for each strategy
        report += '\n## Rendering Best Practices\n';
        report += this.getRenderingBestPractices();
        
        // Recommendations
        report += '\n## 📋 Optimization Suggestions\n';
        report += this.generateRenderingRecommendations();
        
        return report;
    }

    private async generalNextJSAnalysis(): Promise<string> {
        let report = '# 📊 Next.js Project Analysis\n\n';
        
        // Project structure
        report += '## Project Structure\n';
        report += await this.analyzeProjectStructure();
        
        // Next.js version and features
        report += '\n## Framework Features\n';
        report += await this.analyzeNextJSFeatures();
        
        // General recommendations
        report += '\n## 📋 General Recommendations\n';
        report += this.generateGeneralRecommendations();
        
        return report;
    }

    // Helper methods
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    private async findFiles(pattern: string, directory: string = this.projectRoot): Promise<string[]> {
        try {
            const { stdout } = await execAsync(`find ${directory} -name "${pattern}" -type f 2>/dev/null | head -20`);
            return stdout.trim().split('\n').filter(Boolean);
        } catch {
            return [];
        }
    }

    private analyzeNextConfig(config: string): string {
        let analysis = '';
        
        // Check for common optimizations
        if (config.includes('swcMinify')) {
            analysis += '✅ SWC minification enabled\n';
        } else {
            analysis += '⚠️ Consider enabling SWC minification for faster builds\n';
        }
        
        if (config.includes('reactStrictMode')) {
            analysis += '✅ React Strict Mode enabled\n';
        } else {
            analysis += '⚠️ Enable React Strict Mode for better development experience\n';
        }
        
        if (config.includes('images')) {
            analysis += '✅ Image optimization configured\n';
        }
        
        if (config.includes('compiler')) {
            analysis += '✅ Compiler options configured\n';
        }
        
        return analysis;
    }

    private async checkImageOptimization(): Promise<string> {
        const imageImports = await execAsync(`grep -r "next/image" ${this.projectRoot}/src 2>/dev/null | wc -l`);
        const imgTags = await execAsync(`grep -r "<img" ${this.projectRoot}/src 2>/dev/null | wc -l`);
        
        const nextImageCount = parseInt(imageImports.stdout.trim()) || 0;
        const regularImgCount = parseInt(imgTags.stdout.trim()) || 0;
        
        let report = '';
        if (nextImageCount > 0) {
            report += `✅ Using next/image component (${nextImageCount} instances)\n`;
        }
        
        if (regularImgCount > 0) {
            report += `⚠️ Found ${regularImgCount} regular <img> tags. Consider migrating to next/image\n`;
        }
        
        return report;
    }

    private async analyzeBundleOptimization(): Promise<string> {
        let report = '';
        
        // Check for dynamic imports
        const dynamicImports = await execAsync(`grep -r "dynamic(" ${this.projectRoot}/src 2>/dev/null | wc -l`);
        const count = parseInt(dynamicImports.stdout.trim()) || 0;
        
        if (count > 0) {
            report += `✅ Using dynamic imports for code splitting (${count} instances)\n`;
        } else {
            report += '⚠️ Consider using dynamic imports for better code splitting\n';
        }
        
        // Check package.json for bundle analyzer
        try {
            const packageJson = await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf-8');
            if (packageJson.includes('@next/bundle-analyzer')) {
                report += '✅ Bundle analyzer available\n';
            } else {
                report += '💡 Consider adding @next/bundle-analyzer for bundle analysis\n';
            }
        } catch {
            // Ignore if package.json not found
        }
        
        return report;
    }

    private generatePerformanceRecommendations(): string {
        return `
1. **Enable SWC Minification**: Add \`swcMinify: true\` to next.config.js
2. **Optimize Images**: Use next/image component for all images
3. **Implement Code Splitting**: Use dynamic imports for heavy components
4. **Enable React Strict Mode**: Add \`reactStrictMode: true\`
5. **Configure Caching**: Set appropriate cache headers for static assets
6. **Monitor Core Web Vitals**: Use Next.js Analytics or similar tools
7. **Optimize Fonts**: Use next/font for optimal font loading
8. **Reduce JavaScript**: Analyze and reduce bundle size
`;
    }

    private async analyzeAppRouter(): Promise<string> {
        let report = '';
        
        try {
            // Find route files
            const routeFiles = await execAsync(`find ${this.appDir} -name "page.tsx" -o -name "page.ts" -o -name "page.jsx" -o -name "page.js" 2>/dev/null | head -10`);
            const routes = routeFiles.stdout.trim().split('\n').filter(Boolean);
            
            report += `\nFound ${routes.length} routes in app directory:\n`;
            routes.forEach(route => {
                const relativePath = route.replace(this.appDir, '').replace(/\/page\.(tsx?|jsx?)$/, '');
                report += `  - ${relativePath || '/'}\n`;
            });
            
            // Check for layouts
            const layouts = await execAsync(`find ${this.appDir} -name "layout.tsx" -o -name "layout.ts" 2>/dev/null | wc -l`);
            const layoutCount = parseInt(layouts.stdout.trim()) || 0;
            report += `\n✅ Found ${layoutCount} layout files\n`;
            
        } catch {
            report += '\n⚠️ Could not analyze app router structure\n';
        }
        
        return report;
    }

    private async analyzePagesRouter(): Promise<string> {
        let report = '';
        
        try {
            // Find page files
            const pageFiles = await execAsync(`find ${this.pagesDir} -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" 2>/dev/null | grep -v "_app\\|_document\\|api/" | head -10`);
            const pages = pageFiles.stdout.trim().split('\n').filter(Boolean);
            
            report += `\nFound ${pages.length} pages in pages directory\n`;
            
            // Check for custom App and Document
            if (await this.fileExists(path.join(this.pagesDir, '_app.tsx')) || await this.fileExists(path.join(this.pagesDir, '_app.js'))) {
                report += '✅ Custom _app file found\n';
            }
            
            if (await this.fileExists(path.join(this.pagesDir, '_document.tsx')) || await this.fileExists(path.join(this.pagesDir, '_document.js'))) {
                report += '✅ Custom _document file found\n';
            }
            
        } catch {
            report += '\n⚠️ Could not analyze pages router structure\n';
        }
        
        return report;
    }

    private async analyzeAPIRoutes(): Promise<string> {
        let report = '';
        
        // Check app directory API routes
        const appApiRoutes = await this.findFiles('route.ts', path.join(this.appDir, 'api'));
        const appApiRoutesJs = await this.findFiles('route.js', path.join(this.appDir, 'api'));
        
        // Check pages directory API routes
        const pagesApiRoutes = await this.findFiles('*.ts', path.join(this.pagesDir, 'api'));
        const pagesApiRoutesJs = await this.findFiles('*.js', path.join(this.pagesDir, 'api'));
        
        const totalApiRoutes = appApiRoutes.length + appApiRoutesJs.length + pagesApiRoutes.length + pagesApiRoutesJs.length;
        
        if (totalApiRoutes > 0) {
            report += `✅ Found ${totalApiRoutes} API routes\n`;
            
            if (appApiRoutes.length > 0 || appApiRoutesJs.length > 0) {
                report += '  - Using App Router API routes (route.ts/js)\n';
            }
            
            if (pagesApiRoutes.length > 0 || pagesApiRoutesJs.length > 0) {
                report += '  - Using Pages Router API routes\n';
            }
        } else {
            report += '⚠️ No API routes found\n';
        }
        
        return report;
    }

    private async checkBuildConfiguration(): Promise<string> {
        let report = '';
        
        try {
            const packageJson = JSON.parse(await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf-8'));
            
            if (packageJson.scripts?.build) {
                report += `✅ Build script configured: \`${packageJson.scripts.build}\`\n`;
            }
            
            if (packageJson.scripts?.start) {
                report += `✅ Start script configured: \`${packageJson.scripts.start}\`\n`;
            }
            
            // Check for output configuration
            const config = await fs.readFile(this.nextConfigPath, 'utf-8').catch(() => '');
            if (config.includes('output:')) {
                if (config.includes("'standalone'")) {
                    report += '✅ Standalone output mode configured\n';
                } else if (config.includes("'export'")) {
                    report += '✅ Static export configured\n';
                }
            }
            
        } catch {
            report += '⚠️ Could not analyze build configuration\n';
        }
        
        return report;
    }

    private async checkEnvironmentSetup(): Promise<string> {
        let report = '';
        
        // Check for environment files
        const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
        
        for (const envFile of envFiles) {
            if (await this.fileExists(path.join(this.projectRoot, envFile))) {
                report += `✅ ${envFile} found\n`;
            }
        }
        
        // Check for env.example
        if (await this.fileExists(path.join(this.projectRoot, '.env.example'))) {
            report += '✅ .env.example provided for reference\n';
        } else {
            report += '💡 Consider adding .env.example for documentation\n';
        }
        
        return report;
    }

    private async checkDockerSetup(): Promise<string> {
        let report = '';
        
        if (await this.fileExists(path.join(this.projectRoot, 'Dockerfile'))) {
            report += '✅ Dockerfile found\n';
            
            // Check if it's optimized for Next.js
            const dockerfile = await fs.readFile(path.join(this.projectRoot, 'Dockerfile'), 'utf-8');
            if (dockerfile.includes('standalone')) {
                report += '✅ Using standalone output for smaller Docker images\n';
            }
        } else {
            report += '💡 Consider adding a Dockerfile for containerized deployments\n';
        }
        
        if (await this.fileExists(path.join(this.projectRoot, 'docker-compose.yml'))) {
            report += '✅ docker-compose.yml found\n';
        }
        
        return report;
    }

    private generateDeploymentChecklist(): string {
        return `
- [ ] Environment variables configured for production
- [ ] Build optimization enabled (swcMinify, etc.)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured
- [ ] Security headers configured
- [ ] robots.txt and sitemap.xml configured
- [ ] Favicon and meta tags optimized
- [ ] API rate limiting implemented
- [ ] Database connection pooling configured
- [ ] CDN configured for static assets
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
`;
    }

    private generateRecommendedConfig(): string {
        return `
\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Standalone output for Docker
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
\`\`\`
`;
    }

    private async detectRenderingStrategies(): Promise<string> {
        let report = '';
        
        // Check for SSR (getServerSideProps)
        const ssrCheck = await execAsync(`grep -r "getServerSideProps" ${this.projectRoot}/src 2>/dev/null | wc -l`);
        const ssrCount = parseInt(ssrCheck.stdout.trim()) || 0;
        if (ssrCount > 0) {
            report += `✅ SSR: Found ${ssrCount} pages using getServerSideProps\n`;
        }
        
        // Check for SSG (getStaticProps)
        const ssgCheck = await execAsync(`grep -r "getStaticProps" ${this.projectRoot}/src 2>/dev/null | wc -l`);
        const ssgCount = parseInt(ssgCheck.stdout.trim()) || 0;
        if (ssgCount > 0) {
            report += `✅ SSG: Found ${ssgCount} pages using getStaticProps\n`;
        }
        
        // Check for ISR (revalidate)
        const isrCheck = await execAsync(`grep -r "revalidate:" ${this.projectRoot}/src 2>/dev/null | wc -l`);
        const isrCount = parseInt(isrCheck.stdout.trim()) || 0;
        if (isrCount > 0) {
            report += `✅ ISR: Found ${isrCount} pages using revalidate\n`;
        }
        
        // Check for Server Components (app directory)
        if (await this.fileExists(this.appDir)) {
            report += '✅ RSC: Using React Server Components (app directory)\n';
        }
        
        return report;
    }

    private getRenderingBestPractices(): string {
        return `
### Server-Side Rendering (SSR)
- Use for dynamic content that changes on every request
- Implement caching strategies to reduce server load
- Consider using ISR instead if content doesn't change frequently

### Static Site Generation (SSG)
- Use for content that doesn't change often
- Pre-render at build time for best performance
- Combine with ISR for content that needs periodic updates

### Incremental Static Regeneration (ISR)
- Perfect for content that updates periodically
- Set appropriate revalidate times
- Use on-demand revalidation for immediate updates

### React Server Components (RSC)
- Default to Server Components in app directory
- Use Client Components only when necessary (interactivity, browser APIs)
- Leverage streaming for better perceived performance
`;
    }

    private generateRenderingRecommendations(): string {
        return `
1. **Analyze Data Requirements**: Choose rendering method based on data freshness needs
2. **Optimize for Performance**: Prefer SSG/ISR over SSR when possible
3. **Implement Caching**: Use proper cache headers and strategies
4. **Monitor Core Web Vitals**: Track LCP, FID, and CLS
5. **Use Streaming**: Leverage React 18 streaming capabilities
6. **Optimize Data Fetching**: Implement proper loading states
7. **Consider Edge Runtime**: For globally distributed applications
`;
    }

    private async analyzeProjectStructure(): Promise<string> {
        let report = '';
        
        // Check main directories
        const directories = [
            { path: 'src', description: 'Source code directory' },
            { path: 'public', description: 'Static assets' },
            { path: 'src/components', description: 'React components' },
            { path: 'src/styles', description: 'Stylesheets' },
            { path: 'src/lib', description: 'Utility functions' },
            { path: 'src/hooks', description: 'Custom React hooks' }
        ];
        
        for (const dir of directories) {
            if (await this.fileExists(path.join(this.projectRoot, dir.path))) {
                report += `✅ ${dir.path}/ - ${dir.description}\n`;
            }
        }
        
        return report;
    }

    private async analyzeNextJSFeatures(): Promise<string> {
        let report = '';
        
        try {
            const packageJson = JSON.parse(await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf-8'));
            const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
            
            if (nextVersion) {
                report += `📦 Next.js version: ${nextVersion}\n\n`;
                
                // Check for common Next.js features
                const features = [
                    { pkg: '@next/font', name: 'Next.js Font Optimization' },
                    { pkg: '@next/bundle-analyzer', name: 'Bundle Analyzer' },
                    { pkg: 'next-pwa', name: 'PWA Support' },
                    { pkg: 'next-seo', name: 'SEO Optimization' },
                    { pkg: 'next-auth', name: 'Authentication' }
                ];
                
                for (const feature of features) {
                    if (packageJson.dependencies?.[feature.pkg] || packageJson.devDependencies?.[feature.pkg]) {
                        report += `✅ ${feature.name}\n`;
                    }
                }
            }
        } catch {
            report += '⚠️ Could not analyze package.json\n';
        }
        
        return report;
    }

    private generateGeneralRecommendations(): string {
        return `
1. **TypeScript**: Ensure strict TypeScript configuration
2. **Testing**: Implement comprehensive testing strategy
3. **Accessibility**: Run accessibility audits regularly
4. **SEO**: Implement proper meta tags and structured data
5. **Performance**: Monitor and optimize Core Web Vitals
6. **Security**: Implement security best practices
7. **Documentation**: Keep README and API documentation updated
8. **Code Quality**: Use ESLint and Prettier for consistency
`;
    }

    /**
     * Override para determinar interações importantes do NextJS
     */
    protected isImportantInteraction(message: Message, response: Message): boolean {
        // Salvar se:
        // 1. Resposta tem análise significativa (> 500 chars)
        // 2. Encontrou problemas (contém ❌ ou ⚠️)
        // 3. Gerou recomendações
        // 4. Análise completa de projeto
        return response.content.length > 500 || 
               response.content.includes('❌') || 
               response.content.includes('⚠️') ||
               response.content.includes('Recommendations') ||
               response.content.includes('Project Analysis');
    }

    /**
     * Método para gerar relatório de memória específico do NextJS
     */
    async generateNextJSMemoryReport(): Promise<string> {
        const baseReport = await this.generateMemoryReport();
        
        // Adicionar estatísticas específicas do NextJS
        const memories = await this.listMemories(50);
        const stats = {
            performanceIssues: memories.filter(m => m.tags?.includes('performance')).length,
            routingPatterns: memories.filter(m => m.tags?.includes('routing')).length,
            deploymentConfigs: memories.filter(m => m.tags?.includes('deployment')).length,
            configOptimizations: memories.filter(m => m.tags?.includes('configuration')).length
        };
        
        return baseReport + `\n🎆 NextJS Specific Insights:
- Performance issues tracked: ${stats.performanceIssues}
- Routing patterns learned: ${stats.routingPatterns}
- Deployment configs saved: ${stats.deploymentConfigs}
- Config optimizations: ${stats.configOptimizations}\n`;
    }

    async shutdown(): Promise<void> {
        // Gerar relatório final de memória antes de desligar
        if (this.learningCount > 0) {
            const report = await this.generateNextJSMemoryReport();
            console.log(report);
        }
        
        await this.mcpClient.disconnect();
        console.log('NextJS Specialist Agent shut down');
    }
}

// Allow running directly
if (require.main === module) {
    const agent = new NextJSSpecialistAgent();
    
    async function run() {
        await agent.initialize();
        
        const request = process.argv[2] || 'analyze';
        
        const message: Message = {
            role: 'user',
            content: request,
            metadata: {
                source: 'cli'
            }
        };
        
        const response = await agent.processMessage(message);
        console.log('\n' + response.content);
        
        await agent.shutdown();
    }
    
    run().catch(console.error);
}