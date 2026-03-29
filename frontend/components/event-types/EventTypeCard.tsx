'use client';
import { motion } from 'framer-motion';
import { Clock, Copy, Edit2, Trash2, Globe, Check } from 'lucide-react';
import { useState } from 'react';
import { EventType } from '@/lib/types';
import { copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  eventType: EventType;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export default function EventTypeCard({ eventType, onEdit, onDelete, onToggle }: Props) {
  const [copied, setCopied] = useState(false);
  const username = process.env.NEXT_PUBLIC_DEFAULT_USERNAME || 'arjun';
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${username}/${eventType.slug}`;

  const handleCopy = async () => {
    await copyToClipboard(bookingUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`card flex flex-col overflow-hidden hover:shadow-md transition-shadow p-0 ${
        !eventType.isActive ? 'opacity-70' : ''
      }`}
    >
      {/* Color accent bar */}
      <div className="h-1.5 shrink-0" style={{ background: eventType.color }} />

      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: eventType.color + '18' }}
          >
            <Clock size={20} style={{ color: eventType.color }} />
          </div>
          {/* isActive toggle */}
          <button
            onClick={onToggle}
            title={eventType.isActive ? 'Disable' : 'Enable'}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
              eventType.isActive ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                eventType.isActive ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <h3 className="font-bold text-[15px] text-gray-900 mb-1 leading-tight">{eventType.name}</h3>
        {eventType.description && (
          <p className="text-sm text-muted mb-3 line-clamp-2">{eventType.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-auto">
          <span className="badge-blue">
            <Clock size={11} /> {eventType.duration} min
          </span>
          <span className="badge-gray">
            <Globe size={11} /> /{eventType.slug}
          </span>
          {!eventType.isActive && <span className="badge-gray">Inactive</span>}
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-border flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="btn-secondary flex-1 justify-center text-xs py-1.5 px-3"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg border border-border hover:bg-primary/8 hover:border-primary/30 transition-colors text-primary"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg border border-border hover:bg-danger/10 hover:border-danger/30 transition-colors text-danger"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
