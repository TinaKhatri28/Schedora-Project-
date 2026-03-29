import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

const DEFAULT_USER_EMAIL = 'admin@schedulr.app';
const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) throw new Error('Default user not found.');
  return user;
};

// GET /api/analytics
router.get('/', async (_req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();

    const allMeetings = await prisma.meeting.findMany({
      where: { hostId: user.id },
      include: { eventType: { select: { name: true, color: true, duration: true } } },
      orderBy: { date: 'asc' },
    });

    const today = new Date().toISOString().split('T')[0];
    const lastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastMonthDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const created   = allMeetings.length;
    const completed = allMeetings.filter((m) => m.date < today && m.status === 'CONFIRMED').length;
    const cancelled = allMeetings.filter((m) => m.status === 'CANCELLED').length;
    const upcoming  = allMeetings.filter((m) => m.date >= today && m.status === 'CONFIRMED').length;

    // Last 7 days activity
    const lastWeek = allMeetings.filter((m) => m.date >= lastWeekDate && m.date <= today);
    const lastMonth = allMeetings.filter((m) => m.date >= lastMonthDate && m.date <= today);

    // Distribution by event type
    const byEventType: Record<string, { name: string; color: string; count: number }> = {};
    for (const m of allMeetings) {
      const key = m.eventTypeId ?? 'unknown';
      if (!byEventType[key]) {
        byEventType[key] = { name: m.eventType?.name ?? 'Unknown', color: m.eventType?.color ?? '#006BFF', count: 0 };
      }
      byEventType[key].count++;
    }

    // Daily counts for the last 30 days (for chart)
    const dailyCounts: { date: string; created: number; completed: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dailyCounts.push({
        date: d,
        created: allMeetings.filter((m) => m.createdAt.toISOString().split('T')[0] === d).length,
        completed: allMeetings.filter((m) => m.date === d && m.status === 'CONFIRMED').length,
      });
    }

    res.json({
      summary: { created, completed, cancelled, upcoming },
      lastWeek: { created: lastWeek.length },
      lastMonth: { created: lastMonth.length },
      byEventType: Object.values(byEventType),
      dailyCounts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

export default router;