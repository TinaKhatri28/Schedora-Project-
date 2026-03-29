'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Copy, ExternalLink, MoreHorizontal, X, ChevronDown,
  Clock, Video, Users, Link2, BarChart2, Check, Trash2, Edit2,
  Bell, Calendar, AlignLeft, ToggleLeft, ToggleRight, GripVertical,
  AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type DayHours = {
  enabled: boolean;
  start: string;
  end: string;
};

type Schedule = {
  id: string;
  name: string;
  timezone: string;
  hours: Record<DayKey, DayHours>;
};

type DateOverride = {
  date: string; // YYYY-MM-DD
  unavailable: boolean;
  start?: string;
  end?: string;
};

type Question = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[]; // for select type
};

type EventType = {
  id: string;
  name: string;
  slug: string;
  duration: number;
  color: string;
  location: string;
  meetingType: 'one-on-one' | 'group' | 'round-robin';
  active: boolean;
  scheduleId: string;
  bufferBefore: number; // minutes
  bufferAfter: number;
  allowReschedule: boolean;
  allowCancel: boolean;
  cancelNotice: number; // hours
  questions: Question[];
  notifyOnBook: boolean;
  notifyOnCancel: boolean;
  notifyEmail: string;
  dateOverrides: DateOverride[];
  description: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#006BFF', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#BE185D', '#374151'];
const DURATIONS = [15, 30, 45, 60, 90, 120];
const TIMEZONES = ['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30, 60];

const DEFAULT_HOURS: Record<DayKey, DayHours> = {
  mon: { enabled: true, start: '09:00', end: '17:00' },
  tue: { enabled: true, start: '09:00', end: '17:00' },
  wed: { enabled: true, start: '09:00', end: '17:00' },
  thu: { enabled: true, start: '09:00', end: '17:00' },
  fri: { enabled: true, start: '09:00', end: '17:00' },
  sat: { enabled: false, start: '09:00', end: '17:00' },
  sun: { enabled: false, start: '09:00', end: '17:00' },
};

const DEFAULT_SCHEDULE: Schedule = {
  id: 'default',
  name: 'Working Hours',
  timezone: 'Asia/Kolkata',
  hours: DEFAULT_HOURS,
};

const SEED_EVENTS: EventType[] = [
  {
    id: '1',
    name: '30 Minute Meeting',
    slug: '30-minute-meeting',
    duration: 30,
    color: '#006BFF',
    location: 'Google Meet',
    meetingType: 'one-on-one',
    active: true,
    scheduleId: 'default',
    bufferBefore: 0,
    bufferAfter: 0,
    allowReschedule: true,
    allowCancel: true,
    cancelNotice: 24,
    questions: [],
    notifyOnBook: true,
    notifyOnCancel: true,
    notifyEmail: '',
    dateOverrides: [],
    description: '',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const fmtDuration = (min: number) =>
  min < 60 ? `${min} min` : `${min / 60} hr${min > 60 ? 's' : ''}`;

const meetingLabel = (t: EventType['meetingType']) =>
  ({ 'one-on-one': 'One-on-One', group: 'Group', 'round-robin': 'Round Robin' })[t];

function useLocalStorage<T>(key: string, init: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return init;
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = (v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };
  return [value, set] as const;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
  borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
};

// ─── Copy Toast ───────────────────────────────────────────────────────────────

function CopyToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: '#111827', color: '#fff', fontSize: 13, fontWeight: 500,
            padding: '10px 20px', borderRadius: 8, zIndex: 99999,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <Check size={14} /> Link copied to clipboard
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Schedule Editor ──────────────────────────────────────────────────────────

function ScheduleEditor({ schedule, onChange }: { schedule: Schedule; onChange: (s: Schedule) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Schedule name</label>
          <input
            style={inputStyle}
            value={schedule.name}
            onChange={(e) => onChange({ ...schedule, name: e.target.value })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Timezone</label>
          <select
            style={{ ...inputStyle }}
            value={schedule.timezone}
            onChange={(e) => onChange({ ...schedule, timezone: e.target.value })}
          >
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>
      {DAYS.map(({ key, label }) => (
        <div key={key} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <button
            onClick={() => onChange({ ...schedule, hours: { ...schedule.hours, [key]: { ...schedule.hours[key], enabled: !schedule.hours[key].enabled } } })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            {schedule.hours[key].enabled
              ? <ToggleRight size={22} style={{ color: '#006BFF' }} />
              : <ToggleLeft size={22} style={{ color: '#D1D5DB' }} />}
          </button>
          <span style={{ fontSize: 13, fontWeight: 500, color: schedule.hours[key].enabled ? '#111827' : '#9CA3AF', width: 90 }}>{label}</span>
          {schedule.hours[key].enabled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="time" style={{ ...inputStyle, width: 120 }}
                value={schedule.hours[key].start}
                onChange={(e) => onChange({ ...schedule, hours: { ...schedule.hours, [key]: { ...schedule.hours[key], start: e.target.value } } })}
              />
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>–</span>
              <input type="time" style={{ ...inputStyle, width: 120 }}
                value={schedule.hours[key].end}
                onChange={(e) => onChange({ ...schedule, hours: { ...schedule.hours, [key]: { ...schedule.hours[key], end: e.target.value } } })}
              />
            </div>
          ) : (
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Unavailable</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Date Override Picker ─────────────────────────────────────────────────────

function DateOverrideSection({ overrides, onChange }: { overrides: DateOverride[]; onChange: (o: DateOverride[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [pickedDate, setPickedDate] = useState('');
  const [pickedStart, setPickedStart] = useState('09:00');
  const [pickedEnd, setPickedEnd] = useState('17:00');
  const [unavailable, setUnavailable] = useState(false);

  const addOverride = () => {
    if (!pickedDate) return;
    onChange([...overrides.filter((o) => o.date !== pickedDate), {
      date: pickedDate, unavailable,
      start: unavailable ? undefined : pickedStart,
      end: unavailable ? undefined : pickedEnd,
    }]);
    setAdding(false);
    setPickedDate('');
  };

  return (
    <div>
      {overrides.map((o) => (
        <div key={o.date} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, marginBottom: 8,
        }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{o.date}</span>
            <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>
              {o.unavailable ? 'Unavailable' : `${o.start} – ${o.end}`}
            </span>
          </div>
          <button onClick={() => onChange(overrides.filter((x) => x.date !== o.date))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}>
            <X size={14} />
          </button>
        </div>
      ))}
      {adding ? (
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 16, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={pickedDate} min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickedDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input type="checkbox" id="unavail" checked={unavailable} onChange={(e) => setUnavailable(e.target.checked)} />
            <label htmlFor="unavail" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>Mark as unavailable</label>
          </div>
          {!unavailable && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start</label>
                <input type="time" style={inputStyle} value={pickedStart} onChange={(e) => setPickedStart(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>End</label>
                <input type="time" style={inputStyle} value={pickedEnd} onChange={(e) => setPickedEnd(e.target.value)} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
            <button onClick={addOverride} style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', background: '#006BFF', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Add</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#006BFF', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
        >
          <Plus size={14} /> Add date override
        </button>
      )}
    </div>
  );
}

// ─── Questions Editor ─────────────────────────────────────────────────────────

function QuestionsEditor({ questions, onChange }: { questions: Question[]; onChange: (q: Question[]) => void }) {
  const addQ = () => onChange([...questions, { id: uid(), label: '', type: 'text', required: false }]);
  const updateQ = (id: string, patch: Partial<Question>) =>
    onChange(questions.map((q) => q.id === id ? { ...q, ...patch } : q));
  const removeQ = (id: string) => onChange(questions.filter((q) => q.id !== id));

  return (
    <div>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>
        Add custom questions that invitees must answer when booking.
      </p>
      {questions.map((q, i) => (
        <div key={q.id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
            <GripVertical size={16} style={{ color: '#D1D5DB', marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <input
                style={{ ...inputStyle, marginBottom: 8 }}
                placeholder={`Question ${i + 1} label`}
                value={q.label}
                onChange={(e) => updateQ(q.id, { label: e.target.value })}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  style={{ ...inputStyle, flex: 1 }}
                  value={q.type}
                  onChange={(e) => updateQ(q.id, { type: e.target.value as Question['type'] })}
                >
                  <option value="text">Short text</option>
                  <option value="textarea">Long text</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  <input type="checkbox" checked={q.required} onChange={(e) => updateQ(q.id, { required: e.target.checked })} />
                  Required
                </label>
                <button onClick={() => removeQ(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
              {q.type === 'select' && (
                <textarea
                  style={{ ...inputStyle, marginTop: 8, minHeight: 60, resize: 'vertical' }}
                  placeholder="Enter options, one per line"
                  value={(q.options ?? []).join('\n')}
                  onChange={(e) => updateQ(q.id, { options: e.target.value.split('\n') })}
                />
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addQ}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#006BFF', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
      >
        <Plus size={14} /> Add question
      </button>
    </div>
  );
}

// ─── Event Type Modal ─────────────────────────────────────────────────────────

const MODAL_TABS = ['Details', 'Availability', 'Date overrides', 'Questions', 'Notifications'] as const;
type ModalTab = typeof MODAL_TABS[number];

function EventTypeModal({
  initial,
  schedules,
  onSave,
  onClose,
}: {
  initial: EventType | null;
  schedules: Schedule[];
  onSave: (e: EventType) => void;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [tab, setTab] = useState<ModalTab>('Details');
  const [et, setEt] = useState<EventType>(
    initial ?? {
      id: uid(), name: '', slug: '', duration: 30, color: '#006BFF',
      location: 'Google Meet', meetingType: 'one-on-one', active: true,
      scheduleId: schedules[0]?.id ?? 'default',
      bufferBefore: 0, bufferAfter: 0,
      allowReschedule: true, allowCancel: true, cancelNotice: 24,
      questions: [], notifyOnBook: true, notifyOnCancel: true,
      notifyEmail: '', dateOverrides: [], description: '',
    }
  );

  const patch = (p: Partial<EventType>) => setEt((prev) => ({ ...prev, ...p }));
  const selectedSchedule = schedules.find((s) => s.id === et.scheduleId) ?? schedules[0];

  const handleSave = () => {
    if (!et.name.trim()) { alert('Please enter an event name.'); return; }
    onSave({ ...et, slug: et.name.toLowerCase().replace(/\s+/g, '-') });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 16,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        }}
      >
        {/* Modal header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>
              {isNew ? 'Create event type' : `Edit: ${initial?.name}`}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
          {/* Modal tabs */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {MODAL_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 14px', fontSize: 12, fontWeight: 600,
                color: tab === t ? '#006BFF' : '#6B7280',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${tab === t ? '#006BFF' : 'transparent'}`,
                marginBottom: -1, whiteSpace: 'nowrap',
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px' }}>

          {/* ── Details ── */}
          {tab === 'Details' && (
            <div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Event name *</label>
                <input style={inputStyle} placeholder="e.g. 30 Minute Meeting" value={et.name}
                  onChange={(e) => patch({ name: e.target.value })} />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                  placeholder="Brief description of this meeting type"
                  value={et.description} onChange={(e) => patch({ description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 12, ...sectionStyle }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Duration</label>
                  <select style={inputStyle} value={et.duration} onChange={(e) => patch({ duration: Number(e.target.value) })}>
                    {DURATIONS.map((d) => <option key={d} value={d}>{fmtDuration(d)}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Meeting type</label>
                  <select style={inputStyle} value={et.meetingType} onChange={(e) => patch({ meetingType: e.target.value as EventType['meetingType'] })}>
                    <option value="one-on-one">One-on-One</option>
                    <option value="group">Group</option>
                    <option value="round-robin">Round Robin</option>
                  </select>
                </div>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Location / conferencing</label>
                <select style={inputStyle} value={et.location} onChange={(e) => patch({ location: e.target.value })}>
                  {['Google Meet', 'Zoom', 'Microsoft Teams', 'Phone call', 'In person', 'Custom'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => patch({ color: c })} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                      cursor: 'pointer', outline: et.color === c ? `3px solid ${c}` : '3px solid transparent',
                      outlineOffset: 2,
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Rescheduling & cancellation</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={et.allowReschedule} onChange={(e) => patch({ allowReschedule: e.target.checked })} />
                  <span style={{ fontSize: 13, color: '#374151' }}>Allow invitees to reschedule</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={et.allowCancel} onChange={(e) => patch({ allowCancel: e.target.checked })} />
                  <span style={{ fontSize: 13, color: '#374151' }}>Allow invitees to cancel</span>
                </label>
                {et.allowCancel && (
                  <div style={{ marginLeft: 24 }}>
                    <label style={labelStyle}>Minimum cancellation notice</label>
                    <select style={{ ...inputStyle, maxWidth: 180 }} value={et.cancelNotice}
                      onChange={(e) => patch({ cancelNotice: Number(e.target.value) })}>
                      {[1, 2, 4, 8, 12, 24, 48, 72].map((h) => <option key={h} value={h}>{h} hour{h !== 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Availability ── */}
          {tab === 'Availability' && (
            <div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Schedule</label>
                <select style={inputStyle} value={et.scheduleId} onChange={(e) => patch({ scheduleId: e.target.value })}>
                  {schedules.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {selectedSchedule && <ScheduleEditor schedule={selectedSchedule} onChange={() => {}} />}
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Buffer time</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Before event</label>
                    <select style={inputStyle} value={et.bufferBefore} onChange={(e) => patch({ bufferBefore: Number(e.target.value) })}>
                      {BUFFER_OPTIONS.map((b) => <option key={b} value={b}>{b === 0 ? 'No buffer' : `${b} min`}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>After event</label>
                    <select style={inputStyle} value={et.bufferAfter} onChange={(e) => patch({ bufferAfter: Number(e.target.value) })}>
                      {BUFFER_OPTIONS.map((b) => <option key={b} value={b}>{b === 0 ? 'No buffer' : `${b} min`}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Date Overrides ── */}
          {tab === 'Date overrides' && (
            <div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>
                Set specific dates where your availability differs from your regular schedule — for holidays, time off, or special hours.
              </p>
              <DateOverrideSection overrides={et.dateOverrides} onChange={(o) => patch({ dateOverrides: o })} />
            </div>
          )}

          {/* ── Questions ── */}
          {tab === 'Questions' && (
            <QuestionsEditor questions={et.questions} onChange={(q) => patch({ questions: q })} />
          )}

          {/* ── Notifications ── */}
          {tab === 'Notifications' && (
            <div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Notification email</label>
                <input style={inputStyle} type="email" placeholder="you@example.com"
                  value={et.notifyEmail} onChange={(e) => patch({ notifyEmail: e.target.value })} />
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                  Leave blank to use your account email.
                </p>
              </div>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Email triggers</p>
                {[
                  { key: 'notifyOnBook', label: 'Booking confirmation', desc: 'Sent when someone books this event' },
                  { key: 'notifyOnCancel', label: 'Booking cancellation', desc: 'Sent when a booking is cancelled' },
                ].map(({ key, label, desc }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: '#6B7280' }}>{desc}</p>
                    </div>
                    <button
                      onClick={() => patch({ [key]: !et[key as keyof EventType] } as Partial<EventType>)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    >
                      {et[key as keyof EventType]
                        ? <ToggleRight size={24} style={{ color: '#006BFF' }} />
                        : <ToggleLeft size={24} style={{ color: '#D1D5DB' }} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 8, border: '1px solid #E5E7EB',
            background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: '#006BFF', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
          }}>
            {isNew ? 'Create event type' : 'Save changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Event Type Row ───────────────────────────────────────────────────────────

function EventTypeRow({
  et, isSelected, onClick, onEdit, onDelete, onToggle, onCopy,
}: {
  et: EventType;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onCopy: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff',
        marginBottom: 8, overflow: 'hidden',
        opacity: et.active ? 1 : 0.55,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      {/* Color stripe */}
      <div style={{ width: 4, alignSelf: 'stretch', background: et.color, flexShrink: 0 }} />

      {/* Checkbox */}
      <div style={{ padding: '16px 12px', flexShrink: 0 }}>
        <input type="checkbox" checked={isSelected} onChange={onClick}
          style={{ width: 15, height: 15, cursor: 'pointer', accentColor: et.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '14px 0', minWidth: 0, cursor: 'pointer' }} onClick={onEdit}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{et.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {fmtDuration(et.duration)}
          </span>
          <span style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Video size={11} /> {et.location}
          </span>
          <span style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={11} /> {meetingLabel(et.meetingType)}
          </span>
          {et.bufferBefore > 0 || et.bufferAfter > 0 ? (
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
              Buffer {et.bufferBefore}m/{et.bufferAfter}m
            </span>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', flexShrink: 0 }}>
        <button onClick={onCopy} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px',
          border: '1px solid #E5E7EB', borderRadius: 7, background: '#fff',
          fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
          transition: 'background 0.12s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
        >
          <Copy size={12} /> Copy link
        </button>
        <button onClick={onEdit} style={{
          width: 32, height: 32, border: '1px solid #E5E7EB', borderRadius: 7,
          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.12s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
        >
          <ExternalLink size={14} style={{ color: '#6B7280' }} />
        </button>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} style={{
            width: 32, height: 32, border: '1px solid #E5E7EB', borderRadius: 7,
            background: menuOpen ? '#F9FAFB' : '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MoreHorizontal size={14} style={{ color: '#6B7280' }} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                style={{
                  position: 'absolute', right: 0, top: 36, background: '#fff',
                  border: '1px solid #E5E7EB', borderRadius: 10, zIndex: 100,
                  minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
                }}
              >
                {[
                  { label: 'Edit', icon: <Edit2 size={13} />, action: onEdit, danger: false },
                  { label: et.active ? 'Deactivate' : 'Activate', icon: et.active ? <ToggleLeft size={13} /> : <ToggleRight size={13} />, action: onToggle, danger: false },
                  { label: 'Delete', icon: <Trash2 size={13} />, action: onDelete, danger: true },
                ].map(({ label, icon, action, danger }) => (
                  <button key={label} onClick={() => { action(); setMenuOpen(false); }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: danger ? '#EF4444' : '#374151', textAlign: 'left',
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = danger ? '#FEF2F2' : '#F9FAFB'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_TABS = ['Event types', 'Single-use links', 'Meeting polls'] as const;
type PageTab = typeof PAGE_TABS[number];

export default function EventTypesPage() {
  const [events, setEvents] = useLocalStorage<EventType[]>('clandely_events', SEED_EVENTS);
  const [schedules, setSchedules] = useLocalStorage<Schedule[]>('clandely_schedules', [DEFAULT_SCHEDULE]);
  const [tab, setTab] = useState<PageTab>('Event types');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<'create' | EventType | null>(null);
  const [toast, setToast] = useState(false);

  const userName = 'Tina Khatri';

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const deleteSelected = () => {
    setEvents((prev) => prev.filter((e) => !selected.has(e.id)));
    setSelected(new Set());
  };

  const saveEvent = (et: EventType) => {
    setEvents((prev) =>
      prev.some((e) => e.id === et.id) ? prev.map((e) => e.id === et.id ? et : e) : [...prev, et]
    );
    setModal(null);
  };

  const copyLink = (et: EventType) => {
    const url = `${window.location.origin}/${et.slug}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <DashboardLayout>
      <style>{`
        @media (max-width: 640px) {
          .et-actions { display: none !important; }
          .et-copy { display: none !important; }
        }
        @media (max-width: 480px) {
          .et-header-row { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="et-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Scheduling</h1>
        <button
          onClick={() => setModal('create')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            background: '#006BFF', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0057D9'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#006BFF'; }}
        >
          <Plus size={15} /> Create
        </button>
      </div>

      {/* ── Page Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
        {PAGE_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', fontSize: 13, fontWeight: 600,
            color: tab === t ? '#111827' : '#6B7280',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: `2px solid ${tab === t ? '#006BFF' : 'transparent'}`,
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {/* ── Event Types Tab ── */}
      {tab === 'Event types' && (
        <>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 24, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event types"
              style={{ ...inputStyle, paddingLeft: 34 }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#006BFF'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'; }}
            />
          </div>

          {/* Bulk delete */}
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 16,
                }}>
                <AlertCircle size={14} style={{ color: '#EF4444' }} />
                <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{selected.size} selected</span>
                <button onClick={deleteSelected} style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: '#EF4444', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>Delete selected</button>
                <button onClick={() => setSelected(new Set())} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4,
                }}><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#006BFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {userName.charAt(0)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{userName}</span>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
              color: '#006BFF', background: 'none', border: 'none', cursor: 'pointer',
            }}>
              <ExternalLink size={12} /> View landing page
            </button>
          </div>

          {/* Event list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, background: '#EFF6FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <Calendar size={22} style={{ color: '#006BFF' }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {search ? 'No results found' : 'No event types yet'}
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                {search ? 'Try a different search.' : 'Create your first event type to start booking meetings.'}
              </p>
              {!search && (
                <button onClick={() => setModal('create')} style={{
                  padding: '9px 20px', borderRadius: 8, border: 'none',
                  background: '#006BFF', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  Create event type
                </button>
              )}
            </div>
          ) : (
            filtered.map((et) => (
              <EventTypeRow
                key={et.id}
                et={et}
                isSelected={selected.has(et.id)}
                onClick={() => toggleSelect(et.id)}
                onEdit={() => setModal(et)}
                onDelete={() => setEvents((prev) => prev.filter((e) => e.id !== et.id))}
                onToggle={() => setEvents((prev) => prev.map((e) => e.id === et.id ? { ...e, active: !e.active } : e))}
                onCopy={() => copyLink(et)}
              />
            ))
          )}
        </>
      )}

      {/* ── Single-use links ── */}
      {tab === 'Single-use links' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, background: '#F5F3FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <Link2 size={22} style={{ color: '#7C3AED' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Single-use links</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
            Generate one-time booking links that expire after use. Coming soon.
          </p>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            background: '#F5F3FF', color: '#7C3AED', fontSize: 12, fontWeight: 600,
          }}>Coming soon</span>
        </div>
      )}

      {/* ── Meeting polls ── */}
      {tab === 'Meeting polls' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, background: '#ECFDF5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <BarChart2 size={22} style={{ color: '#059669' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Meeting polls</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
            Let your invitees vote on the best time. Coming soon.
          </p>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            background: '#ECFDF5', color: '#059669', fontSize: 12, fontWeight: 600,
          }}>Coming soon</span>
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal !== null && (
          <EventTypeModal
            initial={modal === 'create' ? null : modal}
            schedules={schedules}
            onSave={saveEvent}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      <CopyToast visible={toast} />
    </DashboardLayout>
  );
}