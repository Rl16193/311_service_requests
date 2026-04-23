import React from 'react';
import { Layers } from 'lucide-react';

interface DivisionCardProps {
  section: string;
  division?: string;
}

const DivisionCard: React.FC<DivisionCardProps> = ({ section, division }) => {
  return (
    <div className="bg-white p-3 rounded-xl custom-shadow border border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <Layers size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">{section}</h2>
          <p className="text-[11px] font-medium text-slate-500">{division || 'Operational Unit'}</p>
        </div>
      </div>
    </div>
  );
};

export default DivisionCard;
