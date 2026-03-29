import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

const DEFAULT_USER_EMAIL = 'admin@schedulr.app';

const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) throw new Error('Default user not found. Run: npm run db:seed');
  return user;
};

// GET /api/event-types
router.get('/', async (_req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ eventTypes });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch event types' });
  }
});

// POST /api/event-types
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const { name, slug, duration, description, color, location } = req.body;
    if (!name || !slug || !duration) {
      return res.status(400).json({ error: 'name, slug, and duration are required' });
    }
    const eventType = await prisma.eventType.create({
      data: {
        userId: user.id,
        name,
        slug,
        duration: +duration,
        description,
        color: color || '#006BFF',
        location,
      },
    });
    res.status(201).json({ eventType });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message || 'Failed to create event type' });
  }
});

// PUT /api/event-types/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const et = await prisma.eventType.findUnique({ where: { id } });
    if (!et) return res.status(404).json({ error: 'Event type not found' });

    const { name, slug, duration, description, color, location, isActive } = req.body;
    const updated = await prisma.eventType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(duration !== undefined && { duration: +duration }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(location !== undefined && { location }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ eventType: updated });
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: err.message || 'Failed to update event type' });
  }
});

// PATCH /api/event-types/:id/toggle
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const et = await prisma.eventType.findUnique({ where: { id } });
    if (!et) return res.status(404).json({ error: 'Event type not found' });
    const updated = await prisma.eventType.update({
      where: { id },
      data: { isActive: !et.isActive },
    });
    res.json({ eventType: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle event type' });
  }
});

// DELETE /api/event-types/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const et = await prisma.eventType.findUnique({ where: { id } });
    if (!et) return res.status(404).json({ error: 'Event type not found' });
    await prisma.eventType.delete({ where: { id } });
    res.json({ message: 'Event type deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete event type' });
  }
});

export default router;
