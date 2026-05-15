import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Download, Upload, ArrowLeft, PlusCircle, Map, Target, Skull, Leaf, Compass, ChevronDown, ChevronRight, Trash2, Wand2, PenTool, Navigation, Save, Zap, ListTree, Castle, Users, Flag, Edit2, Feather } from 'lucide-react';

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
            loots: { type: Type.ARRAY, description: "Itens dropados valiosos para crafting", items: { type: Type.STRING } },
            fisico: { type: Type.INTEGER }, precisao: { type: Type.INTEGER },
            resistencia: { type: Type.INTEGER }, mente: { type: Type.INTEGER },
            vontade: { type: Type.INTEGER }, eloquencia: { type: Type.INTEGER },
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
          required: ['nome', 'explicacao', 'hp', 'nivel_inicial', 'loots', 'fisico', 'precisao', 'resistencia', 'mente', 'vontade', 'eloquencia']
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
            loots: { type: Type.ARRAY, description: "Materiais que podem ser colhidos da planta", items: { type: Type.STRING } }
          },
          required: ['nome', 'explicacao', 'loots']
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
        if (parsed.fisico !== undefined) {
          next.attributes = {
            fisico: parsed.fisico, precisao: parsed.precisao, resistencia: parsed.resistencia,
            mente: parsed.mente, vontade: parsed.vontade, eloquencia: parsed.eloquencia
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
    <div className="flex flex-col min-h-screen font-serif selection:bg-[#d4af37]/40 text-[#eaddc5]" style={{ backgroundColor: '#0a0806' }}>
      <style>{`
        .leather-strip {
          background: linear-gradient(170deg, #1c140d 0%, #0d0805 100%);
          border-right: 2px solid #3a2818;
          box-shadow: inset -2px 0 10px rgba(0,0,0,0.8), 5px 0 15px rgba(0,0,0,0.5);
        }
        .rune-glow {
          text-shadow: 0 0 10px #d4af37, 0 0 20px #d4af37;
          color: #fff1ce;
        }
        .wax-seal {
          background: radial-gradient(circle at 30% 30%, #a62b2b, #590f0f);
          border: 2px solid #3d0808;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.2);
          border-radius: 50%;
          color: #ffcccc;
          position: relative;
        }
        .wax-seal:after {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          border: 1px dashed rgba(255,255,255,0.2);
        }
        .metal-plate {
          background: linear-gradient(to bottom, #2b2521, #14110f);
          border: 1px solid #4a3d32;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 6px rgba(0,0,0,0.5);
        }
        .metal-plate.active {
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.5), 0 0 0 1px #d4af37;
          border-color: #d4af37;
        }
        .ethereal-glow {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.2);
          border-color: #60a5fa !important;
        }
        .cartographer-field {
          background: transparent !important;
          border: 1px solid rgba(142, 108, 70, 0.4) !important;
          border-radius: 2px !important;
          font-family: 'EB Garamond', serif !important;
          color: #eaddc5 !important;
        }
        .cartographer-field:focus {
          border-color: #d4af37 !important;
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.2) !important;
        }
        @keyframes cosmic-fog {
          0% { transform: scale(1) translate(0, 0); opacity: 0.1; }
          33% { transform: scale(1.1) translate(2%, -2%); opacity: 0.2; }
          66% { transform: scale(0.95) translate(-1%, 3%); opacity: 0.15; }
          100% { transform: scale(1) translate(0, 0); opacity: 0.1; }
        }
        .cosmic-dust {
          animation: cosmic-fog 25s ease-in-out infinite;
        }
      `}</style>

      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#3a2818] bg-[#0a0806]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[#8e6c46] hover:text-[#d4af37] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-cinzel font-bold text-[#d4af37] tracking-wider">Mesa do Cartógrafo</h1>
            <p className="text-sm font-serif text-[#8e6c46] hidden sm:block italic">Forja de mundos escuros e ancestrais</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-cinzel tracking-widest text-[#d4af37] bg-black/40 hover:bg-black/60 border border-[#8e6c46]/50 rounded-sm cursor-pointer transition-colors uppercase shadow-inner">
            <Upload className="w-4 h-4 text-[#8e6c46]" />
            <span className="hidden md:inline">Importar</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadJson} className="flex items-center gap-2 px-3 py-1.5 text-xs font-cinzel tracking-widest text-[#0a0806] bg-[#d4af37] hover:bg-[#c4a977] rounded-sm transition-colors uppercase shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Exportar Codex</span>
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        
        {/* Background Map Silhouette and Fog */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-10 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-[#120c08] to-transparent z-10" />
           <div className="cosmic-dust absolute w-[150%] h-[150%] flex items-center justify-center">
              <svg viewBox="0 0 800 800" className="w-full max-w-[1200px] h-auto stroke-[#d4af37] opacity-60">
                 <circle cx="400" cy="400" r="380" fill="none" strokeWidth="2" strokeDasharray="5 10" />
                 <circle cx="400" cy="400" r="340" fill="none" strokeWidth="1" />
                 <circle cx="400" cy="400" r="200" fill="none" strokeWidth="0.5" strokeDasharray="1 4" />
                 <path d="M400 20 L400 780 M20 400 L780 400" strokeWidth="1" />
                 <path d="M130 130 L670 670 M130 670 L670 130" strokeWidth="0.5" />
                 <polygon points="400,80 430,370 720,400 430,430 400,720 370,430 80,400 370,370" fill="none" strokeWidth="1.5" />
              </svg>
           </div>
           <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] rounded-full blur-3xl cosmic-dust" style={{animationDelay: '-5s'}} />
           <div className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[90%] bg-[radial-gradient(ellipse_at_center,rgba(100,50,20,0.1)_0%,transparent_70%)] rounded-full blur-3xl cosmic-dust" style={{animationDelay: '-12s'}} />
        </div>

        {/* Sidebar Categories */}
        <aside className="w-full md:w-56 flex-shrink-0 leather-strip overflow-x-auto md:overflow-y-auto flex flex-col z-10 relative">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-30"></div>
          
          <div className="p-4 flex flex-row md:flex-col gap-2">
            <h3 className="hidden md:flex text-xs font-cinzel text-[#8e6c46] font-bold uppercase tracking-[0.2em] mb-2 px-2 items-center gap-2">
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
                   setAiPrompt('');
                }}
                className={`flex items-center gap-3 px-3 py-3 rounded text-sm transition-all flex-shrink-0 border-b border-transparent ${
                  isActive ? 'rune-glow bg-[#d4af37]/5 border-b-[#d4af37]/40' : 'text-[#8e6c46] hover:text-[#c4a977] hover:bg-black/20'
                }`}
              >
                <div className={`${isActive ? 'opacity-100 text-[#d4af37]' : 'opacity-60 text-[#8e6c46]'}`}>{tab.icon}</div>
                <span className="capitalize font-cinzel tracking-wider text-xs">{tab.label}</span>
              </button>
            )})}
          </div>

          <div className="hidden md:flex flex-col p-4 border-t border-[#3a2818]/60 flex-1 overflow-y-auto">
             <h3 className="text-xs font-cinzel font-bold text-[#8e6c46] uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
                <ListTree className="w-3 h-3" /> Cartografia
             </h3>
             <div className="space-y-1 font-serif text-sm">
               {rootItems.filter(i => ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo)).map(node => (
                 <GeoNavNode key={node.id} entity={node} allItems={database.items} />
               ))}
               {rootItems.filter(i => ['continente', 'bioma', 'regiao', 'civilizacao'].includes(i.tipo)).length === 0 && (
                 <p className="text-xs text-[#5c442c] italic px-2">Atlas em branco.</p>
               )}
             </div>
          </div>
        </aside>

        {/* Forge Area */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
          
          {/* Creation Panel */}
          <div className="w-full lg:w-[480px] xl:w-[500px] flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#3a2818]/60 overflow-y-auto shadow-2xl bg-[#0d0a08]/80 backdrop-blur-md">
            
            {/* Mode Toggles */}
            <div className="flex p-4 gap-4 sticky top-0 z-10 bg-[#0d0a08]/90 border-b border-[#3a2818]/80 backdrop-blur-md pt-6">
              <button 
                onClick={() => setCreationMode('manual')}
                className={`flex-1 flex flex-col justify-center items-center gap-2 py-3 rounded-md text-xs font-cinzel font-bold tracking-widest uppercase transition-all metal-plate ${creationMode === 'manual' ? 'active text-[#d4af37]' : 'text-[#8e6c46] hover:text-[#c4a977]'}`}
              >
                <Feather className="w-5 h-5 mb-1" />
                Escrever
              </button>
              <button 
                onClick={() => setCreationMode('ai')}
                className={`flex-1 flex flex-col justify-center items-center gap-2 py-3 rounded-md text-xs font-cinzel font-bold tracking-widest uppercase transition-all metal-plate ${creationMode === 'ai' ? 'ethereal-glow text-blue-300' : 'text-[#726488] hover:text-[#9084a3]'}`}
              >
                <Wand2 className="w-5 h-5 mb-1 opacity-80" />
                Forja Arcana
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-cinzel font-black text-[#d4af37] mb-6 tracking-wide flex items-center gap-3">
                Preenchendo: <span className="text-[#eaddc5] opacity-90 uppercase">{activeTab}</span>
              </h2>

              {/* Context Picker */}
              <div className="mb-6 p-4 rounded-sm border border-[#8e6c46]/30 bg-black/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(212,175,55,0.03) 25%, transparent 25%, transparent 50%, rgba(212,175,55,0.03) 50%, rgba(212,175,55,0.03) 75%, transparent 75%, transparent)' }}>
                <label className="block text-[11px] font-cinzel font-bold text-[#d4af37] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" /> Ancoragem Geográfica
                </label>
                <select 
                  value={selectedParentId || ''}
                  onChange={(e) => setSelectedParentId(e.target.value || null)}
                  className="w-full cartographer-field py-2 text-sm appearance-none outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#140e0b] text-[#8e6c46]">-- Solto no Éter (Raiz) --</option>
                  {possibleParents.map(c => (
                     <option key={c.id} value={c.id} className="bg-[#140e0b] text-[#d4af37]">
                       [{c.tipo.substring(0,3).toUpperCase()}] {c.nome}
                     </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#8e6c46] mt-2 italic font-serif">Referência utilizada pela Forja Arcana e pelo Mapa relacional.</p>
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
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-4 pt-2">
                  <p className="text-sm font-serif italic text-blue-200/70 p-4 border border-blue-900/30 bg-blue-950/20 rounded-sm">
                    A Forja invocará os sussurros do caos. Sua "Ancoragem Geográfica" proverá as correntes do destino. Escreva seu desejo primal abaixo e deixe a Névoa tricotar sua ideia.
                  </p>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Ex: "Um necromante cego adaptado às dunas de areia negra"...`}
                    className="w-full h-32 cartographer-field p-3 resize-none shadow-inner ethereal-glow"
                  />
                  <button
                    onClick={handleGenerateAI}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-4 mt-2 text-sm font-cinzel font-bold tracking-widest uppercase transition-all border border-[#60a5fa] hover:bg-[#60a5fa]/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed bg-[#172554]/40"
                  >
                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full" /> : <Wand2 className="w-5 h-5" />}
                    {isLoading ? 'Manipulando o Éter...' : 'Conjurar Ideia'}
                  </button>
                </motion.div>
              )}

              {/* MANUAL MODE */}
              {creationMode === 'manual' && (
                <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="space-y-6 pt-2 pb-10">
                  <div>
                    <label className="block text-[11px] font-cinzel font-bold text-[#8e6c46] tracking-widest uppercase mb-1">Nomenclatura Erudita</label>
                    <input type="text" value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full cartographer-field p-2" placeholder="Ex: Grifo de Basalto" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-cinzel font-bold text-[#8e6c46] tracking-widest uppercase mb-1">Descrição do Códice</label>
                    <textarea value={formData.explicacao || ''} onChange={e => setFormData({...formData, explicacao: e.target.value})} className="w-full h-32 cartographer-field p-3 resize-none" placeholder="Lenda e natureza..." />
                  </div>

                  {/* Monstros e Animais - Status específicos */}
                  {['monstro', 'animal'].includes(activeTab) && (
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-cinzel font-bold text-[#991b1b] tracking-widest uppercase mb-1">Vigor</label>
                        <input type="number" value={formData.hp || ''} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full cartographer-field text-[#fca5a5] border-b-[#7f1d1d] p-2 text-center" placeholder="Ex: 120" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-cinzel font-bold text-[#1e40af] tracking-widest uppercase mb-1">Nível Base</label>
                        <input type="number" value={formData.nivel_inicial || ''} onChange={e => setFormData({...formData, nivel_inicial: parseInt(e.target.value) || 1})} className="w-full cartographer-field text-[#93c5fd] border-b-[#1e3a8a] p-2 text-center" placeholder="Ex: 1" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-cinzel font-bold text-[#8e6c46] tracking-widest mb-1 flex justify-between items-center uppercase">
                          Despojos
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, loots: [...(prev.loots || (prev.loot ? [prev.loot] : [])), ''] }))} className="text-[#d4af37] hover:text-white px-1">
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
                              }} className="w-full cartographer-field p-1 text-xs" placeholder="..." />
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
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, loots: [...(prev.loots || (prev.loot ? [prev.loot] : [])), ''] }))} className="text-[#4ade80] hover:text-white">
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
                              }} className="w-full cartographer-field p-2 text-sm text-[#86efac] border-b-[#166534]" placeholder="Ex: Seiva luminosa" />
                              <button type="button" onClick={() => {
                                const arr = [...(formData.loots || (formData.loot ? [formData.loot] : []))];
                                arr.splice(i, 1);
                                setFormData({...formData, loots: arr, loot: undefined});
                              }} className="text-[#7f1d1d] hover:text-red-500">
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
                          <label className="block text-[11px] font-cinzel font-bold text-[#8e6c46] tracking-widest uppercase mb-1">Alinhamento Mítico</label>
                          <input type="text" value={formData.alinhamento || ''} onChange={e => setFormData({...formData, alinhamento: e.target.value})} className="w-full cartographer-field p-2" placeholder="Ex: Neutro e Bom" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-cinzel font-bold text-[#8e6c46] tracking-widest uppercase mb-1">Estrutura de Poder</label>
                          <input type="text" value={formData.hierarquia || ''} onChange={e => setFormData({...formData, hierarquia: e.target.value})} className="w-full cartographer-field p-2" placeholder="Ex: Monarquia absolutista..." />
                        </div>
                      </div>
                    </div>
                  )}

                  {['monstro', 'animal'].includes(activeTab) && (
                    <div>
                      <label className="block text-[11px] font-cinzel font-bold text-[#d4af37] tracking-widest uppercase mb-3 text-center border-b border-[#8e6c46] pb-1 mx-8">Essência Corporal</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {['fisico', 'precisao', 'resistencia', 'mente', 'vontade', 'eloquencia'].map((attr) => (
                           <div key={attr} className="flex flex-col border border-[#8e6c46]/30 bg-black/40 p-1">
                             <span className="text-[9px] font-cinzel font-bold tracking-widest uppercase text-[#8e6c46] mb-1 text-center">{attr.substring(0,3)}</span>
                             <input type="number" 
                               value={(formData.attributes as any)?.[attr] || ''} 
                               onChange={e => setFormData({
                                 ...formData, 
                                 attributes: { ...((formData.attributes || {fisico:10,precisao:10,resistencia:10,mente:10,vontade:10,eloquencia:10}) as any), [attr]: e.target.value }
                               })}
                               className="w-full bg-transparent border-none text-center text-sm font-serif text-[#eaddc5] outline-none" />
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {['monstro', 'animal'].includes(activeTab) && (
                    <div className="pt-2">
                       <label className="block text-[11px] font-cinzel font-bold text-[#d4af37] tracking-widest uppercase mb-2 flex justify-between items-center border-b border-[#8e6c46] pb-1">
                         Arsenal Biológico
                         <button 
                           onClick={() => setFormData(prev => ({ ...prev, ataques: [...(prev.ataques || []), { nome: '', dano_base: '1d6 + 0', tipo: '', escala: '1d6 a cada 10 níveis' }] }))}
                           className="text-[10px] px-2 py-0.5 border border-[#8e6c46]/50 bg-black/30 hover:bg-[#d4af37] hover:text-black transition-colors font-serif uppercase tracking-wider"
                         >
                           + Novo Gesto Mortífero
                         </button>
                       </label>
                       <div className="space-y-3 mt-3">
                         {(formData.ataques || []).map((atk, idx) => (
                           <div key={idx} className="p-3 bg-black/40 border border-[#8e6c46]/40 grid grid-cols-2 gap-3 relative shadow-inner">
                             <button 
                               onClick={() => setFormData(prev => ({ ...prev, ataques: prev.ataques?.filter((_, i) => i !== idx) }))}
                               className="absolute -right-2 -top-2 bg-[#590f0f] text-[#ffcccc] rounded-full p-1 border border-[#3d0808] hover:scale-110 transition-transform shadow-md"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>
                             <input type="text" placeholder="Nome (Ex: Coice)" value={atk.nome} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].nome = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full cartographer-field p-1 text-xs" />
                             <input type="text" placeholder="Dano (Ex: 2d6 + 4)" value={atk.dano_base} onChange={e => {
                               const arr = [...(formData.ataques || [])]; arr[idx].dano_base = e.target.value; setFormData({...formData, ataques: arr});
                             }} className="w-full cartographer-field border-b-[#991b1b] text-[#fca5a5] p-1 text-xs font-serif text-center" />
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

                  <div className="pt-6 mt-8 border-t border-[#3a2818]/60 flex items-center justify-center gap-4">
                    <button
                      onClick={handleSaveForm}
                      className="group flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-transform"
                    >
                      <div className="w-20 h-20 wax-seal flex items-center justify-center transition-all group-hover:brightness-110">
                         {editingId ? <Save className="w-8 h-8 opacity-90 drop-shadow-md" /> : <img src="data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23ffcccc' stroke-width='1.5'><path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'/><line x1='7' y1='7' x2='7' y2='7' stroke-linecap='round' stroke-width='2'/></svg>" className="w-8 h-8 opacity-80" alt="seal"/> }
                      </div>
                      <span className="mt-2 text-[10px] font-cinzel font-bold text-[#c4a977] uppercase tracking-[0.2em] group-hover:text-[#d4af37] transition-colors text-center shadow-black">
                        {editingId ? 'Ressigilar' : 'Carimbar no Codex'}
                      </span>
                    </button>
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
                </motion.div>
              )}

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
                <div className="flex flex-col items-center justify-center py-40 text-center relative pointer-events-none group">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity duration-[2s]">
                    <div className="w-64 h-64 border border-[#8e6c46]/30 rounded-full animate-spin-slow pointer-events-none" style={{animationDuration: '60s'}} />
                    <div className="absolute w-48 h-48 border border-dashed border-[#8e6c46]/40 rounded-full animate-spin-reverse-slow pointer-events-none" style={{animationDuration: '40s'}} />
                  </div>
                  <Compass className="w-16 h-16 text-[#8e6c46] mb-6 drop-shadow-md relative z-10" />
                  <h3 className="text-[#d4af37] font-cinzel text-xl tracking-[0.2em] mb-2 uppercase relative z-10">O Caos Primordial</h3>
                  <p className="text-[#a48866] font-serif italic text-lg max-w-md relative z-10">O vazio aguarda a primeira fagulha de criação. Carimbe seu primeiro Continente nas névoas.</p>
                </div>
              ) : (
                <div className="space-y-6">
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
      <div className={`border border-[#3a2818] overflow-hidden ${level > 0 ? (level === 1 ? 'mt-4 mb-3 ml-6 border-l-2 border-l-[#8e6c46] rounded-sm' : 'mt-3 mb-2 ml-8 border-l border-l-[#8e6c46]/50 rounded-sm') : 'mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] rounded-md bg-[#120c08]/80 backdrop-blur-sm'}`}>
        
        {/* Header Node Row */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-black/60 to-transparent hover:bg-black/80 transition-colors flex flex-col md:flex-row md:items-start gap-4 justify-between relative group border-b border-[#3a2818]/40">
           <div className="flex gap-4 flex-1 min-w-0">
             <button onClick={() => setOpen(!open)} className={`mt-1 p-1 hover:text-[#d4af37] transition-colors ${children.length ? 'text-[#8e6c46]' : 'opacity-0 cursor-default'}`}>
               {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
             </button>
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {getIcon()}
                  <h3 className={`font-cinzel tracking-widest uppercase truncate ${level === 0 ? 'text-xl text-[#d4af37] font-black' : 'text-lg text-[#c4a977] font-bold'}`}>
                    {entity.nome}
                  </h3>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#8e6c46] border border-[#8e6c46]/30 bg-black/40 px-2 py-0.5 rounded-sm">
                    {entity.tipo}
                  </span>
                  
                  {/* Status Badges */}
                  {(entity.nivel_atual || entity.nivel_inicial) ? <span className="bg-[#172554]/40 text-[#93c5fd] text-[10px] px-2 py-0.5 rounded-sm border border-[#1e3a8a] flex items-center gap-1 font-serif"><Zap className="w-3 h-3"/> Nível: {entity.nivel_atual || entity.nivel_inicial}</span> : null}
                  {entity.hp && <span className="bg-[#450a0a]/40 text-[#fca5a5] text-[10px] px-2 py-0.5 rounded-sm border border-[#7f1d1d] font-serif">Vigor: {entity.hp}</span>}
                  {(entity.loots?.length ? entity.loots : (entity.loot ? [entity.loot] : [])).length > 0 && <span className="bg-[#022c22]/40 text-[#6ee7b7] text-[10px] px-2 py-0.5 rounded-sm border border-[#064e3b] line-clamp-1 max-w-[200px] font-serif" title={(entity.loots?.length ? entity.loots : (entity.loot ? [entity.loot] : [])).join(', ')}>Despojos: {(entity.loots?.length ? entity.loots : (entity.loot ? [entity.loot] : [])).join(', ')}</span>}
                </div>
                <p className="text-[#a48866] font-serif text-sm leading-relaxed italic">{entity.explicacao}</p>

                {/* Attributes for monsters */}
                {entity.attributes && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {Object.entries(entity.attributes).map(([k, v]) => (
                      <div key={k} className="bg-black/40 border border-[#8e6c46]/30 px-2 py-1 flex items-center justify-between min-w-[70px]">
                        <span className="text-[9px] uppercase text-[#8e6c46] font-cinzel font-bold tracking-wider">{k.substring(0,3)}</span>
                        <span className="text-sm text-[#eaddc5] font-serif">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Civilizacao fields */}
                {entity.tipo === 'civilizacao' && (
                  <div className="mt-4 space-y-2 w-full text-sm bg-black/40 border border-[#d4af37]/20 p-4 font-serif text-[#eaddc5]">
                     {entity.alinhamento && <p><span className="text-[#d4af37] font-cinzel font-bold uppercase text-[10px] tracking-wider mr-2">Alinhamento Mítico:</span> <span>{entity.alinhamento}</span></p>}
                     {entity.hierarquia && <p><span className="text-[#d4af37] font-cinzel font-bold uppercase text-[10px] tracking-wider mr-2">Estrutura de Poder:</span> <span>{entity.hierarquia}</span></p>}
                  </div>
                )}

                {/* Attacks & Skills */}
                {entity.ataques && entity.ataques.length > 0 && (
                  <div className="mt-4 space-y-2 w-full">
                     <span className="text-[10px] font-cinzel uppercase text-[#8e6c46] font-bold tracking-widest border-b border-[#8e6c46]/40 pb-1 flex">Arsenal Biológico</span>
                     <div className="grid gap-3 grid-cols-1 md:grid-cols-2 mt-2">
                       {entity.ataques.map((atk: any, idx: number) => (
                         <div key={idx} className="bg-black/60 border border-[#8e6c46]/30 p-3 flex flex-col gap-1 text-sm shadow-inner relative">
                           <div className="flex justify-between items-center text-[#eaddc5] font-cinzel font-bold tracking-wide">
                             <span>{atk.nome}</span>
                             <span className="text-[#fca5a5] border-b border-[#991b1b] px-1 font-serif text-sm">{atk.dano_base}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] text-[#8e6c46] font-serif italic mt-1">
                             <span className="uppercase not-italic font-sans tracking-wider">{atk.tipo}</span>
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
