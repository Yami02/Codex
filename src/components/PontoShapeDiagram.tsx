import React from 'react';

// Desenho literal da geometria do Ponto (ver PONTO_LEVELS/PONTO_COUNT_TO_TIER
// em engine/constants.ts e §5 do docs/COMO_FUNCIONA.md): o alcance não é
// mais um número — é a figura que você desenha ligando nós de Ponto entre
// si. Este componente é só ilustrativo (Ajuda in-app e O Grande Tomo), não
// afeta o compilador.
const DOT = (cx: number, cy: number, key: string, color: string) => (
  <circle key={key} cx={cx} cy={cy} r={5} fill={color} stroke="#1a120b" strokeWidth={1} />
);

const Shape = ({ title, sub, children, color }: { title: string; sub: string; children: React.ReactNode; color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
    <svg width="72" height="72" viewBox="0 0 72 72">
      {children}
    </svg>
    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color }}>{title}</div>
    <div style={{ fontSize: '0.68rem', color: '#8a7d9b', textAlign: 'center', maxWidth: '90px' }}>{sub}</div>
  </div>
);

export default function PontoShapeDiagram({ color = '#d4af37', lineColor = '#d4af37' }: { color?: string; lineColor?: string }) {
  return (
    <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
      <Shape title="1 Ponto" sub="Toque (Corpo-a-Corpo)" color={color}>
        {DOT(36, 36, 'p', color)}
      </Shape>

      <Shape title="3 Pontos em Triângulo" sub="Projétil (Alcance)" color={color}>
        <polygon points="36,10 60,54 12,54" fill="none" stroke={lineColor} strokeWidth={2} />
        {DOT(36, 10, 'a', color)}
        {DOT(60, 54, 'b', color)}
        {DOT(12, 54, 'c', color)}
      </Shape>

      <Shape title="4 Pontos em Quadrado" sub="Aura" color={color}>
        <polygon points="14,14 58,14 58,58 14,58" fill="none" stroke={lineColor} strokeWidth={2} />
        {DOT(14, 14, 'a', color)}
        {DOT(58, 14, 'b', color)}
        {DOT(58, 58, 'c', color)}
        {DOT(14, 58, 'd', color)}
      </Shape>
    </div>
  );
}
