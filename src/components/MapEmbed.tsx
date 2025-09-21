import { useEffect, useRef } from 'react';

type LatLng = { lat: number; lng: number };
type Pin = { id: string; name: string; location: LatLng };

declare global {
  interface Window { google?: any; }
}

type Props = {
  apiKey: string;
  pins: Pin[];
  center?: LatLng;
  zoom?: number;
  className?: string;
  onHover?: (placeId: string | null) => void;
  selectedPins?: string[]; // Array of selected pin IDs
};

export default function MapEmbed({ apiKey, pins, center, zoom = 10, className, onHover, selectedPins = [] }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoRef = useRef<any>(null);

  // Load script once
  useEffect(() => {
    if (window.google?.maps) return;
    const id = 'google-maps-js';
    if (document.getElementById(id)) return; // already loading
    const s = document.createElement('script');
    s.id = id;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    document.body.appendChild(s);
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!ref.current) return;
    if (!window.google?.maps) return; // wait for script
    if (mapRef.current) return;

    const initialCenter = center || pins[0]?.location || { lat: 20.5937, lng: 78.9629 };
    mapRef.current = new window.google.maps.Map(ref.current, {
      center: initialCenter,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    infoRef.current = new window.google.maps.InfoWindow();
  }, [center, pins, zoom]);

  // Update markers with debouncing to prevent shaking
  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;

    // Debounce marker updates to prevent shaking
    const timeoutId = setTimeout(() => {
      // Clear old markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      if (pins.length === 0) return;

      const bounds = new window.google.maps.LatLngBounds();
      pins.forEach((p) => {
        const isSelected = selectedPins.includes(p.id);
        const m = new window.google.maps.Marker({
          position: p.location,
          map: mapRef.current,
          title: p.name,
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: isSelected 
              ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#8B5CF6" stroke="white" stroke-width="2"/>
                  <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              `)
              : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#8B5CF6" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
            scaledSize: new window.google.maps.Size(20, 20),
            anchor: new window.google.maps.Point(10, 10)
          }
        });
        
        // Add stable event listeners
        m.addListener('mouseover', () => {
          if (infoRef.current) {
            infoRef.current.setContent(`<div style="padding:4px 6px;font-size:12px;font-weight:500;">${p.name}</div>`);
            infoRef.current.open({ map: mapRef.current, anchor: m });
          }
          onHover?.(p.id);
        });
        
        m.addListener('mouseout', () => {
          if (infoRef.current) {
            infoRef.current.close();
          }
          onHover?.(null);
        });
        
        markersRef.current.push(m);
        bounds.extend(p.location);
      });

      // Fit bounds with padding to prevent shaking
      if (pins.length > 1) {
        mapRef.current.fitBounds(bounds, { 
          top: 20, 
          right: 20, 
          bottom: 20, 
          left: 20 
        });
      } else if (pins.length === 1) {
        mapRef.current.setCenter(pins[0].location);
        mapRef.current.setZoom(Math.min(zoom, 12)); // Limit zoom to prevent shaking
      }
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [pins, selectedPins, zoom, onHover]);

  return <div ref={ref} className={className} />;
}


