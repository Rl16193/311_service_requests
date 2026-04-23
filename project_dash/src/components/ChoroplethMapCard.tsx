import React from 'react';
import { Globe, Info } from 'lucide-react';
import TorontoMap from './TorontoMap';

interface ChoroplethMapCardProps {
  geoJson: any;
  wardTotals: Record<number, number>;
  selectedWard?: string;
  onWardSelect: (ward: string) => void;
}

const ChoroplethMapCard: React.FC<ChoroplethMapCardProps> = ({ geoJson, wardTotals, selectedWard, onWardSelect }) => {
  return (
    <div className="xl:col-span-5 bg-white rounded-xl custom-shadow metric-card p-5 flex flex-col min-h-[420px]">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Globe size={18} className="text-blue-600" /> Ward Choropleth Map
          </h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em]">Spatial distribution of service requests</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Low</span>
          </div>
          <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-600"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">High</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[330px] bg-slate-50/50 rounded-xl relative overflow-hidden flex items-stretch justify-stretch border border-slate-100/50 group">
        {geoJson ? (
          <TorontoMap
            geoJson={geoJson}
            wardTotals={wardTotals}
            selectedWard={selectedWard}
            onWardSelect={onWardSelect}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 w-full">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-slate-400">Rendering geographic data...</span>
          </div>
        )}

        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200 flex items-center gap-2">
            <Info size={12} /> Click a ward to drill-down
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoroplethMapCard;
