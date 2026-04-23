import type { LucideIcon } from 'lucide-react';
import type { IntersectionRequest, MonthlyDistribution, ServiceDetail, ServiceSummary } from '../data/dataService';

export type DashboardTab = 'services' | 'wards';

export interface DashboardData {
  serviceSummary: ServiceSummary[];
  monthlySummary: MonthlyDistribution[];
  intersections: IntersectionRequest[];
  serviceDetails: ServiceDetail[];
}

export interface ServiceTrend {
  name: string;
  yoy: number;
}

export interface WardMetricData {
  total: number;
  rank: number;
  intersectionMapped: number;
}

export interface IntersectionSummary {
  name: string;
  total: number;
}

export interface StatCardData {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone?: 'blue' | 'slate' | 'emerald';
}
