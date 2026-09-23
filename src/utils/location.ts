export interface DetectedLocation {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Detect user's current GPS location and reverse geocode to city/state
 */
export async function detectCurrentLocation(): Promise<DetectedLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Free Nominatim reverse geocoding with timeout fallback
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' },
              signal: controller.signal
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || 'Detected Area';
            const state = addr.state || '';
            const country = addr.country || 'India';

            resolve({
              city,
              state,
              country,
              latitude,
              longitude,
              formattedAddress: data.display_name || `${city}, ${state}`
            });
            return;
          }
        } catch {
          // Fallback if network/nominatim is offline
        }

        // Coordinate fallback if reverse geocode fails
        resolve({
          city: 'Current Location',
          state: '',
          country: 'India',
          latitude,
          longitude,
          formattedAddress: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please enter your city manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

// In-memory geocode cache to prevent redundant network requests while dragging
const geocodeCache = new Map<string, { city: string; area: string; displayName: string }>();

/**
 * Reverse geocode a latitude & longitude into a human-readable locality / city
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city: string; area: string; displayName: string }> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
      const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || 'Detected Area';
      const state = addr.state || '';
      const displayName = [area, city, state].filter(Boolean).join(', ') || data.display_name || `${city}`;

      const result = { city, area, displayName };
      geocodeCache.set(key, result);
      return result;
    }
  } catch {
    // Graceful fallback on network timeout
  }

  const fallback = {
    city: 'Selected Area',
    area: '',
    displayName: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
  };
  geocodeCache.set(key, fallback);
  return fallback;
}

/**
 * Calculate accurate geographic distance in meters between two lat/lon points using the Haversine formula
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance in meters to a clean human-readable string (m or km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
