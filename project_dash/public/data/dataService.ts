export interface ServiceSummary {
  service_request_type: string;
  section: string;
  division: string;
  year: number;
  yearly_requests: number;
  ward: string;
  ward_id: number;
  top_month: string;
  yoy_change: number; // We'll calculate this or mock it if missing
}

export interface MonthlyDistribution {
  month: string;
  year: number;
  service_request_type: string;
  section: string;
  request_count: number;
  yearly_total: number;
  yoy_growth: number;
  percentage_contribution: number;
}

export interface IntersectionRequest {
  intersection_desc: string;
  ward: string;
  year: number;
  service_request_type: string;
  section: string;
  yearly_requests: number;
  lat: number;
  long: number;
}

export interface ServiceDetail {
  service_request_type: string;
  section: string;
  total_requests: number;
  requestswiinter: number;
  '% Intersections': number;
  Description: string;
  Conditions: string;
  Timelines: string;
  Tip: string;
  Link: string;
}

const normalizeServiceKey = (service: string) =>
  service
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\|\|/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

export const dataService = {
  async loadData() {
    try {
      const [summaryRes, monthlyRes, intersectionsRes, serviceDetailsRes] = await Promise.all([
        fetch('/data/service_year_summary.json'),       
        fetch('/data/matched_intersections.json'),     
        fetch('/data/top100.json'),                     
        fetch('/data/monthly_distribution.json')       
    ]);

    // 🔍 Validate responses BEFORE parsing
    if (!summaryRes.ok) throw new Error('Failed to load service_year_summary');
    if (!monthlyRes.ok) throw new Error('Failed to load monthly_distribution');
    if (!intersectionsRes.ok) throw new Error('Failed to load matched_intersections');
    if (!serviceDetailsRes.ok) throw new Error('Failed to load top100');

    // 🔍 Check content type (this catches your exact bug)
    const contentType = intersectionsRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await intersectionsRes.text();
      console.error('Invalid JSON response:', text.slice(0, 200));
      throw new Error('matched_intersections is not returning JSON');
    }

    const summaryData = await summaryRes.json();
    const monthlyData = await monthlyRes.json();
    const intersectionsData = await intersectionsRes.json();
    const serviceDetailsData = await serviceDetailsRes.json();
    const canonicalServiceNames = new Map<string, string>(
      serviceDetailsData.map((item: any) => [
        normalizeServiceKey(item.service_request_type || ''),
        item.service_request_type || ''
      ])
    );
    const canonicalServiceName = (service: string) =>
      canonicalServiceNames.get(normalizeServiceKey(service)) || service;

      // Calculate YoY change for summary if not present
      // For simplicity, let's just use the data as is and add a yoy property if needed
      const summaryWithYoY = summaryData.map((item: any, index: number, arr: any[]) => {
        const prev = arr.find(prevItem => 
          prevItem.service_request_type === item.service_request_type && 
          prevItem.year === item.year - 1 &&
          prevItem.ward === item.ward
        );
        const yoy = prev ? ((item.yearly_requests - prev.yearly_requests) / prev.yearly_requests) * 100 : 0;
        return {
          ...item,
          service_request_type: canonicalServiceName(item.service_request_type || ''),
          section: normalizeSection(item.section || ''),
          yoy_change: parseFloat(yoy.toFixed(1))
        };
      });

      return {
        serviceSummary: summaryWithYoY,
        monthlySummary: monthlyData.map((m: any) => ({
          ...m,
          service_request_type: canonicalServiceName(m.service_request_type || ''),
          section: normalizeSection(m.section || ''),
          request_count: m.monthly_requests || m.request_count || 0
        })),
        intersections: intersectionsData.map((item: any) => ({
          intersection_desc: item.intersection_desc || item.INTERSECTION_DESC || '',
          ward: item.ward || '',
          year: Number(item.year),
          service_request_type: canonicalServiceName(item.service_request_type || ''),
          section: normalizeSection(item.section || ''),
          yearly_requests: Number(item.yearly_requests || 0),
          lat: Number(item.lat || item.Latitude),
          long: Number(item.long || item.Longitude)
        })).filter((item: IntersectionRequest) => 
          item.intersection_desc &&
          item.ward &&
          Number.isFinite(item.lat) &&
          Number.isFinite(item.long)
        ),
        serviceDetails: serviceDetailsData.map((item: any) => ({
          service_request_type: item.service_request_type || '',
          section: item.section || '',
          total_requests: Number(item.total_requests || 0),
          requestswiinter: Number(item.requestswiinter || 0),
          '% Intersections': Number(item['% Intersections'] || 0),
          Description: item.Description || '',
          Conditions: item.Conditions || '',
          Timelines: item.Timelines || item.Timeline || '',
          Tip: item.Tip || '',
          Link: item.Link || ''
        }))
      };
    } catch (error) {
      console.error('Failed to load Toronto 311 data:', error);
      return { serviceSummary: [], monthlySummary: [], intersections: [], serviceDetails: [] };
    }
  },

  async loadGeoJson() {
    try {
      const res = await fetch('/src/data/city-wards-data-4326.geojson');
      return await res.json();
    } catch (error) {
      console.error('Failed to load GeoJSON:', error);
      return null;
    }
  }
};
