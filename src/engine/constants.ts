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
  ECO = 'ECO',
  FORMA = 'FORMA',
  MOVER = 'MOVER',
  PERCEBER = 'PERCEBER',
  TESTE = 'TESTE',
  FUSAO = 'FUSAO'
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
  CAOS = 'CAOS',
  // Kernel de Absorção: não gera energia do zero — capta energia elemental
  // ambiente/externa (`sourceElement` no KernelNode) e a converte pro efeito
  // final. Ver "ABSORÇÃO AMBIENTAL / NÍVEL 0" mais abaixo.
  ABSORCAO = 'ABSORCAO'
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
  [AdditiveType.FORMA]: 'ᛗ',
  [AdditiveType.MOVER]: 'ᛜ',
  [AdditiveType.PERCEBER]: 'ᛇ',
  [AdditiveType.TESTE]: 'ᚹ',
  [AdditiveType.FUSAO]: 'ᛝ',
  // Kernel Runes
  [KernelType.ENTROPIA]: 'ᚲ', 
  [KernelType.MORFOLOGIA]: '᚛', 
  [KernelType.ESTADO]: 'ᛖ', 
  [KernelType.LUMINOSIDADE]: 'ᛊ',
  [KernelType.SOM]: 'ᚨ',
  [KernelType.FORCA]: 'ᚦ', 
  [KernelType.VOLUME]: 'ᛚ',
  [KernelType.ORDEM]: 'ᛈ',
  [KernelType.CAOS]: 'ᚦ',
  [KernelType.ABSORCAO]: 'ᛁ'
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

// Cada conectivo agora tem uma regra real no compilador (engine/compiler.ts,
// PatternMatcher.matchAndTransform) — não é mais só uma cor/símbolo na
// tela. UNIAO e REVERSO existem no enum e no visual (EdgeVisual.tsx) mas
// não estão no EdgeCycle (não são alcançáveis clicando numa aresta): são
// símbolos reservados, sem regra própria ainda.
export const EdgeDescriptions: Record<string, string> = {
  [EdgeType.AND]: 'Combinação direta (padrão): os dois nós apenas coexistem e somam ao buffer, como sempre. É a aresta criada automaticamente ao conectar dois nós.',
  [EdgeType.OR]: 'Alternativa: liga duas variantes do mesmo aditivo (ex: dois nós de Forma). O conjurador escolhe uma ao lançar; a ficha usa o pior caso (maior nível) para o nível/CD.',
  [EdgeType.XOR]: 'Exclusão mútua: como Alternativa, mas as variantes nunca coexistem — a ficha descreve a primeira como padrão, e o conjurador troca pra outra. É também o que transforma Mover+Perceber juntos numa escolha intencional em vez de um erro de design.',
  [EdgeType.SE_ENTAO]: 'Condicional: só pode sair de um nó de Teste ou Gatilho. O nó de destino passa a ser descrito como "se a condição, então o efeito" em vez de sempre ativo.',
  [EdgeType.ATRIBUICAO]: 'Canalização: liga um Aumento/Redução a um aditivo de nível (Ponto, Manter, Forma, Mover, Perceber ou Gatilho) — em vez de reforçar o buffer genérico, soma ou subtrai 1 nível direto naquele aditivo.',
  [EdgeType.CORRENTE]: 'Corrente: uma sequência de nós ligados em cadeia faz o efeito saltar de alvo em alvo — cada salto soma complexidade e aparece no texto final com dano decrescente por salto.',
};

export const AdditiveDescriptions: Record<string, string> = {
  [AdditiveType.CONTROLE]: 'impondo domínio através de canais rúnicos',
  [AdditiveType.AUMENTO]: 'exaltando a amplitude da ressonância',
  [AdditiveType.REDUCAO]: 'suprimindo a intensidade do fluxo',
  [AdditiveType.PONTO]: 'ancorando a lógica em uma coordenada fixa',
  [AdditiveType.MANTER]: 'persistindo a estrutura através de loops temporais',
  [AdditiveType.GATILHO]: 'o Capacitor: guarda a magia num glifo em vez de gastá-la agora — dispara depois, por um gatilho, e cargas extras a tornam mais forte',
  [AdditiveType.ECO]: 'replicando a assinatura energética',
  [AdditiveType.FORMA]: 'moldando a geometria de propagação do efeito (Cone, Linha ou Esfera Remota)',
  [AdditiveType.MOVER]: 'desloca no espaço, sem dano — você, um alvo ou a área ao redor',
  [AdditiveType.PERCEBER]: 'não causa dano nem cura: revela uma informação sobre o alvo ou a área',
  [AdditiveType.TESTE]: 'troca a jogada de ataque por um teste de resistência do alvo, mesmo à distância ou ao toque',
  [AdditiveType.FUSAO]: 'funde um segundo elemento (ou Compor/Decompor) ao Núcleo, revelando um dos 32 Colégios',
  // Kernels
  [KernelType.ENTROPIA]: 'Buffer de Entropia: Manipula a agitação térmica.',
  [KernelType.MORFOLOGIA]: 'Buffer de Morfologia: Define a forma/formato natural da energia.',
  [KernelType.ESTADO]: 'Buffer de Estados: Define a fase física.',
  [KernelType.LUMINOSIDADE]: 'Buffer de Luminosidade: Propaga e purifica a ideia de Luz.',
  [KernelType.SOM]: 'Buffer de Som: Propaga vibrações sonoras puras.',
  [KernelType.FORCA]: 'Buffer de Força: Aplica leis da física sobre a magia.',
  [KernelType.VOLUME]: 'Buffer de Volume: Define o espaço volumétrico padrão.',
  [KernelType.ORDEM]: 'Buffer de Ordem: Impõe estrutura e criação ao padrão arcano.',
  [KernelType.CAOS]: 'Buffer de Caos: Promove a dissipação e quebra de padrões.',
  [KernelType.ABSORCAO]: 'Kernel de Absorção: capta energia elemental ambiente (escolhida em "sourceElement") pra dentro de um glifo, em vez de gerar a energia do zero — a favor do seu próprio Núcleo, é quase grátis (Nível 0); contra, é caro.',
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
  1: { level: 1, name: 'Corpo-a-Corpo (Toque)', rangeStr: 'Toque / Corpo-a-Corpo',  dndRange: 'Toque',                                vetor: 'Toque / Corpo-a-Corpo' },
  2: { level: 2, name: 'Alcance (Projétil)',    rangeStr: 'Projétil Arcano (18m)',  dndRange: '18 metros (60 pés)',                   vetor: 'Projétil' },
  3: { level: 3, name: 'Aura',                  rangeStr: 'Aura ao seu redor (9m)', dndRange: 'Emanação de 9 metros a partir de você', vetor: 'Aura' },
};
export const PONTO_LEVEL_MIN = 1;
export const PONTO_LEVEL_MAX = 3;

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

// FORMA: aditivo geométrico opcional. Não concorre com o alcance de PONTO
// (que continua decidindo Corpo-a-Corpo/Alcance/Aura) — só refina a
// *geometria* de duas combinações específicas: uma Aura (PONTO 3) pode virar
// direcional (Cone/Linha) e um Alcance (PONTO 2) pode virar uma explosão
// remota (Esfera). Em qualquer outra combinação, FORMA fica sem efeito e o
// compilador avisa isso como instabilidade — não falha silenciosamente.
export interface FormaLevelInfo {
  level: number;
  name: string;
  appliesToPontoLevel: number; // Nível de PONTO em que essa forma faz sentido
  rangeStr: string;
  dndRange: string;
}

export const FORMA_LEVELS: Record<number, FormaLevelInfo> = {
  1: { level: 1, name: 'Cone',          appliesToPontoLevel: 3, rangeStr: 'Cone (4,5m)',           dndRange: 'Cone de 4,5 metros a partir de você' },
  2: { level: 2, name: 'Linha',         appliesToPontoLevel: 3, rangeStr: 'Linha (18m)',            dndRange: 'Linha de 18 metros a partir de você' },
  3: { level: 3, name: 'Esfera Remota', appliesToPontoLevel: 2, rangeStr: 'Esfera Remota (36m/6m)', dndRange: '36 metros; explosão em esfera de 6 metros de raio' },
};
export const FORMA_LEVEL_MIN = 1;
export const FORMA_LEVEL_MAX = 3;

// GATILHO: o Capacitor. Em vez de gastar a magia na hora, você a
// armazena num glifo — pra disparar depois (quando algo específico
// acontecer) ou pra somar cargas ao longo de vários turnos/conjuradores
// e produzir um efeito mais forte do que um só turno permitiria. O nível
// é "quantas cargas" o capacitor precisa (1 turno sozinho até 5 turnos,
// ou 5 conjuradores diferentes enchendo o mesmo capacitor); cada carga
// investida soma potência/complexidade ao feitiço final (ver
// engine/compiler.ts) — por isso um capacitor cheio pode produzir uma
// magia que nenhum conjurador sozinho, num turno só, conseguiria pagar.
export interface GatilhoLevelInfo {
  level: number;
  name: string;
  cargas: string; // quantos turnos/conjuradores enchem o capacitor
  powerBonus: number; // soma direta a potency/complexity no buffer
}

export const GATILHO_LEVELS: Record<number, GatilhoLevelInfo> = {
  1: { level: 1, name: 'Carga Rápida', cargas: '1 turno',                       powerBonus: 1 },
  2: { level: 2, name: 'Carga Pequena', cargas: '2 turnos (ou 2 conjuradores)', powerBonus: 2 },
  3: { level: 3, name: 'Carga Média',   cargas: '3 turnos (ou 3 conjuradores)', powerBonus: 3 },
  4: { level: 4, name: 'Carga Grande',  cargas: '4 turnos (ou 4 conjuradores)', powerBonus: 4 },
  5: { level: 5, name: 'Carga Ritual',  cargas: '5 turnos (ou 5 conjuradores)', powerBonus: 5 },
};
export const GATILHO_LEVEL_MIN = 1;
export const GATILHO_LEVEL_MAX = 5;

// O tipo de gatilho decide O QUE libera o capacitor. Isto ainda é a
// primeira versão do sistema — o próprio usuário pediu pra revisar depois.
export interface TriggerTypeInfo {
  key: string;
  name: string;
  description: string; // usado no texto final da magia
}

export const TRIGGER_TYPES: Record<string, TriggerTypeInfo> = {
  TEMPO: { key: 'TEMPO', name: 'Tempo', description: 'dispara sozinho após um número de turnos definido ao conjurar' },
  IMPACTO: { key: 'IMPACTO', name: 'Impacto', description: 'dispara quando o glifo (ou o alvo marcado) sofre um golpe ou é tocado' },
  COMANDO: { key: 'COMANDO', name: 'Comando', description: 'dispara quando o conjurador pronuncia a palavra de ativação' },
  PROXIMIDADE: { key: 'PROXIMIDADE', name: 'Proximidade', description: 'dispara quando alguém ou algo entra na área marcada' },
};
export const DEFAULT_TRIGGER_TYPE = 'COMANDO';

// MOVER e PERCEBER são aditivos de "modo": quando presentes, substituem o
// resultado padrão (dano/cura) por deslocamento ou informação. Reaproveitam
// o nível de PONTO só para decidir QUEM é afetado (você / um alvo à
// distância / a área ao redor) — o nível deles mesmos decide a intensidade
// do próprio efeito (distância deslocada / profundidade da informação).
export interface MoverLevelInfo {
  level: number;
  name: string;
  distance: string;
  dndDistance: string;
}

export const MOVER_LEVELS: Record<number, MoverLevelInfo> = {
  1: { level: 1, name: 'Passo Curto', distance: '3 metros',  dndDistance: '3 metros (10 pés)' },
  2: { level: 2, name: 'Salto Médio', distance: '9 metros',  dndDistance: '9 metros (30 pés)' },
  3: { level: 3, name: 'Salto Longo', distance: '18 metros, ignorando obstáculos leves', dndDistance: '18 metros (60 pés), inclusive através de superfícies sólidas de até 1,5m' },
};
export const MOVER_LEVEL_MIN = 1;
export const MOVER_LEVEL_MAX = 3;

export interface PerceberLevelInfo {
  level: number;
  name: string;
  detail: string;
}

export const PERCEBER_LEVELS: Record<number, PerceberLevelInfo> = {
  1: { level: 1, name: 'Detectar',   detail: 'sente a presença e a direção geral de algo compatível com a natureza do Núcleo, sem detalhes' },
  2: { level: 2, name: 'Identificar', detail: 'revela as propriedades específicas de um objeto, efeito mágico ou criatura observada' },
  3: { level: 3, name: 'Vislumbrar', detail: 'enxerga além do alcance normal dos sentidos — através de obstáculos, a distância, ou impressões superficiais da mente' },
};
export const PERCEBER_LEVEL_MIN = 1;
export const PERCEBER_LEVEL_MAX = 3;

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
  [KernelType.ABSORCAO]: 'Complexibilidade',
};

// INTENSIDADE DE KERNEL: cada Kernel carrega um `level` (1-5, como
// Gatilho) que escala sua contribuição ao buffer proporcionalmente — nível
// 1 é o de sempre (+1 no eixo), nível 5 multiplica por 5. É o que torna
// real a ideia de "aumentar a força da Terra ou seu tamanho aumenta o
// dano": subir o nível do Kernel de Força soma mais `strength`, subir o
// de Volume soma mais `volume`, e ambos alimentam computeDamageDice.
export interface KernelIntensityInfo {
  level: number;
  name: string;
}

export const KERNEL_INTENSITY_LEVELS: Record<number, KernelIntensityInfo> = {
  1: { level: 1, name: 'Base' },
  2: { level: 2, name: 'Reforçada' },
  3: { level: 3, name: 'Potente' },
  4: { level: 4, name: 'Violenta' },
  5: { level: 5, name: 'Máxima' },
};
export const KERNEL_LEVEL_MIN = 1;
export const KERNEL_LEVEL_MAX = 5;

// LEI DO COMBO DE KERNELS: subir UM Kernel é custo normal (ele já é
// proporcional ao nível). Subir DOIS OU MAIS Kernels ao mesmo tempo na
// mesma magia soma uma sobretaxa de `complexity` — o motor pune combinar
// eixos de escala, não usar um eixo forte sozinho. A sobretaxa cresce com
// o excesso total de níveis E com quantos eixos estão sendo empilhados
// (ver `kernelComboPenalty` em engine/compiler.ts): 2 Kernels empilhados
// custam mais que a soma dos dois isolados, 3 custam ainda mais que isso.

// ECONOMIA DE MANA: o teto de progressão "normal" deste sistema é o nível
// 10 (não o 20 do D&D) — mas com o dobro do total de pontos de mana de um
// mago padrão de D&D nesse teto (referência do usuário: 133; aqui, 260).
// A curva usa a mesma ideia de "cada vez mais caro" do combo de Kernels:
// crescimento quadrático (mana(n) ≈ 2.6 × n²) em vez de fatias iguais por
// nível, batendo exatamente em 260 no nível 10.
export const MANA_NIVEL_MAX = 10;
export const MANA_POR_NIVEL: Record<number, number> = {
  1: 3, 2: 10, 3: 23, 4: 42, 5: 65, 6: 94, 7: 127, 8: 166, 9: 211, 10: 260,
};

// ARQUÉTIPOS DE PRESTÍGIO: além do nível 10, a progressão não é mais "mais
// mana" — é acesso a um arquétipo que muda QUALITATIVAMENTE o que o
// conjurador pode fazer (regras novas, não um número maior). Isto é só o
// portão estrutural (`requiresPrestige` em engine/compiler.ts) e um
// placeholder de nome — nenhum arquétipo tem conteúdo/regras próprias
// implementadas ainda; fica registrado como próximo passo.
export interface PrestigeArchetypeInfo {
  id: string;
  name: string;
  description: string;
}

export const PRESTIGE_ARCHETYPES: Record<string, PrestigeArchetypeInfo> = {
  NECROMANTE: { id: 'NECROMANTE', name: 'Necromante', description: 'Exemplo de Arquétipo de Prestígio citado pelo usuário — ainda sem regras próprias implementadas.' },
};

// ABSORÇÃO AMBIENTAL / "NÍVEL 0": ideia de magia de custo zero (ou muito
// reduzido) quando conjurada A FAVOR do ambiente, e cara quando CONTRA ele.
// Exemplo do usuário: um mago de água tentando conjurar fogo num lugar
// dominado por fogo tem muita dificuldade; um mago de FOGO nesse mesmo
// lugar possivelmente nem precisa gastar mana — ele só está canalizando
// energia que já está lá.
//
// Implementado como um Kernel (KernelType.ABSORCAO, não um Núcleo — o
// usuário foi explícito nisso). O Kernel carrega um `sourceElement`
// (qual elemento ambiente/externo está sendo captado pro glifo, ver
// KernelNode em types/magic.ts) e o `level` de sempre (1-5, quanto o
// glifo acumula/quão potente fica).
//
// "A favor" vs "contra" o ambiente (1ª versão, deliberadamente simples: sem
// uma tabela de oposições elementais tipo fogo-vs-água — qualquer elemento
// diferente do seu próprio Núcleo já conta como "ir contra a natureza do
// ambiente", não só o oposto direto):
//   - sourceElement === elemento do seu próprio Núcleo → ALINHADO (Nível 0):
//     a captação não soma custo de mana algum (ver computeManaCost em
//     engine/compiler.ts) — você só está canalizando o que já está lá.
//   - sourceElement !== Núcleo → DESALINHADO: soma complexidade extra
//     proporcional ao nível do Kernel (ver fórmula abaixo), tornando a
//     magia mais cara/instável, nunca literalmente impossível nesta
//     primeira versão.
//
// Conversão elemento absorvido → efeito de saída: a energia do
// sourceElement é somada ao buffer como se fosse um segundo Núcleo (mesma
// mecânica de FUSAO/fusionElement) — é isso que permite o exemplo do
// usuário (fogo absorvido, depois usado numa cura): o Núcleo decide o
// efeito final (cura, dano...), a Absorção decide de onde vem parte da
// energia que alimenta esse efeito.
//
// Conecta com o Capacitor/Gatilho (§7): quando os dois existem na mesma
// magia, a Absorção é descrita como uma forma alternativa de encher o
// capacitor — energia ambiente/de um evento, em vez de turnos de
// conjuração (ver MagicCompilerEngine.execute).
export const ABSORCAO_MISALIGNED_COMPLEXITY_PER_LEVEL = 2;

// MANIFESTAÇÃO: a mesma combinação exata de alcance/forma/teste sempre
// produz a mesma palavra — nunca duas magias com a mesma geometria saem
// com nomes de manifestação diferentes por acaso. Isso é o que torna o
// texto final "compilado" de verdade: dado X, a resposta é sempre aquilo,
// como uma tabela de despacho em vez de prosa remontada à mão a cada vez.
// Mover/Perceber já tinham isso via MOVER_LEVELS/PERCEBER_LEVELS (Passo
// Curto, Detectar...) — esta tabela cobre o resto (ataque/teste/aura).
export interface ManifestacaoInfo {
  id: string;
  name: string;
}

export const MANIFESTACAO_TABLE: Record<string, ManifestacaoInfo> = {
  TOQUE_ATAQUE: { id: 'TOQUE_ATAQUE', name: 'Impacto Direto' },
  TOQUE_TESTE: { id: 'TOQUE_TESTE', name: 'Descarga de Contato' },
  ALCANCE_ATAQUE: { id: 'ALCANCE_ATAQUE', name: 'Projétil Dirigido' },
  ALCANCE_TESTE: { id: 'ALCANCE_TESTE', name: 'Feixe Guiado' },
  ALCANCE_ESFERA: { id: 'ALCANCE_ESFERA', name: 'Detonação Remota' },
  AURA: { id: 'AURA', name: 'Emanação Radial' },
  AURA_CONE: { id: 'AURA_CONE', name: 'Rajada Cônica' },
  AURA_LINHA: { id: 'AURA_LINHA', name: 'Lança Retilínea' },
  PESSOAL: { id: 'PESSOAL', name: 'Infusão Interna' },
};

// Habilidade de resistência que a vítima usa contra a condição do efeito.
// Segue a convenção do 5e: controle físico -> Força; veneno/atordoamento/
// paralisia/cegueira -> Constituição; ilusão/trapaça sensorial ->
// Inteligência; medo/compulsão mental -> Sabedoria.
export type SaveAbility = 'Força' | 'Destreza' | 'Constituição' | 'Inteligência' | 'Sabedoria' | 'Carisma';

export const NodeAttributesDict: Record<string, any> = {
  [CoreElement.FOGO]: { thermal: +6, entropy: +3, tags: ['Fogo'], debuffs: ['Queimando'], saveAbility: 'Destreza' as SaveAbility },
  [CoreElement.AGUA]: { volume: +4, tags: ['Água'], debuffs: ['Lento'], saveAbility: 'Constituição' as SaveAbility },
  [CoreElement.TERRA]: { strength: +5, mass: +3, tags: ['Terra'], debuffs: ['Retido'], saveAbility: 'Força' as SaveAbility },
  [CoreElement.AR]: { wave: +2, sonic: +2, tags: ['Ar'], debuffs: ['Empurrado'], saveAbility: 'Força' as SaveAbility },
  [CoreElement.LUZ]: { wave: +5, lumen: +6, tags: ['Luz'], debuffs: ['Cego'], saveAbility: 'Constituição' as SaveAbility },
  [CoreElement.SOMBRA]: { morphology: +4, lumen: -4, tags: ['Sombra'], debuffs: ['Amedrontado'], saveAbility: 'Sabedoria' as SaveAbility },
  [CoreElement.COMPOR]: { order: +5, tags: ['Composição'], debuffs: ['Enfeitiçado'], saveAbility: 'Sabedoria' as SaveAbility },
  [CoreElement.DECOMPOR]: { chaos: +5, tags: ['Decomposição'], debuffs: ['Exausto'], saveAbility: 'Constituição' as SaveAbility },

  [AdditiveType.AUMENTO]: { potency: +3, complexity: +1 },
  [AdditiveType.REDUCAO]: { potency: -2, complexity: +1 },
  [AdditiveType.PONTO]: { precision: +5, tags: ['PONTO'] },
  [AdditiveType.CONTROLE]: { complexity: +2, tags: ['CONTROL'] },
  [AdditiveType.MANTER]: { complexity: +1, tags: ['MANTER'] },
  [AdditiveType.FORMA]: { complexity: +1, tags: ['FORMA'] },
  [AdditiveType.MOVER]: { velocity: +4, tags: ['MOVER'] },
  [AdditiveType.PERCEBER]: { complexity: +3, tags: ['PERCEBER'] },
  [AdditiveType.TESTE]: { complexity: +1, tags: ['TESTE'] },
  // FUSAO em si não carrega atributos fixos — quem contribui é o elemento
  // escolhido (fusionElement, somado à parte pelo compilador) e a
  // assimetria de Criar/Destruir (ver Lei da Simetria em engine/colleges.ts).
  [AdditiveType.FUSAO]: { tags: ['FUSAO'] },

  // Kernel Defaults (Buffers): mais específicos que o Núcleo, por isso
  // sobrescrevem a condição/habilidade de resistência dele quando ativos.
  [KernelType.ENTROPIA]: { thermal: 0, entropy: 1, entropyBuffer: true, tags: ['KERNEL', 'ENTROPIA'], debuffs: ['Envenenado'], saveAbility: 'Constituição' as SaveAbility },
  [KernelType.MORFOLOGIA]: { morphology: 1, morphologyBuffer: true, tags: ['KERNEL', 'MORFOLOGIA'], debuffs: ['Enfeitiçado'], saveAbility: 'Inteligência' as SaveAbility },
  [KernelType.ESTADO]: { phase: 1, stateBuffer: true, tags: ['KERNEL', 'ESTADO'], debuffs: ['Paralisado'], saveAbility: 'Constituição' as SaveAbility },
  [KernelType.LUMINOSIDADE]: { lumen: 1, lumenBuffer: true, tags: ['KERNEL', 'LUMINOSIDADE'], debuffs: ['Cego'], saveAbility: 'Constituição' as SaveAbility },
  [KernelType.SOM]: { sonic: 1, waveBuffer: true, tags: ['KERNEL', 'SOM'], debuffs: ['Atordoado'], saveAbility: 'Constituição' as SaveAbility },
  [KernelType.FORCA]: { strength: 1, strengthBuffer: true, tags: ['KERNEL', 'FORCA'], debuffs: ['Retido'], saveAbility: 'Força' as SaveAbility },
  [KernelType.VOLUME]: { volume: 1, volumeBuffer: true, tags: ['KERNEL', 'VOLUME'], debuffs: ['Empurrado'], saveAbility: 'Força' as SaveAbility },
  [KernelType.ORDEM]: { order: 1, orderBuffer: true, tags: ['KERNEL', 'ORDEM'], debuffs: ['Enfeitiçado'], saveAbility: 'Sabedoria' as SaveAbility },
  [KernelType.CAOS]: { chaos: 1, chaosBuffer: true, tags: ['KERNEL', 'CAOS'], debuffs: ['Atordoado'], saveAbility: 'Constituição' as SaveAbility },
  // Absorção não carrega atributos próprios fixos — quem contribui é o
  // elemento ambiente escolhido (sourceElement, somado à parte pelo
  // compilador, igual à FUSAO) — ver "ABSORÇÃO AMBIENTAL / NÍVEL 0" acima.
  [KernelType.ABSORCAO]: { tags: ['KERNEL', 'ABSORCAO'], absorcaoBuffer: true }
};
