import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as zlib from 'zlib';

const gzip = promisify(zlib.gzip);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

export interface LogRotationConfig {
  logDirectory: string;
  maxFileSize: number; // bytes
  maxFiles: number;
  maxAge: number; // days
  compress: boolean;
  datePattern: string;
}

export class LogRotationService {
  private config: LogRotationConfig;
  private rotationInterval: NodeJS.Timer | null = null;

  constructor(config: Partial<LogRotationConfig> = {}) {
    this.config = {
      logDirectory: config.logDirectory || '/app/logs',
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxFiles: config.maxFiles || 10,
      maxAge: config.maxAge || 30, // 30 days
      compress: config.compress !== false,
      datePattern: config.datePattern || 'YYYY-MM-DD'
    };
  }

  async start(intervalMinutes: number = 60) {
    console.log(`🔄 Starting log rotation service (checking every ${intervalMinutes} minutes)`);
    
    // Initial rotation check
    await this.rotateAllLogs();
    
    // Schedule periodic checks
    this.rotationInterval = setInterval(async () => {
      await this.rotateAllLogs();
    }, intervalMinutes * 60 * 1000);
  }

  stop() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
      console.log('🛑 Log rotation service stopped');
    }
  }

  async rotateAllLogs() {
    try {
      const files = await readdir(this.config.logDirectory);
      const logFiles = files.filter(f => f.endsWith('.log'));
      
      for (const file of logFiles) {
        await this.rotateLogIfNeeded(path.join(this.config.logDirectory, file));
      }
      
      await this.cleanupOldLogs();
    } catch (error) {
      console.error('Error during log rotation:', error);
    }
  }

  private async rotateLogIfNeeded(filePath: string) {
    try {
      const stats = await stat(filePath);
      
      if (stats.size > this.config.maxFileSize) {
        await this.rotateLog(filePath);
      }
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error(`Error checking log file ${filePath}:`, error);
      }
    }
  }

  private async rotateLog(filePath: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = path.basename(filePath, '.log');
    const dir = path.dirname(filePath);
    const rotatedName = `${baseName}-${timestamp}.log`;
    const rotatedPath = path.join(dir, rotatedName);
    
    console.log(`📁 Rotating log: ${baseName}.log → ${rotatedName}`);
    
    try {
      // Rename current log file
      await rename(filePath, rotatedPath);
      
      // Create new empty log file
      await writeFile(filePath, '');
      
      // Compress if enabled
      if (this.config.compress) {
        await this.compressLog(rotatedPath);
      }
    } catch (error) {
      console.error(`Error rotating log ${filePath}:`, error);
    }
  }

  private async compressLog(filePath: string) {
    try {
      const content = await readFile(filePath);
      const compressed = await gzip(content);
      const gzPath = `${filePath}.gz`;
      
      await writeFile(gzPath, compressed);
      await unlink(filePath);
      
      console.log(`🗜️ Compressed: ${path.basename(filePath)} → ${path.basename(gzPath)}`);
    } catch (error) {
      console.error(`Error compressing log ${filePath}:`, error);
    }
  }

  private async cleanupOldLogs() {
    try {
      const files = await readdir(this.config.logDirectory);
      const logFiles = files.filter(f => 
        f.match(/\.(log|log\.gz)$/) && 
        f.includes('-') // rotated files have timestamps
      );
      
      const now = Date.now();
      const maxAgeMs = this.config.maxAge * 24 * 60 * 60 * 1000;
      
      for (const file of logFiles) {
        const filePath = path.join(this.config.logDirectory, file);
        const stats = await stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAgeMs) {
          await unlink(filePath);
          console.log(`🗑️ Deleted old log: ${file}`);
        }
      }
      
      // Keep only maxFiles number of logs per base name
      await this.enforceMaxFiles();
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
    }
  }

  private async enforceMaxFiles() {
    try {
      const files = await readdir(this.config.logDirectory);
      const logGroups = new Map<string, string[]>();
      
      // Group files by base name
      for (const file of files) {
        if (file.match(/\.(log|log\.gz)$/) && file.includes('-')) {
          const baseName = file.split('-')[0];
          if (!logGroups.has(baseName)) {
            logGroups.set(baseName, []);
          }
          logGroups.get(baseName)!.push(file);
        }
      }
      
      // Sort and keep only maxFiles per group
      for (const [baseName, groupFiles] of logGroups) {
        if (groupFiles.length > this.config.maxFiles) {
          const sorted = groupFiles.sort((a, b) => {
            const timeA = this.extractTimestamp(a);
            const timeB = this.extractTimestamp(b);
            return timeB.localeCompare(timeA); // newest first
          });
          
          const toDelete = sorted.slice(this.config.maxFiles);
          for (const file of toDelete) {
            const filePath = path.join(this.config.logDirectory, file);
            await unlink(filePath);
            console.log(`🗑️ Deleted excess log: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error enforcing max files:', error);
    }
  }

  private extractTimestamp(filename: string): string {
    const match = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
    return match ? match[1] : '';
  }

  // Manual rotation method
  async rotateNow(logName?: string) {
    if (logName) {
      const filePath = path.join(this.config.logDirectory, logName);
      await this.rotateLog(filePath);
    } else {
      await this.rotateAllLogs();
    }
  }

  // Get current status
  async getStatus() {
    try {
      const files = await readdir(this.config.logDirectory);
      const logFiles = files.filter(f => f.match(/\.(log|log\.gz)$/));
      
      const fileStats = await Promise.all(
        logFiles.map(async (file) => {
          const filePath = path.join(this.config.logDirectory, file);
          const stats = await stat(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime,
            compressed: file.endsWith('.gz')
          };
        })
      );
      
      return {
        totalFiles: logFiles.length,
        totalSize: fileStats.reduce((sum, f) => sum + f.size, 0),
        files: fileStats.sort((a, b) => b.modified.getTime() - a.modified.getTime()),
        config: this.config
      };
    } catch (error) {
      console.error('Error getting rotation status:', error);
      return null;
    }
  }
}

// Singleton instance
let rotationService: LogRotationService | null = null;

export function getLogRotationService(config?: Partial<LogRotationConfig>): LogRotationService {
  if (!rotationService) {
    rotationService = new LogRotationService(config);
  }
  return rotationService;
}

// Auto-start if run directly
if (require.main === module) {
  const service = getLogRotationService();
  service.start(5); // Check every 5 minutes for testing
  
  console.log('Log rotation service started. Press Ctrl+C to stop.');
  
  process.on('SIGINT', () => {
    service.stop();
    process.exit(0);
  });
}