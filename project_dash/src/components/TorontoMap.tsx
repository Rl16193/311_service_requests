import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { AnimatePresence, motion } from 'motion/react';

interface TorontoMapProps {
  geoJson: any;
  wardTotals: Record<number, number>;
  selectedWard?: string;
  onWardSelect?: (ward: string) => void;
}

const TorontoMap: React.FC<TorontoMapProps> = ({
  geoJson,
  wardTotals,
  selectedWard,
  onWardSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null);

  const colorScale = useMemo(() => {
    const values = Object.values(wardTotals || {}) as number[];
    const max = Math.max(...values, 1);
    return d3.scaleSequential(d3.interpolateBlues).domain([0, max]);
  }, [wardTotals]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setSize({
        width: Math.max(rect.width, 320),
        height: Math.max(rect.height, 330)
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!geoJson || !svgRef.current || size.width === 0 || size.height === 0) return;

    const svg = d3.select(svgRef.current)
      .attr('width', size.width)
      .attr('height', size.height)
      .attr('viewBox', `0 0 ${size.width} ${size.height}`);

    svg.selectAll('*').remove();

    const padding = 18;
    const projection = d3.geoMercator().fitExtent(
      [[padding, padding], [size.width - padding, size.height - padding]],
      geoJson
    );
    const path = d3.geoPath().projection(projection);

    svg.append('g')
      .selectAll('path')
      .data(geoJson.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        const wardId = Number(d.properties.AREA_SHORT_CODE);
        const value = wardTotals?.[wardId] ?? 0;
        return value > 0 ? colorScale(value) : '#f8fafc';
      })
      .attr('stroke', (d: any) => d.properties.AREA_NAME === selectedWard ? '#2563eb' : '#94a3b8')
      .attr('stroke-width', (d: any) => d.properties.AREA_NAME === selectedWard ? 2.5 : 0.7)
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('class', 'transition-all duration-300 cursor-pointer hover:fill-blue-100')
      .on('mouseover', (event, d: any) => {
        const wardId = Number(d.properties.AREA_SHORT_CODE);
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          name: d.properties.AREA_NAME,
          count: wardTotals?.[wardId] ?? 0
        });
      })
      .on('mousemove', (event) => {
        setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
      })
      .on('mouseout', () => setTooltip(null))
      .on('click', (_event, d: any) => {
        onWardSelect?.(d.properties.AREA_NAME);
      });
  }, [geoJson, wardTotals, colorScale, selectedWard, onWardSelect, size]);

  return (
    <div ref={containerRef} className="relative h-full min-h-[330px] w-full">
      <svg ref={svgRef} className="block h-full w-full overflow-visible" />

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'fixed',
              left: tooltip.x + 10,
              top: tooltip.y + 10,
              pointerEvents: 'none'
            }}
            className="z-50 bg-slate-900 text-white shadow-2xl rounded-xl p-4 text-sm min-w-[200px] backdrop-blur-sm bg-opacity-95 border border-slate-700"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-700 pb-1.5">{tooltip.name}</div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-300">Total Requests</span>
              <span className="font-mono text-blue-400 font-bold text-base">{tooltip.count.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-[9px] text-slate-500 italic">Click to view ward details</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TorontoMap;
