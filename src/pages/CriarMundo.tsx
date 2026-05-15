import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Upload, ArrowLeft, PlusCircle, Map, Target, Skull, Leaf, Compass, ChevronDown, ChevronRight, Trash2, Navigation, Save, Zap, ListTree, Castle, Users, Flag, Edit2, Feather } from 'lucide-react';

export const parseDice = (diceStr: string) => {
  const match = diceStr.toLowerCase().match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
  if (!match) return { count: 0, sides: 0, bonus: 0 };
  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    bonus: match[3] ? parseInt(match[3], 10) : 0
  };
};

export const stringifyDice = (count: number, sides: number, bonus: number) => {
  return `${count}d${sides}${bonus > 0 ? ` + ${bonus}` : ''}`;
};
export type EntityType = 'continente' | 'bioma' | 'regiao' | 'civilizacao' | 'povo' | 'objetivo' | 'monstro' | 'animal' | 'planta';

export interface EntityAttributes {
  fisico: number | string;
  precisao: number | string;
  resistencia: number | string;
  mente: number | string;
  vontade: number | string;
  eloquencia: number | string;
}

export interface Attack {
  nome: string;
  dano_base: string;
  tipo: string;
  escala?: string;
}

export interface Entity {
  id: string;
  parentId: string | null;
  tipo: EntityType;
  nome: string;
  explicacao: string;
  hp?: number | string;
  loot?: string;
  loots?: string[];
  attributes?: EntityAttributes;
  nivel_inicial?: number;
  nivel_atual?: number;
  ataques?: Attack[];
  skills?: { name: string; description: string; damage?: string }[];
  midjourneyPrompt?: string;
  alinhamento?: string;
  hierarquia?: string;
  povos?: string;
  objetivo?: string;
}

export const simulateLevelScaling = (entity: Entity, targetLevel: number): Entity => {
  const currentLevel = entity.nivel_atual || entity.nivel_inicial || 1;
  const initialLevel = entity.nivel_inicial || 1;
  if (targetLevel <= currentLevel) return entity;

  const deltaLevels = targetLevel - currentLevel;
  
  // Calculate attributes
  const newStats = { ...entity.attributes } as any;
  for (let lvl = currentLevel + 1; lvl <= targetLevel; lvl++) {
    if (lvl % 2 === 0) {
      if (newStats.fisico !== undefined) newStats.fisico = Number(newStats.fisico) + 1;
      if (newStats.resistencia !== undefined) newStats.resistencia = Number(newStats.resistencia) + 1;
    }
  }

  // Calculate HP
  let newHp = typeof entity.hp === 'number' ? entity.hp : (parseInt(String(entity.hp || 0)) || 0);
  for(let i=0; i<deltaLevels; i++) {
     newHp = Math.floor(newHp * 1.1);
  }

  // Calculate Attacks
  const novosAtaques = entity.ataques?.map((atk: Attack) => {
    const parsed = parseDice(atk.dano_base);
    if (parsed.count === 0) return atk;
    
    let newCount = parsed.count;
    let newBonus = parsed.bonus;
    
    for (let lvl = currentLevel + 1; lvl <= targetLevel; lvl++) {
      const currentStr = Number(entity.attributes?.fisico || 10) + Math.floor((lvl - initialLevel)/2);
      const strBonus = Math.floor((currentStr - 10) / 2);
      
      newBonus += (strBonus > 0 ? 1 : 0);
      
      if (lvl % 10 === 0) { // Power spike
          newCount += 1;
          newBonus += 5;
      } else if (lvl % 5 === 0) {
          newCount += 1;
      }
    }
    
    return {
        ...atk,
        dano_base: stringifyDice(newCount, parsed.sides, newBonus)
    };
  });

  return { 
    ...entity, 
    nivel_atual: targetLevel, 
    hp: newHp, 
    ataques: novosAtaques || [], 
    attributes: newStats 
  };
};

export interface FlatWorldDatabase {
  items: Entity[];
}

const tabs: { id: EntityType, label: string, icon: React.ReactNode }[] = [
  { id: 'continente', label: 'Continentes', icon: <Map className="w-4 h-4" /> },
  { id: 'bioma', label: 'Biomas', icon: <Leaf className="w-4 h-4" /> },
  { id: 'regiao', label: 'Regiões', icon: <Compass className="w-4 h-4" /> },
  { id: 'civilizacao', label: 'Civilizações', icon: <Castle className="w-4 h-4" /> },
  { id: 'povo', label: 'Povos/Raças', icon: <Users className="w-4 h-4" /> },
  { id: 'objetivo', label: 'Objetivos', icon: <Flag className="w-4 h-4" /> },
  { id: 'monstro', label: 'Monstros', icon: <Skull className="w-4 h-4" /> },
  { id: 'animal', label: 'Animais', icon: <Target className="w-4 h-4" /> },
  { id: 'planta', label: 'Plantas', icon: <Leaf className="w-4 h-4" /> },
];

export const CriarMundo = () => {
  const [activeTab, setActiveTab] = useState<EntityType>('continente');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Forms
  const [formData, setFormData] = useState<Partial<Entity>>({});
  const [error, setError] = useState<string | null>(null);

  // Database State - Persisted flat list
  const [database, setDatabase] = useState<FlatWorldDatabase>(() => {
    const saved = localStorage.getItem('world_database_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Parse error", e); }
    }
    // Try migrate old format if v2 not found
    const v1 = localStorage.getItem('world_database');
    if (v1) {
      try {
        const parsed = JSON.parse(v1);
        if (parsed.items) return parsed as FlatWorldDatabase;
        return migrateV1toV2(parsed);
      } catch (e) { console.error("Parse V1 error", e); }
    }
    return { items: [] };
  });

  useEffect(() => {
    localStorage.setItem('world_database_v2', JSON.stringify(database));
  }, [database]);

  // Handle Edit Action
  const handleEdit = (entity: Entity) => {
    setActiveTab(entity.tipo);
    setFormData({ ...entity });
    setSelectedParentId(entity.parentId);
    setEditingId(entity.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getParentContext = () => {
    if (!selectedParentId) return '';
    const parent = database.items.find(i => i.id === selectedParentId);
    if (!parent) return '';
    return `Local (Pai): ${parent.nome}. Contexto: ${parent.explicacao}`;
  };

  const [showStampAnim, setShowStampAnim] = useState(false);

  const playStampSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio not supported or blocked", e);
    }
  };

  const handleSaveForm = () => {
    if (!formData.nome || !formData.explicacao) {
      setError("Nome e Explicação são os pilares da criação (Obrigatórios).");
      return;
    }

    playStampSound();
    setShowStampAnim(true);
    setTimeout(() => {
      setShowStampAnim(false);
    }, 1000);

    if (editingId) {
      setDatabase(prev => ({
        items: prev.items.map(i => i.id === editingId ? {
          ...i,
          ...formData,
          loots: formData.loots || (formData.loot ? [formData.loot] : []),
          loot: undefined,
          tipo: activeTab,
          parentId: selectedParentId || null,
        } as Entity : i)
      }));
      setEditingId(null);
    } else {
      const newEnt: Entity = {
        id: formData.id || `${activeTab}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tipo: activeTab,
        parentId: selectedParentId || null,
        nome: formData.nome,
        explicacao: formData.explicacao,
        hp: formData.hp,
        loots: formData.loots || (formData.loot ? [formData.loot] : []),
        attributes: formData.attributes,
        nivel_inicial: formData.nivel_inicial || 1,
        nivel_atual: formData.nivel_atual || formData.nivel_inicial || 1,
        ataques: formData.ataques || [],
        alinhamento: formData.alinhamento,
        hierarquia: formData.hierarquia,
        povos: formData.povos,
        objetivo: formData.objetivo,
      };

      setDatabase(prev => ({ items: [newEnt, ...prev.items] }));
    }
    
    // Clear form but keep selection
    setFormData({ tipo: activeTab });
    setError(null);
  };

  const handleDelete = (id: string, cascadeAlert: boolean = true) => {
    const children = database.items.filter(i => i.parentId === id);
    if (children.length > 0 && cascadeAlert) {
      if (!window.confirm("Atenção: Este contêiner possui entidades dentro. Apagar resultará na deleção de TODOS os itens filhos em cascata. Continuar?")) return;
    }
    
    let toDelete = new Set([id]);
    let added = true;
    while(added) {
      added = false;
      const currentSize = toDelete.size;
      database.items.forEach(i => {
        if (i.parentId && toDelete.has(i.parentId)) toDelete.add(i.id);
      });
      if (toDelete.size > currentSize) added = true;
    }

    setDatabase(prev => ({
      items: prev.items.filter(i => !toDelete.has(i.id))
    }));
  };

  const handleUpdateParent = (id: string, newParentId: string | null) => {
    setDatabase(prev => ({
      items: prev.items.map(i => i.id === id ? { ...i, parentId: newParentId } : i)
    }));
  };

  const handleCommitLevel = (id: string, projectedEntity: Entity) => {
    setDatabase(prev => ({
      items: prev.items.map(entity => {
        if (entity.id !== id) return entity;
        return projectedEntity;
      })
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.items && Array.isArray(json.items)) {
          setDatabase(json);
        } else {
          const migrated = migrateV1toV2(json);
          setDatabase(migrated);
        }
      } catch (err) {
        alert("Erro ao ler JSON. Formato inválido.");
      }
    };
    reader.readAsText(file);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "codex_magico_v2.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Hierarchy calculations
  const possibleParents = database.items.filter(i => ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo));
  const rootItems = database.items.filter(i => !i.parentId);

  return (
    <div className="flex h-screen overflow-hidden dark-wood-table font-serif selection:bg-[#1f1a18]/20 text-[#1f1a18] relative" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')", backgroundColor: "#110a08" }}>
      <style>{`
        .leather-strip {
          background: linear-gradient(170deg, #1c140d 0%, #0d0805 100%);
          background-image: url("https://www.transparenttextures.com/patterns/dark-leather.png");
          border-right: 2px solid #3a2818;
          box-shadow: inset -2px 0 10px rgba(0,0,0,0.8), 5px 0 15px rgba(0,0,0,0.5);
        }
        .torn-paper {
          background-color: #dcd0b3;
          background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
          box-shadow: inset 0 0 40px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.6);
          position: relative;
        }
        .torn-paper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(90deg, rgba(59,42,26,0.1) 1px, transparent 1px) 0 0 / 40px 40px,
            linear-gradient(rgba(59,42,26,0.1) 1px, transparent 1px) 0 0 / 40px 40px;
          opacity: 0.5;
          pointer-events: none;
          transform: rotate(-1deg) scale(1.1);
          z-index: 0;
        }
        .coffee-stain-large {
          position: absolute;
          width: 15rem;
          height: 15rem;
          background: radial-gradient(circle, transparent 45%, rgba(59,42,26,0.2) 47%, rgba(59,42,26,0.4) 49%, transparent 51%);
          border-radius: 50%;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 1;
        }
        .pencil-input {
          background: transparent !important;
          border: none !important;
          border-bottom: 2px solid rgba(31, 26, 24, 0.4) !important;
          border-radius: 0 !important;
          font-family: 'Nanum Pen Script', cursive !important;
          color: #1f1a18 !important;
          font-size: 1.5rem !important;
          line-height: 1.2 !important;
          transition: border-color 0.2s;
          padding: 2px 2px !important;
        }
        .pencil-input:focus {
          border-bottom: 2px solid rgba(80, 50, 40, 0.9) !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .pencil-label {
          font-family: 'Balthazar', serif;
          color: #1f1a18;
          font-weight: bold;
        }
        .wax-seal {
          background: radial-gradient(circle at 30% 30%, #a63a21, #5e1f0e);
          border: 1px solid #401005;
          box-shadow: 2px 4px 6px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.3), inset 0 -2px 10px rgba(0,0,0,0.6);
          border-radius: 50%;
          color: #eaddc5;
          position: relative;
        }
        .wax-seal:after {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          border: 1px dashed rgba(255,255,255,0.2);
        }
        @keyframes wind-rose-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .wind-rose-spin {
          animation: wind-rose-spin 120s linear infinite;
        }
      `}</style>

      {/* Sidebar Categories (Totally glued to the left) */}
      <aside className="fixed left-0 top-0 w-[250px] h-full flex-shrink-0 leather-strip flex flex-col z-[100] shadow-[10px_0_20px_rgba(0,0,0,0.8)] m-0 pb-4 overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-30"></div>
        
        <div className="p-4 flex flex-col gap-2">
          <h3 className="flex text-[11px] font-cinzel text-[#8e6c46] font-bold uppercase tracking-[0.2em] mb-2 px-2 items-center gap-2">
            <Compass className="w-3 h-3" /> Atlas Rúnico
          </h3>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                   setActiveTab(tab.id);
                   setEditingId(null);
                   setFormData({ tipo: tab.id });
                }}
                className={`relative flex items-center justify-between gap-3 px-4 py-3 mb-3 text-sm transition-all transform hover:scale-105 hover:-rotate-1 ${
                  isActive ? 'scale-105 -rotate-1 z-10' : 'opacity-80 rotate-1'
                }`}
                style={{
                  background: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
                  backgroundColor: '#dcd0b3',
                  boxShadow: isActive ? '3px 5px 10px rgba(0,0,0,0.6)' : '1px 3px 5px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(139, 90, 43, 0.4)',
                  color: '#1a120b',
                  fontFamily: '"Balthazar", serif',
                  fontWeight: 'bold',
                }}
              >
                {/* Wax seal / Dagger pin */}
                <div className="absolute -left-2 top-1 w-5 h-5 wax-seal flex items-center justify-center transform -rotate-12 z-20">
                  <span className="text-[10px] text-yellow-500/50">✦</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`${isActive ? 'text-[#8b0000]' : 'text-[#3a1a05]'}`}>{tab.icon}</div>
                  <span className="capitalize font-cinzel tracking-wider text-xs">{tab.label}</span>
                </div>

                {/* Number of items */}
                <div className="text-[10px] text-[#5c3a21] bg-[#c8b99e] px-1.5 py-0.5 rounded shadow-inner">
                  {database.items.filter(i => i.tipo === tab.id).length}
                </div>
              </button>
          )})}
        </div>

        <div className="flex flex-col p-4 border-t border-[#3a2818]/60 flex-1 overflow-y-auto custom-scrollbar">
           <h3 className="text-[11px] font-cinzel font-bold text-[#8e6c46] uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
              <ListTree className="w-3 h-3" /> Cartografia
           </h3>
           <div className="space-y-1 font-serif text-xs">
             {rootItems.filter(i => ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo)).map(node => (
               <GeoNavNode key={node.id} entity={node} allItems={database.items} />
             ))}
             {rootItems.filter(i => ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo)).length === 0 && (
               <p className="text-xs text-[#5c442c] italic px-2">Atlas em branco.</p>
             )}
           </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full relative ml-[250px] w-[calc(100%-250px)]">
        
        {/* Top Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-[#3a2818]/50 bg-transparent sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[#8e6c46] hover:text-[#d4af37] transition-colors bg-[#0a0806]/80 p-2 rounded-full border border-[#3a2818]/50 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-1 text-[10px] font-cinzel tracking-widest text-[#d4af37] bg-black/60 hover:bg-black/80 border border-[#8e6c46]/50 rounded cursor-pointer transition-colors uppercase backdrop-blur-sm">
              <Upload className="w-3 h-3 text-[#8e6c46]" />
              <span className="hidden md:inline">Importar</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <button onClick={downloadJson} className="flex items-center gap-2 px-3 py-1 text-[10px] font-cinzel tracking-widest text-[#0a0806] bg-[#d4af37] hover:bg-[#c4a977] rounded transition-colors uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Download className="w-3 h-3" />
              <span className="hidden md:inline">Exportar Codex</span>
            </button>
          </div>
        </nav>

        {/* The Parchment Map covering the table */}
        <div className="absolute inset-2 top-0 z-0 flex items-center justify-center overflow-hidden torn-paper mt-6 border-b-2 border-r-2 border-[#1a120c]">
           <div className="coffee-stain-large top-[10%] right-[10%] opacity-40"></div>
           <div className="coffee-stain-large bottom-[15%] left-[20%] opacity-20 transform scale-[1.5]"></div>
           <div className="absolute inset-0 bg-gradient-to-br from-[#dcd0b3] to-transparent z-0 opacity-50" />
           
           {/* Loxodrome grids and map details */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 mix-blend-multiply">
              <svg viewBox="0 0 800 800" className="w-[120vw] max-w-[1000px] h-auto stroke-[#5c3a21] wind-rose-spin origin-center">
                 {/* Latitude / longitude subtly crooked */}
                 {Array.from({length: 12}).map((_, i) => (
                   <g key={i}>
                     <line x1="-200" y1={i*80 - 100} x2="1000" y2={i*80 - 100} strokeWidth="0.5" strokeDasharray="4 8" />
                     <line x1={i*80 - 100} y1="-200" x2={i*80 - 100} y2="1000" strokeWidth="0.5" strokeDasharray="4 8" />
                   </g>
                 ))}
                 
                 {/* Main Wind Rose base */}
                 <circle cx="400" cy="400" r="300" fill="none" strokeWidth="1.5" strokeDasharray="5 15" />
                 <circle cx="400" cy="400" r="280" fill="none" strokeWidth="0.8" />
                 <circle cx="400" cy="400" r="32" fill="none" strokeWidth="2" />
                 
                 {/* Lines radiating from center */}
                 {Array.from({length: 32}).map((_, i) => (
                     <line key={i} x1="400" y1="400" x2={400 + 400 * Math.cos(i * Math.PI / 16)} y2={400 + 400 * Math.sin(i * Math.PI / 16)} strokeWidth={i % 4 === 0 ? "1" : "0.3"} />
                 ))}
              </svg>
           </div>
        </div>

        {/* Forge Area */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 w-full pl-2 lg:pl-3 pr-6 pb-0 mt-2">

          
          {/* Creation Panel */}
          <div className="w-full lg:w-[450px] xl:w-[480px] flex-shrink-0 flex flex-col overflow-y-auto z-20 lg:my-0 lg:ml-0 lg:mr-0 torn-paper shadow-[20px_0_40px_rgba(15,10,5,0.7)] relative bg-[#eaddc5] h-full bg-cover" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')" }}>
            <div className="coffee-stain-large -top-10 -left-10 opacity-70"></div>
            
            <div className="flex p-3 gap-4 sticky top-0 z-10 pt-4 bg-gradient-to-b from-[#eaddc5] to-transparent">
              <div className="flex-1 flex flex-col justify-center items-center py-2 rounded-sm text-[10px] font-cinzel font-bold tracking-widest uppercase transition-all metal-plate active text-[#1f1a18] shadow-md border-t border-[#f5ebdb]/50">
                <Feather className="w-3 h-3 mb-1" />
                Escrever Registro
              </div>
            </div>

            <div className="px-6 pb-6 relative flex-1 flex flex-col">
              <h2 className="text-base font-cinzel font-black text-[#1f1a18] mb-3 tracking-wide flex items-center gap-2 border-b border-[#5c3a21]/20 pb-2">
                REGISTRO: <span className="text-[#990000] opacity-90 uppercase underline decoration-wavy decoration-[#990000]/40">{activeTab}</span>
              </h2>

              {/* Context Picker */}
              <div className="mb-4 p-3 border border-[#8e6c46]/30 bg-[#dcd0b3]/50 pencil-label transform rotate-1 shadow-inner">
                <label className="block text-[10px] font-cinzel font-bold text-[#5c4a3d] uppercase tracking-[0.1em] mb-2 flex items-center gap-2">
                  <Navigation className="w-3 h-3" /> Ancoragem
                </label>
                <select 
                  value={selectedParentId || ''}
                  onChange={(e) => setSelectedParentId(e.target.value || null)}
                  className="w-full pencil-input cursor-pointer text-sm"
                >
                  <option value="" className="bg-[#dcd0b3] text-[#5c4a3d] font-sans">-- Solto na Mesa (Raiz) --</option>
                  {possibleParents.map(c => (
                     <option key={c.id} value={c.id} className="bg-[#dcd0b3] text-[#1f1a18] font-sans">
                       [{c.tipo.substring(0,3).toUpperCase()}] {c.nome}
                     </option>
                  ))}
                </select>
              </div>

              {/* Error Box */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-3 bg-red-950/40 border border-red-900/50 text-red-400 p-2 rounded text-xs">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4 pt-1 pb-10">
                  <div>
                    <label className="block text-[10px] font-cinzel font-bold text-[#1f1a18] tracking-widest uppercase mb-1">Nomenclatura</label>
                    <input type="text" value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full pencil-input" placeholder="Ex: Grifo de Basalto" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-cinzel font-bold text-[#1f1a18] tracking-widest uppercase mb-1">Códice</label>
                    <textarea value={formData.explicacao || ''} onChange={e => setFormData({...formData, explicacao: e.target.value})} className="w-full h-24 pencil-input resize-none" placeholder="Lenda e natureza..." />
                  </div>

                  {/* Monstros e Animais - Status específicos */}
                  {['monstro', 'animal'].includes(activeTab) && (
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-cinzel font-bold text-[#990000] tracking-widest uppercase mb-1">Vigor</label>
                        <input type="number" value={formData.hp || ''} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full pencil-input text-center text-[#990000] font-bold" placeholder="Ex: 120" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-cinzel font-bold text-[#1e40af] tracking-widest uppercase mb-1">Nível Base</label>
                        <input type="number" value={formData.nivel_inicial || ''} onChange={e => setFormData({...formData, nivel_inicial: parseInt(e.target.value) || 1})} className="w-full pencil-input text-center text-[#1e40af] font-bold" placeholder="Ex: 1" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-cinzel font-bold text-[#1f1a18] tracking-widest mb-1 flex justify-between items-center uppercase">
                          Despojos
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, loots: [...(prev.loots || (prev.loot ? [prev.loot] : [])), ''] }))} className="text-[#1f1a18] hover:text-[#990000] px-1 font-bold">
                            +
                          </button>
                        </label>
                        <div className="space-y-2">
                          {(formData.loots || (formData.loot ? [formData.loot] : [])).map((l, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <input type="text" value={l} onChange={e => {
                                const arr = [...(formData.loots || (formData.loot ? [formData.loot] : []))];
                                arr[i] = e.target.value;
                                setFormData({...formData, loots: arr, loot: undefined});
                              }} className="w-full pencil-input text-sm" placeholder="..." />
                              <button type="button" onClick={() => {
                                const arr = [...(formData.loots || (formData.loot ? [formData.loot] : []))];
                                arr.splice(i, 1);
                                setFormData({...formData, loots: arr, loot: undefined});
                              }} className="text-[#7f1d1d] hover:text-red-500">
                                <Trash2 className="w-3 h-3"/>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'planta' && (
                    <div>
                      <label className="block text-[10px] font-cinzel font-bold text-[#166534] tracking-widest uppercase mb-1 flex justify-between items-center border-b border-[#166534]/40 pb-1">
                          Materiais Botânicos
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, loots: [...(prev.loots || (prev.loot ? [prev.loot] : [])), ''] }))} className="text-[#166534] hover:text-[#000] font-bold">
                            +
                          </button>
                      </label>
                      <div className="space-y-2 mt-2">
                          {(formData.loots || (formData.loot ? [formData.loot] : [])).map((l, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="text" value={l} onChange={e => {
                                const arr = [...(formData.loots || (formData.loot ? [formData.loot] : []))];
                                arr[i] = e.target.value;
                                setFormData({...formData, loots: arr, loot: undefined});
                              }} className="w-full pencil-input text-sm text-[#166534] font-bold" placeholder="Ex: Seiva luminosa" />
                              <button type="button" onClick={() => {
                                const arr = [...(formData.loots || (formData.loot ? [formData.loot] : []))];
                                arr.splice(i, 1);
                                setFormData({...formData, loots: arr, loot: undefined});
                              }} className="text-[#990000] hover:text-red-500">
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'civilizacao' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-cinzel font-bold text-[#1f1a18] tracking-widest uppercase mb-1">Alinhamento Mítico</label>
                          <input type="text" value={formData.alinhamento || ''} onChange={e => setFormData({...formData, alinhamento: e.target.value})} className="w-full pencil-input p-2" placeholder="Ex: Neutro e Bom" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-cinzel font-bold text-[#1f1a18] tracking-widest uppercase mb-1">Estrutura de Poder</label>
                          <input type="text" value={formData.hierarquia || ''} onChange={e => setFormData({...formData, hierarquia: e.target.value})} className="w-full pencil-input p-2" placeholder="Ex: Monarquia absolutista..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {['monstro', 'animal'].includes(activeTab) && (
                    <div className="w-full">
                      <label className="block text-[11px] font-cinzel font-bold text-[#1f1a18] tracking-widest uppercase mb-3 text-center border-b border-[#5c4a3d] pb-1 border-dashed">Essência Corporal</label>
                      <div className="w-full grid grid-cols-6 gap-1 px-1">
                        {['fisico', 'precisao', 'resistencia', 'mente', 'vontade', 'eloquencia'].map((attr) => (
                           <div key={attr} className="flex flex-col border border-[#5c4a3d]/20 bg-white/20 p-1">
                             <span className="text-[9px] font-cinzel font-bold tracking-widest uppercase text-[#5c4a3d] mb-1 text-center">{attr.substring(0,3)}</span>
                             <input type="number" 
                               value={(formData.attributes as any)?.[attr] || ''} 
                               onChange={e => setFormData({
                                 ...formData, 
                                 attributes: { ...((formData.attributes || {fisico:10,precisao:10,resistencia:10,mente:10,vontade:10,eloquencia:10}) as any), [attr]: e.target.value }
                               })}
                               className="w-full pencil-input text-center text-xl p-0" />
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {['monstro', 'animal'].includes(activeTab) && (
                    <div className="pt-2">
                       <label className="block text-[11px] font-cinzel font-bold text-[#1f1a18] tracking-widest uppercase mb-2 flex justify-between items-center border-b border-[#5c4a3d] border-dashed pb-1">
                         Arsenal Biológico
                         <button 
                           onClick={() => setFormData(prev => ({ ...prev, ataques: [...(prev.ataques || []), { nome: '', dano_base: '1d6 + 0', tipo: '', escala: '1d6 a cada 10 níveis' }] }))}
                           className="text-[10px] px-2 py-0.5 border border-[#5c4a3d] hover:bg-[#d4af37] hover:text-black transition-colors font-serif uppercase tracking-wider pencil-label"
                         >
                           + Novo Risco
                         </button>
                       </label>
                       <div className="space-y-3 mt-3">
                         {(formData.ataques || []).map((atk, idx) => (
                           <div key={idx} className="p-3 border border-[#5c4a3d]/40 grid grid-cols-2 gap-3 relative bg-black/5 transform rotate-1">
                             <button 
                               onClick={() => setFormData(prev => ({ ...prev, ataques: prev.ataques?.filter((_, i) => i !== idx) }))}
                               className="absolute -right-2 -top-2 bg-[#8b0000] text-white rounded-full p-1 border border-[#400000] hover:scale-110 transition-transform shadow-md"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>
                             <input type="text" placeholder="Nome (Ex: Coice)" value={atk.nome} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].nome = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full pencil-input text-xs" />
                             <input type="text" placeholder="Dano (Ex: 2d6 + 4)" value={atk.dano_base} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].dano_base = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full pencil-input text-[#990000] text-center" />
                             <input type="text" placeholder="Tipo (Ex: Fogo)" value={atk.tipo} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].tipo = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full pencil-input text-xs" />
                             <input type="text" placeholder="Escala" value={atk.escala || ''} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].escala = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full pencil-input text-xs" />
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  <div className="pt-6 mt-8 border-t border-[#3a2818]/60 flex items-center justify-center gap-4 relative">
                    {/* Ghost wax seal that stays on the paper for a moment */}
                    <AnimatePresence>
                      {showStampAnim && (
                        <motion.div
                          initial={{ scale: 2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.8 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="absolute w-24 h-24 wax-seal flex items-center justify-center pointer-events-none z-50 text-[10px] font-cinzel font-bold text-[#ffcccc] tracking-[0.2em] transform rotate-12 drop-shadow-2xl"
                        >
                          GRAVADO
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      onClick={handleSaveForm}
                      whileTap={{ scale: 0.9, y: 5 }}
                      className="group flex flex-col items-center justify-center cursor-pointer transition-transform"
                    >
                      <div className="w-20 h-20 wax-seal flex items-center justify-center transition-all group-hover:brightness-110 shadow-lg">
                         {editingId ? <Save className="w-8 h-8 opacity-90 drop-shadow-md" /> : <img src="data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23ffcccc' stroke-width='1.5'><path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'/><line x1='7' y1='7' x2='7' y2='7' stroke-linecap='round' stroke-width='2'/></svg>" className="w-8 h-8 opacity-80" alt="seal"/> }
                      </div>
                      <span className="mt-2 text-[10px] font-cinzel font-bold text-[#1f1a18] uppercase tracking-[0.2em] group-hover:text-[#990000] transition-colors text-center shrink-0">
                        {editingId ? 'Atualizar Mapa' : 'Imortalizar no Mapa'}
                      </span>
                    </motion.button>
                    {editingId && (
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ tipo: activeTab });
                        }}
                        className="px-4 py-2 font-cinzel uppercase text-xs font-bold text-[#8e6c46] hover:text-white border border-[#8e6c46]/40 hover:bg-[#8e6c46]/20 transition-all ml-4"
                      >
                        Descartar Papiro
                      </button>
                    )}
                  </div>
              </div>

            </div>
          </div>

          {/* Viewer Area - Flat List dynamically rendered as Tree */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 z-10">
            <div className="max-w-4xl mx-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between mb-8 border-b border-[#8e6c46]/30 pb-4">
                <h2 className="text-2xl lg:text-3xl font-cinzel text-[#d4af37] tracking-widest font-black flex items-center gap-4 text-shadow-md">
                  <Map className="w-8 h-8 text-[#8e6c46]" /> 
                  Conhecimento Gravado
                  <span className="text-sm font-serif italic text-[#8e6c46] opacity-70 ml-2">({database.items.length} Fragmentos)</span>
                </h2>
              </div>
              
              {rootItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-center relative hover:opacity-100 group">
                  <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                     <svg viewBox="0 0 200 200" className="w-64 h-64 text-[#5c4a3d] wind-rose-spin">
                        <g stroke="currentColor" fill="none" strokeWidth="1.5">
                          <circle cx="100" cy="100" r="80" strokeDasharray="4 8" />
                          <circle cx="100" cy="100" r="60" opacity="0.5" />
                          <path d="M100 10 L115 85 L190 100 L115 115 L100 190 L85 115 L10 100 L85 85 Z" fill="currentColor" fillOpacity="0.1" />
                          <path d="M100 10 L100 190 M10 100 L190 100" strokeOpacity="0.5" />
                          <path d="M85 85 L115 115 M85 115 L115 85" strokeOpacity="0.3" />
                          <path d="M100 30 L108 85 L100 100 Z" fill="currentColor" />
                          <path d="M100 170 L92 115 L100 100 Z" fill="currentColor" />
                          <path d="M170 100 L115 92 L100 100 Z" fill="currentColor" />
                          <path d="M30 100 L85 108 L100 100 Z" fill="currentColor" />
                        </g>
                     </svg>
                  </div>
                  <h3 className="text-[#1f1a18] font-cinzel text-2xl tracking-[0.2em] mb-2 uppercase relative z-10 font-bold bg-[#dcd0b3]/50 px-4 rounded">O Caos Primordial</h3>
                  <p className="text-[#5c4a3d] font-serif italic text-lg max-w-md relative z-10 bg-[#dcd0b3]/50 px-4 py-2 rounded">O vazio aguarda a primeira fagulha de criação. Imortalize seu primeiro Continente nas névoas.</p>
                </div>
              ) : (
                <div className="space-y-6 pb-20">
                  {rootItems.map((item, idx) => (
                    <EntityNode key={item.id} index={idx + 1} entity={item} allItems={database.items} level={0} onUpdateParent={handleUpdateParent} onDelete={handleDelete} onEdit={handleEdit} possibleParents={possibleParents} onCommitLevel={handleCommitLevel} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

const GeoNavNode = ({ entity, allItems, level = 0 }: { entity: Entity, allItems: Entity[], level?: number }) => {
  const children = allItems.filter(i => i.parentId === entity.id && ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo));
  
  return (
    <div className="flex flex-col">
      <div 
        className="text-xs text-[#8e6c46] hover:text-[#d4af37] hover:bg-black/40 rounded px-2 py-1.5 cursor-pointer truncate flex items-center gap-2 transition-colors font-cinzel letter-spacing-wider"
        style={{ paddingLeft: `${(level * 8) + 8}px` }}
        title={entity.nome}
      >
        {entity.tipo === 'continente' ? <Map className="w-3 h-3 text-[#d4af37]" /> : entity.tipo === 'bioma' ? <Leaf className="w-3 h-3 text-[#4ade80]" /> : entity.tipo === 'regiao' ? <Compass className="w-3 h-3 text-[#c084fc]" /> : entity.tipo === 'civilizacao' ? <Castle className="w-3 h-3 text-[#60a5fa]" /> : entity.tipo === 'povo' ? <Users className="w-3 h-3 text-[#fca5a5]"/> : <Flag className="w-3 h-3 text-[#ef4444]" />}
        {entity.nome}
      </div>
      {children.map(child => (
        <GeoNavNode key={child.id} entity={child} allItems={allItems} level={level + 1} />
      ))}
    </div>
  );
}

// Helper for Ink Writing effect
const TypewriterText = ({ text, className }: { text: string, className?: string }) => {
  const words = text.split(' ');
  return (
    <p className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.3, delay: i * 0.02 }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
};

// --- Recursive Tree Component implementation ---

const EntityNode = ({ index = 1, entity, allItems, level, onUpdateParent, onDelete, onEdit, possibleParents, onCommitLevel }: any) => {
   const [open, setOpen] = useState(level < 1);
   const children = allItems.filter((i: any) => i.parentId === entity.id);
   const [forecastLevel, setForecastLevel] = useState<number>(entity.nivel_atual || entity.nivel_inicial || 1);
   
   const isCoffee = index % 2 === 0;
   const isBlood = index % 3 === 0;
   const isScratch = index % 7 === 0;
   
   const isElite = (entity.tipo === 'monstro' || entity.tipo === 'animal') && (Number(entity.hp) > 50 || Number(entity.nivel_atual || entity.nivel_inicial) >= 5);
   
   const getIcon = () => {
     switch(entity.tipo) {
       case 'continente': return <Map className="w-5 h-5 text-amber-500" />;
       case 'bioma': return <Leaf className="w-5 h-5 text-emerald-500" />;
       case 'regiao': return <Compass className="w-5 h-5 text-purple-500" />;
       case 'civilizacao': return <Castle className="w-5 h-5 text-blue-500" />;
       case 'povo': return <Users className="w-5 h-5 text-amber-500" />;
       case 'objetivo': return <Flag className="w-5 h-5 text-rose-500" />;
       case 'monstro': return <Skull className="w-5 h-5 text-red-500" />;
       case 'animal': return <Target className="w-5 h-5 text-blue-400" />;
       case 'planta': return <Leaf className="w-5 h-5 text-green-400" />;
       default: return <div className="w-4 h-4" />;
     }
   };
   
   return (
      <div className={`border border-[#5c4a3d]/50 overflow-hidden relative ${level > 0 ? (level === 1 ? 'mt-4 mb-3 ml-6 border-l-2 border-l-[#5c4a3d] torn-paper' : 'mt-3 mb-2 ml-8 border-l border-l-[#5c4a3d]/50 torn-paper') : 'mb-6 drop-shadow-lg torn-paper'} ${level === 0 ? 'p-1' : ''}`}>
        
        {isElite && (
           <motion.div 
             initial={{ scaleY: 0, opacity: 0 }}
             whileInView={{ scaleY: 1, opacity: 0.8 }}
             viewport={{ once: true }}
             transition={{ duration: 2, ease: "easeIn" }}
             className="absolute top-0 left-10 w-2 h-32 bg-gradient-to-b from-[#6b0000] to-transparent z-[2] origin-top mix-blend-multiply rounded-b-full drop-shadow-sm"
           />
        )}
        
        {isCoffee && <div className="coffee-stain-large top-[-5rem] right-[-5rem] opacity-70"></div>}
        {isBlood && (
          <>
             <div className="ink-blot top-10 left-20 opacity-80" style={{ transform: 'scale(1.2) scaleY(1.5)' }}></div>
             <div className="ink-blot bottom-20 right-1/3 opacity-60" style={{ transform: 'scale(0.8)' }}></div>
          </>
        )}
        
        {isScratch && (
           <div className="absolute top-0 right-10 w-32 h-full pointer-events-none opacity-30 z-[1] flex gap-2 rotate-12">
              <div className="w-1 h-full bg-[#3d0808]"></div>
              <div className="w-1 h-full bg-[#3d0808] mt-4"></div>
              <div className="w-1.5 h-full bg-[#3d0808] -mt-2"></div>
           </div>
        )}
        
        {/* Header Node Row */}
        <div className="p-4 md:p-5 hover:bg-[#5c4a3d]/5 transition-colors flex flex-col md:flex-row md:items-start gap-4 justify-between relative group border-b border-[#5c4a3d]/20 z-10">
           <div className="flex gap-4 flex-1 min-w-0">
             <button onClick={() => setOpen(!open)} className={`mt-1 p-1 hover:text-[#990000] transition-colors ${children.length ? 'text-[#1f1a18]' : 'opacity-0 cursor-default'}`}>
               {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
             </button>
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap group/title relative">
                  {getIcon()}
                  <div className="relative inline-block cursor-default">
                    <h3 className={`font-cinzel tracking-widest uppercase truncate relative z-10 transition-colors duration-500 group-hover/title:text-[#7f1d1d] ${level === 0 ? 'text-2xl text-[#1f1a18] font-black' : 'text-xl text-[#3b2a1a] font-bold'}`}>
                      {entity.nome}
                    </h3>
                    {['monstro', 'animal'].includes(entity.tipo) && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ink-blot opacity-0 group-hover/title:opacity-40 transition-opacity duration-300 pointer-events-none scale-[2] z-0"></div>
                    )}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#dcd0b3] bg-[#1f1a18] px-2 py-0.5 rounded-sm transform -rotate-2 shadow-sm">
                    {entity.tipo}
                  </span>
                  
                  {/* Status Badges */}
                  {(entity.nivel_atual || entity.nivel_inicial) ? <span className="bg-[#1e40af]/10 text-[#1e40af] text-[10px] px-2 py-0.5 rounded-sm border border-[#1e40af]/30 flex items-center gap-1 font-serif font-bold"><Zap className="w-3 h-3"/> Nível: {entity.nivel_atual || entity.nivel_inicial}</span> : null}
                  {entity.hp && <span className="bg-[#990000]/10 text-[#990000] text-[10px] px-2 py-0.5 rounded-sm border border-[#990000]/30 font-serif font-bold">Vigor: {entity.hp}</span>}
                  {(entity.loots?.length ? entity.loots : (entity.loot ? [entity.loot] : [])).length > 0 && <span className="bg-[#166534]/10 text-[#166534] text-[10px] px-2 py-0.5 rounded-sm border border-[#166534]/30 line-clamp-1 max-w-[200px] font-serif font-bold" title={(entity.loots?.length ? entity.loots : (entity.loot ? [entity.loot] : [])).join(', ')}>Despojos: {(entity.loots?.length ? entity.loots : (entity.loot ? [entity.loot] : [])).join(', ')}</span>}
                </div>
                <TypewriterText text={entity.explicacao} className="text-[#3b2a1a] font-serif text-lg leading-relaxed italic" />

                {/* Attributes for monsters */}
                {entity.attributes && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {Object.entries(entity.attributes).map(([k, v]) => (
                      <div key={k} className="bg-[#1f1a18]/5 border border-[#5c4a3d]/30 px-2 py-1 flex items-center justify-between min-w-[70px]">
                        <span className="text-[9px] uppercase text-[#5c4a3d] font-cinzel font-bold tracking-wider">{k.substring(0,3)}</span>
                        <span className="text-sm text-[#1f1a18] font-serif font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Civilizacao fields */}
                {entity.tipo === 'civilizacao' && (
                  <div className="mt-4 space-y-2 w-full text-sm bg-black/5 border border-[#5c4a3d]/20 p-4 font-serif text-[#1f1a18]">
                     {entity.alinhamento && <p><span className="text-[#1f1a18] font-cinzel font-bold uppercase text-[10px] tracking-wider mr-2">Alinhamento Mítico:</span> <span>{entity.alinhamento}</span></p>}
                     {entity.hierarquia && <p><span className="text-[#1f1a18] font-cinzel font-bold uppercase text-[10px] tracking-wider mr-2">Estrutura de Poder:</span> <span>{entity.hierarquia}</span></p>}
                  </div>
                )}

                {/* Attacks & Skills */}
                {entity.ataques && entity.ataques.length > 0 && (
                  <div className="mt-4 space-y-2 w-full">
                     <span className="text-[10px] font-cinzel uppercase text-[#1f1a18] font-bold tracking-widest border-b border-[#5c4a3d]/40 pb-1 flex border-dashed">Arsenal Biológico</span>
                     <div className="grid gap-3 grid-cols-1 md:grid-cols-2 mt-2">
                       {entity.ataques.map((atk: any, idx: number) => (
                         <div key={idx} className="bg-white/30 border border-[#5c4a3d]/30 p-3 flex flex-col gap-1 text-sm shadow-inner relative transform rotate-1">
                           <div className="flex justify-between items-center text-[#1f1a18] font-cinzel font-bold tracking-wide">
                             <span>{atk.nome}</span>
                             <span className="text-[#990000] border-b border-[#990000]/30 px-1 font-serif text-sm font-bold">{atk.dano_base}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] text-[#5c4a3d] font-serif italic mt-1">
                             <span className="uppercase not-italic font-sans tracking-wider font-bold">{atk.tipo}</span>
                             {atk.escala && <span className="opacity-80">Evolui: {atk.escala}</span>}
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                )}
                {/* Forecast / Simulador de Escalonamento */}
                {['monstro', 'animal'].includes(entity.tipo) && onCommitLevel && (
                  <div className="mt-4 p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Projeção de Evolução (Preview)</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-zinc-500">Nível Alvo:</span>
                         <input 
                           type="number" 
                           value={forecastLevel} 
                           min={entity.nivel_atual || entity.nivel_inicial || 1} 
                           onChange={e => setForecastLevel(parseInt(e.target.value) || entity.nivel_atual || entity.nivel_inicial || 1)}
                           className="w-16 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded outline-none focus:border-amber-500 text-center"
                         />
                      </div>
                    </div>
                    
                    {forecastLevel > (entity.nivel_atual || entity.nivel_inicial || 1) && (
                      <div className="space-y-3 mt-3 p-3 bg-zinc-950/80 rounded border border-blue-900/40">
                        {(() => {
                           const projected = simulateLevelScaling(entity, forecastLevel);
                           return (
                             <>
                               <div className="flex justify-between items-center text-xs">
                                 <div className="text-blue-400 font-bold flex items-center gap-1"><Zap className="w-3 h-3"/> Projeção para o Nível {forecastLevel}</div>
                                 <div className="text-red-400">HP: {entity.hp} <span className="text-emerald-500 mx-1">→</span> {projected.hp}</div>
                               </div>
                               
                               <div className="flex gap-2 flex-wrap">
                                  {Object.keys(projected.attributes || {}).map(k => {
                                     const pVal = projected.attributes?.[k as keyof EntityAttributes] as number;
                                     const eVal = entity.attributes?.[k as keyof EntityAttributes] as number;
                                     return (
                                       <span key={k} className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300">
                                         <span className="uppercase text-zinc-500 mr-1">{k}</span>
                                         {eVal}
                                         {pVal > eVal && (
                                            <span className="text-emerald-500 ml-1">→ {pVal}</span>
                                         )}
                                       </span>
                                     );
                                  })}
                               </div>
                       
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                 {projected.ataques?.map((atk: any, idx: number) => {
                                    const oldAtk = entity.ataques?.[idx];
                                    return (
                                      <div key={idx} className="bg-black/40 border border-zinc-800/60 rounded p-1.5 flex justify-between text-[11px]">
                                        <span className="text-zinc-400">{atk.nome}</span>
                                        <div className="text-red-400 font-mono">
                                          {oldAtk?.dano_base} {oldAtk?.dano_base !== atk.dano_base && <><span className="text-emerald-500 mx-1">→</span> {atk.dano_base}</>}
                                        </div>
                                      </div>
                                    )
                                 })}
                               </div>
                       
                               <button 
                                 onClick={() => {
                                   onCommitLevel(entity.id, projected);
                                   setForecastLevel(projected.nivel_atual || 1);
                                 }}
                                 className="w-full mt-2 py-1.5 bg-blue-900/40 hover:bg-blue-600/60 transition-colors text-blue-200 text-xs font-bold rounded flex justify-center items-center gap-2 border border-blue-800/50"
                               >
                                 Aplicar Nível {forecastLevel} permanentemente
                               </button>
                             </>
                           );
                        })()}
                      </div>
                    )}
                  </div>
                )}
             </div>
           </div>

           {/* Relational Controls */}
           <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity justify-end shrink-0 pl-10 md:pl-0">
             <div className="relative">
                <select 
                  className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px] rounded px-2 py-1.5 outline-none focus:border-amber-500 truncate w-32 md:w-40 cursor-pointer"
                  value={entity.parentId || ''}
                  onChange={e => onUpdateParent(entity.id, e.target.value || null)}
                  title="Alterar Pai"
                >
                  <option value="">[SOLTO - Raiz]</option>
                  <optgroup label="Mover para...">
                    {possibleParents.filter((p: any) => p.id !== entity.id).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </optgroup>
                </select>
             </div>
             <button 
                onClick={() => onEdit(entity)}
                className="p-1.5 bg-blue-950/30 hover:bg-blue-900/60 text-blue-500 border border-blue-900/30 rounded transition-colors"
                title="Editar"
             >
               <Edit2 className="w-4 h-4" />
             </button>
             <button 
                onClick={() => onDelete(entity.id)}
                className="p-1.5 bg-red-950/30 hover:bg-red-900/60 text-red-500 border border-red-900/30 rounded transition-colors"
                title="Excluir entidade e filhos"
             >
               <Trash2 className="w-4 h-4" />
             </button>
           </div>
        </div>

        {/* Children Level Render */}
        <AnimatePresence>
          {open && children.length > 0 && (
             <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden border-t border-zinc-800/40">
                <div className="p-3 bg-zinc-950/50">
                   {children.map((child: any) => (
                     <EntityNode key={child.id} entity={child} allItems={allItems} level={level + 1} onUpdateParent={onUpdateParent} onDelete={onDelete} onEdit={onEdit} possibleParents={possibleParents} onCommitLevel={onCommitLevel} />
                   ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
   );
};

// -- Migration helper --
function migrateV1toV2(oldDb: any): FlatWorldDatabase {
  const items: Entity[] = [];
  try {
    if (!oldDb.continentes || !Array.isArray(oldDb.continentes)) return { items: [] };
    const traverse = (list: any[], parentId: string | null, defType: EntityType) => {
      // old structure could be quite nested or dirty depending on how far the user went
      list.forEach(item => {
        const id = item.id ? String(item.id) : `mig_${Math.random()}`;
        items.push({
          id,
          parentId,
          tipo: item.tipo || defType,
          nome: item.nome || item.name || 'Sem Nome',
          explicacao: item.explicacao || item.description || item.geography || '',
          hp: item.hp,
          loots: item.loots || (item.loot ? [item.loot] : []),
          attributes: item.attributes || item.stats
        });
        if (item.biomas) traverse(item.biomas, id, 'bioma');
        if (item.entidades) traverse(item.entidades, id, 'monstro');
      });
    };
    traverse(oldDb.continentes, null, 'continente');
  } catch (err) {
    console.error("Migração falhou", err);
  }
  return { items };
}
