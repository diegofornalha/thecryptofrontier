import * as fs from 'fs/promises';
import { glob } from 'glob';
export class FileSystemService {
    async glob(pattern, options) {
        return glob(pattern, options || {});
    }
    async readFile(filePath, encoding) {
        return fs.readFile(filePath, encoding || 'utf-8');
    }
    async writeFile(filePath, content) {
        await fs.writeFile(filePath, content, 'utf-8');
    }
    async exists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async mkdir(dirPath, options) {
        await fs.mkdir(dirPath, { recursive: true, ...options });
    }
    async readdir(dirPath) {
        return fs.readdir(dirPath);
    }
    async stat(filePath) {
        return fs.stat(filePath);
    }
    async unlink(filePath) {
        await fs.unlink(filePath);
    }
    async rmdir(dirPath) {
        await fs.rmdir(dirPath);
    }
}
