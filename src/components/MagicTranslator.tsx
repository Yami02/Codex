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
    const [activeTab, setActiveTab] = useState<'ANALISE' | 'DND5E'>('DND5E');
      
    try {
        const result = MagicCompilerEngine.execute(graph);
        if (!result) return <div style={{opacity: 0.5, textAlign: 'center', padding: '40px', border: '1px dashed rgba(212,175,55,0.2)', borderRadius: '12px'}}>O círculo está vazio. Aguardando pulso rúnico para iniciar a tradução do Codex...</div>;
        
        const { attrs, instabilities, element, description, logs, needsDC, rangeStr, level, dc, durationStr, dndBlock } = result;
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
          <div className="spell-description ink-drying" style={{ fontFamily: 'Caveat, cursive', fontSize: '1.4rem', mixBlendMode: 'multiply' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px dashed rgba(139,90,43,0.3)', paddingBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: '#5c3a21', fontSize: '1.8rem', letterSpacing: '2px', fontWeight: 'bold' }}>Manifestação de {element}</h2>
                <div style={{ fontSize: '1.1rem', color: '#8b0000', marginTop: '6px', fontWeight: 'bold' }}>{level}º Círculo | Transmutação Arcanística</div>
              </div>
              <div className="runic-text" style={{ fontSize: '3rem', color: '#8b0000', opacity: 0.8, marginLeft: '20px' }}>{CoreRunes[element]}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '25px', fontFamily: 'Cinzel, serif' }}>
              <div style={{ background: 'rgba(92,58,33,0.05)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(92,58,33,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#5c3a21', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 'bold' }}>Tempo de Conjuração</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1a120b' }}>{attrs.mass > 10 ? '1 Minuto' : '1 Ação'}</div>
              </div>
              <div style={{ background: 'rgba(92,58,33,0.05)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(92,58,33,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#5c3a21', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 'bold' }}>Alcance</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1a120b' }}>{rangeStr}</div>
              </div>
              <div style={{ background: 'rgba(92,58,33,0.05)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(92,58,33,0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#5c3a21', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 'bold' }}>Duração</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1a120b' }}>{durationStr}</div>
              </div>
              {needsDC && (
                <div style={{ background: 'rgba(139,0,0,0.05)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(139,0,0,0.3)', boxShadow: '0 0 10px rgba(139,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#8b0000', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 'bold' }}>Dificuldade Arcaica</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#8b0000' }}>CD {dc}</div>
                </div>
              )}
            </div>

            {/* Additional Info Toggle */}
            <div style={{ marginBottom: '25px' }}>
              <button 
                onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
                style={{
                  background: 'transparent',
                  border: '1px dashed rgba(92, 58, 33, 0.4)',
                  color: '#5c3a21',
                  padding: '8px 16px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'Caveat, cursive',
                  fontSize: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontWeight: 'bold'
                }}
              >
                {isAdditionalInfoOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                )}
                {isAdditionalInfoOpen ? 'Ocultar Anotações Marginais' : 'Revelar Anotações Marginais (+ Cálculos)'}
              </button>
            </div>

            {isAdditionalInfoOpen && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ fontSize: '1.2rem', color: '#8b0000', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #8b0000, transparent)' }}></div>
                    [Matriz de Atributos]
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(270deg, #8b0000, transparent)' }}></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '5px', padding: '12px', border: '1px dashed rgba(92,58,33,0.3)', transform: 'rotate(-1deg)' }}>
                    {techStats.map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '4px' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '2px', opacity: 0.7 }}>{s.icon}</div>
                        <div style={{ fontSize: '0.8rem', color: '#5c3a21', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}>{s.label}</div>
                        <div style={{ fontWeight: 'bold', color: s.value !== 0 ? '#8b0000' : '#1a120b', fontSize: '1.3rem' }}>{s.value > 0 ? `+${s.value}` : s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '1.2rem', color: '#8b0000', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #8b0000, transparent)' }}></div>
                    [Síntese Prática]
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(270deg, #8b0000, transparent)' }}></div>
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#1a120b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(92,58,33,0.05)', padding: '18px', border: '1px solid rgba(92,58,33,0.2)', borderLeft: '4px solid #8b0000' }}>
                    <div>
                      <div style={{ fontSize: '1rem', color: '#5c3a21', marginBottom: '2px', fontFamily: 'Cinzel, serif' }}>{attrs.healing ? 'Harmonização Vital' : 'Vibração Destrutiva'}</div>
                      <div style={{ transform: 'rotate(-1deg)' }}>
                        {attrs.healing ? `Restaura ${attrs.healing} pontos de essência arcana.` : `Canalização ofensiva de ${attrs.damageType || 'Energia Pura'}.`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(139,90,43,0.3)', paddingBottom: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setActiveTab('ANALISE')}
                style={{
                  background: activeTab === 'ANALISE' ? 'rgba(92,58,33,0.1)' : 'transparent',
                  border: '1px solid rgba(92,58,33,0.3)',
                  color: '#2a1a10',
                  padding: '8px 16px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  transition: '0.2s',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem'
                }}
              >Notas Históricas</button>
              <button 
                onClick={() => setActiveTab('DND5E')}
                style={{
                  background: activeTab === 'DND5E' ? 'rgba(92,58,33,0.1)' : 'transparent',
                  border: '1px solid rgba(92,58,33,0.3)',
                  color: '#2a1a10',
                  padding: '8px 16px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  transition: '0.2s',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem'
                }}
              >Papiro Formal (D&D 5E)</button>
            </div>

            {activeTab === 'ANALISE' && (
              <div style={{ background: 'rgba(92, 58, 33, 0.05)', padding: '20px', borderLeft: '4px solid #5c3a21', fontSize: '1.4rem', lineHeight: '1.5', color: '#1a120b', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '20px', background: '#e3d7c1', border: '1px solid #5c3a21', color: '#5c3a21', fontSize: '0.8rem', padding: '2px 8px', fontFamily: 'Cinzel, serif' }}>ANOTAÇÕES DA GÊNESE</div>
                
                <div style={{ margin: 0, color: '#1a120b', whiteSpace: 'pre-line', lineHeight: '1.4', marginTop: '10px' }}>
                  {description.split('\n').map((line: string, i: number) => (
                    <p key={i} style={{ margin: '0 0 10px 0', minHeight: line.trim() ? 'auto' : '1.4em' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #8b0000; font-weight: bold">$1</strong>').replace(/\*(.*?)\*/g, '<em style="color: #5c3a21">$1</em>') }} />
                  ))}
                </div>
                
                {instabilities.length > 0 ? (
                  <div style={{ color: '#8b0000', marginTop: '15px', fontWeight: 'bold', padding: '10px', border: '2px dashed #8b0000', transform: 'rotate(-2deg)' }}>
                    * P.S. Risco Severo: {instabilities[0]}!
                  </div>
                ) : (
                  <div style={{ color: '#2a1a10', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✔ A runa selou corretamente. Estável.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'DND5E' && dndBlock && (
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '24px', borderTop: '4px double #5c3a21', borderBottom: '4px double #5c3a21', fontFamily: 'EB Garamond, serif', color: '#1a120b', marginTop: '10px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#8b0000', fontFamily: 'Cinzel, serif', fontSize: '1.8rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>{dndBlock.name}</h3>
                <div style={{ fontStyle: 'italic', fontSize: '1.1rem', color: '#5c3a21', marginBottom: '15px', borderBottom: '1px solid rgba(92, 58, 33, 0.3)', paddingBottom: '10px' }}>{dndBlock.levelSchool}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, max-content) 1fr', gap: '8px 15px', fontSize: '1.1rem', marginBottom: '20px' }}>
                  <div style={{ color: '#5c3a21', fontWeight: 'bold' }}>Tempo de Conjuração:</div>
                  <div>{dndBlock.castingTime}</div>
                  
                  <div style={{ color: '#5c3a21', fontWeight: 'bold' }}>Alcance:</div>
                  <div>{dndBlock.range}</div>
                  
                  <div style={{ color: '#5c3a21', fontWeight: 'bold' }}>Componentes:</div>
                  <div>{dndBlock.components}</div>
                  
                  <div style={{ color: '#5c3a21', fontWeight: 'bold' }}>Duração:</div>
                  <div>{dndBlock.duration}</div>
                </div>

                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '1.15rem' }}>
                    {dndBlock.fullText}
                </div>
                
                {instabilities.length > 0 && (
                  <div style={{ color: '#8b0000', marginTop: '20px', fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 'bold' }}>
                    *Anota à margem:* A magia parece instável. Falhas podem exigir rolagens na Tabela de Magia Selvagem.
                  </div>
                )}
              </div>
            )}

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
                  
                  {result.debugPathBlock && (
                    <>
                      <h4 style={{ color: '#8a7d9b', fontFamily: 'Cinzel', fontSize: '1rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Debug Técnico</h4>
                      <div style={{ background: '#05040a', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', fontFamily: 'monospace', color: '#ff9ff3', marginBottom: '20px' }}>
                        {result.debugPathBlock}
                      </div>
                    </>
                  )}

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