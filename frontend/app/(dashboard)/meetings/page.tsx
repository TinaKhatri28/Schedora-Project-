'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Mail, XCircle, Clock, CheckCircle, Video, ChevronDown, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getMeetings, cancelMeeting } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { Meeting } from '@/lib/types';

type Filter = 'upcoming' | 'past' | 'date-range';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
  borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'CONFIRMED')
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, background: 'rgba(5,150,105,0.08)', color: '#059669' }}>
        <CheckCircle size={10} /> Confirmed
      </span>
    );
  if (status === 'CANCELLED')
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>
        <XCircle size={10} /> Cancelled
      </span>
    );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, background: '#F3F4F6', color: '#6B7280' }}>
      {status}
    </span>
  );
}

// ─── Date Range Dropdown ──────────────────────────────────────────────────────

function DateRangeDropdown({
  startDate, endDate,
  onApply, onClose,
}: {
  startDate: string; endDate: string;
  onApply: (start: string, end: string) => void; onClose: () => void;
}) {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const today = new Date().toISOString().split('T')[0];

  // Quick presets
  const presets = [
    { label: 'This week', getDates: () => {
        const now = new Date();
        const day = now.getDay();
        const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        return [mon.toISOString().split('T')[0], sun.toISOString().split('T')[0]];
      }
    },
    { label: 'This month', getDates: () => {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        return [first, last];
      }
    },
    { label: 'Last 30 days', getDates: () => {
        const now = new Date();
        const past = new Date(now); past.setDate(now.getDate() - 30);
        return [past.toISOString().split('T')[0], now.toISOString().split('T')[0]];
      }
    },
    { label: 'Last 90 days', getDates: () => {
        const now = new Date();
        const past = new Date(now); past.setDate(now.getDate() - 90);
        return [past.toISOString().split('T')[0], now.toISOString().split('T')[0]];
      }
    },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 44, left: 0, background: '#fff',
      border: '1px solid #E1E3EA', borderRadius: 12, zIndex: 300,
      minWidth: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: 16,
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Select date range</p>

      {/* Quick presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {presets.map(({ label, getDates }) => {
          const [s, e] = getDates();
          const isActive = start === s && end === e;
          return (
            <button key={label} onClick={() => { setStart(s); setEnd(e); }}
              style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${isActive ? '#006BFF' : '#E5E7EB'}`,
                background: isActive ? '#EFF6FF' : '#fff',
                color: isActive ? '#006BFF' : '#374151',
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Custom date inputs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>From</label>
          <input type="date" style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>To</label>
          <input type="date" style={inputStyle} value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      {/* Display selected range */}
      {start && end && (
        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
          {new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {' → '}
          {new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          Cancel
        </button>
        <button
          onClick={() => { if (start && end) { onApply(start, end); onClose(); } }}
          disabled={!start || !end}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 7, border: 'none',
            background: start && end ? '#006BFF' : '#D1D5DB',
            fontSize: 12, fontWeight: 600, cursor: start && end ? 'pointer' : 'not-allowed', color: '#fff',
          }}>
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [showBuffers, setShowBuffers] = useState(true);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const qc = useQueryClient();

  // API filter: for date-range, still fetch all and filter client-side
  const apiFilter = filter === 'date-range' ? 'all' : filter;

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ['meetings', apiFilter],
    queryFn: () => getMeetings(apiFilter as 'upcoming' | 'past' | 'all'),
    select: (res: any) => res.meetings ?? [],
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMeeting,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }); toast.success('Meeting cancelled'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCancel = (id: string, name: string) => {
    if (confirm(`Cancel meeting with ${name}?`)) cancelMutation.mutate(id);
  };

  // Client-side date filtering when in date-range mode
  const displayedMeetings = filter === 'date-range' && dateStart && dateEnd
    ? meetings.filter((m) => {
        const d = m.date?.split('T')[0] ?? '';
        return d >= dateStart && d <= dateEnd;
      })
    : meetings;

  const TABS: { id: Filter; label: string; hasDropdown?: boolean }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
    { id: 'date-range', label: 'Date Range', hasDropdown: true },
  ];

  return (
    <DashboardLayout>
      {/* ── Top toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: '1px solid #E1E3EA', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' }}>
          My Schedora <ChevronDown size={14} style={{ color: '#9CA3AF' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
            <span style={{ fontWeight: 500 }}>Show buffers</span>
            <button onClick={() => setShowBuffers((b) => !b)} style={{ width: 36, height: 20, borderRadius: 10, border: 'none', background: showBuffers ? '#006BFF' : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 2, left: showBuffers ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #E1E3EA', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E1E3EA', marginBottom: 20 }}>
        {TABS.map((tab) => {
          const active = filter === tab.id;
          return (
            <div key={tab.id} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setFilter(tab.id);
                  if (tab.id === 'date-range') setDateRangeOpen((o) => !o);
                  else setDateRangeOpen(false);
                }}
                style={{
                  padding: '10px 16px', fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#006BFF' : '#6B7280',
                  background: 'transparent', border: 'none',
                  borderBottom: active ? '2px solid #006BFF' : '2px solid transparent',
                  cursor: 'pointer', marginBottom: -1,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#111827'; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#6B7280'; }}
              >
                {tab.label}
                {tab.hasDropdown && <ChevronDown size={12} style={{ color: active ? '#006BFF' : '#9CA3AF' }} />}
              </button>

              {/* Date range badge under tab */}
              {tab.id === 'date-range' && active && dateStart && dateEnd && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11, color: '#006BFF', background: '#EFF6FF', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                    {new Date(dateStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' – '}
                    {new Date(dateEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Date range dropdown */}
              {tab.id === 'date-range' && dateRangeOpen && (
                <DateRangeDropdown
                  startDate={dateStart}
                  endDate={dateEnd}
                  onApply={(s, e) => { setDateStart(s); setDateEnd(e); }}
                  onClose={() => setDateRangeOpen(false)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Date range active indicator ── */}
      {filter === 'date-range' && dateStart && dateEnd && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, marginBottom: 16, marginTop: 8 }}>
          <Calendar size={13} style={{ color: '#006BFF' }} />
          <span style={{ fontSize: 13, color: '#006BFF', fontWeight: 500 }}>
            Showing meetings from {new Date(dateStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to {new Date(dateEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={() => { setDateStart(''); setDateEnd(''); setFilter('upcoming'); }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#006BFF', fontSize: 12, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>
            Clear ×
          </button>
        </div>
      )}

      {/* ── Date range prompt (no dates selected yet) ── */}
      {filter === 'date-range' && (!dateStart || !dateEnd) && !dateRangeOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, marginTop: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Calendar size={22} style={{ color: '#006BFF' }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Select a date range</p>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Click &quot;Date Range&quot; tab above to pick your dates.</p>
          <button onClick={() => setDateRangeOpen(true)} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#006BFF', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Choose dates
          </button>
        </motion.div>
      )}

      {/* ── Content ── */}
      {(filter !== 'date-range' || (dateStart && dateEnd)) && (
        isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 80, background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10 }} />
            ))}
          </div>
        ) : displayedMeetings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Calendar size={44} style={{ color: '#D1D5DB' }} />
              <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#6B7280', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No Events Yet</p>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              {filter === 'date-range'
                ? 'No meetings found in the selected date range.'
                : 'Share Event Type links to schedule events.'}
            </p>
            <a href="/scheduling" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#006BFF', color: '#fff', padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              View Event Types
            </a>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayedMeetings.map((m, i) => (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                  style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: (m.eventType?.color ?? '#006BFF') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={18} style={{ color: m.eventType?.color ?? '#006BFF' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{m.inviteeName}</p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={11} /> {m.inviteeEmail}
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                      {m.eventType?.name} · {m.duration} min
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{formatDate(m.date)}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: 0, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <Clock size={11} /> {formatTime(m.startTime)} – {formatTime(m.endTime)}
                    </p>
                    {filter === 'upcoming' && m.status === 'CONFIRMED' && (
                      <button onClick={() => handleCancel(m.id, m.inviteeName)} disabled={cancelMutation.isPending}
                        style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(220,38,38,0.3)', background: 'transparent', color: '#DC2626' }}>
                        <XCircle size={11} /> Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )
      )}
    </DashboardLayout>
  );
}