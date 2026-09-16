import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, EdgeCategory, CoreElement, AdditiveType, AdditiveFamily } from '../types/magic';

export interface WizardAnswers {
  element: string; // 'FOGO', 'AGUA', etc.
  expansao: 'TOQUE' | 'PROJETIL' | 'AREA';
  duracao: 'INSTANTANEA' | 'CONCENTRACAO' | 'CAPACITOR';
  filtro: 'TODOS' | 'INIMIGOS' | 'ALIADOS';
}

// Ponto é geométrico (ver PONTO_LEVELS/PONTO_COUNT_TO_TIER em
// engine/constants.ts): o assistente não escolhe mais um "nível" — ele
// decide QUANTOS nós de Ponto desenhar e liga todos entre si, fechando um
// Triângulo (Projétil) ou Quadrado (Aura). MANTER continua com um `level`
// normal (ver MANTER_LEVELS).
const EXPANSAO_TO_PONTO_COUNT: Record<WizardAnswers['expansao'], number> = {
  TOQUE: 1,
  PROJETIL: 3, // 3 nós de Ponto ligados em triângulo
  AREA: 4,     // 4 nós de Ponto ligados em quadrado
};

const DURACAO_TO_MANTER_LEVEL: Record<WizardAnswers['duracao'], number> = {
  INSTANTANEA: 0,
  CONCENTRACAO: 2,
  CAPACITOR: 4,
};

export class SpellGraphBuilder {
  public static buildFromWizard(answers: WizardAnswers): MagicGraph {
    const nodes: MagicNode[] = [];
    const edges: MagicEdge[] = [];

    const getId = (prefix: string) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const addEdge = (source: string, target: string, type = EdgeType.AND, category = EdgeCategory.ESTRUTURAL) => {
        edges.push({
            id: getId('edge'),
            sourceId: source,
            targetId: target,
            type,
            category
        });
    };

    // 1. Core Node (Layer 0)
    const coreId = getId('core');
    nodes.push({
      id: coreId,
      type: NodeType.CORE,
      element: answers.element as CoreElement,
      layer: 0
    } as any);

    // Nós de camada 1: N nós de PONTO (contagem = figura geométrica, ver
    // EXPANSAO_TO_PONTO_COUNT acima) todos ligados ao Núcleo e, quando são
    // 3+ deles, ligados também entre si em ciclo (fechando o Triângulo/
    // Quadrado) — e, se houver duração, um único MANTER (nível = duração).
    const layer1Nodes: MagicNode[] = [];

    const pontoCount = EXPANSAO_TO_PONTO_COUNT[answers.expansao];
    const pontoNodes: MagicNode[] = [];
    for (let i = 0; i < pontoCount; i++) {
        const node = {
            id: getId('ponto'),
            type: NodeType.ADDITIVE,
            family: AdditiveFamily.VETORIAL,
            additiveType: AdditiveType.PONTO,
            layer: 1
        } as any;
        pontoNodes.push(node);
        layer1Nodes.push(node);
        addEdge(coreId, node.id);
    }
    // Fecha o ciclo entre os próprios nós de Ponto (A-B, B-C, ..., volta
    // pro A) — é essa aresta extra que faz o grupo valer como
    // Triângulo/Quadrado de verdade, não só nós soltos (ver
    // PatternMatcher.formsClosedPolygon em engine/compiler.ts).
    if (pontoNodes.length > 1) {
        pontoNodes.forEach((node, i) => {
            const next = pontoNodes[(i + 1) % pontoNodes.length];
            addEdge(node.id, next.id, EdgeType.AND, EdgeCategory.ESTRUTURAL);
        });
    }

    const manterLevel = DURACAO_TO_MANTER_LEVEL[answers.duracao];
    let manterNode: MagicNode | null = null;
    if (manterLevel > 0) {
        manterNode = {
            id: getId('manter'),
            type: NodeType.ADDITIVE,
            family: AdditiveFamily.CONTROLE_TEMPO,
            additiveType: AdditiveType.MANTER,
            level: manterLevel,
            layer: 1
        } as any;
        layer1Nodes.push(manterNode);
        addEdge(coreId, manterNode!.id);
    }

    // 4. Filtro (Kernel)
    let kernelNode: MagicNode | null = null;
    let aumentos: MagicNode[] = [];

    if (answers.filtro !== 'TODOS') {
        kernelNode = {
            id: getId('filtro'),
            type: NodeType.KERNEL,
            additiveType: answers.filtro === 'INIMIGOS' ? 'DECOMPOR' : 'COMPOR',
            magicGraph: { nodes: [], edges: [] },
            layer: 1
        } as any;
        layer1Nodes.push(kernelNode);
        addEdge(coreId, kernelNode!.id, EdgeType.AND, EdgeCategory.LOGICO);

        // Layer 2 modifiers (Aumento de precisão)
        for (let i = 0; i < 2; i++) {
            const aNode = {
                id: getId('aumento'),
                type: NodeType.ADDITIVE,
                family: AdditiveFamily.MODULACAO,
                additiveType: 'AUMENTO',
                layer: 2,
                angleOffset: i === 0 ? 0 : 180
            } as any;
            aumentos.push(aNode);
            addEdge(kernelNode!.id, aNode.id, EdgeType.AND, EdgeCategory.ESTRUTURAL);
        }
    }

    // Add assigned angleOffset for Layer 1
    const totalL1 = layer1Nodes.length;
    layer1Nodes.forEach((node, index) => {
        const offset = index * (360 / totalL1);
        (node as any).angleOffset = offset;
        nodes.push(node);
    });

    // Add Layer 2 nodes
    aumentos.forEach(node => nodes.push(node));

    return { nodes, edges };
  }
}
