import React from 'react';
import { cn } from '../lib/utils';
import type { DashboardTab } from '../types/dashboard';

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm shrink-0 z-10">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Reporting Levels And Hotspot Analysis</h1>

      </div>

      <div className="flex bg-slate-100 p-1.25 rounded-xl border border-slate-200 shadow-inner">
        <button
          onClick={() => onTabChange('services')}
          className={cn(
            "px-6 py-2 text-xs font-semibold rounded-lg transition-all duration-300",
            activeTab === 'services' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
          )}
        >
          Services Overview
        </button>
        <button
          onClick={() => onTabChange('wards')}
          className={cn(
            "px-6 py-2 text-xs font-semibold rounded-lg transition-all duration-300",
            activeTab === 'wards' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
          )}
        >
          Ward Overview
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
