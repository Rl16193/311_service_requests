/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { MONTHS } from './constants/toronto311Data';
import { dataService } from './constants/dataService';
import {
  CURRENT_YEAR,
  DEFAULT_SECTION,
  DEFAULT_SERVICE,
  DEFAULT_YEARS,
  getYTDMonths
} from './constants/dashboard';
import type { DashboardData, DashboardTab, WardMetricData } from './types/dashboard';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardHeader from './components/DashboardHeader';
import ServicesOverview from './components/ServicesOverview';
import WardOverview from './components/WardOverview';
import ServiceInfoFooter from './components/ServiceInfoFooter';

const EMPTY_DATA: DashboardData = {
  serviceSummary: [],
  monthlySummary: [],
  intersections: [],
  serviceDetails: []
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState(DEFAULT_SECTION);
  const [selectedService, setSelectedService] = useState(DEFAULT_SERVICE);
  const [selectedYears, setSelectedYears] = useState<number[]>(DEFAULT_YEARS);
  const [activeTab, setActiveTab] = useState<DashboardTab>('services');
  const [selectedWards, setSelectedWards] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [result, geo] = await Promise.all([
          dataService.loadData(),
          dataService.loadGeoJson()
        ]);

        setData(result);
        setGeoJson(geo);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const wardOptions = useMemo(() => {
    const wards = new Set<string>();
    data.serviceSummary.forEach(d => {
      if (d.ward) wards.add(d.ward);
    });
    return Array.from(wards).sort();
  }, [data.serviceSummary]);

  useEffect(() => {
    if (wardOptions.length > 0 && selectedWards.length === 0) {
      setSelectedWards([wardOptions[0]]);
    }
  }, [wardOptions, selectedWards.length]);

  const primaryWard = selectedWards[0] || '';

  const serviceOptions = useMemo(() => {
    const types = new Set<string>();
    data.monthlySummary
      .filter(d => d.section === selectedSection)
      .forEach(d => types.add(d.service_request_type));
    return ['All', ...Array.from(types).sort()];
  }, [data.monthlySummary, selectedSection]);

  const filteredMonthly = useMemo(() => {
    return data.monthlySummary.filter(d =>
      selectedYears.includes(d.year) &&
      d.section === selectedSection &&
      (selectedService === 'All' || d.service_request_type === selectedService)
    );
  }, [data.monthlySummary, selectedYears, selectedSection, selectedService]);

  const filteredYearly = useMemo(() => {
    return data.serviceSummary.filter(d =>
      selectedYears.includes(d.year) &&
      d.section === selectedSection &&
      (selectedService === 'All' || d.service_request_type === selectedService)
    );
  }, [data.serviceSummary, selectedYears, selectedSection, selectedService]);

  const totalRequests = useMemo(
    () => filteredMonthly.reduce((total, item) => total + item.request_count, 0),
    [filteredMonthly]
  );

  const peakMonth = useMemo(() => {
    const counts = filteredMonthly.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.month] = (acc[curr.month] || 0) + curr.request_count;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'N/A';
  }, [filteredMonthly]);

  const wardTotals = useMemo(() => {
    return filteredYearly.reduce<Record<number, number>>((totals, curr) => {
      if (curr.ward_id) {
        totals[curr.ward_id] = (totals[curr.ward_id] || 0) + curr.yearly_requests;
      }
      return totals;
    }, {});
  }, [filteredYearly]);

  const busiestWard = useMemo(() => {
    const counts = filteredYearly.reduce<Record<number, { total: number; name: string }>>((acc, curr) => {
      if (!acc[curr.ward_id]) {
        acc[curr.ward_id] = { total: 0, name: curr.ward };
      }
      acc[curr.ward_id].total += curr.yearly_requests;
      return acc;
    }, {});

    return (Object.values(counts) as { total: number; name: string }[]).sort((a, b) => b.total - a.total)[0]?.name || 'N/A';
  }, [filteredYearly]);

  const selectedServiceDetail = useMemo(() => {
    if (selectedService === 'All') return undefined;
    return data.serviceDetails.find(detail => detail.service_request_type === selectedService);
  }, [data.serviceDetails, selectedService]);

  const intersectionMappedPercent = useMemo(() => {
    if (selectedServiceDetail) return selectedServiceDetail['% Intersections'];

    const sectionDetails = data.serviceDetails.filter(detail => detail.section === selectedSection);
    const totals = sectionDetails.reduce(
      (acc, detail) => ({
        total: acc.total + detail.total_requests,
        mapped: acc.mapped + detail.requestswiinter
      }),
      { total: 0, mapped: 0 }
    );

    return totals.total ? (totals.mapped / totals.total) * 100 : 0;
  }, [data.serviceDetails, selectedSection, selectedServiceDetail]);

  const wardTrendData = useMemo(() => {
    if (selectedWards.length === 0) return [];

    const wardData = data.serviceSummary.filter(d =>
      selectedYears.includes(d.year) &&
      d.section === selectedSection &&
      selectedWards.includes(d.ward)
    );

    const grouped = wardData.reduce<Record<string, number[]>>((acc, curr) => {
      acc[curr.service_request_type] = acc[curr.service_request_type] || [];
      acc[curr.service_request_type].push(curr.yoy_change);
      return acc;
    }, {});

    return (Object.entries(grouped) as [string, number[]][])
      .map(([name, values]) => ({
        name,
        yoy: values.reduce((sum, v) => sum + v, 0) / values.length
      }))
      .sort((a, b) => b.yoy - a.yoy)
      .slice(0, 7);
  }, [data.serviceSummary, selectedWards, selectedYears, selectedSection]);


  const wardMetricData = useMemo<WardMetricData>(() => {
    if (selectedWards.length === 0) return { total: 0, rank: 0, intersectionMapped: 0 };

    const wardData = filteredYearly.filter(d => selectedWards.includes(d.ward));
    const total = wardData.reduce((sum, item) => sum + item.yearly_requests, 0);
    const intersectionMapped = data.intersections
      .filter(d =>
        selectedWards.includes(d.ward) &&
        selectedYears.includes(d.year) &&
        d.section === selectedSection &&
        (selectedService === 'All' || d.service_request_type === selectedService)
      )
      .reduce((sum, item) => sum + item.yearly_requests, 0);

    const wardSums = data.serviceSummary
      .filter(d =>
        selectedYears.includes(d.year) &&
        d.section === selectedSection &&
        (selectedService === 'All' || d.service_request_type === selectedService)
      )
      .reduce<Record<string, number>>((acc, curr) => {
        acc[curr.ward] = (acc[curr.ward] || 0) + curr.yearly_requests;
        return acc;
      }, {});

    const rank = selectedWards.length === 1
      ? Object.entries(wardSums)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .findIndex(([ward]) => ward === primaryWard) + 1
      : 0;

    return { total, rank, intersectionMapped };
  }, [data.serviceSummary, data.intersections, filteredYearly, primaryWard, selectedWards, selectedYears, selectedSection, selectedService]);

  const topServicesData = useMemo(() => {
    const baseYearly = data.serviceSummary.filter(d =>
      selectedYears.includes(d.year) &&
      d.section === selectedSection
    );

    const baseMonthly = data.monthlySummary.filter(d =>
      selectedYears.includes(d.year) &&
      d.section === selectedSection
    );

    const ytdMonths = getYTDMonths(baseMonthly);
    const includes2026 = selectedYears.includes(CURRENT_YEAR);
    const services = new Map<string, typeof baseYearly>();

    baseYearly.forEach(d => {
      services.set(d.service_request_type, [...(services.get(d.service_request_type) || []), d]);
    });

    return Array.from(services.entries())
      .map(([name, values]) => {
        if (includes2026) {
          const current = baseMonthly
            .filter(d => d.year === CURRENT_YEAR && d.service_request_type === name && ytdMonths.includes(d.month))
            .reduce((sum, item) => sum + item.request_count, 0);
          const previous = baseMonthly
            .filter(d => d.year === CURRENT_YEAR - 1 && d.service_request_type === name && ytdMonths.includes(d.month))
            .reduce((sum, item) => sum + item.request_count, 0);

          return { name, yoy: previous ? ((current - previous) / previous) * 100 : 0 };
        }

        return {
          name,
          yoy: values.reduce((sum, item) => sum + item.yoy_change, 0) / values.length
        };
      })
      .sort((a, b) => b.yoy - a.yoy)
      .slice(0, 7);
  }, [data.serviceSummary, data.monthlySummary, selectedYears, selectedSection]);

  const areaServiceKeys = useMemo(() => {
    if (selectedService !== 'All') return ['count'];

    const serviceTotals = filteredMonthly.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.service_request_type] = (acc[curr.service_request_type] || 0) + curr.request_count;
      return acc;
    }, {});

    return Object.entries(serviceTotals)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 6)
      .map(([name]) => name);
  }, [filteredMonthly, selectedService]);

  const areaChartData = useMemo(() => {
    return MONTHS.map(month => {
      const row: Record<string, string | number> = { month: month.substring(0, 3).toUpperCase() };

      if (selectedService !== 'All') {
        row.count = filteredMonthly
          .filter(d => d.month === month)
          .reduce((sum, item) => sum + item.request_count, 0);
      } else {
        areaServiceKeys.forEach(service => {
          row[service] = filteredMonthly
            .filter(d => d.month === month && d.service_request_type === service)
            .reduce((sum, item) => sum + item.request_count, 0);
        });
      }

      return row;
    });
  }, [areaServiceKeys, filteredMonthly, selectedService]);

  const filteredIntersections = useMemo(() => {
    if (selectedWards.length === 0) return [];

    return data.intersections.filter(d =>
      selectedWards.includes(d.ward) &&
      selectedYears.includes(d.year) &&
      d.section === selectedSection &&
      (selectedService === 'All' || d.service_request_type === selectedService)
    );
  }, [data.intersections, selectedWards, selectedYears, selectedSection, selectedService]);

  const topIntersections = useMemo(() => {
    const totals = new Map<string, { name: string; total: number }>();

    filteredIntersections.forEach(item => {
      const current = totals.get(item.intersection_desc);
      if (current) {
        current.total += item.yearly_requests;
      } else {
        totals.set(item.intersection_desc, {
          name: item.intersection_desc,
          total: item.yearly_requests
        });
      }
    });

    return Array.from(totals.values()).sort((a, b) => b.total - a.total).slice(0, 3);
  }, [filteredIntersections]);

  const toggleYear = (year: number) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? (prev.length > 1 ? prev.filter(y => y !== year) : prev)
        : [...prev, year]
    );
  };

  const resetFilters = () => {
    setSelectedSection(DEFAULT_SECTION);
    setSelectedService(DEFAULT_SERVICE);
    setSelectedYears([...DEFAULT_YEARS]);
    setSelectedWards(wardOptions[0] ? [wardOptions[0]] : []);
    setActiveTab('services');
  };

  const toggleWard = (ward: string) => {
    setSelectedWards(prev => {
      if (prev.includes(ward)) {
        return prev.length > 1 ? prev.filter(item => item !== ward) : prev;
      }

      return [...prev, ward];
    });
  };

  const selectAllWards = () => {
    setSelectedWards([...wardOptions]);
  };

  const resetWards = () => {
    setSelectedWards(wardOptions[0] ? [wardOptions[0]] : []);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium tracking-tight">Loading Datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <DashboardSidebar
        selectedSection={selectedSection}
        selectedService={selectedService}
        selectedYears={selectedYears}
        serviceOptions={serviceOptions}
        onSectionChange={(section) => {
          setSelectedSection(section);
          setSelectedService(DEFAULT_SERVICE);
        }}
        onServiceChange={setSelectedService}
        onYearToggle={toggleYear}
        onReset={resetFilters}
      />

      <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-y-auto p-10 pb-36 space-y-8 custom-scrollbar">
          <AnimatePresence mode="wait">
          {activeTab === 'services' ? (
              <ServicesOverview
                selectedSection={selectedSection}
                selectedService={selectedService}
                totalRequests={totalRequests}
                peakMonth={peakMonth}
                busiestWard={busiestWard}
                serviceDetail={selectedServiceDetail}
                intersectionMappedPercent={intersectionMappedPercent}
                serviceSummary={data.serviceSummary}
                topServicesData={topServicesData}
                areaChartData={areaChartData}
                areaServiceKeys={areaServiceKeys}
                geoJson={geoJson}
                wardTotals={wardTotals}
                onWardSelect={(ward) => {
                  setSelectedWards([ward]);
                  setActiveTab('wards');
                }}
              />
            ) : (
              <WardOverview
                geoJson={geoJson}
                selectedWards={selectedWards}
                wardOptions={wardOptions}
                wardMetricData={wardMetricData}
                wardTrendData={wardTrendData}
                filteredIntersections={filteredIntersections}
                topIntersections={topIntersections}
                onWardToggle={toggleWard}
                onWardSelectAll={selectAllWards}
                onWardReset={resetWards}
              />
            )}
          </AnimatePresence>
        </div>

        <ServiceInfoFooter serviceDetail={selectedServiceDetail} />
      </main>
    </div>
  );
}
