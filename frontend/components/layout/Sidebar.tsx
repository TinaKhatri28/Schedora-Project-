'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, Clock, Users, GitBranch, Grid,
  Share2, BarChart2, Settings, HelpCircle,
  ChevronDown, Plus, X, ArrowUpCircle,
} from 'lucide-react';

const mainNav = [
  { href: '/scheduling',   label: 'Scheduling',          icon: Calendar  },
  { href: '/meetings',     label: 'Meetings',            icon: Calendar  },
  { href: '/availability', label: 'Availability',        icon: Clock     },
  { href: '/contacts',     label: 'Contacts',            icon: Users     },
  { href: '/workflows',    label: 'Workflows',           icon: GitBranch },
  { href: '/integrations', label: 'Integrations & apps', icon: Grid      },
  { href: '/routing',      label: 'Routing',             icon: Share2    },
];

const bottomNav = [
  { label: 'Upgrade plan', icon: ArrowUpCircle, href: '/upgrade'      },
  { label: 'Analytics',    icon: BarChart2,     href: '/analytics'    },
  { label: 'Admin center', icon: Settings,      href: '/admin-center' },
];

// ─── Schedora Logo ────────────────────────────────────────────────────────────
function SchedoraLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="28" height="28" rx="7" fill="#006BFF" />
      <rect x="6" y="9" width="16" height="13" rx="2" fill="white" fillOpacity="0.15" />
      <rect x="6" y="9" width="16" height="4" rx="2" fill="white" fillOpacity="0.25" />
      <text x="7" y="21" fontFamily="Arial, sans-serif" fontWeight="900"
        fontSize="13" fill="white" letterSpacing="-0.5">S</text>
      <circle cx="20" cy="7" r="1.5" fill="white" fillOpacity="0.7" />
      <circle cx="8"  cy="7" r="1.5" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onCollapse?: () => void;
}

export default function Sidebar({ open, onClose, collapsed = false, onCollapse }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const sidebarWidth = collapsed ? 60 : 240;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  // ── Create button handler ─────────────────────────────────────────────────
  // Navigate to /scheduling and signal it to open the create modal via a
  // query-param that the scheduling page already reads (tab=event-types).
  // We store a flag in sessionStorage so EventTypesTab can auto-open the modal.
  const handleCreate = () => {
    sessionStorage.setItem('schedora_open_create', '1');
    router.push('/scheduling?tab=event-types');
    onClose(); // close mobile drawer if open
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        style={{
          width: sidebarWidth,
          borderRight: '1px solid #E1E3EA',
          transition: 'width 0.2s ease',
          position: 'fixed',
          top: 0, bottom: 0, left: 0,
          zIndex: 50,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
        className={[
          'transition-transform duration-300 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* ── Logo row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 14px',
          height: 56, borderBottom: '1px solid #E1E3EA', flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={onClose} className="md:hidden" style={{
                padding: 4, borderRadius: 6, border: 'none',
                background: 'transparent', cursor: 'pointer', color: '#6B7280',
              }}>
                <X size={16} />
              </button>
              <SchedoraLogo size={28} />
              <span style={{ fontWeight: 800, fontSize: 16, color: '#111827', letterSpacing: '-0.4px' }}>
                Schedora
              </span>
            </div>
          )}
          {collapsed && <SchedoraLogo size={28} />}

          {onCollapse && (
            <button
              onClick={onCollapse}
              className="hidden md:flex"
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: '1px solid #E1E3EA', background: '#fff',
                cursor: 'pointer', color: '#6B7280', fontSize: 11, fontWeight: 700,
                alignItems: 'center', justifyContent: 'center',
                ...(collapsed ? {
                  position: 'absolute', right: -12, top: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                } : {}),
              }}
            >
              {collapsed ? '»' : '«'}
            </button>
          )}
        </div>

        {/* ── + Create button ── */}
        <div style={{ padding: collapsed ? '12px 8px 4px' : '12px 10px 4px', flexShrink: 0 }}>
          <button
            onClick={handleCreate}
            title={collapsed ? 'Create event type' : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, width: '100%', padding: '8px 0',
              border: '1px solid #1A1A1A', borderRadius: 9999,
              background: '#fff', color: '#111827',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#111827';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#fff';
              (e.currentTarget as HTMLButtonElement).style.color = '#111827';
            }}
          >
            <Plus size={14} />
            {!collapsed && 'Create'}
          </button>
        </div>

        {/* ── Main nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {mainNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                title={collapsed ? label : undefined}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px 0' : '9px 12px',
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? '#006BFF' : '#374151',
                  background: active ? '#EBF5FF' : 'transparent',
                  borderRadius: 7, margin: '1px 6px',
                  textDecoration: 'none', transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#F5F6FA';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#374151';
                  }
                }}
              >
                <Icon size={16} style={{ flexShrink: 0, color: active ? '#006BFF' : '#6B7280' }} />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom section ── */}
        <div style={{ borderTop: '1px solid #E1E3EA', paddingTop: 4, paddingBottom: 8, flexShrink: 0 }}>
          {bottomNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                title={collapsed ? label : undefined}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '9px 0' : '9px 12px',
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? '#006BFF' : '#374151',
                  background: active ? '#EBF5FF' : 'transparent',
                  borderRadius: 7, margin: '1px 6px',
                  textDecoration: 'none', transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = '#F5F6FA';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                }}
              >
                <Icon size={16} style={{ flexShrink: 0, color: active ? '#006BFF' : '#6B7280' }} />
                {!collapsed && label}
              </Link>
            );
          })}

          {/* Help */}
          <Link
            href="/help"
            title={collapsed ? 'Help' : undefined}
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 9,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '9px 0' : '9px 12px',
              fontSize: 13.5, fontWeight: 400, color: '#374151',
              background: 'transparent', borderRadius: 7, margin: '1px 6px',
              textDecoration: 'none', transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#F5F6FA'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
          >
            <HelpCircle size={16} style={{ flexShrink: 0, color: '#6B7280' }} />
            {!collapsed && (
              <>
                <span style={{ flex: 1 }}>Help</span>
                <ChevronDown size={13} style={{ color: '#9CA3AF' }} />
              </>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}