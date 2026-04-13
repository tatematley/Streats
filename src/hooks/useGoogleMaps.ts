import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

let scriptLoadStatus: LoadStatus = 'idle';
const listeners: Array<(status: LoadStatus) => void> = [];

function notifyListeners(status: LoadStatus) {
  scriptLoadStatus = status;
  listeners.forEach((fn) => fn(status));
}

export function loadGoogleMapsScript(): void {
  if (scriptLoadStatus === 'ready' || scriptLoadStatus === 'loading') return;

  scriptLoadStatus = 'loading';

  if (window.google?.maps) {
    notifyListeners('ready');
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => notifyListeners('ready');
  script.onerror = () => notifyListeners('error');
  document.head.appendChild(script);
}

export function useGoogleMaps() {
  const [status, setStatus] = useState<LoadStatus>(scriptLoadStatus);

  useEffect(() => {
    if (scriptLoadStatus === 'ready') {
      setStatus('ready');
      return;
    }

    const handler = (s: LoadStatus) => setStatus(s);
    listeners.push(handler);
    loadGoogleMapsScript();

    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { isLoaded: status === 'ready', isError: status === 'error' };
}
