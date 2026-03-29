import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Globe } from 'lucide-react';
import EventTypeCard from '@/components/booking/EventTypeCard';

async function getProfile(username: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/booking/${username}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfile(username);
  if (!data?.user) return { title: 'Not Found' };
  return {
    title: `Book with ${data.user.name}`,
    description: data.user.welcomeMessage || `Schedule a meeting with ${data.user.name}`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getProfile(username);
  if (!data?.user) notFound();

  const { user, eventTypes } = data;
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 16px 64px' }}>

        {/* Avatar + name */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0069FF 0%, #3B82F6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 16px rgba(0,105,255,0.25)',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 28 }}>{initials}</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
            {user.name}
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Schedora</p>
          {user.welcomeMessage && (
            <p style={{ fontSize: 14, color: '#6B7280', marginTop: 10, maxWidth: 360, margin: '10px auto 0' }}>
              {user.welcomeMessage}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            <Globe size={13} style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{user.timezone?.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Event type cards */}
        {eventTypes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            No event types available at this time.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {eventTypes.map((et: any) => (
              <EventTypeCard
                key={et.id}
                username={username}
                slug={et.slug}
                name={et.name}
                description={et.description}
                duration={et.duration}
                color={et.color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
