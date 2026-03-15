import express from 'express';
import db from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all orchestrations
router.get('/', (req, res) => {
    const orchestrations = db.prepare('SELECT id, name, description, collection_id, environment_id, created_at, updated_at FROM orchestrations').all();
    res.json(orchestrations);
});

// Create/Update orchestration
router.post('/', (req, res) => {
    try {
        const { id, name, description, flow_data, collection_id, environment_id } = req.body;
        const finalId = id || uuidv4();

        // Using simple string concatenation for SQL to avoid backtick issues in some environments if any
        const sql = `
      INSERT INTO orchestrations (id, name, description, flow_data, collection_id, environment_id) 
      VALUES (?, ?, ?, ?, ?, ?) 
      ON CONFLICT(id) DO UPDATE SET 
        name=excluded.name, 
        description=excluded.description, 
        flow_data=excluded.flow_data, 
        collection_id=excluded.collection_id, 
        environment_id=excluded.environment_id,
        updated_at=CURRENT_TIMESTAMP
    `;

        const stmt = db.prepare(sql);
        stmt.run(finalId, name, description, JSON.stringify(flow_data), collection_id || null, environment_id || null);

        res.json({ id: finalId, name });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update orchestration
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, flow_data, collection_id, environment_id } = req.body;

        const check = db.prepare('SELECT id FROM orchestrations WHERE id = ?').get(id);
        if (!check) {
            return res.status(404).json({ error: 'Orchestration not found' });
        }

        const sql = `
            UPDATE orchestrations SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                flow_data = COALESCE(?, flow_data),
                collection_id = COALESCE(?, collection_id),
                environment_id = COALESCE(?, environment_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const stmt = db.prepare(sql);
        stmt.run(
            name,
            description,
            flow_data ? JSON.stringify(flow_data) : null,
            collection_id || null,
            environment_id || null,
            id
        );

        res.json({ success: true, id, name });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get single orchestration
router.get('/:id', (req, res) => {
    const orch = db.prepare('SELECT * FROM orchestrations WHERE id = ?').get(req.params.id) as any;
    if (!orch) return res.status(404).json({ error: 'Orchestration not found' });

    res.json({
        ...orch,
        flow_data: JSON.parse(orch.flow_data)
    });
});

// Delete orchestration
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM orchestrations WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;
