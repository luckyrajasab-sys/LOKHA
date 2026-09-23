import React, { useState } from 'react';
import { Send, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Building, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createDetailedEnquiry } from '../../services/enquiryService';
import { useToast } from '../common/Toast';

interface MultiStepEnquiryProps {
  onSuccessNavigate?: (view: string) => void;
  isStandalonePage?: boolean;
}

export const MultiStepEnquiry: React.FC<MultiStepEnquiryProps> = ({ onSuccessNavigate, isStandalonePage = false }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 9;

  // Form State
  const [intent, setIntent] = useState<string>('Buy');
  const [propertyType, setPropertyType] = useState<string>('Apartment');
  const [country, setCountry] = useState<string>('India');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [city, setCity] = useState<string>('Chennai');
  const [locality, setLocality] = useState<string>('Poes Garden');
  const [budgetMin, setBudgetMin] = useState<string>('15000000');
  const [budgetMax, setBudgetMax] = useState<string>('35000000');
  const [bhk, setBhk] = useState<string>('3 BHK');
  const [areaSqFt, setAreaSqFt] = useState<string>('2400');
  const [furnishing, setFurnishing] = useState<string>('Semi-Furnished');
  const [parking, _setParking] = useState<string>('2 Covered Car Parks');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '24/7 Security & CCTV',
    'Power Backup',
    'Swimming Pool'
  ]);
  const [timeline, setTimeline] = useState<string>('1-3 months');
  const [name, setName] = useState<string>(user?.displayName || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [contactMethod, setContactMethod] = useState<string>('Phone & WhatsApp');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const amenityOptions = [
    '24/7 Security & CCTV',
    'Power Backup',
    'Private Swimming Pool',
    'Clubhouse & Gym',
    'Landscaped Private Garden',
    'Concierge Services',
    'Vastu Compliant',
    'Sea or Skyline View'
  ];

  const handleToggleAmenity = (item: string) => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('Please provide your name and phone number in step 7', 'error');
      setCurrentStep(7);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createDetailedEnquiry({
        buyerId: user?.id || 'guest',
        buyerName: name,
        buyerEmail: email,
        buyerPhone: phone,
        phone: phone,
        message: additionalNotes || `Inquiry for ${bhk} ${propertyType} in ${locality}, ${city}`,
        intent: intent.toLowerCase(),
        propertyType: propertyType,
        propertyId: 'custom-enquiry',
        ownerId: 'admin',
        locationDetails: {
          country,
          state,
          city,
          locality
        },
        budgetRange: {
          min: Number(budgetMin) || 0,
          max: Number(budgetMax) || 0
        },
        requirements: {
          bhk,
          areaSqFt,
          furnishing,
          parking,
          amenities: selectedAmenities
        },
        timeline,
        preferredContactMethod: contactMethod,
        additionalRequirements: additionalNotes
      });

      setSubmittedId(created.inquiryId);
      showToast('Enquiry received successfully!', 'success');
    } catch (err) {
      console.error('Enquiry submission error:', err);
      showToast('Failed to submit enquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (submittedId) {
    return (
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-gold)',
        boxShadow: 'var(--shadow-lg)',
        padding: '3.5rem 2.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          color: '#22C55E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <CheckCircle2 size={36} />
        </div>

        <h3 className="editorial-title" style={{ fontSize: '1.9rem', marginBottom: '0.75rem' }}>
          Your property journey starts here.
        </h3>

        <p className="editorial-sub" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
          Your enquiry has been received. A dedicated private property advisor will review your specifications and connect within 12 hours.
        </p>

        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          display: 'inline-block',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Unique Reference Number
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {submittedId}
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              if (onSuccessNavigate) onSuccessNavigate('properties');
              else setSubmittedId(null);
            }}
            style={{
              padding: '0.85rem 2.2rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--gold-primary)',
              color: '#070709',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Explore Matching Residences
          </button>
        </div>
      </div>
    );
  }

  return (
    <section style={{
      padding: isStandalonePage ? '5rem 1.5rem 7rem' : '7rem 1.5rem',
      backgroundColor: isStandalonePage ? 'var(--bg-primary)' : 'var(--bg-primary)',
      borderBottom: isStandalonePage ? 'none' : '1px solid var(--border-subtle)'
    }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Sparkles size={15} />
            <span>Curated Requirement Intake</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)' }}>
            Tell us what you're looking for.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '580px', margin: '0.75rem auto 0' }}>
            Complete this multi-step requirement intake to receive audited matches directly from verified owners and developers.
          </p>
        </div>

        {/* Multi-Step Wizard Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          padding: '2.5rem 2rem',
          position: 'relative'
        }}>
          {/* Progress Indicator */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-primary)' }}>
                Step {currentStep} of {totalSteps}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                {Math.round((currentStep / totalSteps) * 100)}% Completed
              </span>
            </div>

            <div style={{ height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(currentStep / totalSteps) * 100}%`,
                backgroundColor: 'var(--gold-primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 01: INTENT */}
            {currentStep === 1 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 01: What is your primary objective?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Select the transaction structure you are exploring.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                  {['Buy', 'Rent', 'Lease', 'Sell', 'List a property', 'Invest'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIntent(opt)}
                      style={{
                        padding: '1.15rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: intent === opt ? 'var(--gold-subtle)' : 'var(--bg-tertiary)',
                        border: intent === opt ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                        color: intent === opt ? 'var(--gold-primary)' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.925rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 02: PROPERTY TYPE */}
            {currentStep === 2 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 02: Which property type do you prefer?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Choose the asset class that fits your criteria.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
                  {['Apartment', 'Villa', 'House', 'Plot', 'Land', 'Commercial', 'Office', 'Shop', 'Other'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPropertyType(opt)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: propertyType === opt ? 'var(--gold-subtle)' : 'var(--bg-tertiary)',
                        border: propertyType === opt ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                        color: propertyType === opt ? 'var(--gold-primary)' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Building size={16} />
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 03: PREFERRED LOCATION */}
            {currentStep === 3 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 03: Where should the property be located?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Specify city and micro-market preferences.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Chennai, Bengaluru, Mumbai"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Locality / Micro-Market</label>
                    <input
                      type="text"
                      value={locality}
                      onChange={e => setLocality(e.target.value)}
                      placeholder="e.g. Poes Garden, Worli, Jubilee Hills"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 04: BUDGET */}
            {currentStep === 4 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 04: What is your estimated investment budget?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Define your minimum and maximum range (in INR).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Minimum Budget (₹)</label>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={e => setBudgetMin(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', fontSize: '1rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Maximum Budget (₹)</label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={e => setBudgetMax(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', fontSize: '1rem', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 05: REQUIREMENTS */}
            {currentStep === 5 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 05: Configuration & amenities
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Select bedroom count, approximate area, and essential comforts.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>BHK Configuration</label>
                    <select
                      value={bhk}
                      onChange={e => setBhk(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK Luxury</option>
                      <option value="4 BHK">4 BHK Grand</option>
                      <option value="5+ BHK">5+ BHK Estate / Duplex</option>
                      <option value="Studio">Studio Suite</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Target Area (Sq.Ft)</label>
                    <input
                      type="text"
                      value={areaSqFt}
                      onChange={e => setAreaSqFt(e.target.value)}
                      placeholder="e.g. 2800"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Furnishing Level</label>
                    <select
                      value={furnishing}
                      onChange={e => setFurnishing(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Bare Shell">Bare Shell</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>Desired Amenities</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {amenityOptions.map(amenity => {
                      const isChecked = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleToggleAmenity(amenity)}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isChecked ? 'var(--gold-subtle)' : 'var(--bg-tertiary)',
                            border: isChecked ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                            color: isChecked ? 'var(--gold-primary)' : 'var(--text-primary)',
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          {isChecked ? '✓ ' : '+ '}{amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 06: TIMELINE */}
            {currentStep === 6 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 06: When do you intend to move forward?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Help our concierges prioritize properties matching your availability.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  {['Immediately', 'Within 1 month', '1-3 months', '3-6 months', '6+ months'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTimeline(opt)}
                      style={{
                        padding: '1.25rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: timeline === opt ? 'var(--gold-subtle)' : 'var(--bg-tertiary)',
                        border: timeline === opt ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                        color: timeline === opt ? 'var(--gold-primary)' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Calendar size={18} style={{ marginBottom: '0.4rem' }} />
                      <div>{opt}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 07: CONTACT */}
            {currentStep === 7 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 07: Where should we dispatch audited matches?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Your contact details are encrypted and only accessible to assigned LOKHA concierges.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Your Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="vikram@example.com"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Direct Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98400 12345"
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Preferred Communication</label>
                    <select
                      value={contactMethod}
                      onChange={e => setContactMethod(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <option value="Phone & WhatsApp">Phone & WhatsApp</option>
                      <option value="Email Only">Email Only</option>
                      <option value="Direct Call">Direct Voice Call</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 08: ADDITIONAL REQUIREMENTS */}
            {currentStep === 8 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 08: Bespoke criteria & notes
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Mention specific preferences like Italian marble, servant quarters, private lift, or builder reputation.
                </p>

                <textarea
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  rows={5}
                  placeholder="e.g. Looking for a high-floor corner apartment with clear sea views, minimum 3 parking slots, and strict Vastu alignment..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6
                  }}
                />
              </div>
            )}

            {/* STEP 09: REVIEW & SUBMIT */}
            {currentStep === 9 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  STEP 09: Review & Dispatch Enquiry
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Confirm your requirement brief before logging with the LOKHA private registry.
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Intent:</span> <strong>{intent}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Property Type:</span> <strong>{propertyType}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Location:</span> <strong>{locality}, {city}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Budget:</span> <strong>₹{(Number(budgetMin) / 10000000).toFixed(2)} - ₹{(Number(budgetMax) / 10000000).toFixed(2)} Cr</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Specs:</span> <strong>{bhk} • {areaSqFt} sq.ft</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Timeline:</span> <strong>{timeline}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Contact:</span> <strong>{name} ({phone})</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: '#070709',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Registering Enquiry...' : 'Send My Enquiry'}</span>
                </button>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            {currentStep < 9 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: currentStep === 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: '#070709',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
