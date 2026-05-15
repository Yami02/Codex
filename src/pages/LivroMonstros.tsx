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

const ProceduralDirt = ({ index, isSpinning }: { index: number, isSpinning: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* 2: manchas de café/óleo */}
      {index % 2 === 0 && (
         <div className="absolute top-1/4 left-[10%] w-64 h-64 bg-[#7a4b2a] opacity-20 rounded-full blur-[40px] mix-blend-multiply"></div>
      )}
      
      {/* 3: respingo de sangue */}
      {index % 3 === 0 && (
         <div className="absolute top-[60%] right-[30%] opacity-80 mix-blend-multiply">
           <div className="absolute w-10 h-10 bg-[#4a0000] rounded-full blur-[2px]"></div>
           <div className="absolute top-4 right-12 w-4 h-5 bg-[#4a0000] rounded-full blur-[1px]"></div>
           <div className="absolute top-8 right-6 w-6 h-6 bg-[#4a0000] rounded-full blur-[2px]"></div>
         </div>
      )}
      
      {/* 4: Charred Holes */}
      {index % 4 === 0 && (
         <div className="absolute bottom-[10%] right-[10%] w-16 h-16 bg-[#1a0f08] opacity-90 rounded-[40%_60%_70%_30%] blur-[1px] border-4 border-[#3a1a0a] mix-blend-color-burn shadow-[0_0_10px_black] clip-path-polygon"></div>
      )}

      {/* 5: Torn Corner Repaired */}
      {index % 5 === 0 && (
         <svg className="absolute top-0 left-0 w-32 h-32 opacity-70 mix-blend-multiply" viewBox="0 0 100 100">
           <path d="M0 0 L50 0 L0 50 Z" fill="#e6d8c3" stroke="#8b5a2b" strokeWidth="1" strokeDasharray="5,5" />
           <path d="M10 30 L30 10 M15 40 L40 15" stroke="#4a2a1a" strokeWidth="2" />
         </svg>
      )}

      {/* 6: Frantic Marginalia */}
      {index % 6 === 0 && (
         <div className="absolute top-[20%] left-[80%] font-apple text-lg text-[#1a1512] transform rotate-12 opacity-70 mix-blend-multiply flex flex-col gap-1">
           <span>Σ(x) ≈ Φ / 2</span>
           <span className="text-sm">Pq estragou?</span>
           <span className="text-xl">Mais sangue!</span>
         </div>
      )}
      
      {/* 7: Pressed Flora */}
      {index % 7 === 0 && (
        <div className="absolute bottom-[20%] left-[45%] flex flex-col items-center opacity-80 mix-blend-multiply">
          <svg className="w-12 h-20 text-[#2a4a1a]" viewBox="0 0 100 200" fill="currentColor">
            <path d="M50 200 C50 150 20 100 50 0 C80 100 50 150 50 200" />
            <path d="M50 100 C70 80 90 90 90 110 C90 130 70 120 50 100" />
            <path d="M50 120 C30 100 10 110 10 130 C10 150 30 140 50 120" />
          </svg>
          <div className="w-16 h-4 border-b border-t border-[#d9c5a0] bg-[#e6d8c3] opacity-80 transform -rotate-6 mt-[-10px] shadow-sm"></div>
        </div>
      )}

      {/* 8: Insect Damage / Bookworm holes */}
      {index % 8 === 0 && (
         <div className="absolute top-[80%] left-[20%] opacity-90 mix-blend-color-burn">
           <div className="w-2 h-3 bg-[#1f1610] rounded-full blur-[1px]"></div>
           <div className="w-3 h-2 bg-[#1f1610] rounded-full blur-[1px] ml-4 mt-2"></div>
           <div className="w-1 h-3 bg-[#1f1610] rounded-full blur-[0.5px] ml-2 mt-1"></div>
         </div>
      )}

      {/* 9: Wax Seal Residue */}
      {index % 9 === 0 && (
         <div className="absolute top-[5%] right-[20%] w-8 h-8 bg-[#8b0000] opacity-40 rounded-full blur-[2px] mix-blend-multiply border-2 border-[#5c0a0a]"></div>
      )}

      {/* 10: Ink Blot */}
      {index % 10 === 0 && (
         <div className="absolute bottom-[30%] left-[30%] w-8 h-8 bg-[#0a0502] opacity-90 rounded-[40%_60%_70%_30%] blur-[1px] mix-blend-multiply"></div>
      )}

      {/* 11: Correction Notes */}
      {index % 11 === 0 && (
         <div className="absolute top-[40%] right-[30%] text-[#1a1512] opacity-80 mix-blend-multiply rotate-[-2deg]">
           <span className="line-through decoration-2 decoration-[#1a1512] font-serif text-xl border-b-2 border-black">Dócil em cativeiro</span>
           <br/>
           <span className="font-apple text-xl relative top-[-5px] left-4 text-[#8b0000]">Eles devoram seus mestres!</span>
         </div>
      )}

      {/* Standard: Glow Tendrils */}
      {isSpinning && (
         <div className="absolute inset-0 flex items-center justify-center mix-blend-screen pointer-events-none z-50 transition-opacity duration-300">
           <div className="w-[60vh] h-[60vh] rounded-full border border-[#8b0000]/30 shadow-[0_0_80px_rgba(139,0,0,0.4)] animate-ping"></div>
           <div className="absolute w-full h-full" style={{ background: 'radial-gradient(circle at center, rgba(139,0,0,0.15) 0%, transparent 40%)' }}></div>
         </div>
      )}
    </div>
  );
};

const PenSeparator = () => (
   <svg className="w-full h-4 text-[#5c3a21] opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none" stroke="currentColor" fill="none">
      <path d="M0,5 Q20,2 40,8 T80,3 T100,6" strokeWidth="1" />
      <path d="M0,5 Q30,7 60,3 T100,5" strokeWidth="0.5" strokeDasharray="2,2" />
   </svg>
);

export const LivroMonstros = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCombatPage, setIsCombatPage] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinTimeout, setSpinTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // A escala global agora é controlada pelo transform layout abaixo, 
    // não precisamos mais forçar o font-size do html.
  }, []);

  const monster = MOCK_MONSTERS[selectedIndex];

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setLevel(l => Math.min(l + 1, 30));
    } else {
      setLevel(l => Math.max(l - 1, 1));
    }
    
    setIsSpinning(true);
    if (spinTimeout) clearTimeout(spinTimeout);
    setSpinTimeout(setTimeout(() => setIsSpinning(false), 500));
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
    <div className="w-screen h-[100dvh] overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-[#181412] flex items-center justify-center relative">
       {/* Runic inscription overlay on table */}
       <div className="absolute inset-0 opacity-[0.03] mix-blend-color-dodge bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] pointer-events-none"></div>

       <div 
         className="flex shrink-0 text-[#1f1610] selection:bg-[#8b0000]/30 selection:text-[#e6d8c3] z-10"
         style={{
            width: '133.33vw',
            height: '133.33vh',
            transform: 'scale(0.75)',
            transformOrigin: 'center center'
         }}
       >
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
                <Link to="/" className="bookmark-tab px-3 pt-12 pb-4 relative flex flex-col items-center group cursor-pointer -translate-y-[80%] hover:-translate-y-0 transition-transform duration-500 ease-out drop-shadow-lg">
                   <div className="bg-[#e3d7c1] p-1 border border-[#8b5a2b] shadow-inner mt-2">
                     <span className="font-apple text-[#2a1c14] text-lg writing-vertical font-bold">Fechar Volume</span>
                   </div>
                </Link>
                <div onClick={prevMonster} className="bookmark-tab px-3 pt-12 pb-4 relative flex flex-col items-center group cursor-pointer -translate-y-[80%] hover:-translate-y-0 transition-transform duration-500 ease-out drop-shadow-lg">
                   <div className="bg-[#e3d7c1] p-1 border border-[#8b5a2b] shadow-inner mt-2">
                     <span className="font-apple text-[#2a1c14] text-lg writing-vertical font-bold">Anterior</span>
                   </div>
                </div>
                <div onClick={() => setIsSearching(!isSearching)} className="bookmark-tab px-3 pt-12 pb-4 relative flex flex-col items-center group cursor-pointer -translate-y-[75%] hover:-translate-y-0 transition-transform duration-500 ease-out drop-shadow-lg">
                   <Search className="w-5 h-5 text-[#eaddc5] mb-2 -ml-1 relative z-10" />
                   <div className="bg-[#e3d7c1] p-1 border border-[#8b5a2b] shadow-inner relative z-10">
                     <span className="font-apple text-[#2a1c14] text-lg writing-vertical font-bold">Índice</span>
                   </div>
                </div>
             </div>

             {/* Content Left Page */}
             {isSearching ? (
                <div className="w-full max-w-sm mt-20 z-50 bg-[#e6d8c3]/90 p-8 border border-dashed border-[#8b5a2b] shadow-2xl">
                   <h2 className="font-blackletter text-4xl mb-4 text-center border-b-[3px] border-[#8b0000] pb-2 text-[#8b0000]">Índice Sombrio</h2>
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
                <>
                <div className="w-full h-full relative grid grid-cols-[120px_1fr]">
                 
                 {/* Coluna da Esquerda: Variáveis Vitais */}
                 <div className="flex flex-col justify-center gap-16 border-r border-dashed border-[#c8b598]/50 pr-4 z-20 mix-blend-multiply opacity-80">
                    
                    {/* Vida (Frasco sketch) */}
                    <div className="flex flex-col items-center relative group">
                       <svg className="w-12 h-16 text-[#8b0000] drop-shadow-sm" viewBox="0 0 100 150" fill="none" stroke="currentColor">
                          <path d="M40 20 L60 20 M45 20 L45 50 L20 120 C10 140 40 150 50 150 C60 150 90 140 80 120 L55 50 L55 20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M25 110 Q50 120 75 110" strokeWidth="2" strokeDasharray="4,4"/>
                          <circle cx="50" cy="115" r="5" fill="currentColor" opacity="0.3" />
                       </svg>
                       <div className="absolute top-0 right-[-30px] font-nanum text-2xl text-[#1a1512] mb-1">{calculatedHp}</div>
                       <span className="font-apple text-sm text-[#5c3a21] italic mt-2">V(ml)</span>
                    </div>

                    {/* Casca (Escudo sketch) */}
                    <div className="flex flex-col items-center relative gap-1">
                       <svg className="w-12 h-16 text-[#2a1c14]" viewBox="0 0 100 120" fill="none" stroke="currentColor">
                          <path d="M10 20 Q50 10 90 20 L90 50 C90 90 50 115 50 115 C50 115 10 90 10 50 Z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M50 10 L50 115 M15 35 L85 35 M20 60 L80 60 M30 85 L70 85" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
                       </svg>
                       <div className="absolute top-4 right-[-25px] font-nanum text-3xl font-bold text-[#1a1512]">{calculatedAc}</div>
                       <span className="font-apple text-sm text-[#5c3a21] italic">C(x)</span>
                    </div>

                    {/* Movimentação (Bota sketch) */}
                    <div className="flex flex-col items-center relative">
                       <svg className="w-14 h-14 text-[#2a1c14]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                          <path d="M30 10 L30 50 C30 60 20 60 20 70 L20 85 C20 95 30 95 40 95 L80 95 C90 95 90 85 85 75 L60 70 L55 50 L55 10 Z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 85 L85 85" strokeWidth="2" strokeDasharray="2,4" opacity="0.7"/>
                       </svg>
                       <div className="absolute top-2 right-[-35px] font-nanum text-2xl text-[#1a1512]">{monster.speed || 30}ft</div>
                       <span className="font-apple text-sm text-[#5c3a21] italic mt-2">M(v)</span>
                    </div>
                 </div>

                 {/* Área Central: LORE e COMBAT */}
                 <div className="relative w-full h-full flex flex-col items-center justify-center pl-4">
                   {/* LORE LEFT PAGE */}
                   <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 pb-16 ${isCombatPage ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                     <h1 className="font-blackletter text-6xl tracking-wider text-center mb-4 ink-bleed-text transform rotate-[-1deg] capitalize mix-blend-multiply shrink-0">
                       {monster.name}
                     </h1>
                     <div 
                       className="w-[80%] aspect-square min-h-[300px] max-h-[60vh] flex items-center justify-center relative cursor-ns-resize"
                       onWheel={handleWheel}
                       title="Role (Scroll) para Cima ou Baixo para alterar o Nível."
                     >
                        {/* Decorative Rotating Cycle - Astrolabe with 30 Rings */}
                        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full stroke-[#4a2a1a]/80 fill-none mix-blend-multiply pointer-events-none drop-shadow-md z-10" style={{ transform: `rotate(${(level - 1) * 12}deg)`, transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                           {Array.from({ length: 30 }).map((_, i) => {
                             const radius = 98 - (i * 2.5);
                             const dashArrays = ["1,2", "4,6", "10,2", "2,8,2", "1,1", "none"];
                             const dash = dashArrays[i % dashArrays.length];
                             const opacity = Math.min(1, (30 - i) / 10) * (level >= i ? 1 : 0.1);
                             
                             return (
                               <g key={i} opacity={opacity}>
                                 <circle 
                                   cx="100" cy="100" 
                                   r={radius} 
                                   strokeWidth={i % 5 === 0 ? 0.6 : 0.2} 
                                   strokeDasharray={dash} 
                                 />
                                 {i % 4 === 0 && (
                                   <text x="100" y={100 - radius + 2} fontSize="2" fill="#4a2a1a" textAnchor="middle" transform={`rotate(${i * 15}, 100, 100)`}>
                                     {['α','β','γ','δ','ε','ζ','η','θ'][i % 8]}
                                   </text>
                                 )}
                               </g>
                             );
                           })}
                           
                           {/* Hexagram Base */}
                           <g opacity={Math.min(1, level / 10)} strokeWidth="0.3">
                              <polygon points="100,15 173.6,142.5 26.4,142.5" />
                              <polygon points="100,185 26.4,57.5 173.6,57.5" />
                           </g>
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
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none mix-blend-multiply drop-shadow-[0_0_10px_rgba(230,216,195,0.8)] bg-white/10 rounded-full h-[30%] w-[30%] m-auto backdrop-blur-sm border border-[#5c3a21]/20">
                        <span className="text-3xl font-bold font-serif opacity-90 text-[#1a1512] drop-shadow-[0_0_2px_rgba(26,21,18,0.5)]">Lvl</span>
                        <span className="text-7xl font-bold font-serif text-[#0f0a07] drop-shadow-[0_0_4px_rgba(26,21,18,0.8)] leading-none">{level}</span>
                        <span className="text-xs italic mt-2 text-[#5c3a21] font-apple tracking-widest">Transmutação</span>
                     </div>
                   </div>
                   </div>

                   {/* COMBAT LEFT PAGE */}
                   <div className={`absolute inset-0 flex flex-col p-8 transition-opacity duration-700 ${isCombatPage ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                      <h2 className="font-blackletter text-6xl tracking-wider mb-10 text-center border-b-[3px] border-[#8b0000]/60 pb-6 text-[#8b0000]">Táticas e Resistências</h2>
                      
                      <div className="flex flex-col gap-10 flex-1 justify-center">
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
                        
                        <div className="flex flex-col bg-[#f4ebd8]/50 p-8 border border-[#5c3a21]/20 rounded shadow-sm">
                           <h3 className="font-apple text-xl text-[#5c3a21] font-bold mb-4 uppercase tracking-widest">Anotações de Combate</h3>
                           <p className="font-apple text-xl indent-8 leading-relaxed opacity-80">
                             O monstro reage de forma agressiva a fogo. Sua carapaça é dura, mas pode ser quebrada com impacto massivo. Evite contato corpo a corpo prolongado.
                           </p>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-center p-4">
                          <div className="w-48 h-48 border-4 border-dashed border-[#5c3a21] rounded-full flex items-center justify-center opacity-40 mix-blend-multiply">
                             <span className="font-apple text-xl text-center p-4">Esquema<br/>Anatômico<br/>(Defesa)</span>
                          </div>
                        </div>
                      </div>
                   </div>
                 </div>
               </div>
               </>
             )}
          </div>


          {/* RIGHT PAGE */}
          <div className="w-1/2 h-full relative z-10 px-12 py-16 flex flex-col">
             
             {/* Right Bookmarks */}
             <div className="absolute top-0 right-12 flex gap-4 z-50">
                <div onClick={nextMonster} className="bookmark-tab px-3 pt-12 pb-4 relative flex flex-col items-center group cursor-pointer -translate-y-[80%] hover:-translate-y-0 transition-transform duration-500 ease-out drop-shadow-lg">
                   <div className="bg-[#e3d7c1] p-1 border border-[#8b5a2b] shadow-inner mt-2">
                     <span className="font-apple text-[#2a1c14] text-lg writing-vertical font-bold">Próximo</span>
                   </div>
                </div>
             </div>

             <div className="flex w-full h-full relative z-10 text-[#2a1c14]">

                 {/* DEFAULT VIEW (LORE & ATTRIBUTES) */}
                 <div className={`absolute inset-0 transition-opacity duration-700 flex w-full ${isCombatPage ? 'opacity-0 pointer-events-none z-0' : 'opacity-100 pointer-events-auto z-10'}`}>
                    
                    {/* Estudo Formal & Notas - Central */}
                    <div className="flex-1 flex flex-col gap-10 overflow-hidden relative pr-8">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/worn-dots.png')] opacity-20 pointer-events-none"></div>
                       
                       {/* Estudo Naturalista */}
                       <div className="relative mt-4">
                         <h3 className="font-blackletter text-4xl mb-2 flex flex-col items-start gap-1 text-[#2a1c14]">
                           Estudo Naturalista
                           <PenSeparator />
                         </h3>
                         <p className="font-serif text-2xl leading-[1.6] text-justify mix-blend-multiply opacity-90 indent-10 font-medium mt-4">
                           {monster.description}
                         </p>
                       </div>

                       {/* Comportamento de Caça */}
                       <div className="relative mt-2">
                         <h3 className="font-blackletter text-4xl mb-2 flex flex-col items-start gap-1 text-[#2a1c14]">
                           Comportamento de Caça
                           <PenSeparator />
                         </h3>
                         <p className="font-serif text-xl leading-[1.7] text-justify mix-blend-multiply opacity-85 indent-8 mt-4">
                           Registros indicam que esta anomalia rastreia padrões térmicos e pânico. Sobreviventes frequentemente relatam uma paralisia irracional instantes antes do abate, sugerindo feromônios neurotóxicos invisíveis no ambiente imediato da caçada.
                         </p>
                       </div>

                       {/* Curiosidades Apresadas */}
                       <div className="mt-auto bg-[#8b0000]/5 p-8 pb-16 transform rotate-[1deg] relative mx-4 mb-16">
                          <h3 className="font-apple text-xl text-[#8b0000] font-bold mb-2  tracking-widest border-b border-[#8b0000]/20 inline-block">Curiosidades de Sobrevivência</h3>
                          <p className="font-apple text-2xl leading-snug ink-bleed-text opacity-95">
                            {monster.report}
                          </p>
                       </div>
                    </div>

                    {/* Right Margin: Attributes (Math Formulas) */}
                    <div className="w-[120px] shrink-0 border-l border-dashed border-[#c8b598]/80 flex flex-col items-center justify-center gap-12 py-12">
                       <div className="flex flex-col items-center justify-center rotate-[2deg] opacity-80 mix-blend-multiply">
                          <span className="font-apple text-sm text-[#5c3a21] mb-1">Físico</span>
                          <span className="font-nanum text-3xl font-bold"><span className="text-[#8b0000] font-serif">Φ</span>={rawAtts.fisico}</span>
                       </div>
                       <div className="flex flex-col items-center justify-center rotate-[-1deg] opacity-80 mix-blend-multiply">
                          <span className="font-apple text-sm text-[#5c3a21] mb-1">Precisão</span>
                          <span className="font-nanum text-3xl font-bold"><span className="text-[#8b0000] font-serif">Δ</span>={rawAtts.precisao}</span>
                       </div>
                       <div className="flex flex-col items-center justify-center rotate-[3deg] opacity-80 mix-blend-multiply">
                          <span className="font-apple text-sm text-[#5c3a21] mb-1">Resistência</span>
                          <span className="font-nanum text-3xl font-bold"><span className="text-[#8b0000] font-serif">Ω</span>={rawAtts.resistencia}</span>
                       </div>
                       <div className="flex flex-col items-center justify-center rotate-[-2deg] opacity-80 mix-blend-multiply">
                          <span className="font-apple text-sm text-[#5c3a21] mb-1">Mente</span>
                          <span className="font-nanum text-3xl font-bold"><span className="text-[#8b0000] font-serif">Ψ</span>={rawAtts.mente}</span>
                       </div>
                       <div className="flex flex-col items-center justify-center rotate-[1deg] opacity-80 mix-blend-multiply">
                          <span className="font-apple text-sm text-[#5c3a21] mb-1">Vontade</span>
                          <span className="font-nanum text-3xl font-bold"><span className="text-[#8b0000] font-serif">Γ</span>={rawAtts.vontade}</span>
                       </div>
                       <div className="flex flex-col items-center justify-center rotate-[-3deg] opacity-80 mix-blend-multiply">
                          <span className="font-apple text-sm text-[#5c3a21] mb-1">Eloquência</span>
                          <span className="font-nanum text-3xl font-bold"><span className="text-[#8b0000] font-serif">Σ</span>={rawAtts.eloquencia}</span>
                       </div>
                    </div>
                 </div>

                 {/* ARSENAL BIOLÓGICO VIEW (COMBAT SHEET) */}
                   <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col pointer-events-none p-6 ${isCombatPage ? 'opacity-100 pointer-events-auto z-20' : 'opacity-0 z-0'}`}>
                      <div className="flex-1 flex flex-col h-full bg-[#f4ebd8]/70 border border-[#8b5a2b]/30 shadow-inner p-8 rounded transform rotate-[0.5deg]">
                         <h2 className="font-blackletter text-5xl tracking-wider mb-8 text-center border-b-2 border-[#8b0000]/60 pb-4 text-[#8b0000]">Arsenal Ofensivo</h2>
                         
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
                 <div className="absolute bottom-4 right-8 flex flex-col items-end z-50 group cursor-pointer" onClick={() => setIsCombatPage(!isCombatPage)}>
                    <div className="relative">
                       {/* Fita de pergaminho solta */}
                       <div className="bg-[#e3d7c1] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] border border-[#8b5a2b] shadow-lg px-8 py-3 transform rotate-[-2deg] group-hover:rotate-0 transition-transform origin-bottom-right">
                          <span className="font-apple text-[#2a1c14] text-xl font-bold tracking-wider">
                            {isCombatPage ? 'Ocultar Arsenal Biológico' : 'Revelar Arsenal Biológico'}
                          </span>
                       </div>
                       {/* Wax Seal */}
                       <div className="absolute -top-3 -right-2 w-10 h-10 bg-[#8b0000] rounded-full shadow-md flex items-center justify-center border-2 border-[#5c0a0a] mix-blend-multiply">
                          <span className="font-nanum text-[#eaddc5] text-xl transform rotate-12">Σ</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <ProceduralDirt index={selectedIndex} isSpinning={isSpinning} />
        </div>

        {/* Right Volume / Spine */}
        <div className="w-[3vw] h-full book-spine-right shrink-0 z-20"></div>

      </div>
  );
};
