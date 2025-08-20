import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { glob } from 'glob';

const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

export interface CleanupConfig {
  projectRoot: string;
  archiveDirectory: string;
  testFilePatterns: string[];
  temporaryFilePatterns: string[];
  excludeDirectories: string[];
  dryRun: boolean;
  autoCleanInterval: number; // hours
}

export interface CleanupReport {
  timestamp: string;
  filesFound: string[];
  filesToMove: string[];
  filesToDelete: string[];
  actionsTaken: string[];
  errors: string[];
}

export class CleanupService {
  private config: CleanupConfig;
  private cleanupInterval: NodeJS.Timer | null = null;

  constructor(config: Partial<CleanupConfig> = {}) {
    this.config = {
      projectRoot: config.projectRoot || '/workspace',
      archiveDirectory: config.archiveDirectory || '/workspace/archived-tests',
      testFilePatterns: config.testFilePatterns || [
        '**/test-*.js',
        '**/test-*.ts',
        '**/test*.py',
        '**/*-test.js',
        '**/*-test.ts',
        '**/temp-*.js',
        '**/temp-*.ts',
        '**/tmp-*.js',
        '**/tmp-*.ts'
      ],
      temporaryFilePatterns: config.temporaryFilePatterns || [
        '**/*.tmp',
        '**/*.temp',
        '**/*.bak',
        '**/*~',
        '**/processed_articles.json' // Arquivo específico do CrewAI que sempre é recriado
      ],
      excludeDirectories: config.excludeDirectories || [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/tests/**', // Diretórios de teste legítimos
        '**/test/**',
        '**/__tests__/**',
        '**/archived-tests/**',
        '**/venv/**', // Python virtual environments
        '**/.venv/**',
        '**/env/**',
        '**/.env/**',
        '**/site-packages/**', // Python packages
        '**/storybook-static/**' // Built storybook
      ],
      dryRun: config.dryRun !== false, // Por padrão, apenas simula
      autoCleanInterval: config.autoCleanInterval || 24 // Diariamente
    };
  }

  async start() {
    console.log(`🧹 Starting cleanup service (every ${this.config.autoCleanInterval} hours)`);
    
    // Ensure archive directory exists
    await this.ensureDirectory(this.config.archiveDirectory);
    
    // Initial cleanup check
    const report = await this.performCleanup();
    this.logReport(report);
    
    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(async () => {
      const report = await this.performCleanup();
      this.logReport(report);
    }, this.config.autoCleanInterval * 60 * 60 * 1000);
  }

  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Cleanup service stopped');
    }
  }

  async performCleanup(): Promise<CleanupReport> {
    const report: CleanupReport = {
      timestamp: new Date().toISOString(),
      filesFound: [],
      filesToMove: [],
      filesToDelete: [],
      actionsTaken: [],
      errors: []
    };

    try {
      // Find test files
      const testFiles = await this.findFiles(this.config.testFilePatterns);
      report.filesFound.push(...testFiles);
      
      // Find temporary files
      const tempFiles = await this.findFiles(this.config.temporaryFilePatterns);
      report.filesFound.push(...tempFiles);
      
      // Categorize files
      for (const file of testFiles) {
        const category = await this.categorizeFile(file);
        if (category === 'archive') {
          report.filesToMove.push(file);
        } else if (category === 'delete') {
          report.filesToDelete.push(file);
        }
      }
      
      // Temporary files usually get deleted
      report.filesToDelete.push(...tempFiles);
      
      // Perform actions if not dry run
      if (!this.config.dryRun) {
        // Archive test files
        for (const file of report.filesToMove) {
          try {
            await this.archiveFile(file);
            report.actionsTaken.push(`Archived: ${file}`);
          } catch (error: any) {
            report.errors.push(`Failed to archive ${file}: ${error.message}`);
          }
        }
        
        // Delete temporary files
        for (const file of report.filesToDelete) {
          try {
            await this.deleteFile(file);
            report.actionsTaken.push(`Deleted: ${file}`);
          } catch (error: any) {
            report.errors.push(`Failed to delete ${file}: ${error.message}`);
          }
        }
      }
      
    } catch (error: any) {
      report.errors.push(`Cleanup error: ${error.message}`);
    }
    
    return report;
  }

  private async findFiles(patterns: string[]): Promise<string[]> {
    const allFiles: string[] = [];
    
    for (const pattern of patterns) {
      try {
        const files = await glob(pattern, {
          cwd: this.config.projectRoot,
          absolute: true,
          ignore: this.config.excludeDirectories
        });
        allFiles.push(...files);
      } catch (error) {
        console.error(`Error finding files with pattern ${pattern}:`, error);
      }
    }
    
    // Remove duplicates
    return Array.from(new Set(allFiles));
  }

  private async categorizeFile(filePath: string): Promise<'archive' | 'delete' | 'keep'> {
    try {
      const stats = await stat(filePath);
      const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      // Files in root directory should be moved
      const relativePath = path.relative(this.config.projectRoot, filePath);
      const isInRoot = !relativePath.includes(path.sep);
      
      if (isInRoot) {
        return 'archive'; // Move files from root
      }
      
      // Old test files can be archived
      if (ageInDays > 7) {
        return 'archive';
      }
      
      // Very old files or empty files can be deleted
      if (ageInDays > 30 || stats.size === 0) {
        return 'delete';
      }
      
      // Check if file contains TODOs or important comments
      const content = await readFile(filePath, 'utf-8').catch(() => '');
      if (content.includes('TODO') || content.includes('IMPORTANT') || content.includes('FIXME')) {
        return 'archive'; // Archive files with TODOs
      }
      
      return 'keep';
    } catch (error) {
      return 'keep'; // When in doubt, keep the file
    }
  }

  private async archiveFile(filePath: string): Promise<void> {
    const relativePath = path.relative(this.config.projectRoot, filePath);
    const archivePath = path.join(this.config.archiveDirectory, relativePath);
    
    // Create directory structure in archive
    await this.ensureDirectory(path.dirname(archivePath));
    
    // Move file
    await rename(filePath, archivePath);
    console.log(`📦 Archived: ${relativePath} → archived-tests/${relativePath}`);
  }

  private async deleteFile(filePath: string): Promise<void> {
    await unlink(filePath);
    const relativePath = path.relative(this.config.projectRoot, filePath);
    console.log(`🗑️ Deleted: ${relativePath}`);
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private logReport(report: CleanupReport): void {
    console.log('\n📊 Cleanup Report:');
    console.log(`   Timestamp: ${report.timestamp}`);
    console.log(`   Files found: ${report.filesFound.length}`);
    console.log(`   Files to archive: ${report.filesToMove.length}`);
    console.log(`   Files to delete: ${report.filesToDelete.length}`);
    
    if (this.config.dryRun) {
      console.log('\n   🔍 DRY RUN - No actions taken');
      
      if (report.filesToMove.length > 0) {
        console.log('\n   📦 Would archive:');
        report.filesToMove.forEach(f => {
          const rel = path.relative(this.config.projectRoot, f);
          console.log(`      - ${rel}`);
        });
      }
      
      if (report.filesToDelete.length > 0) {
        console.log('\n   🗑️ Would delete:');
        report.filesToDelete.forEach(f => {
          const rel = path.relative(this.config.projectRoot, f);
          console.log(`      - ${rel}`);
        });
      }
    } else {
      if (report.actionsTaken.length > 0) {
        console.log('\n   ✅ Actions taken:');
        report.actionsTaken.forEach(a => console.log(`      - ${a}`));
      }
    }
    
    if (report.errors.length > 0) {
      console.log('\n   ❌ Errors:');
      report.errors.forEach(e => console.log(`      - ${e}`));
    }
  }

  // Manual cleanup with specific options
  async cleanupNow(options: { dryRun?: boolean; patterns?: string[] } = {}): Promise<CleanupReport> {
    const originalDryRun = this.config.dryRun;
    const originalPatterns = this.config.testFilePatterns;
    
    if (options.dryRun !== undefined) {
      this.config.dryRun = options.dryRun;
    }
    
    if (options.patterns) {
      this.config.testFilePatterns = options.patterns;
    }
    
    const report = await this.performCleanup();
    
    // Restore original config
    this.config.dryRun = originalDryRun;
    this.config.testFilePatterns = originalPatterns;
    
    return report;
  }

  // Get cleanup suggestions
  async getSuggestions(): Promise<any> {
    const report = await this.performCleanup();
    
    return {
      summary: {
        totalTestFiles: report.filesFound.length,
        filesInRoot: report.filesToMove.filter(f => {
          const rel = path.relative(this.config.projectRoot, f);
          return !rel.includes(path.sep);
        }).length,
        oldFiles: report.filesToDelete.length,
        suggestions: this.generateSuggestions(report)
      },
      details: report
    };
  }

  private generateSuggestions(report: CleanupReport): string[] {
    const suggestions: string[] = [];
    
    const rootFiles = report.filesToMove.filter(f => {
      const rel = path.relative(this.config.projectRoot, f);
      return !rel.includes(path.sep);
    });
    
    if (rootFiles.length > 0) {
      suggestions.push(`Move ${rootFiles.length} test files from root directory to proper locations`);
    }
    
    if (report.filesToDelete.length > 10) {
      suggestions.push(`Delete ${report.filesToDelete.length} old temporary files`);
    }
    
    if (report.filesFound.length > 50) {
      suggestions.push('Consider implementing a test file naming convention');
    }
    
    return suggestions;
  }
}

// Singleton instance
let cleanupService: CleanupService | null = null;

export function getCleanupService(config?: Partial<CleanupConfig>): CleanupService {
  if (!cleanupService) {
    cleanupService = new CleanupService(config);
  }
  return cleanupService;
}

// Auto-start if run directly
if (require.main === module) {
  const service = getCleanupService({ dryRun: true });
  
  console.log('Running cleanup analysis...\n');
  
  service.getSuggestions().then(suggestions => {
    console.log('📋 Cleanup Suggestions:');
    console.log(JSON.stringify(suggestions, null, 2));
    
    console.log('\nTo perform actual cleanup, run with --execute flag');
    process.exit(0);
  });
}