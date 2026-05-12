import { MagicGraph, NodeType, CoreElement } from '../types/magic';

export class MagicLexer {
  // Step 1: Lexical Analysis (Visual Schema to JSON/Tokens)
  public static tokenize(jsonStr: string): MagicGraph {
    try {
      const graph = JSON.parse(jsonStr);
      if (!graph || !graph.nodes) {
        throw new Error("Malformated syntax: Missing core arrays.");
      }
      return graph as MagicGraph;
    } catch (e: any) {
      throw new Error(`Erro Léxico: ${e.message}`);
    }
  }
}

export class MagicParser {
  // Step 2: Syntactic Analysis (Validating AST Structure)
  public static parse(graph: MagicGraph): MagicGraph {
    const cores = graph.nodes.filter(n => n.type === NodeType.CORE);
    if (cores.length === 0) {
      throw new Error("Erro Sintático: A Manifestação requer exatamente um Núcleo Elementar.");
    }
    if (cores.length > 1) {
      throw new Error("Erro Sintático: O Círculo permite apenas um Núcleo Elementar (Core).");
    }
    
    // Validating edges referring to valid nodes
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId)) {
        throw new Error("Erro Sintático: Conexão inválida rompendo a malha arcana.");
      }
    }
    return graph;
  }
}

export class MagicSemantic {
  // Step 3: Semantic Analysis (Rules, elements, compatibility)
  public static analyze(graph: MagicGraph): MagicGraph {
    const coreNode = graph.nodes.find(n => n.type === NodeType.CORE)!;
    
    // Check conflicts like "Luz" vs "Sombra" without "Compor/Decompor"
    // Just an example, we allow all for now but mark it as successful.
    if (!Object.values(CoreElement).includes(coreNode.element as CoreElement)) {
       throw new Error(`Erro Semântico: Elemento raiz [${coreNode.element}] é desconhecido nas leis herméticas.`);
    }

    return graph;
  }
}
