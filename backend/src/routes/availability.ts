import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

const DEFAULT_USER_EMAIL = 'admin@schedulr.app';

const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) throw new Error('Default user not found. Run: npm run db:seed');
  return user;
};

// GET /api/availability
router.get('/', async (_req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const days = await prisma.availability.findMany({
      where: { userId: user.id },
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json({ timezone: user.timezone, days });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch availability' });
  }
});

// PUT /api/availability
router.put('/', async (req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const { timezone, days } = req.body;

    if (timezone) {
      await prisma.user.update({ where: { id: user.id }, data: { timezone } });
    }

    if (days && Array.isArray(days)) {
      await Promise.all(
        days.map((d: any) =>
          prisma.availability.upsert({
            where: { userId_dayOfWeek: { userId: user.id, dayOfWeek: d.dayOfWeek } },
            update: { isEnabled: d.isEnabled, startTime: d.startTime, endTime: d.endTime },
            create: {
              userId: user.id,
              dayOfWeek: d.dayOfWeek,
              isEnabled: d.isEnabled,
              startTime: d.startTime,
              endTime: d.endTime,
            },
          })
        )
      );
    }

    const updatedDays = await prisma.availability.findMany({
      where: { userId: user.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json({ timezone: timezone || user.timezone, days: updatedDays });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update availability' });
  }
});

export default router;
