import React from 'react';
import { Building2, Calendar, Layers, MapPinned, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import type { ServiceDetail, ServiceSummary } from '../data/dataService';
import type { ServiceTrend } from '../types/dashboard';
import MetricCard from './MetricCard';
import TopServicesChart from './TopServicesChart';
import TemporalAreaChart from './TemporalAreaChart';
import ChoroplethMapCard from './ChoroplethMapCard';
import ServiceDescriptionCard from './ServiceDescriptionCard';

interface ServicesOverviewProps {
  selectedSection: string;
  selectedService: string;
  totalRequests: number;
  peakMonth: string;
  busiestWard: string;
  serviceDetail?: ServiceDetail;
  intersectionMappedPercent: number;
  serviceSummary: ServiceSummary[];
  topServicesData: ServiceTrend[];
  areaChartData: any[];
  areaServiceKeys: string[];
  geoJson: any;
  wardTotals: Record<number, number>;
  onWardSelect: (ward: string) => void;
}

const ServicesOverview: React.FC<ServicesOverviewProps> = ({
  selectedSection,
  selectedService,
  totalRequests,
  peakMonth,
  busiestWard,
  serviceDetail,
  intersectionMappedPercent,
  serviceSummary,
  topServicesData,
  areaChartData,
  areaServiceKeys,
  geoJson,
  wardTotals,
  onWardSelect
}) => {
  const division = serviceSummary.find(d => d.section === selectedSection)?.division;
  const busiestWardId = serviceSummary.find(d => d.ward === busiestWard)?.ward_id;
  const stats = [
    { label: 'Volume', value: totalRequests.toLocaleString(), sub: 'Total Service Requests', icon: Layers, tone: 'blue' as const, className: 'xl:col-span-1' },
    { label: 'Peak', value: peakMonth, sub: 'Busiest Month', icon: Calendar, tone: 'slate' as const, className: 'xl:col-span-1' },
    { label: 'Intersection Data Quality', value: `${intersectionMappedPercent.toFixed(1)}%`, sub: selectedService === 'All' ? selectedSection : selectedService, icon: MapPinned, tone: 'blue' as const, className: 'xl:col-span-1' },
    { label: 'Division', value: division || 'N/A', sub: selectedSection, icon: Building2, tone: 'slate' as const, className: 'xl:col-span-2' },
    { label: 'Primary Cluster', value: busiestWard, sub: busiestWardId ? `Ward ${busiestWardId}` : 'Highest Request Density', icon: MapPin, tone: 'slate' as const, className: 'xl:col-span-2' },
  ];

  return (
    <motion.div
      key="services-tab"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5 pb-2"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
        {stats.map((stat, i) => <MetricCard key={stat.label} stat={stat} index={i} className={stat.className} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <TopServicesChart selectedSection={selectedSection} data={topServicesData} />
        <TemporalAreaChart data={areaChartData} serviceKeys={areaServiceKeys} selectedService={selectedService} />
        <ChoroplethMapCard
          geoJson={geoJson}
          wardTotals={wardTotals}
          onWardSelect={onWardSelect}
        /><div className="mt-4 xl:mt-0 xl:col-span-5">
  <ServiceDescriptionCard serviceDetail={serviceDetail} />
</div>
      </div>
    </motion.div>
  );
};

export default ServicesOverview;
