import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import type { GeoLocation } from '@/types/storm';

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        // Native: use Capacitor Geolocation
        const permStatus = await Geolocation.checkPermissions();
        if (permStatus.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        // Web fallback
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser');
        }
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to get location';
      setError(msg);
      // Fallback location
      setLocation({ latitude: 40.7128, longitude: -74.006, locationName: 'New York (default)' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, error, loading, refresh: requestLocation };
}
