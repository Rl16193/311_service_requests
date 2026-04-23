import type { MonthlyDistribution } from '../constants/dataService';

export const DEFAULT_SECTION = 'Toronto Animal Services';
export const DEFAULT_SERVICE = 'All';
export const DEFAULT_YEARS = [2024, 2025];
export const CURRENT_YEAR = 2026;
export const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
export const SERVICE_COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2', '#ca8a04'];

export const getYTDMonths = (monthlyData: MonthlyDistribution[]) => {
  const months = new Set<string>();

  monthlyData
    .filter(d => d.year === CURRENT_YEAR)
    .forEach(d => months.add(d.month));

  return Array.from(months);
};
