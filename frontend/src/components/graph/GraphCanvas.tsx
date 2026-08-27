import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import type { NetworkGraphData } from '../../types';
import { GraphToolbar } from './GraphToolbar';

interface GraphCanvasProps {
  graphData: NetworkGraphData;
  height?: string;
  selectedNodeId?: string;
  highlightNodeIds?: string[];
  highlightEdgeIds?: string[];
  onNodeClick?: (nodeId: string, nodeData: any) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graphData,
  height = '580px',
  selectedNodeId,
  highlightNodeIds = [],
  highlightEdgeIds = [],
  onNodeClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [layoutName, setLayoutName] = useState<string>('cose');
  const [suspiciousOnly, setSuspiciousOnly] = useState<boolean>(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [activeSelectedId, setActiveSelectedId] = useState<string | null>(selectedNodeId || null);

  // Initialize or update Cytoscape graph
  useEffect(() => {
    if (!containerRef.current) return;

    // Filter nodes & edges if suspiciousOnly or selectedRiskFilter active
    let filteredNodes = graphData.nodes || [];
    let filteredEdges = graphData.edges || [];

    if (suspiciousOnly) {
      filteredEdges = filteredEdges.filter(e => e.isSuspicious);
      const activeIds = new Set([
        ...filteredEdges.map(e => e.source),
        ...filteredEdges.map(e => e.target)
      ]);
      filteredNodes = filteredNodes.filter(n => activeIds.has(n.id) || n.id === graphData.targetId);
    }

    if (selectedRiskFilter !== 'ALL') {
      if (selectedRiskFilter === 'CRITICAL') {
        filteredNodes = filteredNodes.filter(n => n.riskLevel === 'CRITICAL');
      } else if (selectedRiskFilter === 'HIGH') {
        filteredNodes = filteredNodes.filter(n => n.riskLevel === 'CRITICAL' || n.riskLevel === 'HIGH');
      } else if (selectedRiskFilter === 'MEDIUM') {
        filteredNodes = filteredNodes.filter(n => n.riskLevel !== 'LOW');
      }
      const nodeSet = new Set(filteredNodes.map(n => n.id));
      filteredEdges = filteredEdges.filter(e => nodeSet.has(e.source) && nodeSet.has(e.target));
    }

    // Convert data into cytoscape elements
    const elements = [
      ...filteredNodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          node_type: n.nodeType,
          risk_level: n.riskLevel,
          risk_score: n.riskScore,
          is_fraud: n.isFraud,
          is_target: n.isTarget || n.id === graphData.targetId,
          amount: n.amount
        }
      })),
      ...filteredEdges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          relationship: e.relationship + (e.amount ? ` (₹${e.amount.toLocaleString()})` : ''),
          is_suspicious: e.isSuspicious,
          category: e.evidenceCategory
        }
      }))
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            color: '#0F172A',
            'font-size': '10px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'background-color': (node: any) => {
              const isFraud = node.data('is_fraud');
              const type = node.data('node_type');
              if (isFraud) return '#DC2626'; // Restrained Red
              if (type === 'MERCHANT') return '#7C3AED';
              if (type === 'DEVICE') return '#059669';
              if (type === 'IP') return '#D97706';
              return '#2563EB'; // Professional Blue
            },
            width: (node: any) => (node.data('is_target') ? 32 : 24),
            height: (node: any) => (node.data('is_target') ? 32 : 24),
            'border-width': 2,
            'border-color': '#FFFFFF',
            'border-opacity': 1,
            'transition-property': 'opacity, border-width, border-color',
            'transition-duration': 200
          }
        },
        {
          selector: 'edge',
          style: {
            width: (edge: any) => (edge.data('is_suspicious') ? 2.5 : 1.5),
            'line-color': (edge: any) => (edge.data('is_suspicious') ? '#DC2626' : '#94A3B8'),
            'target-arrow-color': (edge: any) => (edge.data('is_suspicious') ? '#DC2626' : '#94A3B8'),
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(relationship)',
            'font-size': '8px',
            'font-family': 'Inter, sans-serif',
            color: '#475569',
            'text-rotation': 'autorotate',
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'transition-property': 'opacity, width, line-color',
            'transition-duration': 200
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 3.5,
            'border-color': '#2563EB',
            'border-opacity': 1
          }
        }
      ],
      layout: {
        name: layoutName
      } as any
    });

    // Tap node handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const id = node.id();
      setActiveSelectedId(id);

      // Perform focus dimming
      applyFocusDimming(cy, id);

      if (onNodeClick) {
        onNodeClick(id, node.data());
      }
    });

    // Tap background handler (reset focus)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setActiveSelectedId(null);
        resetFocusDimming(cy);
      }
    });

    cyRef.current = cy;
  }, [graphData, layoutName, suspiciousOnly, selectedRiskFilter]);

  // Handle Evidence Item highlighting effect
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (highlightNodeIds.length > 0 || highlightEdgeIds.length > 0) {
      cy.batch(() => {
        cy.elements().style('opacity', 0.15);
        
        highlightNodeIds.forEach(id => {
          const ele = cy.getElementById(id);
          if (ele) {
            ele.style('opacity', 1.0);
            ele.style('border-color', '#DC2626');
            ele.style('border-width', 4);
          }
        });

        highlightEdgeIds.forEach(id => {
          const ele = cy.getElementById(id);
          if (ele) {
            ele.style('opacity', 1.0);
            ele.style('width', 3.5);
            ele.style('line-color', '#DC2626');
          }
        });
      });
    } else if (!activeSelectedId) {
      resetFocusDimming(cy);
    }
  }, [highlightNodeIds, highlightEdgeIds, activeSelectedId]);

  const applyFocusDimming = (cy: cytoscape.Core, targetId: string) => {
    const selNode = cy.getElementById(targetId);
    if (!selNode.length) return;

    const neighborhood = selNode.neighborhood().add(selNode);

    cy.batch(() => {
      cy.elements().style('opacity', 0.15);
      neighborhood.style('opacity', 1.0);
    });
  };

  const resetFocusDimming = (cy: cytoscape.Core) => {
    cy.batch(() => {
      cy.elements().style('opacity', 1.0);
      cy.nodes().style('border-color', '#FFFFFF');
      cy.nodes().style('border-width', 2);
    });
  };

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleReset = () => {
    setActiveSelectedId(null);
    if (cyRef.current) {
      resetFocusDimming(cyRef.current);
      cyRef.current.layout({ name: layoutName }).run();
    }
  };

  return (
    <div className="fintech-card graph-canvas-container" style={{ height, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Graph Filter & Action Toolbar */}
      <GraphToolbar
        layoutName={layoutName}
        setLayoutName={setLayoutName}
        suspiciousOnly={suspiciousOnly}
        setSuspiciousOnly={setSuspiciousOnly}
        selectedRiskFilter={selectedRiskFilter}
        setSelectedRiskFilter={setSelectedRiskFilter}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
        onReset={handleReset}
      />

      {/* Main Canvas Viewport */}
      <div style={{ flex: 1, position: 'relative', background: '#F8FAFC', width: '100%', height: '100%' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Legend Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '11px',
          display: 'flex',
          gap: '12px',
          pointerEvents: 'none',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} /> Normal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }} /> Fraud
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} /> Device
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706' }} /> IP
          </span>
        </div>
      </div>
    </div>
  );
};
