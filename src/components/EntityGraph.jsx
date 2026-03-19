// src/components/EntityGraph.jsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function EntityGraph({ analysis }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!analysis) return;
    const el = svgRef.current;
    const width = el.clientWidth;
    const height = el.clientHeight;

    // Build nodes and links
    const nodes = [];
    const links = [];
    const seen = new Set();

    // Event nodes
    analysis.structured_events?.forEach(evt => {
      nodes.push({ 
        id: evt.id, 
        label: evt.title, 
        type: 'event', 
        severity: evt.severity?.toLowerCase() 
      });
      seen.add(evt.id);

      // Entity nodes
      evt.entities?.forEach(entity => {
        const eid = `ENT:${entity}`;
        if (!seen.has(eid)) {
          nodes.push({ id: eid, label: entity, type: 'entity' });
          seen.add(eid);
        }
        links.push({ source: evt.id, target: eid, type: 'mentions' });
      });
    });

    // Connection links
    analysis.connections?.forEach(conn => {
      links.push({ 
        source: conn.from, 
        target: conn.to, 
        type: 'related', 
        label: conn.relationship 
      });
    });

    // Theme Config
    const colors = {
      critical: 'var(--danger)',
      high: 'var(--warn)',
      medium: 'var(--accent)',
      low: 'var(--success)',
      entity: 'var(--border3)',
      link: 'var(--border)',
      text: 'var(--text2)'
    };

    const nodeRadius = d => d.type === 'entity' ? 5 : 8;

    // Clear previous
    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Arrowhead Definition
    svg.append('defs').append('marker')
      .attr('id', 'arrow').attr('viewBox', '0 -5 10 10')
      .attr('refX', 20).attr('refY', 0)
      .attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', colors.link);

    const container = svg.append('g');

    // Zoom Behavior
    svg.call(d3.zoom().scaleExtent([0.5, 4]).on('zoom', (event) => {
      container.attr('transform', event.transform);
    }));

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(40));

    // Links Rendering
    const link = container.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke', colors.link)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', d => d.type === 'mentions' ? '4,4' : '0')
      .attr('marker-end', d => d.type === 'related' ? 'url(#arrow)' : null);

    // Nodes Rendering
    const node = container.append('g').selectAll('g')
      .data(nodes).join('g')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Node Background Polish
    node.append('circle')
      .attr('r', d => nodeRadius(d) + 3)
      .attr('fill', 'var(--bg)')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1);

    // Core Node
    node.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', d => d.type === 'entity' ? colors.entity : (colors[d.severity] || colors.medium))
      .attr('filter', 'blur(1px)')
      .attr('opacity', 0.8);

    // Node Labels
    node.append('text')
      .attr('dy', d => nodeRadius(d) + 14)
      .attr('text-anchor', 'middle')
      .attr('class', 'label-mono')
      .attr('font-size', '8px')
      .attr('fill', colors.text)
      .text(d => d.label.length > 20 ? d.label.slice(0, 18) + '…' : d.label);

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-30 select-none bg-[var(--bg)]">
        <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center mb-4">
           <div className="w-1 h-1 bg-[var(--text3)] rounded-full animate-ping" />
        </div>
        <span className="label-mono text-[10px] tracking-[0.2em]">STRUCTURED_GRAPH_PENDING</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[var(--bg)]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--text) 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />
      
      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 p-3 bg-[var(--bg2)]/80 border border-[var(--border)] rounded-[var(--radius)] z-10 backdrop-blur-sm">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
               <span className="label-mono text-[8px]">Event Node</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[var(--border3)]" />
               <span className="label-mono text-[8px]">Entity Node</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-4 h-[1px] bg-[var(--border)] border-t border-dashed" />
               <span className="label-mono text-[8px]">Mention link</span>
            </div>
         </div>
      </div>

      <svg 
        ref={svgRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
