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
           className={`relative flex flex-col items-center justify-end w-20 h-28 cursor-pointer group z-10 transition-transform duration-300 ease-out hover:scale-[1.15] hover:-translate-y-2 mb-6 ${className || ''}`}
        >
           {/* Glass Flask container */}
           <div className="relative w-16 h-20 rounded-b-2xl rounded-t-lg border-[3px] border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_5px_15px_rgba(255,255,255,0.2)] flex items-end justify-center overflow-hidden bg-black/40 backdrop-blur-sm">
               
               {/* Viscous liquid */}
               <div className="absolute bottom-0 w-full transition-all duration-300" style={{ height: '70%', backgroundColor: vialColor, boxShadow: `0 0 20px ${vialGlow}, inset 0 -10px 20px rgba(0,0,0,0.6)` }}>
                  
                  {/* Wave effect CSS */}
                  <div className="liquid-wave" style={{ filter: `drop-shadow(0 -2px 4px ${vialColor})` }}></div>
                   
                  {/* Element Specific Effects */}
                  {name === 'FOGO' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] mix-blend-overlay opacity-80 animate-[pulse_2s_infinite]" />}
                  {name === 'AGUA' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_20%,_rgba(255,255,255,0.4)_100%)] opacity-60 animate-[ping_3s_infinite]" />}
                  {name === 'AR' && <div className="absolute inset-0 bg-white/40 blur-md animate-[spin_4s_linear_infinite]" />}
                  {name === 'TERRA' && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/moss.png')] mix-blend-overlay opacity-70" />}
                  {name === 'SOMBRA' && <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,0,0,0.8)_180deg,transparent_360deg)] animate-[spin_6s_linear_infinite]" />}
                  {name === 'LUZ' && <div className="absolute inset-0 bg-white opacity-80 blur-sm animate-[pulse_1.5s_infinite]" />}
               </div>
               
               {/* Stopper & Neck Inner Shade */}
               <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-black/80 to-transparent"></div>
               <div className="absolute top-0 w-8 h-4 bg-[#4a2a1a] border border-[#2a1a10] rounded-b-sm shadow-inner"></div>

               {/* Inner Glow / Light reflection bounds */}
               <div className="absolute inset-0 rounded-b-2xl rounded-t-lg shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] pointer-events-none"></div>
               <div className="absolute right-2 top-2 bottom-6 w-1 rounded-full bg-white/30 blur-[1px]"></div>

               {/* Floating Rune */}
               <div className="absolute inset-0 flex items-center justify-center pt-4">
                 <span className="font-cinzel text-3xl font-bold relative z-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 text-white drop-shadow-md" style={{ textShadow: `0 0 15px ${vialGlow}, 0 0 30px ${vialGlow}` }}>{rune}</span>
               </div>
           </div>

           {/* Diegetic Label Strip placed firmly on the front of the pot */}
           <div className="absolute -bottom-3 bg-[#dcd0b3] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] border border-[#8b5a2b] px-3 py-1 text-[11px] font-bold text-[#2a1a10] uppercase tracking-widest shadow-[0_5px_10px_rgba(0,0,0,0.8)] z-20 whitespace-nowrap" style={{ fontFamily: '"EB Garamond", serif' }}>
              <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-[#5c3a21] border border-[#2a1a10] shadow-sm"></div>
              <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-[#5c3a21] border border-[#2a1a10] shadow-sm"></div>
              {label || name}
           </div>
        </div>
     );
  }

  if (isInkwell) {
     return (
        <div 
           draggable 
           onDragStart={handleDragStart}
           onClick={(e) => { e.preventDefault(); onAdd && onAdd(type, name); }}
           className={`relative flex flex-col items-center justify-center w-20 h-24 cursor-pointer group z-10 transition-transform duration-300 ease-out hover:scale-[1.15] hover:-translate-y-2 mb-4 ${className || ''}`}
        >
           {/* Top-down obsidian pot */}
           <div className="absolute w-16 h-16 rounded-full bg-[#0a0a0a] border-[3px] border-[#1a1a1a] shadow-[0_10px_15px_rgba(0,0,0,0.9),inset_0_-4px_10px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden">
               {/* Absolute black liquid */}
               <div className="relative w-14 h-14 rounded-full bg-black flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                  {/* Rune carved at the bottom, glowing through */}
                  <div className="absolute inset-0 flex items-center justify-center transform translate-y-1 scale-90 opacity-40 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-700">
                    <span className="font-cinzel text-2xl font-bold text-white blur-[0.5px]" style={{ textShadow: `0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8)` }}>{rune}</span>
                  </div>
               </div>
           </div>

           {/* Diegetic Label Strip placed firmly on the front of the pot */}
           <div className="absolute -bottom-1 bg-[#dcd0b3] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] border border-[#8b5a2b] px-3 py-1 text-[11px] font-bold text-[#2a1a10] uppercase tracking-widest shadow-[0_5px_10px_rgba(0,0,0,0.8)] z-20 whitespace-nowrap group-hover:scale-110 transition-transform" style={{ fontFamily: '"EB Garamond", serif' }}>
              <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-[#5c3a21] border border-[#2a1a10] shadow-sm"></div>
              <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-[#5c3a21] border border-[#2a1a10] shadow-sm"></div>
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