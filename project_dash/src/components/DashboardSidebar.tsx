import React from 'react';
import { ChevronDown, Filter, RotateCcw } from 'lucide-react';
import { SECTIONS } from '../constants/toronto311Data';
import { YEARS } from '../constants/dashboard';
import { cn } from '../lib/utils';

interface DashboardSidebarProps {
  selectedSection: string;
  selectedService: string;
  selectedYears: number[];
  serviceOptions: string[];
  onSectionChange: (section: string) => void;
  onServiceChange: (service: string) => void;
  onYearToggle: (year: number) => void;
  onReset: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  selectedSection,
  selectedService,
  selectedYears,
  serviceOptions,
  onSectionChange,
  onServiceChange,
  onYearToggle,
  onReset
}) => {
  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0">
      <div className="p-8 border-b border-slate-800">
        <div className="flex items-center gap-3 text-white font-bold tracking-tight">
         
          <div className="leading-tight uppercase bold text-lg">
            City of Toronto<br/><span className="text-[10px] not-italic font-medium text-slate-500 tracking-widest">311 Service Requests</span>
          </div>
        </div>
      </div>

      <div className="flex-1 py-8 overflow-y-auto custom-scrollbar">
        <div className="px-8 space-y-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">1. Select Section</label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => onSectionChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">2. Select Service Category</label>
            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => onServiceChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
              >
                {serviceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">3. Select Years</label>
            <div className="flex flex-wrap gap-2">
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => onYearToggle(y)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border",
                    selectedYears.includes(y)
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 space-y-5">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-500 bg-slate-1000 px-4 py-2.5 text-xs font-bold text-slate-200 transition-all hover:border-blue-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <RotateCcw size={14} />
          Reset Filters to Default
        </button>
        <div className="text-[10px] text-slate-500 leading-relaxed font-medium">
          
          Last updated: March 2026<br/>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
