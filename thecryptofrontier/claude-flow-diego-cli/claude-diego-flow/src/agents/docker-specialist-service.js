#!/usr/bin/env npx tsx
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3009;
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        agent: 'docker-specialist',
        version: '1.0.0'
    });
});
// Docker info endpoint
app.get('/docker-info', async (req, res) => {
    try {
        const { stdout } = await execAsync('docker info --format json');
        res.json(JSON.parse(stdout));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// List containers
app.get('/containers', async (req, res) => {
    try {
        const { stdout } = await execAsync('docker ps --format json --all');
        const containers = stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
        res.json(containers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// List images
app.get('/images', async (req, res) => {
    try {
        const { stdout } = await execAsync('docker images --format json');
        const images = stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
        res.json(images);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Analyze Docker setup
app.post('/analyze', async (req, res) => {
    try {
        const analysis = {
            containers: await getContainerCount(),
            images: await getImageCount(),
            volumes: await getVolumeCount(),
            networks: await getNetworkCount(),
            timestamp: new Date().toISOString()
        };
        res.json({
            success: true,
            analysis
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
async function getContainerCount() {
    const { stdout } = await execAsync('docker ps -aq | wc -l');
    return parseInt(stdout.trim());
}
async function getImageCount() {
    const { stdout } = await execAsync('docker images -q | wc -l');
    return parseInt(stdout.trim());
}
async function getVolumeCount() {
    const { stdout } = await execAsync('docker volume ls -q | wc -l');
    return parseInt(stdout.trim());
}
async function getNetworkCount() {
    const { stdout } = await execAsync('docker network ls -q | wc -l');
    return parseInt(stdout.trim());
}
app.listen(PORT, () => {
    console.log(`Docker Specialist Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
