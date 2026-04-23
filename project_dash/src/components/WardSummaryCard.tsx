import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface WardSummaryCardProps {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: 'blue' | 'orange';
}

const WardSummaryCard: React.FC<WardSummaryCardProps> = ({ label, value, sub, icon: Icon, tone = 'blue' }) => {
  const iconClass = tone === 'orange'
    ? 'text-orange-500/70 group-hover:text-orange-600'
    : 'text-blue-600/20 group-hover:text-blue-600/80';
  const iconBg = tone === 'orange' ? 'bg-orange-50' : 'bg-slate-50';

  return (
    <div className="bg-white p-3 rounded-xl custom-shadow metric-card flex items-center justify-between gap-3 group hover:border-blue-200 transition-colors min-h-[112px]">
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="text-lg font-black text-slate-900 tracking-tight break-words leading-tight">{value}</div>
        <div className="text-[10px] font-bold text-slate-400 mt-1.5 leading-snug">{sub}</div>
      </div>
      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconClass} transition-colors shrink-0`}>
        <Icon size={18} />
      </div>
    </div>
  );
};

export default WardSummaryCard;
