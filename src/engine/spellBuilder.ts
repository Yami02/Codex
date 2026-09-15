import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, EdgeCategory, CoreElement, AdditiveType, AdditiveFamily } from '../types/magic';

export interface WizardAnswers {
  element: string; // 'FOGO', 'AGUA', etc.
  expansao: 'TOQUE' | 'PROJETIL' | 'AREA';
  duracao: 'INSTANTANEA' | 'CONCENTRACAO' | 'CAPACITOR';
  filtro: 'TODOS' | 'INIMIGOS' | 'ALIADOS';
}

// Nível de PONTO/MANTER que cada resposta guiada do assistente produz.
// Ver PONTO_LEVELS / MANTER_LEVELS em engine/constants.ts para o que cada
// número significa (alcance e duração, respectivamente).
const EXPANSAO_TO_PONTO_LEVEL: Record<WizardAnswers['expansao'], number> = {
  TOQUE: 1,
  PROJETIL: 2,
  AREA: 4,
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

    // Nós de camada 1: um único PONTO (nível = alcance) e, se houver
    // duração, um único MANTER (nível = duração). Nada de empilhar cópias.
    const layer1Nodes: MagicNode[] = [];

    const pontoLevel = EXPANSAO_TO_PONTO_LEVEL[answers.expansao];
    const pontoNode = {
        id: getId('ponto'),
        type: NodeType.ADDITIVE,
        family: AdditiveFamily.VETORIAL,
        additiveType: AdditiveType.PONTO,
        level: pontoLevel,
        layer: 1
    } as any;
    layer1Nodes.push(pontoNode);
    addEdge(coreId, pontoNode.id);

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
