import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, ArrowLeft, BookOpen } from 'lucide-react';
import {
  CoreElement, AdditiveType, KernelType, EdgeType,
  AdditiveDescriptions, EdgeDescriptions, EdgeSymbols,
  NodeAttributesDict, KERNEL_SCALE_AXIS,
} from '../magicConstants';
import { listColleges } from '../engine/colleges';

// Mesmo design d'O Estudo Naturalista (pages/Naturalista.tsx): o mesmo
// livro-tomo de couro com páginas de pergaminho, a mesma tinta e o mesmo
// índice giratório. Mudou só o conteúdo — em vez do léxico de palavras
// livres do Naturalista, este tomo explica o sistema de verdade por trás
// do Codex (Núcleos, Aditivos, Conectivos, Kernels/Subnúcleos e as 32
// Escolas), puxando a descrição de cada coisa direto de engine/constants.ts
// e engine/colleges.ts — a mesma fonte que o compilador usa — pra nunca
// haver uma terceira versão divergente da verdade.

const paperTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`;

const ELEMENT_LABELS: Record<string, string> = {
  FOGO: 'Fogo', AGUA: 'Água', TERRA: 'Terra', AR: 'Ar', LUZ: 'Luz', SOMBRA: 'Sombra',
  COMPOR: 'Compor', DECOMPOR: 'Decompor', NONE: '',
};

const NUCLEO_FLAVOR: Record<string, string> = {
  FOGO: 'Calor puro e combustão — a face mais crua e agressiva da energia primordial. Soma força térmica e entropia ao buffer.',
  AGUA: 'Fluidez e vitalidade — o elemento que sustenta cura, gelo e correntes. Soma volume ao buffer.',
  TERRA: 'Peso e solidez inabalável — tudo que não se move fácil. Soma força física e massa ao buffer.',
  AR: 'Velocidade, som e mente — o elemento mais livre e veloz. Soma onda e som ao buffer.',
  LUZ: 'Revelação e vida — a onda radiante que ilumina o que está oculto. Soma onda e luminância ao buffer.',
  SOMBRA: 'Carne, medo e o lado oculto — físico e imaterial ao mesmo tempo. Reduz luminância e soma morfologia ao buffer.',
  COMPOR: 'Criar, juntar, trazer à existência. Soma ordem ao buffer — raramente usado sozinho como Núcleo, mas é metade da polaridade de Fusão (a Lei da Simetria) e o eixo do Kernel de Ordem.',
  DECOMPOR: 'Destruir, separar, desfazer. Soma caos ao buffer — a outra metade da polaridade de Fusão, oposta a Compor.',
};

const nucleosData = {
  titulo: 'Os 8 Núcleos',
  intro: 'Todo feitiço nasce de exatamente um Núcleo — a essência elemental que ancora a magia. Trocar o Núcleo troca a magia inteira; por isso só cabe um por vez no círculo. Esta é a única parte do sistema que nunca muda de significado: pode-se inventar quantos Aditivos novos forem precisos, mas a ideia de cada um destes 8 é fixa.',
  words: Object.values(CoreElement).map((el) => {
    const attrs = NodeAttributesDict[el] || {};
    const condicao = (attrs.debuffs || [])[0];
    const resistencia = attrs.saveAbility;
    return {
      name: ELEMENT_LABELS[el] || el,
      desc: `${NUCLEO_FLAVOR[el] || ''}${condicao ? ` Impõe a condição "${condicao}" (resistida com ${resistencia}).` : ''}`,
    };
  }),
};

const ADITIVO_ORDER = [
  AdditiveType.PONTO, AdditiveType.MANTER, AdditiveType.FORMA, AdditiveType.MOVER,
  AdditiveType.PERCEBER, AdditiveType.TESTE, AdditiveType.FUSAO, AdditiveType.GATILHO,
  AdditiveType.CONTROLE, AdditiveType.AUMENTO, AdditiveType.REDUCAO, AdditiveType.ECO,
];
const ADITIVO_NOMES: Record<string, string> = {
  PONTO: 'Ponto (alcance)', MANTER: 'Manter (duração)', FORMA: 'Forma (geometria)',
  MOVER: 'Mover', PERCEBER: 'Perceber', TESTE: 'Teste', FUSAO: 'Fusão',
  GATILHO: 'Gatilho (Capacitor)', CONTROLE: 'Controle', AUMENTO: 'Aumento', REDUCAO: 'Redução', ECO: 'Eco',
};

const aditivosData = {
  titulo: 'Os Aditivos',
  intro: 'Um Aditivo refina o que o Núcleo já é — alcance, duração, forma, ou uma capacidade nova inteira. É por aqui que o sistema cresce: pode-se somar quantos Aditivos novos forem precisos, desde que nenhum deles reescreva o significado de um Núcleo.',
  words: ADITIVO_ORDER.map((a) => ({ name: ADITIVO_NOMES[a], desc: AdditiveDescriptions[a] })),
};

const CONECTIVO_ORDER = [EdgeType.AND, EdgeType.OR, EdgeType.XOR, EdgeType.SE_ENTAO, EdgeType.ATRIBUICAO, EdgeType.CORRENTE];
const conectivosData = {
  titulo: 'Os Conectivos',
  intro: 'A linha entre dois nós no círculo não é decorativa: cada tipo de conexão muda de verdade como a magia é resolvida. Clique numa aresta pra trocar seu tipo, nesta mesma ordem. A aresta criada ao conectar dois nós começa sempre como AND — o padrão — então nenhuma magia já montada muda de comportamento sem que alguém escolha ciclar a aresta.',
  words: CONECTIVO_ORDER.map((e) => ({ name: `${EdgeSymbols[e]}  ${e}`, desc: EdgeDescriptions[e] })),
};

const KERNEL_NOMES: Record<string, string> = {
  ENTROPIA: 'Entropia', MORFOLOGIA: 'Morfologia', ESTADO: 'Estado', LUMINOSIDADE: 'Luminosidade',
  SOM: 'Som', FORCA: 'Força', VOLUME: 'Volume', ORDEM: 'Ordem', CAOS: 'Caos',
};

const kernelsData = {
  titulo: 'Kernels & Subnúcleos',
  intro: 'Um Subcírculo é um parêntese: um círculo mágico menor, dentro do círculo principal, com sua própria topologia fechada — serve pra agrupar um pedaço da magia à parte. Um Kernel é um Subcírculo com um propósito já definido: um dos 9 eixos abaixo, mais específico que o Núcleo puro, e que por isso sobrescreve a condição/resistência dele quando ativo. Cada Kernel escala a magia por Aumento (amplitude do efeito) ou por Complexibilidade (muda a própria natureza do efeito).',
  words: Object.values(KernelType).map((k) => {
    const attrs = NodeAttributesDict[k] || {};
    const condicao = (attrs.debuffs || [])[0];
    const resistencia = attrs.saveAbility;
    const eixo = KERNEL_SCALE_AXIS[k];
    return {
      name: KERNEL_NOMES[k] || k,
      desc: `${AdditiveDescriptions[k] || ''} Eixo: ${eixo}.${condicao ? ` Refina a condição para "${condicao}" (resistida com ${resistencia}).` : ''}`,
    };
  }),
};

const KIND_LABEL: Record<string, string> = {
  base: 'Colégio Base (Núcleo puro, sem Fusão)',
  polar: 'Par Criar/Destruir (polaridade de Fusão)',
  combo: 'Combinação de dois elementos',
};

const escolasData = {
  titulo: 'As 32 Escolas (Colégios)',
  intro: 'Fundir o Núcleo com um segundo elemento (ou com Compor/Decompor como polaridade), através do aditivo Fusão, revela um dos 32 Colégios abaixo — um nome e um vocabulário totalmente diferentes do Núcleo puro, que mudam o que a magia É, não só o que ela faz. Um par Criar/Destruir também muda os números: Criar (Compor) é a versão permanente e cara; Destruir (Decompor) é a efêmera e barata — a Lei da Simetria.',
  words: listColleges().map((c) => {
    const formadoPor = c.key.split('+').filter((e) => e !== 'NONE').map((e) => ELEMENT_LABELS[e] || e).join(' + ');
    return {
      name: `Nº ${c.number} — ${c.name}`,
      desc: `${KIND_LABEL[c.kind]}. Formado por: ${formadoPor}. Vocabulário: ${c.vocabulary}.`,
    };
  }),
};

const lexiconData: Record<string, any> = {
  nucleos: nucleosData,
  aditivos: aditivosData,
  conectivos: conectivosData,
  kernels: kernelsData,
  escolas: escolasData,
};

export const LivroMagias = () => {
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [mobilePageIdx, setMobilePageIdx] = useState(0);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  // Components for each page
  const CapCapa = () => (
    <div className="h-full animate-in fade-in duration-700">
      <h1 className="font-cinzel text-3xl font-bold text-center text-[#4a3728] mb-8 border-b border-[#4a3728]/20 pb-4">O Grande Tomo</h1>
      <p className="custom-drop-cap font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-4 text-justify">
        Este não é um grimório de feitiços prontos. É a gramática por trás de todos eles — a mesma que o Codex usa pra ler o círculo que você desenha e compilar uma magia de verdade. Aqui estão os oito Núcleos que nunca mudam de sentido, os Aditivos que os refinam, os Conectivos que ligam uma peça à outra, os Kernels que aprofundam um eixo específico, e as 32 Escolas que nascem quando dois elementos se fundem.
      </p>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-6 text-justify">
        Cada palavra escrita aqui é a mesma que o motor de compilação lê — não uma cópia que pode se desatualizar, mas o mesmo texto na origem. Se o Codex se comporta de um jeito, é porque este Tomo descreve exatamente esse jeito.
      </p>
      <blockquote className="font-cinzel text-2xl font-bold text-center text-[#6d1313] my-10 py-6 border-y border-[#4a3728]/20 ink-effect">
        "Pode-se inventar quantos Aditivos forem precisos;<br/>a ideia de um Núcleo, nunca."
      </blockquote>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] text-justify">
        Use o Índice a seguir pra consultar qualquer peça do sistema.
      </p>
    </div>
  );

  const CapPipeline = () => (
    <div className="h-full animate-in fade-in duration-700">
      <h1 className="font-cinzel text-3xl font-bold text-center text-[#4a3728] mb-8 border-b border-[#4a3728]/20 pb-4">Como a Magia se Monta</h1>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-6 text-justify">
        Todo feitiço é resolvido em quatro camadas, sempre nesta ordem:
      </p>

      <h3 className="font-cinzel font-bold text-[#6d1313] text-xl mb-2 ink-effect">Núcleo — o substantivo</h3>
      <p className="font-serif text-[1.05rem] leading-relaxed text-[#2c1d11] text-justify mb-2">
        Um só por magia. Define a essência: o que a energia É antes de qualquer refinamento.
      </p>

      <h3 className="font-cinzel font-bold text-[#3e2723] text-xl mb-2 ink-effect mt-6">Aditivos e Kernels — o que refina</h3>
      <p className="font-serif text-[1.05rem] leading-relaxed text-[#2c1d11] text-justify mb-2">
        Alcance, duração, forma, um modo inteiro novo (Mover, Perceber, Fusão, Gatilho), ou um eixo mais específico (um Kernel dentro de um Subcírculo). Cada um soma seus próprios números a um único vetor — o Buffer.
      </p>

      <div className="font-mono text-center bg-[#4a3728]/10 py-3 rounded mb-6 font-bold text-[#3e2723] border border-[#4a3728]/20 shadow-inner">
        [ Núcleo ] + [ Aditivos ] + [ Kernels ] --(soma)--&gt; [ Buffer ]
      </div>

      <h3 className="font-cinzel font-bold text-[#6d1313] text-xl mb-2 ink-effect">Conectivos — como as peças se relacionam</h3>
      <p className="font-serif text-[1.05rem] leading-relaxed text-[#2c1d11] text-justify mb-6">
        A linha entre dois nós decide se eles só coexistem (AND, o padrão), se são uma escolha do conjurador (OR/XOR), uma condição (SE_ENTAO), uma canalização de um pro outro (ATRIBUICAO) ou uma cadeia de alvos (CORRENTE).
      </p>

      <div className="p-5 border-l-4 border-l-[#6d1313] bg-[#6d1313]/5 relative ink-effect overflow-hidden">
        <h4 className="font-cinzel font-bold text-[#6d1313] text-lg mb-1">Avisos do Grão-Mestre</h4>
        <p className="font-serif italic text-[#3e2723] leading-relaxed">
          "O Buffer só soma, nunca multiplica. Duas fontes do mesmo número sempre se somam — o motor não conhece exponenciais, só adição honesta."
        </p>
      </div>
    </div>
  );

  const CapIndice = () => {
    const [hoverCat, setHoverCat] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const categorias = [
      { id: 'nucleos', titulo: 'Núcleos', desc: 'Os 8 elementos primordiais', color: '#b91c1c' },
      { id: 'aditivos', titulo: 'Aditivos', desc: 'O que refina cada Núcleo', color: '#047857' },
      { id: 'conectivos', titulo: 'Conectivos', desc: 'Como as peças se ligam', color: '#1d4ed8' },
      { id: 'kernels', titulo: 'Kernels & Subnúcleos', desc: 'Eixos específicos dentro de um Subcírculo', color: '#6d28d9' },
      { id: 'escolas', titulo: 'Escolas', desc: 'Os 32 Colégios revelados por Fusão', color: '#b45309' },
    ];

    // Um polígono regular diferente por categoria, só pra variar a
    // geometria do círculo de fundo — sem significado mecânico algum.
    const polygonPoints = (sides: number) => {
      const pts: string[] = [];
      for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        pts.push(`${100 + 85 * Math.cos(angle)},${100 + 85 * Math.sin(angle)}`);
      }
      return pts.join(' ');
    };

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
        <div className="relative z-10 flex flex-col items-center h-full pt-4">
          <h1 className="font-cinzel text-4xl font-bold text-center text-[#4a3728] mb-1">O Índice do Tomo</h1>
          <svg className="w-48 h-6 opacity-60 mb-2" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,10 Q50,0 100,10 Q50,20 0,10" fill="none" stroke="#4a3728" strokeWidth="0.5" />
          </svg>

          <div className="relative flex-1 w-full max-w-sm flex items-center justify-center -mt-4">

            {/* Magic Circle Backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-colors duration-1000">
              <svg viewBox="0 0 200 200" className="w-[300px] h-[300px] absolute animate-spin-slow transition-colors duration-500" style={{ stroke: activeColor, animationDuration: '45s' }}>
                <circle cx="100" cy="100" r="95" fill="none" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.5" />
                <circle cx="100" cy="100" r="90" fill="none" strokeWidth="0.25" opacity="0.3" />
                {categorias.map((cat, i) => hoverCat === cat.id && (
                  <polygon key={cat.id} points={polygonPoints(3 + i)} fill="none" strokeWidth="0.8" opacity="0.6" />
                ))}
                {!hoverCat && <circle cx="100" cy="100" r="45" fill="none" strokeWidth="0.5" strokeDasharray="1 8" opacity="0.3" />}
              </svg>
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

            <div className="relative z-10 flex flex-col w-full px-10 space-y-5">
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
                    className={`font-cinzel text-xl font-bold tracking-widest inline-block transition-colors duration-500
                     ${selectedSub === cat.id ? 'opacity-100 scale-105' : 'opacity-80'}`}
                    style={{ color: hoverCat === cat.id ? cat.color : '#4a3728', textShadow: hoverCat === cat.id ? `0 0 8px ${cat.color}60` : 'none' }}
                  >
                    {cat.titulo}
                  </span>
                  <div className="font-serif text-xs italic text-[#4a3728]/60 mt-0.5">{cat.desc}</div>
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
        <h1 className="font-cinzel text-2xl font-bold text-center text-[#6d1313] mb-4 border-b border-[#6d1313]/20 pb-4 uppercase tracking-widest leading-relaxed ink-effect">
          {data.titulo}
        </h1>
        {data.intro && (
          <p className="font-serif text-[1rem] italic leading-relaxed text-[#2c1d11]/80 text-justify mb-8">
            {data.intro}
          </p>
        )}
        <div className="space-y-8">
          {data.words.map((w: any, idx: number) => (
            <div key={idx} className="group hover:-translate-y-0.5 transition-transform">
              <h3 className="font-cinzel font-bold text-xl text-[#3e2723] group-hover:text-[#6d1313] flex items-center gap-2 mb-2 transition-colors ink-effect">
                {w.name}
              </h3>
              <p className="font-serif text-[#2c1d11] text-[1.1rem] leading-relaxed text-justify relative pl-4 border-l-2 border-transparent group-hover:border-[#6d1313]/20 transition-all">
                {w.desc}
              </p>
            </div>
          ))}
        </div>
        <button
          className="md:hidden mt-10 font-bold text-sm text-[#4a3728] uppercase border border-[#4a3728]/30 px-4 py-2 mx-auto flex"
          onClick={() => setMobilePageIdx(2)}
        >
          Voltar ao Índice
        </button>
      </div>
    );
  };

  const CapLeiSimetria = () => (
    <div className="h-full animate-in fade-in duration-700">
      <h1 className="font-cinzel text-3xl font-bold text-center text-[#4a3728] mb-8 border-b border-[#4a3728]/20 pb-4">A Lei da Simetria</h1>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] mb-6 text-justify custom-drop-cap">
        Toda Fusão carrega uma polaridade: fundir com Compor é Criar — a versão real e permanente, que custa mais mana; fundir com Decompor é Destruir — a versão efêmera, que custa menos. Isso não é só um adjetivo na descrição: os números da magia mudam de verdade.
      </p>
      <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] text-justify mt-8">
        Criar soma complexidade e potência ao Buffer — o que eleva o nível e a CD da magia. Destruir subtrai as mesmas coisas. O mesmo par de elementos gera dois Colégios com nomes, vocabulário e peso numérico diferentes — nunca dois nomes pro mesmo efeito.
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

  const exemplosData = [
    { name: 'Dardo de Fogo', receita: 'Fogo + Ponto (2)', desc: 'A receita mais simples possível: um Núcleo e um alcance. Um ataque à distância, sem teste, sem geometria — o "Fire Bolt" do sistema.' },
    { name: 'Explosão em Área', receita: 'Fogo + Ponto (2) + Forma (Esfera Remota)', desc: 'Forma só existe pra refinar Ponto: no nível 2 (Alcance), Esfera Remota transforma o projétil numa detonação em área, testada por Destreza.' },
    { name: 'Colégio da Transmutação', receita: 'Fogo + Fusão (Terra)', desc: 'Fogo puro seria o Colégio do Arcano; fundido com Terra (sem polaridade Criar/Destruir), revela o Colégio da Transmutação — "matéria transformada para sempre".' },
    { name: 'Armadilha de Impacto', receita: 'Terra + Gatilho (3, Impacto) + SE_ENTAO (Gatilho → Aumento)', desc: 'O Gatilho guarda a magia num glifo por 3 cargas; a aresta SE_ENTAO condiciona o bônus de Aumento a só se manifestar quando o gatilho realmente disparar.' },
  ];

  const CapExemplos = () => (
    <div className="h-full animate-in fade-in duration-700 space-y-10">
      <h1 className="font-cinzel text-2xl font-bold text-center text-[#4a3728] mb-2 border-b border-[#4a3728]/20 pb-4">Receitas de Exemplo</h1>
      {exemplosData.map((ex, i) => (
        <div key={i} className="relative pl-6 group">
          <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#6d1313]/40 to-[#6d1313]/5" />
          <h3 className="font-cinzel font-bold text-2xl text-[#3e2723] flex flex-col justify-between mb-1 group-hover:text-[#6d1313] transition-colors ink-effect">
            {ex.name}
            <span className="font-mono text-sm tracking-widest text-[#6d1313] uppercase mt-2 bg-[#6d1313]/10 self-start px-2 py-0.5 rounded border border-[#6d1313]/20">
              {ex.receita}
            </span>
          </h3>
          <p className="font-serif text-[1.1rem] leading-relaxed text-[#2c1d11] text-justify mt-3 block">
            {ex.desc}
          </p>
        </div>
      ))}
    </div>
  );

  // Array total of ordered content logically
  const bookPages = [
    <CapCapa key="p0" />,
    <CapPipeline key="p1" />,
    <CapIndice key="p2" />,
    <CapLexico key="p3" />,
    <CapLeiSimetria key="p4" />,
    <CapExemplos key="p5" />,
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
          filter: url(#ink-bleed-filter-tomo);
          transition: filter 0.4s ease;
        }
        .ink-effect:hover {
          filter: url(#ink-bleed-filter-tomo) brightness(0.7) contrast(1.5);
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

      {/* SVG Ink Bleed Filter (id sufixado -tomo pra nunca colidir com o
          mesmo filtro definido em pages/Naturalista.tsx, caso algum dia as
          duas páginas troquem de rota sem um reload completo) */}
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <filter id="ink-bleed-filter-tomo" x="-20%" y="-20%" width="140%" height="140%">
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
          <ArrowLeft className="w-4 h-4 mr-2" /> Fechar Tomo
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
            title="Voltar ao início do tomo"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent group-hover:from-black/10 transition-colors" />
            <div className="text-amber-200/60 text-[11px] uppercase -mt-10 tracking-widest font-bold rotate-90 origin-left ml-7 whitespace-nowrap group-hover:text-amber-200 transition-colors">Grande Tomo</div>
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
            {bookPages[spreadIdx * 2 + 1] || <div className="h-full flex items-center justify-center opacity-10"><Hexagon className="w-40 h-40" /></div>}
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
            title="Voltar ao início do tomo"
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
