import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Integrations are mostly OAuth-based external services.
 * We return a static catalog with connection status flags.
 * Extend with real OAuth flows per integration as needed.
 */

const INTEGRATIONS = [
  // Video conferencing
  { id: 'zoom',        name: 'Zoom',                  category: 'video',     description: 'Include Zoom details in your Calendly events', connected: false, icon: 'zoom' },
  { id: 'google_meet', name: 'Google Meet',           category: 'video',     description: 'Include Google Meet details in your events',   connected: true,  icon: 'google_meet' },
  { id: 'ms_teams',   name: 'Microsoft Teams',        category: 'video',     description: 'Include Teams conferencing details',            connected: false, icon: 'ms_teams' },
  // Calendars
  { id: 'google_cal',  name: 'Google Calendar',       category: 'calendar',  description: 'Add events to your calendar and prevent double-booking', connected: true, icon: 'google_cal' },
  { id: 'outlook',     name: 'Outlook Calendar',      category: 'calendar',  description: 'Add to your Outlook calendar and prevent double-booking', connected: false, icon: 'outlook' },
  // CRM
  { id: 'salesforce',  name: 'Salesforce',            category: 'crm',       description: 'Create and update records as meetings are scheduled', connected: false, icon: 'salesforce', badge: 'Admin' },
  { id: 'hubspot',     name: 'HubSpot',               category: 'crm',       description: 'Sync meeting data to your CRM', connected: false, icon: 'hubspot' },
  // Payments
  { id: 'stripe',      name: 'Stripe',                category: 'payments',  description: 'Collect payment before your meetings', connected: false, icon: 'stripe' },
  { id: 'paypal',      name: 'PayPal',                category: 'payments',  description: 'Collect payment before the meeting', connected: false, icon: 'paypal' },
  // Automation
  { id: 'zapier',      name: 'Zapier',                category: 'automation',description: 'Create no-code automations with the tools you use', connected: false, icon: 'zapier' },
  // Communication
  { id: 'slack',       name: 'Slack',                 category: 'communication', description: 'Access and share your schedule in Slack', connected: false, icon: 'slack' },
  // Browser
  { id: 'chrome_ext',  name: 'Calendly for Chrome',   category: 'browser',   description: 'Access and share availability on any web page', connected: false, icon: 'chrome' },
];

// GET /api/integrations
router.get('/', async (_req, res: Response) => {
  try {
    res.json({ integrations: INTEGRATIONS });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// POST /api/integrations/:id/connect
router.post('/:id/connect', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const integration = INTEGRATIONS.find((i) => i.id === id);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    // In production: initiate OAuth flow here
    res.json({ message: `OAuth flow for ${integration.name} would start here`, integration: { ...integration, connected: true } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to connect integration' });
  }
});

// DELETE /api/integrations/:id/disconnect
router.delete('/:id/disconnect', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const integration = INTEGRATIONS.find((i) => i.id === id);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    res.json({ message: `${integration.name} disconnected`, integration: { ...integration, connected: false } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

export default router;