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
};

export default function MapEmbed({ apiKey, pins, center, zoom = 10, className }: Props) {
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
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
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

  // Update markers
  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;

    // Clear old
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    pins.forEach((p) => {
      const m = new window.google.maps.Marker({
        position: p.location,
        map: mapRef.current,
        title: p.name,
      });
      m.addListener('mouseover', () => {
        infoRef.current?.setContent(`<div style="padding:4px 6px;font-size:12px;">${p.name}</div>`);
        infoRef.current?.open({ map: mapRef.current, anchor: m });
      });
      m.addListener('mouseout', () => infoRef.current?.close());
      markersRef.current.push(m);
      bounds.extend(p.location);
    });

    if (pins.length > 1) {
      mapRef.current.fitBounds(bounds, { top: 24, right: 24, bottom: 24, left: 24 });
    } else if (pins.length === 1) {
      mapRef.current.setCenter(pins[0].location);
      mapRef.current.setZoom(zoom);
    }
  }, [pins, zoom]);

  return <div ref={ref} className={className} />;
}


