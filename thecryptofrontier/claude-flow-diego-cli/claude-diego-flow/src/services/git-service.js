import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class GitService {
    async status() {
        try {
            const { stdout } = await execAsync('git status --porcelain');
            return {
                files: stdout.split('\n').filter(line => line.trim()),
                hasChanges: stdout.trim().length > 0
            };
        }
        catch (error) {
            return { error: error.message };
        }
    }
    async getCurrentBranch() {
        try {
            const { stdout } = await execAsync('git branch --show-current');
            return stdout.trim();
        }
        catch (_a) {
            return 'unknown';
        }
    }
    async getRemoteUrl() {
        try {
            const { stdout } = await execAsync('git remote get-url origin');
            return stdout.trim();
        }
        catch (_a) {
            return '';
        }
    }
}
