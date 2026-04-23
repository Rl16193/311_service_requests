import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import type { IntersectionRequest } from '../data/dataService';

interface WardIntersectionHeatmapProps {
  geoJson: any;
  selectedWards: string[];
  intersections: IntersectionRequest[];
}

interface Hotspot {
  name: string;
  lat: number;
  long: number;
  total: number;
}

const HeatmapLayer: React.FC<{ data: [number, number, number][] }> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || data.length === 0) return;

    const heat = (L as any).heatLayer(data, {
      radius: 13,
      blur: 9,
      maxZoom: 17,
      gradient: {
        0.2: '#1e3a8a',
        0.4: '#2563eb',
        0.6: '#f97316',
        0.8: '#ef4444'
      }
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]);

  return null;
};

const MapController: React.FC<{ selectedFeatures: any[]; selectedWards: string[] }> = ({ selectedFeatures, selectedWards }) => {
  const map = useMap();
  const lastSelectionRef = useRef('');

  useEffect(() => {
    const key = selectedWards.join('|');
    if (selectedFeatures.length === 0 || key === lastSelectionRef.current) return;

    const bounds = L.featureGroup(selectedFeatures.map(feature => L.geoJSON(feature))).getBounds();
    map.fitBounds(bounds, { padding: [20, 20], animate: false });
    lastSelectionRef.current = key;
  }, [map, selectedFeatures, selectedWards]);

  return null;
};

const ResetViewButton: React.FC<{ selectedFeatures: any[] }> = ({ selectedFeatures }) => {
  const map = useMap();

  const resetView = () => {
    if (selectedFeatures.length > 0) {
      const bounds = L.featureGroup(selectedFeatures.map(feature => L.geoJSON(feature))).getBounds();
      map.fitBounds(bounds, { padding: [20, 20], animate: true });
      return;
    }

    map.setView([43.7, -79.4], 11, { animate: true });
  };

  return (
    <button
      type="button"
      onClick={resetView}
      className="absolute right-3 top-3 z-[1000] inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
      title="Reset pan and zoom"
    >
      <RotateCcw size={13} />
      Reset
    </button>
  );
};

const HoverLayer: React.FC<{
  data: Hotspot[];
  onHover: (e: any, hotspot: Hotspot) => void;
  onOut: () => void;
}> = ({ data, onHover, onOut }) => {
  const { topData, maxTotal } = useMemo(() => {
    const top = [...data].sort((a, b) => b.total - a.total).slice(0, 300);
    return {
      topData: top,
      maxTotal: Math.max(...top.map(d => d.total), 1)
    };
  }, [data]);

  return (
    <>
      {topData.map((d) => (
        <CircleMarker
          key={`${d.name}-${d.lat}-${d.long}`}
          center={[d.lat, d.long]}
          radius={Math.max(8, Math.min(30, 8 + Math.sqrt(d.total / maxTotal) * 22))}
          pathOptions={{ opacity: 0, fillOpacity: 0 }}
          eventHandlers={{
            mouseover: (e) => onHover(e, d),
            mouseout: onOut
          }}
        />
      ))}
    </>
  );
};

const WardIntersectionHeatmap: React.FC<WardIntersectionHeatmapProps> = ({
  geoJson,
  selectedWards,
  intersections
}) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; total: number } | null>(null);

  const selectedFeatures = useMemo(() => {
    if (!geoJson || selectedWards.length === 0) return [];
    return geoJson.features?.filter((feature: any) => selectedWards.includes(feature.properties.AREA_NAME)) || [];
  }, [geoJson, selectedWards]);

  const hotspots = useMemo(() => {
    const grouped = new Map<string, Hotspot>();

    intersections.forEach(item => {
      const key = `${item.intersection_desc}|${item.lat}|${item.long}`;
      const current = grouped.get(key);

      if (current) {
        current.total += item.yearly_requests;
      } else {
        grouped.set(key, {
          name: item.intersection_desc,
          lat: item.lat,
          long: item.long,
          total: item.yearly_requests
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [intersections]);

  const heatData = useMemo<[number, number, number][]>(() => {
    return hotspots.map(d => [d.lat, d.long, d.total]);
  }, [hotspots]);

  const polygonPositions = useMemo(() => {
    if (selectedFeatures.length === 0) return [];

    return selectedFeatures.map((feature: any) =>
      feature.geometry.coordinates[0].map(
        ([lng, lat]: [number, number]) => [lat, lng]
      )
    );
  }, [selectedFeatures]);

  return (
    <div className="relative min-h-[560px] w-full overflow-hidden rounded-xl border border-slate-100">
      <MapContainer
        center={[43.7, -79.4]}
        zoom={12}
        scrollWheelZoom={true}
        className="absolute inset-0 z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap & CartoDB"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController selectedFeatures={selectedFeatures} selectedWards={selectedWards} />
        <ResetViewButton selectedFeatures={selectedFeatures} />

        {polygonPositions.map((positions, index) => (
          <Polygon
            key={`ward-outline-${index}`}
            positions={positions}
            pathOptions={{
              color: '#f97316',
              weight: 1.5,
              fill: false
            }}
          />
        ))}

        {heatData.length > 0 && <HeatmapLayer data={heatData} />}

        <HoverLayer
          data={hotspots}
          onHover={(e, hotspot) => {
            setTooltip({
              x: e.originalEvent.clientX,
              y: e.originalEvent.clientY,
              name: hotspot.name,
              total: hotspot.total
            });
          }}
          onOut={() => setTooltip(null)}
        />
      </MapContainer>

      {selectedWards.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-xs font-bold uppercase text-slate-400">
          Select ward to continue
        </div>
      )}

      {selectedWards.length > 0 && heatData.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-xs font-bold uppercase text-slate-400">
          No intersection hotspots
        </div>
      )}

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'fixed',
              left: tooltip.x + 10,
              top: tooltip.y + 10,
              pointerEvents: 'none'
            }}
            className="z-50 min-w-[220px] rounded-xl border border-slate-700 bg-slate-900/95 p-4 text-sm text-white shadow-2xl"
          >
            <div className="mb-1.5 border-b border-slate-700 pb-1.5 text-[10px] font-bold uppercase text-slate-400">
              {tooltip.name}
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-300">Total Requests</span>
              <span className="font-mono text-orange-300 font-bold">{tooltip.total.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardIntersectionHeatmap;
