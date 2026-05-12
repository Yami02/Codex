import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
  CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
  AdditiveDescriptions, NodeAttributesDict
} from '../magicConstants';

import EdgeVisual from "./EdgeVisual";
import MiniatureCanvas from "./MiniatureCanvas";
import { getNodeRadius } from "./EdgeVisual";
const MagicCanvas = ({ graph, viewMode, onNodeClick, onNodeDelete, onLayerChange, onAngleChange, onEdgeClick, onEdgeDelete, onKernelToggle, onBackgroundClick, selectedNodeId, auraColor = '#00a8ff', orbitDash = 'none', edgeColorMode = 'auto', customEdgeColor = '#00a8ff', isGlobalRotating = false, globalRotationSpeed = '120s' }: any) => {
      const maxLayer = useMemo(() => {
        let max = 1;
        graph.nodes.forEach(n => { if (n.type !== NodeType.CORE && n.layer > max) max = n.layer; });
        return max;
      }, [graph]);

      const baseRadius = 130; 
      const layerSpacing = 100; 
      const maxOrbitRadius = baseRadius + ((maxLayer - 1) * layerSpacing);
      const canvasSize = (maxOrbitRadius + 150) * 2; 
      
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      const innerShieldRadius = 70;

      const coreNode = graph.nodes.find(n => n.type === NodeType.CORE);
      const nodePositions = new Map();

      if (coreNode) nodePositions.set(coreNode.id, { x: centerX, y: centerY });

      for (let L = 1; L <= maxLayer; L++) {
        const nodesInLayer = graph.nodes.filter(n => n.type !== NodeType.CORE && n.layer === L);
        const currentRadius = baseRadius + ((L - 1) * layerSpacing);
        const numOrbiting = nodesInLayer.length;
        
        nodesInLayer.forEach((node, index) => {
          const angle = (index * (360 / numOrbiting)) - 90 + (node.angleOffset || 0); 
          const radians = (angle * Math.PI) / 180;
          nodePositions.set(node.id, { x: centerX + currentRadius * Math.cos(radians), y: centerY + currentRadius * Math.sin(radians) });
        });
      }

      const orbitRings = [];
      for (let L = 1; L <= maxLayer; L++) { orbitRings.push(baseRadius + ((L - 1) * layerSpacing)); }

      return (
        <svg 
          viewBox={`0 0 ${canvasSize} ${canvasSize}`}
          width="100%" 
          height="100%"
          style={{ cursor: (selectedNodeId && !viewMode) ? 'crosshair' : 'default', transition: 'all 0.5s', touchAction: 'none', display: 'block' }}
          onClick={viewMode ? null : onBackgroundClick}
        >
          <defs>
            <filter id="neon"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="strongNeon"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="selectedGlow"><feGaussianBlur stdDeviation="8" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="kernelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#00d2ff', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: '#000', stopOpacity: 1}} />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="transparent" />

          <g className={viewMode && isGlobalRotating ? "spin-ring-slow" : ""} style={{ transformOrigin: `${centerX}px ${centerY}px`, animationDuration: isGlobalRotating ? globalRotationSpeed : undefined }}>

          {orbitRings.map((r, i) => (
            <g key={`orbit_${i}`} style={{ pointerEvents: 'none' }}>
              {viewMode ? (
                <>
                  <circle cx={centerX} cy={centerY} r={r - 45} stroke={auraColor} strokeWidth="2" fill="none" opacity="0.5" strokeDasharray={orbitDash} className={i % 2 === 0 ? "spin-ring" : "spin-ring-fast"} style={{ transformOrigin: `${centerX}px ${centerY}px` }} />
                  <circle cx={centerX} cy={centerY} r={r + 45} stroke={auraColor} strokeWidth="1" fill="none" opacity="0.3" strokeDasharray={orbitDash} className={i % 2 === 0 ? "spin-ring-fast" : "spin-ring"} style={{ transformOrigin: `${centerX}px ${centerY}px` }} />
                </>
              ) : (
                <>
                  <circle cx={centerX} cy={centerY} r={r - 45} stroke="#2f3640" strokeWidth="1" fill="none" strokeDasharray="5,15" />
                  <circle cx={centerX} cy={centerY} r={r + 45} stroke="#2f3640" strokeWidth="1" fill="none" strokeDasharray="5,15" />
                </>
              )}
              {!viewMode && <text x={centerX} y={centerY - r + 3} fill="#485460" fontSize="10" textAnchor="middle">Camada {i + 1}</text>}
            </g>
          ))}

          <g style={{ pointerEvents: 'none' }}>
            <circle cx={centerX} cy={centerY} r={maxOrbitRadius + 60} stroke={viewMode ? auraColor : "#192a56"} strokeWidth="2" fill={viewMode ? "rgba(0, 168, 255, 0.03)" : "rgba(0, 168, 255, 0.01)"} strokeDasharray={viewMode ? orbitDash : "15,10"} className={viewMode ? "spin-ring-fast" : ""} style={{ transformOrigin: `${centerX}px ${centerY}px`, opacity: viewMode ? 0.6 : 1 }} />
            {viewMode && <circle cx={centerX} cy={centerY} r={maxOrbitRadius + 66} stroke={auraColor} strokeWidth="1" fill="none" opacity="0.4" strokeDasharray={orbitDash} className="spin-ring" style={{ transformOrigin: `${centerX}px ${centerY}px` }} />}
            
            {!viewMode && <circle cx={centerX} cy={centerY} r={maxOrbitRadius + 55} stroke="#353b48" strokeWidth="1" fill="none" />}
          </g>

          {(graph.edges || []).map(edge => {
            const pos1 = nodePositions.get(edge.sourceId);
            const pos2 = nodePositions.get(edge.targetId);
            if (!pos1 || !pos2) return null;
            const r1 = getNodeRadius(graph, edge.sourceId);
            const r2 = getNodeRadius(graph, edge.targetId);
            return <EdgeVisual key={edge.id} edge={edge} pos1={pos1} pos2={pos2} r1={r1} r2={r2} viewMode={viewMode} edgeColorMode={edgeColorMode} customEdgeColor={customEdgeColor} onEdgeClick={onEdgeClick} onEdgeDelete={onEdgeDelete} />;
          })}

          {graph.nodes.filter(n => n.type !== NodeType.CORE).map(node => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id && !viewMode;
            const selectionGlow = isSelected ? <circle r={65} fill="rgba(251, 197, 49, 0.1)" stroke="#fbc531" strokeWidth="3" filter="url(#selectedGlow)" style={{ pointerEvents: 'none' }} /> : null;

            let visual = null;

            if (node.type === NodeType.ADDITIVE) {
              visual = (
                <g>
                  {!viewMode && <circle r={35} fill="#2f3640" stroke="#7f8fa6" strokeWidth="2" />}
                  {viewMode && <circle r={35} fill="#050505" stroke="none" />}
                  
                  {/* Container da runa pode rotacionar individualmente se quisermos futuramente, mas a prop é angleOffset */}
                  <g>
                    <text textAnchor="middle" dy={viewMode ? "0.3em" : "0.1em"} fill="#e1b12c" fontSize={viewMode ? "36" : "24"} style={{ fontFamily: 'Times New Roman', pointerEvents: 'none', filter: viewMode ? 'drop-shadow(0 0 10px #e1b12c)' : 'drop-shadow(0 0 5px rgba(225, 177, 44, 0.5))' }}>
                      {AdditiveRunes[node.additiveType]}
                    </text>
                  </g>
                  {!viewMode && (
                    <text textAnchor="middle" dy="2.5em" fill="#7f8fa6" fontSize="6" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                      {node.type === NodeType.KERNEL ? "KERNEL" : node.additiveType.replace('_', ' ')}
                    </text>
                  )}
                </g>
              );
            }
            else if (node.type === NodeType.SUBCIRCLE || node.type === NodeType.KERNEL) {
              const isK = node.type === NodeType.KERNEL;
              const subStroke = isK ? "#00d2ff" : "#e84393";
              const subFill = viewMode ? "#050505" : (isK ? "url(#kernelGradient)" : "#111");
              
              visual = (
                <g>
                  {isK && node.customMorphology && (
                    <g className={viewMode ? "spin-ring-fast" : ""} style={{ transformOrigin: '0 0' }}>
                      <circle r={76} fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
                      <circle r={56} fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
                      <path id={`morphology-path-${node.id}`} d="M 0, -66 A 66 66 0 1 1 0, 66 A 66 66 0 1 1 0, -66" fill="none" stroke="none" />
                      <text fill="#d4af37" fontSize={viewMode ? "10" : "8"} fontWeight="bold" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '4px', textTransform: 'uppercase', filter: viewMode ? 'drop-shadow(0 0 5px rgba(212,175,55,0.8))' : 'none', pointerEvents: 'none' }}>
                         <textPath href={`#morphology-path-${node.id}`} startOffset="50%" textAnchor="middle">
                           {Array(3).fill(node.customMorphology).join(' ✦ ')}
                         </textPath>
                      </text>
                    </g>
                  )}
                   {isK ? (
                     <polygon points="45,0 22.5,39 -22.5,39 -45,0 -22.5,-39 22.5,-39" fill={subFill} stroke={subStroke} strokeWidth="3" filter="url(#strongNeon)" className={viewMode ? "kernel-pulse" : ""} />
                   ) : (
                     <circle r={45} fill={subFill} stroke="#e84393" strokeWidth={viewMode ? "2" : "2"} strokeDasharray={viewMode ? "none" : "8,4"} filter="url(#neon)" className={viewMode ? "spin-ring-fast" : ""} style={{ transformOrigin: '0 0' }}/>
                   )}
                  
                  {viewMode && (
                    isK ? (
                       <polygon points="49,0 24.5,42.5 -24.5,42.5 -49,0 -24.5,-42.5 24.5,-42.5" fill="none" stroke={subStroke} strokeWidth="2" opacity="0.5" className="spin-ring" style={{ transformOrigin: '0 0' }} />
                    ) : (
                       <circle r={49} fill="none" stroke="#e84393" strokeWidth="1" opacity="0.4" className="spin-ring" style={{ transformOrigin: '0 0' }}/>
                    )
                  )}
                  <MiniatureCanvas graph={node.magicGraph} radius={viewMode ? 55 : 45} auraColor={isK ? subStroke : auraColor} orbitDash={orbitDash} edgeColorMode={edgeColorMode} customEdgeColor={customEdgeColor} />
                  {isK ? <polygon points="45,0 22.5,39 -22.5,39 -45,0 -22.5,-39 22.5,-39" fill="rgba(0,0,10,0.2)" stroke="none" /> : <circle r={45} fill="rgba(0,0,0,0.1)" stroke="none" />}
                </g>
              );
            }

            return (
              <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                {selectionGlow}
                
                <g 
                  className={viewMode ? "" : "interactive-element"} 
                  onClick={(e) => { if(!viewMode) { e.preventDefault(); e.stopPropagation(); onNodeClick && onNodeClick(node); } }}
                  onTouchStart={(e) => { if(!viewMode) { e.preventDefault(); e.stopPropagation(); onNodeClick && onNodeClick(node); } }}
                >
                  <circle r={60} fill="transparent" />
                  {visual}
                </g>
              </g>
            );
          })}

            <g style={{ pointerEvents: 'none' }}>
              {!viewMode && <circle cx={centerX} cy={centerY} r={innerShieldRadius} stroke="#353b48" strokeWidth="3" fill="none" />}
              <circle cx={centerX} cy={centerY} r={innerShieldRadius - 5} stroke={viewMode ? auraColor : "#2f3640"} strokeWidth="2" fill={viewMode ? "#050505" : "rgba(0,0,0,0.6)"} strokeDasharray={viewMode ? orbitDash : "4,4"} className={viewMode ? "spin-ring" : ""} style={{ transformOrigin: `${centerX}px ${centerY}px` }} />
              {viewMode && <circle cx={centerX} cy={centerY} r={innerShieldRadius - 10} stroke={auraColor} strokeWidth="1" fill="none" opacity="0.4" strokeDasharray={orbitDash} className="spin-ring-fast" style={{ transformOrigin: `${centerX}px ${centerY}px` }} />}
            </g>

            {graph.nodes.filter(n => n.type === NodeType.CORE).map(node => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;
              const isSelected = selectedNodeId === node.id && !viewMode;
              const selectionGlow = isSelected ? <circle r={65} fill="rgba(251, 197, 49, 0.1)" stroke="#fbc531" strokeWidth="3" filter="url(#selectedGlow)" style={{ pointerEvents: 'none' }} /> : null;
              let coreColor = '#00a8ff';
              if(node.element === CoreElement.FOGO) coreColor = '#e84118';
              if(node.element === CoreElement.TERRA) coreColor = '#c23616';
              if(node.element === CoreElement.AR) coreColor = '#dff9fb';
              if(node.element === CoreElement.AGUA) coreColor = '#0097e6';
              if(node.element === CoreElement.LUZ) coreColor = '#fbc531';
              if(node.element === CoreElement.SOMBRA) coreColor = '#2f3640';
              if(node.element === CoreElement.COMPOR) coreColor = '#4cd137';
              if(node.element === CoreElement.DECOMPOR) coreColor = '#8c7ae6';

              return (
                <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  {selectionGlow}
                  <g 
                    className={!viewMode ? "interactive-element" : ""} 
                    onClick={(e) => { if(!viewMode) { e.preventDefault(); e.stopPropagation(); onNodeClick && onNodeClick(node); } }}
                    onTouchStart={(e) => { if(!viewMode) { e.preventDefault(); e.stopPropagation(); onNodeClick && onNodeClick(node); } }}
                  >
                    <circle r={viewMode ? 70 : 60} fill="transparent" /> {/* Hit area expansion */}
                    <circle r={viewMode ? 60 : 45} fill={viewMode ? "#050505" : "#192a56"} stroke={viewMode ? "none" : coreColor} strokeWidth="4" filter={viewMode ? "none" : "url(#neon)"} />
                    {viewMode && <circle r={60} fill="transparent" stroke={coreColor} strokeWidth="1" strokeDasharray="8,8" className="spin-ring" style={{ transformOrigin: '0 0' }} />}
                    <text textAnchor="middle" dy={viewMode ? "0.35em" : "-0.1em"} fill={viewMode ? coreColor : "#fff"} fontSize={viewMode ? "42" : "24"} style={{ fontFamily: 'Times New Roman', pointerEvents: 'none', filter: viewMode ? `drop-shadow(0 0 15px ${coreColor})` : 'none' }}>
                      {CoreRunes[node.element]}
                    </text>
                    {!viewMode && (
                      <text textAnchor="middle" dy="2.2em" fill={coreColor} fontSize="8" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                        {node.element}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      );
    };
export default MagicCanvas;