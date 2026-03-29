'use client';
import { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Calendar, Clock, User, Mail, ArrowLeft } from 'lucide-react';
import { getMeeting } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

function ConfirmedContent() {
  const params = useParams();
  const username = params?.username as string;
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meetingId');

  const { data, isLoading } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => getMeeting(meetingId!),
    enabled: !!meetingId,
  });

  const meeting = data?.meeting;

  const handleAddGoogle = () => {
    if (!meeting) return;
    const start = `${meeting.date.replace(/-/g, '')}T${meeting.startTime.replace(':', '')}00`;
    const end   = `${meeting.date.replace(/-/g, '')}T${meeting.endTime.replace(':', '')}00`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.eventType?.name || 'Meeting')}&dates=${start}/${end}`;
    window.open(url, '_blank');
  };

  const handleAddICal = () => {
    toast('iCal download coming soon');
  };

  return (
    <div
      style={{
        minHeight: '100vh', background: '#F9FAFB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 16px', fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ maxWidth: 440, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          {/* Green header */}
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', padding: '36px 32px', textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 16 }}
              style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle size={34} style={{ color: '#fff' }} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}
            >
              Confirmed!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0 }}
            >
              A calendar invitation has been sent to your email address.
            </motion.p>
          </div>

          {/* Meeting details */}
          <div style={{ padding: 28 }}>
            {isLoading ? (
              <LoadingSpinner size="sm" className="py-6" />
            ) : meeting ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {/* Event name badge */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: '#F9FAFB',
                    border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: meeting.eventType?.color || '#0069FF',
                    }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {meeting.eventType?.name}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: Calendar, text: formatDate(meeting.date) },
                    { icon: Clock,    text: `${formatTime(meeting.startTime)} – ${formatTime(meeting.endTime)} (${meeting.duration} min)` },
                    { icon: User,     text: meeting.inviteeName },
                    { icon: Mail,     text: meeting.inviteeEmail },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={15} style={{ color: '#0069FF', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#374151' }}>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button
                    onClick={handleAddGoogle}
                    style={{
                      flex: 1, padding: '10px 0', border: '1px solid #E5E7EB',
                      borderRadius: 6, background: '#fff', fontSize: 13, fontWeight: 500,
                      color: '#374151', cursor: 'pointer', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    Add to Google Calendar
                  </button>
                  <button
                    onClick={handleAddICal}
                    style={{
                      flex: 1, padding: '10px 0', border: '1px solid #E5E7EB',
                      borderRadius: 6, background: '#fff', fontSize: 13, fontWeight: 500,
                      color: '#374151', cursor: 'pointer', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    Add to iCal
                  </button>
                </div>
              </motion.div>
            ) : (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
                Your meeting has been confirmed.
              </p>
            )}

            <Link
              href={`/${username}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginTop: 20, fontSize: 13, color: '#6B7280', textDecoration: 'none',
              }}
            >
              <ArrowLeft size={13} /> Back to booking page
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ConfirmedContent />
    </Suspense>
  );
}
