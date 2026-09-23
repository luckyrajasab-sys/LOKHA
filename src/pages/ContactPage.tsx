import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle2
} from 'lucide-react';
import { submitContactMessage } from '../services/contactService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

interface ContactPageProps {
  onNavigate: (view: string, location?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate: _onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState<string>(user?.displayName || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [subject, setSubject] = useState<string>('General Advisory');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in all contact form fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        userId: user?.id || 'guest',
        name,
        email,
        phone,
        subject,
        message
      });
      setSubmitted(true);
      showToast('Message dispatched! Our senior client concierge will contact you within 4 hours.', 'success');
    } catch {
      showToast('Failed to send message. Please try WhatsApp or Call.', 'error');
    } finally {
      setSubmitting(false);
    }
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
            <Phone size={14} /> Dedicated Private Concierge Desk
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '0.85rem',
            color: 'var(--text-primary)'
          }}>
            Connect with LOKHA Private Advisory
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '0 auto'
          }}>
            Whether you are acquiring a generational villa, listing an ultra-luxury penthouse, or seeking institutional title verification, our senior partners are at your service.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Direct Communication Channels & Regional Lounges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Action Tiles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem'
            }}>
              <a
                href="https://wa.me/919840182990?text=Hello%20LOKHA%20Concierge,%20I%20am%20seeking%20private%20real%20estate%20advisory."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(37, 211, 102, 0.08)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  color: '#25D366',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <MessageCircle size={24} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Instant WhatsApp</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Immediate live concierge response</span>
              </a>

              <a
                href="tel:+919840182990"
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: 'var(--gold-primary)',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Phone size={24} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Direct Hotline</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>+91 98401 82990</span>
              </a>
            </div>

            {/* Regional Addresses */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-card)'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Principal Offices
              </h3>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} color="var(--gold-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>Chennai Headquarters</strong>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    No. 14, Boat Club Road, Raja Annamalaipuram, Chennai - 600028
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} color="var(--gold-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>Bengaluru Client Lounge</strong>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    UB City Concorde Towers, Level 11, Vittal Mallya Road, Bengaluru - 560001
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} color="var(--gold-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>Mumbai Financial Suite</strong>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    One World Center, Tower 2, Lower Parel, Mumbai - 400013
                  </span>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                <Clock size={14} color="var(--gold-primary)" />
                <span>Operating Hours: Monday – Saturday, 9:00 AM – 7:30 PM IST</span>
              </div>
            </div>

            {/* Map Embed */}
            <div style={{
              height: '240px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.25)'
            }}>
              <iframe
                title="LOKHA Chennai HQ Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src="https://maps.google.com/maps?q=Boat+Club+Road+Chennai&z=15&output=embed"
              />
            </div>
          </div>

          {/* Right Column: Confidential Contact Form */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Send a Confidential Communication
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Protected by LOKHA Client Privilege. We never disclose inquiries to third parties.
            </p>

            {submitted ? (
              <div style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.25)'
              }}>
                <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A', marginBottom: '0.5rem' }}>
                  Communication Received
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                  Thank you, <strong>{name}</strong>. A dedicated Senior Client Director has been assigned to your request and will call you at <strong>{phone}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: 'var(--gold-text)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Vikramaditya Reddy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                      Mobile / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Inquiry Nature
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
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
                    <option value="General Advisory">General Luxury Advisory</option>
                    <option value="Property Acquisition">Acquiring an Ultra-Luxury Estate</option>
                    <option value="Listing a Residence">Listing / Selling My Private Residence</option>
                    <option value="Legal & Title Due Diligence">Legal & Title Deed Verification Audit</option>
                    <option value="Developer Township Partnership">Developer Township Mandate</option>
                    <option value="NRI Wealth Repatriation">NRI & FEMA Repatriation Assistance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Message Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify budget preferences, preferred localities, or specific legal requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      resize: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.95rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--gold-primary)',
                    color: 'var(--gold-text)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 16px rgba(198, 161, 91, 0.35)',
                    marginTop: '0.5rem',
                    transition: 'background-color 250ms ease, transform 200ms ease'
                  }}
                >
                  <Send size={16} /> {submitting ? 'Dispatching...' : 'Submit Confidential Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
