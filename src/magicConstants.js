export const NodeType = { 
  CORE: 'CORE', 
  ADDITIVE: 'ADDITIVE', 
  SUBCIRCLE: 'SUBCIRCLE', 
  KERNEL: 'KERNEL' 
};

export const CoreElement = { 
  FOGO: 'FOGO', 
  AGUA: 'AGUA', 
  TERRA: 'TERRA', 
  AR: 'AR', 
  LUZ: 'LUZ', 
  SOMBRA: 'SOMBRA', 
  COMPOR: 'COMPOR', 
  DECOMPOR: 'DECOMPOR' 
};

export const AdditiveType = { 
  CONTROLE: 'CONTROLE', 
  AUMENTO: 'AUMENTO', 
  REDUCAO: 'REDUCAO', 
  PONTO: 'PONTO', 
  MANTER: 'MANTER', 
  GATILHO: 'GATILHO', 
  ECO: 'ECO' 
};

export const KernelType = {
  ENTROPIA: 'ENTROPIA', 
  MORFOLOGIA: 'MORFOLOGIA', 
  ESTADO: 'ESTADO', 
  ONDA: 'ONDA', 
  FORCA: 'FORCA', 
  VOLUME: 'VOLUME'
};

export const EdgeType = { 
  AND: 'AND', 
  OR: 'OR', 
  XOR: 'XOR', 
  SEQUENCIA: 'SEQUENCIA', 
  ATRIBUICAO: 'ATRIBUICAO', 
  FEEDBACK: 'FEEDBACK' 
};

export const CoreRunes = { 
  [CoreElement.FOGO]: 'ᚲ', 
  [CoreElement.AGUA]: 'ᛚ', 
  [CoreElement.TERRA]: 'ᚦ', 
  [CoreElement.AR]: 'ᚨ', 
  [CoreElement.LUZ]: 'ᛊ', 
  [CoreElement.SOMBRA]: '᚛', 
  [CoreElement.COMPOR]: 'ᛈ', 
  [CoreElement.DECOMPOR]: 'ᚦ' 
};

export const AdditiveRunes = {
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
  [KernelType.ONDA]: 'ᛊ',
  [KernelType.FORCA]: 'ᚦ', 
  [KernelType.VOLUME]: 'ᛚ'
};

export const EdgeCycle = [
  EdgeType.AND, 
  EdgeType.OR, 
  EdgeType.XOR, 
  EdgeType.SEQUENCIA, 
  EdgeType.ATRIBUICAO, 
  EdgeType.FEEDBACK
];

export const EdgeSymbols = { 
  [EdgeType.AND]: '--', 
  [EdgeType.OR]: '<==>', 
  [EdgeType.XOR]: '<-->', 
  [EdgeType.SEQUENCIA]: '-->', 
  [EdgeType.ATRIBUICAO]: '==c', 
  [EdgeType.FEEDBACK]: '<-->' 
};

export const AdditiveDescriptions = {
  [AdditiveType.CONTROLE]: 'impondo domínio através de canais rúnicos',
  [AdditiveType.AUMENTO]: 'exaltando a amplitude da ressonância',
  [AdditiveType.REDUCAO]: 'suprimindo a intensidade do fluxo',
  [AdditiveType.PONTO]: 'ancorando a lógica em uma coordenada fixa',
  [AdditiveType.MANTER]: 'persistindo a estrutura através de loops temporais',
  [AdditiveType.GATILHO]: 'programando uma resposta condicional',
  [AdditiveType.ECO]: 'replicando a assinatura energética',
  // Kernels
  [KernelType.ENTROPIA]: 'Buffer de Entropia: Manipula a agitação térmica (calor/frio) do ambiente.',
  [KernelType.MORFOLOGIA]: 'Buffer de Morfologia: Define a forma/formato natural purificado da energia.',
  [KernelType.ESTADO]: 'Buffer de Estados: Define a fase física (líquido/sólido/gasoso/plasma) do elemento.',
  [KernelType.ONDA]: 'Buffer de Onda: Propaga a ideia pura de Som ou Luz.',
  [KernelType.FORCA]: 'Buffer de Força: Aplica leis da física (gravitacional/eletromagnética) sobre a magia.',
  [KernelType.VOLUME]: 'Buffer de Volume: Define o espaço volumétrico padrão (2 cm³ por padrão).'
};

export const NodeAttributesDict = {
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
  
  // Kernel Defaults (Buffers)
  [KernelType.ENTROPIA]: { thermal: 0, entropy: 1, entropyBuffer: true, tags: ['KERNEL', 'ENTROPIA'] },
  [KernelType.MORFOLOGIA]: { morphology: 1, morphologyBuffer: true, tags: ['KERNEL', 'MORFOLOGIA'] },
  [KernelType.ESTADO]: { phase: 1, stateBuffer: true, tags: ['KERNEL', 'ESTADO'] },
  [KernelType.ONDA]: { wave: 1, waveBuffer: true, tags: ['KERNEL', 'ONDA'] },
  [KernelType.FORCA]: { strength: 1, strengthBuffer: true, tags: ['KERNEL', 'FORCA'] },
  [KernelType.VOLUME]: { volume: 1, volumeBuffer: true, tags: ['KERNEL', 'VOLUME'] }
};
