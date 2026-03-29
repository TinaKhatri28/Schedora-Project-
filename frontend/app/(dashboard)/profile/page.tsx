'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Globe, Camera, Save, Check, Bell, Shield, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB',
  borderRadius: 8, fontSize: 14, color: '#111827', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block',
};

type ProfileTab = 'profile' | 'notifications' | 'security';

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>('profile');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: 'Tina Khatri',
    email: 'tina@example.com',
    username: 'tina-khatri',
    bio: '',
    website: '',
    timezone: 'Asia/Kolkata',
  });

  const [notifications, setNotifications] = useState({
    bookingConfirmation: true,
    bookingCancellation: true,
    bookingReminders: false,
    weeklyDigest: true,
    productUpdates: false,
  });

  const patch = (p: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...p }));
  const patchNotif = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'security', label: 'Security', icon: <Shield size={15} /> },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Account settings</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Manage your profile and preferences</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 32, gap: 0 }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? '#006BFF' : '#6B7280', background: 'none', border: 'none',
                cursor: 'pointer', borderBottom: `2px solid ${active ? '#006BFF' : 'transparent'}`,
                marginBottom: -1, transition: 'color 0.15s',
              }}>
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: 20, background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#006BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>
                  {form.name.charAt(0)}
                </div>
                <button style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={12} style={{ color: '#6B7280' }} />
                </button>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{form.name}</p>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>{form.email}</p>
                <button style={{ fontSize: 12, fontWeight: 600, color: '#006BFF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Change photo</button>
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Full name</label>
                  <input style={inputStyle} value={form.name} onChange={(e) => patch({ name: e.target.value })}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#006BFF'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'; }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9CA3AF' }}>@</span>
                    <input style={{ ...inputStyle, paddingLeft: 28 }} value={form.username} onChange={(e) => patch({ username: e.target.value })}
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#006BFF'; }}
                      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'; }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email address</label>
                <input style={inputStyle} type="email" value={form.email} onChange={(e) => patch({ email: e.target.value })}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#006BFF'; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'; }} />
              </div>

              <div>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Tell people a bit about yourself"
                  value={form.bio} onChange={(e) => patch({ bio: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Website</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="https://yoursite.com"
                    value={form.website} onChange={(e) => patch({ website: e.target.value })}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#006BFF'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'; }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Timezone</label>
                <select style={inputStyle} value={form.timezone} onChange={(e) => patch({ timezone: e.target.value })}>
                  {['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Your booking link</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                  <Globe size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>schedora.com/</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{form.username}</span>
                  <button style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#006BFF', background: 'none', border: 'none', cursor: 'pointer' }}>Copy</button>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
              <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: saved ? '#059669' : '#006BFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
                {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save changes</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Notifications Tab ── */}
        {tab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              {[
                { key: 'bookingConfirmation', label: 'Booking confirmations', desc: 'Get notified when someone books a meeting with you' },
                { key: 'bookingCancellation', label: 'Booking cancellations', desc: 'Get notified when a meeting is cancelled' },
                { key: 'bookingReminders', label: 'Meeting reminders', desc: 'Receive reminders before upcoming meetings' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'A summary of your scheduling activity each week' },
                { key: 'productUpdates', label: 'Product updates', desc: 'New features and improvements from Schedora' },
              ].map(({ key, label, desc }, i, arr) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none', background: '#fff' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>{desc}</p>
                  </div>
                  <button onClick={() => patchNotif(key as keyof typeof notifications)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                    {notifications[key as keyof typeof notifications]
                      ? <ToggleRight size={28} style={{ color: '#006BFF' }} />
                      : <ToggleLeft size={28} style={{ color: '#D1D5DB' }} />}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: saved ? '#059669' : '#006BFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
                {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save preferences</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Security Tab ── */}
        {tab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 20, border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Change password</p>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>We'll send a password reset link to your email.</p>
                <button style={{ padding: '9px 20px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Send reset link
                </button>
              </div>

              <div style={{ padding: 20, border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Two-factor authentication</p>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Add an extra layer of security to your account.</p>
                <button style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#006BFF', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                  Enable 2FA
                </button>
              </div>

              <div style={{ padding: 20, border: '1.5px solid #FECACA', borderRadius: 12, background: '#FFF5F5' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Delete account</p>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Permanently delete your account and all of your data. This cannot be undone.</p>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: '1.5px solid #DC2626', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>
                  <Trash2 size={14} /> Delete account
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}