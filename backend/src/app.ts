import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import usersRouter from './routes/users';
import eventTypesRouter from './routes/eventTypes';
import availabilityRouter from './routes/availability';
import meetingsRouter from './routes/meetings';
import bookingRouter from './routes/booking';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// All routes — no auth required
app.use('/api/users', usersRouter);
app.use('/api/event-types', eventTypesRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/booking', bookingRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

export default app;
