import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Save, 
  Download, 
  Upload, 
  BookOpen, 
  Zap, 
  Component, 
  Info
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { 
      title: "Núcleo (Elemental)", 
      icon: <Zap className="w-4 h-4 text-yellow-500" />,
      items: ["Fogo", "Água", "Ar", "Terra"] 
    },
    { 
      title: "Núcleo (Dualidade)", 
      icon: <Zap className="w-4 h-4 text-blue-400" />,
      items: ["Luz", "Sombra", "Compor", "Decompor"] 
    },
    { 
      title: "Kernels (Propriedades)", 
      icon: <Component className="w-4 h-4 text-emerald-500" />,
      items: ["Entropia", "Morfologia", "Estado", "Onda", "Força", "Volume"] 
    },
    { 
      title: "Aditivos", 
      icon: <BookOpen className="w-4 h-4 text-purple-500" />,
      items: ["Controle", "Aumento", "Redução", "Ponto", "Manter", "Gatilho", "Eco"] 
    }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl relative overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <span className="font-serif font-bold text-lg text-white tracking-tight">CodexARCH</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {sidebarItems.map((section, idx) => (
            <div key={idx} className="mb-8">
              <div className="flex items-center gap-2 mb-3 px-2">
                {section.icon}
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  <li 
                    key={i} 
                    className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-700 font-mono"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
            <Info className="w-3 h-3" />
            <span>Versão 2.4.0-AI</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <HeaderButton icon={<Save className="w-4 h-4" />} label="Salvar" />
            <HeaderButton icon={<Download className="w-4 h-4" />} label="Exportar" />
            <div className="h-4 w-[1px] bg-slate-700 mx-1" />
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const HeaderButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);
