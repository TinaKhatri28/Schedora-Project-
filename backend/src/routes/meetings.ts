import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

const DEFAULT_USER_EMAIL = 'admin@schedulr.app';

const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) throw new Error('Default user not found. Run: npm run db:seed');
  return user;
};

// GET /api/meetings
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const { filter } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let where: any = { hostId: user.id };
    if (filter === 'upcoming') {
      where = { ...where, date: { gte: today }, status: 'CONFIRMED' };
    } else if (filter === 'past') {
      where = { ...where, OR: [{ date: { lt: today } }, { status: 'CANCELLED' }] };
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: { eventType: { select: { name: true, color: true, duration: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    res.json({ meetings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch meetings' });
  }
});

// GET /api/meetings/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.id },
      include: { eventType: true },
    });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ meeting });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch meeting' });
  }
});

// DELETE /api/meetings/:id  (cancel)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    const updated = await prisma.meeting.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: { eventType: { select: { name: true, color: true } } },
    });
    res.json({ meeting: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel meeting' });
  }
});

export default router;
