import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { upgradeUserToPremium } from '../../firebase/firestore';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

interface TierPlan {
  id: 'silver' | 'gold' | 'platinum';
  name: string;
  price: number;
  badge?: string;
  popular?: boolean;
  description: string;
  features: string[];
}

const TIERS: TierPlan[] = [
  {
    id: 'silver',
    name: 'Silver Access',
    price: 350,
    description: 'Essential tier for prospective buyers and tenants looking for direct contacts.',
    features: [
      '10 Direct Inquiries & Owner Messages',
      'Direct Phone Number Reveals',
      'Basic Virtual Tour Concierge',
      '30-Day Active Membership'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Privilege',
    price: 500,
    popular: true,
    badge: 'MOST POPULAR',
    description: 'The preferred choice for active investors and high-value property buyers.',
    features: [
      '25 Direct Owner Inquiries & WhatsApp Access',
      'Priority Response Guarantee (under 2 hours)',
      'Verified VIP Buyer Badge on Listings',
      'Assisted Property Verification Reports',
      '60-Day Active Membership'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    price: 750,
    badge: 'UNLIMITED VIP',
    description: 'Unrestricted luxury access to exclusive estates, owners, and developers.',
    features: [
      'UNLIMITED Direct Inquiries & Owner Contact',
      'Direct Phone, Email & Instant Messaging',
      'Dedicated 1-on-1 Luxury Real Estate Advisor',
      'Early Access to Off-Market Secret Listings',
      'Official Gold Crown Status on Profile',
      '365-Day Extended Validity'
    ]
  }
];

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  reason = 'You have reached the 3-free communication limit with property owners.'
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedTier, setSelectedTier] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async (tier: 'silver' | 'gold' | 'platinum') => {
    if (!user) {
      showToast('Please sign in to upgrade your membership.', 'info');
      return;
    }

    try {
      setProcessing(true);
      // Simulate real-time secure gateway payment
      await new Promise(resolve => setTimeout(resolve, 900));
      await upgradeUserToPremium(user.id, tier);
      showToast(`Welcome to Lokha ${tier.toUpperCase()}! Unlimited owner communication is now enabled.`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Upgrade error:', err);
      showToast(err.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#0A0A0F',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15)',
          padding: '2rem 2.25rem',
          position: 'relative',
          color: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-secondary, #A0A0B0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            color: 'var(--gold-primary, #D4AF37)',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '0.85rem',
            textTransform: 'uppercase'
          }}>
            <Crown size={15} />
            Lokha Elite Membership
          </div>

          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            marginBottom: '0.65rem',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Unlock Direct Owner Communication
          </h2>

          <p style={{ fontSize: '0.925rem', color: '#B0B0C0', lineHeight: 1.5 }}>
            {reason} You get <strong>3 free communications</strong> on standard accounts. Upgrade now to connect directly with owners, verified developers, and private estate agents.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                style={{
                  position: 'relative',
                  padding: '1.75rem 1.4rem',
                  borderRadius: 'var(--radius-lg, 12px)',
                  backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.08)' : '#0E0E16',
                  border: isSelected ? '2px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 10px 30px rgba(212, 175, 55, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Badge if popular */}
                {tier.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: tier.popular ? '#D4AF37' : '#9333EA',
                    color: tier.popular ? '#070709' : '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    letterSpacing: '0.06em',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    {tier.badge}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      {tier.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#9090A0', marginTop: '0.25rem', lineHeight: 1.35 }}>
                      {tier.description}
                    </p>
                  </div>
                </div>

                {/* Price Display */}
                <div style={{ margin: '1rem 0 1.25rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontSize: '1.1rem', color: '#D4AF37', fontWeight: 700 }}>₹</span>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                    {tier.price}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#888899' }}>one-time</span>
                </div>

                {/* Feature Bullet points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, marginBottom: '1.5rem' }}>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#D0D0DE' }}>
                      <Check size={14} color="#D4AF37" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Choose button inside card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgrade(tier.id);
                  }}
                  disabled={processing}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    backgroundColor: isSelected ? 'var(--gold-primary, #D4AF37)' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#070709' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 16px rgba(212, 175, 55, 0.4)' : 'none'
                  }}
                >
                  {processing && selectedTier === tier.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      Select ₹{tier.price} Plan
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem',
          fontSize: '0.8rem',
          color: '#8A8A9C'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={15} color="#D4AF37" /> 100% Verified Real Estate Owners
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PhoneCall size={15} color="#D4AF37" /> Instant Phone & Direct WhatsApp
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={15} color="#D4AF37" /> Instant Activation
          </span>
        </div>
      </div>
    </div>
  );
};
