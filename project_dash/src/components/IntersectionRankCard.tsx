import React from 'react';
import { MapPin } from 'lucide-react';
import type { IntersectionSummary } from '../types/dashboard';

interface IntersectionRankCardProps {
  rank: 1 | 2;
  intersection?: IntersectionSummary;
}

const IntersectionRankCard: React.FC<IntersectionRankCardProps> = ({ rank, intersection }) => {
  return (
    <div className="bg-white p-4 rounded-xl custom-shadow metric-card flex flex-col justify-between group hover:border-orange-200 transition-colors min-h-[142px]">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          {rank === 1 ? 'Top Intersection' : 'Second Intersection'}
        </div>
        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500/70 group-hover:text-orange-600 transition-colors shrink-0">
          <MapPin size={18} />
        </div>
      </div>

      {intersection ? (
        <div>
          <div className="mt-3 text-xs font-black leading-tight text-slate-900 line-clamp-2">{intersection.name}</div>
          <div className="mt-3 text-2xl font-black tracking-tighter text-orange-600">{intersection.total.toLocaleString()}</div>
          <div className="text-[11px] font-bold text-slate-400">Total requests</div>
        </div>
      ) : (
        <div>
          <div className="mt-3 text-xs font-bold leading-tight text-slate-400">No hotspot found</div>
          <div className="mt-3 text-2xl font-black tracking-tighter text-slate-300">0</div>
          <div className="text-[11px] font-bold text-slate-400">Total requests</div>
        </div>
      )}
    </div>
  );
};

export default IntersectionRankCard;
