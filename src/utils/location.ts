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
