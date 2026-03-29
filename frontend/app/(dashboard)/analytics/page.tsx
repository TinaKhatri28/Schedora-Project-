'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, CheckCircle, XCircle, Clock, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAnalytics } from '@/lib/api';

const cardAnim = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
  });

  const summary = data?.summary ?? { created: 0, completed: 0, cancelled: 0, upcoming: 0 };
  const byEventType: { name: string; color: string; count: number }[] = data?.byEventType ?? [];
  const dailyCounts: { date: string; created: number; completed: number }[] = data?.dailyCounts ?? [];

  const stats = [
    { label: 'Created events',      value: summary.created,   icon: Calendar,      color: '#006BFF', bg: '#EBF5FF' },
    { label: 'Completed events',    value: summary.completed, icon: CheckCircle,   color: '#059669', bg: '#ECFDF5' },
    { label: 'Rescheduled events',  value: 0,                 icon: Clock,         color: '#D97706', bg: '#FFFBEB' },
    { label: 'Cancelled events',    value: summary.cancelled, icon: XCircle,       color: '#DC2626', bg: '#FEF2F2' },
  ];

  // Find max for chart scaling
  const maxDaily = Math.max(...dailyCounts.map((d) => Math.max(d.created, d.completed)), 1);

  return (
    <DashboardLayout>
      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E1E3EA', marginBottom: 24 }}>
        {['Events', 'Routing'].map((tab, i) => (
          <button key={tab} style={{
            padding: '10px 16px', fontSize: 13,
            fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? '#006BFF' : '#6B7280',
            background: 'transparent', border: 'none',
            borderBottom: i === 0 ? '2px solid #006BFF' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>
            {tab}
          </button>
        ))}
      </div>

      {summary.created === 0 && !isLoading ? (
        /* ── Empty state ── */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ maxWidth: 580, margin: '40px auto', textAlign: 'center' }}
        >
          <div style={{
            background: '#fff', border: '1px solid #E1E3EA', borderRadius: 12,
            padding: '48px 32px',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #EBF5FF 0%, #F0F4FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <TrendingUp size={30} style={{ color: '#006BFF' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
              Improve team scheduling using trends from booked meetings
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Easily understand how scheduling impacts your business',
                'Demonstrate the value of proposed scheduling changes',
                'Get crucial buy-in from leaders and stakeholders',
              ].map((item) => (
                <li key={item} style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: '#006BFF', flexShrink: 0 }}>•</span> {item}
                </li>
              ))}
            </ul>
            <a href="/event-types" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#006BFF', color: '#fff', padding: '10px 22px',
              borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              <Calendar size={14} /> Book your first meeting
            </a>
          </div>
        </motion.div>
      ) : (
        <div>
          {/* ── EVENT DATA header ── */}
          <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
            Event Data
          </p>

          {/* ── Stats row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={cardAnim} initial="hidden" animate="visible"
                style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, padding: '18px 20px' }}
              >
                <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{s.value}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <s.icon size={13} style={{ color: s.color }} />
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{s.label}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <ArrowUpRight size={11} style={{ color: '#22C55E' }} />
                  <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}>0%</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
            {/* Completed events trend */}
            <div style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Completed events trend</p>
              {dailyCounts.every((d) => d.completed === 0) ? (
                <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>No data available</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
                  {dailyCounts.slice(-14).map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{
                        width: '100%', minHeight: 2,
                        height: `${(d.completed / maxDaily) * 70}px`,
                        background: '#006BFF', borderRadius: 2,
                        transition: 'height 0.3s ease',
                      }} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>
                  {dailyCounts[dailyCounts.length - 14]?.date?.slice(5) ?? ''}
                </span>
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>
                  {dailyCounts[dailyCounts.length - 1]?.date?.slice(5) ?? ''}
                </span>
              </div>
            </div>

            {/* Event distribution by duration */}
            <div style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Event distribution by duration</p>
              {byEventType.length === 0 ? (
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>No data available</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {byEventType.slice(0, 4).map((et) => (
                    <div key={et.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{et.name}</span>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{et.count}</span>
                      </div>
                      <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2 }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          background: et.color,
                          width: `${(et.count / Math.max(...byEventType.map((e) => e.count), 1)) * 100}%`,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular events */}
            <div style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Popular events</p>
              {byEventType.length === 0 ? (
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>No data available</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...byEventType].sort((a, b) => b.count - a.count).slice(0, 4).map((et, i) => (
                    <div key={et.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#9CA3AF', width: 14, flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: et.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: '#374151', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{et.name}</span>
                      <span style={{ fontSize: 11, color: '#6B7280', flexShrink: 0 }}>{et.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}