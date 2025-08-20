/**
 * Zod schemas for input validation
 */
import { z } from 'zod';
// ==================== Puppeteer Schemas ====================
export const NavigateSchema = z.object({
    url: z.string().url('URL deve ser válida')
});
export const ScreenshotSchema = z.object({
    path: z.string().min(1, 'Path é obrigatório'),
    fullPage: z.boolean().optional().default(false)
});
export const ClickSchema = z.object({
    selector: z.string().min(1, 'Selector é obrigatório')
});
export const TypeSchema = z.object({
    selector: z.string().min(1, 'Selector é obrigatório'),
    text: z.string().min(1, 'Text é obrigatório')
});
// Git Local Schemas
export const GitStatusSchema = z.object({
    detailed: z.boolean().optional().default(false)
});
export const GitCommitSchema = z.object({
    message: z.string().min(1, 'Mensagem de commit é obrigatória'),
    addAll: z.boolean().optional().default(true),
    files: z.array(z.string()).optional()
});
export const GitPushSchema = z.object({
    branch: z.string().optional(),
    force: z.boolean().optional().default(false),
    upstream: z.boolean().optional().default(false)
});
export const GitPullSchema = z.object({
    branch: z.string().optional(),
    rebase: z.boolean().optional().default(false)
});
// ==================== Mem0 Memory Schemas ====================
export const AddMemorySchema = z.object({
    content: z.string().min(1, 'Conteúdo da memória é obrigatório'),
    user_id: z.string().min(1, 'ID do usuário é obrigatório'),
    metadata: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional()
});
export const SearchMemorySchema = z.object({
    query: z.string().min(1, 'Query de busca é obrigatória'),
    user_id: z.string().min(1, 'ID do usuário é obrigatório'),
    limit: z.number().int().positive().max(100).optional().default(10),
    filters: z.record(z.any()).optional()
});
export const ListMemoriesSchema = z.object({
    user_id: z.string().min(1, 'ID do usuário é obrigatório'),
    limit: z.number().int().positive().max(100).optional().default(50)
});
export const DeleteMemoriesSchema = z.object({
    user_id: z.string().min(1, 'ID do usuário é obrigatório'),
    memory_id: z.string().optional()
});
// ==================== Guardian Organization Schemas ====================
export const GuardianAnalyzeSchema = z.object({
    projectPath: z.string().min(1, 'Project path é obrigatório'),
    mode: z.enum(['single', 'continuous']).optional().default('single')
});
export const GuardianHistorySchema = z.object({
    limit: z.number().min(1).max(100).optional().default(10)
});
// ==================== Schema Map ====================
import { ToolName } from './types.js';
export const ToolSchemas = {
    [ToolName.PUPPETEER_NAVIGATE]: NavigateSchema,
    [ToolName.PUPPETEER_SCREENSHOT]: ScreenshotSchema,
    [ToolName.PUPPETEER_CLICK]: ClickSchema,
    [ToolName.PUPPETEER_TYPE]: TypeSchema,
    [ToolName.PUPPETEER_GET_CONTENT]: z.object({}),
    [ToolName.GIT_STATUS]: GitStatusSchema,
    [ToolName.GIT_COMMIT]: GitCommitSchema,
    [ToolName.GIT_PUSH]: GitPushSchema,
    [ToolName.GIT_PULL]: GitPullSchema,
    [ToolName.MEM0_ADD_MEMORY]: AddMemorySchema,
    [ToolName.MEM0_SEARCH_MEMORY]: SearchMemorySchema,
    [ToolName.MEM0_LIST_MEMORIES]: ListMemoriesSchema,
    [ToolName.MEM0_DELETE_MEMORIES]: DeleteMemoriesSchema,
    [ToolName.GUARDIAN_ANALYZE]: GuardianAnalyzeSchema,
    [ToolName.GUARDIAN_STATUS]: z.object({}),
    [ToolName.GUARDIAN_HISTORY]: GuardianHistorySchema,
    [ToolName.GUARDIAN_HEALTH]: z.object({}),
    [ToolName.GUARDIAN_BACKUP_CREATE]: z.object({}),
    [ToolName.GUARDIAN_BACKUP_STATUS]: z.object({}),
    [ToolName.GUARDIAN_CLEANUP_SUGGESTIONS]: z.object({}),
    [ToolName.GUARDIAN_CLEANUP_EXECUTE]: z.object({
        dryRun: z.boolean().optional(),
        patterns: z.array(z.string()).optional()
    }),
    [ToolName.GUARDIAN_LOGS_STATUS]: z.object({}),
    [ToolName.GUARDIAN_LOGS_ROTATE]: z.object({
        logName: z.string().optional()
    }),
    [ToolName.GUARDIAN_AGENTS_LIST]: z.object({}),
    [ToolName.AGENTS_LIST]: z.object({})
};
// ==================== Validation Helper ====================
export function validateToolInput(toolName, input) {
    const schema = ToolSchemas[toolName];
    try {
        return schema.parse(input);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            throw new Error(`Validação falhou:\n${messages.join('\n')}`);
        }
        throw error;
    }
}
