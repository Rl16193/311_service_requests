import React from 'react';
import { FileText } from 'lucide-react';
import type { ServiceDetail } from '../data/dataService';

interface ServiceDescriptionCardProps {
  serviceDetail?: ServiceDetail;
}

const ServiceDescriptionCard: React.FC<ServiceDescriptionCardProps> = ({ serviceDetail }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 custom-shadow">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <FileText size={14} className="text-blue-600" />
        Service Request Description
      </div>
      <p className="text-sm font-semibold leading-relaxed text-slate-700">
        {serviceDetail?.Description || 'Select a service request'}
      </p>
    </div>
  );
};

export default ServiceDescriptionCard;
