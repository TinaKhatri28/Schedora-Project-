'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, Clock, Zap, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAvailability, updateAvailability } from '@/lib/api';
import { AvailabilityDay } from '@/lib/types';

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Mumbai', 'Asia/Tokyo', 'Asia/Singapore',
  'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Australia/Sydney', 'Pacific/Auckland', 'UTC',
];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const defaultDays = (): AvailabilityDay[] =>
  Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    isEnabled: i >= 1 && i <= 5,
    startTime: '09:00',
    endTime: '17:00',
  }));

const PRESETS = [
  {
    label: 'Mon–Fri 9–5', icon: '💼',
    days: (tz: string) => ({
      timezone: tz,
      days: defaultDays().map((d) => ({ ...d, isEnabled: d.dayOfWeek >= 1 && d.dayOfWeek <= 5, startTime: '09:00', endTime: '17:00' })),
    }),
  },
  {
    label: 'Mon–Sat 10–6', icon: '📅',
    days: (tz: string) => ({
      timezone: tz,
      days: defaultDays().map((d) => ({ ...d, isEnabled: d.dayOfWeek >= 1 && d.dayOfWeek <= 6, startTime: '10:00', endTime: '18:00' })),
    }),
  },
  {
    label: 'Every day 8–8', icon: '🌐',
    days: (tz: string) => ({
      timezone: tz,
      days: defaultDays().map((d) => ({ ...d, isEnabled: true, startTime: '08:00', endTime: '20:00' })),
    }),
  },
];

/* ── Styled select ── */
function StyledSelect({ value, onChange, children, style }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '7px 28px 7px 10px',
          border: '1px solid #E1E3EA', borderRadius: 6,
          fontSize: 13, color: '#374151', background: '#fff',
          appearance: 'none', cursor: 'pointer', outline: 'none',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#006BFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,107,255,0.1)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#E1E3EA'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {children}
      </select>
      <ChevronDown size={13} style={{
        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
        color: '#9CA3AF', pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', flexShrink: 0,
        background: checked ? '#006BFF' : '#D1D5DB',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function AvailabilityPage() {
  const qc = useQueryClient();
  const [days, setDays] = useState<AvailabilityDay[]>(defaultDays());
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const { data, isLoading } = useQuery({
    queryKey: ['availability'],
    queryFn: getAvailability,
  });

  useEffect(() => {
    if (data?.days) {
      setDays(
        Array.from({ length: 7 }, (_, i) => {
          const found = data.days.find((d: AvailabilityDay) => d.dayOfWeek === i);
          return found ?? { dayOfWeek: i, isEnabled: false, startTime: '09:00', endTime: '17:00' };
        })
      );
    }
    if (data?.timezone) setTimezone(data.timezone);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updateAvailability({ timezone, days }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['availability'] }); toast.success('Availability saved!'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateDay = (index: number, field: keyof AvailabilityDay, value: any) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    const result = preset.days(timezone);
    setDays(result.days);
    toast.success(`Applied: ${preset.label}`);
  };

  return (
    <DashboardLayout>
      <div style={{ width: '100%' }}>

        {/* ── Schedule name card (Calendly style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fff', border: '1px solid #E1E3EA',
            borderRadius: 10, padding: '20px 24px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
              Working hours
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
              Default schedule
            </p>
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#006BFF', color: '#fff',
              padding: '9px 18px', borderRadius: 6,
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              opacity: saveMutation.isPending ? 0.7 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!saveMutation.isPending) (e.currentTarget as HTMLButtonElement).style.background = '#0052CC'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#006BFF'; }}
          >
            <Save size={14} />
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </motion.div>

        {/* ── Quick presets ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          style={{
            background: '#fff', border: '1px solid #E1E3EA',
            borderRadius: 10, padding: '16px 20px', marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Zap size={14} style={{ color: '#006BFF' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Quick Presets</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #E1E3EA', background: '#fff',
                  fontSize: 12, fontWeight: 600, color: '#374151',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#006BFF';
                  (e.currentTarget as HTMLButtonElement).style.color = '#006BFF';
                  (e.currentTarget as HTMLButtonElement).style.background = '#EBF5FF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#E1E3EA';
                  (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                }}
              >
                <span style={{ display: 'block', fontSize: 16, marginBottom: 2 }}>{preset.icon}</span>
                {preset.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Timezone ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          style={{
            background: '#fff', border: '1px solid #E1E3EA',
            borderRadius: 10, padding: '16px 20px', marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Timezone</p>
          <StyledSelect value={timezone} onChange={setTimezone}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </StyledSelect>
        </motion.div>

        {/* ── Day rows ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: '#fff', border: '1px solid #E1E3EA',
            borderRadius: 10, overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #E1E3EA',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Clock size={14} style={{ color: '#6B7280' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Weekly hours</span>
          </div>

          {isLoading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ height: 40, borderRadius: 6, background: '#F3F4F6', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : (
            days.map((day, i) => (
              <div
                key={day.dayOfWeek}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px',
                  borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none',
                  background: day.isEnabled ? '#fff' : '#FAFAFA',
                  transition: 'background 0.15s',
                }}
              >
                {/* Toggle */}
                <Toggle
                  checked={day.isEnabled}
                  onChange={() => updateDay(i, 'isEnabled', !day.isEnabled)}
                />

                {/* Day name */}
                <span style={{
                  width: 96, fontSize: 13, fontWeight: day.isEnabled ? 600 : 400,
                  color: day.isEnabled ? '#111827' : '#9CA3AF',
                  flexShrink: 0, transition: 'color 0.15s',
                }}>
                  {DAYS_FULL[day.dayOfWeek]}
                </span>

                {/* Time selects or Unavailable */}
                {day.isEnabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <StyledSelect
                      value={day.startTime}
                      onChange={(v) => updateDay(i, 'startTime', v)}
                      style={{ flex: 1, maxWidth: 110 }}
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </StyledSelect>
                    <span style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>–</span>
                    <StyledSelect
                      value={day.endTime}
                      onChange={(v) => updateDay(i, 'endTime', v)}
                      style={{ flex: 1, maxWidth: 110 }}
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </StyledSelect>
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>
                    Unavailable
                  </span>
                )}
              </div>
            ))
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}