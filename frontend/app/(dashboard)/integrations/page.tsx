'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, ExternalLink, X, Loader2, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// ─── SVG Logos ────────────────────────────────────────────────────────────────

const ZoomLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#2D8CFF" />
    <path d="M10 22a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V22z" fill="#fff" />
    <path d="M42 27.5l10-6v15l-10-6V27.5z" fill="#fff" />
  </svg>
);

const GoogleMeetLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#fff" />
    <path d="M38 20H18a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V24a4 4 0 0 0-4-4z" fill="#00832D" />
    <path d="M42 27l10-6v16l-10-6V27z" fill="#00832D" />
    <path d="M42 27l10-6v4l-10 6V27z" fill="#00AC47" />
    <path d="M42 37l10 6v-4l-10-6v4z" fill="#00AC47" />
    <path d="M14 36.5V40a4 4 0 0 0 4 4h3.5L14 36.5z" fill="#0066DA" />
    <path d="M21.5 44H38a4 4 0 0 0 4-4v-3.5L21.5 44z" fill="#2684FC" />
    <path d="M42 36.5L21.5 44l-7.5-7.5L35 28.5 42 36.5z" fill="#00AC47" />
    <path d="M35 28.5L14 36.5l7.5-16.5H38a4 4 0 0 1 4 4v.5L35 28.5z" fill="#00832D" />
  </svg>
);

const TeamsLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#5059C9" />
    <circle cx="40" cy="20" r="7" fill="#7B83EB" />
    <path d="M47 28H33a2 2 0 0 0-2 2v12a10 10 0 0 0 10 10 10 10 0 0 0 10-10V30a2 2 0 0 0-2-2h-2z" fill="#7B83EB" />
    <circle cx="25" cy="22" r="8" fill="#fff" fillOpacity=".9" />
    <path d="M34 32H16a2 2 0 0 0-2 2v11a9 9 0 0 0 9 9 9 9 0 0 0 9-9V34a2 2 0 0 0-2-2z" fill="#4B53BC" />
  </svg>
);

const GoogleCalLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#fff" />
    <rect x="10" y="14" width="44" height="40" rx="4" fill="#fff" stroke="#DADCE0" strokeWidth="2" />
    <rect x="10" y="14" width="44" height="12" rx="4" fill="#1A73E8" />
    <rect x="10" y="20" width="44" height="6" fill="#1A73E8" />
    <rect x="21" y="10" width="4" height="10" rx="2" fill="#1A73E8" />
    <rect x="39" y="10" width="4" height="10" rx="2" fill="#1A73E8" />
    <text x="32" y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1A73E8" fontFamily="Arial">31</text>
  </svg>
);

const OutlookLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#0078D4" />
    <rect x="30" y="16" width="24" height="18" rx="2" fill="#fff" fillOpacity=".9" />
    <path d="M30 20l12 8 12-8" stroke="#0078D4" strokeWidth="1.5" fill="none" />
    <rect x="8" y="20" width="26" height="24" rx="3" fill="#fff" />
    <ellipse cx="21" cy="32" rx="6" ry="7" fill="#0078D4" />
  </svg>
);

const SlackLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#fff" />
    <rect x="24" y="8" width="8" height="20" rx="4" fill="#E01E5A" />
    <rect x="8" y="24" width="20" height="8" rx="4" fill="#E01E5A" />
    <rect x="8" y="24" width="8" height="8" rx="4" fill="#E01E5A" fillOpacity=".6" />
    <rect x="32" y="36" width="8" height="20" rx="4" fill="#36C5F0" />
    <rect x="36" y="32" width="20" height="8" rx="4" fill="#36C5F0" />
    <rect x="48" y="32" width="8" height="8" rx="4" fill="#36C5F0" fillOpacity=".6" />
    <rect x="8" y="32" width="8" height="20" rx="4" fill="#2EB67D" />
    <rect x="8" y="36" width="20" height="8" rx="4" fill="#2EB67D" />
    <rect x="8" y="48" width="8" height="8" rx="4" fill="#2EB67D" fillOpacity=".6" />
    <rect x="36" y="8" width="8" height="20" rx="4" fill="#ECB22E" />
    <rect x="36" y="24" width="20" height="8" rx="4" fill="#ECB22E" />
    <rect x="48" y="24" width="8" height="8" rx="4" fill="#ECB22E" fillOpacity=".6" />
  </svg>
);

const ZapierLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#FF4A00" />
    <path d="M32 10L10 32l22 22 22-22L32 10z" fill="#fff" fillOpacity=".2" />
    <text x="32" y="40" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff" fontFamily="Arial">Z</text>
  </svg>
);

const HubSpotLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#FF7A59" />
    <circle cx="40" cy="20" r="7" fill="#fff" />
    <circle cx="40" cy="20" r="4" fill="#FF7A59" />
    <path d="M33 20h-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="M24 20v16a8 8 0 0 0 8 8 8 8 0 0 0 8-8V28" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#635BFF" />
    <path d="M30 26c0-2 1.5-3 4-3 3.5 0 7 1 9.5 2.5V16C41 14.5 37.5 14 34 14c-7 0-12 3.5-12 10 0 10 14 8.5 14 13 0 2.5-2 3.5-4.5 3.5-4 0-8-1.5-11-3.5v9.5c3 1.5 6.5 2.5 11 2.5 7.5 0 12.5-3.5 12.5-10.5C44 28.5 30 30 30 26z" fill="#fff" />
  </svg>
);

const SalesforceLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#00A1E0" />
    <path d="M26 18a8 8 0 0 1 6.5 3.3A9 9 0 0 1 38 20a9 9 0 0 1 9 9 9 9 0 0 1-9 9H20a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 2 .3A8 8 0 0 1 26 18z" fill="#fff" />
  </svg>
);

const NotionLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
    <path d="M18 14h18l12 12v24H18V14z" fill="#fff" stroke="#111827" strokeWidth="2" />
    <path d="M36 14v12h12" fill="none" stroke="#111827" strokeWidth="2" />
    <rect x="22" y="28" width="16" height="2" rx="1" fill="#111827" />
    <rect x="22" y="33" width="20" height="2" rx="1" fill="#111827" />
    <rect x="22" y="38" width="12" height="2" rx="1" fill="#111827" />
  </svg>
);

const LinearLogo = () => (
  <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#5E6AD2" />
    <path d="M14 42L36 14l14 14-26 22-14-8z" fill="#fff" fillOpacity=".3" />
    <path d="M14 42l14-28 16 16-22 18-8-6z" fill="#fff" fillOpacity=".5" />
    <path d="M18 40l12-22 12 12-18 16-6-6z" fill="#fff" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Integration = {
  id: string;
  name: string;
  description: string;
  logo: React.ReactNode;
  category: string;
  oauthUrl: string;
  connectedKey: string;
};

// ─── OAuth URL builders ───────────────────────────────────────────────────────

const GOOGLE_OAUTH = () =>
  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/google')}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/meetings.space.created')}&access_type=offline&prompt=consent`;

const ZOOM_OAUTH = () =>
  `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/zoom')}`;

const MICROSOFT_OAUTH = () =>
  `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/microsoft')}&scope=${encodeURIComponent('Calendars.ReadWrite OnlineMeetings.ReadWrite offline_access')}&response_mode=query`;

const SLACK_OAUTH = () =>
  `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=chat:write,channels:read&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/slack')}`;

const ZAPIER_OAUTH = () =>
  `https://zapier.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_ZAPIER_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/zapier')}&response_type=code`;

const HUBSPOT_OAUTH = () =>
  `https://app.hubspot.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/hubspot')}&scope=contacts%20content`;

const STRIPE_OAUTH = () =>
  `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/stripe')}`;

const SALESFORCE_OAUTH = () =>
  `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/callback/salesforce')}`;

// ─── Integration data ─────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  { id: 'zoom', name: 'Zoom', description: 'Auto-generate Zoom links for every meeting you book.', logo: <ZoomLogo />, category: 'VIDEO CONFERENCING', oauthUrl: '', connectedKey: 'zoom_connected' },
  { id: 'google-meet', name: 'Google Meet', description: 'Add Google Meet links automatically to your events.', logo: <GoogleMeetLogo />, category: 'VIDEO CONFERENCING', oauthUrl: '', connectedKey: 'google_meet_connected' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Create Teams meeting links for every scheduled event.', logo: <TeamsLogo />, category: 'VIDEO CONFERENCING', oauthUrl: '', connectedKey: 'teams_connected' },
  { id: 'google-cal', name: 'Google Calendar', description: 'Sync events and prevent double-bookings in real time.', logo: <GoogleCalLogo />, category: 'CALENDARS', oauthUrl: '', connectedKey: 'google_cal_connected' },
  { id: 'outlook', name: 'Outlook Calendar', description: 'Connect Outlook to keep your schedule in sync.', logo: <OutlookLogo />, category: 'CALENDARS', oauthUrl: '', connectedKey: 'outlook_connected' },
  { id: 'slack', name: 'Slack', description: 'Get instant booking notifications in your Slack channels.', logo: <SlackLogo />, category: 'PRODUCTIVITY', oauthUrl: '', connectedKey: 'slack_connected' },
  { id: 'notion', name: 'Notion', description: 'Log meetings and contacts directly into Notion pages.', logo: <NotionLogo />, category: 'PRODUCTIVITY', oauthUrl: '', connectedKey: 'notion_connected' },
  { id: 'linear', name: 'Linear', description: 'Attach meetings to Linear issues and projects automatically.', logo: <LinearLogo />, category: 'PRODUCTIVITY', oauthUrl: '', connectedKey: 'linear_connected' },
  { id: 'zapier', name: 'Zapier', description: 'Connect Clandely to 5,000+ apps with no-code automation.', logo: <ZapierLogo />, category: 'AUTOMATION', oauthUrl: '', connectedKey: 'zapier_connected' },
  { id: 'hubspot', name: 'HubSpot', description: 'Sync contacts and log meetings to HubSpot CRM.', logo: <HubSpotLogo />, category: 'AUTOMATION', oauthUrl: '', connectedKey: 'hubspot_connected' },
  { id: 'stripe', name: 'Stripe', description: 'Collect payments when someone books a paid event.', logo: <StripeLogo />, category: 'PAYMENTS', oauthUrl: '', connectedKey: 'stripe_connected' },
  { id: 'salesforce', name: 'Salesforce', description: 'Push meeting data and contacts to Salesforce automatically.', logo: <SalesforceLogo />, category: 'PAYMENTS', oauthUrl: '', connectedKey: 'salesforce_connected' },
];

const OAUTH_BUILDERS: Record<string, () => string> = {
  zoom: ZOOM_OAUTH,
  'google-meet': GOOGLE_OAUTH,
  'google-cal': GOOGLE_OAUTH,
  teams: MICROSOFT_OAUTH,
  outlook: MICROSOFT_OAUTH,
  slack: SLACK_OAUTH,
  zapier: ZAPIER_OAUTH,
  hubspot: HUBSPOT_OAUTH,
  stripe: STRIPE_OAUTH,
  salesforce: SALESFORCE_OAUTH,
};

const CATEGORY_ORDER = ['VIDEO CONFERENCING', 'CALENDARS', 'PRODUCTIVITY', 'AUTOMATION', 'PAYMENTS'];

// ─── Disconnect confirmation modal ────────────────────────────────────────────

function DisconnectModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14, padding: '28px 28px 24px',
          width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: '#FEF2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertCircle size={20} style={{ color: '#EF4444' }} />
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Disconnect {name}?</p>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
          This will remove the {name} integration from your account. Your existing scheduled events won&apos;t be affected, but new bookings won&apos;t use {name}.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #E5E7EB',
              background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
              background: '#EF4444', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Integration card ──────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  connected,
  loading,
  onConnect,
  onDisconnect,
}: {
  integration: Integration;
  connected: boolean;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        border: `1.5px solid ${connected ? '#BBF7D0' : '#E5E7EB'}`,
        borderRadius: 14,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative',
        minHeight: 180,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: connected ? '0 0 0 3px rgba(34,197,94,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Connected badge */}
      {connected && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 4,
          background: '#F0FDF4', border: '1px solid #BBF7D0',
          borderRadius: 20, padding: '3px 8px',
        }}>
          <CheckCircle2 size={11} style={{ color: '#16A34A' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>Connected</span>
        </div>
      )}

      {/* Logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#F9FAFB', border: '1px solid #F3F4F6',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {integration.logo}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{integration.name}</p>
          <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{integration.description}</p>
        </div>
      </div>

      {/* Action button */}
      {connected ? (
        <button
          onClick={onDisconnect}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 8,
            border: '1.5px solid #E5E7EB', background: '#fff',
            fontSize: 12, fontWeight: 600, color: '#374151',
            cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
            marginTop: 'auto',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#FECACA';
            (e.currentTarget as HTMLButtonElement).style.color = '#EF4444';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB';
            (e.currentTarget as HTMLButtonElement).style.color = '#374151';
          }}
        >
          Disconnect
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={loading}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 8,
            border: 'none', background: loading ? '#93C5FD' : '#006BFF',
            fontSize: 12, fontWeight: 600, color: '#fff',
            cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: 'auto', transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#0057D9';
          }}
          onMouseLeave={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#006BFF';
          }}
        >
          {loading ? (
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <ExternalLink size={12} />
          )}
          {loading ? 'Connecting…' : 'Connect'}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'manage'>('discover');
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null);

  useEffect(() => {
    const stored: Record<string, boolean> = {};
    INTEGRATIONS.forEach((i) => {
      stored[i.id] = localStorage.getItem(i.connectedKey) === 'true';
    });
    setConnections(stored);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedId = params.get('connected');
    const errorId = params.get('error');
    if (connectedId) {
      const integration = INTEGRATIONS.find((i) => i.id === connectedId);
      if (integration) {
        localStorage.setItem(integration.connectedKey, 'true');
        setConnections((prev) => ({ ...prev, [connectedId]: true }));
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    if (errorId) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnect = (integration: Integration) => {
    setLoadingId(integration.id);
    const builder = OAUTH_BUILDERS[integration.id];
    if (builder) {
      try {
        const url = builder();
        window.location.href = url;
      } catch {
        window.open(`https://${integration.id}.com`, '_blank');
        setLoadingId(null);
      }
    } else {
      const fallbacks: Record<string, string> = {
        notion: 'https://www.notion.so/integrations',
        linear: 'https://linear.app/settings/api',
      };
      window.open(fallbacks[integration.id] ?? 'https://clandely.com', '_blank');
      setLoadingId(null);
    }
  };

  const handleDisconnect = (integration: Integration) => {
    localStorage.removeItem(integration.connectedKey);
    setConnections((prev) => ({ ...prev, [integration.id]: false }));
    setDisconnectTarget(null);
    fetch(`/api/integrations/${integration.id}/disconnect`, { method: 'DELETE' }).catch(() => {});
  };

  const connectedIntegrations = INTEGRATIONS.filter((i) => connections[i.id]);

  const filteredIntegrations = INTEGRATIONS.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByCategory = CATEGORY_ORDER.reduce<Record<string, Integration[]>>((acc, cat) => {
    const items = filteredIntegrations.filter((i) => i.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Integrations & apps</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Connect your favorite tools to supercharge your scheduling workflow.
        </p>
      </div>

      {/* ── Getting started banner ── */}
      {connectedIntegrations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: 12, padding: '18px 22px', marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', marginBottom: 4 }}>Getting Started</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1E3A5F', marginBottom: 4 }}>Clandely works where you work</p>
          <p style={{ fontSize: 13, color: '#4B5563' }}>Connect your favorite calendars, tools, and apps to enhance your scheduling.</p>
        </motion.div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
        {(['discover', 'manage'] as const).map((tab) => {
          const count = tab === 'discover' ? INTEGRATIONS.length : connectedIntegrations.length;
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px', fontSize: 13, fontWeight: 600,
                color: active ? '#006BFF' : '#6B7280',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${active ? '#006BFF' : 'transparent'}`,
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
                transition: 'color 0.15s',
              }}
            >
              {tab === 'discover' ? 'Discover' : 'Manage'}
              <span style={{
                background: active ? '#006BFF' : tab === 'manage' && connectedIntegrations.length > 0 ? '#10B981' : '#E5E7EB',
                color: active || (tab === 'manage' && connectedIntegrations.length > 0) ? '#fff' : '#6B7280',
                borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      {activeTab === 'discover' && (
        <div style={{ position: 'relative', marginBottom: 28, maxWidth: 380 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find integrations, apps, and more"
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              border: '1.5px solid #E5E7EB', borderRadius: 8,
              fontSize: 13, color: '#374151', background: '#fff',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#006BFF'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'; }}
          />
        </div>
      )}

      {/* ── Discover tab ── */}
      {activeTab === 'discover' && (
        <div>
          {Object.keys(groupedByCategory).length === 0 ? (
            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>
              No integrations found for &quot;{search}&quot;
            </p>
          ) : (
            Object.entries(groupedByCategory).map(([category, items]) => (
              <div key={category} style={{ marginBottom: 36 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em',
                  marginBottom: 14, textTransform: 'uppercase',
                }}>{category}</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: category === 'VIDEO CONFERENCING'
                    ? 'repeat(3, 1fr)'
                    : category === 'CALENDARS'
                    ? 'repeat(2, 1fr)'
                    : 'repeat(3, 1fr)',
                  gap: 14,
                }}>
                  {items.map((integration, i) => (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <IntegrationCard
                        integration={integration}
                        connected={!!connections[integration.id]}
                        loading={loadingId === integration.id}
                        onConnect={() => handleConnect(integration)}
                        onDisconnect={() => setDisconnectTarget(integration)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Manage tab ── */}
      {activeTab === 'manage' && (
        <div>
          {connectedIntegrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <ExternalLink size={22} style={{ color: '#9CA3AF' }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No integrations connected</p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                Head to the Discover tab to connect your first integration.
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                style={{
                  padding: '9px 20px', borderRadius: 8, border: 'none',
                  background: '#006BFF', color: '#fff', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Browse integrations
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
            }}>
              {connectedIntegrations.map((integration, i) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <IntegrationCard
                    integration={integration}
                    connected
                    loading={false}
                    onConnect={() => {}}
                    onDisconnect={() => setDisconnectTarget(integration)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Disconnect modal ── */}
      <AnimatePresence>
        {disconnectTarget && (
          <DisconnectModal
            name={disconnectTarget.name}
            onConfirm={() => handleDisconnect(disconnectTarget)}
            onCancel={() => setDisconnectTarget(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}