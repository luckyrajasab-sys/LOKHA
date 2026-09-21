import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { healthRouter } from './routes/healthRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { propertyRouter } from './routes/propertyRoutes.js';
import { bookingRouter } from './routes/bookingRoutes.js';
import { hospitalityRouter } from './routes/hospitalityRoutes.js';
import { projectRouter } from './routes/projectRoutes.js';
import { interactionRouter } from './routes/interactionRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));

  // Mount API Routers
  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/properties', propertyRouter);
  app.use('/api/bookings', bookingRouter);
  app.use('/api/hospitality', hospitalityRouter);
  app.use('/api', projectRouter);
  app.use('/api', interactionRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/admin', adminRouter);

  // 404 Handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'NotFound', message: 'API route not found' });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
