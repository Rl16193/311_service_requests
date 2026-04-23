import React from 'react';
import { BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import type { ServiceTrend } from '../types/dashboard';

interface WardTrendChartProps {
  selectedWard: string;
  data: ServiceTrend[];
}

const WardTrendChart: React.FC<WardTrendChartProps> = ({ selectedWard, data }) => {
  return (
    <div className="bg-white rounded-xl custom-shadow metric-card p-5 flex flex-col min-h-[420px]">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Reporting Levels</h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em]">{selectedWard}</p>
        </div>
        <BarChart3 size={18} className="text-slate-300" />
      </div>

      <div className="space-y-7 flex-1">
        {data.map((service, idx) => (
          <div key={service.name} className="group cursor-default">
            <div className="flex justify-between gap-4 text-xs font-semibold text-slate-600 mb-2 transition-colors group-hover:text-slate-900">
              <span className="line-clamp-1">{service.name}</span>
              <span className={cn("font-bold shrink-0", service.yoy < 0 ? "text-red-500" : "text-green-600")}>
                {service.yoy > 0 ? '+' : ''}{service.yoy.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, Math.min(100, Math.abs(service.yoy) * 1.5 + 20))}%` }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className={cn(
                  "h-full rounded-full shadow-sm",
                  service.yoy < 0
                    ? "bg-red-400"
                    : idx === 0 ? "bg-blue-600" : idx === 1 ? "bg-blue-500" : idx === 2 ? "bg-blue-400" : "bg-blue-300"
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WardTrendChart;
