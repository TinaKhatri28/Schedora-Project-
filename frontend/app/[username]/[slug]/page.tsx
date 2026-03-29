'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, Globe, Video,
  ArrowLeft, User, Mail, MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getBookingEventType, getAvailableSlots, createBooking } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function calendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= last; d++) days.push(d);
  return days;
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

type Step = 'calendar' | 'form';

export default function BookingPage() {
  const params = useParams();
  const username = params?.username as string;
  const slug = params?.slug as string;
  const router = useRouter();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('calendar');
  const [form, setForm] = useState({ name: '', email: '', notes: '' });
  const [errors, setErrors] = useState({ name: '', email: '' });

  const { data: eventData, isLoading: loadingEvent } = useQuery({
    queryKey: ['booking-event', username, slug],
    queryFn: () => getBookingEventType(username, slug),
    enabled: !!username && !!slug,
  });

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', username, slug, selectedDate],
    queryFn: () => getAvailableSlots(username, slug, selectedDate!),
    enabled: !!username && !!slug && !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: (data: any) => createBooking(username, slug, data),
    onSuccess: (res) => {
      router.push(`/${username}/${slug}/confirmed?meetingId=${res.meeting?.id || ''}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const eventType = eventData?.eventType;
  const user = eventData?.user;
  const slots: string[] = slotsData?.slots || [];
  const days = calendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(23, 59, 59);
    return d < today;
  };

  const validate = () => {
    const e = { name: '', email: '' };
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    setErrors(e);
    return !e.name && !e.email;
  };

  const handleBook = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!validate()) return;
    bookMutation.mutate({ ...form, date: selectedDate, startTime: selectedTime });
  };

  if (!username || !slug || loadingEvent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!eventType) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontWeight: 600, color: '#111827' }}>Event type not found</p>
        <button onClick={() => router.back()} style={{ color: '#0069FF', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Go back
        </button>
      </div>
    );
  }

  /* ── Shared left panel ─────────────────────────────── */
  const LeftPanel = (
    <div
      style={{
        padding: '32px 28px', borderRight: '1px solid #E5E7EB',
        minWidth: 260, maxWidth: 300, flexShrink: 0,
      }}
    >
      {/* Back */}
      <button
        onClick={() => step === 'form' ? setStep('calendar') : router.push(`/${username}`)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0 }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Host avatar */}
      <div
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0069FF 0%, #3B82F6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 12,
        }}
      >
        TK
      </div>

      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 4px' }}>{user?.name}</p>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 20px', lineHeight: 1.3 }}>
        {eventType.name}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} style={{ color: '#0069FF', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#374151' }}>{eventType.duration} minutes</span>
        </div>
        {eventType.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Video size={14} style={{ color: '#0069FF', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#374151' }}>{eventType.location}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={14} style={{ color: '#0069FF', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#374151' }}>
            {slotsData?.timezone || user?.timezone || 'Local time'}
          </span>
        </div>
      </div>

      {eventType.description && (
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 16, lineHeight: 1.6 }}>
          {eventType.description}
        </p>
      )}

      {/* Selected datetime pill */}
      {selectedDate && selectedTime && (
        <div
          style={{
            marginTop: 20, padding: '10px 14px', background: '#EFF6FF',
            border: '1px solid #BFDBFE', borderRadius: 8,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#0069FF', marginBottom: 2 }}>Selected</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
          <p style={{ fontSize: 13, color: '#3B82F6' }}>{formatTime(selectedTime)}</p>
        </div>
      )}
    </div>
  );

  /* ── Calendar step ──────────────────────────────────── */
  const CalendarPanel = (
    <motion.div
      key="calendar"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      style={{ flex: 1, padding: 32 }}
    >
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#9CA3AF', paddingBottom: 6 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const past = isPast(day);
          const sel = dateStr === selectedDate;
          return (
            <button
              key={day}
              onClick={() => { if (!past) { setSelectedDate(dateStr); setSelectedTime(null); } }}
              disabled={past}
              style={{
                height: 36, borderRadius: 6, border: 'none', cursor: past ? 'default' : 'pointer',
                background: sel ? '#0069FF' : 'transparent',
                color: past ? '#D1D5DB' : sel ? '#fff' : '#111827',
                fontWeight: sel ? 600 : 400, fontSize: 13,
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { if (!past && !sel) (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF'; }}
              onMouseLeave={(e) => { if (!past && !sel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div style={{ marginTop: 28 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 12 }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {loadingSlots ? (
            <LoadingSpinner size="sm" />
          ) : slots.length === 0 ? (
            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', padding: '20px 0', background: '#F9FAFB', borderRadius: 8 }}>
              No available slots on this day
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  style={{
                    padding: '10px 16px', borderRadius: 6,
                    border: `1px solid ${selectedTime === slot ? '#0069FF' : '#E5E7EB'}`,
                    background: selectedTime === slot ? '#EFF6FF' : '#fff',
                    color: selectedTime === slot ? '#0069FF' : '#374151',
                    fontWeight: selectedTime === slot ? 600 : 400,
                    fontSize: 14, cursor: 'pointer', transition: 'all 0.12s',
                    textAlign: 'left',
                  }}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
          {selectedTime && (
            <button
              onClick={() => setStep('form')}
              style={{
                marginTop: 16, width: '100%', padding: '11px 0',
                background: '#0069FF', color: '#fff', border: 'none',
                borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              Next →
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  /* ── Form step ──────────────────────────────────────── */
  const FormPanel = (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      style={{ flex: 1, padding: 32 }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
        Enter your details
      </h2>
      <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={13} /> Name *
          </label>
          <input
            className="input"
            placeholder="Your full name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={errors.name ? { borderColor: '#DC2626' } : {}}
          />
          {errors.name && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.name}</p>}
        </div>
        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={13} /> Email *
          </label>
          <input
            className="input"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={errors.email ? { borderColor: '#DC2626' } : {}}
          />
          {errors.email && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.email}</p>}
        </div>
        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={13} /> Additional notes (optional)
          </label>
          <textarea
            className="input"
            placeholder="Anything you'd like to share..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={4}
            style={{ resize: 'none' }}
          />
        </div>
        <button
          type="submit"
          disabled={bookMutation.isPending}
          style={{
            padding: '12px 0', background: '#0069FF', color: '#fff',
            border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14,
            cursor: bookMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: bookMutation.isPending ? 0.7 : 1,
          }}
        >
          {bookMutation.isPending ? 'Scheduling…' : 'Schedule Event'}
        </button>
      </form>
    </motion.div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px 64px', fontFamily: 'Inter,sans-serif' }}>
      <div
        style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          display: 'flex', width: '100%', maxWidth: 860, overflow: 'hidden',
          minHeight: 560,
        }}
      >
        {LeftPanel}
        <AnimatePresence mode="wait">
          {step === 'calendar' ? CalendarPanel : FormPanel}
        </AnimatePresence>
      </div>
    </div>
  );
}
