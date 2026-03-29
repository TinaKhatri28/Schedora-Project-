'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Plus, ArrowLeft, Edit2, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getWorkflows, createWorkflow } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  icon: string;
  isTemplate: boolean;
}

const TRIGGER_LABELS: Record<string, string> = {
  BEFORE_EVENT: 'Before event',
  AFTER_EVENT: 'After event',
  CANCELLATION: 'On cancellation',
  NEW_BOOKING: 'New booking',
};

// ─── Envelope SVG icon (matches Calendly style) ───────────────────────────────

function EnvelopeIcon({ badgeColor }: { badgeColor: string }) {
  return (
    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="42" height="34" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
        <path d="M1 6l21 14L43 6" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
      </svg>
      <div style={{
        position: 'absolute', top: -4, right: -4,
        width: 18, height: 18, borderRadius: '50%',
        background: badgeColor,
        border: '2px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} />
    </div>
  );
}

// ─── Template definitions ─────────────────────────────────────────────────────

const ALL_TEMPLATES = [
  { id: 't1', name: 'Email reminder to host', description: 'Never miss an event — get automated email reminders', trigger: 'BEFORE_EVENT', action: 'EMAIL', badgeColor: '#22C55E' },
  { id: 't2', name: 'Email reminder to invitee', description: 'Reduce no-shows — send automated email reminders to invitees', trigger: 'BEFORE_EVENT', action: 'EMAIL', badgeColor: '#22C55E' },
  { id: 't3', name: 'Send thank you email', description: 'Build relationships with a quick thanks', trigger: 'AFTER_EVENT', action: 'EMAIL', badgeColor: '#EF4444' },
  { id: 't4', name: 'Email additional resources', description: 'Send links for additional resources to your invitees', trigger: 'AFTER_EVENT', action: 'EMAIL', badgeColor: '#3B82F6' },
  { id: 't5', name: 'Email reminder to someone else', description: 'Prompt non-attendees so they can help prepare for your meeting', trigger: 'BEFORE_EVENT', action: 'EMAIL', badgeColor: '#F59E0B' },
  { id: 't6', name: 'Request follow-up meeting', description: "Don't wait to meet again", trigger: 'AFTER_EVENT', action: 'EMAIL', badgeColor: '#8B5CF6' },
];

const PREVIEW_TEMPLATES = [ALL_TEMPLATES[1], ALL_TEMPLATES[2], ALL_TEMPLATES[0]];

// ─── View types ───────────────────────────────────────────────────────────────

type View = 'list' | 'add-new' | 'create';

// ─── Create Workflow Form ─────────────────────────────────────────────────────

function CreateWorkflowForm({
  template,
  onBack,
  onSave,
  isSaving,
}: {
  template: typeof ALL_TEMPLATES[0] | null;
  onBack: () => void;
  onSave: (data: { name: string; trigger: string; action: string; description: string }) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(template?.name ?? '');
  const [eventType, setEventType] = useState('');
  const [trigger] = useState(template?.trigger ?? 'BEFORE_EVENT');

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 15, color: '#374151', fontWeight: 500, marginBottom: 20, padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
        Create a workflow
      </h1>
      <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px' }}>Tina Khatri</p>

      {/* Name + Event type row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
            Workflow name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workflow name"
            style={{
              width: '100%', padding: '11px 14px',
              border: '1.5px solid #D1D5DB', borderRadius: 8,
              fontSize: 14, color: '#111827', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#006BFF'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'; }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
            Which event types will this apply to?
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #D1D5DB', borderRadius: 8,
                fontSize: 14, color: eventType ? '#111827' : '#9CA3AF',
                outline: 'none', appearance: 'none', background: '#fff',
                boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              <option value="" disabled>Select...</option>
              <option value="all">All event types</option>
              <option value="one-on-one">One-on-one</option>
              <option value="group">Group</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* When this happens */}
      <div style={{
        border: '1.5px solid #E5E7EB', borderRadius: 12,
        padding: '24px', marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
          When this happens
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', border: '1px solid #E5E7EB', borderRadius: 8,
          background: '#FAFAFA',
        }}>
          <span style={{ fontSize: 15, color: '#374151' }}>
            {trigger === 'BEFORE_EVENT' ? '24 hours before event starts' : 'After event ends'}
          </span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: '#006BFF',
          }}>
            <Edit2 size={13} /> Edit
          </button>
        </div>
      </div>

      {/* Connector line */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{ width: 2, height: 24, background: '#E5E7EB' }} />
      </div>

      {/* Do this */}
      <div style={{
        border: '1.5px solid #E5E7EB', borderRadius: 12,
        padding: '24px', marginBottom: 32,
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
          Do this
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', border: '1px solid #E5E7EB', borderRadius: 8,
          background: '#FAFAFA', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#EBF5FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mail size={18} style={{ color: '#006BFF' }} />
            </div>
            <span style={{ fontSize: 15, color: '#374151' }}>Send email to invitee</span>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: '#006BFF',
            }}>
              <Edit2 size={13} /> Edit
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: '#EF4444',
            }}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: '#006BFF',
          }}>
            <Plus size={15} /> Add action
          </button>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>1/5 actions added</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 12,
        borderTop: '1px solid #E5E7EB', paddingTop: 24,
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 24px', borderRadius: 8,
            border: '1.5px solid #D1D5DB', background: '#fff',
            fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ name, trigger, action: 'EMAIL', description: template?.description ?? '' })}
          disabled={isSaving || !name.trim()}
          style={{
            padding: '10px 28px', borderRadius: 8, border: 'none',
            background: isSaving || !name.trim() ? '#93C5FD' : '#006BFF',
            fontSize: 14, fontWeight: 600, color: '#fff',
            cursor: isSaving || !name.trim() ? 'default' : 'pointer',
          }}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Add New Workflow Page ────────────────────────────────────────────────────

function AddNewWorkflowPage({
  onBack,
  onSelectTemplate,
  onCreateOwn,
}: {
  onBack: () => void;
  onSelectTemplate: (tpl: typeof ALL_TEMPLATES[0]) => void;
  onCreateOwn: () => void;
}) {
  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 15, color: '#374151', fontWeight: 500, marginBottom: 20, padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
            Add new workflow
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Tina Khatri</p>
        </div>
        <button
          onClick={onCreateOwn}
          style={{
            padding: '10px 20px', borderRadius: 8,
            border: '1.5px solid #D1D5DB', background: '#fff',
            fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
        >
          Create your own workflow
        </button>
      </div>

      {/* Instruction */}
      <p style={{ fontSize: 15, color: '#374151', marginBottom: 20 }}>
        Choose from a workflow below. If you don&apos;t see anything you like, you can create your own.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', marginBottom: 28 }} />

      {/* 3-col grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
      }}>
        {ALL_TEMPLATES.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
              padding: '28px 24px 22px',
              display: 'flex', flexDirection: 'column', gap: 14,
              minHeight: 220,
            }}
          >
            <EnvelopeIcon badgeColor={tpl.badgeColor} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{tpl.name}</p>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{tpl.description}</p>
            </div>
            <button
              onClick={() => onSelectTemplate(tpl)}
              style={{
                width: '100%', padding: '10px 0',
                background: '#006BFF', color: '#fff', border: 'none',
                borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052CC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#006BFF'; }}
            >
              Add workflow
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof ALL_TEMPLATES[0] | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
  });

  const workflows: any[] = data?.workflows ?? [];

  const addMutation = useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow added!');
      setView('list');
      setSelectedTemplate(null);
    },
    onError: () => toast.error('Failed to add workflow'),
  });

  // ── Create form view ──
  if (view === 'create') {
    return (
      <DashboardLayout>
        <CreateWorkflowForm
          template={selectedTemplate}
          onBack={() => setView('add-new')}
          onSave={(data) => addMutation.mutate(data)}
          isSaving={addMutation.isPending}
        />
      </DashboardLayout>
    );
  }

  // ── Add new workflow view ──
  if (view === 'add-new') {
    return (
      <DashboardLayout>
        <AddNewWorkflowPage
          onBack={() => setView('list')}
          onSelectTemplate={(tpl) => {
            setSelectedTemplate(tpl);
            setView('create');
          }}
          onCreateOwn={() => {
            setSelectedTemplate(null);
            setView('create');
          }}
        />
      </DashboardLayout>
    );
  }

  // ── List / empty state view ──
  return (
    <DashboardLayout>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 15 }}>
          Loading…
        </div>
      ) : workflows.length === 0 ? (

        /* ── Empty state ── */
        <div style={{ maxWidth: '100%' }}>

          {/* Dropdown */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select style={{
                padding: '10px 36px 10px 14px', border: '1.5px solid #D1D5DB',
                borderRadius: 8, fontSize: 14, color: '#374151',
                appearance: 'none', background: '#fff', cursor: 'pointer', outline: 'none',
              }}>
                <option>My Schedora</option>
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 40, padding: '40px 0 20px' }}
          >
            {/* Envelope illustration */}
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: '#EBF5FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="50" height="42" viewBox="0 0 50 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="48" height="40" rx="5" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
                <path d="M1 7l24 17L49 7" stroke="#60A5FA" strokeWidth="1.5" fill="none" />
                <path d="M38 34l8 6M12 34l-8 6" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
              Automate your meeting communications
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 18px' }}>
              Workflows help you reduce no-shows and have more productive meetings. Plus, automated emails and
              texts save you time before and after events.
            </p>
            <a href="#" style={{
              fontSize: 14, color: '#006BFF', fontWeight: 600,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              ⓘ Learn more &rsaquo;
            </a>
          </motion.div>

          {/* Divider with label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
              Start with a workflow template
            </span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* 3-column preview templates */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginBottom: 24,
          }}>
            {PREVIEW_TEMPLATES.map((tpl, i) => (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
                  padding: '24px 22px 20px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  minHeight: 210,
                }}
              >
                <EnvelopeIcon badgeColor={tpl.badgeColor} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{tpl.name}</p>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{tpl.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setView('create');
                  }}
                  style={{
                    width: '100%', padding: '10px 0',
                    background: '#006BFF', color: '#fff', border: 'none',
                    borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052CC'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#006BFF'; }}
                >
                  Add workflow
                </button>
              </motion.div>
            ))}
          </div>

          {/* See all workflows */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setView('add-new')}
              style={{
                padding: '11px 32px', border: '1.5px solid #D1D5DB', borderRadius: 24,
                background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
            >
              See all workflows
            </button>
          </div>
        </div>

      ) : (

        /* ── Active workflows list ── */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Workflows</h1>
            <button
              onClick={() => setView('add-new')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#006BFF', color: '#fff', padding: '10px 20px',
                borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0052CC'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#006BFF'; }}
            >
              <Plus size={15} /> New Workflow
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workflows.map((wf, i) => (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
                  padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 9, background: '#EBF5FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Mail size={20} style={{ color: '#006BFF' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 3px' }}>{wf.name}</p>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                    {TRIGGER_LABELS[wf.trigger] ?? wf.trigger} · {wf.action}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                  background: wf.isActive ? 'rgba(5,150,105,0.08)' : '#F3F4F6',
                  color: wf.isActive ? '#059669' : '#6B7280',
                }}>
                  {wf.isActive ? 'Active' : 'Inactive'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}