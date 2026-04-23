import React from 'react';
import { MapPin } from 'lucide-react';
import type { IntersectionRequest } from '../data/dataService';
import WardIntersectionHeatmap from './WardIntersectionHeatmap';

interface IntersectionHeatmapCardProps {
  geoJson: any;
  selectedWards: string[];
  intersections: IntersectionRequest[];
  hotspotCount: number;
}

const IntersectionHeatmapCard: React.FC<IntersectionHeatmapCardProps> = ({
  geoJson,
  selectedWards,
  intersections,
  hotspotCount
}) => {
  const wardLabel = selectedWards.length === 1 ? selectedWards[0] : `${selectedWards.length} wards`;

  return (
    <div className="bg-white rounded-xl custom-shadow metric-card p-4 flex flex-col min-h-[600px]">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <MapPin size={16} className="text-orange-500" /> Intersection Hotspots - {selectedWards.length ? wardLabel : 'Select Ward'}
          </h3>
          <p className="text-xs text-slate-500"></p>
        </div>
      </div>
      <WardIntersectionHeatmap
        geoJson={geoJson}
        selectedWards={selectedWards}
        intersections={intersections}
      />
    </div>
  );
};

export default IntersectionHeatmapCard;
