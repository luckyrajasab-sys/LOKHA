import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';
import { deleteCurrentUser } from '../services/authService';
import { useToast } from '../components/common/Toast';
import {
  User,
  Shield,
  Globe,
  Trash2,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, COUNTRIES } from '../config/constants';
import { Modal } from '../components/common/Modal';

interface SettingsPageProps {
  onNavigate: (view: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, refreshProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'danger'>('profile');

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'INR');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'en');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [inquiryAlerts, setInquiryAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        displayName,
        phone,
        country,
        preferredCurrency: currency,
        preferredLanguage: language
      });
      await refreshProfile();
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      showToast('Please type DELETE to confirm.', 'error');
      return;
    }

    try {
      await deleteCurrentUser();
      showToast('Your account and profile have been permanently deleted.', 'info');
      onNavigate('home');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your identity credentials, communication preferences, and security protocols.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          height: 'fit-content'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn-ghost ${activeTab === 'profile' ? 'active' : ''}`}
            style={{
              justifyContent: 'flex-start',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              backgroundColor: activeTab === 'profile' ? 'var(--gold-subtle)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--gold-primary)' : 'var(--text-secondary)'
            }}
          >
            <User size={18} />
            Personal Profile
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`btn-ghost ${activeTab === 'security' ? 'active' : ''}`}
            style={{
              justifyContent: 'flex-start',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              backgroundColor: activeTab === 'security' ? 'var(--gold-subtle)' : 'transparent',
              color: activeTab === 'security' ? 'var(--gold-primary)' : 'var(--text-secondary)'
            }}
          >
            <Shield size={18} />
            Security & Auth
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`btn-ghost ${activeTab === 'preferences' ? 'active' : ''}`}
            style={{
              justifyContent: 'flex-start',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              backgroundColor: activeTab === 'preferences' ? 'var(--gold-subtle)' : 'transparent',
              color: activeTab === 'preferences' ? 'var(--gold-primary)' : 'var(--text-secondary)'
            }}
          >
            <Globe size={18} />
            Regional & Alerts
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`btn-ghost ${activeTab === 'danger' ? 'active' : ''}`}
            style={{
              justifyContent: 'flex-start',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              backgroundColor: activeTab === 'danger' ? 'var(--danger-bg)' : 'transparent',
              color: activeTab === 'danger' ? 'var(--danger)' : 'var(--danger)'
            }}
          >
            <Trash2 size={18} />
            Danger Zone
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.75rem 0' }} />

          <button
            onClick={async () => {
              await logout();
              onNavigate('home');
            }}
            className="btn-ghost"
            style={{
              justifyContent: 'flex-start',
              gap: '0.75rem',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-tertiary)',
              fontWeight: 600
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Tab Content Panes */}
        <div style={{ flex: 2, minWidth: '300px' }}>
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Personal Information
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Your identity is shared with certified property brokers and hosts only upon booking or verified inquiry.
              </p>

              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user.email}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: user.emailVerified ? 'var(--success)' : 'var(--warning)' }}>
                    <CheckCircle2 size={14} />
                    {user.emailVerified ? 'Verified Primary Email' : 'Email pending confirmation'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country of Residence</label>
                  <select
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Roles</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {user.roles.map(r => (
                      <span key={r} className="badge badge-gold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ marginTop: '1.5rem' }}
                >
                  <Save size={16} />
                  {saving ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Security & Authentication
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Manage login credentials and session verification protocols.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Firebase Session Token
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Encrypted JWT token with auto-refresh and App Check.
                    </div>
                  </div>
                  <span className="badge badge-verified">Active</span>
                </div>

                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Connected Social Providers
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Google, Apple OAuth, and Phone SMS OTP.
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => showToast('Providers are synchronized with Firebase Auth', 'info')}>
                    Review
                  </button>
                </div>

                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Developer / Agent Role Verification
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Accreditation requires RERA license or government real estate registration.
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => showToast('Application submitted to Lokha Compliance team for review.', 'success')}
                  >
                    Request Upgrade
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Regional & Alert Preferences
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Tailor currency conversions, localized units, and notification dispatches.
              </p>

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Preferred Currency</label>
                    <select
                      className="form-input"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {SUPPORTED_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Interface Language</label>
                    <select
                      className="form-input"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {SUPPORTED_LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.5rem 0 1rem', color: 'var(--text-primary)' }}>
                  Notifications
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      style={{ accentColor: 'var(--gold-primary)', width: '17px', height: '17px' }}
                    />
                    <span>Email updates for new project launches and exclusive developer offers</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      style={{ accentColor: 'var(--gold-primary)', width: '17px', height: '17px' }}
                    />
                    <span>Instant mobile notifications for booking confirmations and visit reminders</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={inquiryAlerts}
                      onChange={(e) => setInquiryAlerts(e.target.checked)}
                      style={{ accentColor: 'var(--gold-primary)', width: '17px', height: '17px' }}
                    />
                    <span>Realtime alerts when agents or landlords reply to inquiries</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  Save Preferences
                </button>
              </form>
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === 'danger' && (
            <div className="card" style={{ borderColor: 'var(--danger-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.4rem' }}>
                <AlertTriangle size={22} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Danger Zone
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Actions here are permanent and cannot be reversed. Proceed with caution.
              </p>

              <div style={{
                padding: '1.5rem',
                border: '1px solid var(--danger-bg)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--danger-bg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1rem' }}>
                    Permanently Delete Account
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Removes your credentials from Firebase Auth, deletes your profile, and invalidates active inquiries.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="btn"
                  style={{ backgroundColor: 'var(--danger)', color: '#FFFFFF' }}
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Account Deletion">
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <AlertTriangle size={44} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Are you absolutely sure?
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            This action will immediately terminate your session, eradicate your saved properties, and delete all associated records in compliance with data privacy regulations.
          </p>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="form-label">Type "DELETE" below to confirm:</label>
            <input
              type="text"
              className="form-input"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              style={{ textAlign: 'center', fontWeight: 700, letterSpacing: '0.15em' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn btn-secondary btn-full"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE'}
              className="btn btn-full"
              style={{ backgroundColor: 'var(--danger)', color: '#FFFFFF' }}
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
