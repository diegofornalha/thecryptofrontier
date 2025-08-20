/**
 * Type definitions for MCP Puppeteer + GitHub Server
 */
// ==================== Enums ====================
export var ToolName;
(function (ToolName) {
    // Puppeteer Tools
    ToolName["PUPPETEER_NAVIGATE"] = "puppeteer_navigate";
    ToolName["PUPPETEER_SCREENSHOT"] = "puppeteer_screenshot";
    ToolName["PUPPETEER_CLICK"] = "puppeteer_click";
    ToolName["PUPPETEER_TYPE"] = "puppeteer_type";
    ToolName["PUPPETEER_GET_CONTENT"] = "puppeteer_get_content";
    // Git Local Tools
    ToolName["GIT_STATUS"] = "git_status";
    ToolName["GIT_COMMIT"] = "git_commit";
    ToolName["GIT_PUSH"] = "git_push";
    ToolName["GIT_PULL"] = "git_pull";
    // Mem0 Memory Tools
    ToolName["MEM0_ADD_MEMORY"] = "mem0_add_memory";
    ToolName["MEM0_SEARCH_MEMORY"] = "mem0_search_memory";
    ToolName["MEM0_LIST_MEMORIES"] = "mem0_list_memories";
    ToolName["MEM0_DELETE_MEMORIES"] = "mem0_delete_memories";
    // Guardian Organization Tools
    ToolName["GUARDIAN_ANALYZE"] = "guardian_analyze";
    ToolName["GUARDIAN_STATUS"] = "guardian_status";
    ToolName["GUARDIAN_HISTORY"] = "guardian_history";
    ToolName["GUARDIAN_HEALTH"] = "guardian_health";
    ToolName["GUARDIAN_BACKUP_CREATE"] = "guardian_backup_create";
    ToolName["GUARDIAN_BACKUP_STATUS"] = "guardian_backup_status";
    ToolName["GUARDIAN_CLEANUP_SUGGESTIONS"] = "guardian_cleanup_suggestions";
    ToolName["GUARDIAN_CLEANUP_EXECUTE"] = "guardian_cleanup_execute";
    ToolName["GUARDIAN_LOGS_STATUS"] = "guardian_logs_status";
    ToolName["GUARDIAN_LOGS_ROTATE"] = "guardian_logs_rotate";
    ToolName["GUARDIAN_AGENTS_LIST"] = "guardian_agents_list";
    // Agent Management Tools
    ToolName["AGENTS_LIST"] = "agents_list";
})(ToolName || (ToolName = {}));
export var IssueState;
(function (IssueState) {
    IssueState["OPEN"] = "open";
    IssueState["CLOSED"] = "closed";
    IssueState["ALL"] = "all";
})(IssueState || (IssueState = {}));
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
// ==================== Error Types ====================
export var ErrorCode;
(function (ErrorCode) {
    // General errors
    ErrorCode["UNKNOWN"] = "UNKNOWN";
    ErrorCode["INVALID_PARAMS"] = "INVALID_PARAMS";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorCode["METHOD_NOT_FOUND"] = "METHOD_NOT_FOUND";
    // Puppeteer errors
    ErrorCode["BROWSER_NOT_INITIALIZED"] = "BROWSER_NOT_INITIALIZED";
    ErrorCode["PAGE_LOAD_FAILED"] = "PAGE_LOAD_FAILED";
    ErrorCode["ELEMENT_NOT_FOUND"] = "ELEMENT_NOT_FOUND";
    ErrorCode["SCREENSHOT_FAILED"] = "SCREENSHOT_FAILED";
})(ErrorCode || (ErrorCode = {}));
export class MCPError extends Error {
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'MCPError';
    }
}
// ==================== Type Guards ====================
export function isNavigateParams(params) {
    return typeof (params === null || params === void 0 ? void 0 : params.url) === 'string';
}
export function isScreenshotParams(params) {
    return typeof (params === null || params === void 0 ? void 0 : params.path) === 'string';
}
export function isMCPError(error) {
    return error instanceof MCPError;
}
