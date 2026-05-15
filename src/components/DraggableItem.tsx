import React from 'react';
import { 
  NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
  CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
  AdditiveDescriptions, NodeAttributesDict
} from '../magicConstants';

interface DraggableItemProps { type: any; name: any; label?: any; className?: any; onAdd?: any; }

const elementColors: Record<string, { color: string, glow: string }> = {
  'FOGO': { color: '#e63946', glow: 'rgba(230, 57, 70, 0.8)' },
  'AGUA': { color: '#457b9d', glow: 'rgba(69, 123, 157, 0.8)' },
  'LUZ': { color: '#fca311', glow: 'rgba(252, 163, 17, 0.8)' },
  'SOMBRA': { color: '#7209b7', glow: 'rgba(114, 9, 183, 0.8)' },
  'TERRA': { color: '#588157', glow: 'rgba(88, 129, 87, 0.8)' },
  'AR': { color: '#a8dadc', glow: 'rgba(168, 218, 220, 0.8)' },
  'COMPOR': { color: '#e0a96d', glow: 'rgba(224, 169, 109, 0.8)' },
  'DECOMPOR': { color: '#d90429', glow: 'rgba(217, 4, 41, 0.8)' },
};

const DraggableItem = ({ type, name, label, className, onAdd }: DraggableItemProps) => {
  const handleDragStart = (e: any) => { e.dataTransfer.setData('application/json', JSON.stringify({ type, name })); };
  const rune = type === NodeType.CORE || type === NodeType.KERNEL ? CoreRunes[name] : (type === NodeType.ADDITIVE) ? AdditiveRunes[name] : null;
  
  const isVial = type === NodeType.CORE;
  const vialColor = isVial ? elementColors[name]?.color || '#ffffff' : '';
  const vialGlow = isVial ? elementColors[name]?.glow || 'rgba(255,255,255,0.6)' : '';

  const isInkwell = type === NodeType.ADDITIVE;

  const isSubcircle = type === NodeType.SUBCIRCLE;

  if (isVial) {
     return (
        <div 
           draggable 
           onDragStart={handleDragStart}
           onClick={(e) => { e.preventDefault(); onAdd && onAdd(type, name); }}
           className={`magic-flask z-10 mb-6 mx-auto ${className || ''}`}
           style={{ '--element-color': vialColor } as React.CSSProperties}
           title={name}
        >
           {/* The pot opening (ellipse) */}
           <div className="flask-opening"></div>
           
           {/* Inner liquid and waves */}
           <div className="flask-liquid-container">
               <div className="flask-liquid-waves"></div>
           </div>

           {/* Floating Rune */}
           <div className="absolute inset-0 flex items-center justify-center pt-2 pointer-events-none">
              <span className="font-cinzel text-3xl font-bold relative z-10 opacity-70 transition-all duration-300 text-white drop-shadow-md" style={{ textShadow: `0 0 15px ${vialGlow}, 0 0 30px ${vialGlow}` }}>{rune}</span>
           </div>

           {/* Diegetic Label Strip */}
           <div className="flask-label">
              {label || name}
           </div>
        </div>
     );
  }

  if (isInkwell) {
     return (
        <div className={`obsidian-pot-wrapper z-10 mb-4 mx-auto ${className || ''}`}>
           <div 
              draggable 
              onDragStart={handleDragStart}
              onClick={(e) => { e.preventDefault(); onAdd && onAdd(type, name); }}
              className="obsidian-pot"
              title={name}
           >
               <div className="obsidian-liquid-container">
                  <span className="obsidian-rune">{rune}</span>
               </div>
           </div>
           
           {/* Diegetic Label Strip */}
           <div className="flask-label" style={{ bottom: '-10px' }}>
              {label || name}
           </div>
        </div>
     );
  }

  if (isSubcircle) {
     return (
        <div 
           draggable 
           onDragStart={handleDragStart}
           onClick={(e) => { e.preventDefault(); onAdd && onAdd(type, name); }}
           className={`relative flex flex-col items-center justify-center w-32 h-12 cursor-pointer group z-10 mx-auto transition-transform duration-300 hover:scale-105 ${className || ''}`}
        >
           {/* Wax Seal / Scroll style for Subcircle */}
           <div className="relative w-full h-full bg-[#dcd0b3] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.6)] border border-[#8b5a2b]/30">
              <div className="absolute -left-2 top-1.5 w-8 h-8 rounded-full bg-[#7a0000] border border-[#a00000] shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_0_8px_rgba(0,0,0,0.8)] group-hover:bg-[#9a0000] transition-colors duration-300 flex items-center justify-center transform -rotate-12">
                 <span className="text-[10px] text-yellow-500 opacity-60">✺</span>
              </div>
              <span className="font-cinzel text-xs font-bold text-[#1a120b] uppercase ml-4">{label || name}</span>
           </div>
        </div>
     );
  }

  return (
    <div 
      className={`draggable-item ${className || ''}`} 
      draggable 
      onDragStart={handleDragStart}
      onClick={(e) => { e.preventDefault(); onAdd && onAdd(type, name); }}
      style={{ cursor: 'pointer', userSelect: 'none', touchAction: 'manipulation' }}
    >
      <span style={{ pointerEvents: 'none', flex: 1 }}>{label || name}</span>
      {rune && <span className="runic-text" style={{ marginLeft: '8px', pointerEvents: 'none' }}>{rune}</span>}
    </div>
  );
};
export default DraggableItem;