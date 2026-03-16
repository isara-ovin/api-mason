import express from 'express';
import db from '../db/connection.js';
import { parsePostmanCollection } from '../services/collectionParser.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all collections
router.get('/', (req, res) => {
    const collections = db.prepare('SELECT id, name, created_at, updated_at FROM collections').all();
    res.json(collections);
});

// Import new collection
router.post('/import', (req, res) => {
    try {
        const { json } = req.body;
        const parsed = parsePostmanCollection(json);
        const id = parsed.id || uuidv4();

        const stmt = db.prepare('INSERT INTO collections (id, name, raw_json, parsed_data) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, raw_json=excluded.raw_json, parsed_data=excluded.parsed_data, updated_at=CURRENT_TIMESTAMP');
        stmt.run(id, parsed.name, json, JSON.stringify(parsed));

        res.json({ id, name: parsed.name });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get single collection with parsed data
router.get('/:id', (req, res) => {
    const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id) as any;
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    res.json({
        ...collection,
        parsed_data: JSON.parse(collection.parsed_data)
    });
});

// Delete collection
router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM collections WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

export default router;
