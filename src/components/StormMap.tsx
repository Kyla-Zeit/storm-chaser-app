import { useEffect, useRef } from 'react';
import type { StormReport } from '@/types/storm';
import 'leaflet/dist/leaflet.css';

interface Props {
  reports: StormReport[];
}

const STORM_EMOJI: Record<string, string> = {
  thunderstorm: '⛈️', tornado: '🌪️', hurricane: '🌀', hailstorm: '🧊',
  blizzard: '❄️', derecho: '💨', microburst: '🌬️', supercell: '🌩️', other: '🌧️',
};

export function StormMap({ reports }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([39.8283, -98.5795], 4);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers
      reports.forEach((report) => {
        const emoji = STORM_EMOJI[report.stormType] || '🌧️';
        const icon = L.divIcon({
          html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${emoji}</div>`,
          className: 'storm-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([report.location.latitude, report.location.longitude], { icon });
        const date = new Date(report.timestamp);
        marker.bindPopup(`
          <div style="min-width:150px">
            <strong>${report.stormType.charAt(0).toUpperCase() + report.stormType.slice(1)}</strong><br/>
            <span style="color:#888">${date.toLocaleDateString()}</span><br/>
            ${report.notes ? `<p style="margin-top:4px;font-size:12px">${report.notes}</p>` : ''}
          </div>
        `);
        marker.addTo(map);
      });

      if (reports.length > 0) {
        const bounds = L.latLngBounds(
          reports.map((r) => [r.location.latitude, r.location.longitude] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reports]);

  if (reports.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-4xl mb-3">🗺️</p>
        <h3 className="text-lg font-semibold text-foreground">No Locations to Display</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Document storms to see them on the map
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div ref={mapRef} className="h-[400px] sm:h-[500px] w-full" />
    </div>
  );
}
