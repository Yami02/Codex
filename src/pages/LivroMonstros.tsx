import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Shield } from "lucide-react";

const MOCK_MONSTERS = [
  {
    id: 1,
    name: "Sombras",
    imageUrl: "https://images.unsplash.com/photo-1542442436-1e64627d3148?q=80&w=1000&auto=format&fit=crop",
    description: `A criatura parece ser uma manifestação direta do plano umbral. Sua forma flutua de maneira errática, e ao tocar objetos ou luz, ambos aparentam ser sugados em direção a um vácuo. Observações minuciosas revelam que a Sombra possui pseudo-pêndices gélidos.`,
    report: `"Não fazem som. O mago estava babando e a escuridão no rosto dela cresceu o dobro."`,
    baseCr: 1, baseAc: 12, baseHp: 16, conMod: 0, damageBaseStr: "1d6+2 for",
    damageDiceCount: 1, damageDiceSides: 6, damageBonus: 2, damageType: "força",
    speed: 40,
    abilities: [
      { name: "Toque Umbral", desc: "Seu toque devora a luz e o calor, causando necrose celular severa." },
      { name: "Passo das Sombras", desc: "Teletransporta-se entre áreas de escuridão profunda a curtas distâncias." }
    ]
  },
  {
    id: 2,
    name: "Porcos de Tetas",
    imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1000&auto=format&fit=crop",
    description: `Descrita como uma aberração anatômica ímpar. Carece de membros anteriores em favor de glândulas mamárias proeminentes cheias de gases inflamáveis que lhe concedem elevação e flutuação em voo rasante.`,
    report: `"Voavam batendo as banhas. O cheiro de enxofre... Perdi o apetite por dias."`,
    baseCr: 2, baseAc: 10, baseHp: 22, conMod: 2, damageBaseStr: "2d4+1 con",
    damageDiceCount: 2, damageDiceSides: 4, damageBonus: 1, damageType: "contundente",
    speed: 15,
    abilities: [
      { name: "Carga Plosiva", desc: "Inflamando seus gases internos, lança-se contra um alvo causando um grande impacto contundente e sônico." },
      { name: "Nuvem Nauseante", desc: "Após a morte, os gases estouram liberando um miasma venenoso sufocante na área." }
    ]
  },
  {
    id: 3,
    name: "Kimkris",
    imageUrl: "https://images.unsplash.com/photo-1629814421293-8da5b42d721f?q=80&w=1000&auto=format&fit=crop",
    description: `Trata-se primariamente de um parasita fúngico bioluminescente. Ele penetra hospedeiros mamíferos através do sistema respiratório, substituindo fluidos vitais por secreção corrosiva e expandindo a musculatura da vítima.`,
    report: `"O lobo nos olhou, a mandíbula brilhava em um tom amarelo vivo."`,
    baseCr: 3, baseAc: 13, baseHp: 18, conMod: 1, damageBaseStr: "1d8+3 acd",
    damageDiceCount: 1, damageDiceSides: 8, damageBonus: 3, damageType: "ácido",
    speed: 50,
    abilities: [
      { name: "Saliva Corrosiva", desc: "Expele um fluido gástrico modificado capaz de derreter metal e carne quase no mesmo ritmo." },
      { name: "Explosão de Esporos", desc: "Em resposta a ataques perfurantes, libera nuvens de fungos asfixiantes." }
    ]
  },
  {
    id: 4,
    name: "Grimgar",
    imageUrl: "https://images.unsplash.com/photo-1543329065-5c1cfba119c4?q=80&w=1000&auto=format&fit=crop",
    description: `A manifestação tática do Grimgar transcende um único hospedeiro. Estuda-se a hipótese de uma consciência de rede, operando em bando. A morte de uma unidade é instantaneamente registrada por todas as outras, tornando o grupo reativo a perigo.`,
    report: `"Queimei um corvo, mas os outros na árvore já sabiam de onde atirei. Eles sempre sabem."`,
    baseCr: 4, baseAc: 14, baseHp: 25, conMod: 1, damageBaseStr: "2d6+2 per",
    damageDiceCount: 2, damageDiceSides: 6, damageBonus: 2, damageType: "perfurante",
    speed: 60,
    abilities: [
      { name: "Estigma da Revoada", desc: "Um Grimgar abatido marca quem o matou com uma ressonância astral, tornando-se o alvo primordial de toda a revoada." },
      { name: "Bicada Cega", desc: "Mergulho predatório voltado unicamente a desferir golpes mortais nos nervos óticos da presa visando cegueira e dor severa." }
    ]
  },
  {
    id: 5,
    name: "Tecelão",
    imageUrl: "https://images.unsplash.com/photo-1505503072223-2895690b29ce?q=80&w=1000&auto=format&fit=crop",
    description: `Inseto colossal de endoesqueleto atípico. Produz seda com rigidez superior a ligas metálicas primitivas. Seus métodos de acasalamento e alimentação envolvem aprisionar presas biológicas em casulos até sua eventual conversão em biomassa.`,
    report: `"Costurava o recruta com tendões duros como aço enquanto ele ainda gritava."`,
    baseCr: 5, baseAc: 15, baseHp: 40, conMod: 2, damageBaseStr: "2d8+3 per",
    damageDiceCount: 2, damageDiceSides: 8, damageBonus: 3, damageType: "perfurante",
    speed: 30,
    abilities: [
      { name: "Seda Rígida", desc: "Dispara uma rajada de fios pegajosos e pesados que enredam o alvo instantaneamente, calcificando-se em segundos." },
      { name: "Mandíbulas Serrilhadas", desc: "Prende-se à vítima imobilizada e mastiga em movimentos circulares para liquefazer os órgãos internos."}
    ]
  },
];

const ProceduralDirt = ({ index }: { index: number }) => {
  return (
    <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60 z-40">
      {index % 2 === 0 && <div className="absolute top-1/4 left-[30%] w-[400px] h-[300px] bg-[#4a2a1a] opacity-30 rounded-full blur-[60px]"></div>}
      
      {index % 3 === 0 && (
         <>
           <div className="absolute top-[60%] right-[30%] w-10 h-10 bg-[#4a0000] opacity-80 rounded-full blur-[2px]"></div>
           <div className="absolute top-[62%] right-[28%] w-4 h-5 bg-[#4a0000] opacity-90 rounded-full blur-[1px]"></div>
           <div className="absolute top-[58%] right-[33%] w-6 h-6 bg-[#4a0000] opacity-70 rounded-full blur-[2px]"></div>
         </>
      )}
      
      {index % 7 === 0 && (
        <div className="absolute bottom-[20%] left-[45%] w-64 h-1 bg-[#1a0f08] transform -rotate-12 blur-[0.5px]"></div>
      )}
    </div>
  );
};

export const LivroMonstros = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCombatPage, setIsCombatPage] = useState(false);

  useEffect(() => {
    // Escala Global Fixa em 90% (Zoom Nativo) para esta rota específica
    document.documentElement.style.setProperty('font-size', '14.4px', 'important');
    return () => {
      document.documentElement.style.removeProperty('font-size');
    };
  }, []);

  const monster = MOCK_MONSTERS[selectedIndex];

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setLevel(l => Math.min(l + 1, 30));
    } else {
      setLevel(l => Math.max(l - 1, 1));
    }
  };

  const nextMonster = () => {
    setSelectedIndex((i) => (i + 1) % MOCK_MONSTERS.length);
    setLevel(1);
    setIsSearching(false);
    setIsCombatPage(false);
  };

  const prevMonster = () => {
    setSelectedIndex((i) => (i - 1 + MOCK_MONSTERS.length) % MOCK_MONSTERS.length);
    setLevel(1);
    setIsSearching(false);
    setIsCombatPage(false);
  };

  const crDiff = (level - 1) * 2;
  const targetCr = monster.baseCr + crDiff;
  
  const rawAtts = {
    fisico: 10 + monster.conMod * 2 + crDiff,
    precisao: 10 + monster.conMod + Math.floor(crDiff / 2),
    resistencia: 10 + monster.conMod * 2 + Math.floor(crDiff / 1.5),
    mente: 10 + Math.floor(targetCr / 2),
    vontade: 10 + monster.conMod + Math.floor(crDiff / 2),
    eloquencia: 8 + Math.floor(targetCr / 3),
  };

  const calculatedAc = monster.baseAc + Math.floor(crDiff / 2);
  const maxHp = Math.floor(monster.baseHp * (1 + 30 * 0.4));
  const calculatedHp = Math.floor(monster.baseHp * (1 + level * 0.4));

  const filteredSearch = MOCK_MONSTERS.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-screen h-[100dvh] flex overflow-hidden bg-[#1f1610] text-[#1f1610] selection:bg-[#8b0000]/30 selection:text-[#e6d8c3]">
       
       {/* Left Volume / Spine */}
       <div className="w-[3vw] h-full book-spine-left shrink-0 z-20"></div>

       {/* Book Pages Area */}
       <div className="flex-1 flex relative book-page-bg shadow-[inset_0_0_120px_rgba(59,42,26,0.6)]">
          
          {/* Center Fold Depth */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-20 book-center-fold z-30 pointer-events-none"></div>

          {/* LEFT PAGE */}
          <div className="w-1/2 h-full relative z-10 px-12 py-16 flex flex-col items-center justify-center">
             
             {/* Left Bookmarks */}
             <div className="absolute top-0 left-12 flex gap-4 z-50">
                <Link to="/" className="bookmark-tab px-3 pt-6 pb-4 relative flex flex-col items-center group cursor-pointer hover:pt-10 transition-all">
                   <span className="font-apple text-[#eaddc5] text-lg writing-vertical group-hover:text-[#fff]">Fechar Volume</span>
                </Link>
                <div onClick={prevMonster} className="bookmark-tab px-3 pt-6 pb-4 relative flex flex-col items-center group cursor-pointer hover:pt-10 transition-all">
                   <span className="font-apple text-[#eaddc5] text-lg writing-vertical">Anterior</span>
                </div>
                <div onClick={() => setIsSearching(!isSearching)} className="bookmark-tab bg-[#8b0000] border-[#4a0000] px-3 pt-6 pb-4 relative flex flex-col items-center group cursor-pointer hover:pt-10 transition-all">
                   <Search className="w-5 h-5 text-[#eaddc5] mb-2 -ml-1" />
                   <span className="font-apple text-[#eaddc5] text-lg writing-vertical">Índice</span>
                </div>
             </div>

             {/* Content Left Page */}
             {isSearching ? (
                <div className="w-full max-w-sm mt-20 z-50 bg-[#e6d8c3]/90 p-8 border border-dashed border-[#8b5a2b] shadow-2xl">
                   <h2 className="font-cinzel text-3xl font-bold mb-4 text-center border-b-2 border-[#8b0000] pb-2 text-[#8b0000]">Índice Sombrio</h2>
                   <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Buscar aberração..."
                     className="w-full bg-transparent border-b border-dashed border-[#5c3a21] outline-none font-apple text-2xl pb-1 mb-6 placeholder:text-[#5c3a21]/50 mix-blend-multiply" 
                   />
                   <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredSearch.map((m, idx) => (
                         <div 
                           key={m.id}
                           onClick={() => { setSelectedIndex(MOCK_MONSTERS.findIndex(om => om.id === m.id)); setLevel(1); setIsSearching(false); }}
                           className="font-apple text-2xl text-[#2a1c14] cursor-pointer hover:text-[#8b0000] transition-colors flex items-center justify-between border-b border-[#5c3a21]/10 pb-1"
                         >
                           <span>{m.name}</span>
                           <span className="text-sm font-nanum opacity-50">Pag. {idx + 1}</span>
                         </div>
                      ))}
                   </div>
                </div>
             ) : (
               <div className="w-full h-full relative flex items-center justify-center">
                 {/* LORE LEFT PAGE */}
                 <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 pb-16 ${isCombatPage ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                   <h1 className="font-cinzel text-5xl font-bold text-center mb-8 ink-bleed-text transform rotate-[-1deg] capitalize mix-blend-multiply shrink-0">
                     {monster.name}
                   </h1>
                   <div 
                     className="w-[70vh] h-[70vh] min-h-[350px] flex items-center justify-center relative cursor-ns-resize"
                     onWheel={handleWheel}
                     title="Role (Scroll) para Cima ou Baixo para alterar o Nível."
                   >
                      {/* Decorative Rotating Cycle */}
                      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full stroke-[#4a2a1a]/80 fill-none mix-blend-multiply pointer-events-none drop-shadow-md z-10" style={{ transform: `rotate(${(level - 1) * 12}deg)`, transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      {/* Outer Base Rings */}
                      <circle cx="100" cy="100" r="95" strokeWidth="0.5" strokeDasharray="4,6" />
                      <circle cx="100" cy="100" r="85" strokeWidth="0.5" opacity={Math.min(1, level / 5)} />
                      
                      {/* Hexagram */}
                      <g opacity={Math.min(1, level / 10)} strokeWidth="0.3">
                         <polygon points="100,15 173.6,142.5 26.4,142.5" />
                         <polygon points="100,185 26.4,57.5 173.6,57.5" />
                      </g>
                      
                      {/* Internal star / Heptagram approximation */}
                      <g opacity={Math.min(1, level / 20)} strokeWidth="0.3" strokeDasharray="1,2">
                         <polygon points="100,25 159,165 31,78 169,78 41,165" />
                      </g>

                      {/* Alchemy nodes */}
                      <g opacity={Math.min(1, level / 15)}>
                          <circle cx="100" cy="15" r="3" fill="#4a2a1a" />
                          <circle cx="173.6" cy="142.5" r="3" fill="#4a2a1a" />
                          <circle cx="26.4" cy="142.5" r="3" fill="#4a2a1a" />
                          <circle cx="100" cy="185" r="3" fill="#4a2a1a" />
                          <circle cx="26.4" cy="57.5" r="3" fill="#4a2a1a" />
                          <circle cx="173.6" cy="57.5" r="3" fill="#4a2a1a" />
                      </g>
                      
                      {/* Complex internal rings */}
                      <circle cx="100" cy="100" r="60" strokeWidth="0.3" strokeDasharray="2,2" opacity={Math.min(1, level / 25)} />
                      {level >= 30 && <circle cx="100" cy="100" r="98" strokeWidth="2" stroke="#8b0000" />}
                   </svg>
                   
                   {/* Monster Image Behind the Numbers but Inside the Circle */}
                   <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none z-0">
                     <img 
                       src={monster.imageUrl} 
                       alt={monster.name} 
                       className="w-full h-full object-contain imagem-monstro-papiro rounded-full transition-opacity duration-500" 
                       style={{ 
                         maskImage: "radial-gradient(circle at center, black 40%, transparent 68%)", 
                         WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 68%)" 
                       }}
                     />
                   </div>

                   {/* Center Text */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center font-cinzel text-[#2a1c14] z-20 pointer-events-none mix-blend-multiply">
                      <span className="text-xl font-bold tracking-widest opacity-80">LEVEL</span>
                      <span className="text-6xl font-bold ink-bleed-text">{level}</span>
                      <span className="text-sm italic mt-2 text-[#5c3a21] opacity-70 border-b border-dashed border-[#5c3a21]">Role para mutar</span>
                   </div>

                   {/* Surrounding Combat Stats */}
                   <div className="absolute top-[20%] left-[8%] flex flex-col items-center">
                      <div className="relative w-8 h-40 border-2 border-solid border-[#4a2a1a] rounded-full overflow-hidden flex items-end shadow-inner bg-[#e3d7c1]/50 mix-blend-multiply">
                        <div className="w-full bg-[#8b0000]/80 transition-all duration-300" style={{ height: `${(calculatedHp / maxHp) * 100}%` }}></div>
                      </div>
                      <span className="font-apple mt-3 text-2xl text-center leading-none">{calculatedHp}/{calculatedHp}<br/><span className="text-base text-[#8b0000]">Vida</span></span>
                   </div>

                   <div className="absolute bottom-[20%] right-[8%] flex flex-col items-center">
                      <Shield className="w-10 h-10 text-[#4a2a1a] stroke-[1.5px] mix-blend-multiply" />
                      <span className="font-nanum text-4xl font-bold mt-1">{calculatedAc}</span>
                      <span className="font-apple text-base text-[#5c3a21]">Casco</span>
                   </div>

                   <div className="absolute top-[20%] right-[8%] flex flex-col items-center">
                      <div className="w-10 h-10 border-2 border-dashed border-[#4a2a1a] rounded-full flex items-center justify-center">
                         <span className="font-apple text-2xl mix-blend-multiply italic">B</span>
                      </div>
                      <span className="font-apple text-3xl mt-2">{monster.speed || 30}ft</span>
                      <span className="font-apple text-sm text-[#5c3a21]">Mov.</span>
                   </div>

                   </div>
                 </div>

                 {/* COMBAT LEFT PAGE */}
                 <div className={`absolute inset-0 flex flex-col p-12 transition-opacity duration-700 ${isCombatPage ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <h2 className="font-cinzel text-5xl font-bold mb-10 text-center border-b-2 border-dashed border-[#8b0000]/60 pb-6 text-[#8b0000]">Resistência e Vitalidade</h2>
                    
                    <div className="flex flex-col gap-10 flex-1">
                      <div className="flex items-center justify-around bg-[#f4ebd8]/50 p-8 border border-[#5c3a21]/20 rounded shadow-sm">
                        <div className="flex flex-col items-center">
                          <Shield className="w-16 h-16 text-[#4a2a1a] stroke-[1.5px] mix-blend-multiply mb-3" />
                          <span className="font-nanum text-6xl font-bold">{calculatedAc}</span>
                          <span className="font-apple text-xl text-[#5c3a21]">Classe de Armadura</span>
                        </div>
                        <div className="w-px h-32 bg-[#5c3a21]/20"></div>
                        <div className="flex flex-col items-center">
                          <div className="relative w-16 h-40 border-2 border-solid border-[#4a2a1a] rounded-full overflow-hidden flex items-end shadow-inner bg-[#e3d7c1]/50 mix-blend-multiply mb-3">
                             <div className="w-full bg-[#8b0000]/80 transition-all duration-300" style={{ height: `${(calculatedHp / maxHp) * 100}%` }}></div>
                          </div>
                          <span className="font-apple text-4xl font-bold">{calculatedHp}</span>
                          <span className="font-apple text-xl text-[#5c3a21]">Pontos de Vida</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-[#8b0000]/5 p-8 border border-[#8b0000]/20 rounded shadow-sm">
                           <h3 className="font-apple text-2xl text-[#8b0000] font-bold mb-3 uppercase tracking-widest border-b border-[#8b0000]/20 inline-block">Imunidades</h3>
                           <p className="font-serif text-xl mix-blend-multiply opacity-90 mt-2 leading-relaxed">Condições mentais, Veneno.</p>
                        </div>
                        <div className="bg-[#5c3a21]/5 p-8 border border-[#5c3a21]/20 rounded shadow-sm">
                           <h3 className="font-apple text-2xl text-[#5c3a21] font-bold mb-3 uppercase tracking-widest border-b border-[#5c3a21]/20 inline-block">Vulnerabilidades</h3>
                           <p className="font-serif text-xl mix-blend-multiply opacity-90 mt-2 leading-relaxed">Fogo sagrado, Lata e Prata.</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-center p-4">
                        <div className="w-48 h-48 border-4 border-dashed border-[#5c3a21] rounded-full flex items-center justify-center opacity-40 mix-blend-multiply">
                           <span className="font-apple text-xl text-center p-4">Esquema<br/>Anatômico<br/>(Defesa)</span>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
             )}
          </div>


          {/* RIGHT PAGE */}
          <div className="w-1/2 h-full relative z-10 px-12 py-16 flex flex-col">
             
             {/* Right Bookmarks */}
             <div className="absolute top-0 right-12 flex gap-4 z-50">
                <div onClick={nextMonster} className="bookmark-tab px-3 pt-6 pb-4 relative flex flex-col items-center group cursor-pointer hover:pt-10 transition-all">
                   <span className="font-apple text-[#eaddc5] text-lg writing-vertical">Próximo</span>
                </div>
             </div>

             <div className="flex flex-col h-full pl-6 pr-6 relative z-10 text-[#2a1c14]">

                 <div className="relative flex-1 w-full h-full">
                 
                   {/* DEFAULT VIEW (LORE & ATTRIBUTES) */}
                   <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col ${isCombatPage ? 'opacity-0 pointer-events-none z-0' : 'opacity-100 pointer-events-auto z-10'}`}>
                     {/* Attributes with Math/Greek Notation */}
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10 px-4 border-b-2 border-dashed border-[#8b5a2b]/30 pb-8 relative shrink-0">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/worn-dots.png')] opacity-20 pointer-events-none"></div>
                       
                       <div className="flex flex-col items-center justify-center">
                          <span className="font-apple text-sm opacity-60 uppercase tracking-widest mb-1">Físico</span>
                          <div className="font-nanum text-4xl flex items-center gap-2 font-bold mix-blend-multiply">
                            <span className="text-[#8b0000] font-serif text-3xl">Φ</span> = {rawAtts.fisico}
                          </div>
                       </div>
                       <div className="flex flex-col items-center justify-center">
                          <span className="font-apple text-sm opacity-60 uppercase tracking-widest mb-1">Precisão</span>
                          <div className="font-nanum text-4xl flex items-center gap-2 font-bold mix-blend-multiply">
                            <span className="text-[#8b0000] font-serif text-3xl">Δ</span> = {rawAtts.precisao}
                          </div>
                       </div>
                       <div className="flex flex-col items-center justify-center">
                          <span className="font-apple text-sm opacity-60 uppercase tracking-widest mb-1">Resistência</span>
                          <div className="font-nanum text-4xl flex items-center gap-2 font-bold mix-blend-multiply">
                            <span className="text-[#8b0000] font-serif text-3xl">Ω</span> = {rawAtts.resistencia}
                          </div>
                       </div>
                       <div className="flex flex-col items-center justify-center">
                          <span className="font-apple text-sm opacity-60 uppercase tracking-widest mb-1">Mente</span>
                          <div className="font-nanum text-4xl flex items-center gap-2 font-bold mix-blend-multiply">
                            <span className="text-[#8b0000] font-serif text-3xl">Ψ</span> = {rawAtts.mente}
                          </div>
                       </div>
                       <div className="flex flex-col items-center justify-center">
                          <span className="font-apple text-sm opacity-60 uppercase tracking-widest mb-1">Vontade</span>
                          <div className="font-nanum text-4xl flex items-center gap-2 font-bold mix-blend-multiply">
                            <span className="text-[#8b0000] font-serif text-3xl">Γ</span> = {rawAtts.vontade}
                          </div>
                       </div>
                       <div className="flex flex-col items-center justify-center">
                          <span className="font-apple text-sm opacity-60 uppercase tracking-widest mb-1">Eloquência</span>
                          <div className="font-nanum text-4xl flex items-center gap-2 font-bold mix-blend-multiply">
                            <span className="text-[#8b0000] font-serif text-3xl">Σ</span> = {rawAtts.eloquencia}
                          </div>
                       </div>
                     </div>

                     <div className="flex-1 flex flex-col gap-10 overflow-hidden relative">
                       {/* Estudo Formal */}
                       <div>
                         <h3 className="font-cinzel text-xl font-bold mb-3 border-b border-[#5c3a21]/20 inline-block text-[#8b0000]">Estudo Naturalista</h3>
                         <p className="font-serif text-2xl leading-[1.6] text-justify mix-blend-multiply opacity-90 indent-10 font-medium">
                           {monster.description}
                         </p>
                       </div>

                       {/* Curiosidades Apresadas */}
                       <div className="mt-auto bg-[#8b0000]/5 p-8 border border-[#8b0000]/20 transform rotate-[1deg] shadow-lg relative mx-4 mb-4">
                          <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b0000] rounded-full blur-[2px] opacity-40"></div>
                          <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b0000] rounded-full blur-[2px] opacity-40"></div>
                          <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b0000] rounded-full blur-[2px] opacity-40"></div>
                          <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b0000] rounded-full blur-[2px] opacity-40"></div>
                          
                          <h3 className="font-apple text-lg text-[#8b0000] font-bold mb-4 uppercase tracking-widest border-b border-[#8b0000]/20 inline-block">Anotações de Campo</h3>
                          <p className="font-apple text-3xl leading-snug ink-bleed-text opacity-95">
                            {monster.report}
                          </p>
                       </div>
                     </div>
                   </div>

                   {/* ARSENAL BIOLÓGICO VIEW (COMBAT SHEET) */}
                   <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col pointer-events-none p-6 ${isCombatPage ? 'opacity-100 pointer-events-auto z-20' : 'opacity-0 z-0'}`}>
                      <div className="flex-1 flex flex-col h-full bg-[#f4ebd8]/70 border border-[#8b5a2b]/30 shadow-inner p-8 rounded transform rotate-[0.5deg]">
                         <h2 className="font-cinzel text-4xl font-bold mb-8 text-center border-b-2 border-dashed border-[#8b0000]/60 pb-4 text-[#8b0000]">Arsenal Ofensivo</h2>
                         
                         <div className="mb-10">
                            <h3 className="font-apple text-2xl text-[#8b0000] font-bold border-b border-[#5c3a21]/20 inline-block mb-4">Ataques Físicos e Dano</h3>
                            <div className="bg-[#8b0000]/5 p-6 border border-[#8b0000]/20 rounded shadow-sm">
                              <p className="font-serif text-2xl mix-blend-multiply text-[#2a1c14] leading-relaxed">
                                <span className="font-bold">Ataque Base (Nv {level}):</span> {monster.damageBaseStr} <br/>
                                <span className="font-bold">Variação de Dano:</span> {level}d{monster.damageDiceSides} + {monster.damageBonus * level} dano [{monster.damageType}]
                              </p>
                            </div>
                         </div>

                         <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar flex flex-col gap-8 text-[#1a1512]">
                           <h3 className="font-apple text-2xl text-[#8b0000] font-bold border-b border-[#5c3a21]/20 inline-block mb-2">Habilidades e Táticas</h3>
                           {monster.abilities.map((ab, idx) => (
                             <div key={idx} className="flex flex-col relative group/ability mb-4 bg-white/30 p-6 border border-[#5c3a21]/10 rounded shadow-sm">
                               <span className="font-apple text-3xl text-[#5c0a0a] font-bold leading-none mb-4 mix-blend-multiply flex items-center gap-4">
                                 <svg viewBox="0 0 10 10" className="w-4 h-4 fill-[#5c0a0a] opacity-80 mt-1"><polygon points="5,0 10,5 5,10 0,5" /></svg>
                                 {ab.name}
                               </span>
                               <span className="font-serif text-xl leading-relaxed mix-blend-multiply opacity-90 indent-8">{ab.desc}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                   </div>

                 </div>

                 {/* Bottom Bookmark - Arsenal Biológico / Lore */}
                 <div className="absolute bottom-0 right-16 flex flex-col items-end z-50">
                    <div 
                      onClick={() => setIsCombatPage(!isCombatPage)}
                      className="bg-[#5c2018] border border-[#3a1008] border-b-0 px-6 py-3 rounded-t-md shadow-[0_-5px_15px_rgba(0,0,0,0.5)] cursor-pointer flex items-center justify-center transition-all z-20 hover:-translate-y-2 hover:bg-[#8b0000]"
                    >
                       <span className="font-apple text-[#eaddc5] text-2xl tracking-wider">
                         {isCombatPage ? 'Retornar ao Lore' : 'Página de Combate'}
                       </span>
                    </div>
                 </div>

             </div>
          </div>

          <ProceduralDirt index={selectedIndex} />
       </div>

       {/* Right Volume / Spine */}
       <div className="w-[3vw] h-full book-spine-right shrink-0 z-20"></div>

    </div>
  );
};
