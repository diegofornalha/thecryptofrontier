/**
 * Tools index - Re-export from core
 */
// Re-export everything from core/handlers
export * from '../core/handlers.js';
// Export tool definitions from core
import { ToolName } from '../core/types.js';
import { ToolFactory } from '../core/factory.js';
import { handleNavigate, handleScreenshot, handleClick, handleType, handleGetContent, } from '../core/handlers.js';
import { handleAddMemory, handleSearchMemory, handleListMemories, handleDeleteMemories } from './mem0/index.js';
import { handleGuardianAnalyze, handleGuardianStatus, handleGuardianHistory, handleGuardianHealth } from './guardian/index.js';
import { handleGuardianBackupCreate, handleGuardianBackupStatus, handleGuardianCleanupSuggestions, handleGuardianCleanupExecute, handleGuardianLogsStatus, handleGuardianLogsRotate, handleGuardianAgentsList } from './guardian/enhanced-tools.js';
import { handleAgentsList } from './agents/index.js';
// Get all tools from factory
export const allTools = ToolFactory.getAll();
// Create tool handlers map
export const toolHandlers = {
    [ToolName.PUPPETEER_NAVIGATE]: handleNavigate,
    [ToolName.PUPPETEER_SCREENSHOT]: handleScreenshot,
    [ToolName.PUPPETEER_CLICK]: handleClick,
    [ToolName.PUPPETEER_TYPE]: handleType,
    [ToolName.PUPPETEER_GET_CONTENT]: handleGetContent,
    [ToolName.MEM0_ADD_MEMORY]: handleAddMemory,
    [ToolName.MEM0_SEARCH_MEMORY]: handleSearchMemory,
    [ToolName.MEM0_LIST_MEMORIES]: handleListMemories,
    [ToolName.MEM0_DELETE_MEMORIES]: handleDeleteMemories,
    [ToolName.GUARDIAN_ANALYZE]: handleGuardianAnalyze,
    [ToolName.GUARDIAN_STATUS]: handleGuardianStatus,
    [ToolName.GUARDIAN_HISTORY]: handleGuardianHistory,
    [ToolName.GUARDIAN_HEALTH]: handleGuardianHealth,
    [ToolName.GUARDIAN_BACKUP_CREATE]: handleGuardianBackupCreate,
    [ToolName.GUARDIAN_BACKUP_STATUS]: handleGuardianBackupStatus,
    [ToolName.GUARDIAN_CLEANUP_SUGGESTIONS]: handleGuardianCleanupSuggestions,
    [ToolName.GUARDIAN_CLEANUP_EXECUTE]: handleGuardianCleanupExecute,
    [ToolName.GUARDIAN_LOGS_STATUS]: handleGuardianLogsStatus,
    [ToolName.GUARDIAN_LOGS_ROTATE]: handleGuardianLogsRotate,
    [ToolName.GUARDIAN_AGENTS_LIST]: handleGuardianAgentsList,
    [ToolName.AGENTS_LIST]: handleAgentsList
};
// Browser cleanup function
export function startBrowserCleanup() {
    // Cleanup will be handled by the handlers
    const interval = 300000; // 5 minutes
    setInterval(() => {
        // Check if browser needs cleanup
        if (global.gc) {
            global.gc();
        }
    }, interval);
}
