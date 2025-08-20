import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseTool } from '../tool-interface';
const execAsync = promisify(exec);
export class DirectGitCommand extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = 'DirectGitCommand';
        this.description = 'Execução direta de comandos Git';
    }
    async execute(params) {
        const { command, cwd } = params;
        this.validateParams(params, ['command']);
        const workingDir = cwd || process.cwd();
        switch (command) {
            case 'status':
                return this.gitStatus(workingDir);
            case 'commit':
                return this.gitCommit(workingDir, params.message, params.files);
            case 'push':
                return this.gitPush(workingDir, params.branch);
            case 'pull':
                return this.gitPull(workingDir, params.branch);
            case 'add':
                return this.gitAdd(workingDir, params.files);
            case 'diff':
                return this.gitDiff(workingDir, params.cached);
            case 'log':
                return this.gitLog(workingDir, params.limit);
            default:
                return this.executeRawCommand(workingDir, command, params.args);
        }
    }
    async gitStatus(cwd) {
        try {
            const { stdout } = await execAsync('git status --porcelain', { cwd });
            const lines = stdout.split('\n').filter(line => line.trim());
            const files = lines.map(line => {
                const [status, ...pathParts] = line.trim().split(' ');
                return {
                    status: status.trim(),
                    path: pathParts.join(' ')
                };
            });
            const { stdout: branch } = await execAsync('git branch --show-current', { cwd });
            return {
                success: true,
                branch: branch.trim(),
                files,
                clean: files.length === 0
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async gitCommit(cwd, message, files) {
        try {
            if (!message) {
                throw new Error('Mensagem de commit é obrigatória');
            }
            // Adicionar arquivos se especificados
            if (files && files.length > 0) {
                for (const file of files) {
                    await execAsync(`git add "${file}"`, { cwd });
                }
            }
            // Fazer commit
            const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd });
            return {
                success: true,
                output: stdout,
                message: 'Commit realizado com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async gitPush(cwd, branch) {
        try {
            const pushCommand = branch ? `git push origin ${branch}` : 'git push';
            const { stdout, stderr } = await execAsync(pushCommand, { cwd });
            return {
                success: true,
                output: stdout || stderr,
                message: 'Push realizado com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async gitPull(cwd, branch) {
        try {
            const pullCommand = branch ? `git pull origin ${branch}` : 'git pull';
            const { stdout } = await execAsync(pullCommand, { cwd });
            return {
                success: true,
                output: stdout,
                message: 'Pull realizado com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async gitAdd(cwd, files) {
        try {
            const fileList = Array.isArray(files) ? files : [files];
            for (const file of fileList) {
                await execAsync(`git add "${file}"`, { cwd });
            }
            return {
                success: true,
                message: `${fileList.length} arquivo(s) adicionado(s) ao stage`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async gitDiff(cwd, cached = false) {
        try {
            const diffCommand = cached ? 'git diff --cached' : 'git diff';
            const { stdout } = await execAsync(diffCommand, { cwd });
            return {
                success: true,
                diff: stdout,
                hasDifferences: stdout.length > 0
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async gitLog(cwd, limit = 10) {
        try {
            const { stdout } = await execAsync(`git log -${limit} --pretty=format:"%h|%an|%ad|%s" --date=relative`, { cwd });
            const commits = stdout.split('\n').filter(line => line.trim()).map(line => {
                const [hash, author, date, message] = line.split('|');
                return { hash, author, date, message };
            });
            return {
                success: true,
                commits
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async executeRawCommand(cwd, command, args) {
        try {
            const fullCommand = args ? `git ${command} ${args}` : `git ${command}`;
            const { stdout, stderr } = await execAsync(fullCommand, { cwd });
            return {
                success: true,
                output: stdout || stderr
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}
// Wrapper para compatibilidade
export class GitTool extends DirectGitCommand {
    async status(cwd) {
        return this.execute({ command: 'status', cwd });
    }
    async commit(message, files, cwd) {
        return this.execute({ command: 'commit', message, files, cwd });
    }
    async push(branch, cwd) {
        return this.execute({ command: 'push', branch, cwd });
    }
    async pull(branch, cwd) {
        return this.execute({ command: 'pull', branch, cwd });
    }
}
