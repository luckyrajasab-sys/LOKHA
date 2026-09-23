import React from 'react';

interface PropertyCardSkeletonProps {
  viewMode?: 'split' | 'grid' | 'list';
}

export const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  const isSplit = viewMode === 'split';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isSplit ? 'row' : 'column',
        backgroundColor: 'var(--bg-card, #121217)',
        borderRadius: 'var(--radius-lg, 14px)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        overflow: 'hidden',
        minHeight: isSplit ? '160px' : '380px',
        position: 'relative'
      }}
      className="lokha-card-skeleton"
    >
      {/* Image Skeleton */}
      <div
        style={{
          width: isSplit ? '220px' : '100%',
          height: isSplit ? '100%' : '230px',
          flexShrink: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="skeleton-pulse"
      >
        {/* Shimmer badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '80px',
            height: '20px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }}
        />
      </div>

      {/* Content Skeleton */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          gap: '0.85rem'
        }}
      >
        <div>
          {/* Price line */}
          <div
            style={{
              width: '120px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              marginBottom: '0.65rem'
            }}
            className="skeleton-pulse"
          />

          {/* Title line */}
          <div
            style={{
              width: '85%',
              height: '18px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              marginBottom: '0.45rem'
            }}
            className="skeleton-pulse"
          />

          {/* Location line */}
          <div
            style={{
              width: '55%',
              height: '14px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)'
            }}
            className="skeleton-pulse"
          />
        </div>

        {/* Specs row */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))'
          }}
        >
          <div style={{ width: '45px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} className="skeleton-pulse" />
          <div style={{ width: '45px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} className="skeleton-pulse" />
          <div style={{ width: '65px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} className="skeleton-pulse" />
        </div>

        {/* Action buttons row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <div style={{ flex: 1, height: '32px', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} className="skeleton-pulse" />
          <div style={{ width: '70px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(212, 175, 55, 0.1)' }} className="skeleton-pulse" />
        </div>
      </div>

      <style>{`
        @keyframes shimmerPulse {
          0% { opacity: 0.45; }
          50% { opacity: 0.9; }
          100% { opacity: 0.45; }
        }
        .skeleton-pulse {
          animation: shimmerPulse 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
