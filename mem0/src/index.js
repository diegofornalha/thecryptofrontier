import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { memoryRouter } from './routes/memory';
import { healthRouter } from './routes/health';
import { docsRouter } from './routes/docs';
import { initializeDatabase } from './database';
import { initializeVectorStore } from './services/vector-store';
import { initializeCache } from './services/cache';
import { startDocsSyncJob } from './jobs/docs-sync';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body,
        ip: req.ip
    });
    next();
});
// Routes
app.use('/health', healthRouter);
app.use('/v1/memories', memoryRouter);
app.use('/v1/docs', docsRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Initialize services and start server
async function start() {
    try {
        // Initialize database
        await initializeDatabase();
        logger.info('Database initialized');
        // Initialize vector store
        await initializeVectorStore();
        logger.info('Vector store initialized');
        // Initialize cache
        await initializeCache();
        logger.info('Cache initialized');
        // Start documentation sync job
        await startDocsSyncJob();
        logger.info('Documentation sync job started');
        // Start server
        app.listen(PORT, () => {
            logger.info(`Mem0 API server running on port ${PORT}`);
        });
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
start();
