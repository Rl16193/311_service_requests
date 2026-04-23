import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SERVICE_COLORS } from '../constants/dashboard';

interface TemporalAreaChartProps {
  data: any[];
  serviceKeys: string[];
  selectedService: string;
}

const TemporalAreaChart: React.FC<TemporalAreaChartProps> = ({ data, serviceKeys, selectedService }) => {
  return (
    <div className="xl:col-span-3 bg-white rounded-xl custom-shadow metric-card p-5 flex flex-col min-h-[360px]">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Temporal Distribution</h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em]">Seasonality Analysis</p>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SERVICE_COLORS[0]} stopOpacity={0.24}/>
                <stop offset="95%" stopColor={SERVICE_COLORS[0]} stopOpacity={0}/>
              </linearGradient>
              {serviceKeys.map((service, idx) => (
                <linearGradient key={service} id={`serviceColor${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SERVICE_COLORS[idx % SERVICE_COLORS.length]} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={SERVICE_COLORS[idx % SERVICE_COLORS.length]} stopOpacity={0.04}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#f8fafc', fontSize: '11px', fontWeight: 600 }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }} />
            {selectedService !== 'All' ? (
              <Area type="monotone" dataKey="count" name={selectedService} stroke={SERVICE_COLORS[0]} strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            ) : (
              serviceKeys.map((service, idx) => (
                <Area
                  key={service}
                  stackId="1"
                  type="monotone"
                  dataKey={service}
                  stroke={SERVICE_COLORS[idx % SERVICE_COLORS.length]}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#serviceColor${idx})`}
                />
              ))
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemporalAreaChart;
