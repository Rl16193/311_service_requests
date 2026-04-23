import React from 'react';
import { Activity, MapPin, MapPinned } from 'lucide-react';
import { motion } from 'motion/react';
import type { IntersectionRequest } from '../constants/dataService';
import type { IntersectionSummary, ServiceTrend, WardMetricData } from '../types/dashboard';
import WardSelectorCard from './WardSelectorCard';
import WardSummaryCard from './WardSummaryCard';
import IntersectionHeatmapCard from './IntersectionHeatmapCard';
import WardTrendChart from './WardTrendChart';
import TopIntersectionsChart from './TopIntersectionsChart';

interface WardOverviewProps {
  geoJson: any;
  selectedWards: string[];
  wardOptions: string[];
  wardMetricData: WardMetricData;
  wardTrendData: ServiceTrend[];
  filteredIntersections: IntersectionRequest[];
  topIntersections: IntersectionSummary[];
  onWardToggle: (ward: string) => void;
  onWardSelectAll: () => void;
  onWardReset: () => void;
}

const WardOverview: React.FC<WardOverviewProps> = ({
  wardTrendData,
  geoJson,
  selectedWards,
  wardOptions,
  wardMetricData,
  filteredIntersections,
  topIntersections,
  onWardToggle,
  onWardSelectAll,
  onWardReset
}) => {
  const wardLabel = selectedWards.length === 1
    ? selectedWards[0]
    : `${selectedWards.length} wards selected`;

  return (
    <motion.div
      key="wards-tab"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5 pb-2"
    >
      <WardSelectorCard
        selectedWards={selectedWards}
        wardOptions={wardOptions}
        onWardToggle={onWardToggle}
        onSelectAll={onWardSelectAll}
        onReset={onWardReset}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <WardSummaryCard
              label="Volume"
              value={wardMetricData.total.toLocaleString()}
              sub="Total Requests"
              icon={MapPin}
            />
            <WardSummaryCard
              label="Intersections Mapped"
              value={wardMetricData.intersectionMapped.toLocaleString()}
              sub="Requests in Hotspot Analysis"
              icon={MapPinned}
              tone="orange"
            />
            <WardSummaryCard
              label="Ranking"
              value={selectedWards.length === 1 && wardMetricData.rank ? `#${wardMetricData.rank}` : 'Choose one Ward'}
              sub={selectedWards.length === 1 ? 'Within selected filters' : 'Select one ward to rank'}
              icon={Activity}
            />
          </div>

          <IntersectionHeatmapCard
            geoJson={geoJson}
            selectedWards={selectedWards}
            intersections={filteredIntersections}
            hotspotCount={topIntersections.length}
          />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <TopIntersectionsChart data={topIntersections} />
          <WardTrendChart selectedWard={wardLabel} data={wardTrendData} />
        </div>
      </div>
    </motion.div>
  );
};

export default WardOverview;
