import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import type { IntersectionSummary } from '../types/dashboard';

interface TopIntersectionsChartProps {
  data: IntersectionSummary[];
}

const TopIntersectionsChart: React.FC<TopIntersectionsChartProps> = ({ data }) => {
  const maxTotal = Math.max(...data.map(item => item.total), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 custom-shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-800">Top Intersections</h3>
        </div>
        <MapPin size={16} className="text-orange-500" />
      </div>

      <div className="space-y-4">
        {data.length > 0 ? data.map((intersection, index) => (
          <div key={intersection.name} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">#{index + 1}</div>
                <div className="line-clamp-2 text-xs font-bold leading-tight text-slate-700">{intersection.name}</div>
              </div>
              <div className="shrink-0 text-sm font-black tabular-nums text-slate-900">{intersection.total.toLocaleString()}</div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(8, (intersection.total / maxTotal) * 100)}%` }}
                transition={{ duration: 0.8, delay: index * 0.08 }}
                className="h-full rounded-full bg-orange-500"
              />
            </div>
          </div>
        )) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            No hotspot found
          </div>
        )}
      </div>
    </div>
  );
};

export default TopIntersectionsChart;
