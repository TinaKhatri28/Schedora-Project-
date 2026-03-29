// app/api/integrations/[provider]/disconnect/route.ts
// Handles token revocation when a user disconnects an integration

import { NextRequest, NextResponse } from 'next/server';

// Map provider → token revocation endpoint
const REVOKE_ENDPOINTS: Record<string, string> = {
  zoom: 'https://zoom.us/oauth/revoke',
  'google-meet': 'https://oauth2.googleapis.com/revoke',
  'google-cal': 'https://oauth2.googleapis.com/revoke',
  teams: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
  outlook: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
  slack: 'https://slack.com/api/auth.revoke',
  hubspot: 'https://api.hubapi.com/oauth/v1/refresh-tokens',
  stripe: '', // Stripe tokens are revoked via Dashboard or API
  salesforce: '', // Salesforce tokens revoked via connected apps
  zapier: '', // Zapier managed via their dashboard
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;

  // TODO: Retrieve the stored token for this user + provider from your DB
  // const token = await db.integrations.findToken({ userId, provider });
  const token: string | null = null; // replace with real DB lookup

  if (!token) {
    return NextResponse.json({ success: true, message: 'No token found — already disconnected.' });
  }

  const revokeUrl = REVOKE_ENDPOINTS[provider];

  try {
    if (revokeUrl) {
      if (provider === 'google-meet' || provider === 'google-cal') {
        await fetch(`${revokeUrl}?token=${token}`, { method: 'POST' });
      } else if (provider === 'zoom') {
        await fetch(`${revokeUrl}?token=${token}`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
        });
      } else if (provider === 'slack') {
        await fetch(revokeUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }

    // TODO: Delete the token from your database
    // await db.integrations.deleteToken({ userId, provider });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to revoke token for ${provider}:`, error);
    return NextResponse.json({ success: false, error: 'Revocation failed' }, { status: 500 });
  }
}