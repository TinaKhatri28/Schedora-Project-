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
 * Workflows are stored in the DB as JSON config.
 * We use a simple workflows table pattern via a generic JSON field.
 * Since there's no Workflow model yet, we store them as user metadata.
 * These are returned as static templates + user-created ones.
 */

// Built-in workflow templates (no DB needed)
const WORKFLOW_TEMPLATES = [
  {
    id: 'tpl_email_reminder',
    name: 'Email reminder to invitee',
    description: 'Reduce no-shows — send automated email reminders to invitees',
    trigger: 'BEFORE_EVENT',
    action: 'EMAIL',
    icon: '📧',
    isTemplate: true,
  },
  {
    id: 'tpl_sms_cancel',
    name: 'Text cancellation notification to host',
    description: 'Keep hosts up-to-date with cancelled events',
    trigger: 'CANCELLATION',
    action: 'SMS',
    icon: '📱',
    isTemplate: true,
  },
  {
    id: 'tpl_thank_you',
    name: 'Send thank you email',
    description: 'Build relationships with a quick thank-you after meetings',
    trigger: 'AFTER_EVENT',
    action: 'EMAIL',
    icon: '💌',
    isTemplate: true,
  },
];

// GET /api/workflows
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Return templates — extend this when you add a Workflow model to Prisma
    res.json({ workflows: [], templates: WORKFLOW_TEMPLATES });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch workflows' });
  }
});

// POST /api/workflows  (add a workflow from template)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, trigger, action, description } = req.body;
    if (!name || !trigger || !action) {
      return res.status(400).json({ error: 'name, trigger, action are required' });
    }
    // In a full implementation, save to DB. For now return a mock created workflow.
    const workflow = {
      id: `wf_${Date.now()}`,
      name,
      description: description ?? '',
      trigger,
      action,
      isActive: true,
      createdAt: new Date().toISOString(),
      isTemplate: false,
    };
    res.status(201).json({ workflow });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create workflow' });
  }
});

export default router;