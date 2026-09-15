import React, { useState } from 'react';
import { EdgeType, EdgeSymbols, EdgeDescriptions } from '../magicConstants';

// Guia de ajuda em linguagem simples — não é documentação técnica, é pra
// quem está montando uma magia pela primeira vez e não faz ideia do que
// cada peça faz. Sempre que uma mecânica nova for adicionada ou mudar de
// comportamento, atualize esta lista (e o espelho em docs/COMO_FUNCIONA.md).

const USANDO = [
  { t: 'Núcleo', d: 'Arraste um elemento (Fogo, Água...) da barra lateral pro círculo, ou clique nele. Só cabe um Núcleo por vez — arrastar outro substitui o atual.' },
  { t: 'Aditivos', d: 'Clique ou arraste um aditivo pra adicionar. Alguns (Ponto, Manter, Forma, Mover, Perceber, Fusão, Gatilho) têm um controle próprio quando você seleciona o nó — nível com +/−, ou um seletor de elemento/gatilho.' },
  { t: 'Selecionar e conectar', d: 'Clique num elemento pra selecioná-lo (fica com um brilho dourado). Clique em outro elemento em seguida pra criar uma conexão entre os dois.' },
  { t: 'Camada e Orientação', d: 'Com um aditivo selecionado, as setas ↑ ↓ mudam a distância dele até o centro (camada), e ↶ ↷ giram a posição dele ao redor do círculo.' },
  { t: 'Modo Exibição', d: 'Esconde os controles de edição e mostra só o círculo mágico, pra tirar print ou mostrar pra alguém.' },
  { t: 'Grimório', d: 'Salva a magia atual numa lista pra você reabrir depois. Baixar/Copiar JSON exportam a magia como arquivo ou texto.' },
];

const NUCLEOS = [
  { t: 'Fogo', d: 'Calor, queimadura, energia bruta que se solta rápido.' },
  { t: 'Água', d: 'Cura, fluidez, resistência ao frio e a venenos.' },
  { t: 'Terra', d: 'Peso, força física, solidez — o que não se move fácil.' },
  { t: 'Ar', d: 'Mente, som, velocidade — o que se move rápido e livre.' },
  { t: 'Luz', d: 'Percepção, vida, revelar o que está escondido.' },
  { t: 'Sombra', d: 'Carne, morte, medo — o lado oculto e físico ao mesmo tempo.' },
  { t: 'Compor', d: 'Criar, juntar, unir — trazer algo à existência.' },
  { t: 'Decompor', d: 'Destruir, separar, desfazer — o fim de algo.' },
];

const ADITIVOS = [
  { t: 'Ponto', d: 'Até onde a magia alcança: Toque (corpo-a-corpo), Alcance (à distância) ou Aura (ao seu redor).' },
  { t: 'Manter', d: 'Quanto tempo o efeito dura, do instantâneo até uma aura permanente.' },
  { t: 'Forma', d: 'Muda o formato: Cone ou Linha (numa Aura), ou Esfera Remota (num Alcance, vira uma explosão à distância).' },
  { t: 'Mover', d: 'Em vez de causar dano ou cura, desloca alguém (ou você mesmo) no espaço.' },
  { t: 'Perceber', d: 'Em vez de causar dano ou cura, revela uma informação — detectar, identificar, enxergar longe.' },
  { t: 'Teste', d: 'Faz o alvo tentar resistir (um teste), em vez de você ter que acertar um ataque.' },
  { t: 'Fusão', d: 'Combina o Núcleo com um segundo elemento (ou Compor/Decompor). A magia vira outra coisa — um "Colégio" com nome próprio.' },
  { t: 'Gatilho (Capacitor)', d: 'Guarda a magia num glifo em vez de gastar na hora. Ela só age quando o gatilho disparar — por tempo, por impacto, por comando, ou por proximidade. Quanto mais carga (mais turnos, ou mais gente ajudando a encher o mesmo capacitor), mais forte ela sai.' },
  { t: 'Controle / Aumento / Redução / Eco', d: 'Ajustes finos — reforçam ou enfraquecem a intensidade geral do efeito.' },
];

const OUTROS = [
  { t: 'Kernel', d: 'Um "modo" mais específico dentro de um Subcírculo. Ex: o Kernel de Entropia deixa a magia causar — ou impedir — que algo esquente, esfrie, apodreça ou se desgaste. Cada Kernel controla uma coisa específica que pode ou não acontecer.' },
  { t: 'Colégio', d: 'O resultado de uma Fusão: Fogo + Terra vira o Colégio da Transmutação (Metal); Luz + Compor vira o Colégio da Bênção. Cada Colégio tem seu próprio nome e vocabulário.' },
  { t: 'Selo Arcano', d: 'Um símbolo único gerado pra cada magia compilada, baseado nos atributos dela — nunca dois selos iguais para magias diferentes.' },
];

// Clique numa aresta (a linha entre dois nós) para trocar o tipo dela —
// cada um faz uma coisa diferente de verdade agora, não é só cor.
const CONECTIVOS = [EdgeType.AND, EdgeType.OR, EdgeType.XOR, EdgeType.SE_ENTAO, EdgeType.ATRIBUICAO, EdgeType.CORRENTE].map(t => ({
  t: `${EdgeSymbols[t]}  ${t}`,
  d: EdgeDescriptions[t],
}));

const TabButton = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    style={{
      background: active ? 'rgba(212,175,55,0.15)' : 'transparent',
      border: '1px solid rgba(212,175,55,0.4)',
      color: active ? '#d4af37' : '#8a7d9b',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontFamily: 'Cinzel, serif',
      fontSize: '0.85rem',
      fontWeight: active ? 'bold' : 'normal',
    }}
  >
    {children}
  </button>
);

const Entry = ({ t, d }: { t: string; d: string }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={{ color: '#d4af37', fontFamily: 'Cinzel, serif', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '2px' }}>{t}</div>
    <div style={{ color: '#e0d8c0', fontSize: '0.85rem', lineHeight: 1.5 }}>{d}</div>
  </div>
);

const HelpGuide = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<'USAR' | 'NUCLEOS' | 'ADITIVOS' | 'CONECTIVOS' | 'OUTROS'>('USAR');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#e1b12c', marginTop: 0 }}>📖 Guia Rápido</h2>
        <p style={{ color: '#7f8fa6', marginTop: '-8px' }}>Explicação simples de como usar o Codex e o que cada peça faz.</p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '12px' }}>
          <TabButton active={tab === 'USAR'} onClick={() => setTab('USAR')}>Como Usar</TabButton>
          <TabButton active={tab === 'NUCLEOS'} onClick={() => setTab('NUCLEOS')}>Núcleos</TabButton>
          <TabButton active={tab === 'ADITIVOS'} onClick={() => setTab('ADITIVOS')}>Aditivos</TabButton>
          <TabButton active={tab === 'CONECTIVOS'} onClick={() => setTab('CONECTIVOS')}>Conectivos</TabButton>
          <TabButton active={tab === 'OUTROS'} onClick={() => setTab('OUTROS')}>Kernel / Colégio</TabButton>
        </div>

        {tab === 'USAR' && USANDO.map(e => <Entry key={e.t} {...e} />)}
        {tab === 'NUCLEOS' && NUCLEOS.map(e => <Entry key={e.t} {...e} />)}
        {tab === 'ADITIVOS' && ADITIVOS.map(e => <Entry key={e.t} {...e} />)}
        {tab === 'CONECTIVOS' && <>
          <p style={{ color: '#8a7d9b', fontSize: '0.8rem', marginTop: 0 }}>Clique numa aresta (a linha entre dois nós) pra trocar o tipo dela, nessa ordem.</p>
          {CONECTIVOS.map(e => <Entry key={e.t} {...e} />)}
        </>}
        {tab === 'OUTROS' && OUTROS.map(e => <Entry key={e.t} {...e} />)}

        <button className="action-btn" onClick={onClose} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>Fechar</button>
      </div>
    </div>
  );
};

export default HelpGuide;
