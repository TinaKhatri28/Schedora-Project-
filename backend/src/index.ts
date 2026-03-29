import dotenv from 'dotenv';
dotenv.config();
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Existing routes
import authRoutes        from './routes/auth';
import availabilityRoutes from './routes/availability';
import bookingRoutes     from './routes/booking';
import eventTypesRoutes  from './routes/eventTypes';
import meetingsRoutes    from './routes/meetings';
import usersRoutes       from './routes/users';

// New routes
import contactsRoutes    from './routes/contacts';
import workflowsRoutes   from './routes/workflows';
import integrationsRoutes from './routes/integrations';
import routingRoutes     from './routes/routing';
import analyticsRoutes   from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Existing API routes ───────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/booking',     bookingRoutes);
app.use('/api/event-types', eventTypesRoutes);
app.use('/api/meetings',    meetingsRoutes);
app.use('/api/users',       usersRoutes);

// ── New API routes ────────────────────────────────────────────
app.use('/api/contacts',    contactsRoutes);
app.use('/api/workflows',   workflowsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/routing',     routingRoutes);
app.use('/api/analytics',   analyticsRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`🚀 Schedulr API running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;