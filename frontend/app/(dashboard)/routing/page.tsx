'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Share2, Plus, GitBranch, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getRoutingForms, createRoutingForm } from '@/lib/api';

export default function RoutingPage() {
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['routing'],
    queryFn: getRoutingForms,
    select: (res: any) => res.routingForms ?? [],
  });

  const forms: any[] = data ?? [];

  const createMutation = useMutation({
    mutationFn: createRoutingForm,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routing'] });
      toast.success('Routing form created!');
      setCreating(false);
      setFormName('');
    },
    onError: () => toast.error('Failed to create form'),
  });

  return (
    <DashboardLayout>
      {forms.length === 0 && !creating ? (
        /* ── Empty state (matches Calendly routing page) ── */
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 540, margin: '60px auto 0', textAlign: 'center' }}
        >
          {/* Icon illustration */}
          <div style={{
            width: 80, height: 80, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #EBF5FF 0%, #F0F4FF 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Share2 size={32} style={{ color: '#006BFF' }} />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
            Qualify, route, and schedule meetings from your website
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
            Create or import an existing marketing form. Set up screening rules that send people
            to a specific booking page or URL, based on their responses.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href="#" style={{
              fontSize: 13, color: '#006BFF', fontWeight: 500, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <ExternalLink size={12} /> Learn more
            </a>
            <button
              onClick={() => setCreating(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#006BFF', color: '#fff', padding: '10px 20px',
                borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052CC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#006BFF'; }}
            >
              <Plus size={14} /> New routing form
            </button>
          </div>
        </motion.div>
      ) : (
        <div>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button
              onClick={() => setCreating(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#006BFF', color: '#fff', padding: '9px 18px',
                borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer',
              }}
            >
              <Plus size={15} /> New routing form
            </button>
          </div>

          {/* Forms list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {forms.map((form, i) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10,
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#EBF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <GitBranch size={18} style={{ color: '#006BFF' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{form.name}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                    {form.questions?.length ?? 0} questions · {form.rules?.length ?? 0} rules
                  </p>
                </div>
                <button style={{
                  padding: '6px 14px', border: '1px solid #E1E3EA', borderRadius: 6,
                  background: '#fff', fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer',
                }}>
                  Edit
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create form modal ── */}
      {creating && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#fff', borderRadius: 12, padding: 28,
              width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
              New Routing Form
            </h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Form name
            </label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Inbound Lead Qualification"
              style={{
                width: '100%', padding: '9px 12px',
                border: '1px solid #E1E3EA', borderRadius: 6,
                fontSize: 13, color: '#374151', outline: 'none', marginBottom: 20,
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setCreating(false); setFormName(''); }}
                style={{
                  padding: '8px 16px', border: '1px solid #E1E3EA', borderRadius: 6,
                  background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { if (formName.trim()) createMutation.mutate({ name: formName.trim() }); }}
                disabled={!formName.trim() || createMutation.isPending}
                style={{
                  padding: '8px 18px', border: 'none', borderRadius: 6,
                  background: '#006BFF', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  opacity: !formName.trim() ? 0.5 : 1,
                }}
              >
                {createMutation.isPending ? 'Creating…' : 'Create form'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}