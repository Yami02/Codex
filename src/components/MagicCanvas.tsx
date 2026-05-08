import React, { useState, useRef, useEffect } from 'react';
import { MagicGraph, NodeType, CoreElement, MagicEdge, EdgeType } from '../types/magic';

interface MagicCanvasProps {
  graph: MagicGraph;
  width?: number;
  height?: number;
}

export const MagicCanvas: React.FC<MagicCanvasProps> = ({ graph, width = 800, height = 800 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number, y: number }>>(new Map());

  // Re-calculate positions when graph changes
  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const mainRadius = Math.min(width, height) * 0.3;
    const positions = new Map<string, { x: number, y: number }>();

    const coreNodes = graph.nodes.filter(n => n.type === NodeType.CORE);
    const orbitingNodes = graph.nodes.filter(n => n.type !== NodeType.CORE);

    // If no nodes, just return
    if (graph.nodes.length === 0) {
      setNodePositions(positions);
      return;
    }

    // Distribute core nodes in a smaller inner circle if multiple
    if (coreNodes.length === 1) {
      positions.set(coreNodes[0].id, { x: centerX, y: centerY });
    } else if (coreNodes.length > 1) {
      coreNodes.forEach((node, index) => {
        const angle = (index * (360 / coreNodes.length)) - 90;
        const radians = (angle * Math.PI) / 180;
        const x = centerX + 50 * Math.cos(radians);
        const y = centerY + 50 * Math.sin(radians);
        positions.set(node.id, { x, y });
      });
    }

    const numOrbiting = orbitingNodes.length;
    orbitingNodes.forEach((node, index) => {
      const angle = (index * (360 / Math.max(numOrbiting, 1))) - 90;
      const radians = (angle * Math.PI) / 180;
      const x = centerX + mainRadius * Math.cos(radians);
      const y = centerY + mainRadius * Math.sin(radians);
      positions.set(node.id, { x, y });
    });

    setNodePositions(positions);
  }, [graph, width, height]);

  const handlePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.preventDefault();
    setDragging(nodeId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNodePositions(prev => new Map(prev.set(dragging, { x, y })));
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  // 4. Renderizador de Conectivos (Linhas)
  const renderEdge = (edge: MagicEdge) => {
    const pos1 = nodePositions.get(edge.sourceId);
    const pos2 = nodePositions.get(edge.targetId);
    
    if (!pos1 || !pos2) return null;

    let strokeDasharray = '';
    let strokeWidth = 2;
    let stroke = '#7f8fa6'; // Default (Cinza Metálico)
    let extraStyle = null;

    switch (edge.type) {
      case EdgeType.AND: // -- (Lógica de adição)
        strokeWidth = 3;
        stroke = '#00a8ff';
        break;
      case EdgeType.OR: // <==> (Dourada - ramificação)
        strokeDasharray = '5,5';
        stroke = '#fbc531';
        break;
      case EdgeType.XOR: // <--> (Vermelha - exclusividade)
        stroke = '#e84118';
        extraStyle = (
          <circle cx={(pos1.x + pos2.x)/2} cy={(pos1.y + pos2.y)/2} r={6} fill="#e84118" />
        );
        break;
      case EdgeType.SEQUENCIA: // --> (Verde - fluxo)
        strokeWidth = 3;
        stroke = '#4cd137';
        break;
      case EdgeType.ATRIBUICAO: // ==c (Contém característica)
        strokeWidth = 5;
        stroke = '#9c88ff';
        break;
    }

    return (
      <g key={edge.id}>
        <line 
          x1={pos1.x} y1={pos1.y} 
          x2={pos2.x} y2={pos2.y} 
          stroke={stroke} 
          strokeWidth={strokeWidth} 
          strokeDasharray={strokeDasharray}
        />
        {extraStyle /* Exibe um "x" ou círculo no meio se for Negação */}
      </g>
    );
  };

  return (
    <svg 
      ref={svgRef}
      width={width} 
      height={height} 
      style={{ backgroundColor: '#111', borderRadius: '8px', boxShadow: '0px 0px 20px rgba(0,0,0,0.5)', touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Círculo Principal da Magia (Placa Mãe) */}
      <circle cx={width/2} cy={height/2} r={250} stroke="#353b48" strokeWidth="3" fill="rgba(0, 168, 255, 0.05)" />
      
      {/* Círculo Interno Estético */}
      <circle cx={width/2} cy={height/2} r={230} stroke="#2f3640" strokeWidth="1" fill="none" strokeDasharray="5, 15" />
      <circle cx={width/2} cy={height/2} r={265} stroke="#2f3640" strokeWidth="1" fill="none" />

      {/* Renderiza as Arestas (Conectivos) */}
      {graph.edges.map(renderEdge)}

      {/* Renderiza os Nós */}
      {graph.nodes.map(node => {
        const pos = nodePositions.get(node.id);
        if (!pos) return null;

        // Se for o Núcleo
        if (node.type === NodeType.CORE) {
          const core = node as import('../types/magic').CoreNode;
          
          // Cores baseadas no elemento
          let coreColor = '#00a8ff';
          if (core.element === CoreElement.FOGO) coreColor = '#e84118';
          if (core.element === CoreElement.DECOMPOR) coreColor = '#c23616';
          if (core.element === CoreElement.TERRA) coreColor = '#7158e2';
          if (core.element === CoreElement.AR) coreColor = '#dff9fb';
          if (core.element === CoreElement.SOMBRA) coreColor = '#2f3640';
          if (core.element === CoreElement.LUZ) coreColor = '#fbc531';
          if (core.element === CoreElement.AGUA) coreColor = '#0097e6';
          if (core.element === CoreElement.COMPOR) coreColor = '#4cd137';

          return (
            <g 
              key={node.id} 
              transform={`translate(${pos.x}, ${pos.y})`}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              style={{ cursor: dragging === node.id ? 'grabbing' : 'grab' }}
            >
              <circle r={45} fill="#192a56" stroke={coreColor} strokeWidth="4" filter="url(#glow)" />
              <text textAnchor="middle" dy=".3em" fill="#fff" fontSize="14" fontWeight="bold">
                {core.element}
              </text>
            </g>
          );
        }

        // Se for Aditivo
        if (node.type === NodeType.ADDITIVE) {
          const add = node as import('../types/magic').AdditiveNode;
          return (
            <g 
              key={node.id} 
              transform={`translate(${pos.x}, ${pos.y})`}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              style={{ cursor: dragging === node.id ? 'grabbing' : 'grab' }}
            >
              {/* Moldura do Aditivo */}
              <circle r={35} fill="#2f3640" stroke="#7f8fa6" strokeWidth="2" />
              <text textAnchor="middle" dy="-.2em" fill="#f5f6fa" fontSize="11" fontWeight="bold">
                {add.additiveType.replace('_', ' ')}
              </text>
              <text textAnchor="middle" dy="1.2em" fill="#00a8ff" fontSize="9">
                {add.family}
              </text>
            </g>
          );
        }

        // Se for Subcírculo
        if (node.type === NodeType.SUBCIRCLE) {
          return (
            <g 
              key={node.id} 
              transform={`translate(${pos.x}, ${pos.y})`}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              style={{ cursor: dragging === node.id ? 'grabbing' : 'grab' }}
            >
              <circle r={40} fill="#2d3436" stroke="#e84393" strokeWidth="3" strokeDasharray="6,4" filter="url(#glow)" />
              <text textAnchor="middle" dy=".3em" fill="#fd79a8" fontSize="11" fontWeight="bold">
                SUBCÍRCULO
              </text>
            </g>
          );
        }
      })}
    </svg>
  );
};
