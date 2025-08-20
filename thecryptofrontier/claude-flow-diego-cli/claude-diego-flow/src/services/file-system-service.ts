import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

export class FileSystemService {
    async glob(pattern: string, options?: any): Promise<string[]> {
        return glob(pattern, options || {});
    }

    async readFile(filePath: string, encoding?: BufferEncoding): Promise<string> {
        return fs.readFile(filePath, encoding || 'utf-8');
    }

    async writeFile(filePath: string, content: string): Promise<void> {
        await fs.writeFile(filePath, content, 'utf-8');
    }

    async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async mkdir(dirPath: string, options?: any): Promise<void> {
        await fs.mkdir(dirPath, { recursive: true, ...options });
    }

    async readdir(dirPath: string): Promise<string[]> {
        return fs.readdir(dirPath);
    }

    async stat(filePath: string): Promise<any> {
        return fs.stat(filePath);
    }

    async unlink(filePath: string): Promise<void> {
        await fs.unlink(filePath);
    }

    async rmdir(dirPath: string): Promise<void> {
        await fs.rmdir(dirPath);
    }
}