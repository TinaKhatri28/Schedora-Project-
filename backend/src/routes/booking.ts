import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { generateTimeSlots } from '../utils/timeSlots';

const router = Router();

// GET /api/booking/:username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true, name: true, username: true, timezone: true, welcomeMessage: true,
        eventTypes: { where: { isActive: true }, orderBy: { duration: 'asc' } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, username: user.username, timezone: user.timezone, welcomeMessage: user.welcomeMessage }, eventTypes: user.eventTypes });
  } catch { res.status(500).json({ error: 'Failed to fetch user' }); }
});

// GET /api/booking/:username/:slug
router.get('/:username/:slug', async (req: Request, res: Response) => {
  try {
    const { username, slug } = req.params;
    const user = await prisma.user.findUnique({ where: { username }, select: { id: true, name: true, username: true, timezone: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const eventType = await prisma.eventType.findFirst({ where: { userId: user.id, slug, isActive: true } });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });
    res.json({ user, eventType });
  } catch { res.status(500).json({ error: 'Failed to fetch event type' }); }
});

// GET /api/booking/:username/:slug/slots?date=YYYY-MM-DD
router.get('/:username/:slug/slots', async (req: Request, res: Response) => {
  try {
    const { username, slug } = req.params;
    const { date } = req.query as { date: string };
    if (!date) return res.status(400).json({ error: 'date param required' });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const eventType = await prisma.eventType.findFirst({ where: { userId: user.id, slug, isActive: true } });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const av = await prisma.availability.findUnique({ where: { userId_dayOfWeek: { userId: user.id, dayOfWeek } } });

    const dayConfig = av ? { isEnabled: av.isEnabled, startTime: av.startTime, endTime: av.endTime } : null;
    const booked = await prisma.meeting.findMany({ where: { hostId: user.id, date, status: 'CONFIRMED' } });
    const slots = generateTimeSlots(date, eventType.duration, dayConfig, booked);

    res.json({ slots, timezone: user.timezone, eventType });
  } catch { res.status(500).json({ error: 'Failed to fetch slots' }); }
});

// POST /api/booking/:username/:slug
router.post('/:username/:slug', async (req: Request, res: Response) => {
  try {
    const { username, slug } = req.params;
    const { inviteeName, inviteeEmail, date, time, timezone, notes } = req.body;
    if (!inviteeName || !inviteeEmail || !date || !time) {
      return res.status(400).json({ error: 'inviteeName, inviteeEmail, date, time required' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const eventType = await prisma.eventType.findFirst({ where: { userId: user.id, slug, isActive: true } });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    const conflict = await prisma.meeting.findFirst({
      where: {
        hostId: user.id, date, status: 'CONFIRMED',
        OR: [
          { AND: [{ startTime: { gte: time } }, { startTime: { lt: `${Math.floor(parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]) + eventType.duration) < 60 ? '0' : ''}` } }] },
          { startTime: time },
        ],
      },
    });
    if (conflict) return res.status(409).json({ error: 'Time slot already booked' });

    const [sh, sm] = time.split(':').map(Number);
    const endMin = sh * 60 + sm + eventType.duration;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    const meeting = await prisma.meeting.create({
      data: {
        hostId: user.id, eventTypeId: eventType.id,
        inviteeName, inviteeEmail,
        date, startTime: time, endTime,
        duration: eventType.duration,
        timezone: timezone || user.timezone,
        notes, status: 'CONFIRMED',
      },
      include: { eventType: true, host: { select: { name: true, email: true, timezone: true } } },
    });
    res.status(201).json({ meeting });
  } catch { res.status(500).json({ error: 'Failed to create booking' }); }
});

export default router;
