import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

const DEFAULT_USER_EMAIL = 'admin@schedulr.app';
const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) throw new Error('Default user not found. Run: npm run db:seed');
  return user;
};

/**
 * Contacts are derived from meeting invitees.
 * We aggregate all unique invitee emails and their meeting history.
 */

// GET /api/contacts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();

    // Group meetings by inviteeEmail
    const meetings = await prisma.meeting.findMany({
      where: { hostId: user.id },
      include: { eventType: { select: { name: true, color: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Build unique contacts map
    const contactMap = new Map<string, any>();
    for (const m of meetings) {
      if (!contactMap.has(m.inviteeEmail)) {
        contactMap.set(m.inviteeEmail, {
          id: m.inviteeEmail,
          name: m.inviteeName,
          email: m.inviteeEmail,
          meetingCount: 0,
          lastMeeting: null,
          meetings: [],
        });
      }
      const c = contactMap.get(m.inviteeEmail);
      c.meetingCount += 1;
      c.meetings.push({
        id: m.id,
        date: m.date,
        startTime: m.startTime,
        status: m.status,
        eventTypeName: m.eventType?.name,
        eventTypeColor: m.eventType?.color,
      });
      if (!c.lastMeeting || m.date > c.lastMeeting) {
        c.lastMeeting = m.date;
      }
    }

    const contacts = Array.from(contactMap.values()).sort((a, b) =>
      (b.lastMeeting ?? '').localeCompare(a.lastMeeting ?? '')
    );

    res.json({ contacts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch contacts' });
  }
});

// GET /api/contacts/:email
router.get('/:email', async (req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const email = decodeURIComponent(req.params.email);

    const meetings = await prisma.meeting.findMany({
      where: { hostId: user.id, inviteeEmail: email },
      include: { eventType: { select: { name: true, color: true, duration: true } } },
      orderBy: { date: 'desc' },
    });

    if (meetings.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = {
      id: email,
      name: meetings[0].inviteeName,
      email,
      meetingCount: meetings.length,
      lastMeeting: meetings[0].date,
      meetings: meetings.map((m) => ({
        id: m.id,
        date: m.date,
        startTime: m.startTime,
        endTime: m.endTime,
        status: m.status,
        duration: m.duration,
        eventTypeName: m.eventType?.name,
        eventTypeColor: m.eventType?.color,
        notes: m.notes,
      })),
    };

    res.json({ contact });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch contact' });
  }
});

export default router;