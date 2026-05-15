import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Upload, Plus, Minus, Eye, Sword, Backpack
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

interface Magia extends ListItem {
  custo: string;
}

interface Equipamento extends ListItem {
  dano: string;
  efeito: string;
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
  magias: Magia[];
  equipamentos: Equipamento[];
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
  magias: [],
  equipamentos: [],
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
    const saved = localStorage.getItem('world_fichas_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old saves seamlessly
        const migrated = parsed.map((c: any) => ({
          ...defaultCharacter,
          ...c
        }));
        setCharacters(migrated);
      } catch (e) {
        console.error('Error loading characters', e);
      }
    }
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem('world_fichas_v2', JSON.stringify(characters));
    }
  }, [characters]);

  const updateEditingChar = (updated: Character) => {
    setEditingChar(updated);
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleCreate = () => {
    const newChar = { ...defaultCharacter, id: generateId(), nome: 'Desconhecido' };
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
    if (confirm('Queimar este registro?')) {
      const newChars = characters.filter(c => c.id !== id);
      setCharacters(newChars);
      if (newChars.length === 0) {
        localStorage.removeItem('world_fichas_v2');
      } else {
        localStorage.setItem('world_fichas_v2', JSON.stringify(newChars));
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

  const renderPericias = () => {
    if (!editingChar) return null;
    const list = editingChar.pericias;
    const listName = 'pericias';

    const handleAddItem = () => {
      const newItem = { id: generateId(), nome: '', descricao: '', nivel: 0 };
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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-cinzel text-xl font-bold text-[#1a1512] tracking-widest uppercase">Perícias & Treinamento</h3>
          <button onClick={handleAddItem} className="text-[#8b0000] hover:text-[#5c0a0a] transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {list.map((item, idx) => (
             <div key={item.id} className="group flex items-end w-full relative h-8 py-1">
                <button 
                  onClick={() => handleRemoveItem(idx)} 
                  className="mr-2 text-[#5c0a0a] opacity-0 group-hover:opacity-100 font-apple text-sm mb-1"
                >x</button>
                <input 
                  type="text" 
                  value={item.nome}
                  onChange={e => handleUpdateItem(idx, { nome: e.target.value })}
                  className="bg-transparent focus:outline-none font-apple text-xl text-[#1a1512] mix-blend-multiply w-[40%] placeholder:text-[#1a1512]/40 shrink-0"
                  placeholder="Nome da perícia..."
                />
                <div className="flex-1 border-b-2 border-dotted border-[#5e3e20]/60 mx-2 mb-2 min-w-[20px]"></div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <input 
                    type="number" 
                    value={item.nivel}
                    onChange={e => handleUpdateItem(idx, { nivel: parseInt(e.target.value) || 0 })}
                    className="w-8 bg-transparent font-apple text-2xl text-center text-[#8b0000] focus:outline-none mix-blend-multiply appearance-none"
                  />
                  <div className="flex flex-col mr-2">
                     <button onClick={() => upgradePericia(idx, item.nivel)} disabled={editingChar.xp_disponivel < getUpgradeCost(item.nivel)} className="text-[#8b0000] disabled:opacity-30 p-0 m-0 leading-none hover:scale-125" style={{ filter: "url(#rough-edge)" }}>+</button>
                     <button onClick={() => refundPericia(idx, item.nivel)} disabled={item.nivel === 0} className="text-[#8b0000] disabled:opacity-30 p-0 m-0 leading-none hover:scale-125" style={{ filter: "url(#rough-edge)" }}>_</button>
                  </div>
                </div>
                
                <span className="font-apple text-[10px] text-[#5c0a0a] opacity-0 group-hover:opacity-70 whitespace-nowrap absolute right-0 -bottom-3 rotate-[-2deg]">
                  (Próx. Custo: {getUpgradeCost(item.nivel)} essências)
                </span>
             </div>
          ))}
          {list.length === 0 && <p className="font-apple text-sm text-[#5e3e20]/60 italic mt-2">Nenhum treinamento registrado...</p>}
        </div>
      </div>
    );
  };

  const renderSimpleList = (title: string, listName: 'vantagens' | 'desvantagens' | 'habilidades' | 'inventario' | 'magias' | 'equipamentos') => {
    if (!editingChar) return null;
    const list = editingChar[listName] as any[];

    const handleAddItem = () => {
      const newItem: any = { id: generateId(), nome: '', descricao: '' };
      if (listName === 'inventario') newItem.quantidade = 1;
      if (listName === 'magias') newItem.custo = '';
      if (listName === 'equipamentos') { newItem.dano = ''; newItem.efeito = ''; }
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

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between border-b pb-1 border-[#5e3e20]/30 mb-2">
          <div className="flex items-center gap-2">
            {listName === 'magias' && <Eye className="w-5 h-5 text-[#8b0000]" />}
            {listName === 'equipamentos' && <Sword className="w-5 h-5 text-[#1a1512]" />}
            {listName === 'inventario' && <Backpack className="w-5 h-5 text-[#1a1512]" />}
            <h3 className="font-cinzel text-lg font-bold text-[#1a1512] tracking-widest uppercase">{title}</h3>
          </div>
          <button onClick={handleAddItem} className="text-[#8b0000] hover:text-[#5c0a0a] transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {list.map((item, idx) => (
             <div key={item.id} className="group relative flex flex-col w-full gap-1">
                <button 
                  onClick={() => handleRemoveItem(idx)} 
                  className="absolute -left-6 top-1 text-[#5c0a0a] opacity-0 group-hover:opacity-100 font-apple text-sm"
                >X</button>
                
                <div className="flex items-baseline gap-2">
                  {listName === 'inventario' && (
                     <div className="flex items-center gap-1 shrink-0 w-12 border-b border-[#1a1512]/30">
                        <span className="font-apple text-[10px] uppercase text-[#1a1512] opacity-60">Qtd</span>
                        <input 
                          type="number" 
                          value={item.quantidade}
                          onChange={e => handleUpdateItem(idx, { quantidade: parseInt(e.target.value) || 0 })}
                          className="w-full bg-transparent font-nanum text-xl text-center text-[#8b0000] focus:outline-none mix-blend-multiply"
                        />
                     </div>
                  )}
                  <input 
                    type="text" 
                    value={item.nome}
                    onChange={e => handleUpdateItem(idx, { nome: e.target.value })}
                    className={`bg-transparent focus:outline-none font-apple text-2xl text-[#1a1512] mix-blend-multiply placeholder:text-[#1a1512]/40 border-b border-dashed border-[#5e3e20]/40 ${listName === 'equipamentos' || listName === 'magias' ? 'w-1/2' : 'w-full'}`}
                    placeholder="Nome..."
                  />
                  {listName === 'magias' && (
                     <input 
                       type="text" 
                       value={item.custo}
                       onChange={e => handleUpdateItem(idx, { custo: e.target.value })}
                       className="w-1/2 bg-transparent focus:outline-none font-apple text-xl text-[#8b0000] mix-blend-multiply placeholder:text-[#8b0000]/40 border-b border-dashed border-[#5e3e20]/40 text-right"
                       placeholder="Custo (Mana/Vida)..."
                     />
                  )}
                  {listName === 'equipamentos' && (
                     <input 
                       type="text" 
                       value={item.dano}
                       onChange={e => handleUpdateItem(idx, { dano: e.target.value })}
                       className="w-1/4 bg-transparent focus:outline-none font-apple text-xl text-[#8b0000] mix-blend-multiply placeholder:text-[#8b0000]/40 border-b border-dashed border-[#5e3e20]/40 text-center"
                       placeholder="Dano..."
                     />
                  )}
                </div>
                
                <div className="flex w-full items-baseline gap-2">
                  {(listName === 'vantagens' || listName === 'desvantagens' || listName === 'habilidades' || listName === 'inventario') && (
                    <input 
                      type="text" 
                      value={item.descricao}
                      onChange={e => handleUpdateItem(idx, { descricao: e.target.value })}
                      className="w-full bg-transparent focus:outline-none font-nanum text-lg text-[#5e3e20] mix-blend-multiply placeholder:text-[#5e3e20]/40"
                      placeholder="Descrição detalhada..."
                    />
                  )}
                  {(listName === 'magias' || listName === 'equipamentos') && (
                     <input 
                       type="text" 
                       value={listName === 'equipamentos' ? item.efeito : item.descricao}
                       onChange={e => handleUpdateItem(idx, listName === 'equipamentos' ? { efeito: e.target.value } : { descricao: e.target.value })}
                       className="w-full bg-transparent focus:outline-none font-nanum text-lg text-[#5e3e20] mix-blend-multiply placeholder:text-[#5e3e20]/40"
                       placeholder="Efeito detalhado..."
                     />
                  )}
                </div>
             </div>
          ))}
          {list.length === 0 && <p className="font-apple text-sm text-[#5e3e20]/60 italic mt-1">Pardo e Vazio...</p>}
        </div>
      </div>
    );
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characters, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "grimorio_registros.json");
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
          alert('Pergaminho ilegível ou corrompido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div 
      className="min-h-screen text-[#1a1512] font-serif selection:bg-[#8b0000]/30 selection:text-[#f4ebd8] flex flex-col p-2 lg:p-4"
      style={{
        backgroundColor: '#1a110a',
        backgroundImage: "linear-gradient(rgba(10,5,0,0.5), rgba(10,5,0,0.8)), url('https://www.transparenttextures.com/patterns/wood-pattern.png')",
        backgroundBlendMode: 'multiply',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,1)'
      }}
    >
      <svg width="0" height="0" className="absolute">
        <filter id="rough-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className="w-full flex items-center justify-between p-2 mb-4 relative z-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg bg-[#2a1c14] border border-[#3e2723] hover:bg-[#3e2723] text-[#d7ccc8] hover:text-[#f4ebd8] transition-colors group shadow-lg">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h1 className="font-cinzel text-2xl lg:text-3xl font-bold text-[#d7ccc8] tracking-widest drop-shadow-md">
            TOMO DOS DESTINOS
          </h1>
        </div>
        <div className="flex gap-2 font-cinzel font-bold text-[10px] lg:text-xs uppercase tracking-widest">
           <label className="cursor-pointer px-3 py-1 lg:px-4 lg:py-2 bg-[#2a1c14] hover:bg-[#3e2723] text-[#d7ccc8] border border-[#5c3a21] rounded shadow-lg transition-all flex items-center gap-2">
              <Upload className="w-3 h-3 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Restaurar</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
           </label>
           <button onClick={handleExport} className="px-3 py-1 lg:px-4 lg:py-2 bg-[#2a1c14] hover:bg-[#3e2723] text-[#d7ccc8] border border-[#5c3a21] rounded shadow-lg transition-all flex items-center gap-2">
             <Download className="w-3 h-3 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Preservar</span>
           </button>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col lg:flex-row relative z-10 gap-2 lg:gap-4">
        
        <aside className="w-full lg:w-[260px] shrink-0 flex flex-col gap-2 relative z-30 mb-4 lg:mb-0">
           <div className="flex items-center justify-between mb-4 pl-2 pr-2">
             <h2 className="font-cinzel font-bold text-[#d7ccc8] text-lg uppercase tracking-wide">Almas Guardadas</h2>
             <button onClick={handleCreate} className="w-8 h-8 flex items-center justify-center bg-[#8b0000] border-2 border-[#4a0000] rounded-full text-[#f4ebd8] hover:bg-[#a00000] hover:scale-110 shadow-lg transition-all">
               <Plus className="w-5 h-5" />
             </button>
           </div>
           
           <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 px-2 lg:px-0">
             {characters.map((char, index) => {
               const isActive = selectedCharId === char.id;
               return (
                 <div 
                   key={char.id} 
                   onClick={() => loadCharacter(char.id)}
                   className={`relative cursor-pointer transition-all duration-300 flex items-center justify-between p-3 pl-6 shadow-md group border border-[#1a110a] shrink-0 w-[200px] lg:w-full
                     ${isActive ? 'z-20 lg:translate-x-4 scale-100 lg:scale-105' : 'hover:translate-x-2 opacity-90 z-10'}
                   `}
                   style={{
                     backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.6), rgba(42,28,20,0.9)), url('https://www.transparenttextures.com/patterns/leather.png')",
                     backgroundColor: '#3e2723',
                     clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)',
                     minHeight: '60px'
                   }}
                 >
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#a0a0a0] shadow-sm"></div>
                    {isActive && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#8b0000] rounded-full blur-[1px]"></div>}
                    
                    <div className="flex flex-col truncate pr-4">
                      <span className={`font-apple text-lg truncate ${isActive ? 'text-[#ffccbc] font-bold' : 'text-[#d7ccc8]'}`}>
                        {char.nome || 'Desconhecido'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={e => { e.stopPropagation(); handleDelete(char.id) }} 
                      className="absolute right-0 top-0 text-[#ff5e57] opacity-0 group-hover:opacity-100 hover:scale-125 transition-all p-2 font-apple text-xs"
                    >X</button>
                 </div>
               );
             })}
             {characters.length === 0 && <p className="font-nanum text-[#d7ccc8] text-sm italic pl-2 opacity-60">Vazio...</p>}
           </div>
        </aside>

        <section 
          className="flex-1 w-full min-h-[85vh] relative z-20 flex flex-col p-6 lg:p-10"
          style={{
            backgroundColor: '#e8dcc4',
            backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')",
            boxShadow: "5px 5px 20px rgba(0,0,0,0.8), inset 0 0 40px rgba(94,62,32,0.6)",
            border: "1px solid #5c3a21"
          }}
        >
           {editingChar ? (
             <div className="animate-in fade-in duration-700 w-full mx-auto flex flex-col relative h-full">
               
               {/* 3-Column Full Screen Grid */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 w-full max-w-none">
                 
                 {/* COLUMN 1: Identidade e Corpo */}
                 <div className="flex flex-col gap-10">
                   
                   {/* Top: Identity & XP */}
                   <div className="flex flex-col gap-6 relative">
                      
                      {/* Selo de Sangue (XP Widget) */}
                      <div className="absolute -top-4 right-0 lg:-right-4 flex flex-col items-center z-10 filter drop-shadow-md group">
                         <div className="w-24 h-24 rounded-full relative flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                           style={{
                             background: 'radial-gradient(circle at 30% 30%, #8b0000 0%, #5c0a0a 50%, #2a0000 100%)',
                             filter: 'url(#rough-edge)',
                             border: '1px solid #3a0000'
                           }}
                         >
                            <span className="font-cinzel text-[8px] text-[#ffccbc] uppercase tracking-widest opacity-90 mt-1">Alma</span>
                            <span className="font-serif text-3xl text-[#ffccbc] font-bold leading-none my-1 drop-shadow-md">{editingChar.xp_disponivel}</span>
                            <div className="w-10 h-px bg-[#ffccbc]/40 mb-1"></div>
                            <span className="font-serif text-[10px] text-[#ffccbc]/80 leading-none">Paga: {editingChar.xp_total - editingChar.xp_disponivel}</span>
                         </div>
                         <div className="absolute -bottom-4 right-0 flex items-center bg-[#f4ebd8] p-1 rounded-sm border border-[#5c3a21] shadow opacity-0 group-hover:opacity-100 transition-opacity">
                            <input 
                              type="number" 
                              value={xpToAdd || ''} 
                              onChange={e => setXpToAdd(parseInt(e.target.value) || 0)}
                              className="w-10 bg-transparent text-sm font-nanum text-center text-[#5c0a0a] focus:outline-none"
                              placeholder="+0"
                            />
                            <button onClick={handleAddXp} className="text-[#8b0000] hover:text-[#5c0a0a]"><Plus className="w-4 h-4" /></button>
                         </div>
                      </div>

                      <div className="w-full relative pt-2 pr-28">
                         <label className="font-cinzel text-xs font-bold text-[#1a1512] tracking-widest uppercase opacity-70 absolute top-0 left-0">Eu, que me nomeio</label>
                         <input 
                           type="text" 
                           value={editingChar.nome} 
                           onChange={e => updateEditingChar({...editingChar, nome: e.target.value})}
                           className="w-full bg-transparent border-b-2 border-[#1a1512]/60 pt-4 pb-1 text-4xl font-apple text-[#1a1512] focus:outline-none mix-blend-multiply placeholder:text-[#5e3e20]/30"
                           placeholder="Sua Assinatura"
                         />
                      </div>
                      <div className="w-full relative pt-2">
                         <label className="font-cinzel text-xs font-bold text-[#1a1512] tracking-widest uppercase opacity-70 absolute top-0 left-0">De linhagem</label>
                         <input 
                           type="text" 
                           value={editingChar.raca} 
                           onChange={e => updateEditingChar({...editingChar, raca: e.target.value})}
                           className="w-full bg-transparent border-b border-[#1a1512]/40 pt-4 pb-1 text-3xl font-apple text-[#1a1512] focus:outline-none mix-blend-multiply placeholder:text-[#5e3e20]/30"
                           placeholder="De onde vieste"
                         />
                      </div>
                   </div>

                   {/* Roda do Destino (Attributes) */}
                   <div className="mt-4 flex flex-col items-center relative">
                      <h3 className="font-cinzel text-xl font-bold text-[#1a1512] tracking-widest mb-8 border-b-2 border-dotted border-[#1a1512] pb-1">RODA DO DESTINO</h3>
                      
                      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                         {/* SVG Hexagram Background */}
                         <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full stroke-[#1a1512] fill-none mix-blend-multiply opacity-20 pointer-events-none">
                           <circle cx="100" cy="100" r="90" strokeWidth="0.5" />
                           <polygon points="100,15 173.6,142.5 26.4,142.5" strokeWidth="0.5" />
                           <polygon points="100,185 26.4,57.5 173.6,57.5" strokeWidth="0.5" />
                           <circle cx="100" cy="100" r="25" strokeWidth="0.3" strokeDasharray="2,2"/>
                         </svg>
                         
                         <div className="absolute inset-0">
                           {(Object.keys(editingChar.atributos) as Array<keyof Character['atributos']>).map((attrKey, idx) => {
                             const attr = editingChar.atributos[attrKey];
                             const cost = getUpgradeCost(attr.level);
                             
                             // Positioning on points
                             const angle = (idx * 60 - 90) * (Math.PI / 180);
                             const radius = 42; 
                             const x = 50 + radius * Math.cos(angle);
                             const y = 50 + radius * Math.sin(angle);

                             return (
                               <div key={attrKey} className="absolute flex flex-col items-center justify-center group w-16 h-16 transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%`}}>
                                  <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-[#1a1512] mb-0.5 bg-[#e8dcc4]/80 px-1 rounded z-10">{attrKey}</span>
                                  <div className="relative flex items-center justify-center">
                                      {/* Background blotch */}
                                      <div className="absolute inset-0 bg-[#8b0000]/10 rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity filter blur-sm"></div>
                                      <input 
                                        type="number" 
                                        value={attr.level}
                                        onChange={e => {
                                          const val = parseInt(e.target.value) || 0;
                                          updateEditingChar({...editingChar, atributos: {...editingChar.atributos, [attrKey]: {level: val}}});
                                        }}
                                        className="w-10 text-center bg-transparent font-apple text-3xl text-[#8b0000] focus:outline-none mix-blend-multiply z-10 appearance-none drop-shadow-sm"
                                      />
                                  </div>
                                  <div className="flex gap-2z-10 bg-[#e8dcc4]/90 px-1 rounded mt-[-4px]">
                                    <button onClick={() => refundAttribute(attrKey)} disabled={attr.level===0} className="text-[#1a1512] hover:text-[#5c0a0a] disabled:opacity-30 p-0 m-0 leading-none text-xl font-bold font-apple hover:scale-125 w-4 cursor-pointer">-</button>
                                    <button onClick={() => upgradeAttribute(attrKey)} disabled={editingChar.xp_disponivel < cost} className="text-[#1a1512] hover:text-[#5c0a0a] disabled:opacity-30 p-0 m-0 leading-none text-xl font-bold font-apple hover:scale-125 w-4 cursor-pointer">+</button>
                                  </div>
                                  <span className="absolute -bottom-4 right-[-20px] font-apple text-[10px] text-[#5e3e20] rotate-[-5deg] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#e8dcc4] px-1 shadow-sm">
                                    Custo: {cost}
                                  </span>
                               </div>
                             );
                           })}
                         </div>
                      </div>
                   </div>

                   {/* Status Derivados (Escudos desenhados) */}
                   <div className="flex justify-between items-center px-4 mt-8">
                      {/* Vida */}
                      <div className="relative flex flex-col items-center group w-24">
                        <svg viewBox="0 0 100 100" className="w-16 h-16 fill-none stroke-[#8b0000] stroke-2 mix-blend-multiply">
                          <path d="M50 20 C 50 20, 20 -10, 10 30 C 0 70, 50 90, 50 90 C 50 90, 100 70, 90 30 C 80 -10, 50 20, 50 20 Z" strokeDasharray="3 2" />
                        </svg>
                        <input type="text" defaultValue="0/0" className="absolute top-5 text-center w-full bg-transparent border-none font-apple text-2xl focus:outline-none mix-blend-multiply text-[#1a1512]" />
                        <span className="font-cinzel text-xs font-bold mt-1">VIDA</span>
                      </div>
                      {/* Vigor */}
                      <div className="relative flex flex-col items-center group w-24">
                        <svg viewBox="0 0 100 100" className="w-16 h-16 fill-none stroke-[#5e3e20] stroke-2 mix-blend-multiply drop-shadow-sm">
                           <path d="M50 10 L 80 30 L 80 70 L 50 90 L 20 70 L 20 30 Z" />
                        </svg>
                        <input type="text" defaultValue="0/0" className="absolute top-5 text-center w-full bg-transparent border-none font-apple text-2xl focus:outline-none mix-blend-multiply text-[#1a1512]" />
                        <span className="font-cinzel text-xs font-bold mt-1">VIGOR</span>
                      </div>
                      {/* Defesa */}
                      <div className="relative flex flex-col items-center group w-24">
                        <svg viewBox="0 0 100 100" className="w-16 h-16 fill-none stroke-[#1a1512] stroke-2 mix-blend-multiply">
                           <path d="M20 20 Q 50 10 80 20 L 80 50 Q 80 80 50 90 Q 20 80 20 50 Z" />
                        </svg>
                        <input type="number" defaultValue={0} className="absolute top-4 text-center w-full bg-transparent border-none font-apple text-3xl focus:outline-none mix-blend-multiply text-[#1a1512] appearance-none pt-1" />
                        <span className="font-cinzel text-xs font-bold mt-1">DEFESA</span>
                      </div>
                   </div>

                 </div>

                 {/* COLUMN 2: Mente e Treinamento */}
                 <div className="flex flex-col gap-10">
                   {renderPericias()}
                   {renderSimpleList('Vantagens', 'vantagens')}
                   {renderSimpleList('Desvantagens', 'desvantagens')}
                   {renderSimpleList('Habilidades Notáveis', 'habilidades')}
                 </div>

                 {/* COLUMN 3: Grimório e Arsenal */}
                 <div className="flex flex-col gap-10">
                   {renderSimpleList('Grimório (Magias & Fórmulas)', 'magias')}
                   {renderSimpleList('Armas & Armaduras', 'equipamentos')}
                   {renderSimpleList('Bagagem Comum', 'inventario')}

                   <div className="mt-8 flex flex-col flex-1">
                     <h3 className="font-cinzel text-xl font-bold text-[#1a1512] tracking-widest mb-4 uppercase">
                       Confissões & Anotações
                     </h3>
                     <textarea
                       value={editingChar.anotacoes}
                       onChange={e => updateEditingChar({...editingChar, anotacoes: e.target.value})}
                       className="w-full flex-1 min-h-[300px] bg-transparent resize-none focus:outline-none font-apple text-2xl text-[#1a1512] leading-[30px] mix-blend-multiply p-0"
                       style={{
                         backgroundImage: 'repeating-linear-gradient(transparent, transparent 29px, rgba(94, 62, 32, 0.4) 29px, rgba(94, 62, 32, 0.4) 30px)',
                         lineHeight: '30px',
                       }}
                       placeholder="O que os vermes ousarão lembrar sobre ti?..."
                     ></textarea>
                   </div>
                 </div>

               </div>
               
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-50 py-32 pointer-events-none mix-blend-multiply flex-1">
                <svg width="150" height="150" viewBox="0 0 100 100" className="stroke-[#5e3e20] fill-none mb-4 opacity-40">
                  <circle cx="50" cy="50" r="40" strokeWidth="2" strokeDasharray="5 5"></circle>
                  <polygon points="50,15 80,75 20,75" strokeWidth="1"></polygon>
                  <polygon points="50,85 20,25 80,25" strokeWidth="1"></polygon>
                  <circle cx="50" cy="50" r="10" strokeWidth="1" />
                </svg>
                <h2 className="text-2xl font-cinzel font-bold text-[#1a1512] tracking-widest text-center">TUDO O QUE NASCE<br/>DEVE MORRER</h2>
             </div>
           )}
        </section>
      </main>
    </div>
  );
};
