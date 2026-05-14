import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import CodexModule from './components/CodexModule';
import { Naturalista } from './pages/Naturalista';
import { LivroMagias } from './pages/LivroMagias';
import { LivroMonstros } from './pages/LivroMonstros';
import { Fichas } from './pages/Fichas';
import { CriarMundo } from './pages/CriarMundo';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-w-[100vw] min-h-screen bg-[#05040a]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/codex" element={<CodexModule />} />
          <Route path="/naturalista" element={<Naturalista />} />
          <Route path="/livro-magias" element={<LivroMagias />} />
          <Route path="/livro-monstros" element={<LivroMonstros />} />
          <Route path="/fichas" element={<Fichas />} />
          <Route path="/criarmundo" element={<CriarMundo />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
