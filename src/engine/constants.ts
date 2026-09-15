export enum NodeType { 
  CORE = 'CORE', 
  ADDITIVE = 'ADDITIVE', 
  SUBCIRCLE = 'SUBCIRCLE', 
  KERNEL = 'KERNEL' 
}

export enum CoreElement { 
  FOGO = 'FOGO', 
  AGUA = 'AGUA', 
  TERRA = 'TERRA', 
  AR = 'AR', 
  LUZ = 'LUZ', 
  SOMBRA = 'SOMBRA', 
  COMPOR = 'COMPOR', 
  DECOMPOR = 'DECOMPOR' 
}

export enum AdditiveType { 
  CONTROLE = 'CONTROLE', 
  AUMENTO = 'AUMENTO', 
  REDUCAO = 'REDUCAO', 
  PONTO = 'PONTO', 
  MANTER = 'MANTER', 
  GATILHO = 'GATILHO', 
  ECO = 'ECO' 
}

export enum KernelType {
  ENTROPIA = 'ENTROPIA', 
  MORFOLOGIA = 'MORFOLOGIA', 
  ESTADO = 'ESTADO', 
  LUMINOSIDADE = 'LUMINOSIDADE', 
  SOM = 'SOM',
  FORCA = 'FORCA', 
  VOLUME = 'VOLUME',
  ORDEM = 'ORDEM',
  CAOS = 'CAOS'
}

export enum EdgeType { 
  AND = 'AND', 
  OR = 'OR', 
  XOR = 'XOR', 
  SE_ENTAO = 'SE_ENTAO', 
  ATRIBUICAO = 'ATRIBUICAO', 
  CORRENTE = 'CORRENTE',
  UNIAO = 'UNIAO',
  REVERSO = 'REVERSO'
}

export const CoreRunes: Record<string, string> = { 
  [CoreElement.FOGO]: 'ᚲ', 
  [CoreElement.AGUA]: 'ᛚ', 
  [CoreElement.TERRA]: 'ᚦ', 
  [CoreElement.AR]: 'ᚨ', 
  [CoreElement.LUZ]: 'ᛊ', 
  [CoreElement.SOMBRA]: '᚛', 
  [CoreElement.COMPOR]: 'ᛈ', 
  [CoreElement.DECOMPOR]: 'ᚦ' 
};

export const AdditiveRunes: Record<string, string> = {
  [AdditiveType.CONTROLE]: 'ᚱ', 
  [AdditiveType.AUMENTO]: 'ᚢ', 
  [AdditiveType.REDUCAO]: 'ᚦ',
  [AdditiveType.PONTO]: 'ᛈ', 
  [AdditiveType.MANTER]: 'ᛟ', 
  [AdditiveType.GATILHO]: 'ᛃ', 
  [AdditiveType.ECO]: 'ᛋ',
  // Kernel Runes
  [KernelType.ENTROPIA]: 'ᚲ', 
  [KernelType.MORFOLOGIA]: '᚛', 
  [KernelType.ESTADO]: 'ᛖ', 
  [KernelType.LUMINOSIDADE]: 'ᛊ',
  [KernelType.SOM]: 'ᚨ',
  [KernelType.FORCA]: 'ᚦ', 
  [KernelType.VOLUME]: 'ᛚ',
  [KernelType.ORDEM]: 'ᛈ',
  [KernelType.CAOS]: 'ᚦ'
};

export const EdgeCycle = [
  EdgeType.AND, 
  EdgeType.OR, 
  EdgeType.XOR, 
  EdgeType.SE_ENTAO, 
  EdgeType.ATRIBUICAO, 
  EdgeType.CORRENTE
];

export const EdgeSymbols: Record<string, string> = { 
  [EdgeType.AND]: '--', 
  [EdgeType.OR]: '<==>', 
  [EdgeType.XOR]: '<-->', 
  [EdgeType.SE_ENTAO]: '-->', 
  [EdgeType.ATRIBUICAO]: '==c', 
  [EdgeType.CORRENTE]: '==',
  [EdgeType.UNIAO]: '--'
};

export const AdditiveDescriptions: Record<string, string> = {
  [AdditiveType.CONTROLE]: 'impondo domínio através de canais rúnicos',
  [AdditiveType.AUMENTO]: 'exaltando a amplitude da ressonância',
  [AdditiveType.REDUCAO]: 'suprimindo a intensidade do fluxo',
  [AdditiveType.PONTO]: 'ancorando a lógica em uma coordenada fixa',
  [AdditiveType.MANTER]: 'persistindo a estrutura através de loops temporais',
  [AdditiveType.GATILHO]: 'programando uma response condicional',
  [AdditiveType.ECO]: 'replicando a assinatura energética',
  // Kernels
  [KernelType.ENTROPIA]: 'Buffer de Entropia: Manipula a agitação térmica.',
  [KernelType.MORFOLOGIA]: 'Buffer de Morfologia: Define a forma/formato natural da energia.',
  [KernelType.ESTADO]: 'Buffer de Estados: Define a fase física.',
  [KernelType.LUMINOSIDADE]: 'Buffer de Luminosidade: Propaga e purifica a ideia de Luz.',
  [KernelType.SOM]: 'Buffer de Som: Propaga vibrações sonoras puras.',
  [KernelType.FORCA]: 'Buffer de Força: Aplica leis da física sobre a magia.',
  [KernelType.VOLUME]: 'Buffer de Volume: Define o espaço volumétrico padrão.',
  [KernelType.ORDEM]: 'Buffer de Ordem: Impõe estrutura e criação ao padrão arcano.',
  [KernelType.CAOS]: 'Buffer de Caos: Promove a dissipação e quebra de padrões.'
};

// ==========================================
// NÍVEIS DE ADITIVOS (PONTO / MANTER)
// ==========================================
// Em vez de inferir o alcance/duração contando quantos nós idênticos
// foram empilhados no círculo, cada nó de PONTO/MANTER carrega seu
// próprio `level`, ajustado diretamente por um controle na UI.
// Isso torna a criação de magias auditável: 1 nó, 1 número, 1 efeito.

export interface PontoLevelInfo {
  level: number;
  name: string;         // Nome mostrado no seletor e no bloco de magia
  rangeStr: string;      // Resumo curto (ficha)
  dndRange: string;      // Alcance formal (bloco D&D 5e)
  vetor: string;          // Rótulo usado no log de compilação (fase "Projeção")
}

export const PONTO_LEVELS: Record<number, PontoLevelInfo> = {
  1: { level: 1, name: 'Toque / Centro',        rangeStr: 'Toque / Corpo-a-Corpo',        dndRange: 'Toque',                          vetor: 'Toque / Centro' },
  2: { level: 2, name: 'Projétil',              rangeStr: 'Projétil Arcano (18m)',        dndRange: '18 metros (60 pés)',             vetor: 'Projétil' },
  3: { level: 3, name: 'Ancorado (Fixo)',       rangeStr: 'Ponto Fixo (Ancoragem)',       dndRange: 'Ancorado a um ponto/objeto',     vetor: 'Ancorado' },
  4: { level: 4, name: 'Área Focal',            rangeStr: 'Efeito em Área (9m)',          dndRange: '9 metros de raio',               vetor: 'Área Focal' },
  5: { level: 5, name: 'Área Ampla (Determinística)', rangeStr: 'Efeito em Área Ampla (18m)', dndRange: '18 metros de raio',         vetor: 'Área Ampla' },
};
export const PONTO_LEVEL_MIN = 1;
export const PONTO_LEVEL_MAX = 5;

export interface ManterLevelInfo {
  level: number;
  name: string;
  duration: string;       // Rótulo curto (ficha)
  dndDuration: string;    // Duração formal (bloco D&D 5e)
  requiresConcentration: boolean;
}

export const MANTER_LEVELS: Record<number, ManterLevelInfo> = {
  0: { level: 0, name: 'Instantânea',            duration: 'Colisão Instantânea',              dndDuration: 'Instantânea',                        requiresConcentration: false },
  1: { level: 1, name: 'Eco Breve',              duration: '1 rodada',                          dndDuration: '1 rodada',                           requiresConcentration: false },
  2: { level: 2, name: 'Concentração Curta',     duration: 'Concentração, até 1 minuto',        dndDuration: 'Concentração, até 1 minuto',         requiresConcentration: true },
  3: { level: 3, name: 'Concentração Longa',     duration: 'Concentração, até 10 minutos',      dndDuration: 'Concentração, até 10 minutos',       requiresConcentration: true },
  4: { level: 4, name: 'Aura Estável (Capacitor)', duration: 'Até ser dissipada',                dndDuration: 'Até ser dissipada (sem concentração)', requiresConcentration: false },
};
export const MANTER_LEVEL_MIN = 0;
export const MANTER_LEVEL_MAX = 4;

// Cada Kernel escala o feitiço por um de dois eixos: pura amplitude
// ("Aumento") ou mudança qualitativa da natureza do efeito ("Complexibilidade").
export const KERNEL_SCALE_AXIS: Record<string, 'Aumento' | 'Complexibilidade'> = {
  [KernelType.ENTROPIA]: 'Aumento',
  [KernelType.FORCA]: 'Aumento',
  [KernelType.VOLUME]: 'Aumento',
  [KernelType.SOM]: 'Aumento',
  [KernelType.LUMINOSIDADE]: 'Aumento',
  [KernelType.ORDEM]: 'Aumento',
  [KernelType.MORFOLOGIA]: 'Complexibilidade',
  [KernelType.ESTADO]: 'Complexibilidade',
  [KernelType.CAOS]: 'Complexibilidade',
};

export const NodeAttributesDict: Record<string, any> = {
  [CoreElement.FOGO]: { thermal: +6, entropy: +3, tags: ['Fogo'] },
  [CoreElement.AGUA]: { volume: +4, tags: ['Água'] },
  [CoreElement.TERRA]: { strength: +5, mass: +3, tags: ['Terra'] },
  [CoreElement.AR]: { wave: +2, sonic: +2, tags: ['Ar'] },
  [CoreElement.LUZ]: { wave: +5, lumen: +6, tags: ['Luz'] },
  [CoreElement.SOMBRA]: { morphology: +4, lumen: -4, tags: ['Sombra'] },
  [CoreElement.COMPOR]: { order: +5, tags: ['Composição'] },
  [CoreElement.DECOMPOR]: { chaos: +5, tags: ['Decomposição'] },
  
  [AdditiveType.AUMENTO]: { potency: +3, complexity: +1 },
  [AdditiveType.REDUCAO]: { potency: -2, complexity: +1 },
  [AdditiveType.PONTO]: { precision: +5, tags: ['PONTO'] },
  [AdditiveType.CONTROLE]: { complexity: +2, tags: ['CONTROL'] },
  [AdditiveType.MANTER]: { complexity: +1, tags: ['MANTER'] },
  
  // Kernel Defaults (Buffers)
  [KernelType.ENTROPIA]: { thermal: 0, entropy: 1, entropyBuffer: true, tags: ['KERNEL', 'ENTROPIA'] },
  [KernelType.MORFOLOGIA]: { morphology: 1, morphologyBuffer: true, tags: ['KERNEL', 'MORFOLOGIA'] },
  [KernelType.ESTADO]: { phase: 1, stateBuffer: true, tags: ['KERNEL', 'ESTADO'] },
  [KernelType.LUMINOSIDADE]: { lumen: 1, lumenBuffer: true, tags: ['KERNEL', 'LUMINOSIDADE'] },
  [KernelType.SOM]: { sonic: 1, waveBuffer: true, tags: ['KERNEL', 'SOM'] },
  [KernelType.FORCA]: { strength: 1, strengthBuffer: true, tags: ['KERNEL', 'FORCA'] },
  [KernelType.VOLUME]: { volume: 1, volumeBuffer: true, tags: ['KERNEL', 'VOLUME'] },
  [KernelType.ORDEM]: { order: 1, orderBuffer: true, tags: ['KERNEL', 'ORDEM'] },
  [KernelType.CAOS]: { chaos: 1, chaosBuffer: true, tags: ['KERNEL', 'CAOS'] }
};
