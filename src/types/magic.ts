// ==========================================
// 1. ENUMS E CLASSIFICAÇÕES
// ==========================================
// Fonte única da verdade: os enums estruturais (NodeType, CoreElement,
// AdditiveType, KernelType, EdgeType) vivem em engine/constants.ts, junto
// das runas, descrições e atributos que os acompanham. Este arquivo só
// re-exporta e acrescenta os tipos "de forma" (interfaces de nó/aresta/grafo)
// que faltavam ali, para nunca haver duas listas de elementos/aditivos
// divergentes na mesma base de código.
export {
  NodeType,
  CoreElement,
  AdditiveType,
  KernelType,
  EdgeType,
} from '../engine/constants';
import { NodeType, CoreElement, AdditiveType, EdgeType } from '../engine/constants';

// Elementos "combinados" resolvidos pelo compilador (ex: FOGO+TERRA+COMPOR
// = METAL) não são um Núcleo que o jogador escolhe — são o resultado da
// leitura semântica do círculo, por isso ficam como string livre em vez de
// um enum: o PatternMatcher em engine/compiler.ts é a fonte da verdade
// sobre quais combinações existem.
export type ResolvedElement = CoreElement | string;

export enum AdditiveFamily {
  VETORIAL = 'VETORIAL',
  MORFOLOGICA = 'MORFOLOGICA',
  MODULACAO = 'MODULACAO',
  CONTROLE_TEMPO = 'CONTROLE_TEMPO',
  COMPORTAMENTAL = 'COMPORTAMENTAL',
}

export enum EdgeCategory {
  ESTRUTURAL = 'ESTRUTURAL',
  LOGICO = 'LOGICO',
}

// ==========================================
// 2. INTERFACES DE NÓS (NODES)
// ==========================================

export interface NodeAttributes {
  // Sensoriais
  lumen?: number;
  sonic?: number;
  thermal?: number;
  olfactory?: number;
  // Físicos
  mass?: number;
  velocity?: number;
  density?: number;
  potency?: number;
  // Metafísicos
  volatility?: number;
  complexity?: number;
  stealth?: number;
  
  // Metadados Mecânicos (D&D 5e)
  baseDamage?: string; // ex: "1d8"
  damageType?: string; // ex: "fire", "radiant"
  healing?: string;    // ex: "1d4"
  debuffs?: string[];  // ex: ["blinded", "prone"]
  saveDCBonus?: number;
  
  // Metadados Clássicos
  nameFragment?: string;
  tags?: string[];
  [key: string]: any;
}

export interface BaseNode {
  id: string;
  type: NodeType;
  position?: { x: number; y: number }; // Utilizado pelo React Flow
  layer?: number; // Camada orbital do nó (0 = Núcleo)
  angleOffset?: number; // Deslocamento angular (demo feature)
  attributes?: NodeAttributes; // Atributos mecânicos carregados pelo nó
  requires?: string[]; // Dependências (ex: ['FORMA_FISICA'])
  provides?: string[]; // Concessões (ex: ['PROJETIL'])
  customMorphology?: string; // Morphologia customizada (demo feature)
}

export interface CoreNode extends BaseNode {
  type: NodeType.CORE;
  element: CoreElement;
}

export interface AdditiveNode extends BaseNode {
  type: NodeType.ADDITIVE;
  family: AdditiveFamily;
  additiveType: AdditiveType;
  multiplier?: number; // Ex: 3x Amplificadores (para uso no cálculo de simetria)
  // Intensidade explícita do aditivo (usada por PONTO 1-3 e MANTER 0-4).
  // Substitui a antiga convenção de "empilhar N cópias do mesmo nó" —
  // ver PONTO_LEVELS/MANTER_LEVELS em engine/constants.ts.
  level?: number;
  // Usado só pelo aditivo FUSAO: qual segundo elemento/polaridade (um dos
  // 8 valores de CoreElement) se combina com o Núcleo principal — ver
  // COLLEGE_TABLE em engine/colleges.ts.
  fusionElement?: string;
}

export interface SubCircleNode extends BaseNode {
  type: NodeType.SUBCIRCLE;
  // Subcírculos atuam como parênteses, contendo sua própria topologia fechada
  magicGraph: MagicGraph; 
}

export interface KernelNode extends BaseNode {
  type: NodeType.KERNEL;
  additiveType: string;
  magicGraph: MagicGraph;
}

export type MagicNode = CoreNode | AdditiveNode | SubCircleNode | KernelNode;

// ==========================================
// 3. INTERFACES DE ARESTAS (EDGES)
// ==========================================

export interface MagicEdge {
  id: string;
  sourceId: string;
  targetId: string;
  category: EdgeCategory;
  type: EdgeType;
}

// ==========================================
// 4. ESTRUTURA PRINCIPAL (O FEITIÇO)
// ==========================================

export interface MagicGraph {
  nodes: MagicNode[];
  edges: MagicEdge[];
}

// ==========================================
// 5. RESULTADO DA COMPILAÇÃO
// ==========================================

export interface CompiledSpell {
  spellName: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  components: string;
  damageOrEffect: string;
  instabilities: string[];
  finalAttributes: {
    lumen: number;
    sonic: number;
    thermal: number;
    olfactory: number;
    mass: number;
    velocity: number;
    density: number;
    potency: number;
    volatility: number;
    complexity: number;
    stealth: number;
    entropy: number;
    morphology: number;
    order: number;
    chaos: number;
    volume: number;
    strength: number;
    wave: number;
    healing?: string;
    damageType?: string;
    status: string[];
    auditLog: string[];
  };
  needsDC: boolean;
  dc: number;
}

