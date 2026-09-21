import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { saveOnboardingPreferences } from '../../services/userService';
import type { UserPreferences } from '../../types/auth';
import { Check, ArrowRight, ArrowLeft, Sparkles, MapPin, Building, DollarSign } from 'lucide-react';
import { PROPERTY_CATEGORIES } from '../../config/constants';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_LOCATIONS = [
  'Chennai', 'Bangalore', 'Hyderabad', 'Mumbai',
  'Delhi NCR', 'Goa', 'Dubai', 'London', 'Singapore'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Looking For
  const [lookingFor, setLookingFor] = useState<'Buy' | 'Rent' | 'Lease' | 'Stay'>('Buy');

  // Step 2: Locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Chennai', 'Bangalore']);

  // Step 3: Property Types
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Apartment', 'Villa']);

  // Step 4: Budget
  const [budgetMax, setBudgetMax] = useState(15000000); // 1.5 Cr default

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const prefs: UserPreferences = {
        lookingFor,
        preferredLocations: selectedLocations,
        propertyTypes: selectedTypes,
        budgetRange: {
          min: 0,
          max: budgetMax,
          currency: user.preferredCurrency || 'INR'
        }
      };
      await saveOnboardingPreferences(user.id, prefs);
      await refreshProfile();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    onClose();
  };

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(0)} Lakhs`;
    return `₹ ${val.toLocaleString()}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title="Personalize Your Experience" maxWidth="560px">
      {/* Progress Steps Indicator */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(s => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: s <= step ? 'var(--gold-primary)' : 'var(--border-medium)',
              transition: 'background-color var(--transition-base)'
            }}
          />
        ))}
      </div>

      {/* Step 1: Purpose */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Sparkles size={20} color="var(--gold-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              What are you looking for?
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Select your primary objective to customize listings and alerts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {(['Buy', 'Rent', 'Lease', 'Stay'] as const).map(option => {
              const isSelected = lookingFor === option;
              return (
                <div
                  key={option}
                  onClick={() => setLookingFor(option)}
                  style={{
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-medium)'}`,
                    backgroundColor: isSelected ? 'var(--gold-subtle)' : 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isSelected ? 'var(--gold-primary)' : 'var(--text-primary)' }}>
                    {option}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {option === 'Buy' && 'Permanent ownership & plots'}
                    {option === 'Rent' && 'Residential long-term leases'}
                    {option === 'Lease' && 'Commercial & corporate spaces'}
                    {option === 'Stay' && 'Hotels, PGs, villas & hostels'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Locations */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <MapPin size={20} color="var(--gold-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Preferred Locations
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Select the metropolitan hubs where you wish to explore opportunities.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '2rem' }}>
            {POPULAR_LOCATIONS.map(loc => {
              const isSelected = selectedLocations.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocation(loc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: `1px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-medium)'}`,
                    backgroundColor: isSelected ? 'var(--gold-subtle)' : 'var(--bg-tertiary)',
                    color: isSelected ? 'var(--gold-primary)' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {isSelected && <Check size={14} />}
                  {loc}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Property Types */}
      {step === 3 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Building size={20} color="var(--gold-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Property Types
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Choose the categories of architecture and spaces you prefer.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '2rem', maxHeight: '200px', overflowY: 'auto' }}>
            {PROPERTY_CATEGORIES.map(cat => {
              const isSelected = selectedTypes.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleType(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: `1px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-medium)'}`,
                    backgroundColor: isSelected ? 'var(--gold-subtle)' : 'var(--bg-tertiary)',
                    color: isSelected ? 'var(--gold-primary)' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {isSelected && <Check size={14} />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Budget */}
      {step === 4 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <DollarSign size={20} color="var(--gold-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Target Budget
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Set your expected investment or rental ceiling.
          </p>

          <div style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Upper Ceiling
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold-primary)', margin: '0.5rem 0 1rem' }}>
              {formatAmount(budgetMax)}
            </div>

            <input
              type="range"
              min={1000000}
              max={100000000}
              step={500000}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              <span>₹ 10 Lakhs</span>
              <span>₹ 10 Crores+</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={handleSkip}
          className="btn-ghost"
          style={{ fontSize: '0.85rem' }}
        >
          Skip for now
        </button>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn btn-primary btn-sm"
            >
              Next Step
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="btn btn-primary btn-sm"
            >
              {loading ? 'Saving...' : 'Finish Onboarding'}
              {!loading && <Check size={14} />}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
