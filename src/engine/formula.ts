import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, CoreElement, AdditiveType, AdditiveFamily } from '../types/magic';

export class FormulaTranslator {
  static graphToFormula(graph: MagicGraph): string {
    let lines = [];
    const idMap = new Map<string, string>();
    const counts = new Map<string, number>();

    const getAlias = (base: string) => {
      const c = (counts.get(base) || 0) + 1;
      counts.set(base, c);
      return `${base}${c > 1 ? c : ''}`;
    };
    
    // Nodes
    for (const node of graph.nodes) {
      if (node.type === NodeType.CORE) {
        const alias = getAlias((node as any).element);
        idMap.set(node.id, alias);
        lines.push(`CORE ${(node as any).element} ${alias}`);
      } else if (node.type === NodeType.ADDITIVE) {
        const alias = getAlias((node as any).additiveType);
        idMap.set(node.id, alias);
        lines.push(`ADD ${(node as any).additiveType} ${alias}`);
      } else if (node.type === NodeType.SUBCIRCLE) {
        const alias = getAlias('SUBCIRCLE');
        idMap.set(node.id, alias);
        lines.push(`SUBCIRCLE ${alias}`);
      } else if (node.type === NodeType.KERNEL) {
        const alias = getAlias(`KERNEL_${(node as any).additiveType}`);
        idMap.set(node.id, alias);
        lines.push(`KERNEL ${(node as any).additiveType} ${alias}`);
      }
    }
    
    lines.push('');
    // Edges
    for (const edge of graph.edges) {
      const src = idMap.get(edge.sourceId);
      const tgt = idMap.get(edge.targetId);
      if (src && tgt) {
        lines.push(`LINK ${src} ${edge.type} ${tgt}`);
      }
    }
    
    return lines.join('\n');
  }

  static formulaToGraph(formula: string): MagicGraph {
    const lines = formula.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const nodes: MagicNode[] = [];
    const edges: MagicEdge[] = [];
    
    const idMap = new Map<string, string>();
    let yOffset = 100;
    let xOffset = 300;
    
    for (const line of lines) {
      const parts = line.split(/[ \t]+/);
      const cmd = parts[0];
      
      if (cmd === 'CORE' && parts.length >= 2) {
        const rawType = parts[1];
        const alias = parts[2] || rawType;
        const id = `node_${Date.now()}_${Math.random()}`;
        idMap.set(alias, id);
        nodes.push({
          id,
          type: NodeType.CORE,
          element: rawType as CoreElement,
          position: { x: xOffset, y: yOffset }
        } as any);
        yOffset += 100;
      } else if (cmd === 'ADD' && parts.length >= 2) {
        const rawType = parts[1];
        const alias = parts[2] || rawType;
        const id = `node_${Date.now()}_${Math.random()}`;
        idMap.set(alias, id);
        nodes.push({
          id,
          type: NodeType.ADDITIVE,
          additiveType: rawType as AdditiveType,
          family: AdditiveFamily.VETORIAL,
          layer: 1,
          position: { x: xOffset, y: yOffset }
        } as any);
        xOffset += 150;
      } else if (cmd === 'SUBCIRCLE' && parts.length >= 2) {
        const alias = parts[1];
        const id = `node_${Date.now()}_${Math.random()}`;
        idMap.set(alias, id);
        nodes.push({
          id,
          type: NodeType.SUBCIRCLE,
          layer: 1,
          magicGraph: { nodes: [], edges: [] },
          position: { x: xOffset, y: yOffset }
        } as any);
        xOffset += 150;
      } else if (cmd === 'KERNEL' && parts.length >= 2) {
        const rawType = parts[1];
        const alias = parts[2] || rawType;
        const id = `node_${Date.now()}_${Math.random()}`;
        idMap.set(alias, id);
        nodes.push({
          id,
          type: NodeType.KERNEL,
          additiveType: rawType,
          layer: 1,
          magicGraph: { nodes: [], edges: [] },
          position: { x: xOffset, y: yOffset }
        } as any);
        xOffset += 150;
      } else if (cmd === 'LINK' && parts.length >= 4) {
        const srcAlias = parts[1];
        const typeStr = parts[2];
        const tgtAlias = parts[3];
        
        const sourceId = idMap.get(srcAlias) || srcAlias;
        const targetId = idMap.get(tgtAlias) || tgtAlias;
        
        edges.push({
          id: `edge_${Date.now()}_${Math.random()}`,
          sourceId,
          type: typeStr as EdgeType,
          targetId,
          category: 'ESTRUTURAL' as any
        });
      }
    }
    
    return { nodes, edges };
  }
}
