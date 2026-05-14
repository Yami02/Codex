import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Sword, Shield, Brain, Target, Heart, MessageCircle, Plus,
  Minus, Trash2, Save, Download, Upload, User, BookOpen, Star, AlertTriangle, Box,
  FileText
} from 'lucide-react';

interface Atributo {
  level: number;
}

interface ListItem {
  id: string;
  nome: string;
  descricao: string;
}

interface Pericia extends ListItem {
  nivel: number;
}

interface InventarioItem extends ListItem {
  quantidade: number;
}

interface Character {
  id: string;
  nome: string;
  raca: string;
  xp_disponivel: number;
  xp_total: number;
  atributos: {
    fisico: Atributo;
    resistencia: Atributo;
    precisao: Atributo;
    mente: Atributo;
    vontade: Atributo;
    eloquencia: Atributo;
  };
  vantagens: ListItem[];
  desvantagens: ListItem[];
  habilidades: ListItem[];
  pericias: Pericia[];
  inventario: InventarioItem[];
  anotacoes: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultCharacter: Character = {
  id: '',
  nome: '',
  raca: '',
  xp_disponivel: 0,
  xp_total: 0,
  atributos: {
    fisico: { level: 0 },
    resistencia: { level: 0 },
    precisao: { level: 0 },
    mente: { level: 0 },
    vontade: { level: 0 },
    eloquencia: { level: 0 },
  },
  vantagens: [],
  desvantagens: [],
  habilidades: [],
  pericias: [],
  inventario: [],
  anotacoes: '',
};

const xpMultiplier = 21;

const getUpgradeCost = (currentLevel: number) => {
  return (currentLevel + 1) * xpMultiplier;
};

export const Fichas = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [xpToAdd, setXpToAdd] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('world_fichas_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCharacters(parsed);
      } catch (e) {
        console.error('Error loading characters', e);
      }
    }
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem('world_fichas_v1', JSON.stringify(characters));
    }
  }, [characters]);

  // Sync editing char with characters array on manual save, or auto save? Let's manual save when they make big changes, but auto save attributes since they cost XP.
  const updateEditingChar = (updated: Character) => {
    setEditingChar(updated);
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleCreate = () => {
    const newChar = { ...defaultCharacter, id: generateId(), nome: 'Novo Personagem' };
    setCharacters([...characters, newChar]);
    setSelectedCharId(newChar.id);
    setEditingChar(newChar);
  };

  const loadCharacter = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (char) {
      setSelectedCharId(char.id);
      setEditingChar(char);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Deletar este personagem?')) {
      const idx = characters.findIndex(c => c.id === id);
      const newChars = characters.filter(c => c.id !== id);
      setCharacters(newChars);
      if (newChars.length === 0) {
        localStorage.removeItem('world_fichas_v1');
      } else {
        localStorage.setItem('world_fichas_v1', JSON.stringify(newChars));
      }
      if (selectedCharId === id) {
        setEditingChar(null);
        setSelectedCharId(null);
      }
    }
  };

  const handleAddXp = () => {
    if (editingChar && xpToAdd > 0) {
      updateEditingChar({
        ...editingChar,
        xp_disponivel: editingChar.xp_disponivel + xpToAdd,
        xp_total: editingChar.xp_total + xpToAdd
      });
      setXpToAdd(0);
    }
  };

  const upgradeAttribute = (attrKey: keyof Character['atributos']) => {
    if (!editingChar) return;
    const currentLevel = editingChar.atributos[attrKey].level;
    const cost = getUpgradeCost(currentLevel);
    if (editingChar.xp_disponivel >= cost) {
      const newAtributos = {
        ...editingChar.atributos,
        [attrKey]: { level: currentLevel + 1 }
      };
      updateEditingChar({
        ...editingChar,
        xp_disponivel: editingChar.xp_disponivel - cost,
        atributos: newAtributos
      });
    }
  };

  const refundAttribute = (attrKey: keyof Character['atributos']) => {
    if (!editingChar) return;
    const currentLevel = editingChar.atributos[attrKey].level;
    if (currentLevel > 0) {
      const costToRefund = getUpgradeCost(currentLevel - 1);
      const newAtributos = {
        ...editingChar.atributos,
        [attrKey]: { level: currentLevel - 1 }
      };
      updateEditingChar({
        ...editingChar,
        xp_disponivel: editingChar.xp_disponivel + costToRefund,
        atributos: newAtributos
      });
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characters, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "fichas.json");
    dlAnchorElem.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json)) {
            setCharacters(json);
          }
        } catch (e) {
          alert('Arquivo JSON inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderList = (
    title: string,
    icon: React.ReactNode,
    colorClass: string,
    listName: keyof Character,
    isPericia: boolean = false,
    isInventario: boolean = false
  ) => {
    if (!editingChar) return null;
    const list = editingChar[listName] as any[];

    const handleAddItem = () => {
      const newItem: any = { id: generateId(), nome: '', descricao: '' };
      if (isPericia) newItem.nivel = 0;
      if (isInventario) newItem.quantidade = 1;
      updateEditingChar({ ...editingChar, [listName]: [...list, newItem] });
    };

    const handleUpdateItem = (idx: number, updates: any) => {
      const newList = [...list];
      newList[idx] = { ...newList[idx], ...updates };
      updateEditingChar({ ...editingChar, [listName]: newList });
    };

    const handleRemoveItem = (idx: number) => {
      const newList = [...list];
      newList.splice(idx, 1);
      updateEditingChar({ ...editingChar, [listName]: newList });
    };

    const upgradePericia = (idx: number, nivelAtual: number) => {
      const cost = getUpgradeCost(nivelAtual);
      if (editingChar.xp_disponivel >= cost) {
         const newList = [...list];
         newList[idx] = { ...newList[idx], nivel: nivelAtual + 1 };
         updateEditingChar({
           ...editingChar,
           xp_disponivel: editingChar.xp_disponivel - cost,
           [listName]: newList
         });
      }
    };

    const refundPericia = (idx: number, nivelAtual: number) => {
      if (nivelAtual > 0) {
         const costToRefund = getUpgradeCost(nivelAtual - 1);
         const newList = [...list];
         newList[idx] = { ...newList[idx], nivel: nivelAtual - 1 };
         updateEditingChar({
           ...editingChar,
           xp_disponivel: editingChar.xp_disponivel + costToRefund,
           [listName]: newList
         });
      }
    };

    return (
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-cinzel text-lg font-bold flex items-center gap-2 ${colorClass}`}>
            {icon} {title}
          </h3>
          <button onClick={handleAddItem} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {list.map((item, idx) => (
            <div key={item.id} className="flex gap-4 p-4 border border-zinc-800/50 rounded-lg bg-zinc-950/30">
              <div className="flex-1 space-y-2">
                <input 
                  type="text" 
                  value={item.nome}
                  onChange={e => handleUpdateItem(idx, { nome: e.target.value })}
                  placeholder="Nome"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-200 focus:border-amber-500/50 outline-none"
                />
                <input 
                  type="text" 
                  value={item.descricao}
                  onChange={e => handleUpdateItem(idx, { descricao: e.target.value })}
                  placeholder="Descrição..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-400 focus:border-amber-500/50 outline-none"
                />
              </div>
              
              {isPericia && (
                <div className="flex flex-col items-center justify-center border-l border-zinc-800/50 pl-4">
                   <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Nível</div>
                   <div className="text-xl font-bold font-serif text-blue-400">{item.nivel}</div>
                   <div className="flex gap-1 mt-2">
                      <button 
                        onClick={() => upgradePericia(idx, item.nivel)}
                        disabled={editingChar.xp_disponivel < getUpgradeCost(item.nivel)}
                        className="p-1 min-w-[50px] bg-blue-900/40 text-blue-400 text-[10px] rounded hover:bg-blue-800/60 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                        title={`Evoluir (Custo: ${getUpgradeCost(item.nivel)} XP)`}
                      >
                         +{getUpgradeCost(item.nivel)} XP
                      </button>
                      <button 
                        onClick={() => refundPericia(idx, item.nivel)}
                        disabled={item.nivel === 0}
                        className="p-1 min-w-[30px] bg-zinc-800/50 text-zinc-400 text-[10px] rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Reverter Nível (Reembolsar XP)"
                      >
                         <Minus className="w-3 h-3 mx-auto" />
                      </button>
                   </div>
                </div>
              )}

              {isInventario && (
                <div className="flex flex-col items-center justify-center border-l border-zinc-800/50 pl-4 w-[80px]">
                   <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Qtd</div>
                   <input 
                    type="number" 
                    value={item.quantidade}
                    onChange={e => handleUpdateItem(idx, { quantidade: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-zinc-900 border border-zinc-800 rounded p-1.5 text-sm text-center text-zinc-200"
                   />
                </div>
              )}

              <button onClick={() => handleRemoveItem(idx)} className="self-start mt-2 p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-950/30 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {list.length === 0 && <p className="text-zinc-600 text-xs italic">Nenhum item adicionado.</p>}
        </div>
      </div>
    );
  };

  const getAttrIcon = (key: keyof Character['atributos']) => {
    switch (key) {
      case 'fisico': return <Sword className="w-4 h-4" />;
      case 'resistencia': return <Shield className="w-4 h-4" />;
      case 'precisao': return <Target className="w-4 h-4" />;
      case 'mente': return <Brain className="w-4 h-4" />;
      case 'vontade': return <Heart className="w-4 h-4" />;
      case 'eloquencia': return <MessageCircle className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05040a] text-zinc-200 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#05040a]/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all outline-none focus-visible:ring-2 ring-amber-500 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              <h1 className="font-cinzel text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                Fichas de Personagem
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <label className="cursor-pointer px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold hover:border-zinc-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" /> Importar Fichas
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
             </label>
             <button onClick={handleExport} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold hover:border-zinc-700 transition-colors flex items-center gap-2">
               <Download className="w-4 h-4" /> Exportar
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar: Character List */}
        <aside className="lg:col-span-3 space-y-4">
           <div className="bg-[#0a0910] border border-white/5 rounded-2xl p-4 shadow-xl">
              <h2 className="font-cinzel font-bold text-amber-500 mb-4 flex items-center justify-between">
                Sua Party / Personagens
                <button onClick={handleCreate} className="p-1 hover:bg-amber-500/20 text-amber-500 rounded transition-colors" title="Criar Ficha">
                  <Plus className="w-5 h-5" />
                </button>
              </h2>
              <div className="space-y-2">
                {characters.map(char => (
                  <div 
                    key={char.id} 
                    onClick={() => loadCharacter(char.id)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all flex justify-between items-center group
                      ${selectedCharId === char.id ? 'bg-amber-500/10 border-amber-500 text-amber-200' : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:border-white/10'}`}
                  >
                     <div className="flex flex-col truncate pr-2">
                       <span className="font-bold truncate">{char.nome || 'Sem Nome'}</span>
                       <span className="text-[10px] uppercase tracking-wide opacity-60">Nível XP: {char.xp_total}</span>
                     </div>
                     <button 
                       onClick={e => { e.stopPropagation(); handleDelete(char.id) }} 
                       className="p-1.5 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/20 rounded transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                ))}
                {characters.length === 0 && (
                  <p className="text-zinc-600 text-xs italic text-center py-4">Nenhum personagem. Crie um novo.</p>
                )}
              </div>
           </div>
        </aside>

        {/* Main Content: Character Sheet */}
        <section className="lg:col-span-9 bg-[#0a0910] border border-white/5 rounded-2xl p-6 shadow-xl min-h-[70vh]">
           {editingChar ? (
             <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
               
               {/* 1. Header Information */}
               <div className="flex flex-wrap md:flex-nowrap gap-6 items-start border-b border-zinc-800/80 pb-8">
                 <div className="flex-1 w-full space-y-4">
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Nome do Personagem</label>
                     <input 
                       type="text" 
                       value={editingChar.nome} 
                       onChange={e => updateEditingChar({...editingChar, nome: e.target.value})}
                       className="w-full bg-transparent border-b-2 border-zinc-800 focus:border-amber-500 p-2 text-3xl font-cinzel text-amber-100 transition-colors outline-none"
                       placeholder="Ex: Alaric, O Invencível"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Raça / Classe / Povo</label>
                     <input 
                       type="text" 
                       value={editingChar.raca} 
                       onChange={e => updateEditingChar({...editingChar, raca: e.target.value})}
                       className="w-full bg-transparent border-b border-zinc-800 focus:border-blue-500 p-2 text-lg text-blue-200 transition-colors outline-none"
                       placeholder="Ex: Alto Elfo"
                     />
                   </div>
                 </div>

                 {/* XP Widget */}
                 <div className="bg-zinc-900 border border-amber-900/30 rounded-xl p-5 md:min-w-[280px] shadow-lg shadow-amber-900/10">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500/60 mb-4 flex items-center gap-2">
                     <Star className="w-4 h-4" /> Evolução (XP)
                   </h3>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="text-center">
                       <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Disponível</span>
                       <span className="text-3xl font-serif text-amber-400 font-bold">{editingChar.xp_disponivel}</span>
                     </div>
                     <div className="text-center border-l border-zinc-800">
                       <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Total Acumulado</span>
                       <span className="text-3xl font-serif text-zinc-300 font-bold">{editingChar.xp_total}</span>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <input 
                       type="number" 
                       value={xpToAdd || ''} 
                       onChange={e => setXpToAdd(parseInt(e.target.value) || 0)}
                       className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-center outline-none focus:border-amber-500"
                       placeholder="Ganho XP"
                     />
                     <button 
                       onClick={handleAddXp}
                       className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-3 rounded flex items-center justify-center transition-colors"
                     >
                       <Plus className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               </div>

               {/* 2. Attributes System */}
               <div>
                  <h3 className="font-cinzel text-xl font-bold text-amber-100 flex items-center gap-2 mb-6">
                    <User className="w-6 h-6 text-amber-500" /> Atributos Principais
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                     {(Object.keys(editingChar.atributos) as Array<keyof Character['atributos']>).map(attrKey => {
                       const attr = editingChar.atributos[attrKey];
                       const cost = getUpgradeCost(attr.level);
                       const canUpgrade = editingChar.xp_disponivel >= cost;
                       return (
                         <div key={attrKey} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center group hover:border-amber-500/50 transition-colors">
                            <span className="text-amber-500/80 mb-2">{getAttrIcon(attrKey)}</span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">{attrKey}</span>
                            <span className="text-4xl font-serif text-white font-bold mb-3">{attr.level}</span>
                            
                            <div className="flex gap-1 w-full mt-auto">
                              <button 
                                onClick={() => upgradeAttribute(attrKey)}
                                disabled={!canUpgrade}
                                className="flex-1 py-1.5 bg-blue-900/30 text-blue-400 text-xs font-bold rounded-l hover:bg-blue-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title={`Custo: ${cost} XP`}
                              >
                                +{cost} XP
                              </button>
                              <button 
                                onClick={() => refundAttribute(attrKey)}
                                disabled={attr.level === 0}
                                className="px-2 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-r border-l border-zinc-900 hover:bg-red-900/50 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Diminuir nível (Reembolsa XP)"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            </div>
                         </div>
                       );
                     })}
                  </div>
                  <p className="text-xs text-zinc-500 italic mt-3 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> O custo para evoluir um atributo e perícias (XP) é calculado pela fórmula: <strong className="text-zinc-400">(Nível Atual + 1) × {xpMultiplier}</strong>.
                  </p>
               </div>

               {/* 3. Qualities & Flaws */}
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {renderList('Vantagens', <Star className="w-5 h-5" />, 'text-emerald-400', 'vantagens', false, false)}
                 {renderList('Desvantagens', <AlertTriangle className="w-5 h-5" />, 'text-red-400', 'desvantagens', false, false)}
               </div>

               {/* 4. Skills & Abilities */}
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {renderList('Habilidades Especiais', <Sword className="w-5 h-5" />, 'text-purple-400', 'habilidades', false, false)}
                 {renderList('Perícias', <Target className="w-5 h-5" />, 'text-blue-400', 'pericias', true, false)}
               </div>

               {/* 5. Inventory & Notes */}
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {renderList('Inventário', <Box className="w-5 h-5" />, 'text-orange-400', 'inventario', false, true)}
                 
                 <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 mb-6 flex flex-col">
                   <h3 className="font-cinzel text-lg font-bold flex items-center gap-2 text-zinc-300 mb-4">
                     <FileText className="w-5 h-5" /> Anotações & História
                   </h3>
                   <textarea
                     value={editingChar.anotacoes}
                     onChange={e => updateEditingChar({...editingChar, anotacoes: e.target.value})}
                     className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 focus:border-amber-500/50 outline-none resize-none min-h-[200px]"
                     placeholder="Escreva sobre a jornada do personagem, objetivos, relacionamentos, traumas..."
                   ></textarea>
                 </div>
               </div>

             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 pointer-events-none">
                <User className="w-24 h-24 mb-4 text-zinc-600" />
                <h2 className="text-xl font-cinzel font-bold text-zinc-500">Selecione ou crie um personagem</h2>
             </div>
           )}
        </section>
      </main>
    </div>
  );
};

