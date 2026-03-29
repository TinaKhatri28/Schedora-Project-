'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Calendar, Search, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getContacts } from '@/lib/api';
import { formatDateShort } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email: string;
  meetingCount: number;
  lastMeeting: string | null;
  meetings: {
    id: string; date: string; startTime: string;
    status: string; eventTypeName?: string; eventTypeColor?: string;
  }[];
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#006BFF', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ContactDetailPanel({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed', top: 56, right: 0, bottom: 0, width: 360,
        background: '#fff', borderLeft: '1px solid #E1E3EA',
        zIndex: 40, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #E1E3EA',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: '#fff',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Contact Details</span>
        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 6, border: '1px solid #E1E3EA',
          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280',
        }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
        {/* Contact info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Avatar name={contact.name} size={48} />
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{contact.name}</p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={11} /> {contact.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20,
        }}>
          {[
            { label: 'Total Meetings', value: contact.meetingCount, icon: <Calendar size={14} style={{ color: '#006BFF' }} /> },
            { label: 'Last Meeting', value: contact.lastMeeting ? formatDateShort(contact.lastMeeting) : 'Never', icon: <Clock size={14} style={{ color: '#059669' }} /> },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#F9FAFB', borderRadius: 8, padding: '12px 14px',
              border: '1px solid #E1E3EA',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                {s.icon}
                <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{s.label}</span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Meeting history */}
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Meeting History
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {contact.meetings.map((m) => (
            <div key={m.id} style={{
              padding: '10px 12px', borderRadius: 8,
              border: '1px solid #E1E3EA', background: '#fff',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: m.eventTypeColor ?? '#006BFF',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{m.eventTypeName ?? 'Meeting'}</p>
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{formatDateShort(m.date)} · {m.startTime}</p>
              </div>
              {m.status === 'CONFIRMED'
                ? <CheckCircle size={13} style={{ color: '#059669', flexShrink: 0 }} />
                : <XCircle size={13} style={{ color: '#DC2626', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
    select: (res: any) => res.contacts ?? [],
  });

  const contacts: Contact[] = (data ?? []).filter((c: Contact) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            style={{
              width: '100%', padding: '8px 10px 8px 32px',
              border: '1px solid #E1E3EA', borderRadius: 6,
              fontSize: 13, color: '#374151', background: '#fff', outline: 'none',
            }}
          />
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 6,
          border: '1px solid #E1E3EA', background: '#fff',
          fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer',
        }}>
          <Users size={14} />
          Add contact
        </button>
      </div>

      {/* ── Empty state ── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 64, background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '80px 20px',
            background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10,
          }}
        >
          <Users size={44} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Stay organized as you build relationships
          </p>
          <p style={{ fontSize: 13, color: '#6B7280', maxWidth: 380, margin: '0 auto 20px' }}>
            Contacts are automatically created when a meeting is booked. Share your booking link to get started.
          </p>
          <a href="/event-types" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#006BFF', color: '#fff', padding: '9px 20px',
            borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            Book your first meeting
          </a>
        </motion.div>
      ) : (
        /* ── Contact table ── */
        <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
          <div style={{ flex: 1, marginRight: selected ? 376 : 0, transition: 'margin-right 0.3s ease' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px',
              padding: '10px 16px', background: '#F9FAFB',
              border: '1px solid #E1E3EA', borderRadius: '10px 10px 0 0',
              fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <span>Name</span>
              <span>Email</span>
              <span>Meetings</span>
              <span>Last meeting</span>
            </div>

            <AnimatePresence>
              {contacts.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px',
                    padding: '12px 16px',
                    background: selected?.id === c.id ? '#EBF5FF' : '#fff',
                    border: '1px solid #E1E3EA', borderTop: 'none',
                    cursor: 'pointer', alignItems: 'center',
                    borderRadius: i === contacts.length - 1 ? '0 0 10px 10px' : 0,
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.name} size={32} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{c.email}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.meetingCount}</span>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>
                    {c.lastMeeting ? formatDateShort(c.lastMeeting) : '—'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {selected && (
              <ContactDetailPanel contact={selected} onClose={() => setSelected(null)} />
            )}
          </AnimatePresence>
        </div>
      )}
    </DashboardLayout>
  );
}