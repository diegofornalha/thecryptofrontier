/**
 * Factory pattern for tool creation in DiegoTools
 */
import { ToolName } from './types.js';
import { ToolSchemas } from './schemas.js';
import { handleNavigate, handleScreenshot, handleClick, handleType, handleGetContent, } from './handlers.js';
import { handleAddMemory, handleSearchMemory, handleListMemories, handleDeleteMemories } from '../tools/mem0/index.js';
import { handleGuardianAnalyze, handleGuardianStatus, handleGuardianHistory, handleGuardianHealth } from '../tools/guardian/index.js';
import { handleGuardianBackupCreate, handleGuardianBackupStatus, handleGuardianCleanupSuggestions, handleGuardianCleanupExecute, handleGuardianLogsStatus, handleGuardianLogsRotate, handleGuardianAgentsList } from '../tools/guardian/enhanced-tools.js';
import { handleAgentsList } from '../tools/agents/index.js';
export class ToolFactory {
    /**
     * Register a new tool
     */
    static register(config) {
        this.tools.set(config.name, config);
    }
    /**
     * Create a tool definition
     */
    static create(name) {
        const config = this.tools.get(name);
        if (!config)
            return null;
        const schema = config.schema || ToolSchemas[name];
        return {
            name: config.name,
            description: config.description,
            inputSchema: {
                type: 'object',
                properties: this.schemaToProperties(schema),
                required: this.getRequiredFields(schema)
            },
            handler: config.handler
        };
    }
    /**
     * Get all registered tools
     */
    static getAll() {
        return Array.from(this.tools.keys())
            .map(name => this.create(name))
            .filter((tool) => tool !== null);
    }
    /**
     * Get tools by category
     */
    static getByCategory(category) {
        return Array.from(this.tools.entries())
            .filter(([_, config]) => { var _a; return ((_a = config.metadata) === null || _a === void 0 ? void 0 : _a.category) === category; })
            .map(([name, _]) => this.create(name))
            .filter((tool) => tool !== null);
    }
    /**
     * Convert Zod schema to JSON Schema properties
     */
    static schemaToProperties(schema) {
        var _a, _b;
        if (!schema || !schema._def)
            return {};
        const shape = ((_b = (_a = schema._def).shape) === null || _b === void 0 ? void 0 : _b.call(_a)) || {};
        const properties = {};
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = this.zodToJsonSchema(value);
        }
        return properties;
    }
    /**
     * Get required fields from Zod schema
     */
    static getRequiredFields(schema) {
        var _a, _b;
        if (!schema || !schema._def)
            return [];
        const shape = ((_b = (_a = schema._def).shape) === null || _b === void 0 ? void 0 : _b.call(_a)) || {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            const zodSchema = value;
            if (!zodSchema.isOptional()) {
                required.push(key);
            }
        }
        return required;
    }
    /**
     * Convert Zod type to JSON Schema
     */
    static zodToJsonSchema(zod) {
        const typeName = zod._def.typeName;
        switch (typeName) {
            case 'ZodString':
                return { type: 'string' };
            case 'ZodNumber':
                return { type: 'number' };
            case 'ZodBoolean':
                return { type: 'boolean' };
            case 'ZodArray':
                return {
                    type: 'array',
                    items: this.zodToJsonSchema(zod._def.type)
                };
            case 'ZodEnum':
                return {
                    type: 'string',
                    enum: zod._def.values
                };
            case 'ZodOptional':
                return this.zodToJsonSchema(zod._def.innerType);
            default:
                return { type: 'string' };
        }
    }
}
ToolFactory.tools = new Map();
// ==================== Register Built-in Tools ====================
// Puppeteer Tools
ToolFactory.register({
    name: ToolName.PUPPETEER_NAVIGATE,
    description: 'Navigate to a URL',
    handler: handleNavigate,
    metadata: {
        category: 'puppeteer',
        isReadOnly: false,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.PUPPETEER_SCREENSHOT,
    description: 'Take a screenshot of the current page',
    handler: handleScreenshot,
    metadata: {
        category: 'puppeteer',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.PUPPETEER_CLICK,
    description: 'Click on an element',
    handler: handleClick,
    metadata: {
        category: 'puppeteer',
        isReadOnly: false,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.PUPPETEER_TYPE,
    description: 'Type text into an element',
    handler: handleType,
    metadata: {
        category: 'puppeteer',
        isReadOnly: false,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.PUPPETEER_GET_CONTENT,
    description: 'Get the HTML content of the current page',
    handler: handleGetContent,
    metadata: {
        category: 'puppeteer',
        isReadOnly: true,
        requiresAuth: false
    }
});
// Mem0 Memory Tools
ToolFactory.register({
    name: ToolName.MEM0_ADD_MEMORY,
    description: 'Add a memory to Mem0',
    handler: handleAddMemory,
    metadata: {
        category: 'utility',
        isReadOnly: false,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.MEM0_SEARCH_MEMORY,
    description: 'Search memories in Mem0',
    handler: handleSearchMemory,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.MEM0_LIST_MEMORIES,
    description: 'List all memories for a user',
    handler: handleListMemories,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.MEM0_DELETE_MEMORIES,
    description: 'Delete memories from Mem0',
    handler: handleDeleteMemories,
    metadata: {
        category: 'utility',
        isReadOnly: false,
        isDestructive: true,
        requiresAuth: false
    }
});
// Guardian Organization Tools
ToolFactory.register({
    name: ToolName.GUARDIAN_ANALYZE,
    description: 'Analyze project organization and get improvement suggestions',
    handler: handleGuardianAnalyze,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_STATUS,
    description: 'Get Guardian service status and connection info',
    handler: handleGuardianStatus,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_HISTORY,
    description: 'Get history of Guardian analyses',
    handler: handleGuardianHistory,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_HEALTH,
    description: 'Check Guardian service health',
    handler: handleGuardianHealth,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
// Guardian Enhanced Tools
ToolFactory.register({
    name: ToolName.GUARDIAN_BACKUP_CREATE,
    description: 'Create a backup of all memories',
    handler: handleGuardianBackupCreate,
    metadata: {
        category: 'utility',
        isReadOnly: false,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_BACKUP_STATUS,
    description: 'Get backup service status and configuration',
    handler: handleGuardianBackupStatus,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_CLEANUP_SUGGESTIONS,
    description: 'Get cleanup suggestions for test and temporary files',
    handler: handleGuardianCleanupSuggestions,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_CLEANUP_EXECUTE,
    description: 'Execute cleanup of test and temporary files',
    handler: handleGuardianCleanupExecute,
    metadata: {
        category: 'utility',
        isReadOnly: false,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_LOGS_STATUS,
    description: 'Get log rotation service status',
    handler: handleGuardianLogsStatus,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_LOGS_ROTATE,
    description: 'Force rotation of log files',
    handler: handleGuardianLogsRotate,
    metadata: {
        category: 'utility',
        isReadOnly: false,
        requiresAuth: false
    }
});
ToolFactory.register({
    name: ToolName.GUARDIAN_AGENTS_LIST,
    description: 'List all Guardian agents and specialists',
    handler: handleGuardianAgentsList,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
// Agent Management Tools
ToolFactory.register({
    name: ToolName.AGENTS_LIST,
    description: 'List all available agents in the system',
    handler: handleAgentsList,
    metadata: {
        category: 'utility',
        isReadOnly: true,
        requiresAuth: false
    }
});
// ==================== Extensibility Example ====================
/**
 * Example of how to add a new tool
 *
 * @example
 * ```typescript
 * // In a separate file or plugin
 * import { ToolFactory, ToolName } from './factory.js';
 *
 * // Add to ToolName enum first
 * // Then register:
 * ToolFactory.register({
 *   name: ToolName.MY_CUSTOM_TOOL,
 *   description: 'My custom tool description',
 *   handler: async (args) => {
 *     // Tool implementation
 *     return { content: [{ type: 'text', text: 'Result' }] };
 *   },
 *   metadata: {
 *     category: 'utility',
 *     isReadOnly: true
 *   }
 * });
 * ```
 */ 
