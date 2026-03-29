'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';

interface Props {
  username: string;
  slug: string;
  name: string;
  description?: string | null;
  duration: number;
  color: string;
}

export default function EventTypeCard({ username, slug, name, description, duration, color }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/${username}/${slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderLeft: `4px solid ${color}`,
          borderRadius: 8,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          cursor: 'pointer',
          transition: 'box-shadow 0.15s',
          boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: '#111827', margin: '0 0 4px' }}>
            {name}
          </p>
          {description && (
            <p style={{
              fontSize: 13, color: '#6B7280', margin: '0 0 4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: 13, color: '#6B7280' }}>{duration} min</span>
          </div>
        </div>
        <ChevronRight size={18} style={{ color: '#D1D5DB', flexShrink: 0 }} />
      </div>
    </Link>
  );
}
