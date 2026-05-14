import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Hexagon, ArrowLeft, BookOpen } from 'lucide-react';

const paperTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`;

const lexiconData: Record<string, any> = {
  nucleos: {
    titulo: 'Núcleos (Substantivos)',
    words: [
      { name: "Pyros", desc: "A energia térmica. Fogo e combustão. Ativá-lo requer foco no movimento caótico das moléculas." },
      { name: "Hydrim", desc: "A fluidez que sustenta a vida. Permite a condensação, gelo e águas revoltas." },
      { name: "Geon", desc: "O atrito solidificado. Grãos de areia, lascas de calcário e muralhas de Terra." },
      { name: "Aethos", desc: "A distorção pneumática incisiva. Correntes de Ar e pressão direcional." },
      { name: "Lumen", desc: "A onda radiante. Projeção, revelação visual e luz pura." },
      { name: "Skotos", desc: "A nulificação absoluta. A antimatéria visual e o frio sepulcral da Sombra." },
      { name: "Stasis", desc: "O congelamento do devir. A Ordem imposta para sobrepujar a volatilidade natural." },
      { name: "Entrop", desc: "A degradação inevitável tornada violenta. Aceleração, morte, corrosão e puro Caos." },
      { name: "Wis", desc: "O NÚCLEO PROIBIDO. A Magia Pura na forma do éter que altera a física sem reações intermediárias. Extrai retribuição anímica do usuário." }
    ]
  },
  morfologia: {
    titulo: 'Morfologia (Adjetivos)',
    words: [
      { name: "Esfer", desc: "Estreitamento esférico. Densidade formando gotas, globos densos ou orbes balísticos." },
      { name: "Lamin", desc: "Transição para o achatamento extremo. Estrutura bidimensional, navalha rotativa ou oblíqua." },
      { name: "Velo", desc: "Uma barreira encobridora, um manto ou névoa difusa. Um tecido necrótico que recobre a realidade." }
    ]
  },
  vetores: {
    titulo: 'Vetores (Verbos)',
    words: [
      { name: "Auto", desc: "Apontamento recursivo. A substância volta ou afunila sobre a couraça de seu conjurador." },
      { name: "Tato", desc: "Infusão por choque microscópico. Requer contato direto no instante inicial." },
      { name: "Zon", desc: "Coordenada fixa num raio observável. Materializa a distância exata, sem voo intermediário." },
      { name: "Vectus", desc: "Propulsão vetorial contínua. Empurra a manifestação como um dardo enraizado no ar." }
    ]
  },
  modificadores: {
    titulo: 'Modificadores (Advérbios)',
    words: [
      { name: "Muto", desc: "Isótopo transmutativo. Muta o estado térmico ou condicional do elemento base." },
      { name: "Pluri", desc: "Fratura Multiplicadora. Clona exponencialmente uma semente da sentença originária." },
      { name: "Minus", desc: "Oposto dramático e sugador de qualidades; a escassez proposital." },
      { name: "Chron", desc: "Dilatação Temporal. Programa uma ignição reativa ou estendida temporalmente." },
      { name: "Tenax", desc: "Ancoragem Perpétua. Concede durações extensas que desafiam a entropia local." }
    ]
  }
};

const almanaqueData = [
  { name: "Fulgur", elements: "Aethos + Entrop", desc: "Relâmpagos e Eletricidade gerados pela fricção caótica dos ares." },
  { name: "Venen", elements: "Hydrim + Entrop", desc: "Líquidos Tóxicos e Ácidos forjados pelo apodrecimento aquoso infundido." },
  { name: "Hylé", elements: "Geon + Stasis", desc: "Cristais e Raízes Botânicas petrificadas através da imposição geométrica severa da Ordem." },
  { name: "Mortis", elements: "Wis + Skotos", desc: "Ruptura Necrótica de Vácuo. Mescla o éter proibido com antimatéria, corroendo o conceito de viver da vítima." }
];

export const Naturalista = () => {
  const [spreadIdx, setSpreadIdx] = useState(0); 
  const [mobilePageIdx, setMobilePageIdx] = useState(0);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  // Components for each page
  const CapDespertar = () => (
    <div className="h-full animate-in fade-in duration-700">
      <h1 className="font-cinzel text-3xl font-bold text-center text-[#4a3728] mb-8 border-b border-[#4a3728]/20 pb-4">O Despertar</h1>
      <p className="custom-drop-cap font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-4 text-justify">
        Onde se inicia a compreensão do real. O Tolo acredita que a magia é um dom caprichoso. O Arquiteto sabe que é apenas gramática. O Naturalista não 'lança' magias, ilusões ou feitiços vis; ele reescreve a realidade usando a Linguagem Primordial, a infraestrutura subjacente de todo o Ser.
      </p>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-6 text-justify">
        O mundo ao seu redor não é feito de pedra incontestável ou fogo autônomo. O mundo é uma frase contínua, dita por ninguém, aguardando um autor. Sua voz, sua mente e seu ressoar são a pena; a Criação é o pergaminho.
      </p>
      <blockquote className="font-cinzel text-2xl font-bold text-center text-[#6d1313] my-10 py-6 border-y border-[#4a3728]/20 ink-effect">
        "O mundo é uma frase;<br/>você é o autor."
      </blockquote>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] text-justify">
        Compreenda esta doutrina absoluta: a vontade nua não forja milagres. Se o fluxo falhar na conjugação, a existência permanecerá inalterada, indiferente ao seu esforço.
      </p>
    </div>
  );

  const CapSintaxe = () => (
    <div className="h-full animate-in fade-in duration-700">
      <h1 className="font-cinzel text-3xl font-bold text-center text-[#4a3728] mb-8 border-b border-[#4a3728]/20 pb-4">A Arte da Sintaxe</h1>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-8 text-justify">
        O poder não advém de murmúrios fervorosos, mas da precisão algébrica. Há dois grandes caminhos para que a Vontade se manifeste:
      </p>
      
      <h3 className="font-cinzel font-bold text-[#6d1313] text-xl mb-2 ink-effect">O Caminho da Manipulação (Eco)</h3>
      <p className="font-serif text-[1.05rem] leading-relaxed text-[#2c1d11] text-justify mb-2">
        A Natureza sempre prefere reciclar a criar. Sentenças iniciadas por este caminho moldam recursos do ambiente. O custo vital perante o tecelão é irrisório.
      </p>
      <div className="font-mono text-center bg-[#4a3728]/10 py-3 rounded mb-6 font-bold text-[#3e2723] border border-[#4a3728]/20 shadow-inner">
        [ Elemento ] + [ Forma ] + [ Orientação ]
      </div>

      <h3 className="font-cinzel font-bold text-[#3e2723] text-xl mb-2 ink-effect">O Caminho da Criação (Gênese)</h3>
      <p className="font-serif text-[1.05rem] leading-relaxed text-[#2c1d11] text-justify mb-2">
        Manifestação ardente do Vazio para a Matéria. Trilha presunçosa cujo encardo consome avidamente os recursos internos (mana) do falante.
      </p>
      <div className="font-mono text-center bg-[#4a3728]/10 py-3 rounded mb-8 font-bold text-[#3e2723] border border-[#4a3728]/20 shadow-inner">
        [ Forma ] + [ Elemento ] + [ Orientação ]
      </div>

      <div className="p-5 border-l-4 border-l-[#6d1313] bg-[#6d1313]/5 relative ink-effect overflow-hidden">
        <h4 className="font-cinzel font-bold text-[#6d1313] text-lg mb-1">Avisos do Grão-Mestre</h4>
        <p className="font-serif italic text-[#3e2723] leading-relaxed">
          "Um erro na ordem é um erro na existência. O Codex não compila o caos. Aqueles que ousam errar a sintaxe terminam pulverizados por suas próprias lacunas literárias."
        </p>
      </div>
    </div>
  );

  const CapIndice = () => {
    const [hoverCat, setHoverCat] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const categorias = [
      { id: 'nucleos', titulo: 'Núcleos', desc: 'Substantivos e Elementos Primordiais', color: '#b91c1c' },
      { id: 'morfologia', titulo: 'Morfologia', desc: 'Adjetivos e Formas Geométricas', color: '#047857' },
      { id: 'vetores', titulo: 'Vetores', desc: 'Verbos e Orientação Espacial', color: '#1d4ed8' },
      { id: 'modificadores', titulo: 'Modificadores', desc: 'Advérbios e Distorções', color: '#6d28d9' }
    ];

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x, y });
    };

    const activeColor = hoverCat ? categorias.find(c => c.id === hoverCat)?.color : '#4a3728';

    return (
      <div 
        className="h-full animate-in fade-in duration-700 flex flex-col relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Dragon Silhouette with Parallax */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center transition-transform duration-200 ease-out z-0"
          style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
        >
          <svg viewBox="0 0 512 512" fill="currentColor" className="w-[120%] h-[120%] text-black scale-150">
            {/* Minimal stylized dragon representation */}
            <path d="M256 0c-15.6 0-30.8 1.4-45.5 4C219.8 19.3 224 40.2 224 64c0 10.3-1.6 20.3-4.5 29.8 20.9 9.8 34.5 31.9 34.5 56.2 0 17.6-7 33.6-18.4 45.4C261 210.5 288 238.3 288 272c0 14.5-5.1 27.9-13.7 38.4C295.3 325 316.5 352 320 352c16 0 32-15.6 32-32 0-33.1 28.3-60.8 62.1-63.5-3.8-3.4-7.4-6.9-11.1-10.3-25-24.1-39-56-39-90.2 0-70.7 57.3-128 128-128 6.5 0 12.9.5 19.1 1.4-1.2-1.9-2.5-3.8-3.9-5.7L507.2 22.3C445.6-12 366 11.9 320 64c-13.8 15.6-25 33.9-33 54C275.9 111.4 266.3 103 256 103s-19.9 8.3-25.9 22.4l.2.2c-.1-.1-.2-.2-.3-.3C223.7 151 202.9 160 180.2 160c-26.4 0-51-11.8-67.4-31.5-6.8 28.1-23.7 52.8-48.4 68.6 15 15.3 24.1 36.3 24.1 58.9v48L51.8 359c-32.5 18-51.8 52.3-51.8 89v56c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-32c0-10.9 3.5-21 9.4-29.3C52.6 461 68 480 88.5 480c25.4 0 46.8-17.7 54.4-41.5 5.2 11.9 14.1 21.9 25 28.8 13.9 8.9 30.5 12.7 46.6 9.8 15.1-6.1 28.4-16.1 38.3-28.7 18.2-22.9 25.1-51.8 21.4-80.1l.8-.3c18.5 24 45 42 75.6 51 0-8.8 7.2-16 16-16h40c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16s-16-7.2-16-16h-40c0-16.1 12.1-29.6 27.8-31.8-6.1-39.7-32.1-73-68.5-88.6C348.6 409.8 403 448 464 448c26.5 0 53-10.6 73.2-31.8L536.8 416h23.2v-21.7z"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center h-full pt-4">
          <h1 className="font-cinzel text-4xl font-bold text-center text-[#4a3728] mb-1">O Índice Mágico</h1>
          <svg className="w-48 h-6 opacity-60 mb-2" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,10 Q50,0 100,10 Q50,20 0,10" fill="none" stroke="#4a3728" strokeWidth="0.5" />
          </svg>

          <div className="relative flex-1 w-full max-w-sm flex items-center justify-center -mt-4">
            
             {/* Magic Circle Backdrop */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-colors duration-1000">
               {/* Slow Rotating Geometries */}
               <svg viewBox="0 0 200 200" className="w-[300px] h-[300px] absolute animate-spin-slow transition-colors duration-500" style={{ stroke: activeColor, animationDuration: '45s' }}>
                  <circle cx="100" cy="100" r="95" fill="none" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.5" />
                  <circle cx="100" cy="100" r="90" fill="none" strokeWidth="0.25" opacity="0.3" />
                  {/* Dynamic Inner Polygon */}
                  {hoverCat === 'nucleos' && <polygon points="100,15 174,142 26,142" fill="none" strokeWidth="0.8" opacity="0.6" />}
                  {hoverCat === 'morfologia' && <polygon points="100,15 185,100 100,185 15,100" fill="none" strokeWidth="0.8" opacity="0.6" />}
                  {hoverCat === 'vetores' && <polygon points="100,15 180,68 150,165 50,165 20,68" fill="none" strokeWidth="0.8" opacity="0.6" />}
                  {hoverCat === 'modificadores' && <polygon points="100,15 174,58 174,142 100,185 26,142 26,58" fill="none" strokeWidth="0.8" opacity="0.6" />}
                  {!hoverCat && <circle cx="100" cy="100" r="45" fill="none" strokeWidth="0.5" strokeDasharray="1 8" opacity="0.3" />}
               </svg>
               {/* Counter-rotating Inner Magic Ring */}
               <svg viewBox="0 0 200 200" className="w-[180px] h-[180px] absolute animate-spin-reverse-slow transition-colors duration-500" style={{ stroke: activeColor, animationDuration: '25s' }}>
                  <circle cx="100" cy="100" r="85" fill="none" strokeWidth="0.75" opacity="0.4" />
                  <polygon points="100,15 174,142 26,142" fill="none" strokeWidth="0.5" opacity="0.3" />
                  <polygon points="100,15 174,142 26,142" fill="none" strokeWidth="0.5" opacity="0.3" transform="rotate(180 100 100)" />
               </svg>

               <div 
                 className="absolute w-24 h-24 rounded-full blur-2xl transition-all duration-700 mix-blend-screen" 
                 style={{ backgroundColor: activeColor, opacity: hoverCat ? 0.25 : 0.05 }} 
               />
             </div>

             {/* Vertical Main Menu overlaying the circle nicely */}
             <div className="relative z-10 flex flex-col w-full px-12 space-y-7">
               {categorias.map(cat => (
                 <button 
                    key={cat.id} 
                    onClick={() => {
                      setSelectedSub(cat.id);
                      if (window.innerWidth < 768) setMobilePageIdx(3);
                    }}
                    onMouseEnter={() => setHoverCat(cat.id)}
                    onMouseLeave={() => setHoverCat(null)}
                    className="w-full text-center group transition-transform duration-300 transform outline-none"
                 >
                   <span 
                     className={`font-cinzel text-2xl font-bold tracking-widest inline-block transition-colors duration-500
                     ${selectedSub === cat.id ? 'opacity-100 scale-105' : 'opacity-80'}`}
                     style={{ color: hoverCat === cat.id ? cat.color : '#4a3728', textShadow: hoverCat === cat.id ? `0 0 8px ${cat.color}60` : 'none' }}
                   >
                     {cat.titulo}
                   </span>
                   {/* Decorative sub-line that fills on hover */}
                   <div className="relative h-[2px] w-2/3 mx-auto mt-2 overflow-hidden opacity-30 mt-1">
                     <div className="absolute inset-0 bg-[#4a3728]" />
                     <div 
                       className="absolute inset-0 transition-transform duration-700 ease-out origin-left -translate-x-full group-hover:translate-x-0" 
                       style={{ backgroundColor: cat.color }} 
                     />
                   </div>
                 </button>
               ))}
             </div>
          </div>

          <div className="mt-auto pb-4 text-center">
             <p className="font-serif italic text-sm text-[#4a3728]/70">
                O círculo nunca cessa, apenas aguarda sua instrução.
             </p>
          </div>
        </div>
      </div>
    );
  };

  const CapLexico = () => {
    if (!selectedSub) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 animate-in fade-in">
          <BookOpen className="w-20 h-20 mb-6 text-[#3e2723]" />
          <p className="font-cinzel text-2xl font-bold">Aguardando Consulta...</p>
          <p className="font-serif mt-2 italic text-[1.1rem]">Selecione um tomo no índice.</p>
        </div>
      );
    }

    const data = lexiconData[selectedSub];

    return (
      <div key={selectedSub} className="h-full animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
         <h1 className="font-cinzel text-2xl font-bold text-center text-[#6d1313] mb-8 border-b border-[#6d1313]/20 pb-4 uppercase tracking-widest leading-relaxed ink-effect">
            {data.titulo}
         </h1>
         <div className="space-y-8">
            {data.words.map((w: any, idx: number) => (
              <div key={idx} className="group hover:-translate-y-0.5 transition-transform">
                <h3 className="font-cinzel font-bold text-xl text-[#3e2723] group-hover:text-[#6d1313] flex items-center gap-2 mb-2 transition-colors ink-effect">
                  {w.name === 'Wis' && <span className="text-[#6d1313]">☠</span>} {w.name}
                </h3>
                <p className="font-serif text-[#2c1d11] text-[1.1rem] leading-relaxed text-justify relative pl-4 border-l-2 border-transparent group-hover:border-[#6d1313]/20 transition-all">
                  {w.desc}
                </p>
              </div>
            ))}
         </div>
         {/* Voltar button only visible on mobile for this specific flow */}
         <button 
           className="md:hidden mt-10 font-bold text-sm text-[#4a3728] uppercase border border-[#4a3728]/30 px-4 py-2 mx-auto flex"
           onClick={() => setMobilePageIdx(2)}
         >
           Voltar ao Índice
         </button>
      </div>
    );
  };

  const CapAlmanaqueLeft = () => (
    <div className="h-full animate-in fade-in duration-700">
       <h1 className="font-cinzel text-3xl font-bold text-center text-[#4a3728] mb-8 border-b border-[#4a3728]/20 pb-4">O Almanaque de Fusões</h1>
       <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-6 text-justify custom-drop-cap">
         O vocabulário primitivo admite hibridizações sob condições anômalas de pressão eidética. Ao justapor a passividade dos elementos primários às diretivas absolutas de Ordem e Caos, o Naturalista cria sub-núcleos sintéticos, cada qual abrigando comportamentos e reações distorcidas que beiram o sublime.
       </p>
       <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] text-justify mt-8">
          Lembre-se das ressalvas e relatos dos Arquitetos decaídos: misturar conceitos contrários sob instabilidade pode provocar implosões semânticas catastróficas em seu próprio tecido físico. A escrita exige punho forte.
       </p>
       <div className="mt-16 flex justify-center opacity-50">
          <svg width="120" height="120" viewBox="0 0 100 100" className="stroke-[#4a3728] fill-transparent stroke-[1]">
             <circle cx="50" cy="50" r="45" strokeDasharray="2 4" />
             <polygon points="50,5 95,75 5,75" />
             <polygon points="50,95 95,25 5,25" />
             <circle cx="50" cy="50" r="20" />
             <circle cx="50" cy="50" r="5" fill="#4a3728" />
          </svg>
       </div>
    </div>
  );

  const CapAlmanaqueRight = () => (
    <div className="h-full animate-in fade-in duration-700 space-y-10">
      {almanaqueData.map((fusao, i) => (
        <div key={i} className="relative pl-6 group">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#6d1313]/40 to-[#6d1313]/5" />
          <h3 className="font-cinzel font-bold text-2xl text-[#3e2723] flex flex-col justify-between mb-1 group-hover:text-[#6d1313] transition-colors ink-effect">
            {fusao.name}
            <span className="font-mono text-sm tracking-widest text-[#6d1313] uppercase mt-2 bg-[#6d1313]/10 self-start px-2 py-0.5 rounded border border-[#6d1313]/20">
               {fusao.elements}
            </span>
          </h3>
          <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] text-justify mt-3 block">
            {fusao.desc}
          </p>
        </div>
      ))}
    </div>
  );

  // Array total of ordered content logically
  const bookPages = [
    <CapDespertar key="p0" />,
    <CapSintaxe key="p1" />,
    <CapIndice key="p2" />,
    <CapLexico key="p3" />,
    <CapAlmanaqueLeft key="p4" />,
    <CapAlmanaqueRight key="p5" />
  ];

  const totalSpreads = Math.ceil(bookPages.length / 2);

  const prevSpread = () => setSpreadIdx(Math.max(0, spreadIdx - 1));
  const nextSpread = () => setSpreadIdx(Math.min(totalSpreads - 1, spreadIdx + 1));
  const prevMobile = () => setMobilePageIdx(Math.max(0, mobilePageIdx - 1));
  const nextMobile = () => setMobilePageIdx(Math.min(bookPages.length - 1, mobilePageIdx + 1));

  return (
    <div className="min-h-screen bg-[#05040a] relative selection:bg-[#4a3728]/20 flex flex-col items-center py-2 md:py-6 px-2 group/body overflow-hidden">
      
      {/* Global Style Tags for Typography and Ink */}
      <style>{`
        .custom-drop-cap::first-letter {
          font-family: 'Cinzel', serif;
          float: left;
          font-size: 5rem;
          line-height: 0.8;
          padding-top: 6px;
          padding-right: 12px;
          color: #6d1313;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .ink-effect {
          filter: url(#ink-bleed-filter);
          transition: filter 0.4s ease;
        }
        .ink-effect:hover {
          filter: url(#ink-bleed-filter) brightness(0.7) contrast(1.5);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(74, 55, 40, 0.15); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(74, 55, 40, 0.3); }
        
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
      `}</style>

      {/* SVG Ink Bleed Filter */}
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <filter id="ink-bleed-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" opacity="0.8" />
          </feMerge>
        </filter>
      </svg>

      <div className="fixed top-4 left-4 z-50">
        <Link to="/" className="p-2 rounded-lg text-amber-500 hover:text-amber-300 hover:bg-black/50 transition-all border border-amber-900/30 flex items-center font-cinzel text-xs uppercase bg-black/30 backdrop-blur-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Fechar Grimório
        </Link>
      </div>

      {/* DESKTOP BOOK LAYOUT */}
      <div className="hidden md:flex relative w-[98vw] max-w-[1600px] h-[94vh] mx-auto my-auto items-center justify-center">
        {/* Book Cover (Backing) */}
        <div className="absolute inset-x-[-14px] inset-y-[-14px] bg-[#1a0f0a] rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] border border-[#3e2723] z-0">
           <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 rounded-xl" />
           <div className="absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-gradient-to-r from-black/90 via-transparent to-black/90 z-0" />
        </div>

        <div 
          className="relative w-full h-full bg-[#f4e8d1] rounded-md text-[#4a3728] font-serif flex overflow-hidden transition-all duration-700 z-10"
          style={{
            backgroundImage: paperTexture,
            boxShadow: `
              inset 30px 0 60px -20px rgba(100,70,40,0.6), 
              inset -30px 0 60px -20px rgba(100,70,40,0.6),
              6px 6px 0 -1px #ebdcc0,
              6px 6px 3px -1px rgba(0,0,0,0.4),
              14px 14px 0 -2px #e3cba3,
              14px 14px 8px -2px rgba(0,0,0,0.6),
              inset 0 0 100px rgba(100, 70, 40, 0.1)
            `
          }}
        >
          {/* Paper Stains/Aging overlay */}
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-20" style={{ background: 'radial-gradient(circle at 30% 70%, rgba(109,19,19,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(74,55,40,0.12) 0%, transparent 50%), linear-gradient(90deg, rgba(0,0,0,0.05) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.05) 100%)' }} />

          {/* Ribbon Bookmark */}
          <button 
             onClick={() => setSpreadIdx(0)}
             className="absolute top-0 right-[6%] w-12 bg-[#6d1313] shadow-[2px_0_10px_rgba(0,0,0,0.5)] z-40 transition-all duration-700 hover:h-[160px] cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" 
             style={{ height: '110px', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 20px), 0 100%)' }}
             title="Voltar ao início do grimório"
          >
             <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent group-hover:from-black/10 transition-colors" />
             <div className="text-amber-200/60 text-[11px] uppercase -mt-10 tracking-widest font-bold rotate-90 origin-left ml-7 whitespace-nowrap group-hover:text-amber-200 transition-colors">Codex Magus</div>
          </button>

          {/* Book Spine Simulation */}
          <div className="absolute left-1/2 top-0 w-[2px] h-full bg-black/30 shadow-[0_0_15px_rgba(0,0,0,0.6)] z-30 -translate-x-1/2 pointer-events-none" />
          <div className="absolute left-1/2 top-0 w-24 h-full bg-gradient-to-r from-transparent via-black/20 to-transparent z-20 -translate-x-1/2 pointer-events-none mix-blend-multiply" />
          <div className="absolute left-[calc(50%-10px)] top-0 w-4 h-full bg-gradient-to-r from-transparent to-white/10 z-20 pointer-events-none" />

          {/* Left Page Content container */}
          <div className="flex-1 p-16 px-20 relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-r from-black/[0.04] to-transparent shrink-0 w-1/2 border-r border-[#4a3728]/10 opacity-100 z-10 transition-opacity">
             {bookPages[spreadIdx * 2]}
          </div>
          
          {/* Right Page Content container */}
          <div className="flex-1 p-16 px-20 relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-l from-black/[0.04] to-transparent shrink-0 w-1/2 z-10">
             {bookPages[spreadIdx * 2 + 1] || <div className="h-full flex items-center justify-center opacity-10"><Hexagon className="w-40 h-40"/></div>}
          </div>

          {/* Navigation Overlays */}
          <button 
            onClick={prevSpread} 
            disabled={spreadIdx === 0}
            className="absolute left-0 top-0 bottom-0 w-[12%] z-40 cursor-pointer disabled:pointer-events-none outline-none focus-visible:bg-[#4a3728]/5 transition-colors"
            title="Página Anterior"
            aria-label="Página Anterior"
          />
          <button 
            onClick={nextSpread} 
            disabled={spreadIdx === totalSpreads - 1}
            className="absolute right-0 top-0 bottom-0 w-[12%] z-40 cursor-pointer disabled:pointer-events-none outline-none focus-visible:bg-[#4a3728]/5 transition-colors"
            title="Próxima Página"
            aria-label="Próxima Página"
          />

          {/* Page Folio Numbers */}
          <div className="absolute bottom-6 left-12 text-sm font-cinzel font-bold text-[#4a3728]/50 z-30">{spreadIdx * 2 + 1}</div>
          <div className="absolute bottom-6 right-12 text-sm font-cinzel font-bold text-[#4a3728]/50 z-30">{spreadIdx * 2 + 2}</div>
        </div>
      </div>

      {/* MOBILE BOOK LAYOUT (Single Page view) */}
      <div className="md:hidden w-full max-w-sm flex-1 relative mt-10 mb-6 flex">
        {/* Mobile Cover Backing */}
        <div className="absolute inset-x-[-6px] inset-y-[-6px] bg-[#1a0f0a] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.9)] border border-[#3e2723] z-0">
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 rounded-lg" />
        </div>
        
        <div 
           className="w-full flex-1 bg-[#f4e8d1] rounded-sm text-[#4a3728] font-serif overflow-hidden relative flex flex-col z-10"
           style={{ 
             backgroundImage: paperTexture, 
             boxShadow: `
               inset 0 0 30px rgba(100,70,40,0.3),
               4px 4px 0 -1px #ebdcc0,
               4px 4px 3px -1px rgba(0,0,0,0.4),
               8px 8px 0 -2px #e3cba3,
               8px 8px 6px -2px rgba(0,0,0,0.5)
             ` 
           }}
        >
          {/* Paper Stains */}
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 z-20" style={{ background: 'radial-gradient(circle at 50% 10%, rgba(109,19,19,0.06) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(74,55,40,0.1) 0%, transparent 60%)' }} />

          {/* Ribbon Bookmark Mobile */}
          <button 
             onClick={() => setMobilePageIdx(0)}
             className="absolute top-0 right-[6%] w-[50px] bg-[#6d1313] shadow-[2px_0_10px_rgba(0,0,0,0.5)] z-20 transition-all duration-700 hover:h-[130px] cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500" 
             style={{ height: '120px', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 15px), 0 100%)' }}
             title="Voltar ao início do grimório"
          >
             <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent group-hover:from-black/10 transition-colors" />
          </button>

          <div className="flex-1 p-8 pb-24 overflow-y-auto custom-scrollbar relative z-10 bg-gradient-to-b from-black/[0.04] to-transparent">
             {bookPages[mobilePageIdx]}
          </div>

          {/* Invisible Navigation Overlay Left */}
          <button 
            onClick={prevMobile} 
            disabled={mobilePageIdx === 0}
            className="absolute left-0 top-0 bottom-0 w-[20%] z-30 outline-none focus-visible:bg-[#4a3728]/5 disabled:pointer-events-none"
            aria-label="Página Anterior"
          />

          {/* Invisible Navigation Overlay Right */}
          <button 
            onClick={nextMobile} 
            disabled={mobilePageIdx === bookPages.length - 1}
            className="absolute right-0 top-0 bottom-0 w-[20%] z-30 outline-none focus-visible:bg-[#4a3728]/5 disabled:pointer-events-none"
            aria-label="Próxima Página"
          />
          
          {/* Mobile Folio Numbers anchored at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#e8dec7] to-transparent flex items-end justify-center pb-4 z-20 pointer-events-none">
             <span className="font-cinzel text-sm font-bold text-[#4a3728]/60 drop-shadow-sm">{mobilePageIdx + 1} / {bookPages.length}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
