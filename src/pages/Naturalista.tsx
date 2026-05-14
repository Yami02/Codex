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
    const categorias = [
      { id: 'nucleos', titulo: 'Núcleos', desc: 'Substantivos e Elementos Primordiais' },
      { id: 'morfologia', titulo: 'Morfologia', desc: 'Adjetivos e Formas Geométricas' },
      { id: 'vetores', titulo: 'Vetores', desc: 'Verbos e Orientação Espacial' },
      { id: 'modificadores', titulo: 'Modificadores', desc: 'Advérbios e Distorções' }
    ];

    return (
      <div className="h-full animate-in fade-in duration-700 flex flex-col">
        <h1 className="font-cinzel text-3xl font-bold text-center text-[#4a3728] mb-8 border-b border-[#4a3728]/20 pb-4">O Índice de Componentes</h1>
        <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-10 text-center italic">
          Toque a designação desejada para desdobrar a tapeçaria das palavras.
        </p>
        
        <div className="flex-1 flex flex-col justify-center space-y-6 max-w-sm mx-auto w-full">
           {categorias.map(cat => (
             <button 
                key={cat.id} 
                onClick={() => {
                  setSelectedSub(cat.id);
                  // se estivermos no mobile e clicarmos no indice, precisamos ir para a pag do lexico tb
                  if (window.innerWidth < 768) {
                    setMobilePageIdx(3);
                  }
                }}
                className={`w-full text-left group flex items-end gap-2 pb-1 border-b border-transparent hover:border-[#6d1313]/30 transition-colors ${selectedSub === cat.id ? 'text-[#6d1313]' : 'text-[#3e2723]'}`}
             >
               <span className="font-cinzel font-bold text-2xl group-hover:text-[#6d1313] transition-colors ink-effect">{cat.titulo}</span>
               <span className="flex-1 border-b-2 border-dotted border-[#4a3728]/30 relative -top-1.5 mx-2 group-hover:border-[#6d1313]/50 transition-colors" />
             </button>
           ))}
        </div>

        <div className="mt-auto text-center opacity-40 pb-6">
          <svg width="60" height="60" viewBox="0 0 100 100" className="mx-auto stroke-[#4a3728] fill-transparent stroke-[1]">
             <polygon points="50,10 90,80 10,80" />
             <circle cx="50" cy="56" r="16" />
          </svg>
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
          
          {/* Mobile Navigation bar anchored at bottom inside page */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#e8dec7] via-[#e8dec7]/90 to-transparent flex items-end justify-between px-6 pb-5 z-30 pointer-events-none">
             <button 
               onClick={prevMobile} 
               disabled={mobilePageIdx === 0}
               className="pointer-events-auto p-2 text-[#6d1313] disabled:opacity-0"
             >
               <ChevronLeft className="w-8 h-8 drop-shadow" />
             </button>
             <span className="font-cinzel text-sm font-bold text-[#4a3728]/60 pb-3 drop-shadow-sm">{mobilePageIdx + 1} / {bookPages.length}</span>
             <button 
               onClick={nextMobile} 
               disabled={mobilePageIdx === bookPages.length - 1}
               className="pointer-events-auto p-2 text-[#6d1313] disabled:opacity-0"
             >
               <ChevronRight className="w-8 h-8 drop-shadow" />
             </button>
          </div>
        </div>
      </div>

    </div>
  );
};
