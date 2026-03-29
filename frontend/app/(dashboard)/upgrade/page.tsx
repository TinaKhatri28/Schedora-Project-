'use client';
import { motion } from 'framer-motion';
import { Check, Zap, Users, Building } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'For individuals getting started with scheduling',
    icon: <Zap size={20} style={{ color: '#006BFF' }} />,
    color: '#006BFF',
    current: true,
    features: [
      '1 active event type',
      'Unlimited 1-on-1 meetings',
      'Calendly branding',
      'Google & Outlook Calendar sync',
      'Automated event notifications',
    ],
    cta: 'Current plan',
    ctaDisabled: true,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 10,
    period: 'per seat / month',
    description: 'For professionals who need more customization',
    icon: <Users size={20} style={{ color: '#7C3AED' }} />,
    color: '#7C3AED',
    current: false,
    popular: true,
    features: [
      'Unlimited active event types',
      'Group events & polls',
      'Custom branding & colors',
      'Zoom, Teams, Webex integrations',
      'Automated workflows',
      'Payments via Stripe & PayPal',
      'Analytics & reporting',
    ],
    cta: 'Upgrade to Standard',
    ctaDisabled: false,
  },
  {
    id: 'teams',
    name: 'Teams',
    price: 16,
    period: 'per seat / month',
    description: 'For teams that need collaboration & routing',
    icon: <Building size={20} style={{ color: '#059669' }} />,
    color: '#059669',
    current: false,
    features: [
      'Everything in Standard',
      'Round-robin & collective events',
      'Routing forms',
      'Salesforce & HubSpot integrations',
      'Admin management',
      'SAML SSO',
      'Priority support',
    ],
    cta: 'Upgrade to Teams',
    ctaDisabled: false,
  },
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the billing period.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.' },
  { q: 'Is there a free trial?', a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.' },
  { q: 'Can I switch plans?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from your account settings.' },
];

export default function UpgradePage() {
  return (
    <DashboardLayout>
      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 36 }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, color: '#006BFF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Pricing
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
          Upgrade your plan
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 420, margin: '0 auto' }}>
          Get more features, remove limits, and grow your scheduling workflow.
        </p>
      </motion.div>

      {/* ── Plans grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto 48px' }}>
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            custom={i} initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
            style={{
              background: '#fff',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid #E1E3EA',
              borderRadius: 12, padding: '24px 22px',
              position: 'relative', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: plan.color, color: '#fff',
                padding: '3px 14px', borderRadius: 9999,
                fontSize: 11, fontWeight: 700,
              }}>
                Most popular
              </div>
            )}

            {/* Plan header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: plan.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {plan.icon}
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{plan.name}</span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#111827' }}>
                {plan.price === 0 ? 'Free' : `$${plan.price}`}
              </span>
              {plan.price > 0 && (
                <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>{plan.period}</span>
              )}
            </div>

            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
              {plan.description}
            </p>

            {/* CTA */}
            <button
              disabled={plan.ctaDisabled}
              style={{
                width: '100%', padding: '10px 0',
                background: plan.ctaDisabled ? '#F3F4F6' : plan.color,
                color: plan.ctaDisabled ? '#9CA3AF' : '#fff',
                border: 'none', borderRadius: 6,
                fontSize: 13, fontWeight: 600,
                cursor: plan.ctaDisabled ? 'default' : 'pointer',
                marginBottom: 18, transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!plan.ctaDisabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              {plan.cta}
            </button>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Check size={13} style={{ color: plan.color, marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20, textAlign: 'center' }}>
          Frequently asked questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              style={{ background: '#fff', border: '1px solid #E1E3EA', borderRadius: 10, padding: '16px 20px' }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{item.q}</p>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{item.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}