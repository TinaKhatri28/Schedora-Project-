// app/api/auth/callback/[provider]/route.ts
// Universal OAuth callback — exchanges the code for tokens and stores them

import { NextRequest, NextResponse } from 'next/server';

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

// ─── Token exchange configs per provider ──────────────────────────────────────

function getTokenConfig(provider: string, code: string, origin: string) {
  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  const configs: Record<string, { url: string; body: Record<string, string>; headers?: Record<string, string> }> = {
    zoom: {
      url: 'https://zoom.us/oauth/token',
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    'google-meet': {
      url: 'https://oauth2.googleapis.com/token',
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    'google-cal': {
      url: 'https://oauth2.googleapis.com/token',
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    teams: {
      url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        scope: 'Calendars.ReadWrite OnlineMeetings.ReadWrite offline_access',
      },
    },
    outlook: {
      url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        scope: 'Calendars.ReadWrite offline_access',
      },
    },
    slack: {
      url: 'https://slack.com/api/oauth.v2.access',
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
      },
    },
    zapier: {
      url: 'https://zapier.com/oauth/token/',
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_ZAPIER_CLIENT_ID!,
        client_secret: process.env.ZAPIER_CLIENT_SECRET!,
      },
    },
    hubspot: {
      url: 'https://api.hubapi.com/oauth/v1/token',
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      },
    },
    stripe: {
      url: 'https://connect.stripe.com/oauth/token',
      body: {
        grant_type: 'authorization_code',
        code,
        client_secret: process.env.STRIPE_SECRET_KEY!,
      },
    },
    salesforce: {
      url: 'https://login.salesforce.com/services/oauth2/token',
      body: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
      },
    },
  };

  return configs[provider] ?? null;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const integrationsUrl = `${origin}/dashboard/integrations`;

  // Provider denied access
  if (error) {
    return NextResponse.redirect(`${integrationsUrl}?error=${provider}`);
  }

  if (!code) {
    return NextResponse.redirect(`${integrationsUrl}?error=${provider}`);
  }

  const config = getTokenConfig(provider, code, origin);
  if (!config) {
    return NextResponse.redirect(`${integrationsUrl}?error=unknown_provider`);
  }

  try {
    // Exchange code → tokens
    const body = new URLSearchParams(config.body);
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(config.headers ?? {}),
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[OAuth] ${provider} token exchange failed:`, text);
      return NextResponse.redirect(`${integrationsUrl}?error=${provider}`);
    }

    const tokens: TokenResponse = await response.json();

    // TODO: Persist tokens to your database associated with the current user session
    // Example:
    // const session = await getServerSession();
    // await db.integrations.upsert({
    //   userId: session.user.id,
    //   provider,
    //   accessToken: tokens.access_token,
    //   refreshToken: tokens.refresh_token,
    //   expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    // });

    console.log(`[OAuth] ${provider} connected successfully. Token type: ${tokens.token_type}`);

    // Redirect back to integrations page with success flag
    return NextResponse.redirect(`${integrationsUrl}?connected=${provider}`);
  } catch (err) {
    console.error(`[OAuth] Unexpected error for ${provider}:`, err);
    return NextResponse.redirect(`${integrationsUrl}?error=${provider}`);
  }
}