/**
 * Utility functions with generics and type safety
 */
import { MCPError, ErrorCode } from './core/types.js';
/**
 * Execute a function with retry logic
 * @template T The return type of the function
 * @param fn The async function to execute
 * @param options Retry configuration options
 * @returns Promise with the function result
 */
export async function withRetry(fn, options = {}) {
    const { retries = 3, delay = 1000, backoff = true, onRetry } = options;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < retries) {
                const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
                onRetry === null || onRetry === void 0 ? void 0 : onRetry(lastError, attempt + 1);
                await sleep(waitTime);
            }
        }
    }
    throw lastError;
}
// ==================== Timeout Logic ====================
/**
 * Execute a function with timeout
 * @template T The return type of the function
 * @param fn The async function to execute
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message
 * @returns Promise with the function result
 */
export async function withTimeout(fn, timeoutMs, errorMessage = 'Operation timed out') {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new MCPError(ErrorCode.TIMEOUT, errorMessage));
        }, timeoutMs);
    });
    return Promise.race([fn(), timeoutPromise]);
}
/**
 * Wrap an async function to return a Result type
 * @template T The success value type
 * @template E The error type
 * @param fn The async function to wrap
 * @returns Result with either success value or error
 */
export async function toResult(fn) {
    try {
        const value = await fn();
        return { ok: true, value };
    }
    catch (error) {
        return { ok: false, error: error };
    }
}
// ==================== Tool Response Helpers ====================
/**
 * Create a successful tool response
 * @template T The data type
 * @param data The response data
 * @param message Optional message
 * @returns Formatted tool result
 */
export function successResponse(data, message) {
    const content = [];
    if (message) {
        content.push({ type: 'text', text: message });
    }
    if (typeof data === 'string') {
        content.push({ type: 'text', text: data });
    }
    else {
        content.push({ type: 'text', text: JSON.stringify(data, null, 2) });
    }
    return {
        success: true,
        data,
        content
    };
}
/**
 * Create an error tool response
 * @param code Error code
 * @param message Error message
 * @param details Optional error details
 * @returns Formatted error result
 */
export function errorResponse(code, message, details) {
    const error = new MCPError(code, message, details);
    return {
        success: false,
        error,
        content: [{ type: 'text', text: `Error: ${message}` }]
    };
}
// ==================== Functional Helpers ====================
/**
 * Pipe functions together with type safety
 * @template T The input type
 * @template R The final return type
 * @param value The initial value
 * @param fns Functions to pipe
 * @returns The final result
 */
export function pipe(value, ...fns) {
    return fns.reduce((acc, fn) => fn(acc), value);
}
/**
 * Compose functions right to left
 * @template T The input type
 * @template R The final return type
 * @param fns Functions to compose
 * @returns Composed function
 */
export function compose(...fns) {
    return (value) => fns.reduceRight((acc, fn) => fn(acc), value);
}
// ==================== Async Helpers ====================
/**
 * Sleep for specified milliseconds
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after timeout
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Debounce an async function
 * @template T The function arguments type
 * @template R The function return type
 * @param fn The function to debounce
 * @param delay Debounce delay in ms
 * @returns Debounced function
 */
export function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
/**
 * Throttle an async function
 * @template T The function type
 * @param fn The function to throttle
 * @param limit Time limit in ms
 * @returns Throttled function
 */
export function throttle(fn, limit) {
    let inThrottle = false;
    let lastResult;
    return ((...args) => {
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
            lastResult = fn(...args);
        }
        return lastResult;
    });
}
// ==================== Batch Processing ====================
/**
 * Process items in batches
 * @template T The item type
 * @template R The result type
 * @param items Items to process
 * @param batchSize Size of each batch
 * @param processor Function to process each item
 * @returns Array of results
 */
export async function batchProcess(items, batchSize, processor) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);
    }
    return results;
}
export class SimpleCache {
    constructor(defaultTTL = 300000) {
        this.defaultTTL = defaultTTL;
        this.cache = new Map();
    } // 5 minutes default
    /**
     * Get or compute a cached value
     * @param key Cache key
     * @param compute Function to compute value if not cached
     * @param ttl Time to live in ms
     * @returns Cached or computed value
     */
    async getOrCompute(key, compute, ttl = this.defaultTTL) {
        const entry = this.cache.get(key);
        if (entry && entry.expiry > Date.now()) {
            return entry.value;
        }
        const value = await compute();
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
        return value;
    }
    clear() {
        this.cache.clear();
    }
    delete(key) {
        return this.cache.delete(key);
    }
}
