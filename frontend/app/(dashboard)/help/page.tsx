'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, ExternalLink, ChevronRight, Book, Video, MessageCircle, Mail } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const CATEGORIES = [
  {
    icon: <Book size={20} style={{ color: '#006BFF' }} />,
    bg: '#EBF5FF',
    title: 'Getting Started',
    description: 'New to Clandely? Start here for setup guides.',
    articles: ['Creating your first event type', 'Connecting your calendar', 'Sharing your booking link', 'Setting your availability'],
  },
  {
    icon: <Video size={20} style={{ color: '#7C3AED' }} />,
    bg: '#F5F3FF',
    title: 'Video & Tutorials',
    description: 'Step-by-step video walkthroughs.',
    articles: ['How scheduling works', 'Setting up workflows', 'Using integrations', 'Team scheduling basics'],
  },
  {
    icon: <MessageCircle size={20} style={{ color: '#059669' }} />,
    bg: '#ECFDF5',
    title: 'FAQs',
    description: 'Answers to common questions.',
    articles: ['How do I change my timezone?', 'Can invitees reschedule?', 'How do I add buffer time?', 'Setting up group events'],
  },
];

const POPULAR = [
  'How to set up a 30-minute meeting',
  'Connecting Google Calendar',
  'Sharing your scheduling link',
  'Cancelling or rescheduling a meeting',
  'Adding custom questions to bookings',
  'Setting buffer time between meetings',
];

const CONTACT_OPTIONS = [
  {
    icon: <MessageCircle size={18} style={{ color: '#006BFF' }} />,
    bg: '#EBF5FF',
    title: 'Live Chat',
    desc: 'Chat with our support team in real time.',
    cta: 'Start chat',
  },
  {
    icon: <Mail size={18} style={{ color: '#7C3AED' }} />,
    bg: '#F5F3FF',
    title: 'Email Support',
    desc: "Send us a message and we'll get back within 24 hours.",
    cta: 'Send email',
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');

  const filtered = POPULAR.filter((a) => a.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      {/* ── Hero search ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #006BFF 0%, #3B82F6 100%)',
          borderRadius: 12, padding: '36px 32px', marginBottom: 28, textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          How can we help you?
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
          Search our help center or browse categories below
        </p>
        <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for help articles..."
            style={{
              width: '100%', padding: '11px 14px 11px 40px',
              border: 'none', borderRadius: 8,
              fontSize: 13, color: '#374151', background: '#fff',
              outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </motion.div>

      {/* ── Search results ── */}
      {search && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, marginBottom: 24, overflow: 'hidden' }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E1E3EA' }}>
            <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{search}&quot;
            </p>
          </div>
          {filtered.length === 0 ? (
            <p style={{ padding: '20px 16px', fontSize: 13, color: '#6B7280' }}>No articles found. Try a different search.</p>
          ) : (
            filtered.map((article, i) => (
              <div key={i} style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
              >
                <span style={{ fontSize: 13, color: '#111827' }}>{article}</span>
                <ChevronRight size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* ── Categories ── */}
      {!search && (
        <>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Browse by category</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, overflow: 'hidden' }}
              >
                <div style={{ padding: '18px 18px 12px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, background: cat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    {cat.icon}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{cat.title}</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>{cat.description}</p>
                </div>
                <div style={{ borderTop: '1px solid #F3F4F6' }}>
                  {cat.articles.map((article, j) => (
                    <div
                      key={j}
                      style={{
                        padding: '10px 18px', fontSize: 12, color: '#374151',
                        borderBottom: j < cat.articles.length - 1 ? '1px solid #F3F4F6' : 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                    >
                      {article}
                      <ChevronRight size={12} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Popular articles ── */}
          <div style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E1E3EA' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>Popular articles</p>
            </div>
            {POPULAR.map((article, i) => (
              <div key={i} style={{
                padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: i < POPULAR.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <HelpCircle size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#374151' }}>{article}</span>
                </div>
                <ChevronRight size={13} style={{ color: '#D1D5DB', flexShrink: 0 }} />
              </div>
            ))}
          </div>

          {/* ── Contact support ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {CONTACT_OPTIONS.map((item) => (
              <div key={item.title} style={{
                background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10,
                padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8, background: item.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>{item.desc}</p>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: '#006BFF',
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  }}>
                    {item.cta} <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}