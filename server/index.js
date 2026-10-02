import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';

dotenv.config({ path: `${import.meta.dirname}/.env` });

const port = Number(process.env.API_PORT || 3001);
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME || 'jamia_portal';

if (!mongoUri) {
  console.error('MONGODB_URI is required to start the API server.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/.test(mongoUri)) {
  console.error('Refusing to start production with a localhost MongoDB URI. Configure a persistent MongoDB Atlas MONGODB_URI.');
  process.exit(1);
}

const client = new MongoClient(mongoUri, {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
});

const app = express();
app.use(express.json({ limit: '2mb' }));

let stateCollection;
let stateBackupCollection;

app.get('/api/health', async (_request, response) => {
  try {
    await client.db(databaseName).command({ ping: 1 });
    response.json({ ok: true, database: databaseName });
  } catch {
    response.status(503).json({ ok: false, error: 'Database unavailable' });
  }
});

app.get('/api/state', async (_request, response) => {
  try {
    const document = await stateCollection.findOne({ _id: 'singleton' });
    response.json(document?.state ?? null);
  } catch (error) {
    console.error('Failed to load state:', error);
    response.status(500).json({ error: 'Failed to load application data' });
  }
});

app.put('/api/state', async (request, response) => {
  try {
    if (!request.body || typeof request.body !== 'object') {
      response.status(400).json({ error: 'State payload must be an object' });
      return;
    }
    const current = await stateCollection.findOne({ _id: 'singleton' });
    if (current?.state) {
      await stateBackupCollection.insertOne({
        sourceId: 'singleton',
        state: current.state,
        originalUpdatedAt: current.updatedAt ?? null,
        backedUpAt: new Date(),
      });
    }
    await stateCollection.replaceOne(
      { _id: 'singleton' },
      { _id: 'singleton', state: request.body, updatedAt: new Date() },
      { upsert: true },
    );
    response.json({ success: true });
  } catch (error) {
    console.error('Failed to save state:', error);
    response.status(500).json({ error: 'Failed to save application data' });
  }
});

async function start() {
  console.log('Connecting to MongoDB Atlas...');
  await client.connect();
  const database = client.db(databaseName);
  stateCollection = database.collection('portal_state');
  stateBackupCollection = database.collection('portal_state_backups');
  await client.db(databaseName).command({ ping: 1 });
  await stateCollection.createIndex({ updatedAt: 1 });
  await stateBackupCollection.createIndex({ backedUpAt: -1 });
  app.listen(port, '0.0.0.0', () => {
    console.log(`MongoDB API listening on http://localhost:${port}`);
  });
}

start().catch(error => {
  console.error('Failed to connect to MongoDB Atlas:', error.message);
  console.error('Check the database password, Atlas Network Access IP allowlist, and that the URI is URL-encoded.');
  process.exit(1);
});

async function shutdown() {
  await client.close();
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
