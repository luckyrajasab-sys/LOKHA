import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PropertyLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  propertyTitle?: string;
  onClose: () => void;
}

export const PropertyLightbox: React.FC<PropertyLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  propertyTitle = 'Luxury Estate Gallery',
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        animation: 'fadeInLightbox 0.2s ease-out'
      }}
    >
      {/* Top Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 10
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
              maxWidth: '600px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {propertyTitle}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--gold-primary, #D4AF37)', fontWeight: 600 }}>
            {currentIndex + 1} of {images.length} High-Resolution Photos
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isZoomed ? 'Reset zoom' : 'Zoom image'}
          >
            {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close gallery (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Center Image Stage */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '1rem',
          overflow: 'hidden'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Current Image */}
        <div
          style={{
            maxWidth: '90vw',
            maxHeight: '74vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: isZoomed ? 'auto' : 'hidden',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in'
          }}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={images[currentIndex]}
            alt={`Estate Photo ${currentIndex + 1}`}
            style={{
              maxWidth: isZoomed ? '150%' : '100%',
              maxHeight: isZoomed ? 'none' : '74vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
              transition: 'transform 0.25s ease'
            }}
          />
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          aria-label="Next photo"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div
        style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
          gap: '0.65rem'
        }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => {
              setIsZoomed(false);
              setCurrentIndex(idx);
            }}
            style={{
              width: '74px',
              height: '52px',
              borderRadius: '6px',
              overflow: 'hidden',
              flexShrink: 0,
              cursor: 'pointer',
              border: currentIndex === idx ? '2px solid var(--gold-primary, #D4AF37)' : '2px solid transparent',
              opacity: currentIndex === idx ? 1 : 0.5,
              transition: 'all 0.15s ease'
            }}
          >
            <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInLightbox {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
