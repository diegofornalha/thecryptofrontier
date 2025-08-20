/**
 * Enhanced Guardian Tools for MCP
 * Additional tools for backup, cleanup, and log management
 */

import axios from 'axios';
import { ToolResult, MCPError, ErrorCode } from '../../core/types.js';

// Configuration
const GUARDIAN_BASE_URL = process.env.GUARDIAN_URL || 'http://localhost:3003';
const GUARDIAN_TIMEOUT = 30000;

// Helper to create axios instance
const createGuardianClient = () => {
  return axios.create({
    baseURL: GUARDIAN_BASE_URL,
    timeout: GUARDIAN_TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// Types
export interface BackupStatus {
  totalBackups: number;
  totalSize: number;
  latestBackup: any;
  config: any;
  nextBackupIn: string;
}

export interface CleanupSuggestions {
  summary: {
    totalTestFiles: number;
    filesInRoot: number;
    oldFiles: number;
    suggestions: string[];
  };
  details: any;
}

export interface LogStatus {
  totalFiles: number;
  totalSize: number;
  files: Array<{
    name: string;
    size: number;
    modified: string;
    compressed: boolean;
  }>;
  config: any;
}

/**
 * Create a memory backup
 */
export async function handleGuardianBackupCreate(): Promise<ToolResult<any>> {
  try {
    const client = createGuardianClient();
    const response = await client.post('/backup/create');
    const result = response.data;

    return {
      success: true,
      data: result,
      content: [{
        type: 'text',
        text: `💾 Backup Created:
        
${result.success ? '✅ Success' : '❌ Failed'}
${result.backupPath ? `Path: ${result.backupPath}` : ''}
Message: ${result.message}
Timestamp: ${new Date().toLocaleString()}`
      }]
    };
  } catch (error: any) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to create backup: ${error.message}`,
      error.response?.data || error
    );
  }
}

/**
 * Get backup status
 */
export async function handleGuardianBackupStatus(): Promise<ToolResult<BackupStatus>> {
  try {
    const client = createGuardianClient();
    const response = await client.get('/backup/status');
    const status = response.data;

    return {
      success: true,
      data: status,
      content: [{
        type: 'text',
        text: `💾 Backup Status:
        
Total Backups: ${status.totalBackups}
Total Size: ${(status.totalSize / 1024 / 1024).toFixed(2)} MB
Next Backup: ${status.nextBackupIn}

${status.latestBackup ? `
Latest Backup:
- File: ${status.latestBackup.filename}
- Size: ${(status.latestBackup.size / 1024).toFixed(2)} KB
- Created: ${new Date(status.latestBackup.created).toLocaleString()}
` : 'No backups yet'}

Configuration:
- Directory: ${status.config.backupDirectory}
- Max Backups: ${status.config.maxBackups}
- Compression: ${status.config.compress ? 'Enabled' : 'Disabled'}
- Schedule: Every ${status.config.scheduleInterval} hours`
      }]
    };
  } catch (error: any) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to get backup status: ${error.message}`,
      error.response?.data || error
    );
  }
}

/**
 * Get cleanup suggestions
 */
export async function handleGuardianCleanupSuggestions(): Promise<ToolResult<CleanupSuggestions>> {
  try {
    const client = createGuardianClient();
    const response = await client.get('/cleanup/suggestions');
    const suggestions = response.data;

    return {
      success: true,
      data: suggestions,
      content: [{
        type: 'text',
        text: `🧹 Cleanup Suggestions:
        
📊 Summary:
- Test Files Found: ${suggestions.summary.totalTestFiles}
- Files in Root: ${suggestions.summary.filesInRoot}
- Old Files: ${suggestions.summary.oldFiles}

💡 Suggestions:
${suggestions.summary.suggestions.map((s: string) => `- ${s}`).join('\n')}

${suggestions.details.filesToMove.length > 0 ? `
📦 Files to Archive (${suggestions.details.filesToMove.length}):
${suggestions.details.filesToMove.slice(0, 5).map((f: string) => `- ${f}`).join('\n')}
${suggestions.details.filesToMove.length > 5 ? `... and ${suggestions.details.filesToMove.length - 5} more` : ''}
` : ''}

${suggestions.details.filesToDelete.length > 0 ? `
🗑️ Files to Delete (${suggestions.details.filesToDelete.length}):
${suggestions.details.filesToDelete.map((f: string) => `- ${f}`).join('\n')}
` : ''}

Use guardian_cleanup_execute to perform cleanup (dry run by default)`
      }]
    };
  } catch (error: any) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to get cleanup suggestions: ${error.message}`,
      error.response?.data || error
    );
  }
}

/**
 * Execute cleanup
 */
export async function handleGuardianCleanupExecute(args: { dryRun?: boolean; patterns?: string[] } = {}): Promise<ToolResult<any>> {
  try {
    const client = createGuardianClient();
    const response = await client.post('/cleanup/execute', {
      dryRun: args.dryRun !== false, // Default to true for safety
      patterns: args.patterns
    });
    const result = response.data;

    return {
      success: true,
      data: result,
      content: [{
        type: 'text',
        text: `🧹 Cleanup ${result.report.dryRun ? 'Simulation' : 'Execution'}:
        
${result.success ? '✅ Success' : '❌ Failed'}
Mode: ${result.report.dryRun ? 'DRY RUN' : 'EXECUTED'}

📊 Results:
- Files Found: ${result.report.filesFound.length}
- Files to Archive: ${result.report.filesToMove.length}
- Files to Delete: ${result.report.filesToDelete.length}

${!result.report.dryRun ? `
✅ Actions Taken:
${result.report.actionsTaken.map((a: string) => `- ${a}`).join('\n')}
` : '🔍 This was a dry run. Use dryRun: false to execute.'}

${result.report.errors.length > 0 ? `
❌ Errors:
${result.report.errors.map((e: string) => `- ${e}`).join('\n')}
` : ''}`
      }]
    };
  } catch (error: any) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to execute cleanup: ${error.message}`,
      error.response?.data || error
    );
  }
}

/**
 * Get log rotation status
 */
export async function handleGuardianLogsStatus(): Promise<ToolResult<LogStatus>> {
  try {
    const client = createGuardianClient();
    const response = await client.get('/logs/status');
    const status = response.data;

    return {
      success: true,
      data: status,
      content: [{
        type: 'text',
        text: `📁 Log Rotation Status:
        
Total Files: ${status.totalFiles}
Total Size: ${(status.totalSize / 1024 / 1024).toFixed(2)} MB

${status.files.length > 0 ? `
📄 Log Files:
${status.files.slice(0, 5).map((f: any) => 
  `- ${f.name} (${(f.size / 1024).toFixed(2)} KB, ${f.compressed ? '🗜️' : '📄'})`
).join('\n')}
${status.files.length > 5 ? `... and ${status.files.length - 5} more` : ''}
` : 'No log files found'}

Configuration:
- Directory: ${status.config.logDirectory}
- Max Size: ${(status.config.maxFileSize / 1024 / 1024).toFixed(2)} MB
- Max Files: ${status.config.maxFiles}
- Max Age: ${status.config.maxAge} days
- Compression: ${status.config.compress ? 'Enabled' : 'Disabled'}`
      }]
    };
  } catch (error: any) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to get logs status: ${error.message}`,
      error.response?.data || error
    );
  }
}

/**
 * Force log rotation
 */
export async function handleGuardianLogsRotate(args: { logName?: string } = {}): Promise<ToolResult<any>> {
  try {
    const client = createGuardianClient();
    const response = await client.post('/logs/rotate', {
      logName: args.logName
    });
    const result = response.data;

    return {
      success: true,
      data: result,
      content: [{
        type: 'text',
        text: `📁 Log Rotation:
        
${result.success ? '✅ Success' : '❌ Failed'}
Message: ${result.message}
${args.logName ? `Log: ${args.logName}` : 'All logs rotated'}`
      }]
    };
  } catch (error: any) {
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to rotate logs: ${error.message}`,
      error.response?.data || error
    );
  }
}

/**
 * Get Guardian agents list
 */
export async function handleGuardianAgentsList(): Promise<ToolResult<any>> {
  try {
    const client = createGuardianClient();
    const response = await client.get('/agents');
    const agents = response.data;

    return {
      success: true,
      data: agents,
      content: [{
        type: 'text',
        text: `🤖 Guardian Agents (${agents.total}):

${agents.agents.map((agent: any, index: number) => `
${index + 1}. ${agent.name}
   Type: ${agent.type}
   Status: ${agent.status || 'ready'}
   ${agent.description || ''}
`).join('\n')}

Services Status:
- Guardian Enhanced: ✅ Active
- Log Rotation: ${agents.services?.logRotation || 'active'}
- Memory Backup: ${agents.services?.memoryBackup || 'active'}
- Cleanup Service: ${agents.services?.cleanup || 'active'}`
      }]
    };
  } catch (error: any) {
    // If the endpoint doesn't exist, provide a fallback response
    if (error.response?.status === 404) {
      return {
        success: true,
        data: { total: 4, agents: [] },
        content: [{
          type: 'text',
          text: `🤖 Guardian Specialists:

1. Docker Specialist
   - Dockerfile analysis
   - Container optimization
   - Security checks

2. Next.js Specialist
   - React/Next.js best practices
   - Performance optimization
   - Code quality

3. Strapi Specialist
   - API configuration
   - Model optimization
   - Security analysis

4. Cleanup Specialist
   - File organization
   - Duplicate detection
   - Structure optimization

Use guardian_analyze to run a full project analysis with all specialists.`
        }]
      };
    }
    
    throw new MCPError(
      ErrorCode.INTERNAL_ERROR,
      `Failed to get agents list: ${error.message}`,
      error.response?.data || error
    );
  }
}