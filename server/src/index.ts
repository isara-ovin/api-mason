import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrations.js';
import collectionRouter from './routes/collections.js';
import environmentRouter from './routes/environments.js';
import orchestrationRoutes from './routes/orchestrations.js';
import executeRoutes from './routes/execute.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 1010;

// Run database migrations
runMigrations();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use('/api/collections', collectionRouter);
app.use('/api/environments', environmentRouter);
app.use('/api/orchestrations', orchestrationRoutes);
app.use('/api/execute', executeRoutes);

// Serve Static Frontend Content in Production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
    // Note: Don't catch /api routes here
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    }
});

app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`\n🚀 APIMason is ready! Open your browser to:`);
    console.log(`   http://localhost:${port}\n`);
});
