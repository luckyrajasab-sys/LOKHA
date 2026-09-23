import React, { useEffect } from 'react';
import type { PropertyDocument } from '../../types/firebaseModels';

interface JsonLdListingProps {
  property: PropertyDocument;
  canonicalUrl?: string;
}

export const JsonLdListing: React.FC<JsonLdListingProps> = ({ property, canonicalUrl }) => {
  useEffect(() => {
    const url = canonicalUrl || window.location.href;
    const price = property.price || property.rentAmount || 15000000;
    const city = property.location?.city || property.city || 'India';
    const state = property.location?.state || property.state || '';
    const address = property.location?.address || property.address || '';
    const pincode = property.location?.pincode || property.pincode || '';

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.title,
      description: property.description || `Luxury real estate residence in ${city}`,
      url: url,
      image: property.images && property.images.length > 0 ? property.images : [],
      offers: {
        '@type': 'Offer',
        price: price,
        priceCurrency: 'INR',
        availability: property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        businessFunction: property.listingType === 'Rent' ? 'https://schema.org/LeaseOut' : 'https://schema.org/Sell'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.latitude || 13.0827,
        longitude: property.longitude || 80.2707
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressLocality: city,
        addressRegion: state,
        postalCode: pincode,
        addressCountry: 'IN'
      },
      numberOfRooms: property.specifications?.bedrooms || property.bedrooms || 3,
      numberOfBathroomsTotal: property.specifications?.bathrooms || property.bathrooms || 3,
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.specifications?.areaSqFt || property.area || 2400,
        unitCode: 'FTK'
      }
    };

    const scriptId = 'lokha-jsonld-property';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    // Update document title and meta description
    document.title = `${property.title} | ${city} Luxury Real Estate | LOKHA`;

    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = `${property.title} in ${city} - ₹${(price / 10000000).toFixed(2)} Cr. Explore floor plans, verified RERA documentation, high-res photos, and private concierge visits.`;

    return () => {
      // Clean up script on unmount
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }
    };
  }, [property, canonicalUrl]);

  return null;
};
