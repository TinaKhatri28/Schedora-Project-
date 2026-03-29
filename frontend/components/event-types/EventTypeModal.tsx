'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { EventType } from '@/lib/types';

interface Props {
  eventType: EventType | null;
  onSave: (data: any) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const COLORS   = ['#006BFF', '#00C48C', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

interface FormState {
  name: string;
  slug: string;
  duration: number;
  description: string;
  color: string;
  location: string;
}

const defaultForm: FormState = {
  name: '', slug: '', duration: 30, description: '', color: '#006BFF', location: '',
};

export default function EventTypeModal({ eventType, onSave, onClose, isLoading }: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);

  useEffect(() => {
    if (eventType) {
      setForm({
        name:        eventType.name,
        slug:        eventType.slug,
        duration:    eventType.duration,
        description: eventType.description || '',
        color:       eventType.color,
        location:    eventType.location || '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [eventType]);

  const handleNameChange = (name: string) => {
    // Auto-generate slug only when creating new (not editing)
    const autoSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, name, ...(!eventType && { slug: autoSlug }) }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    onSave({ ...form, ...(eventType && { id: eventType.id }) });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-surface rounded-2xl w-full max-w-lg shadow-modal overflow-hidden"
          initial={{ scale: 0.9, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-bold text-lg text-gray-900">
              {eventType ? 'Edit Event Type' : 'New Event Type'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg text-muted transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="label">Event Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. 30 Minute Meeting"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Duration</label>
                <select
                  className="input"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d} minutes</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">URL Slug *</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-surface">
                  <span className="px-3 py-2.5 bg-bg text-muted text-sm border-r border-border shrink-0">/</span>
                  <input
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-surface text-gray-900"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
                    }
                    placeholder="30min"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this meeting type..."
              />
            </div>

            <div>
              <label className="label">Location / Link</label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Zoom link, Google Meet URL, or address"
              />
            </div>

            <div>
              <label className="label">Color</label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                    style={{
                      background: c,
                      boxShadow: form.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                    }}
                  >
                    {form.color === c && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-border bg-bg/50">
            <button className="btn-secondary flex-1 justify-center" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary flex-1 justify-center"
              onClick={handleSubmit}
              disabled={isLoading || !form.name.trim() || !form.slug.trim()}
            >
              {isLoading ? 'Saving...' : eventType ? 'Save Changes' : 'Create Event Type'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
