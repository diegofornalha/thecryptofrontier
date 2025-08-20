// Simple logger implementation
export function logStart(agentName: string, task: any): void {
    console.log(`[${agentName}] Starting task: ${task.description || task.type}`);
}

export function logEnd(agentName: string, task: any, result: any): void {
    console.log(`[${agentName}] Completed task: ${task.description || task.type}`);
}

export function logInfo(agentName: string, message: string): void {
    console.log(`[${agentName}] ${message}`);
}

export function logError(agentName: string, task: any, error: Error): void {
    console.error(`[${agentName}] Error:`, error.message);
}