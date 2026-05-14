import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Hexagon, Sparkles, Wind, Droplets, Flame, Mountain, Zap, Skull, Shield, Target } from 'lucide-react';

export const Naturalista = () => {
  return (
    <div className="min-h-screen bg-[#05040a] text-zinc-200 font-sans selection:bg-amber-500/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#05040a]/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all outline-none focus-visible:ring-2 ring-amber-500 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h1 className="font-cinzel text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-500">
              Grimório do Naturalismo
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 md:px-8 mt-12 space-y-16">
        
        {/* Title Section */}
        <section className="text-center space-y-6">
          <Hexagon className="w-16 h-16 text-emerald-500 mx-auto opacity-80" />
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-amber-100 uppercase tracking-widest text-glow">
            A Arquitetura do Pensamento
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-serif max-w-2xl mx-auto leading-relaxed">
            O Naturalismo é a sublime arte de traduzir a vontade absoluta em sentenças lógicas, moldando a tessitura da realidade através do fluxo estruturado da mente.
          </p>
        </section>

        {/* Caminhos */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-emerald-900/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="font-cinzel text-xl font-bold text-emerald-300 mb-2">O Caminho da Manipulação (Eco)</h3>
            <p className="text-zinc-400 font-serif leading-relaxed">
              Dita o reaproveitamento do ambiente. Sentenças iniciadas por este caminho utilizam recursos externos, refratando o caos natural para alcançar seu fim sem exaurir a essência do conjurador.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-purple-900/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-cinzel text-xl font-bold text-purple-300 mb-2">O Caminho da Criação (Gênese)</h3>
            <p className="text-zinc-400 font-serif leading-relaxed">
              Manifestação pura do Vazio para a Matéria. O fluxo da Gênese consome recursos internos (mana), forjando elementos que não existem no plano atual puramente a partir da vontade.
            </p>
          </div>
        </section>

        {/* Dicionário de Atributos */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-zinc-800 flex-1" />
            <h2 className="font-cinzel text-3xl font-bold text-amber-200 uppercase tracking-widest text-center">
              Dicionário de Atributos (O Léxico)
            </h2>
            <div className="h-px bg-zinc-800 flex-1" />
          </div>

          {/* Núcleos */}
          <div className="bg-[#0a0910] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-cinzel text-2xl font-bold text-white border-b border-white/10 pb-4">
              Núcleos (Substantivos)
            </h3>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-center justify-between">
                <span className="font-bold text-red-400">Pyros</span>
                <Flame className="w-5 h-5 text-red-500 opacity-60" />
              </div>
              <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-xl flex items-center justify-between">
                <span className="font-bold text-blue-400">Hydrim</span>
                <Droplets className="w-5 h-5 text-blue-500 opacity-60" />
              </div>
              <div className="p-4 bg-stone-900/40 border border-stone-800/60 rounded-xl flex items-center justify-between">
                <span className="font-bold text-stone-400">Geon</span>
                <Mountain className="w-5 h-5 text-stone-500 opacity-60" />
              </div>
              <div className="p-4 bg-sky-950/20 border border-sky-900/30 rounded-xl flex items-center justify-between">
                <span className="font-bold text-sky-400">Aethos</span>
                <Wind className="w-5 h-5 text-sky-500 opacity-60" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">A Dualidade</h4>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-yellow-900/20 text-yellow-500 border border-yellow-900/30 rounded text-sm font-bold">Lumen (Luz)</span>
                  <span className="text-zinc-600">≡</span>
                  <span className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-sm font-bold">Stasis (Ordem)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-black text-purple-500 border border-purple-900/50 rounded text-sm font-bold">Skotos (Trevas)</span>
                  <span className="text-zinc-600">≡</span>
                  <span className="px-3 py-1.5 bg-rose-950/30 text-rose-500 border border-rose-900/30 rounded text-sm font-bold">Entrop (Caos)</span>
                </div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">O Núcleo Proibido</h4>
                 <div className="p-4 border border-red-900 border-dashed rounded-lg bg-red-950/10">
                   <div className="flex items-center gap-3 text-red-500 font-bold mb-2">
                     <Skull className="w-5 h-5" /> Wis
                   </div>
                   <p className="text-xs text-zinc-400 leading-relaxed font-serif">A essência anímica. Manipulá-la fere as leis primordiais do mundo, resultando na distorção do próprio Ser.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Morfologia */}
            <div className="bg-[#0a0910] border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="font-cinzel text-xl font-bold text-white border-b border-white/10 pb-4 mb-4">
                Morfologia (Formas)
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-3 bg-zinc-900/30 rounded-lg">
                  <span className="font-bold text-amber-500 mt-1">Esfer</span>
                  <p className="text-sm text-zinc-400 font-serif">Concentração pontual e maciça, seja um orbe denso ou uma gota gravitacional.</p>
                </li>
                <li className="flex items-start gap-4 p-3 bg-zinc-900/30 rounded-lg">
                  <span className="font-bold text-amber-500 mt-1">Lamin</span>
                  <p className="text-sm text-zinc-400 font-serif">Estrutura bidimensional cortante ou achatada, projetada para seccionar ou planar.</p>
                </li>
                <li className="flex items-start gap-4 p-3 bg-zinc-900/30 rounded-lg">
                  <span className="font-bold text-amber-500 mt-1">Velo</span>
                  <p className="text-sm text-zinc-400 font-serif">Estrutura maleável, expansiva e fluida. Uma barreira, um manto ou uma névoa difusa.</p>
                </li>
              </ul>
            </div>

            {/* Vetores */}
            <div className="bg-[#0a0910] border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="font-cinzel text-xl font-bold text-white border-b border-white/10 pb-4 mb-4">
                Vetores (Orientação)
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-3 bg-zinc-900/30 rounded-lg">
                  <span className="font-bold text-blue-400 mt-1">Auto</span>
                  <p className="text-sm text-zinc-400 font-serif">Direciona o fluxo sobre o próprio conjurador ou sobre o núcleo emitido.</p>
                </li>
                <li className="flex items-start gap-4 p-3 bg-zinc-900/30 rounded-lg">
                  <span className="font-bold text-blue-400 mt-1">Tato</span>
                  <p className="text-sm text-zinc-400 font-serif">Transmissão por contato direto no momento inicial da sentença.</p>
                </li>
                <li className="flex items-start gap-4 p-3 bg-zinc-900/30 rounded-lg">
                  <span className="font-bold text-blue-400 mt-1">Zon</span>
                  <p className="text-sm text-zinc-400 font-serif">Definição livre de coordenadas geométricas em um raio visível.</p>
                </li>
                <li className="flex items-start gap-4 p-3 bg-zinc-900/30 rounded-lg">
                  <span className="font-bold text-blue-400 mt-1">Vectus</span>
                  <p className="text-sm text-zinc-400 font-serif">Projeção direcional e retilínea, impulsionada a partir do conjurador ou foco.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sintaxe do Compilador */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <h2 className="font-cinzel text-3xl font-bold text-amber-200 uppercase tracking-widest mb-6">
            A Sintaxe do Compilador
          </h2>
          <p className="text-zinc-400 font-serif mb-8 text-lg">
            A gramática da vontade é inflexível. A ordem exata da sentença determina a fonte do recurso energético.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-500" />
                <h3 className="font-bold text-lg text-emerald-100">Elemento Overture (Eco)</h3>
              </div>
              <div className="bg-black/30 p-4 rounded-lg font-mono text-sm border-l-4 border-emerald-500">
                <span className="text-emerald-400 font-bold">[ELEMENTO]</span> + <span className="text-amber-500">[FORMA]</span> + <span className="text-blue-400">[VETOR]</span>
              </div>
              <p className="mt-4 text-sm text-zinc-400 font-serif leading-relaxed">
                Se a frase inicia com o <strong>Elemento</strong>, o compilador exige a preexistência do mesmo no ambiente para moldá-lo. O custo interno é irrisório; o fluxo manipula o que já há.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-purple-500" />
                <h3 className="font-bold text-lg text-purple-100">Forma Overture (Gênese)</h3>
              </div>
              <div className="bg-black/30 p-4 rounded-lg font-mono text-sm border-l-4 border-purple-500">
                <span className="text-amber-500 font-bold">[FORMA]</span> + <span className="text-emerald-400">[ELEMENTO]</span> + <span className="text-blue-400">[VETOR]</span>
              </div>
              <p className="mt-4 text-sm text-zinc-400 font-serif leading-relaxed">
                Se a frase inicia com a <strong>Forma</strong>, a realidade é forçada a gerar substância a partir do nada. Este caminho da Criação consome avidamente os recursos internos (mana) daquele que entoa o fluxo.
              </p>
            </div>
          </div>
        </section>

        {/* Lógica de Combinação */}
        <section className="space-y-6">
          <h2 className="font-cinzel text-3xl font-bold text-amber-200 uppercase tracking-widest text-center">
            Mutações e Lógica de Combinação
          </h2>
          <p className="text-center text-zinc-400 font-serif max-w-2xl mx-auto">
            A gramática naturalista permite a infusão de preceitos puritanos ou distópicos (Ordem e Caos) sobre elementos puros, gerando matrizes exóticas.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
             <div className="p-4 bg-zinc-900 border border-zinc-700/50 rounded-lg flex flex-col justify-center items-center text-center">
               <div className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Sinergia com Entrop (Caos)</div>
               <div className="font-mono text-lg mb-2">Aethos + Entrop <span className="text-zinc-500">→</span> <span className="text-purple-400 font-bold">Fulgur</span></div>
               <span className="text-xs text-zinc-500 font-serif italic">(Vento sob caos agita o ar, destilando Eletricidade e Trovão)</span>
             </div>
             <div className="p-4 bg-zinc-900 border border-zinc-700/50 rounded-lg flex flex-col justify-center items-center text-center">
               <div className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Sinergia com Entrop (Caos)</div>
               <div className="font-mono text-lg mb-2">Hydrim + Entrop <span className="text-zinc-500">→</span> <span className="text-green-400 font-bold">Venen</span></div>
               <span className="text-xs text-zinc-500 font-serif italic">(O fluxo da água, corrompido, apodrece e converte-se em Ácido ou Veneno)</span>
             </div>
          </div>

          <div className="overflow-x-auto mt-8 border border-white/5 rounded-xl shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-zinc-300 text-xs uppercase tracking-widest font-bold">
                  <th className="p-4 border-b border-white/5">Modificador</th>
                  <th className="p-4 border-b border-white/5">Nome Formal</th>
                  <th className="p-4 border-b border-white/5">Efeito Gramatical</th>
                </tr>
              </thead>
              <tbody className="bg-[#0a0910] text-sm text-zinc-400 font-serif">
                <tr className="border-b border-white/5 hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-amber-500 font-mono">Muto</td>
                  <td className="p-4 text-zinc-200">Isótopo Transmutativo</td>
                  <td className="p-4">Altera o estado do elemento (ex: Pyros Muto transforma chamas em calor puro).</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-amber-500 font-mono">Pluri</td>
                  <td className="p-4 text-zinc-200">Fratura Multiplicadora</td>
                  <td className="p-4">Fragmenta a Forma em instâncias menores da mesma sentença original.</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-amber-500 font-mono">Chron</td>
                  <td className="p-4 text-zinc-200">Dilatação Temporal</td>
                  <td className="p-4">Atrasa ou acopla o instante em que a frase será executada após dita.</td>
                </tr>
                <tr className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-bold text-amber-500 font-mono">Tenax</td>
                  <td className="p-4 text-zinc-200">Ancoragem Perpétua</td>
                  <td className="p-4">Estabiliza a matriz impulsionando uma duração extensa ou semipermanente.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Feitiços Prontos */}
        <section className="mb-20">
          <h2 className="font-cinzel text-3xl font-bold text-amber-200 uppercase tracking-widest text-center mb-10">
            Escritura (Exemplos de Feitiços Prontos)
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-950/20 to-[#0a0910] rounded-xl border border-red-900/30 p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="p-4 rounded-full bg-red-900/20 text-red-500 shrink-0">
                <Flame className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-zinc-100 mb-1">Sete Esferas do Círculo Interno</h3>
                <div className="font-mono text-red-400 font-bold mb-3 tracking-wider text-sm bg-black/40 inline-block px-3 py-1 rounded">
                  Pyros Esfer Pluri Zon
                </div>
                <p className="text-zinc-400 text-sm font-serif leading-relaxed">
                  Busca o calor latente do ambiente (Eco). Gera orbes esféricos, multiplica-os através do isótopo Pluri, e os ancora numa coordenada fixa ao redor do conjurador. Cria um campo flutuante de bolas de fogo defensivas.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-950/20 to-[#0a0910] rounded-xl border border-blue-900/30 p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="p-4 rounded-full bg-blue-900/20 text-blue-500 shrink-0">
                <Wind className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-zinc-100 mb-1">Lâmina Átropa</h3>
                <div className="font-mono text-blue-400 font-bold mb-3 tracking-wider text-sm bg-black/40 inline-block px-3 py-1 rounded">
                  Lamin Aethos Entrop Vectus
                </div>
                <p className="text-zinc-400 text-sm font-serif leading-relaxed">
                  Inicia pela forma, exigindo sacrifício interno de mana (Gênese). Torce o vento com distorção caótica (Fulgur), forjando um disco bidimensional de relâmpago que é lançado retilineamente contra o oponente. Um corte veloz e estático.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-stone-900/20 to-[#0a0910] rounded-xl border border-stone-800/50 p-6 flex flex-col md:flex-row gap-6 items-center">
               <div className="p-4 rounded-full bg-stone-900/20 text-stone-500 shrink-0">
                 <Shield className="w-8 h-8" />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-xl text-zinc-100 mb-1">Pele Petrificada Perene</h3>
                 <div className="font-mono text-stone-400 font-bold mb-3 tracking-wider text-sm bg-black/40 inline-block px-3 py-1 rounded">
                   Velo Geon Stasis Auto Tenax
                 </div>
                 <p className="text-zinc-400 text-sm font-serif leading-relaxed">
                   Cria a partir da vontade uma membrana em pó (Velo), usando terra refinada pela ordem (Geon Stasis = Cristal/Diamante). O alvo é o próprio conjurador, e a ancoragem a mantém estável muito além dos limites padrão de duração de fluxo.
                 </p>
               </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

