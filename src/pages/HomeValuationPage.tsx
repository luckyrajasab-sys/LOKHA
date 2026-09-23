import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { requestHomeValuation, getMarketRateRange } from '../services/valuationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

interface HomeValuationPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const HomeValuationPage: React.FC<HomeValuationPageProps> = ({ onNavigate: _onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Inputs
  const [city, setCity] = useState<string>('Chennai');
  const [microMarket, setMicroMarket] = useState<string>('Boat Club / RA Puram');
  const [propertyType, setPropertyType] = useState<string>('Luxury Apartment');
  const [areaSqFt, setAreaSqFt] = useState<number>(2600);
  const [propertyAge, _setPropertyAge] = useState<string>('0-2 Years (New Launch)');
  const [hasItalianMarble, setHasItalianMarble] = useState<boolean>(true);
  const [hasPrivatePool, setHasPrivatePool] = useState<boolean>(false);
  const [hasSeaView, setHasSeaView] = useState<boolean>(false);

  // Valuation Calculation Output
  const [valuationResult, setValuationResult] = useState<{
    minPrice: number;
    maxPrice: number;
    ratePerSqft: number;
    monthlyRentMin: number;
    monthlyRentMax: number;
  } | null>(null);

  // Submission for official audit
  const [officialName, setOfficialName] = useState<string>(user?.displayName || '');
  const [officialEmail, setOfficialEmail] = useState<string>(user?.email || '');
  const [officialPhone, setOfficialPhone] = useState<string>(user?.phone || '');
  const [officialNotes, setOfficialNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const microMarketsByCity: Record<string, string[]> = {
    Chennai: ['Boat Club / RA Puram', 'Poes Garden', 'East Coast Road (ECR)', 'Anna Nagar', 'Nungambakkam', 'OMR IT Corridor'],
    Bengaluru: ['Indiranagar', 'Sadashivanagar', 'Koramangala', 'Lavelle Road', 'Whitefield Prestige Enclave'],
    Mumbai: ['Worli Sea Face', 'Bandra West (Pali Hill)', 'Juhu Beachfront', 'Malabar Hill', 'BKC Commercial Hub'],
    Hyderabad: ['Jubilee Hills', 'Banjara Hills', 'Hitec City Knowledge Park', 'Gachibowli Financial District'],
    Pune: ['Koregaon Park', 'Kalyani Nagar', 'Boat Club Road', 'Baner High Street'],
    Goa: ['Assagao Luxury Enclave', 'Anjuna Hilltop', 'Candolim Beachside', 'Aldona Heritage Village']
  };

  const calculateEstimate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const rateRange = getMarketRateRange(city);
    let baseRate = (rateRange.minRate + rateRange.maxRate) / 2;

    // Adjust for micro-market tier
    if (microMarket.includes('Boat Club') || microMarket.includes('Poes Garden') || microMarket.includes('Worli') || microMarket.includes('Jubilee')) {
      baseRate *= 1.35;
    }

    // Adjust for finishes
    if (hasItalianMarble) baseRate += 1200;
    if (hasPrivatePool) baseRate += 1800;
    if (hasSeaView) baseRate += 2500;

    // Adjust for age
    if (propertyAge.includes('5+')) baseRate *= 0.88;

    const fairValue = Math.round(baseRate * areaSqFt);
    const minVal = Math.round(fairValue * 0.94);
    const maxVal = Math.round(fairValue * 1.06);

    const rentMin = Math.round(fairValue * 0.0027);
    const rentMax = Math.round(fairValue * 0.0034);

    setValuationResult({
      minPrice: minVal,
      maxPrice: maxVal,
      ratePerSqft: Math.round(baseRate),
      monthlyRentMin: rentMin,
      monthlyRentMax: rentMax
    });
  };

  const handleOfficialValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialPhone) {
      showToast('Please provide your contact number for the valuer', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await requestHomeValuation({
        userId: user?.id || 'guest',
        userName: officialName || 'Homeowner',
        userEmail: officialEmail,
        userPhone: officialPhone,
        city: city,
        microMarket: microMarket,
        propertyType: propertyType,
        areaSqFt: areaSqFt,
        estimatedValueMin: valuationResult?.minPrice || 10000000,
        estimatedValueMax: valuationResult?.maxPrice || 12000000,
        notes: officialNotes
      });
      setSubmittedSuccess(true);
      showToast('Institutional valuation request logged. A certified surveyor will connect within 24 hours.', 'success');
    } catch {
      showToast('Failed to submit valuation request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      {/* Hero Header */}
      <div style={{
        padding: '3.5rem 1.5rem 2.5rem',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderBottom: '1px solid var(--border)',
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
            <TrendingUp size={14} /> Certified Indian Real Estate Valuation Engine
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            color: 'var(--text-primary)'
          }}>
            Instant Luxury Property Market Valuation
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto'
          }}>
            Estimate real-time capital values, gross rental yields, and micro-market appreciation trends calibrated against actual sub-registrar circle rates and transaction comps.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Valuation Input Form */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Enter Property Specifications
            </h2>

            <form onSubmit={(e) => calculateEstimate(e)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* City Selection */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Metropolitan Hub
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    setMicroMarket(microMarketsByCity[newCity]?.[0] || 'Prime Central');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                >
                  {Object.keys(microMarketsByCity).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Micro-market */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Prime Micro-Market / Neighborhood
                </label>
                <select
                  value={microMarket}
                  onChange={(e) => setMicroMarket(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                >
                  {(microMarketsByCity[city] || []).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Property Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Typology
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Luxury Apartment">Luxury Apartment</option>
                    <option value="Independent Villa">Independent Villa</option>
                    <option value="Penthouse">Sky Penthouse</option>
                    <option value="Freehold Plot">Freehold Plot</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Super Area (Sq.Ft)
                  </label>
                  <input
                    type="number"
                    min={500}
                    max={50000}
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Inclusions */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Signature Inclusions & Views
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasItalianMarble}
                      onChange={(e) => setHasItalianMarble(e.target.checked)}
                      style={{ accentColor: 'var(--gold-primary)' }}
                    />
                    Imported Italian Marble & Designer Woodwork
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasPrivatePool}
                      onChange={(e) => setHasPrivatePool(e.target.checked)}
                      style={{ accentColor: 'var(--gold-primary)' }}
                    />
                    Private Plunge Pool / Rooftop Terrace
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasSeaView}
                      onChange={(e) => setHasSeaView(e.target.checked)}
                      style={{ accentColor: 'var(--gold-primary)' }}
                    />
                    Unobstructed Oceanfront / Skyline / Golf Course Vista
                  </label>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.75rem',
                  padding: '0.95rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gold-primary)',
                  color: 'var(--gold-text)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(198, 161, 91, 0.35)',
                  transition: 'background-color 250ms ease, transform 200ms ease'
                }}
              >
                Calculate Valuation Estimate
              </button>
            </form>
          </div>

          {/* Valuation Output & Certified Audit Request */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {valuationResult ? (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Estimated Fair Market Value Range
                </span>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--gold-primary)', margin: '0.25rem 0 0.5rem' }}>
                  {formatPrice(valuationResult.minPrice)} – {formatPrice(valuationResult.maxPrice)}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Derived from {city} ({microMarket}) benchmark rate of ~₹{valuationResult.ratePerSqft.toLocaleString()}/sq.ft.
                </p>

                <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '1.5rem' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Estimated Monthly Rent</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                      ₹{(valuationResult.monthlyRentMin / 1000).toFixed(0)}k – ₹{(valuationResult.monthlyRentMax / 1000).toFixed(0)}k/mo
                    </span>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Expected Gross Rental Yield</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16A34A' }}>3.2% – 3.8% p.a.</span>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}>
                  <strong style={{ color: '#16A34A' }}>✓ 5-Year Appreciation Track Record:</strong> Historical transaction data in {microMarket} reflects a steady 8.2% compound annual capital appreciation.
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '2.5rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-card)'
              }}>
                <Sparkles size={40} color="var(--gold-primary)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Ready to Value Your Residence
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto' }}>
                  Configure your city, super area, and luxury finishes on the left, then click &quot;Calculate Valuation Estimate&quot;.
                </p>
              </div>
            )}

            {/* Official Surveyor Valuation Form */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '2rem',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--gold-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Request Certified Field Valuation
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Need an official valuation certificate for private wealth division, NRI repatriation, or institutional sale? Our certified RICS surveyors will conduct an on-site physical audit.
              </p>

              {submittedSuccess ? (
                <div style={{
                  padding: '1.5rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  textAlign: 'center'
                }}>
                  <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 0.5rem' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#16A34A', marginBottom: '0.35rem' }}>
                    Request Confirmed
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Our Senior Chartered Valuation Officer for {city} will contact you at {officialPhone} within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleOfficialValuationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={officialName}
                      onChange={(e) => setOfficialName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />

                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp"
                      value={officialPhone}
                      onChange={(e) => setOfficialPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Specific questions or purpose of valuation..."
                    value={officialNotes}
                    onChange={(e) => setOfficialNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      resize: 'none'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--gold-primary)',
                      color: 'var(--gold-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Book Certified Physical Valuation'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
