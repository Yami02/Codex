import React, { useState, useEffect } from 'react';
import { FormulaTranslator } from '../engine/formula';
import { MagicGraph } from '../types/magic';
import { SpellGraphBuilder, WizardAnswers } from '../engine/spellBuilder';

interface MagicDSLTerminalProps {
  graph: MagicGraph;
  onChange: (graph: MagicGraph) => void;
}

export const MagicDSLTerminal = ({ graph, onChange }: MagicDSLTerminalProps) => {
  const [mode, setMode] = useState<'DSL' | 'WIZARD'>('DSL');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<WizardAnswers>({
    element: 'FOGO',
    expansao: 'TOQUE',
    duracao: 'INSTANTANEA',
    filtro: 'TODOS'
  });

  useEffect(() => {
    try {
      if (mode === 'DSL') {
          const generated = FormulaTranslator.graphToFormula(graph);
          setText(generated);
          setError(null);
      }
    } catch (err: any) {
      console.error(err);
    }
  }, [graph, mode]);

  const handleApplyDSL = () => {
    try {
      const newGraph = FormulaTranslator.formulaToGraph(text);
      setError(null);
      onChange(newGraph);
    } catch (err: any) {
      setError(err.message || 'Syntax Error no Códice');
    }
  };

  const updateAnswer = (field: keyof WizardAnswers, value: string) => {
      setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleWizardSubmit = () => {
      const newGraph = SpellGraphBuilder.buildFromWizard(answers);
      onChange(newGraph);
  };

  const renderWizardStep = () => {
      const btnStyle = (selected: boolean) => ({
          padding: '12px 20px',
          background: selected ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${selected ? '#d4af37' : 'rgba(212,175,55,0.3)'}`,
          color: selected ? '#fff' : '#e0d8c0',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'Cinzel',
          transition: 'all 0.2s',
          flex: '1'
      });

      const optionsRowStyle = { display: 'flex', gap: '10px', marginTop: '15px' };

      switch (step) {
          case 1:
              return (
                  <div>
                      <h4 style={{ color: '#d4af37', fontFamily: 'Cinzel', fontSize: '1.2rem' }}>Passo 1: Essência da Magia</h4>
                      <p style={{ color: '#8a7d9b', fontSize: '0.9rem' }}>Qual elemento mágico formará o núcleo do seu feitiço?</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
                          {['FOGO', 'AGUA', 'AR', 'TERRA', 'LUZ', 'SOMBRA'].map(el => (
                              <button key={el} onClick={() => updateAnswer('element', el)} style={btnStyle(answers.element === el)}>{el}</button>
                          ))}
                      </div>
                  </div>
              );
          case 2:
              return (
                  <div>
                      <h4 style={{ color: '#d4af37', fontFamily: 'Cinzel', fontSize: '1.2rem' }}>Passo 2: Morfologia Espacial</h4>
                      <p style={{ color: '#8a7d9b', fontSize: '0.9rem' }}>Como sua magia se manifesta no espaço físico?</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                          <button onClick={() => updateAnswer('expansao', 'TOQUE')} style={btnStyle(answers.expansao === 'TOQUE')}>Toque / Canalização Direta (1 Ponto)</button>
                          <button onClick={() => updateAnswer('expansao', 'PROJETIL')} style={btnStyle(answers.expansao === 'PROJETIL')}>Lançar um Projétil (Linha / 2 Pontos)</button>
                          <button onClick={() => updateAnswer('expansao', 'AREA')} style={btnStyle(answers.expansao === 'AREA')}>Explosão em Área (Triângulo / 3 Pontos)</button>
                      </div>
                  </div>
              );
          case 3:
              return (
                  <div>
                      <h4 style={{ color: '#d4af37', fontFamily: 'Cinzel', fontSize: '1.2rem' }}>Passo 3: Duração e Persistência</h4>
                      <p style={{ color: '#8a7d9b', fontSize: '0.9rem' }}>Por quanto tempo a força arcana irá operar na realidade?</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                          <button onClick={() => updateAnswer('duracao', 'INSTANTANEA')} style={btnStyle(answers.duracao === 'INSTANTANEA')}>Impacto Instantâneo (Nenhum 'Manter')</button>
                          <button onClick={() => updateAnswer('duracao', 'CONCENTRACAO')} style={btnStyle(answers.duracao === 'CONCENTRACAO')}>Requer Concentração (Triângulo de 'Manter')</button>
                          <button onClick={() => updateAnswer('duracao', 'CAPACITOR')} style={btnStyle(answers.duracao === 'CAPACITOR')}>Aura Perpétua (Capacitor / Quadrado)</button>
                      </div>
                  </div>
              );
          case 4:
              return (
                  <div>
                      <h4 style={{ color: '#d4af37', fontFamily: 'Cinzel', fontSize: '1.2rem' }}>Passo 4: Filtro de Alvos</h4>
                      <p style={{ color: '#8a7d9b', fontSize: '0.9rem' }}>Quem sofre a interferência da magia?</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                          <button onClick={() => updateAnswer('filtro', 'TODOS')} style={btnStyle(answers.filtro === 'TODOS')}>Afeta Tudo na Área (Caos Bruto)</button>
                          <button onClick={() => updateAnswer('filtro', 'INIMIGOS')} style={btnStyle(answers.filtro === 'INIMIGOS')}>Foco Ofensivo / Causar Dano (Kernel Decompor)</button>
                          <button onClick={() => updateAnswer('filtro', 'ALIADOS')} style={btnStyle(answers.filtro === 'ALIADOS')}>Foco Defensivo / Curar Aliados (Kernel Compor)</button>
                      </div>
                  </div>
              );
          case 5:
              return (
                  <div>
                      <h4 style={{ color: '#d4af37', fontFamily: 'Cinzel', fontSize: '1.2rem' }}>Síntese Concluída</h4>
                      <p style={{ color: '#e0d8c0', fontSize: '0.9rem' }}>
                          Seu Códice Mágico está prestes a ser conjurado. A topologia será forjada com exatidão matemática baseada em suas opções:
                      </p>
                      <ul style={{ color: '#1dd1a1', fontSize: '0.9rem', lineHeight: '1.6', marginTop: '15px' }}>
                          <li><strong>Núcleo Elementar:</strong> {answers.element}</li>
                          <li><strong>Expansão:</strong> {answers.expansao}</li>
                          <li><strong>Duração:</strong> {answers.duracao}</li>
                          <li><strong>Filtro Arcânico:</strong> {answers.filtro}</li>
                      </ul>
                  </div>
              );
          default:
              return null;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Cinzel', color: '#d4af37', margin: 0 }}>
          Console do Códice 
        </h3>
        <div style={{ display: 'flex', gap: '5px' }}>
            <button 
                onClick={() => setMode('DSL')}
                style={{
                    background: mode === 'DSL' ? '#8b0000' : 'transparent',
                    color: mode === 'DSL' ? '#ffd700' : '#8b0000',
                    border: '1px solid #8b0000',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    boxShadow: mode === 'DSL' ? 'inset 0 0 5px rgba(0,0,0,0.5)' : 'none'
                }}
            >Modo Código (DSL)</button>
            <button 
                onClick={() => { setMode('WIZARD'); setStep(1); }}
                style={{
                    background: mode === 'WIZARD' ? '#8b0000' : 'transparent',
                    color: mode === 'WIZARD' ? '#ffd700' : '#8b0000',
                    border: '1px solid #8b0000',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    boxShadow: mode === 'WIZARD' ? 'inset 0 0 5px rgba(0,0,0,0.5)' : 'none'
                }}
            >Criação Guiada</button>
        </div>
      </div>
      
      {mode === 'DSL' ? (
        <>
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
                className="spell-input ink-drying"
                style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(139,90,43,0.3)',
                color: '#1a120b',
                padding: '15px',
                fontFamily: 'Caveat, cursive',
                fontSize: '1.6rem',
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
                onClick={handleApplyDSL}
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
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'rgba(255,255,255,0.02)', padding: '20px', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} style={{ width: '30px', height: '4px', background: s <= step ? '#d4af37' : 'rgba(212,175,55,0.2)', borderRadius: '2px', transition: '0.3s' }} />
                ))}
            </div>

            <div style={{ flex: 1 }}>
                {renderWizardStep()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed rgba(212,175,55,0.2)' }}>
                <button 
                    disabled={step === 1} 
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    style={{ background: 'transparent', color: step === 1 ? '#555' : '#d4af37', border: '1px solid', borderColor: step === 1 ? '#333' : '#d4af37', padding: '8px 16px', borderRadius: '4px', cursor: step === 1 ? 'not-allowed' : 'pointer' }}
                >Voltar</button>

                {step < 5 ? (
                    <button 
                        onClick={() => setStep(s => Math.min(5, s + 1))}
                        style={{ background: '#d4af37', color: '#05040a', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >Avançar</button>
                ) : (
                    <button 
                        onClick={handleWizardSubmit}
                        style={{ background: 'linear-gradient(45deg, #1dd1a1, #10ac84)', color: '#05040a', border: 'none', padding: '8px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cinzel', textTransform: 'uppercase' }}
                    >Transmutar em Círculo Mágico</button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
export default MagicDSLTerminal;

