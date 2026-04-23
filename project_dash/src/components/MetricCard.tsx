import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../lib/utils';
import type { StatCardData } from '../types/dashboard';

interface MetricCardProps {
  stat: StatCardData;
  index?: number;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ stat, index = 0, className }) => {
  const Icon = stat.icon;

  return (
    <div className={cn("metric-card bg-white p-4 rounded-xl custom-shadow hover:translate-y-[-2px] transition-transform duration-300 min-h-[132px]", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
          <Icon size={16} />
        </div>
        <Info size={14} className="text-slate-300 cursor-help" />
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</div>
      <div className="text-xl font-bold text-slate-900 tracking-tight leading-tight break-words">{stat.value}</div>
      <div className={cn("text-[10px] font-medium mt-2 leading-snug", stat.tone === 'emerald' ? "text-emerald-600" : "text-slate-400")}>
        {stat.sub}
      </div>
    </div>
  );
};

export default MetricCard;
