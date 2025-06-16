import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
const app = express();
const PORT = process.env.PORT || 8000;
// Middleware
app.use(cors());
app.use(express.json());
// Simple in-memory storage
const memories = new Map();
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'mem0-bridge' });
});
// Create memory
app.post('/v1/memories', (req, res) => {
    const { content, user_id, metadata } = req.body;
    const id = uuidv4();
    const memory = {
        id,
        content,
        user_id,
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    memories.set(id, memory);
    res.json({ data: memory });
});
// List memories
app.get('/v1/memories', (req, res) => {
    const { user_id } = req.query;
    const userMemories = Array.from(memories.values())
        .filter(m => !user_id || m.user_id === user_id);
    res.json({ data: userMemories });
});
// Search memories
app.post('/v1/memories/search', (req, res) => {
    const { query, user_id } = req.body;
    const results = Array.from(memories.values())
        .filter(m => !user_id || m.user_id === user_id)
        .filter(m => m.content.toLowerCase().includes(query.toLowerCase()));
    res.json({ data: results });
});
// Delete memory
app.delete('/v1/memories/:id', (req, res) => {
    const { id } = req.params;
    memories.delete(id);
    res.json({ success: true });
});
// Start server
app.listen(PORT, () => {
    console.log(`Mem0 bridge running on port ${PORT}`);
});
