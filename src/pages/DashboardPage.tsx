import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  Heart,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Eye,
  Users,
  ShieldCheck,
  Bell
} from 'lucide-react';
import {
  subscribeToOwnerProperties,
  subscribeToInquiries,
  subscribeToConversations,
  subscribeToUserFavoriteIds,
  subscribeToNotifications,
  subscribeToAllUsers,
  subscribeToAllProperties,
  subscribeToProperties
} from '../firebase/realtime';
import {
  deleteProperty,
  updatePropertyStatus,
  updateInquiryStatus,
  removeFavorite,
  markNotificationAsRead,
  getOrCreateConversation
} from '../firebase/firestore';
import { updateUserRole, toggleUserActiveStatus } from '../firebase/auth';
import { PropertyFormModal } from '../components/properties/PropertyFormModal';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { useToast } from '../components/common/Toast';
import type {
  PropertyDocument,
  InquiryDocument,
  ConversationDocument,
  NotificationDocument,
  UserDocument,
  PropertyStatusType,
  InquiryStatus,
  FirebaseUserRole
} from '../types/firebaseModels';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, isOwner, isAgent, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'inquiries' | 'favorites' | 'messages' | 'admin'>('overview');

  // Real-time State
  const [myProperties, setMyProperties] = useState<PropertyDocument[]>([]);
  const [inquiries, setInquiries] = useState<InquiryDocument[]>([]);
  const [conversations, setConversations] = useState<ConversationDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyDocument[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserDocument[]>([]);
  const [adminProperties, setAdminProperties] = useState<PropertyDocument[]>([]);

  // Modals & Chat Drawer
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyDocument | null>(null);

  const [activeChat, setActiveChat] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    recipientId: string;
    recipientName: string;
    propertyTitle?: string;
  }>({
    isOpen: false,
    conversationId: null,
    recipientId: '',
    recipientName: '',
    propertyTitle: ''
  });

  // 1. Subscribe to member's listed properties in real time
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToOwnerProperties(user.id, (liveProps) => {
      setMyProperties(liveProps);
    });
    return () => unsub();
  }, [user]);

  // 2. Subscribe to inquiries in real time
  useEffect(() => {
    if (!user) return;
    const isSellerSide = true;
    const unsub = subscribeToInquiries(user.id, isSellerSide, (liveInquiries) => {
      setInquiries(liveInquiries);
    });
    return () => unsub();
  }, [user]);

  // 3. Subscribe to conversations in real time
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.id, (liveConvs) => {
      setConversations(liveConvs);
    });
    return () => unsub();
  }, [user]);

  // 4. Subscribe to notifications in real time
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.id, (liveNotes) => {
      setNotifications(liveNotes);
    });
    return () => unsub();
  }, [user]);

  // 5. Subscribe to buyer favorites in real time
  useEffect(() => {
    if (!user) return;
    const unsubFavIds = subscribeToUserFavoriteIds(user.id, (favIds) => {
      if (favIds.length === 0) {
        setFavoriteProperties([]);
        return;
      }
      // Watch properties matching favorite IDs
      const unsubProps = subscribeToProperties({ status: 'All' }, (allProps) => {
        const filtered = allProps.filter(p => favIds.includes(p.propertyId));
        setFavoriteProperties(filtered);
      });
      return () => unsubProps();
    });
    return () => unsubFavIds();
  }, [user]);

  // 6. Admin subscriptions
  useEffect(() => {
    if (!isAdmin) return;
    const unsubUsers = subscribeToAllUsers((users) => setAdminUsers(users));
    const unsubProps = subscribeToAllProperties((props) => setAdminProperties(props));
    return () => {
      unsubUsers();
      unsubProps();
    };
  }, [isAdmin]);

  if (!user) return null;

  // Actions
  const handleStatusChange = async (propertyId: string, status: PropertyStatusType) => {
    try {
      await updatePropertyStatus(propertyId, status);
      showToast(`Listing status updated to ${status}.`, 'success');
    } catch (err: any) {
      showToast('Error updating status: ' + err.message, 'error');
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await deleteProperty(propertyId);
        showToast('Property deleted successfully.', 'info');
      } catch (err: any) {
        showToast('Failed to delete property: ' + err.message, 'error');
      }
    }
  };

  const handleInquiryStatusChange = async (inquiryId: string, status: InquiryStatus) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      showToast(`Inquiry marked as ${status}.`, 'success');
    } catch (err: any) {
      showToast('Failed to update inquiry: ' + err.message, 'error');
    }
  };

  const handleOpenChat = async (buyerId: string, ownerId: string, propertyId: string, propertyTitle: string, otherName: string) => {
    try {
      const convId = await getOrCreateConversation(buyerId, ownerId, propertyId, propertyTitle);
      const recipientId = user.id === buyerId ? ownerId : buyerId;
      setActiveChat({
        isOpen: true,
        conversationId: convId,
        recipientId,
        recipientName: otherName,
        propertyTitle
      });
    } catch (err: any) {
      showToast('Failed to open chat: ' + err.message, 'error');
    }
  };

  const totalViews = myProperties.reduce((acc, p) => acc + (p.views || 0), 0);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1200px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        padding: '2rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--gold-primary)',
            color: 'var(--gold-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.8rem',
            boxShadow: 'var(--shadow-gold)'
          }}>
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user.displayName}
              </h1>
              <span className="badge badge-verified">
                <ShieldCheck size={12} />
                LOKHA VERIFIED MEMBER
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {user.email} • Connected to Cloud Firestore
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => onNavigate('list-property')}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            Give / List Property
          </button>

          <button
            onClick={() => onNavigate('properties')}
            className="btn btn-secondary btn-sm"
          >
            Explore Public Feed
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-medium)',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`btn btn-sm ${activeTab === 'properties' ? 'btn-primary' : 'btn-ghost'}`}
        >
          My Listed Properties ({myProperties.length})
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`btn btn-sm ${activeTab === 'inquiries' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Inquiries ({inquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`btn btn-sm ${activeTab === 'favorites' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Saved Portfolio ({favoriteProperties.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`btn btn-sm ${activeTab === 'messages' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Direct Messages ({conversations.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`btn btn-sm ${activeTab === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Admin Control Center
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}>
            {(isOwner || isAgent || isAdmin) && (
              <>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Active Listings</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '0.25rem' }}>
                    {myProperties.filter(p => p.status === 'available').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    {myProperties.length} total managed in Firestore
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Listing Views</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    {totalViews.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    Real-time audience tracking
                  </div>
                </div>
              </>
            )}

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Inquiries</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {inquiries.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                {inquiries.filter(i => i.status === 'new').length} awaiting contact
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Saved Properties</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {favoriteProperties.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Stored in users/{user.id}/favorites
              </div>
            </div>
          </div>

          {/* Real-time Activity Feed / Notifications */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: 'var(--gold-primary)' }} />
                Real-Time Notification Feed
              </h3>
              {unreadNotifications > 0 && (
                <span className="badge badge-gold">{unreadNotifications} New</span>
              )}
            </div>

            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No notifications yet. You will receive live alerts when buyers inquire or message you.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.notificationId}
                    onClick={() => markNotificationAsRead(user.id, n.notificationId)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: n.isRead ? 'var(--bg-secondary)' : 'rgba(212, 175, 55, 0.08)',
                      borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--gold-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {n.message}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: OWNER / AGENT PROPERTY MANAGEMENT */}
      {activeTab === 'properties' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Managed Properties ({myProperties.length})
            </h2>
            <button
              onClick={() => { setEditingProperty(null); setIsPropertyModalOpen(true); }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Add Listing
            </button>
          </div>

          {myProperties.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <Building size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Properties Listed Yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Publish your luxury villas, apartments, or penthouses. Photos will upload directly to Firebase Storage and sync in real time.
              </p>
              <button
                onClick={() => { setEditingProperty(null); setIsPropertyModalOpen(true); }}
                className="btn btn-primary"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {myProperties.map((p) => (
                <div key={p.propertyId} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute', top: '0.75rem', left: '0.75rem',
                        padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: p.status === 'available' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(0,0,0,0.7)',
                        color: 'white', textTransform: 'uppercase'
                      }}
                    >
                      {p.status}
                    </span>
                    <span style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.75rem',
                      display: 'flex', alignItems: 'center', gap: '0.3rem'
                    }}>
                      <Eye size={12} /> {p.views || 0}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {p.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      {p.city}, {p.state} • {p.propertyType}
                    </p>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-primary)', marginBottom: '1rem' }}>
                      ₹ {p.price.toLocaleString()}
                    </div>

                    {/* Status Toggle & Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.propertyId, e.target.value as PropertyStatusType)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', flex: 1 }}
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                        <option value="inactive">Inactive</option>
                      </select>

                      <button
                        onClick={() => { setEditingProperty(p); setIsPropertyModalOpen(true); }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.6rem' }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteProperty(p.propertyId)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Real-Time Property Inquiries ({inquiries.length})
          </h2>

          {inquiries.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No inquiries found yet. Inquiries submitted by prospective buyers will appear here in real time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inquiries.map((inq) => (
                <div key={inq.inquiryId} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {inq.buyerName || 'Buyer'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)',
                          backgroundColor: inq.status === 'new' ? 'rgba(212, 175, 55, 0.15)' : inq.status === 'contacted' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: inq.status === 'new' ? 'var(--gold-primary)' : inq.status === 'contacted' ? '#3b82f6' : '#10b981',
                          fontWeight: 700
                        }}>
                          {inq.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Phone: {inq.phone || 'Not provided'} • Received {new Date(inq.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Status & Chat Trigger */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatusChange(inq.inquiryId, e.target.value as InquiryStatus)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>

                      <button
                        onClick={() => handleOpenChat(inq.buyerId, inq.ownerId, inq.propertyId, inq.propertyTitle || 'Property', inq.buyerName || 'Buyer')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <MessageSquare size={14} /> Chat
                      </button>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5
                  }}>
                    "{inq.message}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: SAVED PORTFOLIO (FAVORITES) */}
      {activeTab === 'favorites' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Saved Real Estate Portfolio ({favoriteProperties.length})
          </h2>

          {favoriteProperties.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Heart size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>Your saved portfolio is currently empty.</p>
              <button onClick={() => onNavigate('properties')} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                Browse Properties
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {favoriteProperties.map((p) => (
                <div key={p.propertyId} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <img
                    src={p.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
                    alt={p.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.city}, {p.state}</p>
                      </div>
                      <button
                        onClick={() => removeFavorite(user.id, p.propertyId)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '0.75rem' }}>
                      ₹ {p.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: DIRECT MESSAGES */}
      {activeTab === 'messages' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Real-Time Conversations ({conversations.length})
          </h2>

          {conversations.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <MessageSquare size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>No active message channels yet. Start a conversation from any property listing or inquiry.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {conversations.map((c) => (
                <div
                  key={c.conversationId}
                  onClick={() => {
                    const otherId = c.participants.find(p => p !== user.id) || '';
                    setActiveChat({
                      isOpen: true,
                      conversationId: c.conversationId,
                      recipientId: otherId,
                      recipientName: 'Direct Contact',
                      propertyTitle: c.propertyTitle
                    });
                  }}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {c.propertyTitle || 'Property Discussion'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      "{c.lastMessage}"
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(c.lastMessageAt || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 6: ADMIN CONTROL CENTER */}
      {activeTab === 'admin' && isAdmin && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Admin Control Center (Real-Time Platform Management)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* User Directory */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} style={{ color: 'var(--gold-primary)' }} />
                Platform Users ({adminUsers.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                {adminUsers.map((u) => (
                  <div key={u.uid} style={{
                    padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        onClick={async () => {
                          const nextStatus = !u.isActive;
                          await toggleUserActiveStatus(u.uid, nextStatus);
                          showToast(`${u.fullName} is now ${nextStatus ? 'Active' : 'Suspended'}`, 'info');
                        }}
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: u.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.isActive ? '#22C55E' : '#EF4444',
                          border: 'none'
                        }}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </button>
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          await updateUserRole(u.uid, e.target.value as FirebaseUserRole);
                          showToast(`Updated role for ${u.fullName} to ${e.target.value}`, 'success');
                        }}
                        className="form-input"
                        style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', width: '90px' }}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="owner">Owner</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Moderation */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} style={{ color: 'var(--gold-primary)' }} />
                Listing Moderation ({adminProperties.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                {adminProperties.map((p) => (
                  <div key={p.propertyId} style={{
                    padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.city} • ₹ {p.price.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.propertyId, e.target.value as PropertyStatusType)}
                        className="form-input"
                        style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem', width: '95px' }}
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button
                        onClick={() => handleDeleteProperty(p.propertyId)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem', color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Form Modal (Add / Edit) */}
      <PropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSuccess={() => {
          setIsPropertyModalOpen(false);
          showToast('Listing synchronized with Cloud Firestore.', 'success');
        }}
        existingProperty={editingProperty}
      />

      {/* Real-Time Chat Drawer */}
      <ChatDrawer
        isOpen={activeChat.isOpen}
        onClose={() => setActiveChat(prev => ({ ...prev, isOpen: false }))}
        conversationId={activeChat.conversationId}
        recipientId={activeChat.recipientId}
        recipientName={activeChat.recipientName}
        propertyTitle={activeChat.propertyTitle}
      />
    </div>
  );
};
