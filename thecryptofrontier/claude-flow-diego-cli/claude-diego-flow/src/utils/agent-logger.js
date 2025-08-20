// Simple logger implementation
export function logStart(agentName, task) {
    console.log(`[${agentName}] Starting task: ${task.description || task.type}`);
}
export function logEnd(agentName, task, result) {
    console.log(`[${agentName}] Completed task: ${task.description || task.type}`);
}
export function logInfo(agentName, message) {
    console.log(`[${agentName}] ${message}`);
}
export function logError(agentName, task, error) {
    console.error(`[${agentName}] Error:`, error.message);
}
