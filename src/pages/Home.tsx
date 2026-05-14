import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  const menuItems = [
    { name: 'Grimório Lógico (Codex)', path: '/codex', desc: 'Forge magias com a precisão matemática dos círculos rúnicos e algorítmicos.', color: '#047857', sides: 3 },
    { name: 'Estudo Naturalista', path: '/naturalista', desc: 'Dicionário orgânico de palavras de poder e intenção livre.', color: '#b91c1c', sides: 4 },
    { name: 'O Grande Tomo', path: '/livro-magias', desc: 'Acesse feitiços prontos forjados por arquimagos da comunidade.', color: '#1d4ed8', sides: 5 },
    { name: 'Bestiário Arcano', path: '/livro-monstros', desc: 'Consulte a anatomia mágica e táticas de abominações.', color: '#d97706', sides: 6 },
    { name: 'Criação de Almas', path: '/fichas', desc: 'Desperte a essência e os atributos do seu portador.', color: '#6d28d9', sides: 7 },
    { name: 'Forja de Mundos', path: '/criarmundo', desc: 'Entrelace os fios do destino para criar novos reinos.', color: '#0f766e', sides: 8 },
  ];

  const activeColor = hoveredItem !== null ? menuItems[hoveredItem].color : '#4a3728';

  const paperTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`;

  const getPolygonPoints = (sides: number) => {
    const radius = 85;
    const cx = 100;
    const cy = 100;
    let points = "";
    for(let i=0; i<sides; i++){
       const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
       const x = cx + radius * Math.cos(angle);
       const y = cy + radius * Math.sin(angle);
       points += `${x},${y} `;
    }
    return points.trim();
  };

  return (
    <div 
      className="min-h-screen w-full relative flex items-center justify-center font-serif text-[#3e2723] overflow-hidden"
      style={{ backgroundColor: '#eaddc5', backgroundImage: paperTexture }}
      onMouseMove={handleMouseMove}
    >
      <style>{`
        .hand-drawn-border {
          border: 1px solid rgba(74, 55, 40, 0.4);
          border-radius: 2px 255px 3px 25px / 255px 5px 225px 3px;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow linear infinite;
        }
        .ink-text {
          text-shadow: 0px 0px 1px rgba(74, 55, 40, 0.3);
        }
      `}</style>
      
      {/* Manchas de papel / envelhecimento */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50 z-0" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(109,19,19,0.06) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(74,55,40,0.1) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.03) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.06) 100%)' }} />

      {/* Silhueta do Dragão com Paralaxe */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center z-0 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px) scale(1.1)` }}
      >
        <svg viewBox="0 0 512 512" fill="currentColor" className="w-full max-w-[800px] h-auto text-black">
          <path d="M256 0c-15.6 0-30.8 1.4-45.5 4C219.8 19.3 224 40.2 224 64c0 10.3-1.6 20.3-4.5 29.8 20.9 9.8 34.5 31.9 34.5 56.2 0 17.6-7 33.6-18.4 45.4C261 210.5 288 238.3 288 272c0 14.5-5.1 27.9-13.7 38.4C295.3 325 316.5 352 320 352c16 0 32-15.6 32-32 0-33.1 28.3-60.8 62.1-63.5-3.8-3.4-7.4-6.9-11.1-10.3-25-24.1-39-56-39-90.2 0-70.7 57.3-128 128-128 6.5 0 12.9.5 19.1 1.4-1.2-1.9-2.5-3.8-3.9-5.7L507.2 22.3C445.6-12 366 11.9 320 64c-13.8 15.6-25 33.9-33 54C275.9 111.4 266.3 103 256 103s-19.9 8.3-25.9 22.4l.2.2c-.1-.1-.2-.2-.3-.3C223.7 151 202.9 160 180.2 160c-26.4 0-51-11.8-67.4-31.5-6.8 28.1-23.7 52.8-48.4 68.6 15 15.3 24.1 36.3 24.1 58.9v48L51.8 359c-32.5 18-51.8 52.3-51.8 89v56c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-32c0-10.9 3.5-21 9.4-29.3C52.6 461 68 480 88.5 480c25.4 0 46.8-17.7 54.4-41.5 5.2 11.9 14.1 21.9 25 28.8 13.9 8.9 30.5 12.7 46.6 9.8 15.1-6.1 28.4-16.1 38.3-28.7 18.2-22.9 25.1-51.8 21.4-80.1l.8-.3c18.5 24 45 42 75.6 51 0-8.8 7.2-16 16-16h40c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16s-16-7.2-16-16h-40c0-16.1 12.1-29.6 27.8-31.8-6.1-39.7-32.1-73-68.5-88.6C348.6 409.8 403 448 464 448c26.5 0 53-10.6 73.2-31.8L536.8 416h23.2v-21.7z"/>
        </svg>
      </div>

      {/* Main Container / Book Spread Style */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row h-full py-12 px-6 lg:px-16 items-center">
        
        {/* Left Side: Index Items */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 md:pr-12">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-cinzel text-5xl lg:text-6xl font-black text-[#4a3728] tracking-wider mb-2 ink-text uppercase">Codex Arcana</h1>
            
            {/* Hand-drawn divider */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <div className="w-16 h-[1px] bg-[#4a3728] opacity-50"></div>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a3728" strokeWidth="1" className="opacity-70">
                 <path d="M12 2L15 10L22 12L15 14L12 22L9 14L2 12L9 10L12 2Z" />
               </svg>
               <div className="w-16 h-[1px] bg-[#4a3728] opacity-50"></div>
            </div>
            
            <p className="text-xl lg:text-2xl text-[#5c4a3d] italic">O Compêndio Definitivo de Manipulação Etérea</p>
          </div>

          <nav className="flex flex-col space-y-4">
            {menuItems.map((item, idx) => (
              <Link 
                key={idx}
                to={item.path}
                className="group relative block w-full text-left outline-none hand-drawn-border p-4 transition-all duration-300 hover:bg-[#4a3728]/5"
                onMouseEnter={() => setHoveredItem(idx)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h2 
                    className="font-cinzel text-xl lg:text-2xl font-bold tracking-widest transition-colors duration-500 uppercase ink-text"
                    style={{ color: hoveredItem === idx ? item.color : '#4a3728' }}
                  >
                    {item.name}
                  </h2>
                </div>
                <p className="text-[#645344] text-sm lg:text-md pt-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.desc}
                </p>
                
                {/* Custom animated underline */}
                <div className="absolute bottom-[-1px] left-[5%] right-[5%] h-[2px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div 
                    className="w-full h-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side: Magic Circle */}
        <div className="w-full md:w-1/2 flex items-center justify-center mt-16 md:mt-0 relative">
          
          <div className="relative w-[320px] h-[320px] lg:w-[450px] lg:h-[450px] flex items-center justify-center">
             
             {/* Glow effect */}
             <div 
               className="absolute w-2/3 h-2/3 rounded-full blur-3xl mix-blend-multiply transition-colors duration-700 ease-in-out pointer-events-none"
               style={{ backgroundColor: activeColor, opacity: hoveredItem !== null ? 0.3 : 0.05 }}
             />

             {/* Outer Runes */}
             <svg viewBox="0 0 200 200" className="absolute w-full h-full opacity-60 pointer-events-none">
                <defs>
                   <path id="runePath" d="M 100, 100 m -95, 0 a 95,95 0 1,1 190,0 a 95,95 0 1,1 -190,0" />
                </defs>
                <circle cx="100" cy="100" r="95" fill="none" stroke="#4a3728" strokeWidth="0.5" strokeDasharray="2 4" />
                <text className="font-cinzel text-[7px] tracking-[4px] uppercase fill-[#4a3728] opacity-80" dy="-2">
                   <textPath href="#runePath" startOffset="0%">
                      ignis • aqua • terra • ventus • lux • umbra • aether • tempus •
                   </textPath>
                   <textPath href="#runePath" startOffset="50%">
                      ignis • aqua • terra • ventus • lux • umbra • aether • tempus •
                   </textPath>
                </text>
             </svg>

             {/* Slow Outer Circle */}
             <svg 
               viewBox="0 0 200 200" 
               className="absolute w-[90%] h-[90%] animate-spin-slow transition-colors duration-700 ease-in-out drop-shadow-md pointer-events-none"
               style={{ animationDuration: '40s', stroke: activeColor }}
             >
                <circle cx="100" cy="100" r="90" fill="none" strokeWidth="0.5" opacity="0.4" />
                <circle cx="100" cy="100" r="86" fill="none" strokeWidth="1" strokeDasharray="10 5" opacity="0.6" />
                <circle cx="100" cy="100" r="82" fill="none" strokeWidth="0.5" opacity="0.4" />
                
                {/* Always-on inner geometry (subtle) */}
                <polygon points={getPolygonPoints(12)} fill="none" strokeWidth="0.2" opacity="0.2" />
             </svg>

             {/* Inner Dynamic Polygon */}
             <svg 
               viewBox="0 0 200 200" 
               className="absolute w-[75%] h-[75%] animate-spin-reverse-slow transition-colors duration-700 ease-in-out drop-shadow-lg pointer-events-none"
               style={{ animationDuration: '25s', stroke: activeColor }}
             >
                <circle cx="100" cy="100" r="85" fill="none" strokeWidth="0.5" opacity="0.5" />
                
                {hoveredItem !== null && (
                   <polygon 
                     points={getPolygonPoints(menuItems[hoveredItem].sides)} 
                     fill="none" 
                     strokeWidth="1.5" 
                     opacity="0.8" 
                     className="transition-all duration-300"
                   />
                )}
                {hoveredItem !== null && (
                   <polygon 
                     points={getPolygonPoints(menuItems[hoveredItem].sides)} 
                     fill="none" 
                     strokeWidth="0.5" 
                     opacity="0.4" 
                     transform="rotate(180 100 100)"
                     className="transition-all duration-300"
                   />
                )}

                {/* Default state when nothing hovered */}
                {hoveredItem === null && (
                   <g opacity="0.4" strokeWidth="0.5">
                     <polygon points={getPolygonPoints(3)} fill="none" />
                     <polygon points={getPolygonPoints(3)} fill="none" transform="rotate(60 100 100)" />
                     <circle cx="100" cy="100" r="42.5" fill="none" strokeDasharray="2 4" />
                   </g>
                )}
             </svg>

             {/* Center Core */}
             <div 
               className="absolute w-4 h-4 rounded-full transition-all duration-500 shadow-md pointer-events-none"
               style={{ 
                 backgroundColor: hoveredItem !== null ? 'transparent' : '#4a3728',
                 border: hoveredItem !== null ? `2px solid ${activeColor}` : 'none',
                 boxShadow: hoveredItem !== null ? `0 0 15px ${activeColor}` : 'none',
                 opacity: 0.8
               }}
             />

          </div>

        </div>
      </div>
    </div>
  );
};

