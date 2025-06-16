import { v4 as uuidv4 } from 'uuid';
import { VectorStore } from './vector-store';
import { Cache } from './cache';
import { Memory } from '../models/memory';
import { embedText } from './embeddings';
import { logger } from '../utils/logger';
export class MemoryService {
    constructor() {
        this.vectorStore = new VectorStore();
        this.cache = new Cache();
    }
    async createMemory(input) {
        try {
            const memoryId = uuidv4();
            // Generate embedding for the content
            const embedding = await embedText(input.content);
            // Create memory record in database
            const memory = await Memory.create({
                id: memoryId,
                userId: input.userId,
                content: input.content,
                metadata: input.metadata || {},
                tags: input.tags || [],
                category: input.category || 'general',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Store in vector database
            await this.vectorStore.upsert({
                id: memoryId,
                vector: embedding,
                payload: {
                    userId: input.userId,
                    content: input.content,
                    metadata: input.metadata,
                    tags: input.tags,
                    category: input.category,
                    createdAt: new Date().toISOString()
                }
            });
            // Cache the memory
            await this.cache.set(`memory:${memoryId}`, memory, 3600); // 1 hour cache
            logger.info(`Memory created: ${memoryId}`);
            return memory;
        }
        catch (error) {
            logger.error('Error creating memory:', error);
            throw error;
        }
    }
    async searchMemories(input) {
        try {
            // Check cache first
            const cacheKey = `search:${input.userId}:${input.query}:${input.limit || 10}`;
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
            // Generate embedding for the query
            const queryEmbedding = await embedText(input.query);
            // Search in vector store
            const results = await this.vectorStore.search({
                vector: queryEmbedding,
                limit: input.limit || 10,
                filter: {
                    must: [
                        { key: 'userId', match: { value: input.userId } }
                    ]
                }
            });
            // Fetch full memory records
            const memoryIds = results.map(r => r.id);
            const memories = await Memory.findAll({
                where: { id: memoryIds }
            });
            // Sort memories by relevance score
            const sortedMemories = memories.sort((a, b) => {
                var _a, _b;
                const scoreA = ((_a = results.find(r => r.id === a.id)) === null || _a === void 0 ? void 0 : _a.score) || 0;
                const scoreB = ((_b = results.find(r => r.id === b.id)) === null || _b === void 0 ? void 0 : _b.score) || 0;
                return scoreB - scoreA;
            });
            // Cache the results
            await this.cache.set(cacheKey, sortedMemories, 300); // 5 minute cache
            return sortedMemories;
        }
        catch (error) {
            logger.error('Error searching memories:', error);
            throw error;
        }
    }
    async getMemory(memoryId, userId) {
        try {
            // Check cache first
            const cached = await this.cache.get(`memory:${memoryId}`);
            if (cached) {
                return cached;
            }
            // Fetch from database
            const memory = await Memory.findOne({
                where: { id: memoryId, userId }
            });
            if (memory) {
                // Cache the memory
                await this.cache.set(`memory:${memoryId}`, memory, 3600);
            }
            return memory;
        }
        catch (error) {
            logger.error('Error getting memory:', error);
            throw error;
        }
    }
    async updateMemory(memoryId, userId, input) {
        try {
            const memory = await Memory.findOne({
                where: { id: memoryId, userId }
            });
            if (!memory) {
                return null;
            }
            // Update memory fields
            if (input.content !== undefined) {
                memory.content = input.content;
                // Update embedding if content changed
                const embedding = await embedText(input.content);
                await this.vectorStore.upsert({
                    id: memoryId,
                    vector: embedding,
                    payload: {
                        userId,
                        content: input.content,
                        metadata: input.metadata || memory.metadata,
                        tags: input.tags || memory.tags,
                        category: input.category || memory.category,
                        updatedAt: new Date().toISOString()
                    }
                });
            }
            if (input.metadata !== undefined) {
                memory.metadata = { ...memory.metadata, ...input.metadata };
            }
            if (input.tags !== undefined) {
                memory.tags = input.tags;
            }
            if (input.category !== undefined) {
                memory.category = input.category;
            }
            memory.updatedAt = new Date();
            await memory.save();
            // Invalidate cache
            await this.cache.delete(`memory:${memoryId}`);
            return memory;
        }
        catch (error) {
            logger.error('Error updating memory:', error);
            throw error;
        }
    }
    async deleteMemory(memoryId, userId) {
        try {
            const memory = await Memory.findOne({
                where: { id: memoryId, userId }
            });
            if (!memory) {
                return false;
            }
            // Delete from vector store
            await this.vectorStore.delete([memoryId]);
            // Delete from database
            await memory.destroy();
            // Invalidate cache
            await this.cache.delete(`memory:${memoryId}`);
            logger.info(`Memory deleted: ${memoryId}`);
            return true;
        }
        catch (error) {
            logger.error('Error deleting memory:', error);
            throw error;
        }
    }
    async listMemories(userId, limit = 20, offset = 0) {
        try {
            const memories = await Memory.findAll({
                where: { userId },
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            return memories;
        }
        catch (error) {
            logger.error('Error listing memories:', error);
            throw error;
        }
    }
    async getMemoryStats(userId) {
        try {
            const totalCount = await Memory.count({ where: { userId } });
            const categoryCounts = await Memory.findAll({
                where: { userId },
                attributes: [
                    'category',
                    [Memory.sequelize.fn('COUNT', Memory.sequelize.col('category')), 'count']
                ],
                group: ['category']
            });
            const recentMemories = await Memory.findAll({
                where: { userId },
                limit: 5,
                order: [['createdAt', 'DESC']],
                attributes: ['id', 'content', 'createdAt']
            });
            return {
                totalMemories: totalCount,
                categoryCounts: categoryCounts.map(c => ({
                    category: c.category,
                    count: c.get('count')
                })),
                recentMemories
            };
        }
        catch (error) {
            logger.error('Error getting memory stats:', error);
            throw error;
        }
    }
}
