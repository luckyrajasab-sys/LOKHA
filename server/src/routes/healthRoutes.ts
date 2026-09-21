import { Router } from 'express';
import { checkDatabaseConnection } from '../db/pool.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const dbHealth = await checkDatabaseConnection();
  const status = dbHealth.ok ? 'ok' : 'degraded';
  const statusCode = dbHealth.ok ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    service: 'lokha-cloudsql-api',
    database: {
      connected: dbHealth.ok,
      latencyMs: dbHealth.latencyMs,
      ...(dbHealth.error ? { error: dbHealth.error } : {})
    },
    version: '1.0.0'
  });
});
