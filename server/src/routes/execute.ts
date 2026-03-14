import express from 'express';
import { FlowExecutor } from '../services/executor.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { nodes, edges, environment } = req.body;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (type: string, data: any) => {
        res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };

    const executor = new FlowExecutor({
        environment,
        onBlockStart: (blockId) => sendEvent('blockStart', { blockId }),
        onBlockEnd: (blockId, result) => sendEvent('blockEnd', { blockId, result }),
        onLog: (log) => sendEvent('log', { log }),
        onVariable: (key, value) => sendEvent('variable', { key, value }),
    });

    try {
        sendEvent('status', { status: 'running' });
        const context = await executor.execute(nodes, edges);
        sendEvent('status', { status: 'completed', context });
        res.end();
    } catch (error: any) {
        sendEvent('status', { status: 'failed', error: error.message });
        res.end();
    }
});

export default router;
