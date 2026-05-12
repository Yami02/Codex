import React, { useState, useEffect } from 'react';
import { FormulaTranslator } from '../engine/formula';
import { MagicGraph } from '../types/magic';

interface MagicDSLTerminalProps {
  graph: MagicGraph;
  onChange: (graph: MagicGraph) => void;
}

export const MagicDSLTerminal = ({ graph, onChange }: MagicDSLTerminalProps) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const generated = FormulaTranslator.graphToFormula(graph);
      setText(generated);
      setError(null);
    } catch (err: any) {
      console.error(err);
    }
  }, [graph]);

  const handleApply = () => {
    try {
      const newGraph = FormulaTranslator.formulaToGraph(text);
      setError(null);
      onChange(newGraph);
    } catch (err: any) {
      setError(err.message || 'Syntax Error no Códice');
    }
  };

  return (
    <div style={{
      background: '#05040a',
      border: '1px solid #d4af37',
      borderRadius: '8px',
      padding: '20px',
      color: '#e0d8c0',
      fontFamily: 'monospace',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontFamily: 'Cinzel', color: '#d4af37', marginTop: 0, marginBottom: '15px' }}>
        Console do Códice 
        <span style={{ fontSize: '0.7rem', marginLeft: '10px', color: '#8a7d9b' }}>(Tradutor Texto ↔ Ciclo)</span>
      </h3>
      
      <p style={{ fontSize: '0.85rem', color: '#8a7d9b', marginBottom: '10px' }}>
        Edite a fórmula abaixo usando os comandos CORE, ADD, KERNEL e LINK. Confirme para gerar o ciclo visual.
      </p>

      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder={`Exemplo de Código Rúnico:

CORE FOGO f
ADD PONTO p
ADD AUMENTO a
LINK f AND p
LINK p ATRIBUICAO a`}
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(212,175,55,0.3)',
          color: '#1dd1a1',
          padding: '15px',
          borderRadius: '4px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.9rem',
          resize: 'none',
          outline: 'none',
          minHeight: '200px'
        }}
      />

      {error && (
        <div style={{ color: '#ff5e57', marginTop: '10px', fontSize: '0.85rem' }}>
          Erro Parsee: {error}
        </div>
      )}

      <button 
        onClick={handleApply}
        style={{
          marginTop: '15px',
          padding: '10px 20px',
          background: 'linear-gradient(45deg, #d4af37, #997e2d)',
          color: '#05040a',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'Cinzel',
          fontWeight: 'bold',
          cursor: 'pointer',
          alignSelf: 'flex-end',
          textTransform: 'uppercase'
        }}
      >
        Conjurar do Texto
      </button>
    </div>
  );
};
export default MagicDSLTerminal;
