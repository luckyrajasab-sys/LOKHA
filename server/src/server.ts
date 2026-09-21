import { createApp } from './app.js';
import dotenv from 'dotenv';
import { checkDatabaseConnection } from './db/pool.js';

dotenv.config();

const app = createApp();
const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  console.log('[LOKHA Server] Starting production backend...');

  // Pre-flight database check
  const dbHealth = await checkDatabaseConnection();
  if (dbHealth.ok) {
    console.log(`[PostgreSQL] Connection pool established successfully (${dbHealth.latencyMs}ms latency)`);
  } else {
    console.warn(`[PostgreSQL Warning] Could not connect to database on startup: ${dbHealth.error}`);
    console.warn(`[PostgreSQL Warning] Verify PGHOST, PGUSER, PGDATABASE, and PGPASSWORD or DATABASE_URL in environment.`);
  }

  app.listen(PORT, () => {
    console.log(`[LOKHA Server] Listening on http://localhost:${PORT}`);
    console.log(`[LOKHA Server] Health check available at http://localhost:${PORT}/api/health`);
  });
}

// Start if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
