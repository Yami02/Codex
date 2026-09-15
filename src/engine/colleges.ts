// Os 32 Colégios — fundido a partir do "Grimório dos 32 Colégios" do
// usuário. Cada Núcleo elemental (FOGO/AGUA/TERRA/AR/LUZ/SOMBRA) pode se
// fundir com um segundo Núcleo (outro elemento, ou COMPOR/DECOMPOR como
// polaridade Criar/Destruir) através do aditivo FUSAO. Essa fusão revela
// um dos 32 Colégios: um nome e um vocabulário totalmente diferentes do
// Núcleo puro, mudando o que a magia É, não só o que ela faz.
//
// Importante: isto é o mecanismo de RESOLUÇÃO dos colégios (qual nome e
// qual assimetria numérica se aplica), não uma cópia das ~128 magias
// nomeadas do grimório original — nosso compilador gera magias a partir
// do grafo núcleo+aditivos, então "Colégio" aqui é uma categoria que o
// motor calcula, não uma lista fixa de feitiços prontos.

export type CollegeKind = 'base' | 'polar' | 'combo';

export interface CollegeInfo {
  number: number;
  name: string;
  kind: CollegeKind;
  vocabulary: string; // palavra-chave usada para substituir "energia primordial" no texto gerado
}

// Chave canônica: os dois lados ordenados alfabeticamente e unidos por "+".
// Um Núcleo sozinho (sem FUSAO) usa "NONE" como segundo lado.
const key = (a: string, b: string) => [a, b].sort().join('+');

const COLLEGE_TABLE: Record<string, CollegeInfo> = {
  // --- Colégios Base (Núcleo sozinho, sem FUSAO) ---
  [key('FOGO', 'NONE')]: { number: 1, name: 'Colégio do Arcano', kind: 'base', vocabulary: 'mana crua' },
  [key('AGUA', 'NONE')]: { number: 2, name: 'Colégio da Cura', kind: 'base', vocabulary: 'tecido vital' },
  [key('TERRA', 'NONE')]: { number: 3, name: 'Colégio dos Estudos das Forças', kind: 'base', vocabulary: 'peso e gravidade' },
  [key('AR', 'NONE')]: { number: 4, name: 'Palácio Mental', kind: 'base', vocabulary: 'foco mental' },
  [key('LUZ', 'NONE')]: { number: 7, name: 'Colégio da Ilusão', kind: 'base', vocabulary: 'percepção enganada' },
  [key('SOMBRA', 'NONE')]: { number: 8, name: 'Colégio do Corpo', kind: 'base', vocabulary: 'carne moldada' },
  [key('COMPOR', 'NONE')]: { number: 5, name: 'Colégio da Conjuração', kind: 'base', vocabulary: 'existência trazida à tona' },
  [key('DECOMPOR', 'NONE')]: { number: 6, name: 'Colégio da Eliminação', kind: 'base', vocabulary: 'fim puro' },

  // --- Os 6 Pares Criar <-> Destruir (Elemento + Polaridade) ---
  [key('FOGO', 'COMPOR')]: { number: 11, name: 'Colégio do Feixe (Fulgor)', kind: 'polar', vocabulary: 'poder perfurante e sustentado' },
  [key('FOGO', 'DECOMPOR')]: { number: 12, name: 'Colégio da Combustão (Fúria)', kind: 'polar', vocabulary: 'poder disperso num instante' },
  [key('AGUA', 'COMPOR')]: { number: 17, name: 'Colégio da Invocação (Nascente)', kind: 'polar', vocabulary: 'a criatura real, trazida inteira' },
  [key('AGUA', 'DECOMPOR')]: { number: 18, name: 'Colégio da Evocação (Espectro)', kind: 'polar', vocabulary: 'só o eco espiritual dela' },
  [key('TERRA', 'COMPOR')]: { number: 21, name: 'Colégio da Golemancia (Semente)', kind: 'polar', vocabulary: 'matéria com vontade própria' },
  [key('TERRA', 'DECOMPOR')]: { number: 22, name: 'Colégio da Telecinesia (Poeira)', kind: 'polar', vocabulary: 'objeto movido, nunca desperto' },
  [key('AR', 'COMPOR')]: { number: 25, name: 'Colégio da Canção (Sopro)', kind: 'polar', vocabulary: 'ânimo elevado pela música' },
  [key('AR', 'DECOMPOR')]: { number: 26, name: 'Colégio do Sussurro (Míngua)', kind: 'polar', vocabulary: 'dúvida semeada em silêncio' },
  [key('LUZ', 'COMPOR')]: { number: 29, name: 'Colégio da Bênção (Aurora)', kind: 'polar', vocabulary: 'autoridade sobre a morte' },
  [key('LUZ', 'DECOMPOR')]: { number: 30, name: 'Colégio da Maldição (Estigma)', kind: 'polar', vocabulary: 'penalidade longa, porém finita' },
  [key('SOMBRA', 'COMPOR')]: { number: 31, name: 'Escola do Acordo (Voto)', kind: 'polar', vocabulary: 'pacto com entidade viva' },
  [key('SOMBRA', 'DECOMPOR')]: { number: 32, name: 'Colégio da Necromancia (Ocaso)', kind: 'polar', vocabulary: 'vínculo com o que já morreu' },

  // --- Demais Colégios (dois elementos, sem polaridade) ---
  [key('FOGO', 'TERRA')]: { number: 9, name: 'Colégio da Transmutação (Metal)', kind: 'combo', vocabulary: 'matéria transformada para sempre' },
  [key('FOGO', 'AR')]: { number: 10, name: 'Colégio do Progresso (Eletricidade)', kind: 'combo', vocabulary: 'energia estruturada' },
  [key('FOGO', 'LUZ')]: { number: 13, name: 'Colégio da Purificação (Zelo)', kind: 'combo', vocabulary: 'corrupção queimada, o alvo sobrevive' },
  [key('FOGO', 'SOMBRA')]: { number: 14, name: 'Colégio da Obsessão (Fome)', kind: 'combo', vocabulary: 'desejo insaciável implantado' },
  [key('AGUA', 'TERRA')]: { number: 15, name: 'Colégio de Herbologia (Raiz)', kind: 'combo', vocabulary: 'cultivo e veneno' },
  [key('AGUA', 'AR')]: { number: 16, name: 'Colégio da Tormenta (Maré)', kind: 'combo', vocabulary: 'clima e correntes' },
  [key('AGUA', 'LUZ')]: { number: 19, name: 'O Espírito (Alma)', kind: 'combo', vocabulary: 'a essência vital, não o corpo' },
  [key('AGUA', 'SOMBRA')]: { number: 20, name: 'Colégio do Sangue (Icor)', kind: 'combo', vocabulary: 'o fluido vital como arma e vínculo' },
  [key('LUZ', 'TERRA')]: { number: 23, name: 'Colégio da Abjuração (Marco)', kind: 'combo', vocabulary: 'escudos e wards permanentes' },
  [key('SOMBRA', 'TERRA')]: { number: 24, name: 'Colégio do Selo (Tumba)', kind: 'combo', vocabulary: 'aprisionar para sempre' },
  [key('AR', 'LUZ')]: { number: 27, name: 'Colégio da Adivinação (Eco)', kind: 'combo', vocabulary: 'ver longe, ler o oculto' },
  [key('AR', 'SOMBRA')]: { number: 28, name: 'Colégio do Domínio (Cordel)', kind: 'combo', vocabulary: 'a mente dos outros' },
};

export function resolveCollege(primaryElement: string, fusionElement?: string | null): CollegeInfo | null {
  const k = key(primaryElement, fusionElement || 'NONE');
  return COLLEGE_TABLE[k] || null;
}

// --- A Lei da Simetria ---
// "Criar faz a versão real e permanente — custa muito mana. Destruir faz
// a versão efêmera — custa pouco." Aplicado aos números: Criar empurra
// complexidade/potência (e portanto nível e CD, via as fórmulas do
// buffer) para cima; Destruir empurra para baixo. Isto muda os NÚMEROS da
// magia, não só o nome — conforme decidido.
export function polaritySymmetryDelta(fusionElement?: string | null): { complexity: number; potency: number } | null {
  if (fusionElement === 'COMPOR') return { complexity: +4, potency: +2 }; // Criar: caro, permanente
  if (fusionElement === 'DECOMPOR') return { complexity: -2, potency: -1 }; // Destruir: barato, efêmero
  return null;
}
