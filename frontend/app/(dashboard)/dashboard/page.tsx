'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ArrowUpRight, TrendingUp, TrendingDown, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getMeetings, getEventTypes } from '@/lib/api';
import { formatDateShort, formatTime } from '@/lib/utils';
import { Meeting, EventType } from '@/lib/types';

const cardAnim = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

export default function DashboardPage() {
  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ['meetings', 'all'],
    queryFn: () => getMeetings('all'),
    select: (res: any) => res.meetings ?? [],
  });

  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: ['eventTypes'],
    queryFn: getEventTypes,
    select: (res: any) => res.eventTypes ?? [],
  });

  const today = new Date().toISOString().split('T')[0];
  const upcoming = meetings.filter((m) => m.date >= today && m.status === 'CONFIRMED');
  const completed = meetings.filter((m) => m.date < today && m.status === 'CONFIRMED');
  const cancelled = meetings.filter((m) => m.status === 'CANCELLED');

  return (
    <DashboardLayout>

      {/* ── Top promo banner (Calendly "No Analytics Yet" card) ── */}
      <motion.div
        custom={0} variants={cardAnim} initial="hidden" animate="visible"
        style={{
          background: '#fff',
          border: '1px solid #E1E3EA',
          borderRadius: 12,
          padding: '28px 32px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, fontWeight: 500 }}>
            No Analytics Yet
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12, lineHeight: 1.3 }}>
            Monitor your organization in one place
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Identify if new users need help with setup tasks',
              "Track your team's weekly meeting activity",
              'Use quick links to view team and analytics details',
            ].map((item) => (
              <li key={item} style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#006BFF', marginTop: 1, flexShrink: 0 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="#"
              style={{
                fontSize: 13, color: '#006BFF', fontWeight: 500,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Learn more <ArrowRight size={13} />
            </a>
            <Link
              href="/event-types"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#006BFF', color: '#fff',
                padding: '8px 18px', borderRadius: 6,
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#0052CC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#006BFF'; }}
            >
              <Users size={14} />
              Invite a teammate
            </Link>
          </div>
        </div>

        {/* Right illustration — connected graph */}
        <div
          style={{
            flexShrink: 0,
            width: 220,
            height: 140,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="hidden lg:flex"
        >
          {/* Dashed border box */}
          <div style={{
            width: 190, height: 120,
            border: '2px dashed #93C5FD',
            borderRadius: 12,
            position: 'relative',
            background: 'linear-gradient(135deg, #EBF5FF 0%, #F0F9FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Connected badge */}
            <div style={{
              position: 'absolute', top: -14, left: 16,
              background: '#fff', border: '1px solid #E1E3EA',
              borderRadius: 20, padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 600, color: '#374151',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
              Connected
              <div style={{ display: 'flex', marginLeft: 4 }}>
                {['#006BFF','#22C55E','#F59E0B','#EF4444'].map((c, i) => (
                  <div key={i} style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: c, border: '2px solid #fff',
                    marginLeft: i > 0 ? -6 : 0,
                  }} />
                ))}
              </div>
            </div>

            {/* Mini chart lines */}
            <svg width="130" height="60" viewBox="0 0 130 60">
              <polyline points="0,50 25,35 50,45 75,20 100,30 130,10"
                fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
              <polyline points="0,55 25,45 50,50 75,38 100,42 130,28"
                fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* Completed events label */}
            <div style={{
              position: 'absolute', bottom: -14, right: 12,
              background: '#fff', border: '1px solid #E1E3EA',
              borderRadius: 6, padding: '4px 8px',
              fontSize: 10, color: '#6B7280',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}>
              Completed events
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Activity stats row ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Activity last week</span>
          <Link href="/analytics" style={{ fontSize: 12, color: '#006BFF', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            View Analytics <ArrowUpRight size={12} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Created events',   value: meetings.length,    delta: '0%' },
            { label: 'Completed events', value: completed.length,   delta: '0%' },
            { label: 'Cancelled events', value: cancelled.length,   delta: '0%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i + 1} variants={cardAnim} initial="hidden" animate="visible"
              style={{
                background: '#fff',
                border: '1px solid #E1E3EA',
                borderRadius: 10,
                padding: '20px 20px 16px',
              }}
            >
              <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px' }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={12} style={{ color: '#22C55E' }} />
                <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}>{stat.delta}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Upcoming meetings section ── */}
      <motion.div
        custom={4} variants={cardAnim} initial="hidden" animate="visible"
        style={{
          background: '#fff',
          border: '1px solid #E1E3EA',
          borderRadius: 10,
          marginTop: 24,
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #E1E3EA',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
            Upcoming Meetings
          </h3>
          <Link
            href="/meetings"
            style={{ fontSize: 13, color: '#006BFF', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div>
          {upcoming.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Calendar size={32} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>No upcoming meetings</p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
                Share your booking link to get meetings scheduled.
              </p>
            </div>
          ) : (
            upcoming.slice(0, 5).map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: '1px solid #F3F4F6',
                }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: m.eventType?.color ?? '#006BFF',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.inviteeName}
                  </p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.eventType?.name}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 }}>{formatDateShort(m.date)}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{formatTime(m.startTime)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}