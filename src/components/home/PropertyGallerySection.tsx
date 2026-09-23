import React, { useState } from 'react';
import { Camera, X, Maximize2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  url: string;
  gridClass: string;
}

export const PropertyGallerySection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const images: GalleryImage[] = [
    {
      id: 'g-1',
      title: 'The Palm Vista Freehold Villa',
      category: 'Luxury Villa Exterior',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
      gridClass: 'g-col-6-row-2'
    },
    {
      id: 'g-2',
      title: 'Horizon Sky Penthouse',
      category: 'Modern Apartment High-Rise',
      url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      gridClass: 'g-col-3-row-2'
    },
    {
      id: 'g-3',
      title: 'Grand Marble Formal Lounge',
      category: 'Living Room',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
      gridClass: 'g-col-3-row-1'
    },
    {
      id: 'g-4',
      title: 'Master Botanical Suite',
      category: 'Bedroom Suite',
      url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80',
      gridClass: 'g-col-3-row-1'
    },
    {
      id: 'g-5',
      title: 'Custom German Chef Kitchen',
      category: 'Kitchen',
      url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1000&q=80',
      gridClass: 'g-col-4-row-2'
    },
    {
      id: 'g-6',
      title: 'Sunset Sea-View Wrap Balcony',
      category: 'Private Balcony',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      gridClass: 'g-col-4-row-1'
    },
    {
      id: 'g-7',
      title: 'Courtyard Zen Water Garden',
      category: 'Landscape & Garden',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      gridClass: 'g-col-4-row-1'
    },
    {
      id: 'g-8',
      title: 'Temperature-Controlled Infinity Pool',
      category: 'Private Pool',
      url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      gridClass: 'g-col-4-row-2'
    },
    {
      id: 'g-9',
      title: 'Cyber Towers Commercial HQ',
      category: 'Commercial Building',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      gridClass: 'g-col-4-row-2'
    },
    {
      id: 'g-10',
      title: 'Metropolitan Financial Skyline',
      category: 'Urban Skyline',
      url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
      gridClass: 'g-col-4-row-2'
    }
  ];

  return (
    <section style={{
      padding: '7rem 1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Camera size={15} />
            <span>Visual Showcase</span>
          </div>

          <h2 className="editorial-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Architectural distinction.
          </h2>

          <p className="editorial-sub" style={{ maxWidth: '640px', margin: '0.75rem auto 0' }}>
            Immerse yourself in authentic details, from curated courtyard fountains to double-height skyline reception suites. Click any photograph to inspect.
          </p>
        </div>

        {/* Asymmetric Editorial Gallery Grid */}
        <div className="editorial-gallery-grid">
          {images.map(img => (
            <div
              key={img.id}
              className={`gallery-item ${img.gridClass}`}
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.url}
                alt={img.title}
                loading="lazy"
              />

              <div className="gallery-overlay">
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-primary)', marginBottom: '0.2rem' }}>
                    {img.category}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                    {img.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="lightbox-modal-backdrop"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="lightbox-content"
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
              />
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(7, 7, 9, 0.75)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-primary)', fontWeight: 700 }}>
                  {selectedImage.category}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {selectedImage.title}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                <Maximize2 size={16} />
                <span>Original Aspect Ratio</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
