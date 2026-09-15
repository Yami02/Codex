// Selo Arcano: gera um glifo único e decodificável para o resultado
// compilado de uma magia, seguindo o "Unique Binary Scheme" do
// "Gorilla of Destiny's Spell Writing Guide" (2022).
//
// Ideia do livro: um polígono de n vértices, onde cada atributo da magia
// (nível, elemento, alcance...) desenha suas próprias linhas usando um
// "salto" k fixo (vértice i -> vértice i+k). Cada VALOR possível de um
// atributo vira um número binário de n bits — só usamos números
// "ciclicamente únicos" (nenhuma rotação de um bate com outro já usado),
// para que o selo nunca fique ambíguo dependendo do ângulo em que é lido.
// Sobrepondo as linhas de todos os atributos no mesmo polígono, cada
// combinação única de nível+elemento+alcance+forma+duração vira um selo
// geométrico próprio — o compilador não produz só texto, produz um
// símbolo verdadeiro.

export interface SigilVertex { x: number; y: number; }
export interface SigilSegment { x1: number; y1: number; x2: number; y2: number; color: string; attr: string; }
export interface SpellSigil {
  n: number;
  vertices: SigilVertex[];
  segments: SigilSegment[];
}

// --- 1. Números binários ciclicamente únicos ---
// Gera todo número de n bits, reduz cada um à sua forma canônica (o menor
// valor entre todas as suas n rotações) e mantém só uma cópia por classe.
// Isso reproduz exatamente o dicionário binário do livro (conferido contra
// a tabela deles para n=5: 00000, 00001, 00011, 00101, 00111, 01011,
// 01111, 11111 — 8 números, batendo com N_Uniques=8 do apêndice).
function intToBits(value: number, n: number): number[] {
  const bits: number[] = [];
  for (let i = n - 1; i >= 0; i--) bits.push((value >> i) & 1);
  return bits;
}

function bitsToInt(bits: number[]): number {
  return bits.reduce((acc, b) => (acc << 1) | b, 0);
}

function rotateBits(bits: number[], by: number): number[] {
  const n = bits.length;
  return bits.map((_, i) => bits[(i + by) % n]);
}

function canonicalInt(bits: number[]): number {
  let best = bitsToInt(bits);
  for (let r = 1; r < bits.length; r++) {
    const rotated = bitsToInt(rotateBits(bits, r));
    if (rotated < best) best = rotated;
  }
  return best;
}

const uniqueBinaryCache = new Map<number, number[][]>();

export function cyclicallyUniqueBinaryNumbers(n: number): number[][] {
  const cached = uniqueBinaryCache.get(n);
  if (cached) return cached;

  const seenCanon = new Set<number>();
  const result: number[][] = [];
  const total = 1 << n;
  for (let v = 0; v < total; v++) {
    const bits = intToBits(v, n);
    const canon = canonicalInt(bits);
    if (!seenCanon.has(canon)) {
      seenCanon.add(canon);
      result.push(intToBits(canon, n));
    }
  }
  uniqueBinaryCache.set(n, result);
  return result;
}

// --- 2. Dicionário de atributos do selo ---
// 5 atributos -> n = 2*5+1 = 11 vértices (regra do livro: n >= 2*NAttributes+1).
// k vai de 1 a 5 (floor(n/2)), um por atributo, para que cada um desenhe
// um padrão de linha visualmente distinto no mesmo polígono.
export const SIGIL_N = 11;

interface SigilAttributeDef {
  key: string;
  k: number;
  color: string;
  features: string[];
}

const ELEMENT_FEATURES = [
  'FOGO', 'AGUA', 'TERRA', 'AR', 'LUZ', 'SOMBRA', 'COMPOR', 'DECOMPOR',
  'METAL', 'LAVA', 'ELETRICIDADE', 'COMBUSTÃO', 'MADEIRA', 'VENENO', 'NUVEM',
  'ILUSÃO', 'CONTRAMÁGICA', 'VIDA/CURA', 'MORTE/DRENAR', 'MALDIÇÃO', 'Desconhecido',
];
const NIVEL_FEATURES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ALCANCE_FEATURES = ['Nenhum', 'Toque', 'Alcance', 'Aura'];
const MANIFESTACAO_FEATURES = ['Padrão', 'Cone', 'Linha', 'Esfera Remota', 'Mover', 'Perceber'];
const DURACAO_FEATURES = ['Instantânea', 'Eco Breve', 'Concentração Curta', 'Concentração Longa', 'Capacitor'];

const SIGIL_ATTRIBUTES: SigilAttributeDef[] = [
  { key: 'elemento', k: 1, color: '#d4af37', features: ELEMENT_FEATURES },
  { key: 'nivel', k: 2, color: '#e84118', features: NIVEL_FEATURES },
  { key: 'alcance', k: 3, color: '#00a8ff', features: ALCANCE_FEATURES },
  { key: 'manifestacao', k: 4, color: '#2ecc71', features: MANIFESTACAO_FEATURES },
  { key: 'duracao', k: 5, color: '#9c88ff', features: DURACAO_FEATURES },
];

// --- 3. Resolução da magia -> índice de feature por atributo ---
// `attrs` é o buffer já resolvido pelo compilador (result.attrs), que já
// carrega alcance/forma/mover/perceber/duracao como eixos numéricos.
export interface SigilInput {
  element: string;
  level: number;
  alcance: number;
  forma: number;
  mover: number;
  perceber: number;
  duracao: number;
}

function manifestacaoFeature(input: SigilInput): string {
  if (input.mover > 0) return 'Mover';
  if (input.perceber > 0) return 'Perceber';
  if (input.forma === 1) return 'Cone';
  if (input.forma === 2) return 'Linha';
  if (input.forma === 3) return 'Esfera Remota';
  return 'Padrão';
}

function featureValue(attrKey: string, input: SigilInput): string {
  switch (attrKey) {
    case 'elemento': return input.element;
    case 'nivel': return String(Math.min(9, Math.max(0, Math.round(input.level))));
    case 'alcance': return ALCANCE_FEATURES[Math.min(3, Math.max(0, input.alcance))];
    case 'manifestacao': return manifestacaoFeature(input);
    case 'duracao': return DURACAO_FEATURES[Math.min(4, Math.max(0, input.duracao))];
    default: return '';
  }
}

// --- 4. Geração do selo (vértices + segmentos prontos pra SVG) ---
export function computeSpellSigil(input: SigilInput, radius = 100, center = { x: 0, y: 0 }): SpellSigil {
  const n = SIGIL_N;
  const uniqueNumbers = cyclicallyUniqueBinaryNumbers(n);

  const vertices: SigilVertex[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -90 + i * (360 / n);
    const rad = (angle * Math.PI) / 180;
    vertices.push({
      x: center.x + radius * Math.cos(rad),
      y: center.y + radius * Math.sin(rad),
    });
  }

  const segments: SigilSegment[] = [];
  for (const attr of SIGIL_ATTRIBUTES) {
    const value = featureValue(attr.key, input);
    let featureIndex = attr.features.indexOf(value);
    if (featureIndex === -1) featureIndex = attr.features.length - 1; // fallback: último feature (ex: "Desconhecido")
    const bits = uniqueNumbers[featureIndex % uniqueNumbers.length];

    for (let i = 0; i < n; i++) {
      if (bits[i] === 1) {
        const target = (i + attr.k) % n;
        const a = vertices[i];
        const b = vertices[target];
        segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: attr.color, attr: attr.key });
      }
    }
  }

  return { n, vertices, segments };
}

export const SIGIL_LEGEND = SIGIL_ATTRIBUTES.map(a => ({ key: a.key, color: a.color }));
