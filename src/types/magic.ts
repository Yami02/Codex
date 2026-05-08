// ==========================================
// 1. ENUMS E CLASSIFICAÇÕES
// ==========================================

export enum NodeType {
  CORE = 'CORE',
  ADDITIVE = 'ADDITIVE',
  SUBCIRCLE = 'SUBCIRCLE',
}

export enum CoreElement {
  FOGO = 'FOGO',
  AGUA = 'AGUA',
  AR = 'AR',
  TERRA = 'TERRA',
  LUZ = 'LUZ',
  SOMBRA = 'SOMBRA',
  COMPOR = 'COMPOR',
  DECOMPOR = 'DECOMPOR',
  // Combinations
  METAL = 'METAL',
  LAVA = 'LAVA',
  COMBUSTAO = 'COMBUSTAO',
  ELETRICIDADE = 'ELETRICIDADE',
  MADEIRA = 'MADEIRA',
  LODO = 'LODO',
  NUVEM = 'NUVEM',
  VIDA = 'VIDA',
  CURA = 'CURA',
  ILUSAO = 'ILUSAO',
  CONTRAMAGICA = 'CONTRAMAGICA',
  MORTE = 'MORTE',
  DRENAR = 'DRENAR',
  MALDICAO = 'MALDICAO'
}

export enum AdditiveFamily {
  VETORIAL = 'VETORIAL',
  MORFOLOGICA = 'MORFOLOGICA',
  MODULACAO = 'MODULACAO',
  CONTROLE_TEMPO = 'CONTROLE_TEMPO',
  COMPORTAMENTAL = 'COMPORTAMENTAL',
}

export enum AdditiveType {
  // Kernel del Kernel
  ENTROPIA = 'ENTROPIA',
  MORFOLOGIA = 'MORFOLOGIA',
  ESTADO = 'ESTADO',
  ONDA = 'ONDA',
  FORCA = 'FORCA',
  VOLUME = 'VOLUME',
  // Aditivos
  CONTROLE = 'CONTROLE',
  AUMENTO = 'AUMENTO',
  REDUCAO = 'REDUCAO',
  PONTO = 'PONTO',
  MANTER = 'MANTER',
  GATILHO = 'GATILHO',
  ECO = 'ECO',
  // Legacy/Outros
  VETOR_LINEAR = 'VETOR_LINEAR',
  RADIACAO = 'RADIACAO',
  ANCORAGEM = 'ANCORAGEM',
  PLANO_SOLIDO = 'PLANO_SOLIDO',
  ESFERA_CUPULA = 'ESFERA_CUPULA',
}

export enum EdgeCategory {
  ESTRUTURAL = 'ESTRUTURAL',
  LOGICO = 'LOGICO',
}

export enum EdgeType {
  UNIAO = 'UNIAO',           // --
  ATRIBUICAO = 'ATRIBUICAO', // ==c (Contains)
  SEQUENCIA = 'SEQUENCIA',   // -->
  FEEDBACK = 'FEEDBACK',     // <-->
  AND = 'AND',               // --
  OR = 'OR',                 // <==>
  XOR = 'XOR',               // <-->
  SUB_STREAM = 'SUB_STREAM', // ==
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
  attributes?: NodeAttributes; // Atributos mecânicos carregados pelo nó
  requires?: string[]; // Dependências (ex: ['FORMA_FISICA'])
  provides?: string[]; // Concessões (ex: ['PROJETIL'])
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
}

export interface SubCircleNode extends BaseNode {
  type: NodeType.SUBCIRCLE;
  // Subcírculos atuam como parênteses, contendo sua própria topologia fechada
  magicGraph: MagicGraph; 
}

export type MagicNode = CoreNode | AdditiveNode | SubCircleNode;

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
    status: string[];
    auditLog: string[];
  };
}

