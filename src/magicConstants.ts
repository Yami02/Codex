export * from './engine/constants';

// We import these specific interfaces/types to avoid enum clashes
export type { MagicGraph, MagicNode, MagicEdge, CompiledSpell } from './types/magic';

// Extra objects that demo.html uses
export const NodeAttributesDict = {
  // Elements
  "LUZ": { lumen: 8, thermal: 3, order: 5, wave: 5, damageType: 'Radiante', baseDamage: 4, debuffs: ['Cegueira'] },
  "FOGO": { thermal: 10, entropy: 7, chaos: 6, wave: 4, damageType: 'Fogo', baseDamage: 6, debuffs: ['Queimadura'] },
  "TERRA": { mass: 10, order: 8, morphology: 6, damageType: 'Contundente', baseDamage: 5, debuffs: ['Lentidão'] },
  "AGUA": { volume: 8, wave: 6, order: 4, chaos: 4, damageType: 'Frio', baseDamage: 4, debuffs: ['Lentidão'] },
  "VENTO": { velocity: 9, chaos: 5, wave: 7, damageType: 'Cortante', baseDamage: 4, debuffs: ['Derrubar'] },
  "RAIO": { potency: 10, velocity: 10, wave: 8, chaos: 7, damageType: 'Elétrico', baseDamage: 7, debuffs: ['Paralisia'] },
  "SOMBRA": { entropy: 8, order: 6, complexity: 5, damageType: 'Necrótico', baseDamage: 5, debuffs: ['Cegueira', 'Medo'] },
  "SANGUE": { complexity: 9, order: 7, entropy: 4, healing: 5, damageType: 'Necrótico', baseDamage: 3, debuffs: ['Exaustão'] },
  "GRAVIDADE": { mass: 10, potency: 8, order: 9, damageType: 'Força', baseDamage: 6, debuffs: ['Imobilizar'] },
  "TEMPO": { complexity: 10, entropy: 9, order: 9, chaos: 9, damageType: 'Força', baseDamage: 0, debuffs: ['Parar o Tempo'] },
  
  // Additives
  "FORMA_PROJETIL": { velocity: 6, morphology: 'Lança/Dardo', order: 2 },
  "FORMA_RAIO": { velocity: 9, wave: 4, morphology: 'Feixe Contínuo' },
  "FORMA_ONDA": { wave: 8, volume: 5, morphology: 'Onda Cônica' },
  "FORMA_EXPLOSAO": { chaos: 6, volume: 7, morphology: 'Esfera Expansiva' },
  "FORMA_AURA": { order: 5, volume: 4, complexity: 3, morphology: 'Aura Centrada' },
  "FORMA_BARREIRA": { order: 8, mass: 5, morphology: 'Parede/Cúpula', baseDamage: -4 },
  
  "TAMANHO_MAIOR": { volume: 5, mass: 3, wave: 2 },
  "TAMANHO_MENOR": { volume: -3, mass: -2, velocity: 3 },
  "DISTANCIA_LONGE": { wave: 6, potency: 2 },
  "VELOCIDADE_RAPIDA": { velocity: 7, chaos: 2 },
  
  "CONTROLE": { order: 6, complexity: 4, duration: '1 minuto/nível' },
  "PROTECAO": { order: 7, mass: 4, healing: 2 },
  "DESTRUICAO": { entropy: 7, chaos: 5, baseDamage: 3 },
  "ILUSAO": { complexity: 8, lumen: 5, sonic: 5, baseDamage: -999 },
  "CURA": { order: 8, complexity: 6, healing: 6, damageType: 'Nenhum' },
  
  "PONTO": { order: 8, complexity: 2, duration: 'Fixo' },
  "AREA": { volume: 6, chaos: 3 },
  "ALVO": { order: 7, velocity: 4 },
  
  "GATILHO_TEMPO": { complexity: 5, order: 5 },
  "GATILHO_IMPACTO": { chaos: 4, potency: 3 },
  "MANTER": { order: 9, complexity: 6, duration: 'Concentração (Ver Atributos)' }
};

export const EdgeSymbols = {
  SEQUENCIA: '→',
  PARALELO: '⇉',
  CONDICIONAL: '⤨',
  REVERSO: '←'
};

export const AdditiveDescriptions = {
  "FORMA_PROJETIL": "Molda o elemento em um dardo rápido e perfurante.",
  "FORMA_RAIO": "Acelera as partículas criando um feixe contínuo e intenso.",
  "FORMA_ONDA": "Cria um cone de propagação a partir do originador.",
  "FORMA_EXPLOSAO": "Desestabiliza o elemento gerando uma violenta expansão esférica.",
  "FORMA_AURA": "Aninha a manifestação em um campo contínuo ao redor do alvo.",
  "FORMA_BARREIRA": "Cristaliza o elemento em uma defesa tátil e estruturada.",
  "PONTO": "Ancora a magia no tecido do espaço, estabelecendo uma origem fixa.",
  "AREA": "Expande o limite de interação do feitiço para zonas amplas.",
  "ALVO": "Cria uma ligação de rastreamento com uma assinatura arcana específica.",
  "TAMANHO_MAIOR": "Amplifica o volume da manifestação, sacrificando densidade.",
  "TAMANHO_MENOR": "Comprime a magia, tornando-a densa, letal e muito veloz.",
  "DISTANCIA_LONGE": "Aumenta drasticamente o alcance de detecção e disparo.",
  "VELOCIDADE_RAPIDA": "Reduz o tempo de invocação e viagem do projétil/efeito.",
  "CONTROLE": "Subjuga leis físicas, permitindo manipulação de ambiente e mentes.",
  "PROTECAO": "Tece escudos e imunidades contra forças discordantes.",
  "DESTRUICAO": "Foca a entropia pura para desfazer matéria e vínculos vitais.",
  "ILUSAO": "Dobra a luz e o som para criar reflexos na malha perceptiva.",
  "CURA": "Inverte a entropia, forçando tecidos e almas à sua ordem original.",
  "GATILHO_TEMPO": "Adia a liberação até que engrenagens cronológicas se alinhem.",
  "GATILHO_IMPACTO": "Mantém o feitiço dormente até uma colisão cinética bruta.",
  "MANTER": "Liga o feitiço ao fluxo vital do conjurador, exigindo concentração constante."
};
