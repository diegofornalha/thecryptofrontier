/**
 * Sistema de logging estruturado para DiegoTools
 */
import * as fs from 'fs';
import * as path from 'path';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 99] = "NONE";
})(LogLevel || (LogLevel = {}));
export class Logger {
    constructor() {
        // Configurar baseado em variáveis de ambiente
        this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'INFO');
        this.useConsole = process.env.LOG_CONSOLE !== 'false';
        this.useFile = process.env.LOG_FILE === 'true';
        if (this.useFile) {
            const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const date = new Date().toISOString().split('T')[0];
            this.logFile = path.join(logDir, `diego-tools-${date}.log`);
        }
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    parseLogLevel(level) {
        return LogLevel[level.toUpperCase()] || LogLevel.INFO;
    }
    formatMessage(entry) {
        const { timestamp, level, tool, message, data } = entry;
        const toolPrefix = tool ? `[${tool}] ` : '';
        let formatted = `[${timestamp}] [${level}] ${toolPrefix}${message}`;
        if (data) {
            formatted += ` ${JSON.stringify(data)}`;
        }
        return formatted;
    }
    log(level, message, options) {
        if (LogLevel[level] < this.logLevel)
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...options
        };
        const formatted = this.formatMessage(entry);
        // Log para console
        if (this.useConsole) {
            // Usar process.stderr.write diretamente para evitar recursão
            process.stderr.write(formatted + '\n');
            if (options === null || options === void 0 ? void 0 : options.error) {
                process.stderr.write(options.error.stack + '\n');
            }
        }
        // Log para arquivo
        if (this.useFile && this.logFile) {
            try {
                fs.appendFileSync(this.logFile, formatted + '\n');
                if (options === null || options === void 0 ? void 0 : options.error) {
                    fs.appendFileSync(this.logFile, options.error.stack + '\n');
                }
            }
            catch (err) {
                // Falha silenciosa se não conseguir escrever
            }
        }
    }
    debug(message, options) {
        this.log('DEBUG', message, options);
    }
    info(message, options) {
        this.log('INFO', message, options);
    }
    warn(message, options) {
        this.log('WARN', message, options);
    }
    error(message, options) {
        this.log('ERROR', message, options);
    }
    // Método para criar logger específico de ferramenta
    forTool(toolName) {
        const logger = this;
        return {
            debug: (message, data) => logger.debug(message, { tool: toolName, data }),
            info: (message, data) => logger.info(message, { tool: toolName, data }),
            warn: (message, data) => logger.warn(message, { tool: toolName, data }),
            error: (message, error, data) => logger.error(message, { tool: toolName, error, data })
        };
    }
}
// Exportar instância única
export const logger = Logger.getInstance();
// Helper para substituir console.log/error existentes
export function replaceConsoleWithLogger() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    console.log = (...args) => {
        logger.info(args.map(a => String(a)).join(' '));
    };
    console.error = (...args) => {
        // Preservar logs MCP que começam com [DiegoTools]
        const message = args.map(a => String(a)).join(' ');
        if (message.includes('[DiegoTools]')) {
            originalError(...args);
        }
        else {
            logger.error(message);
        }
    };
    console.warn = (...args) => {
        logger.warn(args.map(a => String(a)).join(' '));
    };
    // Retornar função para restaurar
    return () => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
    };
}
