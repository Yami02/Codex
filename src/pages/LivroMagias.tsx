import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, PenTool, Sparkles } from 'lucide-react';

type ElementType = 'fogo' | 'agua' | 'luz' | 'sombra';

interface MagicElement {
  id: ElementType;
  name: string;
  color: string;
  glowColor: string;
  label: string;
  symbol: string;
}

const elements: MagicElement[] = [
  { id: 'luz', name: 'Lux', color: '#ffea00', glowColor: 'rgba(255, 234, 0, 0.6)', label: 'Brilho Astral', symbol: '✧' },
  { id: 'fogo', name: 'Ignis', color: '#cc0000', glowColor: 'rgba(255, 51, 0, 0.6)', label: 'Chama Arruinada', symbol: '❂' },
  { id: 'agua', name: 'Aqua', color: '#0055cc', glowColor: 'rgba(0, 170, 255, 0.6)', label: 'Lágrima Abissal', symbol: '⎈' },
  { id: 'sombra', name: 'Umbra', color: '#4b0082', glowColor: 'rgba(122, 0, 255, 0.6)', label: 'Pó do Vazio', symbol: '⚸' },
];

export const LivroMagias = () => {
  const [activeElement, setActiveElement] = useState<ElementType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const activeElementData = elements.find(e => e.id === activeElement);

  const handleElementSelect = (id: ElementType) => {
    setActiveElement(id);
    setIsDrawing(true);
    setTimeout(() => {
      setIsDrawing(false);
    }, 2000); // 2 seconds animation
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1a120b] overflow-hidden flex font-serif selection:bg-[#5c3a21] selection:text-[#f4ebd8]">
      {/* Global lighting effect - torch animation */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 animate-pulse-slow z-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_80%)]" />
        <div className="absolute inset-0 bg-[#ff9900] mix-blend-color-burn opacity-10" />
      </div>
      
      {/* Table texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-[0.85] pointer-events-none" />

      {/* Return Button */}
      <Link to="/" className="absolute top-6 left-6 z-50 text-[#d4af37] flex items-center gap-2 hover:text-[#ffea00] transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-cinzel text-lg tracking-wider font-bold">Retornar ao Hub</span>
      </Link>

      {/* LEFT PANEL: Alchemy Shelf */}
      <div className="relative w-96 h-full border-r-[12px] border-[#2a1a10] border-double bg-[#1a120b]/90 shadow-[15px_0_40px_rgba(0,0,0,0.9)] z-20 flex flex-col items-center py-24 px-8 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-multiply pointer-events-none" />
        
        <h2 className="font-blackletter text-5xl text-[#d4af37] mb-12 tracking-widest text-center border-b-[2px] border-[#d4af37]/30 pb-6 w-full drop-shadow-md">
           A Mesa do Conjurador
        </h2>

        <div className="w-full flex-1 flex flex-col gap-12 justify-center relative mt-8">
           {/* Wooden Shelf Backgrounds */}
           <div className="absolute top-[18%] w-[110%] -left-[5%] h-5 bg-[#2a1a10] shadow-[0_8px_20px_rgba(0,0,0,0.9)] rounded-sm border-t border-[#3a2a20]" />
           <div className="absolute top-[43%] w-[110%] -left-[5%] h-5 bg-[#2a1a10] shadow-[0_8px_20px_rgba(0,0,0,0.9)] rounded-sm border-t border-[#3a2a20]" />
           <div className="absolute top-[68%] w-[110%] -left-[5%] h-5 bg-[#2a1a10] shadow-[0_8px_20px_rgba(0,0,0,0.9)] rounded-sm border-t border-[#3a2a20]" />
           <div className="absolute top-[93%] w-[110%] -left-[5%] h-5 bg-[#2a1a10] shadow-[0_8px_20px_rgba(0,0,0,0.9)] rounded-sm border-t border-[#3a2a20]" />

           {elements.map((el, i) => (
             <div 
                key={el.id} 
                className={`relative flex flex-col items-center justify-end h-32 cursor-pointer group z-10 transition-transform duration-500 ease-out ${activeElement === el.id ? 'scale-110 -translate-y-2' : 'hover:scale-105 hover:-translate-y-1'}`} 
                onClick={() => handleElementSelect(el.id)}
             >
                 {/* Glow effect when active */}
                 <div className={`absolute bottom-6 w-24 h-24 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none ${activeElement === el.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} style={{ backgroundColor: el.color }} />

                 {/* Vial Body (Glass) */}
                 <div className="relative w-16 h-28 border-[3px] border-[rgba(255,255,255,0.15)] rounded-b-2xl rounded-t-md shadow-[inset_0_0_20px_rgba(0,0,0,0.9),_0_15px_15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col justify-end items-center backdrop-blur-sm" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.05))'}}>
                     
                     {/* The Liquid Ink */}
                     <div className="w-full relative transition-all duration-1000 ease-in-out" style={{ 
                         height: activeElement === el.id ? '85%' : '45%', 
                         backgroundColor: el.color, 
                         boxShadow: `0 0 25px ${el.glowColor}, inset 0 0 15px rgba(0,0,0,0.6)`
                      }}>
                        {/* Splashes / bubbles */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/40" />
                        <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-white/50" />
                        <div className="absolute top-4 right-3 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                     </div>
                 </div>
                 
                 {/* Cork Cap & Neck */}
                 <div className="absolute top-[-8px] flex flex-col items-center">
                    <div className="w-8 h-5 bg-[#5c3a21] border-2 border-[#2a1a10] rounded-sm shadow-md" />
                    <div className="w-10 h-3 bg-[#4a2a1a] rounded-sm mt-[1px] shadow-sm border border-[#2a1a10]" />
                 </div>

                 {/* Parchment Label wrapped around string */}
                 <div className="absolute top-12 left-1/2 transform -translate-x-1/2 -rotate-3 w-24 h-10 bg-[#e3d7c1] border border-[#8b5a2b] shadow-lg flex items-center justify-center pointer-events-none group-hover:rotate-0 transition-transform duration-300">
                      {/* String binding */}
                      <div className="absolute h-[2px] w-full bg-[#3a1a05] top-1/2 shadow-sm" />
                      <span className="font-cinzel text-sm font-bold text-[#2a1a10] relative z-10 tracking-widest">{el.name}</span>
                 </div>
             </div>
           ))}
        </div>
      </div>

      {/* CENTER SPACE: The Great Parchment */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-12 relative">
          
          {/* Ink pots and feather aside the parchment (static deco, sitting on wood table) */}
          <div className="absolute top-20 right-24 w-20 h-20 bg-[#1a120b] border-[3px] border-[#3a2010] rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center">
             <div className="w-14 h-14 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(255,255,255,0.1)]" />
             <PenTool className="absolute -top-16 -left-8 w-32 h-32 text-[#d4af37] transform rotate-[130deg] drop-shadow-[5px_5px_5px_rgba(0,0,0,0.8)] opacity-90 stroke-[1.5]" />
          </div>

          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10 rounded-full" />

          {/* THE GREAT PARCHMENT */}
          <motion.div 
             className="relative w-full max-w-[1000px] h-full max-h-[90vh] bg-[#e6d8c3] shadow-[20px_30px_60px_rgba(0,0,0,0.7),_inset_0_0_120px_rgba(139,90,43,0.4)] rounded-[4px] p-16 flex flex-col items-center"
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
          >
             {/* Parchment Textures & Stains */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply opacity-80 pointer-events-none rounded-[4px]" />
             
             {/* Burned Edges simulation using shadows inside */}
             <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(58,26,5,0.6)] rounded-[4px] pointer-events-none" />

             {/* Stains */}
             <div className="absolute top-12 left-10 w-32 h-32 bg-[#5c3a21] rounded-full blur-[30px] opacity-15 pointer-events-none mix-blend-multiply" />
             <div className="absolute top-20 left-20 w-12 h-12 border-[5px] border-[#5c3a21] rounded-full opacity-10 pointer-events-none mix-blend-multiply" />
             <div className="absolute top-24 left-24 w-8 h-8 border-[2px] border-[#5c3a21] rounded-full opacity-[0.08] pointer-events-none mix-blend-multiply" />
             
             <div className="absolute bottom-24 right-16 w-48 h-48 bg-[#8b0000] rounded-full blur-[50px] opacity-[0.06] pointer-events-none mix-blend-overlay" />
             <div className="absolute bottom-12 right-32 w-16 h-16 bg-[#2a1a10] rounded-full blur-[20px] opacity-10 pointer-events-none mix-blend-multiply" />

             {/* SVG Filter for Ink Turbulence */}
             <svg className="hidden">
               <filter id="ink-spread" x="-10%" y="-10%" width="120%" height="120%">
                 <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="3" result="noise" />
                 <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                 <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
                 <feMerge>
                   <feMergeNode in="blurred" />
                   <feMergeNode in="SourceGraphic" />
                 </feMerge>
               </filter>
             </svg>

             {/* Title of the scroll */}
             <h1 className="font-blackletter text-6xl text-[#2a1a10] mb-8 text-center drop-shadow-sm mix-blend-multiply z-10">
                O Grande Pergaminho de Gênese
             </h1>

             {/* THE MAGIC CIRCLE CANVAS */}
             <div className="relative flex-1 w-full max-w-[500px] flex items-center justify-center mb-12">
                 
                 {/* Base Lines - always visible, faded ink */}
                 <svg className="absolute w-[500px] h-[500px] pointer-events-none mix-blend-multiply opacity-30" viewBox="0 0 500 500" style={{ filter: 'url(#ink-spread)' }}>
                    <circle cx="250" cy="250" r="248" stroke="#3a2010" strokeWidth="1" fill="none" strokeDasharray="6,6" />
                    <circle cx="250" cy="250" r="190" stroke="#3a2010" strokeWidth="1.5" fill="none" />
                    <line x1="2" y1="250" x2="498" y2="250" stroke="#3a2010" strokeWidth="0.5" />
                    <line x1="250" y1="2" x2="250" y2="498" stroke="#3a2010" strokeWidth="0.5" />
                    {/* Inner star subtle trace */}
                    <polygon points="250,60 414.5,345 85.5,345" stroke="#3a2010" strokeWidth="0.5" fill="none" />
                    <polygon points="250,440 85.5,155 414.5,155" stroke="#3a2010" strokeWidth="0.5" fill="none" />
                 </svg>

                 {/* Animated Ink / Glow depending on selected element */}
                 <AnimatePresence mode="wait">
                    {activeElement && (
                       <motion.div
                          key={activeElement}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-multiply"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5 } }}
                          transition={{ duration: 1.5 }}
                       >
                           {/* Glow Effect behind ink */}
                           <div className="absolute inset-0 rounded-full blur-[40px] opacity-30 mix-blend-screen" style={{ backgroundColor: activeElementData?.color }} />
                           
                           {/* Drawing the magic geometry */}
                           <svg className="absolute w-[500px] h-[500px]" viewBox="0 0 500 500" style={{ filter: 'url(#ink-spread)' }}>
                              <motion.circle 
                                 cx="250" cy="250" r="240" 
                                 stroke={activeElementData?.color} 
                                 strokeWidth="4" 
                                 fill="none"
                                 initial={{ pathLength: 0 }}
                                 animate={{ pathLength: 1 }}
                                 transition={{ duration: 2.5, ease: "easeInOut" }}
                              />
                              <motion.circle 
                                 cx="250" cy="250" r="185" 
                                 stroke={activeElementData?.color} 
                                 strokeWidth="3" 
                                 fill="none" 
                                 strokeDasharray="15, 20"
                                 initial={{ rotate: 0 }}
                                 animate={{ rotate: 360 }}
                                 transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                 style={{ originX: "250px", originY: "250px" }}
                              />

                              {/* Geometry appearing after main circles */}
                              <motion.g
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: 2, duration: 1.5 }}
                                 style={{ originX: "250px", originY: "250px" }}
                                 stroke={activeElementData?.color}
                                 fill="none"
                                 strokeWidth="2.5"
                              >
                                 <polygon points="250,65 410,340 90,340" />
                                 <polygon points="250,435 90,160 410,160" />
                                 
                                 {/* Specific elemental accents */}
                                 {activeElement === 'fogo' && (
                                    <path d="M 250 160 Q 280 200 250 250 Q 220 200 250 160" fill={activeElementData?.color} fillOpacity="0.3" stroke="none" />
                                 )}
                                 {activeElement === 'agua' && (
                                    <path d="M 250 340 Q 280 300 250 250 Q 220 300 250 340" fill={activeElementData?.color} fillOpacity="0.3" stroke="none" />
                                 )}
                                 {activeElement === 'luz' && (
                                    <circle cx="250" cy="250" r="60" fill={activeElementData?.color} fillOpacity="0.2" stroke="none" />
                                 )}
                                 {activeElement === 'sombra' && (
                                    <polygon points="250,190 280,250 250,310 220,250" fill={activeElementData?.color} fillOpacity="0.3" stroke="none" />
                                 )}
                              </motion.g>
                              
                              {/* Runes / text floating on the rings */}
                              <motion.g
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 transition={{ delay: 2.5, duration: 1 }}
                                 fill={activeElementData?.color}
                                 fontSize="18"
                                 fontFamily="Cinzel"
                                 letterSpacing="4"
                                 fontWeight="bold"
                                 style={{ originX: "250px", originY: "250px" }}
                              >
                                  {/* Small runic inscriptions rotating counter clockwise */}
                                  <motion.text x="35" y="255" animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ originX: "250px", originY: "250px" }}>
                                     INCANTATIO VIRTUS AETERNA PRIMORDIALIS
                                  </motion.text>
                              </motion.g>
                           </svg>
                       </motion.div>
                    )}
                 </AnimatePresence>

                 {/* Center Element Icon */}
                 <AnimatePresence>
                     {activeElement && (
                        <motion.div 
                           className="absolute text-[120px] font-blackletter drop-shadow-xl z-10 mix-blend-multiply"
                           style={{ color: activeElementData?.color, filter: 'url(#ink-spread)' }}
                           initial={{ opacity: 0, scale: 0, rotate: 180 }}
                           animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
                           exit={{ opacity: 0, scale: 0.5 }}
                           transition={{ delay: 1, duration: 1.5, type: 'spring' }}
                        >
                           {activeElementData?.symbol}
                        </motion.div>
                     )}
                 </AnimatePresence>

                 {/* Pen Writing Animation over the canvas */}
                 <AnimatePresence>
                    {isDrawing && activeElement && (
                       <motion.div
                          className="absolute z-30 pointer-events-none drop-shadow-2xl"
                          initial={{ top: '60%', left: '-50%', opacity: 0 }}
                          animate={{ 
                              top: ['60%', '20%', '80%', '10%', '60%'], 
                              left: ['-20%', '20%', '80%', '80%', '120%'],
                              opacity: [0, 1, 1, 1, 0],
                              rotate: [-10, 20, -20, 10, 0]
                          }}
                          transition={{ duration: 2.5, ease: "easeInOut" }}
                       >
                          <PenTool className="w-32 h-32 text-[#1a120b] transform rotate-[130deg] filter drop-shadow-[5px_10px_10px_rgba(0,0,0,0.8)]" />
                          <Sparkles className="w-12 h-12 absolute -bottom-8 -left-8 animate-ping" style={{ color: activeElementData?.color }} />
                       </motion.div>
                    )}
                 </AnimatePresence>
             </div>

             {/* TRANSLATION SECTION: The Lower Scroll */}
             <div className="relative w-full border-t-2 border-[#5c3a21]/40 pt-8 mt-4 flex flex-col z-10">
                 {/* Decorative thread line */}
                 <div className="absolute top-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8b5a2b] to-transparent opacity-80" />
                 
                 <h3 className="font-cinzel text-xl font-bold text-[#5c3a21] mb-2 uppercase tracking-[0.3em] text-center opacity-80 mix-blend-multiply">
                    — Anotações Departamentais —
                 </h3>
                 
                 <div className="font-caveat text-4xl leading-[1.4] text-[#1a120b] mix-blend-multiply flex-1 w-full pl-8 pr-16 mt-4 opacity-[0.85] relative">
                     {activeElement ? (
                        <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: 2.5, duration: 1.5 }}
                        >
                           {/* A bit of marginalia/scribble */}
                           <div className="absolute -left-6 top-2 text-[#8b0000] text-xl transform -rotate-12 opacity-60">* Atenção!</div>
                           
                           A trama de <span className="font-bold underline decoration-wavy decoration-2 underline-offset-4" style={{ textDecorationColor: activeElementData?.color }}>{activeElementData?.name}</span> foi selada na matriz.
                           {activeElement === 'fogo' && " As flutuações térmicas estão excedendo o parâmetro. Tentar reforçar a linha oeste do hexagrama com cinzas vulcânicas."}
                           {activeElement === 'agua' && " Notei que as correntes abissais estão drenando a umidade do papel. Precisarei usar um selante antes do próximo rito."}
                           {activeElement === 'luz' && " A luminescência estabilizou, embora o olho direito ainda doa. Não projetar sem os óculos de quartzo escuro da próxima vez."}
                           {activeElement === 'sombra' && " A gravidade no centro do pergaminho aumentou. O frasco caiu e não quebrou... flutuou. Encantador e aterrorizante."}
                        </motion.div>
                     ) : (
                        <div className="opacity-50 italic text-center w-full mt-8">
                           "O pergaminho aguarda... Molhe a pena em uma das essências à esquerda para canalizar a Gênese."
                        </div>
                     )}
                     
                     {/* Signature / Marguerite Note */}
                     <div className="absolute -bottom-6 right-8 transform rotate-[-4deg] font-caveat text-2xl text-[#5c3a21] opacity-70 border-t border-[#5c3a21]/30 pt-1">
                        - C. A.
                     </div>
                 </div>
             </div>
          </motion.div>
      </div>

    </div>
  );
};
