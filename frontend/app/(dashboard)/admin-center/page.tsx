'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Shield, CreditCard, Palette, Bell, Globe, Save, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const SECTIONS = [
  { id: 'general',       label: 'General',        icon: Settings },
  { id: 'people',        label: 'Users',           icon: Users },
  { id: 'security',      label: 'Security',        icon: Shield },
  { id: 'billing',       label: 'Billing',         icon: CreditCard },
  { id: 'branding',      label: 'Branding',        icon: Palette },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid #E1E3EA' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '20px 22px' }}>{children}</div>
    </div>
  );
}

function Field({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
      <div style={{ minWidth: 180 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{label}</p>
        {sublabel && <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{sublabel}</p>}
      </div>
      <div style={{ flex: 1, maxWidth: 340 }}>{children}</div>
    </div>
  );
}

function Input({ value, placeholder }: { value?: string; placeholder?: string }) {
  const [val, setVal] = useState(value ?? '');
  return (
    <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', padding: '9px 12px',
        border: '1px solid #E1E3EA', borderRadius: 6,
        fontSize: 14, color: '#374151', background: '#fff', outline: 'none',
        boxSizing: 'border-box', fontFamily: 'inherit',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#006BFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,107,255,0.1)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#E1E3EA'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

function Toggle({ defaultChecked = false, label }: { defaultChecked?: boolean; label: string }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => setOn((v) => !v)} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none',
        background: on ? '#006BFF' : '#D1D5DB', cursor: 'pointer',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 3, left: on ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
      <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
    </div>
  );
}

export default function AdminCenterPage() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left sidebar nav ── */}
        <div style={{
          width: 200, flexShrink: 0,
          background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10,
          overflow: 'hidden', position: 'sticky', top: 80,
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #E1E3EA' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              Admin Center
            </p>
          </div>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px',
                background: activeSection === id ? '#EBF5FF' : 'transparent',
                border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: activeSection === id ? 600 : 400,
                color: activeSection === id ? '#006BFF' : '#374151',
                textAlign: 'left', transition: 'background 0.12s',
                borderLeft: activeSection === id ? '3px solid #006BFF' : '3px solid transparent',
              }}
              onMouseEnter={(e) => { if (activeSection !== id) (e.currentTarget as HTMLButtonElement).style.background = '#F5F6FA'; }}
              onMouseLeave={(e) => { if (activeSection !== id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <Icon size={16} style={{ color: activeSection === id ? '#006BFF' : '#6B7280', flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {activeSection === 'general' && (
              <>
                <Section title="Organization">
                  <Field label="Organization name" sublabel="Your company or team name">
                    <Input value="Schedora" />
                  </Field>
                  <Field label="Website" sublabel="Your public website URL">
                    <Input value="https://schedora.app" />
                  </Field>
                  <Field label="Default timezone" sublabel="Used for scheduling">
                    <select style={{
                      width: '100%', padding: '9px 12px',
                      border: '1px solid #E1E3EA', borderRadius: 6,
                      fontSize: 14, color: '#374151', background: '#fff', outline: 'none',
                      appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      <option>Asia/Kolkata</option>
                      <option>Asia/Singapore</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>UTC</option>
                    </select>
                  </Field>
                </Section>
                <Section title="Login & Authentication">
                  <Field label="Login page" sublabel="URL where users sign in">
                    <Input value="https://schedora.app/login" />
                  </Field>
                  <div style={{ marginBottom: 14 }}>
                    <Toggle defaultChecked label="Allow Google login" />
                  </div>
                  <Toggle defaultChecked={false} label="Require two-factor authentication" />
                </Section>
              </>
            )}

            {activeSection === 'people' && (
              <Section title="Users">
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                  Manage users who have access to your Schedora organization.
                </p>
                {['Tina Khatri — admin@schedulr.app', 'Guest User — guest@schedora.app'].map((u, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid #F3F4F6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', background: '#006BFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 13,
                      }}>
                        {u[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{u.split(' — ')[0]}</p>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{u.split(' — ')[1]}</p>
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 9999,
                      background: i === 0 ? '#EBF5FF' : '#F3F4F6',
                      color: i === 0 ? '#006BFF' : '#6B7280',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {i === 0 ? 'Admin' : 'Member'}
                    </span>
                  </div>
                ))}
                <button style={{
                  marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', background: '#006BFF', color: '#fff',
                  border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Invite a teammate
                </button>
              </Section>
            )}

            {activeSection === 'security' && (
              <Section title="Security settings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Toggle defaultChecked label="Require email verification" />
                  <Toggle defaultChecked={false} label="Enable SAML SSO" />
                  <Toggle defaultChecked label="Session timeout after 7 days" />
                  <Toggle defaultChecked={false} label="IP allowlist" />
                </div>
              </Section>
            )}

            {activeSection === 'billing' && (
              <Section title="Billing & Plan">
                <div style={{
                  background: '#EBF5FF', border: '1px solid #BFDBFE', borderRadius: 8,
                  padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Free Plan</p>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>1 active event type · Unlimited meetings</p>
                  </div>
                  <a href="/upgrade" style={{
                    padding: '8px 16px', background: '#006BFF', color: '#fff',
                    borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  }}>
                    Upgrade
                  </a>
                </div>
                <p style={{ fontSize: 14, color: '#6B7280' }}>No active subscriptions. Upgrade to unlock more features.</p>
              </Section>
            )}

            {activeSection === 'branding' && (
              <Section title="Branding">
                <Field label="Brand color" sublabel="Used on your booking page">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" defaultValue="#006BFF" style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid #E1E3EA', cursor: 'pointer', padding: 2 }} />
                    <Input value="#006BFF" />
                  </div>
                </Field>
                <Field label="Logo" sublabel="Upload your company logo">
                  <button style={{
                    padding: '9px 16px', border: '1px solid #E1E3EA', borderRadius: 6,
                    background: '#fff', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer',
                  }}>
                    Upload logo
                  </button>
                </Field>
                <Field label="Remove Schedora branding">
                  <Toggle defaultChecked={false} label="Hide 'Powered by Schedora'" />
                </Field>
              </Section>
            )}

            {activeSection === 'notifications' && (
              <Section title="Email notifications">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Toggle defaultChecked label="New booking confirmation" />
                  <Toggle defaultChecked label="Meeting cancellation" />
                  <Toggle defaultChecked label="Meeting rescheduled" />
                  <Toggle defaultChecked={false} label="Daily digest summary" />
                  <Toggle defaultChecked={false} label="Weekly analytics report" />
                </div>
              </Section>
            )}

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#006BFF', color: '#fff',
                padding: '10px 22px', borderRadius: 6,
                fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052CC'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#006BFF'; }}
              >
                <Save size={15} /> Save changes
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}