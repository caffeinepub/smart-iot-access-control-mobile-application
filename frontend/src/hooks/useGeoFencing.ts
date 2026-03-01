import { useState, useEffect } from 'react';

export type GeoLocation = 'away' | 'near_home';

interface GeoFencingState {
  location: GeoLocation;
  radius: number;
  enabled: boolean;
}

export function useGeoFencing() {
  const [state, setState] = useState<GeoFencingState>(() => {
    try {
      const stored = localStorage.getItem('geoFencing');
      return stored ? JSON.parse(stored) : { location: 'away', radius: 150, enabled: false };
    } catch {
      return { location: 'away', radius: 150, enabled: false };
    }
  });

  useEffect(() => {
    localStorage.setItem('geoFencing', JSON.stringify(state));
  }, [state]);

  const toggleLocation = () => {
    setState((prev) => ({
      ...prev,
      location: prev.location === 'away' ? 'near_home' : 'away',
    }));
  };

  const setRadius = (radius: number) => {
    setState((prev) => ({ ...prev, radius }));
  };

  const toggleEnabled = () => {
    setState((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  return { ...state, toggleLocation, setRadius, toggleEnabled };
}
