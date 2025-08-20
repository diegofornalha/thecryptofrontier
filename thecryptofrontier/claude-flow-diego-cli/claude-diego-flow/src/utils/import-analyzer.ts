import * as fs from 'fs/promises';

export async function analyzeImports(filePath: string): Promise<string[]> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const imports: string[] = [];
        
        // Match ES6 imports
        const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        
        // Match require statements
        const requireRegex = /require\s*\(\s*['"](.+?)['"]\s*\)/g;
        while ((match = requireRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        
        return [...new Set(imports)];
    } catch (error) {
        return [];
    }
}