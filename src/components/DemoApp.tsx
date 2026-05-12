
import DraggableItem from './DraggableItem';
import MagicCanvas from './MagicCanvas';
import MagicTranslator from './MagicTranslator';
import EdgeVisual from './EdgeVisual';
import MagicDSLTerminal from './MagicDSLTerminal';


    import { 
      NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
      CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
      AdditiveDescriptions, NodeAttributesDict
    } from '../magicConstants';

    import React, { useState, useEffect, useMemo, useRef } from 'react';



        // Pipeline externalizada em /src/engine/pipeline.ts

    




    



    

    

    const getNestedGraph = (graph, path) => {
      let current = graph;
      for (const id of path) {
        const node = current.nodes.find(n => n.id === id);
        if (node && node.magicGraph) current = node.magicGraph;
        else return null; 
      }
      return current;
    };

    const updateNestedGraph = (graph, path, newNestedGraph) => {
      if (path.length === 0) return newNestedGraph;
      const newGraph = { ...graph, nodes: [...graph.nodes] };
      const nextId = path[0];
      const nodeIndex = newGraph.nodes.findIndex(n => n.id === nextId);
      if (nodeIndex !== -1) {
        const node = newGraph.nodes[nodeIndex];
        newGraph.nodes[nodeIndex] = { ...node, magicGraph: updateNestedGraph(node.magicGraph, path.slice(1), newNestedGraph) };
      }
      return newGraph;
    };

    const App = () => {
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [mainGraph, setMainGraph] = useState(() => {
        try {
          const saved = localStorage.getItem('autosave_spell');
          return saved ? JSON.parse(saved) : { nodes: [], edges: [] };
        } catch (e) {
          return { nodes: [], edges: [] };
        }
      });
      const [codexTab, setCodexTab] = useState<'TRANSLATOR' | 'TERMINAL'>('TRANSLATOR');
      const [path, setPath] = useState([]); 
      const [isDragOver, setIsDragOver] = useState(false);
      const [selectedNodeId, setSelectedNodeId] = useState(null);
      const [viewMode, setViewMode] = useState(false);
      
      const [spellId, setSpellId] = useState(`spell_${Date.now()}`);
      const [spellName, setSpellName] = useState('Feitiço Sem Nome');
      const [spellComments, setSpellComments] = useState('');
      const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
      const [savedSpells, setSavedSpells] = useState([]);
      const fileInputRef = useRef(null);

      const activeGraph = getNestedGraph(mainGraph, path) || { nodes: [], edges: [] };

      useEffect(() => { setSelectedNodeId(null); }, [path, viewMode]);

      useEffect(() => {
        localStorage.setItem('autosave_spell', JSON.stringify(mainGraph));
      }, [mainGraph]);

      useEffect(() => {
        const stored = localStorage.getItem('grimoire_spells');
        if (stored) setSavedSpells(JSON.parse(stored));
      }, []);

      const saveSpellToGrimoire = () => {
        const newSpell = { id: spellId, name: spellName || 'Feitiço Sem Nome', comments: spellComments, graph: mainGraph, date: new Date().toLocaleDateString() };
        const updatedSpells = savedSpells.filter(s => s.id !== spellId);
        updatedSpells.push(newSpell);
        setSavedSpells(updatedSpells);
        localStorage.setItem('grimoire_spells', JSON.stringify(updatedSpells));
        alert('Magia gravada no Grimório!');
      };

      const loadSpellFromGrimoire = (spell) => {
        setMainGraph(spell.graph); setSpellName(spell.name); setSpellComments(spell.comments || ''); setSpellId(spell.id); setPath([]); setIsGrimoireOpen(false);
      };

      const deleteSpellFromGrimoire = (e, id) => {
        e.stopPropagation();
        const updated = savedSpells.filter(s => s.id !== id);
        setSavedSpells(updated);
        localStorage.setItem('grimoire_spells', JSON.stringify(updated));
      };

      const startNewSpell = () => {
        setMainGraph({ nodes: [], edges: [] }); setSpellName('Novo Feitiço'); setSpellComments(''); setSpellId(`spell_${Date.now()}`); setPath([]); setIsGrimoireOpen(false);
      };

      const exportSpellFile = () => {
        const spellData = JSON.stringify({ name: spellName, comments: spellComments, graph: mainGraph }, null, 2);
        const blob = new Blob([spellData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${spellName.replace(/\s+/g, '_')}.arcano`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      };

      const importSpellFile = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt: any) => {
          try {
            const data = JSON.parse(evt.target.result as string);
            if (data.graph) {
              setMainGraph(data.graph); setSpellName(data.name || 'Feitiço Importado'); setSpellComments(data.comments || ''); setSpellId(`spell_${Date.now()}`); setPath([]);
            }
          } catch(err) { alert("Arquivo arcano corrompido ou inválido."); }
        };
        reader.readAsText(file);
      };

      const handleDrop = (e) => {
        if (viewMode) return;
        e.preventDefault(); setIsDragOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const item = JSON.parse(data);
        let newGraph = { ...activeGraph, nodes: [...activeGraph.nodes], edges: [...activeGraph.edges] };
        const newId = `node_${Date.now()}`;
        
        if (item.type === NodeType.CORE) {
          const existingCoreIndex = newGraph.nodes.findIndex(n => n.type === NodeType.CORE);
          if (existingCoreIndex !== -1) newGraph.nodes[existingCoreIndex] = { ...newGraph.nodes[existingCoreIndex], element: item.name };
          else newGraph.nodes.push({ id: newId, type: NodeType.CORE, element: item.name, layer: 0 });
        } 
        else if (item.type === NodeType.ADDITIVE) newGraph.nodes.push({ id: newId, type: NodeType.ADDITIVE, additiveType: item.name, layer: 1, angleOffset: 0 });
        else if (item.type === NodeType.SUBCIRCLE) newGraph.nodes.push({ id: newId, type: NodeType.SUBCIRCLE, magicGraph: { nodes: [], edges: [] }, layer: 1, angleOffset: 0 });
        else if (item.type === NodeType.KERNEL) newGraph.nodes.push({ id: newId, type: NodeType.KERNEL, additiveType: item.name, magicGraph: { nodes: [], edges: [] }, layer: 1, angleOffset: 0 });
        
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const handleDragOver = (e) => { if(!viewMode) { e.preventDefault(); setIsDragOver(true); } };
      const handleDragLeave = (e) => { if(!viewMode) { e.preventDefault(); setIsDragOver(false); } };

      const handleDirectAdd = (type, name) => {
        if (viewMode) return;
        if (window.innerWidth <= 1024) setIsSidebarOpen(false);
        const newId = `node_${Date.now()}`;
        let newGraph = { ...activeGraph, nodes: [...activeGraph.nodes], edges: [...activeGraph.edges] };

        if (type === NodeType.CORE) {
          const existingCoreIndex = newGraph.nodes.findIndex(n => n.type === NodeType.CORE);
          if (existingCoreIndex !== -1) newGraph.nodes[existingCoreIndex] = { ...newGraph.nodes[existingCoreIndex], element: name };
          else newGraph.nodes.push({ id: newId, type: NodeType.CORE, element: name, layer: 0 });
        } 
        else if (type === NodeType.ADDITIVE) newGraph.nodes.push({ id: newId, type: NodeType.ADDITIVE, additiveType: name, layer: 1, angleOffset: 0 });
        else if (type === NodeType.SUBCIRCLE) newGraph.nodes.push({ id: newId, type: NodeType.SUBCIRCLE, magicGraph: { nodes: [], edges: [] }, layer: 1, angleOffset: 0 });
        else if (type === NodeType.KERNEL) newGraph.nodes.push({ id: newId, type: NodeType.KERNEL, additiveType: name, magicGraph: { nodes: [], edges: [] }, layer: 1, angleOffset: 0 });

        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const handleNodeClick = (node, navigate = false) => {
        if (viewMode) return;
        if (navigate && (node.type === NodeType.SUBCIRCLE || node.type === NodeType.KERNEL)) { setPath([...path, node.id]); return; }
        if (!selectedNodeId) { setSelectedNodeId(node.id); } 
        else if (selectedNodeId === node.id) { setSelectedNodeId(null); } 
        else {
          const edgeId = `edge_${Date.now()}`;
          const exists = activeGraph.edges.find(e => (e.sourceId === selectedNodeId && e.targetId === node.id) || (e.sourceId === node.id && e.targetId === selectedNodeId));
          if (!exists) {
            const newGraph = { ...activeGraph, edges: [...activeGraph.edges, { id: edgeId, sourceId: selectedNodeId, targetId: node.id, type: EdgeType.AND }] };
            setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
          }
          setSelectedNodeId(null);
        }
      };

      const handleBackgroundClick = () => { setSelectedNodeId(null); };

      const handleLayerChange = (node, delta) => {
        const newLayer = Math.max(1, node.layer + delta);
        const newGraph = { ...activeGraph, nodes: activeGraph.nodes.map(n => n.id === node.id ? { ...n, layer: newLayer } : n) };
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const handleAngleChange = (node, deltaAngle) => {
        const newGraph = { ...activeGraph, nodes: activeGraph.nodes.map(n => n.id === node.id ? { ...n, angleOffset: (n.angleOffset || 0) + deltaAngle } : n) };
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const handleNodeDelete = (node) => {
        const newGraph = { nodes: activeGraph.nodes.filter(n => n.id !== node.id), edges: activeGraph.edges.filter(e => e.sourceId !== node.id && e.targetId !== node.id) };
        if (selectedNodeId === node.id) setSelectedNodeId(null);
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const updateNodeCustomProperty = (nodeId, prop, value) => {
        const newGraph = { ...activeGraph, nodes: activeGraph.nodes.map(n => n.id === nodeId ? { ...n, [prop]: value } : n) };
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const handleKernelToggle = (node, mode, kernelType) => {
        const newGraph = { ...activeGraph, nodes: activeGraph.nodes.map(n => {
          if (n.id === node.id) {
            const newNode = { ...n, type: mode, additiveType: kernelType };
            if (mode === NodeType.SUBCIRCLE) {
              delete newNode.customMorphology;
            }
            return newNode;
          }
          return n;
        }) };
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const handleEdgeClick = (edge) => {
        const currentIndex = EdgeCycle.indexOf(edge.type);
        const nextType = EdgeCycle[(currentIndex + 1) % EdgeCycle.length];
        const newGraph = { ...activeGraph, edges: activeGraph.edges.map(e => e.id === edge.id ? { ...e, type: nextType } : e) };
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const handleEdgeDelete = (edge) => {
        const newGraph = { ...activeGraph, edges: activeGraph.edges.filter(e => e.id !== edge.id) };
        setMainGraph(updateNestedGraph(mainGraph, path, newGraph));
      };

      const navigateToDepth = (depthIndex) => { setPath(path.slice(0, depthIndex)); };

      const globalAuraColor = mainGraph.auraColor || '#00a8ff';
      const rawOrbitStyle = mainGraph.orbitStyle || 'solid';
      let globalOrbitDash = "none";
      if (rawOrbitStyle === 'dashed') globalOrbitDash = "15,15";
      if (rawOrbitStyle === 'dotted') globalOrbitDash = "4,8";
      const edgeColorMode = mainGraph.edgeColorMode || 'auto';
      const customEdgeColor = mainGraph.customEdgeColor || '#00a8ff';
      const isGlobalRotating = mainGraph.isGlobalRotating || false;

      const selectedNode = activeGraph.nodes.find(n => n.id === selectedNodeId);

      return (
        <div className="app-container" style={{ display: 'flex', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
          
          {selectedNode && !viewMode && (
            <div className="node-action-bar" key={selectedNode.id}>
              <div className="action-group">
                <div style={{ minWidth: '100px' }}>
                  <div className="action-label">Elemento</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="runic-text" style={{ fontSize: '1rem', display: 'inline-block' }}>
                      {selectedNode.type === NodeType.CORE ? CoreRunes[selectedNode.element] : (selectedNode.type === NodeType.KERNEL ? CoreRunes['COMPOR'] : AdditiveRunes[selectedNode.additiveType])}
                    </span>
                    {selectedNode.type === NodeType.CORE ? selectedNode.element : (selectedNode.type === NodeType.KERNEL ? 'KERNEL' : (selectedNode.additiveType || selectedNode.type))}
                  </div>
                </div>
              </div>

              <div className="action-group">
                <div>
                  <div className="action-label">Acões</div>
                  <div className="mini-btn danger" onClick={() => handleNodeDelete(selectedNode)} title="Remover Componente">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </div>
                </div>
              </div>

              {selectedNode.type !== NodeType.CORE && (
                <div className="action-group">
                  <div>
                    <div className="action-label">Camada (Raio)</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div className="mini-btn" onClick={() => handleLayerChange(selectedNode, 1)} title="Aumentar Camada">↑</div>
                      <div className="mini-btn" onClick={() => handleLayerChange(selectedNode, -1)} title="Diminuir Camada">↓</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '12px' }}>
                    <div className="action-label">Orientação</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div className="mini-btn" onClick={() => handleAngleChange(selectedNode, -15)} title="Rotacionar Anti-Horário">↶</div>
                      <div className="mini-btn" onClick={() => handleAngleChange(selectedNode, 15)} title="Rotacionar Horário">↷</div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedNode.type === NodeType.SUBCIRCLE || selectedNode.type === NodeType.KERNEL) && (
                <div className="action-group">
                  {selectedNode.type === NodeType.KERNEL && selectedNode.additiveType === 'MORFOLOGIA' && (
                    <div style={{ marginRight: '16px' }}>
                      <div className="action-label">Forma Requerida</div>
                      <input type="text" value={selectedNode.customMorphology || ''} onChange={(e) => updateNodeCustomProperty(selectedNode.id, 'customMorphology', e.target.value)} placeholder="Ex: Espada, Escudo..." style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #4a3e5c', color: '#f5eedc', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', width: '120px', fontFamily: 'Cinzel, serif' }} />
                    </div>
                  )}
                  <div>
                    <div className="action-label">Lógica</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="mini-btn success text-btn" onClick={() => handleNodeClick(selectedNode, true)}>
                        Explorar Subciclo ❯
                      </div>
                      <div className="mini-btn text-btn" 
                        style={{ borderColor: selectedNode.type === NodeType.KERNEL ? '#00d2ff' : '#2ecc71', color: selectedNode.type === NodeType.KERNEL ? '#00d2ff' : '#2ecc71' }} 
                        onClick={() => {
                          const mode = selectedNode.type === NodeType.KERNEL ? NodeType.SUBCIRCLE : NodeType.KERNEL;
                          let kernelType = '';
                          if (mode === NodeType.KERNEL) {
                            const coreNode = selectedNode.magicGraph.nodes.find(n => n.type === NodeType.CORE);
                            const coreElement = coreNode ? coreNode.element : 'FOGO';
                            
                            const kernelMapping = {
                              'FOGO': 'ENTROPIA',
                              'AGUA': 'VOLUME',
                              'TERRA': 'FORCA',
                              'AR': 'SOM',
                              'LUZ': 'LUMINOSIDADE',
                              'SOMBRA': 'MORFOLOGIA',
                              'COMPOR': 'ORDEM',
                              'DECOMPOR': 'CAOS'
                            };
                            
                            kernelType = kernelMapping[coreElement] || 'ENTROPIA';
                          }
                          handleKernelToggle(selectedNode, mode, kernelType);
                        }}>
                        {selectedNode.type === NodeType.KERNEL ? "Converter para Subciclo" : "Ativar Modo Kernel"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

                <div className="action-group" style={{ opacity: 0.6, fontSize: '0.65rem', fontStyle: 'italic', maxWidth: '160px', lineHeight: '1.2', borderLeft: '1px solid rgba(212, 175, 55, 0.15)', paddingLeft: '20px' }}>
                  <span style={{ color: '#d4af37', display: 'block', marginBottom: '2px' }}>CONSELHO DO ARQUIVISTA:</span>
                  Clique em outro elemento para tecer uma conexão mágica entre eles.
                </div>
            </div>
          )}

          <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
          
          <button className="mobile-sidebar-toggle" style={{ display: 'none' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '✕' : '📜'}
          </button>

          {isGrimoireOpen && (
            <div className="modal-overlay" onClick={() => setIsGrimoireOpen(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 style={{color: '#e1b12c', marginTop: 0}}>📖 O Grimório</h2>
                <p style={{color: '#7f8fa6'}}>Arquivos arcanos salvos neste dispositivo.</p>
                <button className="action-btn primary" style={{marginBottom: '1rem', width: '100%', justifyContent: 'center'}} onClick={startNewSpell}>
                  + Criar Novo Feitiço
                </button>
                {savedSpells.length === 0 ? (
                  <p style={{textAlign: 'center', color: '#555'}}>Nenhum feitiço registrado.</p>
                ) : (
                  savedSpells.map(spell => (
                    <div key={spell.id} className="grimoire-item" onClick={() => loadSpellFromGrimoire(spell)} style={{cursor: 'pointer'}}>
                      <div><p className="grimoire-title">{spell.name}</p><p className="grimoire-date">Catalogado em: {spell.date}</p></div>
                      <button className="action-btn" onClick={(e) => deleteSpellFromGrimoire(e, spell.id)} style={{background: '#e84118', borderColor: '#c23616'}}>X</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!viewMode && (
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
              <h2 style={{ color: '#d4af37', fontSize: '1.4rem', marginTop: 0, fontFamily: 'Cinzel, serif', textAlign: 'center', borderBottom: '1px solid #3a2f4c', paddingBottom: '10px' }}>CodexARCH v2</h2>
              <p style={{ fontSize: '0.85rem', color: '#8a7d9b', marginBottom: '2rem', textAlign: 'center', fontStyle: 'italic' }}>Toque para adicionar ou pressione e arraste.</p>
              
              <h3 style={{ fontSize: '1.1rem', color: '#ff793f', fontFamily: 'Cinzel, serif', borderLeft: '3px solid #ff793f', paddingLeft: '8px' }}>Núcleo (Elemental)</h3>
              <div className="sidebar-grid">
                {['FOGO', 'AGUA', 'TERRA', 'AR'].map(c => <DraggableItem key={c} type={NodeType.CORE} name={c} className="core-item" onAdd={handleDirectAdd} />)}
              </div>

              <h3 style={{ fontSize: '1.1rem', color: '#f1c40f', marginTop: '1.5rem', fontFamily: 'Cinzel, serif', borderLeft: '3px solid #f1c40f', paddingLeft: '8px' }}>Núcleo (Dualidade)</h3>
              <div className="sidebar-grid">
                {['LUZ', 'SOMBRA', 'COMPOR', 'DECOMPOR'].map(c => <DraggableItem key={c} type={NodeType.CORE} name={c} className="core-item" onAdd={handleDirectAdd} />)}
              </div>
              
              <h3 style={{ fontSize: '1.1rem', color: '#3498db', marginTop: '2rem', fontFamily: 'Cinzel, serif', borderLeft: '3px solid #3498db', paddingLeft: '8px' }}>Aditivos</h3>
              <div className="sidebar-grid">
                {['CONTROLE', 'AUMENTO', 'REDUCAO', 'PONTO', 'MANTER', 'GATILHO', 'ECO'].map(a => <DraggableItem key={a} type={NodeType.ADDITIVE} name={a} onAdd={handleDirectAdd} />)}
              </div>

              <h3 style={{ fontSize: '1.1rem', color: '#fd79a8', marginTop: '2rem', fontFamily: 'Cinzel, serif', borderLeft: '3px solid #fd79a8', paddingLeft: '8px' }}>Subcírculos</h3>
              <DraggableItem type={NodeType.SUBCIRCLE} name="SUBCIRCLE" label="( ) Gerar Subciclo" className="subcircle-item" onAdd={handleDirectAdd} />
            </div>
          )}

          <div className="main-content">
            <div className="top-bar">
              <div className="top-actions" style={{ opacity: viewMode ? 0 : 1, transition: 'opacity 0.3s', pointerEvents: viewMode ? 'none' : 'auto' }}>
                <button className="action-btn" onClick={() => setIsGrimoireOpen(true)}>📖 Grimório</button>
                <button className="action-btn primary" onClick={saveSpellToGrimoire}>💾 Salvar</button>
                <button className="action-btn" onClick={exportSpellFile}>↓ Baixar</button>
                <button className="action-btn" onClick={() => { navigator.clipboard.writeText(JSON.stringify(mainGraph, null, 2)); alert('JSON Arcânico copiado para a área de transferência!'); }}>📄 Copiar JSON</button>
                <button className="action-btn" onClick={() => fileInputRef.current.click()}>↑ Importar</button>
                <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".arcano,.json" onChange={importSpellFile} />
              </div>
              <button className="toggle-btn" onClick={() => setViewMode(!viewMode)}>
                {viewMode ? '✏️ Voltar à Edição' : '👁 Modo Exibição'}
              </button>
            </div>

            {!viewMode && path.length === 0 && (
              <div className="metadata-inputs">
                <input type="text" className="spell-input" value={spellName} onChange={e => setSpellName(e.target.value)} placeholder="Nome do Feitiço..." />
                <textarea className="spell-textarea" value={spellComments} onChange={e => setSpellComments(e.target.value)} placeholder="Anotações do conjurador, efeitos colaterais ou componentes..." />
                <div className="config-toggles">
                  <div className="config-item">
                    <div className="config-label">Cor da Aura</div>
                    <input type="color" value={globalAuraColor} onChange={e => setMainGraph({...mainGraph, auraColor: e.target.value})} style={{ background: 'none', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '6px', cursor: 'pointer', height: '40px', width: '100%', padding: '2px' }} />
                  </div>
                  
                  <div className="config-item">
                    <div className="config-label">Estilo da Órbita</div>
                    <select value={rawOrbitStyle} onChange={e => setMainGraph({...mainGraph, orbitStyle: e.target.value})} style={{ background: 'rgba(26, 21, 37, 0.8)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '6px', padding: '10px', outline: 'none', fontFamily: 'Cinzel, serif', fontSize: '0.85rem' }}>
                      <option value="solid">Contínua (Sólida)</option>
                      <option value="dashed">Tracejada (Rúnica)</option>
                      <option value="dotted">Pontilhada (Etérea)</option>
                    </select>
                  </div>
                  
                  <div className="config-item">
                    <div className="config-label">Cálculo de Conexão</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={edgeColorMode} onChange={e => setMainGraph({...mainGraph, edgeColorMode: e.target.value})} style={{ flex: 1, background: 'rgba(26, 21, 37, 0.8)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '6px', padding: '10px', outline: 'none', fontFamily: 'Cinzel, serif', fontSize: '0.85rem' }}>
                        <option value="auto">Cores por Tipo</option>
                        <option value="custom">Matiz Personalizada</option>
                      </select>
                      {edgeColorMode === 'custom' && (
                        <input type="color" value={customEdgeColor} onChange={e => setMainGraph({...mainGraph, customEdgeColor: e.target.value})} style={{ background: 'none', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '6px', cursor: 'pointer', height: '40px', width: '60px', padding: '2px' }} />
                      )}
                    </div>
                  </div>
                  
                  <div className="config-item" style={{ justifyContent: 'center' }}>
                    <div className="config-label">Mecânica Rúnica</div>
                    <label style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#c8b99e', fontSize: '0.85rem', fontFamily: 'Cinzel, serif', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)', transition: 'all 0.2s' }} className="hover-highlight">
                      <input type="checkbox" checked={isGlobalRotating} onChange={e => setMainGraph({...mainGraph, isGlobalRotating: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: '#d4af37' }} />
                      Cinética (Ativar Rotação)
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            <div className="breadcrumb" style={{ visibility: viewMode && path.length === 0 ? 'hidden' : 'visible', marginBottom: '1rem' }}>
              <span className="breadcrumb-item" onClick={() => !viewMode && navigateToDepth(0)}>Círculo Principal</span>
              {path.map((nodeId, index) => (
                <React.Fragment key={index}>
                  <span className="breadcrumb-separator">❯</span>
                  <span className="breadcrumb-item" onClick={() => !viewMode && navigateToDepth(index + 1)}>Camada {index + 1}</span>
                </React.Fragment>
              ))}
            </div>

            <div className={`canvas-container ${isDragOver ? 'drag-over' : ''} ${!viewMode ? 'editing' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <MagicCanvas graph={activeGraph} viewMode={viewMode} onNodeClick={handleNodeClick} onNodeDelete={handleNodeDelete} onLayerChange={handleLayerChange} onAngleChange={handleAngleChange} onEdgeClick={handleEdgeClick} onEdgeDelete={handleEdgeDelete} onKernelToggle={handleKernelToggle} onBackgroundClick={handleBackgroundClick} selectedNodeId={selectedNodeId} auraColor={globalAuraColor} orbitDash={globalOrbitDash} edgeColorMode={edgeColorMode} customEdgeColor={customEdgeColor} isGlobalRotating={isGlobalRotating} globalRotationSpeed={mainGraph.globalRotationSpeed || '120s'} />
            </div>

            <div className="codex-panel" style={{ display: viewMode ? 'none' : 'block', marginTop: '2rem', border: '1px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.1)', padding: '30px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '15px', marginBottom: '2rem' }}>
                <h3 
                  onClick={() => setCodexTab('TRANSLATOR')}
                  style={{ cursor: 'pointer', margin: 0, opacity: codexTab === 'TRANSLATOR' ? 1 : 0.5, color: '#d4af37', fontFamily: 'Cinzel, serif', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  Tradução da Magia (Caminho de Ida)
                </h3>
                <h3
                  onClick={() => setCodexTab('TERMINAL')}
                  style={{ cursor: 'pointer', margin: 0, opacity: codexTab === 'TERMINAL' ? 1 : 0.5, color: '#d4af37', fontFamily: 'Cinzel, serif', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                  Terminal Codex (Caminho de Volta)
                </h3>
              </div>
              <div style={{ margin: 0 }}>
                {codexTab === 'TRANSLATOR' ? (
                  <MagicTranslator graph={mainGraph} />
                ) : (
                  <MagicDSLTerminal 
                    graph={mainGraph} 
                    onChange={(newGraph) => {
                      setMainGraph(newGraph);
                      setCodexTab('TRANSLATOR');
                    }}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      );
    };

    export default App;
  