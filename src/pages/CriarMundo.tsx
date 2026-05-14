import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Download, Upload, ArrowLeft, PlusCircle, Map, Target, Skull, Leaf, Compass, ChevronDown, ChevronRight, Trash2, Wand2, PenTool, Navigation, Save, Zap, ListTree, Castle, Users, Flag, Edit2 } from 'lucide-react';

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
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini SDK
let ai: GoogleGenAI | null = null;
if (import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
}

export type EntityType = 'continente' | 'bioma' | 'regiao' | 'civilizacao' | 'povo' | 'objetivo' | 'monstro' | 'animal' | 'planta';

export interface EntityAttributes {
  str: number | string;
  dex: number | string;
  con: number | string;
  int: number | string;
  wis: number | string;
  cha: number | string;
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
      if (newStats.str !== undefined) newStats.str = Number(newStats.str) + 1;
      if (newStats.con !== undefined) newStats.con = Number(newStats.con) + 1;
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
      const currentStr = Number(entity.attributes?.str || 10) + Math.floor((lvl - initialLevel)/2);
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
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Forms & AI
  const [formData, setFormData] = useState<Partial<Entity>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setCreationMode('manual');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getParentContext = () => {
    if (!selectedParentId) return '';
    const parent = database.items.find(i => i.id === selectedParentId);
    if (!parent) return '';
    return `Local (Pai): ${parent.nome}. Contexto: ${parent.explicacao}`;
  };

  const getAiSchema = (tipo: EntityType) => {
    if (tipo === 'monstro' || tipo === 'animal') {
      return {
        sysPrompt: tipo === 'monstro' ? "Crie um monstro complexo de RPG." : "Crie um animal da fauna local fantástico.",
        schema: {
          type: Type.OBJECT,
          properties: {
            nome: { type: Type.STRING },
            explicacao: { type: Type.STRING, description: "Lore, aparência e ecologia" },
            hp: { type: Type.INTEGER, description: "Pontos de vida base" },
            nivel_inicial: { type: Type.INTEGER, description: "Nível inicial sugerido para a criatura (ex: monstos de alta periculosidade começam num nível mais alto)" },
            loot: { type: Type.STRING, description: "Itens dropados valiosos para crafting" },
            str: { type: Type.INTEGER }, dex: { type: Type.INTEGER },
            con: { type: Type.INTEGER }, int: { type: Type.INTEGER },
            wis: { type: Type.INTEGER }, cha: { type: Type.INTEGER },
            ataques: {
              type: Type.ARRAY,
              description: "Ataques e habilidades que causam dano",
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  dano_base: { type: Type.STRING, description: "Ex: '2d6 + 4'" },
                  tipo: { type: Type.STRING },
                  escala: { type: Type.STRING, description: "Ex: '1d6 a cada 5 níveis'" }
                }
              }
            }
          },
          required: ['nome', 'explicacao', 'hp', 'nivel_inicial', 'loot', 'str', 'dex', 'con', 'int', 'wis', 'cha']
        }
      };
    } else if (tipo === 'planta') {
      return {
        sysPrompt: "Crie uma planta fantástica com propriedades para alquimia/crafting.",
        schema: {
          type: Type.OBJECT,
          properties: {
            nome: { type: Type.STRING },
            explicacao: { type: Type.STRING, description: "Aparência orgânica e habitat" },
            loot: { type: Type.STRING, description: "Materiais que podem ser colhidos da planta" }
          },
          required: ['nome', 'explicacao', 'loot']
        }
      }
    } else if (tipo === 'civilizacao') {
      return {
        sysPrompt: "Crie uma civilização de um mundo de RPG de fantasia.",
        schema: {
          type: Type.OBJECT,
          properties: {
            nome: { type: Type.STRING },
            alinhamento: { type: Type.STRING, description: "Alinhamento moral e ético" },
            hierarquia: { type: Type.STRING, description: "Estrutura de poder e liderança" },
            explicacao: { type: Type.STRING, description: "Descrição da cultura, costumes e características gerais" },
          },
          required: ['nome', 'alinhamento', 'hierarquia', 'explicacao']
        }
      }
    } else if (tipo === 'povo') {
      return {
        sysPrompt: "Crie um povo, raça ou etnia para um mundo de RPG.",
        schema: {
          type: Type.OBJECT,
          properties: {
            nome: { type: Type.STRING },
            explicacao: { type: Type.STRING, description: "Descrição detalhada do povo, cultura, aparência e costumes" }
          },
          required: ['nome', 'explicacao']
        }
      }
    } else if (tipo === 'objetivo') {
      return {
        sysPrompt: "Crie um objetivo, meta ou motivação de uma facção ou povo em um jogo de RPG.",
        schema: {
          type: Type.OBJECT,
          properties: {
            nome: { type: Type.STRING, description: "Título do objetivo" },
            explicacao: { type: Type.STRING, description: "Por que buscam isso e o que farão para conquistar" }
          },
          required: ['nome', 'explicacao']
        }
      }
    } else {
      return {
        sysPrompt: `Você é um arquiteto construindo um ${tipo} de fantasia sombria e cativante.`,
        schema: {
          type: Type.OBJECT,
          properties: {
            nome: { type: Type.STRING },
            explicacao: { type: Type.STRING, description: "Descrição climática, relevo, atmosfera e histórico." }
          },
          required: ['nome', 'explicacao']
        }
      }
    }
  };

  const handleGenerateAI = async () => {
    if (!ai) {
      setError("API Key do Gemini ausente no sistema.");
      return;
    }
    if (!aiPrompt.trim()) {
      setError("Descreva ao menos uma pequena centelha de ideia para a Forja.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { sysPrompt, schema } = getAiSchema(activeTab);
      const userContent = `Gere os dados para o tipo: ${activeTab}. 
        Ideia fornecida: "${aiPrompt}". 
        ${getParentContext()}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userContent,
        config: {
          systemInstruction: sysPrompt,
          responseMimeType: 'application/json',
          responseSchema: schema as Schema,
        }
      });

      if (!response.text) throw new Error("A Forja falhou em retornar matéria.");
      
      const parsed = JSON.parse(response.text);
      
      // Auto-fill form
      setFormData(prev => {
        const next: Partial<Entity> = { ...prev, ...parsed, tipo: activeTab, parentId: selectedParentId || null };
        if (parsed.str !== undefined) {
          next.attributes = {
            str: parsed.str, dex: parsed.dex, con: parsed.con,
            int: parsed.int, wis: parsed.wis, cha: parsed.cha
          };
        }
        if (activeTab === 'civilizacao') {
          next.alinhamento = parsed.alinhamento;
          next.hierarquia = parsed.hierarquia;
        }
        return next;
      });

      // Switch gently to manual mode to let them review and save
      setCreationMode('manual');
      setAiPrompt('');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro mágico desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveForm = () => {
    if (!formData.nome || !formData.explicacao) {
      setError("Nome e Explicação são os pilares da criação (Obrigatórios).");
      return;
    }

    if (editingId) {
      setDatabase(prev => ({
        items: prev.items.map(i => i.id === editingId ? {
          ...i,
          ...formData,
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
        loot: formData.loot,
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
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-amber-900/40">
      
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-zinc-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-serif text-amber-500 tracking-tight">Codex Relacional</h1>
            <p className="text-xs text-zinc-500 hidden sm:block">Gestão Universal e Forja Arcana via IA</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span className="hidden md:inline">Importar Codex</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadJson} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors shadow-sm shadow-amber-900/20">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Exportar Codex</span>
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Sidebar Categories */}
        <aside className="w-full md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-zinc-800/60 bg-zinc-900/30 overflow-x-auto md:overflow-y-auto flex flex-col">
          <div className="p-4 flex flex-row md:flex-col gap-2">
            <h3 className="hidden md:block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-2">Adicionar</h3>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                   setActiveTab(tab.id);
                   setEditingId(null);
                   setFormData({ tipo: tab.id });
                   setAiPrompt('');
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                  activeTab === tab.id ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {tab.icon}
                <span className="capitalize">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex flex-col p-4 border-t border-zinc-800/60 flex-1 overflow-y-auto">
             <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                <ListTree className="w-4 h-4" /> Navegação
             </h3>
             <div className="space-y-1">
               {rootItems.filter(i => ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo)).map(node => (
                 <GeoNavNode key={node.id} entity={node} allItems={database.items} />
               ))}
               {rootItems.filter(i => ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo)).length === 0 && (
                 <p className="text-xs text-zinc-600 italic px-2">Nenhuma geografia raiz.</p>
               )}
             </div>
          </div>
        </aside>

        {/* Forge Area */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-zinc-950">
          
          {/* Creation Panel */}
          <div className="w-full lg:w-[480px] xl:w-[500px] flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800/60 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-0">
            
            {/* Mode Toggles */}
            <div className="flex border-b border-zinc-800/80 bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-sm">
              <button 
                onClick={() => setCreationMode('manual')}
                className={`flex-1 flex justify-center items-center gap-2 py-4 text-sm font-semibold transition-all ${creationMode === 'manual' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <PenTool className="w-4 h-4" /> Escrever (Manual)
              </button>
              <button 
                onClick={() => setCreationMode('ai')}
                className={`flex-1 flex justify-center items-center gap-2 py-4 text-sm font-semibold transition-all ${creationMode === 'ai' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Wand2 className="w-4 h-4" /> Forja Arcana (IA)
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-serif text-white mb-4 tracking-tight capitalize flex items-center gap-2">
                Criando: <span className="text-amber-500">{activeTab}</span>
              </h2>

              {/* Context Picker */}
              <div className="mb-6 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" /> Vinculação Ancestral (Opcional)
                </label>
                <select 
                  value={selectedParentId || ''}
                  onChange={(e) => setSelectedParentId(e.target.value || null)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">-- Entidade Solta (Raiz) --</option>
                  {possibleParents.map(c => (
                     <option key={c.id} value={c.id}>
                       [{c.tipo.substring(0,3).toUpperCase()}] {c.nome}
                     </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500 mt-2">Dita à IA sobre qual contexto ela deve gerar este item.</p>
              </div>

              {/* Error Box */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-4 bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* IA FORGE MODE */}
              {creationMode === 'ai' && (
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-4">
                  <p className="text-sm text-blue-200/60 bg-blue-950/20 p-4 rounded-lg border border-blue-900/30">
                    A Forja Arcana usará a "Vinculação Ancestral" acima para deduzir clima, estilo e lore. Descreva um fragmento de ideia para dar a fagulha inicial. O formulário manual será preenchido com a resposta.
                  </p>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Ex: "Um necromante cego adaptado às dunas de areia negra"...`}
                    className="w-full h-32 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl p-4 text-sm resize-none outline-none focus:border-blue-500 focus:bg-zinc-800 transition-all placeholder:text-zinc-600 shadow-inner"
                  />
                  <button
                    onClick={handleGenerateAI}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full" /> : <Wand2 className="w-5 h-5" />}
                    {isLoading ? 'Conjurando Entidade...' : 'Sugerir com Magia'}
                  </button>
                </motion.div>
              )}

              {/* MANUAL MODE */}
              {creationMode === 'manual' && (
                <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome</label>
                    <input type="text" value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 focus:border-amber-500 outline-none" placeholder="Ex: Grifo de Basalto" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Explicação (Lore/Descrição)</label>
                    <textarea value={formData.explicacao || ''} onChange={e => setFormData({...formData, explicacao: e.target.value})} className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 focus:border-amber-500 outline-none resize-none" placeholder="Narrativa de seu comportamento..." />
                  </div>

                  {/* Monstros e Animais - Status específicos */}
                  {['monstro', 'animal'].includes(activeTab) && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Vida (HP)</label>
                        <input type="number" value={formData.hp || ''} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 focus:border-red-500 outline-none" placeholder="Ex: 120" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Nível Inicial</label>
                        <input type="number" value={formData.nivel_inicial || ''} onChange={e => setFormData({...formData, nivel_inicial: parseInt(e.target.value) || 1})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-blue-400 focus:border-blue-500 outline-none" placeholder="Ex: 1" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Loot / Drop</label>
                        <input type="text" value={formData.loot || ''} onChange={e => setFormData({...formData, loot: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-amber-300 focus:border-amber-500 outline-none" placeholder="Couro rudimentar" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'planta' && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Loot / Coleta</label>
                      <input type="text" value={formData.loot || ''} onChange={e => setFormData({...formData, loot: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-emerald-300 focus:border-emerald-500 outline-none" placeholder="Seiva luminosa, Folhas ácidas..." />
                    </div>
                  )}

                  {activeTab === 'civilizacao' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">Alinhamento</label>
                          <input type="text" value={formData.alinhamento || ''} onChange={e => setFormData({...formData, alinhamento: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 focus:border-amber-500 outline-none" placeholder="Ex: Neutro e Bom" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">Hierarquia</label>
                          <input type="text" value={formData.hierarquia || ''} onChange={e => setFormData({...formData, hierarquia: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 focus:border-amber-500 outline-none" placeholder="Ex: Monarquia absolutista..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {['monstro', 'animal'].includes(activeTab) && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-2">Atributos Base</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((attr) => (
                           <div key={attr}>
                             <span className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block text-center">{attr}</span>
                             <input type="number" 
                               value={(formData.attributes as any)?.[attr] || ''} 
                               onChange={e => setFormData({
                                 ...formData, 
                                 attributes: { ...((formData.attributes || {str:10,dex:10,con:10,int:10,wis:10,cha:10}) as any), [attr]: e.target.value }
                               })}
                               className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-center text-sm focus:border-amber-500 outline-none" />
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {['monstro', 'animal'].includes(activeTab) && (
                    <div className="pt-2">
                       <label className="block text-xs font-semibold text-zinc-400 mb-2 flex justify-between items-center">
                         Ataques e Ações
                         <button 
                           onClick={() => setFormData(prev => ({ ...prev, ataques: [...(prev.ataques || []), { nome: '', dano_base: '1d6 + 0', tipo: '', escala: '1d6 a cada 10 níveis' }] }))}
                           className="text-amber-500 hover:text-amber-400 text-[10px] px-2 py-1 bg-amber-500/10 rounded"
                         >
                           + Add Ação
                         </button>
                       </label>
                       <div className="space-y-3">
                         {(formData.ataques || []).map((atk, idx) => (
                           <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg grid grid-cols-2 gap-2 relative">
                             <button 
                               onClick={() => setFormData(prev => ({ ...prev, ataques: prev.ataques?.filter((_, i) => i !== idx) }))}
                               className="absolute -right-2 -top-2 bg-red-900 text-white rounded-full p-1 border border-red-800"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>
                             <input type="text" placeholder="Nome (Ex: Coice)" value={atk.nome} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].nome = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs focus:border-amber-500 outline-none" />
                             <input type="text" placeholder="Dano (Ex: 2d6 + 4)" value={atk.dano_base} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].dano_base = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs font-mono text-red-400 focus:border-amber-500 outline-none" />
                             <input type="text" placeholder="Tipo (Ex: Fogo)" value={atk.tipo} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].tipo = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs focus:border-amber-500 outline-none" />
                             <input type="text" placeholder="Escala" value={atk.escala || ''} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].escala = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs focus:border-amber-500 outline-none" />
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-zinc-800/60 flex gap-2">
                    <button
                      onClick={handleSaveForm}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-900/20"
                    >
                      <Save className="w-5 h-5" /> {editingId ? 'Salvar Alterações' : 'Registrar no Codex'}
                    </button>
                    {editingId && (
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ tipo: activeTab });
                        }}
                        className="px-4 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* Viewer Area - Flat List dynamically rendered as Tree */}
          <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-white tracking-tight flex items-center gap-3">
                  <Map className="w-6 h-6 text-amber-500" /> O Mundo Persistente ({database.items.length} Registros)
                </h2>
              </div>
              
              {rootItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/20">
                  <Compass className="w-12 h-12 text-zinc-700 mb-4" />
                  <h3 className="text-zinc-400 font-medium mb-2 text-lg">O Caos Primordial</h3>
                  <p className="text-zinc-600 text-sm max-w-md">Para organizar o mundo, crie entidades no formulário ao lado. Começar por um Continente é uma boa prática.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rootItems.map(item => (
                    <EntityNode key={item.id} entity={item} allItems={database.items} level={0} onUpdateParent={handleUpdateParent} onDelete={handleDelete} onEdit={handleEdit} possibleParents={possibleParents} onCommitLevel={handleCommitLevel} />
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
        className="text-xs text-zinc-400 hover:text-amber-500 hover:bg-zinc-800/50 rounded px-2 py-1.5 cursor-pointer truncate flex items-center gap-2"
        style={{ paddingLeft: `${(level * 8) + 8}px` }}
        title={entity.nome}
      >
        {entity.tipo === 'continente' ? <Map className="w-3 h-3 text-amber-600" /> : entity.tipo === 'bioma' ? <Leaf className="w-3 h-3 text-emerald-600" /> : entity.tipo === 'regiao' ? <Compass className="w-3 h-3 text-purple-600" /> : entity.tipo === 'civilizacao' ? <Castle className="w-3 h-3 text-blue-500" /> : entity.tipo === 'povo' ? <Users className="w-3 h-3 text-amber-500"/> : <Flag className="w-3 h-3 text-rose-500" />}
        {entity.nome}
      </div>
      {children.map(child => (
        <GeoNavNode key={child.id} entity={child} allItems={allItems} level={level + 1} />
      ))}
    </div>
  );
}

// --- Recursive Tree Component implementation ---

const EntityNode = ({ entity, allItems, level, onUpdateParent, onDelete, onEdit, possibleParents, onCommitLevel }: any) => {
   const [open, setOpen] = useState(level < 1);
   const children = allItems.filter((i: any) => i.parentId === entity.id);
   const [forecastLevel, setForecastLevel] = useState<number>(entity.nivel_atual || entity.nivel_inicial || 1);
   
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
      <div className={`border border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-zinc-950 ${level > 0 ? (level === 1 ? 'mt-3 mb-2 ml-4 border-l-2 border-l-amber-900' : 'mt-2 mb-1 ml-6 border-l-2 border-l-zinc-700/50') : 'mb-4 shadow-[0_4px_24px_rgba(0,0,0,0.3)]'}`}>
        
        {/* Header Node Row */}
        <div className="p-3 md:p-4 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors flex flex-col md:flex-row md:items-start gap-4 justify-between relative group">
           <div className="flex gap-3 flex-1 min-w-0">
             <button onClick={() => setOpen(!open)} className={`mt-0.5 p-1 rounded hover:bg-zinc-800 transition-colors ${children.length ? 'text-zinc-300' : 'opacity-0 cursor-default'}`}>
               {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
             </button>
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {getIcon()}
                  <h3 className={`font-serif tracking-tight truncate ${level === 0 ? 'text-lg text-white font-bold' : 'text-base text-zinc-200'}`}>
                    {entity.nome}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {entity.tipo}
                  </span>
                  
                  {/* Status Badges */}
                  {(entity.nivel_atual || entity.nivel_inicial) ? <span className="bg-blue-950/30 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-900/30 flex items-center gap-1"><Zap className="w-3 h-3"/> Nível: {entity.nivel_atual || entity.nivel_inicial}</span> : null}
                  {entity.hp && <span className="bg-red-950/40 text-red-400 text-[10px] px-2 py-0.5 rounded border border-red-900/30">HP: {entity.hp}</span>}
                  {entity.loot && <span className="bg-emerald-950/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-900/30 line-clamp-1 max-w-[200px]">Loot: {entity.loot}</span>}
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">{entity.explicacao}</p>

                {/* Attributes for monsters */}
                {entity.attributes && (
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {Object.entries(entity.attributes).map(([k, v]) => (
                      <div key={k} className="bg-zinc-950 border border-zinc-800 px-2 py-1 rounded flex items-center justify-between min-w-[60px]">
                        <span className="text-[9px] uppercase text-zinc-500 font-bold">{k}</span>
                        <span className="text-xs text-zinc-300 font-serif">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Civilizacao fields */}
                {entity.tipo === 'civilizacao' && (
                  <div className="mt-3 space-y-2 w-full text-sm bg-blue-950/20 border border-blue-900/30 p-3 rounded text-zinc-300">
                     {entity.alinhamento && <p><span className="text-blue-400/80 font-semibold uppercase text-[10px] tracking-wider mr-2">Alinhamento:</span> <span>{entity.alinhamento}</span></p>}
                     {entity.hierarquia && <p><span className="text-blue-400/80 font-semibold uppercase text-[10px] tracking-wider mr-2">Hierarquia:</span> <span>{entity.hierarquia}</span></p>}
                  </div>
                )}

                {/* Attacks & Skills */}
                {entity.ataques && entity.ataques.length > 0 && (
                  <div className="mt-3 space-y-2 w-full">
                     <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Ações e Ataques</span>
                     <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                       {entity.ataques.map((atk: any, idx: number) => (
                         <div key={idx} className="bg-zinc-950/80 border border-zinc-800 rounded p-2 flex flex-col gap-1 text-sm">
                           <div className="flex justify-between items-center text-zinc-200 font-medium">
                             <span>{atk.nome}</span>
                             <span className="text-red-400 bg-red-950/20 border border-red-900/50 px-1.5 py-0.5 rounded font-mono text-xs">{atk.dano_base}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] text-zinc-500">
                             <span>{atk.tipo}</span>
                             {atk.escala && <span className="opacity-70">Escala: {atk.escala}</span>}
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
          loot: item.loot,
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
