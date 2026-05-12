import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, CoreElement, AdditiveType } from '../types/magic';
import { NodeAttributesDict } from './constants';

export interface ActionBufferItem {
  step: number;
  title: string;
  description: string;
  type: 'CAST' | 'TRAVEL' | 'IMPACT' | 'AURA' | 'CONTROL' | 'MODIFIER';
  dice?: string;
  dcTarget?: number;
  element?: string;
}

// 1. Árvore de Sintaxe Abstrata (AST)
export abstract class ASTNode {
  constructor(public id: string) {}
  abstract accept(visitor: ASTVisitor): void;
}

export class CoreASTNode extends ASTNode {
  constructor(id: string, public element: string) { super(id); }
  accept(visitor: ASTVisitor) { visitor.visitCore(this); }
}

export class AdditiveASTNode extends ASTNode {
  constructor(id: string, public additiveType: string) { super(id); }
  accept(visitor: ASTVisitor) { visitor.visitAdditive(this); }
}

export class KernelASTNode extends ASTNode {
  constructor(id: string, public kernelType: string, public subGraph: ASTGraph) { super(id); }
  accept(visitor: ASTVisitor) { visitor.visitKernel(this); }
}

export class ASTGraph {
  public nodes: ASTNode[] = [];
  public adjacency: Map<string, string[]> = new Map(); // child -> parents (dependencies)
  public forwardAdjacency: Map<string, string[]> = new Map(); // parent -> children

  public addNode(node: ASTNode) {
    this.nodes.push(node);
    if (!this.adjacency.has(node.id)) this.adjacency.set(node.id, []);
    if (!this.forwardAdjacency.has(node.id)) this.forwardAdjacency.set(node.id, []);
  }

  public addEdge(sourceId: string, targetId: string) {
    // sourceId -> targetId indicates target depends on source.
    if (this.adjacency.has(targetId)) {
      this.adjacency.get(targetId)!.push(sourceId);
    }
    if (this.forwardAdjacency.has(sourceId)) {
      this.forwardAdjacency.get(sourceId)!.push(targetId);
    }
  }

  public getNode(id: string): ASTNode | undefined {
    return this.nodes.find(n => n.id === id);
  }
}

export interface ASTVisitor {
  visitCore(node: CoreASTNode): void;
  visitAdditive(node: AdditiveASTNode): void;
  visitKernel(node: KernelASTNode): void;
}

// 2. Parser: Transforma JSON em AST
export class GraphToASTBuilder {
  public static build(graph: MagicGraph | any): ASTGraph {
    const ast = new ASTGraph();

    for (const n of graph.nodes) {
      if (n.type === NodeType.CORE) {
        ast.addNode(new CoreASTNode(n.id, n.element || n.name));
      } else if (n.type === NodeType.ADDITIVE) {
        ast.addNode(new AdditiveASTNode(n.id, n.additiveType || n.name));
      } else if (n.type === NodeType.KERNEL) {
        const subAst = n.magicGraph ? this.build(n.magicGraph) : new ASTGraph();
        ast.addNode(new KernelASTNode(n.id, n.additiveType || n.name, subAst));
      }
    }

    for (const e of graph.edges) {
      ast.addEdge(e.sourceId, e.targetId);
    }

    return ast;
  }
}

// 3. Validador Semântico
export class SemanticValidator {
  public static validate(ast: ASTGraph): string[] {
    const errors: string[] = [];
    const cores = ast.nodes.filter(n => n instanceof CoreASTNode);
    
    if (cores.length === 0) {
      errors.push("Anomalia Semântica: A malha arcana não possui um Núcleo Elementar (Core) para ancorar a magia.");
    } else if (cores.length > 1) {
      errors.push("Colapso Dimensional: Múltiplos Núcleos detectados. Apenas uma essência primordial pode governar a instância do feitiço.");
    }

    const kernels = ast.nodes.filter((n): n is KernelASTNode => n instanceof KernelASTNode);
    for (const k of kernels) {
      if (!k.subGraph || k.subGraph.nodes.length === 0) {
        errors.push(`Vazio Semântico: Um Kernel (${k.kernelType}) foi declarado, mas se encontra oco (nenhuma regra atrelada a ele).`);
      }
    }

    if (this.hasCycle(ast)) {
      errors.push("Paradoxo Temporal: O feitiço descreve um loop infinito (dependências circulares). Executar causaria um buraco negro semântico.");
    }

    return errors;
  }

  private static hasCycle(ast: ASTGraph): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        recStack.add(nodeId);

        const neighbors = ast.forwardAdjacency.get(nodeId) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && dfs(neighbor)) {
            return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }
      recStack.delete(nodeId);
      return false;
    };

    for (const node of ast.nodes) {
      if (dfs(node.id)) {
        return true;
      }
    }
    return false;
  }
}

// 4. Ordenação Topológica (Grafo de Resolução)
export class ExecutionTraversal {
  public static resolveOrder(ast: ASTGraph): ASTNode[] {
    const order: ASTNode[] = [];
    const visited = new Set<string>();
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const dependencies = ast.adjacency.get(nodeId) || [];
      for (const dep of dependencies) {
        visit(dep);
      }
      
      const node = ast.getNode(nodeId);
      if (node) {
        order.push(node);
      }
    };

    for (const node of ast.nodes) {
      visit(node.id);
    }
    
    return order;
  }
}

// 5. O Motor Principal do Compilador
export class MagicCompilerEngine {
  public static execute(graphObject: any) {
    if (!graphObject.nodes || graphObject.nodes.length === 0) {
      return null;
    }

    // 1. Parser JSON -> AST
    const astGraph = GraphToASTBuilder.build(graphObject);
    
    // 2. Validador Semântico
    const semanticErrors = SemanticValidator.validate(astGraph);

    // 3. Travessia (Resolução da Ordem de Avaliação)
    const executionOrder = ExecutionTraversal.resolveOrder(astGraph);
    
    // 4. Geração do Buffer de Saída (D&D Output)
    const events: ActionBufferItem[] = [];
    let currentAttrs: any = {};
    let element = "Alvo";
    
    let stepCount = 1;
    let pontosLevel = 0;
    let hasManter = 0;

    for (const node of executionOrder) {
      if (node instanceof CoreASTNode) {
        element = node.element;
        const coreBase = NodeAttributesDict[element] || {};
        currentAttrs = this.mergeAttrs(currentAttrs, coreBase);
        events.push({
            step: stepCount++,
            title: `Conjuração Primordial: ${element}`,
            description: `A energia elementar bruta de ${element} começa a se manifestar pelas veias do conjurador.`,
            type: 'CAST',
            element
        });
      }
      else if (node instanceof AdditiveASTNode) {
        const addBase = NodeAttributesDict[node.additiveType] || {};
        currentAttrs = this.mergeAttrs(currentAttrs, addBase);
        
        if (node.additiveType === 'PONTO') {
            pontosLevel++;
            if (pontosLevel === 1) {
                events.push({
                    step: stepCount++,
                    title: `Ancoragem Local`,
                    description: `A magia se agarra ao ponto de conjuração (Alcance: Toque / Si mesmo).`,
                    type: 'TRAVEL'
                });
            } else if (pontosLevel === 2) {
                events.push({
                    step: stepCount++,
                    title: `Vetor de Movimento`,
                    description: `A massa mágica ganha impulso (Projétil linear / Movimento guiado).`,
                    type: 'TRAVEL'
                });
            } else if (pontosLevel === 3) {
                events.push({
                    step: stepCount++,
                    title: `Expansão Volumétrica`,
                    description: `A magia se torna uma Área de Efeito ao atingir seu destino.`,
                    type: 'IMPACT'
                });
            }
        } else if (node.additiveType === 'MANTER') {
            hasManter++;
        } else {
            events.push({
                step: stepCount++,
                title: `Modificador: ${node.additiveType}`,
                description: `Transmuta propriedades arcanas da manifestação em fluxo.`,
                type: 'MODIFIER'
            });
        }
      }
    }

    if (hasManter > 0) {
        events.push({
            step: stepCount++,
            title: `Sustentação Arcana`,
            description: `O feitiço persistirá ao longo do tempo (Duração ou Concentração).`,
            type: 'AURA'
        });
    }

    // Cálculos D&D finais
    let damageBase = currentAttrs.damageType || 'Energia Pura';
    const mainDamageAttr = (currentAttrs.entropy || 0) + (currentAttrs.strength || 0) + (currentAttrs.volume || 0) + (currentAttrs.order || 0) + (currentAttrs.chaos || 0);
    const numDice = Math.max(1, Math.floor(mainDamageAttr / 2));
    const bonus = currentAttrs.potency > 0 ? `+${currentAttrs.potency * 2}` : '';
    
    // Caso faltem componentes para o dano, ou se for algo de cura:
    if (currentAttrs.healing) {
        events.push({
            step: stepCount++,
            title: `Harmonização Vital`,
            description: `Restaura a forma física. Cura estimada: ${Math.floor(numDice/2)}d8${bonus}.`,
            type: 'IMPACT',
            dice: `${Math.floor(numDice/2)}d8${bonus}`,
            element
        });
    } else {
        events.push({
            step: stepCount++,
            title: `Resolução do Efeito`,
            description: `A malha colapsa, forçando a resolução física. Impacto causa dano base de ${numDice}d6${bonus} de ${damageBase}.`,
            type: 'IMPACT',
            dice: `${numDice}d6${bonus}`,
            element
        });
    }

    // Formatando o D&D text output
    let description = `**Manifestação Semântica Resolvida**\n\n`;
    description += `*Ordem de Execução do Buffer Mágico Mapeada:*\n\n`;
    
    for (const step of events) {
        description += `**Step [${step.step}]: ${step.title}**\n`;
        description += `*${step.description}*\n`;
        if (step.dice) description += `> Resolução de Colisão: **${step.dice}**\n`;
        description += `\n`;
    }

    let rangeStr = 'Toque';
    if (pontosLevel >= 3) rangeStr = 'Área de Efeito';
    else if (pontosLevel === 2) rangeStr = 'Projétil';
    else if (pontosLevel === 1) rangeStr = 'Toque / Curta Distância';

    const level = 1 + Math.floor((currentAttrs.complexity || 0) / 3);
    const dc = 10 + Math.floor(level / 2) + Math.floor((currentAttrs.potency || 0) / 2);

    let durationStr = 'Instantânea';
    if (hasManter > 0) {
        durationStr = 'Concentração / Contínua';
    }

    return {
      description,
      attrs: currentAttrs,
      instabilities: semanticErrors,
      logs: events,
      element,
      needsDC: dc > 10,
      rangeStr,
      level,
      dc,
      durationStr
    };
  }

  private static mergeAttrs(a: any, b: any) {
    const res = { ...a };
    for (const key in b) {
        if (typeof b[key] === 'number') res[key] = (res[key] || 0) + b[key];
        else if (Array.isArray(b[key])) res[key] = [...new Set([...(res[key]||[]), ...b[key]])];
        else res[key] = b[key];
    }
    return res;
  }
}
