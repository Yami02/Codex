import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
  CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
  AdditiveDescriptions, NodeAttributesDict
} from '../magicConstants';

import EdgeVisual from "./EdgeVisual";
import { getNodeRadius } from "./EdgeVisual";
const MiniatureCanvas = ({ graph, radius, auraColor = '#00a8ff', orbitDash = 'none', edgeColorMode = 'auto', customEdgeColor = '#00a8ff', isGlobalRotating = false, globalRotationSpeed = '120s' }: any) => {
      if (!graph || !graph.nodes) return null;
      
      const maxLayer = useMemo(() => {
        let max = 1;
        graph.nodes.forEach(n => { if (n.type !== NodeType.CORE && n.layer > max) max = n.layer; });
        return max;
      }, [graph]);
      
      const baseRadius = 130; 
      const layerSpacing = 100; 
      const maxOrbitRadius = baseRadius + ((maxLayer - 1) * layerSpacing);
      const originalRadius = maxOrbitRadius + 60;
      
      const scale = (radius * 0.85) / originalRadius;

      const coreNode = graph.nodes.find(n => n.type === NodeType.CORE);
      const nodePositions = new Map();

      if (coreNode) nodePositions.set(coreNode.id, { x: 0, y: 0 });

      for (let L = 1; L <= maxLayer; L++) {
        const nodesInLayer = graph.nodes.filter(n => n.type !== NodeType.CORE && n.layer === L);
        const currentRadius = baseRadius + ((L - 1) * layerSpacing);
        const numOrbiting = nodesInLayer.length;
        
        nodesInLayer.forEach((node, index) => {
          const angle = (index * (360 / numOrbiting)) - 90 + (node.angleOffset || 0); 
          const radians = (angle * Math.PI) / 180;
          nodePositions.set(node.id, { x: currentRadius * Math.cos(radians), y: currentRadius * Math.sin(radians) });
        });
      }

      const orbitRings = [];
      for (let L = 1; L <= maxLayer; L++) { orbitRings.push(baseRadius + ((L - 1) * layerSpacing)); }

      return (
        <g transform={`scale(${scale})`}>
          <g className={isGlobalRotating ? "spin-ring-slow" : ""} style={{ transformOrigin: `0px 0px`, animationDuration: isGlobalRotating ? globalRotationSpeed : undefined }}>
          {orbitRings.map((r, i) => (
            <g key={`orb_${i}`}>
              <circle cx={0} cy={0} r={r - 45} stroke={auraColor} strokeWidth="2" fill="none" opacity="0.5" strokeDasharray={orbitDash} className={i % 2 === 0 ? "spin-ring" : "spin-ring-fast"} />
              <circle cx={0} cy={0} r={r + 45} stroke={auraColor} strokeWidth="1" fill="none" opacity="0.3" strokeDasharray={orbitDash} className={i % 2 === 0 ? "spin-ring-fast" : "spin-ring"} />
            </g>
          ))}

          {(graph.edges || []).map(edge => {
            const pos1 = nodePositions.get(edge.sourceId);
            const pos2 = nodePositions.get(edge.targetId);
            if (!pos1 || !pos2) return null;
            const r1 = getNodeRadius(graph, edge.sourceId);
            const r2 = getNodeRadius(graph, edge.targetId);
            return <EdgeVisual key={edge.id} edge={edge} pos1={pos1} pos2={pos2} r1={r1} r2={r2} viewMode={true} edgeColorMode={edgeColorMode} customEdgeColor={customEdgeColor} />;
          })}

          {graph.nodes.map(node => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;
            
            if (node.type === NodeType.CORE) {
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
                  <circle r={45} fill="#192a56" stroke={coreColor} strokeWidth="4" />
                  <text textAnchor="middle" dy="-0.1em" fill="#fff" fontSize="36" style={{fontFamily: 'Times New Roman'}}>{CoreRunes[node.element]}</text>
                </g>
              );
            }
            if (node.type === NodeType.ADDITIVE) {
              return (
               <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                 <circle r={35} fill="#2f3640" stroke="#7f8fa6" strokeWidth="3" />
                 <text textAnchor="middle" dy="0.1em" fill="#e1b12c" fontSize="30" style={{fontFamily: 'Times New Roman'}}>{AdditiveRunes[node.additiveType]}</text>
               </g>
              );
            }
            if (node.type === NodeType.SUBCIRCLE || node.type === NodeType.KERNEL) {
              const isK = node.type === NodeType.KERNEL;
              const subStroke = isK ? "#00d2ff" : "#e84393";
              const subFill = isK ? "#000" : "#111";
              return (
                <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  {isK ? (
                    <polygon points="45,0 22.5,39 -22.5,39 -45,0 -22.5,-39 22.5,-39" fill={subFill} stroke={subStroke} strokeWidth="4" filter="url(#strongNeon)" className="kernel-pulse" />
                  ) : (
                    <circle r={45} fill={subFill} stroke={subStroke} strokeWidth="4" strokeDasharray="none" />
                  )}
                  {isK && <polygon points="51,0 25.5,44 -25.5,44 -51,0 -25.5,-44 25.5,-44" fill="none" stroke={subStroke} strokeWidth="2" opacity="0.5" className="spin-ring" style={{ transformOrigin: '0 0' }} />}
                  {!isK && <circle r={51} fill="none" stroke={subStroke} strokeWidth="2" opacity="0.5" />}
                  <MiniatureCanvas graph={node.magicGraph} radius={45} auraColor={isK ? subStroke : auraColor} orbitDash={orbitDash} edgeColorMode={edgeColorMode} customEdgeColor={customEdgeColor} isGlobalRotating={isGlobalRotating} globalRotationSpeed={globalRotationSpeed} />
                  {isK ? <polygon points="45,0 22.5,39 -22.5,39 -45,0 -22.5,-39 22.5,-39" fill="rgba(0,0,0,0.1)" stroke="none" /> : <circle r={45} fill="rgba(0,0,0,0.1)" stroke="none" />}
                </g>
              );
            }
          })}
          </g>
        </g>
      );
    };
export default MiniatureCanvas;