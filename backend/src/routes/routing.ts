import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

const DEFAULT_USER_EMAIL = 'admin@schedulr.app';
const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) throw new Error('Default user not found.');
  return user;
};

// ── GET /api/routing ──────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  // Routing forms — static for now, extend with DB model later
  res.json({ routingForms: [] });
});

// POST /api/routing
router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  res.status(201).json({
    routingForm: { id: `rf_${Date.now()}`, name, questions: [], rules: [], createdAt: new Date().toISOString() },
  });
});

export default router;