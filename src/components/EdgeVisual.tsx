import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
  CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
  AdditiveDescriptions, NodeAttributesDict
} from '../magicConstants';

export const getNodeRadius = (graph: any, nodeId: any) => {
  const node = graph.nodes.find((n: any) => n.id === nodeId);
  if (!node) return 35;
  if (node.type === NodeType.ADDITIVE) return 35;
  return 45;
};
interface EdgeVisualProps { edge: any; pos1: any; pos2: any; r1: any; r2: any; viewMode?: any; edgeColorMode?: any; customEdgeColor?: any; onEdgeClick?: any; onEdgeDelete?: any; }
    const EdgeVisual = ({ edge, pos1, pos2, r1, r2, viewMode, edgeColorMode, customEdgeColor, onEdgeClick, onEdgeDelete }: EdgeVisualProps) => {
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const length = Math.sqrt(dx*dx + dy*dy) || 1;
      
      const startX = pos1.x + (dx/length) * r1;
      const startY = pos1.y + (dy/length) * r1;
      const endX = pos2.x - (dx/length) * r2;
      const endY = pos2.y - (dy/length) * r2;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const midX = (pos1.x + pos2.x) / 2;
      const midY = (pos1.y + pos2.y) / 2;

      let strokeDasharray = '', strokeWidth = 3, stroke = '#7f8fa6';
      let startMarker = null, endMarker = null;
      let isDoubleLine = false;

      if (edgeColorMode === 'custom') {
        stroke = customEdgeColor;
      } else {
        switch (edge.type) {
          case EdgeType.AND: stroke = '#00a8ff'; break;
          case EdgeType.OR: stroke = '#9c88ff'; break;
          case EdgeType.REVERSO: stroke = '#e84118'; break;
          case EdgeType.SE_ENTAO: stroke = '#fbc531'; break;
          case EdgeType.UNIAO: stroke = '#4cd137'; break;
          case EdgeType.ATRIBUICAO: stroke = '#e1b12c'; break;
          case EdgeType.CORRENTE: stroke = '#8c7ae6'; break;
          case EdgeType.XOR: stroke = '#e84118'; break;
        }
      }
      
      const pillColor = stroke;

      switch (edge.type) {
        case EdgeType.AND:
          // "--" conectividade e adição: just a simple line
          break;
        case EdgeType.OR:
          // "<==>"
          isDoubleLine = true;
          startMarker = <polygon points="6,-5 -4,0 6,5" fill={stroke} />;
          endMarker = <polygon points="-6,-5 4,0 -6,5" fill={stroke} />;
          break;
        case EdgeType.ATRIBUICAO:
          // "==c" atribuição
          isDoubleLine = true;
          endMarker = <path d="M 4,-5 A 5,5 0 0,0 4,5" fill="none" stroke={stroke} strokeWidth="2" />;
          break;
        case EdgeType.XOR:
          // "<-->"
          startMarker = <polygon points="6,-5 -4,0 6,5" fill={stroke} />;
          endMarker = <polygon points="-6,-5 4,0 -6,5" fill={stroke} />;
          break;
        case EdgeType.CORRENTE:
          // "==" depender dos gatilhos
          isDoubleLine = true;
          break;
        case EdgeType.SE_ENTAO:
          // "-->" se/então
          endMarker = <polygon points="-6,-5 4,0 -6,5" fill={stroke} />;
          break;
        case EdgeType.REVERSO: 
          endMarker = <path d="M -5,-5 L 5,5 M -5,5 L 5,-5" stroke={stroke} strokeWidth="2" fill="none" />;
          break;
        case EdgeType.UNIAO: 
          strokeWidth = 4;
          break;
      }

      const nx = -dy / length;
      const ny = dx / length;
      const offset = 2.5;

      return (
        <g key={edge.id}>
          {isDoubleLine ? (
            <>
              <line x1={startX + nx*offset} y1={startY + ny*offset} x2={endX + nx*offset} y2={endY + ny*offset} stroke={stroke} strokeWidth="2" style={{ pointerEvents: 'none', filter: viewMode ? `drop-shadow(0 0 5px ${stroke})` : 'none', opacity: viewMode ? 0.8 : 1 }} />
              <line x1={startX - nx*offset} y1={startY - ny*offset} x2={endX - nx*offset} y2={endY - ny*offset} stroke={stroke} strokeWidth="2" style={{ pointerEvents: 'none', filter: viewMode ? `drop-shadow(0 0 5px ${stroke})` : 'none', opacity: viewMode ? 0.8 : 1 }} />
            </>
          ) : (
            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={stroke} strokeWidth={strokeWidth} style={{ pointerEvents: 'none', filter: viewMode ? `drop-shadow(0 0 5px ${stroke})` : 'none', opacity: viewMode ? 0.8 : 1 }} />
          )}
          
          {startMarker && <g transform={`translate(${startX}, ${startY}) rotate(${angle})`} style={{ pointerEvents: 'none', filter: viewMode ? `drop-shadow(0 0 5px ${stroke})` : 'none' }}>{startMarker}</g>}
          {endMarker && <g transform={`translate(${endX}, ${endY}) rotate(${angle})`} style={{ pointerEvents: 'none', filter: viewMode ? `drop-shadow(0 0 5px ${stroke})` : 'none' }}>{endMarker}</g>}
          
          {!viewMode && onEdgeClick && (
            <g className="interactive-element" onClick={(e) => { e.stopPropagation(); onEdgeClick(edge); }} transform={`translate(${midX - 15}, ${midY})`}>
              <rect x="-22" y="-12" width="44" height="24" rx="12" fill="#1e272e" stroke={pillColor} strokeWidth="2" />
              <text textAnchor="middle" dy=".3em" fill="#fff" fontSize="10" fontWeight="bold" style={{ pointerEvents: 'none' }}>{EdgeSymbols[edge.type]}</text>
            </g>
          )}

          {!viewMode && onEdgeDelete && (
            <g className="interactive-element" onClick={(e) => { e.stopPropagation(); onEdgeDelete(edge); }} transform={`translate(${midX + 22}, ${midY})`}>
              <circle r="10" fill="#e84118" stroke="#fff" strokeWidth="1" />
              <text textAnchor="middle" dy=".3em" fill="#fff" fontSize="10" fontWeight="bold" style={{ pointerEvents: 'none' }}>X</text>
            </g>
          )}
        </g>
      );
    };
export default EdgeVisual;