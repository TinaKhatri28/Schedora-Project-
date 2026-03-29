import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

const DEFAULT_USER_EMAIL = 'admin@schedulr.app';

const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!user) throw new Error('Default user not found. Run: npm run db:seed');
  return user;
};

// GET /api/users/me
router.get('/me', async (_req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
});

// PUT /api/users/me
router.put('/me', async (req: Request, res: Response) => {
  try {
    const user = await getDefaultUser();
    const { name, timezone, welcomeMessage } = req.body;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(timezone !== undefined && { timezone }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
      },
    });
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

export default router;
