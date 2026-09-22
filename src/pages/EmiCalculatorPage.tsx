import React, { useState } from 'react';
import {
  Calculator,
  Building,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../components/common/Toast';

interface EmiCalculatorPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const EmiCalculatorPage: React.FC<EmiCalculatorPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const [loanAmount, setLoanAmount] = useState<number>(15000000); // 1.5 Cr
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 years
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // EMI Math
  const monthlyRate = interestRate / (12 * 100);
  const totalMonths = tenureYears * 12;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - loanAmount;
  const principalPct = Math.round((loanAmount / totalPayment) * 100);
  const interestPct = 100 - principalPct;

  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Generate Year-by-Year Amortization
  const generateAmortization = () => {
    let balance = loanAmount;
    const schedule = [];

    for (let yr = 1; yr <= tenureYears; yr++) {
      let principalYear = 0;
      let interestYear = 0;

      for (let m = 1; m <= 12; m++) {
        const intMonth = balance * monthlyRate;
        const princMonth = emi - intMonth;
        interestYear += intMonth;
        principalYear += princMonth;
        balance -= princMonth;
      }

      schedule.push({
        year: yr,
        principalPaid: Math.round(principalYear),
        interestPaid: Math.round(interestYear),
        balance: Math.max(0, Math.round(balance))
      });
    }

    return schedule;
  };

  const banks = [
    { name: 'State Bank of India (SBI)', rate: '8.40% - 9.15%', maxLTV: '80%', processingFee: 'Zero for luxury estates' },
    { name: 'HDFC Bank', rate: '8.50% - 9.25%', maxLTV: '80%', processingFee: '0.25% or max ₹5,000' },
    { name: 'ICICI Bank', rate: '8.60% - 9.35%', maxLTV: '80%', processingFee: '0.30%' },
    { name: 'Axis Bank', rate: '8.65% - 9.40%', maxLTV: '75%', processingFee: '0.25%' },
    { name: 'Kotak Mahindra Bank', rate: '8.55% - 9.10%', maxLTV: '80%', processingFee: 'Special HNWI rate waiver' }
  ];

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary, #070709)',
      color: 'var(--text-primary, #FFFFFF)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Hero Header */}
      <div style={{
        padding: '3.5rem 1.5rem 2.5rem',
        background: 'linear-gradient(180deg, #101018 0%, #070709 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '0.8rem',
            color: 'var(--gold-primary)',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Calculator size={14} /> Indian Premier Home Loan Analytics
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            color: '#FFFFFF'
          }}>
            Luxury Home Loan EMI Calculator
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '0 auto'
          }}>
            Calculate your monthly outflows, total interest impact, and compare exclusive HNWI mortgage rates across premier Indian banking partners.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        {/* Calculator Grid: Inputs (Left) + Visual Summary (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
          marginBottom: '3rem'
        }}>
          {/* Inputs Box */}
          <div style={{
            backgroundColor: '#101018',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            {/* 1. Loan Amount */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Principal Loan Amount
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-primary)' }}>
                  {formatINR(loanAmount)}
                </span>
              </div>
              <input
                type="range"
                min={2000000}
                max={300000000}
                step={500000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold-primary)', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
                <span>₹20 Lakh</span>
                <span>₹30 Crore</span>
              </div>
            </div>

            {/* 2. Interest Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Annual Interest Rate
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-primary)' }}>
                  {interestRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min={7.0}
                max={14.0}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold-primary)', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
                <span>7.0%</span>
                <span>14.0%</span>
              </div>
            </div>

            {/* 3. Tenure Years */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Loan Tenure
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-primary)' }}>
                  {tenureYears} Years ({totalMonths} Months)
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold-primary)', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
                <span>3 Years</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div style={{
            backgroundColor: '#101018',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Estimated Monthly Outflow
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold-primary)', lineHeight: 1.15 }}>
                ₹{emi.toLocaleString('en-IN')}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>/ month</span>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Principal vs Interest Visual Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#22C55E' }}>Principal: {principalPct}% ({formatINR(loanAmount)})</span>
                <span style={{ color: '#EAB308' }}>Interest: {interestPct}% ({formatINR(totalInterest)})</span>
              </div>
              <div style={{ height: '12px', borderRadius: '6px', overflow: 'hidden', display: 'flex', backgroundColor: '#1A1A24' }}>
                <div style={{ width: `${principalPct}%`, backgroundColor: '#22C55E' }} />
                <div style={{ width: `${interestPct}%`, backgroundColor: '#EAB308' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Total Interest Payable</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#EAB308' }}>{formatINR(totalInterest)}</span>
              </div>

              <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Total Overall Payment</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>{formatINR(totalPayment)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowAmortization(!showAmortization)}
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'transparent',
                border: '1px solid var(--gold-primary)',
                color: 'var(--gold-primary)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {showAmortization ? 'Hide Amortization Table' : 'View Year-by-Year Amortization Table ↓'}
            </button>

            <button
              onClick={() => {
                showToast('Connecting with premier private banking mortgage desk...', 'success');
                onNavigate('contact');
              }}
              style={{
                padding: '0.95rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gold-primary)',
                color: '#070709',
                fontSize: '0.9rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)'
              }}
            >
              Apply for Pre-Approved HNWI Home Loan <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Amortization Table (Accordion/Toggle) */}
        {showAmortization && (
          <div style={{
            backgroundColor: '#101018',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            padding: '1.75rem',
            marginBottom: '3rem',
            overflowX: 'auto'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Year-by-Year Loan Amortization Schedule
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Year</th>
                  <th style={{ padding: '0.75rem' }}>Principal Paid</th>
                  <th style={{ padding: '0.75rem' }}>Interest Paid</th>
                  <th style={{ padding: '0.75rem' }}>Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {generateAmortization().map(row => (
                  <tr key={row.year} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.875rem' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--gold-primary)' }}>Year {row.year}</td>
                    <td style={{ padding: '0.75rem', color: '#22C55E' }}>₹{row.principalPaid.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem', color: '#EAB308' }}>₹{row.interestPaid.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem', color: '#FFFFFF' }}>₹{row.balance.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Indian Bank Comparisons */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Premier Bank Mortgage Rate Comparison
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Indicative home loan interest rates for luxury residential acquisitions across India&apos;s leading institutions.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {banks.map((b, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#101018',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} color="var(--gold-primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>{b.name}</span>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold-primary)' }}>
                  {b.rate}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Max LTV: <strong>{b.maxLTV}</strong>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Fee: {b.processingFee}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
