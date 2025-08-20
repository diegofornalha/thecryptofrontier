/**
 * Guardian Organization Tools for MCP
 * Integrates with the Universal Organization Guardian service
 */
import axios from 'axios';
import { MCPError, ErrorCode } from '../../core/types.js';
// Configuration
const GUARDIAN_BASE_URL = process.env.GUARDIAN_URL || 'http://localhost:3003';
const GUARDIAN_TIMEOUT = 30000; // 30 seconds
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
/**
 * Analyze a project's organization
 */
export async function handleGuardianAnalyze(args) {
    var _a, _b;
    try {
        const client = createGuardianClient();
        // Validate project path
        if (!args.projectPath || typeof args.projectPath !== 'string') {
            throw new MCPError(ErrorCode.INVALID_PARAMS, 'Project path is required and must be a string');
        }
        // Make request to Guardian
        const response = await client.post('/analyze', {
            projectPath: args.projectPath,
            mode: args.mode || 'single'
        });
        const result = response.data;
        return {
            success: true,
            data: result,
            content: [{
                    type: 'text',
                    text: `📊 Guardian Analysis Complete:
        
Project: ${result.projectPath}
Type: ${result.projectType}
Score: ${result.score}/${result.maxScore} (${result.score}%)

📈 Statistics:
- Total files: ${result.stats.totalFiles}
- Well organized: ${result.stats.wellOrganizedFiles}
- Need attention: ${result.stats.filesNeedingAttention}

${result.issues.length > 0 ? `\n🔍 Issues Found:\n${result.issues.map((issue) => `- ${issue.description} (${issue.severity}, -${issue.points} points)`).join('\n')}` : '\n✅ No issues found!'}

💡 Recommendations:
${result.recommendations.join('\n')}`
                }]
        };
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
            throw new MCPError(ErrorCode.NOT_FOUND, 'Guardian service not found. Make sure it is running on ' + GUARDIAN_BASE_URL);
        }
        throw new MCPError(ErrorCode.INTERNAL_ERROR, `Guardian analysis failed: ${error.message}`, ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error);
    }
}
/**
 * Get Guardian service status
 */
export async function handleGuardianStatus() {
    var _a;
    try {
        const client = createGuardianClient();
        const response = await client.get('/status');
        const status = response.data;
        return {
            success: true,
            data: status,
            content: [{
                    type: 'text',
                    text: `🤖 Guardian Status:

Status: ${status.status}
Timestamp: ${new Date(status.timestamp).toLocaleString()}

${status.mcpConnection ? `
MCP Connection:
- Connected: ${status.mcpConnection.connected ? '✅' : '❌'}
- Type: ${status.mcpConnection.connectionType}
- Endpoint: ${status.mcpConnection.endpoint}
- Last Heartbeat: ${new Date(status.mcpConnection.lastHeartbeat).toLocaleString()}
- Reconnect Attempts: ${status.mcpConnection.reconnectAttempts}
` : ''}

${status.lastAnalysis ? `
Last Analysis:
- Project: ${status.lastAnalysis.projectPath}
- Score: ${status.lastAnalysis.score}%
- Time: ${new Date(status.lastAnalysis.timestamp).toLocaleString()}
` : 'No analysis performed yet'}`
                }]
        };
    }
    catch (error) {
        throw new MCPError(ErrorCode.INTERNAL_ERROR, `Failed to get Guardian status: ${error.message}`, ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
    }
}
/**
 * Get Guardian analysis history
 */
export async function handleGuardianHistory(args = {}) {
    var _a;
    try {
        const client = createGuardianClient();
        const response = await client.get('/history', {
            params: {
                limit: args.limit || 10
            }
        });
        const history = response.data;
        return {
            success: true,
            data: history,
            content: [{
                    type: 'text',
                    text: `📜 Guardian Analysis History (${history.length} entries):

${history.map((entry, index) => `
${index + 1}. ${new Date(entry.timestamp).toLocaleString()}
   Project: ${entry.projectPath}
   Type: ${entry.projectType}
   Score: ${entry.score}%
   Issues: ${entry.issueCount}
`).join('\n')}

${history.length === 0 ? 'No analysis history available yet.' : ''}`
                }]
        };
    }
    catch (error) {
        throw new MCPError(ErrorCode.INTERNAL_ERROR, `Failed to get Guardian history: ${error.message}`, ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
    }
}
/**
 * Get Guardian service health
 */
export async function handleGuardianHealth() {
    var _a;
    try {
        const client = createGuardianClient();
        const response = await client.get('/health');
        const health = response.data;
        return {
            success: true,
            data: health,
            content: [{
                    type: 'text',
                    text: `❤️ Guardian Health: ${health.status === 'ok' ? '✅ Healthy' : '❌ Unhealthy'}`
                }]
        };
    }
    catch (error) {
        throw new MCPError(ErrorCode.INTERNAL_ERROR, `Failed to check Guardian health: ${error.message}`, ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
    }
}
