import React from 'react';
import { Clock3, ExternalLink, Info } from 'lucide-react';
import type { ServiceDetail } from '../constants/dataService';

interface ServiceInfoFooterProps {
  serviceDetail?: ServiceDetail;
}

const ServiceInfoFooter: React.FC<ServiceInfoFooterProps> = ({ serviceDetail }) => {
  const hasLink = Boolean(serviceDetail?.Link && serviceDetail.Link !== '0');
  const emptyText = 'Select a service request';

  const cards = [
    {
      label: 'Timeline',
      value: serviceDetail?.Timelines || emptyText,
      icon: Clock3
    },
    {
      label: 'Additional Info',
      value: serviceDetail?.Tip || emptyText,
      icon: Info
    },
    {
      label: 'Note',
      value: 'Timelines provided are approximations, and actions taken will be a result of the investigation conducted. Review the city by-laws for better understanding.',
      icon: Info
    }
  ];

  return (
    <div className="relative lg:fixed bottom-0 lg:left-72 left-0 right-0 z-30 border-t border-slate-200 bg-white/65 p-3 backdrop-blur-sm">
      <div className="flex overflow-x-auto gap-3 lg:grid lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="min-w-[220px]min-h-[84px] rounded-lg border border-slate-100 bg-slate-50/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Icon size={13} className="text-blue-600" />
              {label}
            </div>
            <p className="text-xs font-semibold leading-snug text-slate-700">{value}</p>
          </div>
        ))}

        <div className="min-w-[220px] min-h-[84px] rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <ExternalLink size={13} className="text-blue-600" />
            311 Knowledge Page
          </div>
          {hasLink ? (
            <a
              href={serviceDetail?.Link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-blue-700"
              title={serviceDetail?.Link}
            >
              Click here for details
              <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-[11px] font-semibold leading-snug text-slate-500">{emptyText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoFooter;
