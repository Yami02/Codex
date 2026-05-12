import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
  CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
  AdditiveDescriptions, NodeAttributesDict
} from '../magicConstants';

import { MagicCompilerEngine } from '../engine/compiler';

const MagicTranslator = ({ graph }: any) => {
      const [isAdvancedMode, setIsAdvancedMode] = useState(false);
      const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
      
      try {
        const result = MagicCompilerEngine.execute(graph);
        if (!result) return <div style={{opacity: 0.5, textAlign: 'center', padding: '40px', border: '1px dashed rgba(212,175,55,0.2)', borderRadius: '12px'}}>O círculo está vazio. Aguardando pulso rúnico para iniciar a tradução do Codex...</div>;
        
        const { attrs, instabilities, element, description, logs, needsDC, rangeStr, level, dc, durationStr } = result;
        const isInvisible = (attrs.lumen || 0) <= 0;

        const techStats = [
          { label: 'Potência', value: attrs.potency || 0, icon: '⚡' },
          { label: 'Complexidade', value: attrs.complexity || 0, icon: '⚙️' },
          { label: 'Massa', value: attrs.mass || 0, icon: '⚖️' },
          { label: 'Força', value: attrs.strength || 0, icon: '🗿' },
          { label: 'Entropia', value: attrs.entropy || 0, icon: '🌡️' },
          { label: 'Frequência', value: attrs.wave || 0, icon: '🌊' },
          { label: 'Luminância', value: attrs.lumen || 0, icon: '✨' },
          { label: 'Acústica', value: attrs.sonic || 0, icon: '🔊' },
          { label: 'Volume', value: attrs.volume || 0, icon: '🧊' },
          { label: 'Morfologia', value: attrs.morphology || 0, icon: '🧬' }
        ];

        return (
          <div className="spell-description" style={{ color: '#e0d8c0', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px solid rgba(212,175,55,0.3)', paddingBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontFamily: 'Cinzel', color: '#d4af37', fontSize: '1.8rem', letterSpacing: '2px', textShadow: '0 0 15px rgba(212,175,55,0.3)' }}>Manifestação de {element}</h2>
                <div style={{ fontSize: '0.85rem', color: '#8a7d9b', marginTop: '6px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px' }}>{level}º Círculo | Transmutação Arcanística</div>
              </div>
              <div className="runic-text" style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.6))', marginLeft: '20px' }}>{CoreRunes[element]}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div style={{ background: 'rgba(212,175,55,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)' }}>
                <div style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tempo de Conjuração</div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{attrs.mass > 10 ? '1 Minuto' : '1 Ação'}</div>
              </div>
              <div style={{ background: 'rgba(212,175,55,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)' }}>
                <div style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Alcance</div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{rangeStr}</div>
              </div>
              <div style={{ background: 'rgba(212,175,55,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.1)' }}>
                <div style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Duração</div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{durationStr}</div>
              </div>
              {needsDC && (
                <div style={{ background: 'rgba(212,175,55,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 0 15px rgba(212,175,55,0.05)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Dificuldade Arcaica</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>CD {dc}</div>
                </div>
              )}
            </div>

            {/* Additional Info Toggle */}
            <div style={{ marginBottom: '25px' }}>
              <button 
                onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#d4af37',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {isAdditionalInfoOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                )}
                {isAdditionalInfoOpen ? 'Ocultar Informações Adicionais' : 'Ver Informações Adicionais (Atributos & Efeito)'}
              </button>
            </div>

            {isAdditionalInfoOpen && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #d4af37, transparent)' }}></div>
                    Matriz de Atributos Tabela
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(270deg, #d4af37, transparent)' }}></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {techStats.map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.05)' }}>
                        <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{s.icon}</div>
                        <div style={{ fontSize: '0.65rem', color: '#8a7d9b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        <div style={{ fontWeight: 'bold', color: s.value !== 0 ? '#d4af37' : '#555', fontSize: '0.9rem' }}>{s.value > 0 ? `+${s.value}` : s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #d4af37, transparent)' }}></div>
                    Efeito Sintetizado
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(270deg, #d4af37, transparent)' }}></div>
                  </div>
                  <div style={{ fontSize: '1.1rem', color: attrs.healing ? '#1dd1a1' : '#ff5e57', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.15)', boxShadow: '0 5px 20px rgba(0,0,0,0.3)' }}>
                    <div style={{ background: attrs.healing ? 'rgba(29, 209, 161, 0.1)' : 'rgba(255, 94, 87, 0.1)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {attrs.healing ? <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/> : <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-5h5c1.1 0 2-.9 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" transform="rotate(45 12 12)"/>}
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '2px', textTransform: 'uppercase' }}>{attrs.healing ? 'Harmonização Vital' : 'Vibração Destrutiva'}</div>
                      {attrs.healing ? `Restaura ${attrs.healing} pontos de essência arcana.` : `Canalização ofensiva de ${attrs.damageType || 'Energia Pura'}.`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '20px', borderRadius: '15px', borderLeft: '5px solid #d4af37', fontSize: '0.95rem', lineHeight: '1.7', color: '#e0d8c0', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', left: '20px', background: '#d4af37', color: '#05040a', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'Cinzel' }}>DESCRIÇÃO DA MAGIA (GERADA PELO COMPILADOR)</div>
              
              <div style={{ margin: 0, color: '#e0d8c0', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {description.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: '0 0 10px 0', minHeight: line.trim() ? 'auto' : '1.6em' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #d4af37">$1</strong>').replace(/\*(.*?)\*/g, '<em style="color: #c8b99e">$1</em>') }} />
                ))}
              </div>
              
              {instabilities.length > 0 ? (
                <div style={{ color: '#ff5e57', marginTop: '15px', fontWeight: 'bold', padding: '10px', background: 'rgba(255, 94, 87, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 94, 87, 0.3)' }}>
                  ⚠️ Risco de Colapso Arcano: {instabilities[0]}
                </div>
              ) : (
                <div style={{ color: '#1dd1a1', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Matriz Rúnica Compilada com Sucesso - Risco de Refluxo Zerado.
                </div>
              )}
            </div>

            {/* Advanced Mode Toggle */}
            <div style={{ marginTop: '30px', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '20px' }}>
              <button 
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                style={{
                  background: isAdvancedMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  color: '#d4af37',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                {isAdvancedMode ? 'Ocultar Ferramentas de Compilação' : 'Modo Visualização Avançada (Debug)'}
              </button>

              {isAdvancedMode && (
                <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s' }}>
                  
                  <h4 style={{ color: '#8a7d9b', fontFamily: 'Cinzel', fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Logs de Compilação (Array)</h4>
                  <div style={{ background: '#05040a', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#1dd1a1', overflowX: 'auto', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                    <pre style={{ margin: 0 }}>{JSON.stringify(logs, null, 2)}</pre>
                  </div>
                  
                  <h4 style={{ color: '#8a7d9b', fontFamily: 'Cinzel', fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Atributos Finais Gerados</h4>
                  <div style={{ background: '#05040a', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#d4af37', overflowX: 'auto', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                    <pre style={{ margin: 0 }}>{JSON.stringify(attrs, null, 2)}</pre>
                  </div>

                  <h4 style={{ color: '#8a7d9b', fontFamily: 'Cinzel', fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase' }}>JSON do Pipeline Completo</h4>
                  <div style={{ background: '#05040a', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#ffb8b8', overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                    <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      } catch (err) {
        return <div style={{ color: 'red', padding: '20px', background: '#200' }}><pre>{err.message}\n{err.stack}</pre></div>;
      }
    };
export default MagicTranslator;