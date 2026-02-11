/**
 * useGeolocation Hook
 * Extracted from: Litla Gamaleigan (production)
 *
 * GPS tracking with configurable update intervals.
 * Handles permissions, errors, and accuracy reporting.
 *
 * Usage:
 *   const { position, accuracy, isTracking, error, startTracking, stopTracking } = useGeolocation();
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface UseGeolocationOptions {
  intervalMs?: number; // Update interval (default: 30000 = 30s)
  highAccuracy?: boolean; // Use high accuracy mode (default: true)
  onUpdate?: (position: GeoPosition) => void; // Callback on each update
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const { intervalMs = 30000, highAccuracy = true, onUpdate } = options;

  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef = useRef<number | null>(null);

  const getPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geoPos: GeoPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setPosition(geoPos);
        setAccuracy(pos.coords.accuracy);
        setError(null);
        onUpdate?.(geoPos);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied',
          2: 'Position unavailable',
          3: 'Location request timed out',
        };
        setError(messages[err.code] || 'Unknown geolocation error');
      },
      { enableHighAccuracy: highAccuracy, timeout: 10000, maximumAge: 5000 }
    );
  }, [highAccuracy, onUpdate]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setIsTracking(true);
    setError(null);
    getPosition(); // Initial position
    intervalRef.current = setInterval(getPosition, intervalMs);
  }, [getPosition, intervalMs]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return { position, accuracy, isTracking, error, startTracking, stopTracking };
}
