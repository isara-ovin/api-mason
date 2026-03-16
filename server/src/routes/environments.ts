import express from 'express';
import db from '../db/connection.js';
import { parsePostmanEnvironment } from '../services/envResolver.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all environments (list)
router.get('/', (req, res) => {
    const environments = db.prepare('SELECT id, name, collection_id, created_at FROM environments').all();
    res.json(environments);
});

// Get single environment with variables
router.get('/:id', (req, res) => {
    const env = db.prepare('SELECT id, name, variables, collection_id FROM environments WHERE id = ?').get(req.params.id) as any;
    if (!env) return res.status(404).json({ error: 'Not found' });

    try {
        env.variables = JSON.parse(env.variables || '[]');
    } catch {
        env.variables = [];
    }

    res.json(env);
});

// Import new environment (from Postman env JSON)
router.post('/import', (req, res) => {
    try {
        const { json, collectionId } = req.body;
        const parsed = parsePostmanEnvironment(json);
        const id = parsed.id || uuidv4();

        const stmt = db.prepare('INSERT INTO environments (id, name, variables, collection_id) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, variables=excluded.variables, collection_id=excluded.collection_id');
        stmt.run(id, parsed.name, JSON.stringify(parsed.variables), collectionId || null);

        res.json({ id, name: parsed.name });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update environment properties or variables
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, variables } = req.body;

        // Fetch existing environment to ensure it exists
        const existing = db.prepare('SELECT id FROM environments WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Environment not found' });
        }

        const stmt = db.prepare('UPDATE environments SET name = ?, variables = ? WHERE id = ?');
        stmt.run(name, JSON.stringify(variables || []), id);

        res.json({ success: true, id, name });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete environment
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM environments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;
