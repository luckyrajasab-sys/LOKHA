import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { useToast } from '../common/Toast';

interface MortgageCalculatorWidgetProps {
  initialPrice?: number;
  propertyTitle?: string;
}

export const MortgageCalculatorWidget: React.FC<MortgageCalculatorWidgetProps> = ({
  initialPrice = 15000000,
  propertyTitle
}) => {
  const { showToast } = useToast();
  const [price, setPrice] = useState(initialPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  // Computations
  const downPaymentAmount = Math.round(price * (downPaymentPct / 100));
  const principal = price - downPaymentAmount;
  const monthlyRate = interestRate / (12 * 100);
  const totalMonths = tenureYears * 12;

  const monthlyEMI = Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const totalPayment = monthlyEMI * totalMonths;
  const totalInterest = Math.max(0, totalPayment - principal);
  const principalPct = Math.round((principal / totalPayment) * 100) || 50;
  const interestPct = 100 - principalPct;

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const handlePreApproval = () => {
    const titleSuffix = propertyTitle ? ` for ${propertyTitle}` : '';
    showToast(`Your luxury mortgage pre-approval inquiry${titleSuffix} has been dispatched to premier private banking partners (HDFC Private, ICICI Signature, Axis Wealth).`, 'success');
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #121217)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        padding: '1.75rem',
        color: 'var(--text-primary, #FFFFFF)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <Calculator size={22} color="var(--gold-primary, #D4AF37)" />
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            Luxury Mortgage & EMI Estimator
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #9CA3AF)', margin: '0.15rem 0 0 0' }}>
            Calculate customized monthly loan commitments with private wealth interest rates
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}
      >
        {/* Left: Input Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Property Price */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary, #9CA3AF)' }}>Purchase Price</span>
              <span style={{ fontWeight: 700, color: 'var(--gold-primary, #D4AF37)' }}>{formatPrice(price)}</span>
            </div>
            <input
              type="range"
              min={2500000}
              max={150000000}
              step={500000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold-primary, #D4AF37)' }}
            />
          </div>

          {/* Down Payment */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary, #9CA3AF)' }}>
                Down Payment ({downPaymentPct}%)
              </span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{formatPrice(downPaymentAmount)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold-primary, #D4AF37)' }}
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary, #9CA3AF)' }}>Annual Interest Rate</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{interestRate.toFixed(1)}% p.a.</span>
            </div>
            <input
              type="range"
              min={6.5}
              max={12.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold-primary, #D4AF37)' }}
            />
          </div>

          {/* Tenure */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary, #9CA3AF)' }}>Loan Tenure</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold-primary, #D4AF37)' }}
            />
          </div>
        </div>

        {/* Right: Results Card with Breakdown */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Estimated Monthly Payment
          </span>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--gold-primary, #D4AF37)', margin: '0.25rem 0 1rem 0' }}>
            ₹{monthlyEMI.toLocaleString()}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #9CA3AF)', fontWeight: 500 }}> / month</span>
          </div>

          {/* Ratio Bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ width: `${principalPct}%`, backgroundColor: '#3B82F6' }} title={`Principal ${principalPct}%`} />
              <div style={{ width: `${interestPct}%`, backgroundColor: 'var(--gold-primary, #D4AF37)' }} title={`Interest ${interestPct}%`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary, #9CA3AF)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                Principal: {formatPrice(principal)} ({principalPct}%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--gold-primary, #D4AF37)' }} />
                Total Interest: {formatPrice(totalInterest)} ({interestPct}%)
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              paddingTop: '0.85rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.825rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary, #9CA3AF)' }}>Total Amount Payable:</span>
              <strong style={{ color: '#FFFFFF' }}>{formatPrice(totalPayment + downPaymentAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary, #9CA3AF)' }}>Loan Eligibility Estimate:</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Up to 80% LTV Qualified</span>
            </div>
          </div>

          {/* Pre-Approval CTA */}
          <button
            onClick={handlePreApproval}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              backgroundColor: 'var(--gold-primary, #D4AF37)',
              color: '#070709',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Get Pre-Approved with Banking Partner</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
