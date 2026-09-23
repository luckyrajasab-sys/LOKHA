import React, { useState } from 'react';
import {
  Bell,
  MapPin,
  Sparkles,
  Flame,
  Tag,
  Copy,
  Check,
  Building,
  ShieldCheck,
  Crosshair,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { detectCurrentLocation } from '../utils/location';
import {
  SAMPLE_RENT_LEASE_NOTIFICATIONS,
  APP_OFFERS_NOTIFICATIONS,
  APP_UPDATES_NOTIFICATIONS,
  getRentLeaseNotificationsForArea
} from '../services/notificationData';

interface NotificationsPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'rent' | 'offers' | 'updates'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [isDetecting, setIsDetecting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      const loc = await detectCurrentLocation();
      if (loc.city) {
        setSelectedCity(loc.city);
      }
    } catch (err) {
      console.warn('Could not auto-detect location:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredRentals = selectedCity === 'All'
    ? SAMPLE_RENT_LEASE_NOTIFICATIONS
    : getRentLeaseNotificationsForArea(selectedCity);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2.5rem 1.5rem 5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Page Header */}
      <div style={{
        marginBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          color: 'var(--gold-primary)',
          fontSize: '0.78rem',
          fontWeight: 700,
          width: 'fit-content'
        }}>
          <Bell size={14} />
          <span>Real-Time Neighborhood Radar & Platform Alerts</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          App Notifications & Rent Radar
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          maxWidth: '720px',
          lineHeight: 1.6,
          margin: 0
        }}>
          Stay ahead with immediate notifications on prime rental and lease houses listed in your city, exclusive zero-brokerage promotions, and Lokha platform updates.
        </p>
      </div>

      {/* Control / Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.1rem 1.25rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '2.5rem'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'rent', label: 'House Rent & Lease' },
            { id: 'offers', label: 'Offers & Discounts' },
            { id: 'updates', label: 'App Updates' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedCategory === tab.id
                  ? '1px solid var(--gold-primary)'
                  : '1px solid var(--border)',
                backgroundColor: selectedCategory === tab.id
                  ? 'var(--gold-primary)'
                  : 'var(--bg-secondary)',
                color: selectedCategory === tab.id ? 'var(--gold-text)' : 'var(--text-secondary)',
                transition: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Location Radar Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="All">All Regions</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Chennai">Chennai</option>
              <option value="Delhi">Delhi</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Goa">Goa</option>
            </select>
          </div>

          <button
            onClick={handleDetect}
            disabled={isDetecting}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: isDetecting ? 'wait' : 'pointer'
            }}
            title="Auto-detect current GPS city"
          >
            {isDetecting ? <Loader2 size={13} className="animate-spin" /> : <Crosshair size={13} />}
            <span>Nearby GPS</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: NEW HOUSE RENT & LEASE IN THE AREA */}
      {(selectedCategory === 'all' || selectedCategory === 'rent') && (
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} color="var(--gold-primary)" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  New House Rent & Lease Opportunities
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
                Freshly listed houses, penthouses, and luxury residences available for immediate occupancy.
              </p>
            </div>

            <button
              onClick={() => onNavigate('properties', selectedCity !== 'All' ? selectedCity : undefined)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-primary)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <span>Explore All Listings</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredRentals.map(rental => (
              <div
                key={rental.id}
                onClick={() => onNavigate('properties', rental.city)}
                style={{
                  backgroundColor: 'var(--bg-secondary, #0D0D12)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                className="hover:scale-[1.01]"
              >
                <div style={{ position: 'relative', height: '190px' }}>
                  <img
                    src={rental.imageUrl}
                    alt={rental.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    backgroundColor: 'rgba(7, 7, 9, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--gold-primary)',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {rental.tag}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    right: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    color: '#FFF',
                    fontSize: '0.65rem'
                  }}>
                    {rental.postedAt}
                  </div>
                </div>

                <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                      {rental.bhk} • {rental.furnished}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      {rental.areaSqFt} sq.ft
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: '0 0 0.4rem',
                    lineHeight: 1.3
                  }}>
                    {rental.title}
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem'
                  }}>
                    <MapPin size={13} color="var(--gold-primary)" />
                    <span>{rental.locality}, {rental.city}</span>
                  </div>

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                        {rental.rentAmount}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        Deposit: {rental.depositAmount}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('properties', rental.city);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: OFFERS AND DISCOUNTS */}
      {(selectedCategory === 'all' || selectedCategory === 'offers') && (
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Flame size={20} color="#F97316" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Special Rental Offers & Platform Deals
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '0 0 1.25rem' }}>
            Exclusive savings, fee waivers, and lease discounts curated for Lokha members.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}>
            {APP_OFFERS_NOTIFICATIONS.map(offer => (
              <div
                key={offer.id}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg, 12px)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease, transform 200ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '0.2rem 0.7rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    color: 'var(--gold-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={12} />
                    {offer.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {offer.validUntil}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>
                    {offer.title}
                  </h3>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '0.35rem' }}>
                    {offer.discount}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {offer.description}
                  </p>
                </div>

                {offer.code && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px dashed var(--border)',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag size={15} color="var(--gold-primary)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                        {offer.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(offer.code!)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        backgroundColor: copiedCode === offer.code ? 'rgba(34, 197, 94, 0.2)' : 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: copiedCode === offer.code ? '#16A34A' : 'var(--gold-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedCode === offer.code ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode === offer.code ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: APP UPDATES & PLATFORM ANNOUNCEMENTS */}
      {(selectedCategory === 'all' || selectedCategory === 'updates') && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--gold-primary)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Platform Releases & Updates
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '0 0 1.25rem' }}>
            Changelog of our latest engineering improvements, security rules, and architectural enhancements.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {APP_UPDATES_NOTIFICATIONS.map(update => (
              <div
                key={update.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-lg, 12px)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  transition: 'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--gold-primary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px'
                    }}>
                      {update.version}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{update.date}</span>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--gold-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>
                    {update.tag}
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {update.title}
                </div>

                <ul style={{
                  margin: '0.25rem 0 0',
                  paddingLeft: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {update.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
