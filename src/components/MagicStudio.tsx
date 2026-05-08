import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, 
  Sparkles, 
  Code, 
  Database, 
  Scroll, 
  AlertTriangle, 
  Loader2,
  Copy,
  Terminal,
  Layers
} from 'lucide-react';
import { MagicGraph, CompiledSpell } from '../types/magic';
import { MagicCanvas } from './MagicCanvas';
import { compileArcaneDSL } from '../services/geminiService';

type ViewMode = 'visual' | 'json' | 'canvas';

export const MagicStudio: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('Sangue >> (Projetil & [Veneno >> Gasoso]) ^ Persistente');
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledSpell, setCompiledSpell] = useState<CompiledSpell | null>(null);
  const [graphJson, setGraphJson] = useState<MagicGraph | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompile = async () => {
    if (!inputCode.trim()) return;

    setErrorMsg(null);
    setIsCompiling(true);
    setCompiledSpell(null);
    setGraphJson(null);

    try {
      const result = await compileArcaneDSL(inputCode);
      setCompiledSpell(result.spell);
      setGraphJson(result.graph);
      if (viewMode === 'visual' && !result.spell) setViewMode('canvas');
    } catch (err) {
      setErrorMsg('Falha na ressonância arcânica: O compilador Gemini encontrou uma distorção na rede lógica.');
      console.error(err);
    } finally {
      setIsCompiling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      {/* Top Input Area */}
      <div className="p-6 bg-slate-900 border-b border-slate-800 shadow-xl z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Wand2 className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-serif tracking-tight">Estúdio Arcânico v2</h1>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Compiler Interface // AI Enabled</p>
          </div>
        </div>
        
        <div className="relative group">
          <textarea
            className="w-full h-32 p-4 bg-slate-950 text-emerald-400 font-mono text-sm border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all resize-none shadow-inner"
            placeholder="Ex: Fogo >> (Projetil & [Veloz >> Instantaneo])"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            spellCheck="false"
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button 
              onClick={handleCompile}
              disabled={isCompiling}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 text-slate-950 font-bold rounded-lg shadow-lg transition-all active:scale-95 group-hover:shadow-yellow-500/10"
            >
              {isCompiling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Compilando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Conjurar Lógica
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border-b border-red-500/20 overflow-hidden"
          >
            <div className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-400 text-sm">Instabilidade Crítica</h3>
                <p className="text-xs text-red-300/80 font-mono mt-1">{errorMsg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {(compiledSpell || graphJson) ? (
          <>
            {/* View Controls */}
            <div className="flex bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-20">
              <ViewTab 
                active={viewMode === 'canvas'} 
                onClick={() => setViewMode('canvas')}
                icon={<Layers className="w-4 h-4" />}
                label="Canvas Nodal"
                color="purple"
              />
              <ViewTab 
                active={viewMode === 'visual'} 
                onClick={() => setViewMode('visual')}
                icon={<Scroll className="w-4 h-4" />}
                label="Grimório (5e)"
                color="yellow"
              />
              <ViewTab 
                active={viewMode === 'json'} 
                onClick={() => setViewMode('json')}
                icon={<Code className="w-4 h-4" />}
                label="Estrutura Interna"
                color="blue"
              />
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-auto bg-slate-950 custom-scrollbar">
              <AnimatePresence mode="wait">
                {viewMode === 'canvas' && graphJson && (
                  <motion.div 
                    key="canvas"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="h-full"
                  >
                    <MagicCanvas graph={graphJson} width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight - 300 : 600} />
                  </motion.div>
                )}

                {viewMode === 'visual' && compiledSpell && (
                  <motion.div 
                    key="visual"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 flex justify-center"
                  >
                    <div className="w-full max-w-2xl bg-[#fdfaf1] text-slate-900 rounded-sm shadow-2xl p-8 border-[12px] border-double border-amber-900/10 font-serif relative overflow-hidden">
                      {/* Paper Texture Overlay */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
                      
                      <div className="relative z-10">
                        <header className="border-b-2 border-amber-900/20 pb-4 mb-6">
                          <h2 className="text-4xl font-black text-amber-950 uppercase tracking-tighter">
                            {compiledSpell.spellName}
                          </h2>
                          <div className="flex items-center gap-2 text-amber-800/80 italic mt-1 font-medium italic">
                            <Sparkles className="w-4 h-4" />
                            {compiledSpell.level}º nível, {compiledSpell.school}
                          </div>
                        </header>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-b border-amber-900/10 pb-6 mb-6">
                          <SpellDetail label="Tempo de Conjuração" value={compiledSpell.castingTime} />
                          <SpellDetail label="Alcance" value={compiledSpell.range} />
                          <SpellDetail label="Componentes" value={compiledSpell.components} />
                          <SpellDetail label="Duração" value={compiledSpell.duration} />
                        </div>

                        <div className="space-y-4">
                          <p className="text-amber-950 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                            {compiledSpell.damageOrEffect}
                          </p>
                        </div>

                        {compiledSpell.instabilities.length > 0 && (
                          <div className="mt-8 p-4 bg-red-950/5 border border-red-950/10 rounded font-sans italic text-sm text-red-950">
                            <div className="flex items-center gap-2 font-bold uppercase tracking-wider mb-2">
                              <AlertTriangle className="w-4 h-4" />
                              Instabilidades Detectadas
                            </div>
                            <ul className="list-disc pl-5 space-y-1">
                              {compiledSpell.instabilities.map((inst, idx) => (
                                <li key={idx}>{inst}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {viewMode === 'json' && graphJson && compiledSpell && (
                  <motion.div 
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
                  >
                    <div className="lg:col-span-1 flex flex-col gap-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-2 text-blue-400 font-bold mb-4 border-b border-slate-800 pb-2">
                          <Terminal className="w-4 h-4" />
                          Vetores Universais
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <AttributeStat label="Luz" value={compiledSpell.finalAttributes.lumen} />
                          <AttributeStat label="Calor" value={compiledSpell.finalAttributes.thermal} />
                          <AttributeStat label="Som" value={compiledSpell.finalAttributes.sonic} />
                          <AttributeStat label="Massa" value={compiledSpell.finalAttributes.mass} />
                          <AttributeStat label="Velocidade" value={compiledSpell.finalAttributes.velocity} />
                          <AttributeStat label="Densidade" value={compiledSpell.finalAttributes.density} />
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold mb-4 border-b border-slate-800 pb-2">
                          <Database className="w-4 h-4" />
                          Log de Processamento
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 font-mono text-[10px]">
                          {compiledSpell.finalAttributes.auditLog?.map((log, i) => (
                            <div key={i} className="p-2 bg-slate-950 rounded border-l-2 border-slate-700 text-slate-400">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 relative group flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Code className="w-4 h-4" />
                          Grafo JSON
                        </div>
                        <button 
                          onClick={() => copyToClipboard(JSON.stringify(graphJson, null, 2))}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar Código
                        </button>
                      </div>
                      <div className="flex-1 bg-slate-900/50 rounded-lg p-4 overflow-auto border border-slate-800/50">
                        <pre className="text-emerald-400/80 font-mono text-xs leading-relaxed">
                          <code>{JSON.stringify(graphJson, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
              <Database className="w-8 h-8 opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Núcleo de Processamento Ocioso</p>
              <p className="text-sm opacity-60">Entre com uma lógica arcanica para iniciar a compilação.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ViewTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'purple' | 'yellow' | 'blue';
}

const ViewTab: React.FC<ViewTabProps> = ({ active, onClick, icon, label, color }) => {
  const colorClasses = {
    purple: active ? 'text-purple-400 border-purple-400' : 'text-slate-500 hover:text-purple-300',
    yellow: active ? 'text-yellow-400 border-yellow-400' : 'text-slate-500 hover:text-yellow-300',
    blue: active ? 'text-blue-400 border-blue-400' : 'text-slate-500 hover:text-blue-300',
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all border-b-2 ${active ? 'bg-slate-800/40' : 'border-transparent hover:bg-slate-800/20'} ${colorClasses[color]}`}
    >
      {icon}
      {label}
    </button>
  );
};

const SpellDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-widest text-amber-900/40 font-bold font-sans">{label}</span>
    <span className="text-amber-950 font-bold">{value}</span>
  </div>
);

const AttributeStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex flex-col bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
    <span className="text-[10px] uppercase text-slate-500 font-bold mb-1">{label}</span>
    <span className="text-xl font-mono text-white tracking-tighter">{value}</span>
  </div>
);

export default MagicStudio;

