"use strict";
/**
 * Configuração de integração com DiegoTools MCP
 * Memory Manager = Mem0 MCP (não precisa de implementação local)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_GROUPS = exports.MCP_TOOLS = exports.MCP_CONFIG = void 0;
const path_1 = __importDefault(require("path"));
exports.MCP_CONFIG = {
    DiegoTools: {
        path: path_1.default.resolve(__dirname, '../../../mcp-diego-tools/run.sh'),
        transport: 'stdio',
        env: {
            GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
            MEM0_API_KEY: process.env.MEM0_API_KEY || '',
            MEM0_BASE_URL: process.env.MEM0_BASE_URL || 'https://api.mem0.ai'
        }
    }
};
// Mapeamento de ferramentas MCP disponíveis
exports.MCP_TOOLS = {
    // Puppeteer
    WEB_NAVIGATE: 'puppeteer_navigate',
    WEB_SCREENSHOT: 'puppeteer_screenshot',
    WEB_CLICK: 'puppeteer_click',
    WEB_TYPE: 'puppeteer_type',
    WEB_GET_CONTENT: 'puppeteer_get_content',
    // GitHub
    GITHUB_CREATE_ISSUE: 'github_create_issue',
    GITHUB_LIST_ISSUES: 'github_list_issues',
    GITHUB_CREATE_PR: 'github_create_pr',
    GITHUB_CREATE_REPO: 'github_create_repo',
    GITHUB_PUSH_FILES: 'github_push_files',
    GITHUB_COMMIT: 'github_commit',
    // Git
    GIT_STATUS: 'git_status',
    GIT_COMMIT: 'git_commit',
    GIT_PUSH: 'git_push',
    GIT_PULL: 'git_pull',
    // Mem0 - NOSSO MEMORY MANAGER!
    MEMORY_ADD: 'mem0_add_memory',
    MEMORY_SEARCH: 'mem0_search_memory',
    MEMORY_LIST: 'mem0_list_memories',
    MEMORY_DELETE: 'mem0_delete_memories'
};
// Agrupamento de ferramentas por categoria
exports.TOOL_GROUPS = {
    web: [
        exports.MCP_TOOLS.WEB_NAVIGATE,
        exports.MCP_TOOLS.WEB_SCREENSHOT,
        exports.MCP_TOOLS.WEB_CLICK,
        exports.MCP_TOOLS.WEB_TYPE,
        exports.MCP_TOOLS.WEB_GET_CONTENT
    ],
    github: [
        exports.MCP_TOOLS.GITHUB_CREATE_ISSUE,
        exports.MCP_TOOLS.GITHUB_LIST_ISSUES,
        exports.MCP_TOOLS.GITHUB_CREATE_PR,
        exports.MCP_TOOLS.GITHUB_CREATE_REPO,
        exports.MCP_TOOLS.GITHUB_PUSH_FILES
    ],
    git: [
        exports.MCP_TOOLS.GIT_STATUS,
        exports.MCP_TOOLS.GIT_COMMIT,
        exports.MCP_TOOLS.GIT_PUSH,
        exports.MCP_TOOLS.GIT_PULL
    ],
    memory: [
        exports.MCP_TOOLS.MEMORY_ADD,
        exports.MCP_TOOLS.MEMORY_SEARCH,
        exports.MCP_TOOLS.MEMORY_LIST,
        exports.MCP_TOOLS.MEMORY_DELETE
    ]
};
