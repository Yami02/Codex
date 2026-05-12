import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, EdgeCategory, CoreElement, AdditiveType, AdditiveFamily } from '../types/magic';

export interface WizardAnswers {
  element: string; // 'FOGO', 'AGUA', etc.
  expansao: 'TOQUE' | 'PROJETIL' | 'AREA';
  duracao: 'INSTANTANEA' | 'CONCENTRACAO' | 'CAPACITOR';
  filtro: 'TODOS' | 'INIMIGOS' | 'ALIADOS';
}

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

    // List of layer 1 nodes to calculate angle offsets
    const layer1Nodes: MagicNode[] = [];

    // 2. Expansão (PONTO)
    const pontos: MagicNode[] = [];
    const numPontos = answers.expansao === 'TOQUE' ? 1 : (answers.expansao === 'PROJETIL' ? 2 : 3);
    
    for (let i = 0; i < numPontos; i++) {
        const pNode = {
            id: getId('ponto'),
            type: NodeType.ADDITIVE,
            family: AdditiveFamily.VETORIAL,
            additiveType: AdditiveType.PONTO,
            layer: 1
        } as any;
        pontos.push(pNode);
        layer1Nodes.push(pNode);
    }

    if (numPontos === 1) {
        addEdge(coreId, pontos[0].id);
    } else if (numPontos === 2) {
        addEdge(coreId, pontos[0].id);
        addEdge(pontos[0].id, pontos[1].id);
    } else if (numPontos === 3) {
        addEdge(coreId, pontos[0].id);
        addEdge(coreId, pontos[1].id);
        addEdge(coreId, pontos[2].id);
        addEdge(pontos[0].id, pontos[1].id);
        addEdge(pontos[1].id, pontos[2].id);
        addEdge(pontos[2].id, pontos[0].id);
    }

    // 3. Duração (MANTER)
    const manters: MagicNode[] = [];
    const numManters = answers.duracao === 'INSTANTANEA' ? 0 : (answers.duracao === 'CONCENTRACAO' ? 3 : 4);
    
    for (let i = 0; i < numManters; i++) {
        const mNode = {
            id: getId('manter'),
            type: NodeType.ADDITIVE,
            family: AdditiveFamily.CONTROLE_TEMPO,
            additiveType: AdditiveType.MANTER,
            layer: 1
        } as any;
        manters.push(mNode);
        layer1Nodes.push(mNode);
    }

    if (numManters === 3) {
        addEdge(coreId, manters[0].id);
        addEdge(coreId, manters[1].id);
        addEdge(coreId, manters[2].id);
        addEdge(manters[0].id, manters[1].id);
        addEdge(manters[1].id, manters[2].id);
        addEdge(manters[2].id, manters[0].id);
    } else if (numManters === 4) {
        addEdge(coreId, manters[0].id);
        addEdge(coreId, manters[1].id);
        addEdge(coreId, manters[2].id);
        addEdge(coreId, manters[3].id);
        addEdge(manters[0].id, manters[1].id);
        addEdge(manters[1].id, manters[2].id);
        addEdge(manters[2].id, manters[3].id);
        addEdge(manters[3].id, manters[0].id);
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

