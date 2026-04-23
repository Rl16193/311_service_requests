import React from 'react';
import { CheckSquare, Map as MapIcon, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface WardSelectorCardProps {
  selectedWards: string[];
  wardOptions: string[];
  onWardToggle: (ward: string) => void;
  onSelectAll: () => void;
  onReset: () => void;
}

const WardSelectorCard: React.FC<WardSelectorCardProps> = ({
  selectedWards,
  wardOptions,
  onWardToggle,
  onSelectAll,
  onReset
}) => {
  return (
    <div className="flex flex-col gap-3 bg-white p-3 rounded-xl custom-shadow metric-card">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-base font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <MapIcon size={17} className="text-blue-600" /> Wards
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {selectedWards.length} selected
          </span>
          <button
            type="button"
            onClick={onSelectAll}
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 transition-colors hover:bg-blue-100"
          >
            <CheckSquare size={12} />
            Select All
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      <div className="max-h-[78px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="flex flex-wrap gap-1.5">
          {wardOptions.map((ward) => (
            <button
              key={ward}
              type="button"
              onClick={() => onWardToggle(ward)}
              className={cn(
                'rounded-md border px-2 py-1.5 text-[10px] font-bold transition-colors',
                selectedWards.includes(ward)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
              )}
              aria-pressed={selectedWards.includes(ward)}
              title={ward}
            >
              {ward}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardSelectorCard;
