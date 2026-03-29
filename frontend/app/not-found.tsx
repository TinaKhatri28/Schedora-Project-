import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh', background: '#F9FAFB',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', padding: '0 16px', textAlign: 'center',
      }}
    >
      {/* Large 404 */}
      <div
        style={{
          fontSize: 96, fontWeight: 800, color: '#E5E7EB',
          lineHeight: 1, marginBottom: 16, letterSpacing: '-0.04em',
        }}
      >
        404
      </div>

      {/* Schedora logo mark */}
      <div
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0069FF 0%, #3B82F6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>S</span>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>
        Page not found
      </h1>
      <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 360, margin: '0 0 32px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or the booking link may have changed.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/dashboard"
          style={{
            padding: '10px 24px', background: '#0069FF', color: '#fff',
            borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}
        >
          Go to Dashboard
        </Link>
        <Link
          href="/tina"
          style={{
            padding: '10px 24px', background: '#fff', color: '#374151',
            border: '1px solid #E5E7EB', borderRadius: 6,
            textDecoration: 'none', fontWeight: 500, fontSize: 14,
          }}
        >
          View Booking Page
        </Link>
      </div>
    </div>
  );
}
