/**
 * Base class for all agents
 */
export class BaseAgent {
    constructor(name, config = {}) {
        this.isRunning = false;
        this.name = name;
        this.config = config;
    }
    async initialize() {
        console.log(`🚀 Initializing ${this.name}...`);
        this.isRunning = true;
    }
    async start() {
        if (!this.isRunning) {
            await this.initialize();
        }
        await this.executeTask();
    }
    async stop() {
        console.log(`🛑 Stopping ${this.name}...`);
        this.isRunning = false;
    }
}
