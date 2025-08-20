import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as zlib from 'zlib';
import axios from 'axios';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface BackupConfig {
  backupDirectory: string;
  mem0Url: string;
  maxBackups: number;
  compress: boolean;
  includeMetadata: boolean;
  scheduleInterval: number; // hours
}

export interface BackupMetadata {
  timestamp: string;
  version: string;
  totalMemories: number;
  users: string[];
  categories: string[];
  compressed: boolean;
  checksum?: string;
}

export class MemoryBackupService {
  private config: BackupConfig;
  private backupInterval: NodeJS.Timer | null = null;

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      backupDirectory: config.backupDirectory || '/app/backups',
      mem0Url: config.mem0Url || 'http://mem0-local:3002',
      maxBackups: config.maxBackups || 7, // Keep 7 days of backups
      compress: config.compress !== false,
      includeMetadata: config.includeMetadata !== false,
      scheduleInterval: config.scheduleInterval || 24 // Daily backups
    };
  }

  async start() {
    console.log(`💾 Starting memory backup service (every ${this.config.scheduleInterval} hours)`);
    
    // Ensure backup directory exists
    await this.ensureDirectory(this.config.backupDirectory);
    
    // Initial backup
    await this.performBackup();
    
    // Schedule periodic backups
    this.backupInterval = setInterval(async () => {
      await this.performBackup();
    }, this.config.scheduleInterval * 60 * 60 * 1000);
  }

  stop() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('🛑 Memory backup service stopped');
    }
  }

  async performBackup(): Promise<string | null> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `memory-backup-${timestamp}`;
    
    console.log(`🔄 Starting backup: ${backupName}`);
    
    try {
      // Fetch all memories
      const memories = await this.fetchAllMemories();
      
      if (!memories || memories.length === 0) {
        console.warn('⚠️ No memories to backup');
        return null;
      }
      
      // Prepare backup data
      const backupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        memories: memories,
        metadata: await this.collectMetadata(memories)
      };
      
      // Save backup
      const backupPath = await this.saveBackup(backupName, backupData);
      
      // Cleanup old backups
      await this.cleanupOldBackups();
      
      console.log(`✅ Backup completed: ${backupName} (${memories.length} memories)`);
      
      return backupPath;
    } catch (error) {
      console.error(`❌ Backup failed: ${error}`);
      return null;
    }
  }

  private async fetchAllMemories(): Promise<any[]> {
    try {
      // First, get list of all users
      const usersResponse = await axios.get(`${this.config.mem0Url}/v1/memories`);
      const allMemories = usersResponse.data.data || [];
      
      // Get unique user IDs
      const userIds = new Set(allMemories.map((m: any) => m.user_id));
      
      // Fetch memories for each user
      const memoriesByUser = await Promise.all(
        Array.from(userIds).map(async (userId) => {
          try {
            const response = await axios.get(`${this.config.mem0Url}/v1/memories`, {
              params: { user_id: userId }
            });
            return response.data.data || [];
          } catch (error) {
            console.error(`Error fetching memories for user ${userId}:`, error);
            return [];
          }
        })
      );
      
      // Flatten and deduplicate
      const allFetchedMemories = memoriesByUser.flat();
      const uniqueMemories = this.deduplicateMemories(allFetchedMemories);
      
      return uniqueMemories;
    } catch (error) {
      console.error('Error fetching memories:', error);
      return [];
    }
  }

  private deduplicateMemories(memories: any[]): any[] {
    const seen = new Set<string>();
    return memories.filter(memory => {
      const key = memory.id || `${memory.user_id}-${memory.content}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async collectMetadata(memories: any[]): Promise<BackupMetadata> {
    const users = new Set<string>();
    const categories = new Set<string>();
    
    memories.forEach(memory => {
      if (memory.user_id) users.add(memory.user_id);
      if (memory.category) categories.add(memory.category);
      if (memory.metadata?.category) categories.add(memory.metadata.category);
    });
    
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      totalMemories: memories.length,
      users: Array.from(users),
      categories: Array.from(categories),
      compressed: this.config.compress
    };
  }

  private async saveBackup(backupName: string, data: any): Promise<string> {
    const jsonData = JSON.stringify(data, null, 2);
    let backupPath: string;
    
    if (this.config.compress) {
      const compressed = await gzip(Buffer.from(jsonData));
      backupPath = path.join(this.config.backupDirectory, `${backupName}.json.gz`);
      await writeFile(backupPath, compressed);
    } else {
      backupPath = path.join(this.config.backupDirectory, `${backupName}.json`);
      await writeFile(backupPath, jsonData);
    }
    
    // Save metadata separately for quick access
    if (this.config.includeMetadata) {
      const metadataPath = path.join(this.config.backupDirectory, `${backupName}.meta.json`);
      await writeFile(metadataPath, JSON.stringify(data.metadata, null, 2));
    }
    
    return backupPath;
  }

  private async cleanupOldBackups() {
    try {
      const files = await readdir(this.config.backupDirectory);
      const backupFiles = files.filter(f => 
        f.startsWith('memory-backup-') && 
        (f.endsWith('.json') || f.endsWith('.json.gz'))
      );
      
      if (backupFiles.length <= this.config.maxBackups) {
        return;
      }
      
      // Sort by timestamp (newest first)
      const sorted = backupFiles.sort((a, b) => {
        const timeA = this.extractBackupTimestamp(a);
        const timeB = this.extractBackupTimestamp(b);
        return timeB.localeCompare(timeA);
      });
      
      // Delete old backups
      const toDelete = sorted.slice(this.config.maxBackups);
      for (const file of toDelete) {
        const filePath = path.join(this.config.backupDirectory, file);
        await unlink(filePath);
        
        // Also delete metadata file if exists
        const metaFile = file.replace(/\.json(\.gz)?$/, '.meta.json');
        const metaPath = path.join(this.config.backupDirectory, metaFile);
        try {
          await unlink(metaPath);
        } catch (error) {
          // Ignore if metadata file doesn't exist
        }
        
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  private extractBackupTimestamp(filename: string): string {
    const match = filename.match(/memory-backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
    return match ? match[1] : '';
  }

  async restoreBackup(backupPath: string): Promise<boolean> {
    console.log(`🔄 Restoring backup from: ${backupPath}`);
    
    try {
      let data: any;
      
      if (backupPath.endsWith('.gz')) {
        const compressed = await readFile(backupPath);
        const decompressed = await gunzip(compressed);
        data = JSON.parse(decompressed.toString());
      } else {
        const content = await readFile(backupPath, 'utf-8');
        data = JSON.parse(content);
      }
      
      const memories = data.memories || [];
      let restored = 0;
      let failed = 0;
      
      // Restore each memory
      for (const memory of memories) {
        try {
          await axios.post(`${this.config.mem0Url}/v1/memories`, {
            content: memory.content,
            user_id: memory.user_id,
            metadata: memory.metadata || {},
            category: memory.category
          });
          restored++;
        } catch (error) {
          console.error(`Failed to restore memory ${memory.id}:`, error);
          failed++;
        }
      }
      
      console.log(`✅ Restore completed: ${restored} restored, ${failed} failed`);
      
      return failed === 0;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  async listBackups(): Promise<any[]> {
    try {
      const files = await readdir(this.config.backupDirectory);
      const backupFiles = files.filter(f => 
        f.startsWith('memory-backup-') && 
        (f.endsWith('.json') || f.endsWith('.json.gz'))
      );
      
      const backups = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = path.join(this.config.backupDirectory, file);
          const stats = await stat(filePath);
          
          // Try to load metadata
          let metadata = null;
          const metaFile = file.replace(/\.json(\.gz)?$/, '.meta.json');
          const metaPath = path.join(this.config.backupDirectory, metaFile);
          try {
            const metaContent = await readFile(metaPath, 'utf-8');
            metadata = JSON.parse(metaContent);
          } catch (error) {
            // Metadata file might not exist
          }
          
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.mtime,
            compressed: file.endsWith('.gz'),
            metadata
          };
        })
      );
      
      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  async getBackupStatus() {
    const backups = await this.listBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    
    return {
      totalBackups: backups.length,
      totalSize,
      latestBackup: backups[0] || null,
      config: this.config,
      nextBackupIn: this.getNextBackupTime()
    };
  }

  private getNextBackupTime(): string {
    if (!this.backupInterval) {
      return 'Not scheduled';
    }
    
    const nextTime = new Date();
    nextTime.setHours(nextTime.getHours() + this.config.scheduleInterval);
    return nextTime.toISOString();
  }

  private async ensureDirectory(dir: string) {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
}

// Singleton instance
let backupService: MemoryBackupService | null = null;

export function getMemoryBackupService(config?: Partial<BackupConfig>): MemoryBackupService {
  if (!backupService) {
    backupService = new MemoryBackupService(config);
  }
  return backupService;
}

// Manual backup command
export async function performManualBackup(): Promise<void> {
  const service = getMemoryBackupService();
  const backupPath = await service.performBackup();
  if (backupPath) {
    console.log(`Manual backup saved to: ${backupPath}`);
  }
}

// Auto-start if run directly
if (require.main === module) {
  const service = getMemoryBackupService();
  service.start();
  
  console.log('Memory backup service started. Press Ctrl+C to stop.');
  
  process.on('SIGINT', () => {
    service.stop();
    process.exit(0);
  });
}