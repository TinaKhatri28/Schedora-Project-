'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Bell, Settings, LogOut, User, CreditCard, HelpCircle } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/event-types':  'Scheduling',
  '/meetings':     'Meetings',
  '/availability': 'Availability',
  '/contacts':     'Contacts',
  '/workflows':    'Workflows',
  '/integrations': 'Integrations & apps',
  '/routing':      'Routing',
  '/analytics':    'Analytics',
  '/admin-center': 'Admin center',
  '/upgrade':      'Upgrade plan',
  '/help':         'Help',
};

// Mock notifications
const NOTIFICATIONS = [
  { id: 1, text: 'New meeting booked with Daniel Jones', time: '5 min ago', unread: true },
  { id: 2, text: 'Kathryn Irving cancelled her meeting', time: '1 hr ago', unread: true },
  { id: 3, text: 'Your availability was updated', time: '3 hrs ago', unread: false },
];

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const title = Object.entries(PAGE_TITLES).find(
    ([key]) => pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'Dashboard';

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header style={{
      height: 60,
      background: '#fff',
      borderBottom: '1px solid #E1E3EA',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Mobile hamburger */}
      <button onClick={onMenuClick} className="md:hidden" style={{
        padding: 6, borderRadius: 6, border: 'none',
        background: 'transparent', cursor: 'pointer', color: '#6B7280',
        display: 'flex', alignItems: 'center',
      }}>
        <Menu size={22} />
      </button>

      {/* Page title with info dot */}
      <h1 style={{
        flex: 1, fontSize: 18, fontWeight: 700,
        color: '#111827', margin: 0, letterSpacing: '-0.01em',
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        {title}
        <span style={{
          width: 17, height: 17, borderRadius: '50%',
          border: '1.5px solid #9CA3AF',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: '#9CA3AF', fontWeight: 700,
          cursor: 'default', flexShrink: 0, lineHeight: 1,
        }}>i</span>
      </h1>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* ── Bell notification ── */}
        <div ref={bellRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setBellOpen((b) => !b); setProfileOpen(false); }}
            style={{
              width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: '1px solid #E1E3EA',
              background: bellOpen ? '#F5F6FA' : '#fff', cursor: 'pointer',
              color: '#6B7280', position: 'relative', transition: 'background 0.15s',
            }}
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 8, height: 8, borderRadius: '50%',
                background: '#EF4444', border: '1.5px solid #fff',
              }} />
            )}
          </button>

          {/* Bell dropdown */}
          {bellOpen && (
            <div style={{
              position: 'absolute', top: 46, right: 0,
              width: 320, background: '#fff',
              border: '1px solid #E1E3EA', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid #E1E3EA',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 9999,
                    background: '#EBF5FF', color: '#006BFF',
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} style={{
                  padding: '12px 16px',
                  background: n.unread ? '#FAFBFF' : '#fff',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F5F6FA'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.unread ? '#FAFBFF' : '#fff'; }}
                >
                  {n.unread && (
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#006BFF', flexShrink: 0, marginTop: 5,
                    }} />
                  )}
                  {!n.unread && <div style={{ width: 7, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#111827', margin: '0 0 3px', lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{n.time}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                <button style={{
                  fontSize: 13, color: '#006BFF', fontWeight: 500,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                }}>
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile dropdown ── */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setProfileOpen((p) => !p); setBellOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              border: '1px solid #E1E3EA', borderRadius: 8,
              background: profileOpen ? '#F5F6FA' : '#fff', cursor: 'pointer',
              padding: '5px 9px 5px 5px', transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #006BFF 0%, #3B82F6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              T
            </div>
            <ChevronDown size={14} style={{
              color: '#9CA3AF',
              transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }} />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div style={{
              position: 'absolute', top: 46, right: 0,
              width: 220, background: '#fff',
              border: '1px solid #E1E3EA', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid #E1E3EA',
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Tina Khatri</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>admin@schedulr.app</p>
              </div>

              {/* Menu items */}
              {[
                { icon: User,       label: 'Profile',       href: '/profile' },
                { icon: Settings,   label: 'Account settings', href: '/admin-center' },
                { icon: CreditCard, label: 'Billing',       href: '/upgrade' },
                { icon: HelpCircle, label: 'Help center',   href: '/help' },
              ].map(({ icon: Icon, label, href }) => (
                <button
                  key={label}
                  onClick={() => { setProfileOpen(false); router.push(href); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: 'transparent', border: 'none',
                    fontSize: 13, color: '#374151', cursor: 'pointer',
                    textAlign: 'left', transition: 'background 0.12s',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F6FA'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <Icon size={15} style={{ color: '#6B7280', flexShrink: 0 }} />
                  {label}
                </button>
              ))}

              {/* Logout */}
              <button
                onClick={() => { setProfileOpen(false); router.push('/'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', background: 'transparent', border: 'none',
                  fontSize: 13, color: '#DC2626', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <LogOut size={15} style={{ color: '#DC2626', flexShrink: 0 }} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}