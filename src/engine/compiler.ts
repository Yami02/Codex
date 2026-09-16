import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, CoreElement, AdditiveType } from '../types/magic';
import {
  NodeAttributesDict,
  PONTO_LEVELS, PONTO_LEVEL_MAX, PONTO_COUNT_TO_TIER,
  MANTER_LEVELS, MANTER_LEVEL_MIN, MANTER_LEVEL_MAX,
  FORMA_LEVELS, FORMA_LEVEL_MIN, FORMA_LEVEL_MAX,
  MOVER_LEVELS, MOVER_LEVEL_MIN, MOVER_LEVEL_MAX,
  PERCEBER_LEVELS, PERCEBER_LEVEL_MIN, PERCEBER_LEVEL_MAX,
  GATILHO_LEVELS, GATILHO_LEVEL_MIN, GATILHO_LEVEL_MAX,
  TRIGGER_TYPES, DEFAULT_TRIGGER_TYPE,
  KERNEL_SCALE_AXIS,
  AdditiveDescriptions,
  MANIFESTACAO_TABLE,
  MANA_NIVEL_MAX, MANA_POR_NIVEL,
  ABSORCAO_MISALIGNED_COMPLEXITY_PER_LEVEL,
} from './constants';
import { resolveCollege, polaritySymmetryDelta } from './colleges';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

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
  // `level` carrega a intensidade explícita do aditivo (PONTO 1-3, MANTER 0-4).
  // Um único nó basta: não é mais preciso empilhar cópias para escalar o efeito.
  // `fusionElement` é usado só pelo aditivo FUSAO (ver engine/colleges.ts).
  // `triggerType` é usado só pelo aditivo GATILHO (Capacitor).
  constructor(id: string, public additiveType: string, public level?: number, public fusionElement?: string, public triggerType?: string) { super(id); }
  accept(visitor: ASTVisitor) { visitor.visitAdditive(this); }
}

export class KernelASTNode extends ASTNode {
  // `level` (1-5) escala proporcionalmente a contribuição do Kernel ao
  // buffer — ver KERNEL_INTENSITY_LEVELS em engine/constants.ts.
  // `sourceElement` é usado só pelo Kernel de Absorção (ver
  // "ABSORÇÃO AMBIENTAL / NÍVEL 0" em engine/constants.ts).
  constructor(id: string, public kernelType: string, public subGraph: ASTGraph, public level?: number, public sourceElement?: string) { super(id); }
  accept(visitor: ASTVisitor) { visitor.visitKernel(this); }
}

export interface FlatEdge { sourceId: string; targetId: string; type: string; }

export class ASTGraph {
  public nodes: ASTNode[] = [];
  public adjacency: Map<string, string[]> = new Map(); // child -> parents (dependencies)
  public forwardAdjacency: Map<string, string[]> = new Map(); // parent -> children
  // Conectivos (EdgeType) preservados por aresta — antes eram descartados no
  // parser e nunca lidos pelo compilador (puramente decorativos). Agora
  // PatternMatcher lê `type` pra aplicar regras reais (ver §10 do
  // docs/COMO_FUNCIONA.md).
  public edges: FlatEdge[] = [];

  public addNode(node: ASTNode) {
    this.nodes.push(node);
    if (!this.adjacency.has(node.id)) this.adjacency.set(node.id, []);
    if (!this.forwardAdjacency.has(node.id)) this.forwardAdjacency.set(node.id, []);
  }

  public addEdge(sourceId: string, targetId: string, type: string = 'AND') {
    // sourceId -> targetId indicates target depends on source.
    if (this.adjacency.has(targetId)) {
      this.adjacency.get(targetId)!.push(sourceId);
    }
    if (this.forwardAdjacency.has(sourceId)) {
      this.forwardAdjacency.get(sourceId)!.push(targetId);
    }
    this.edges.push({ sourceId, targetId, type });
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
        ast.addNode(new AdditiveASTNode(n.id, n.additiveType || n.name, n.level, n.fusionElement, n.triggerType));
      } else if (n.type === NodeType.KERNEL || n.type === NodeType.SUBCIRCLE) {
        const subAst = n.magicGraph ? this.build(n.magicGraph) : new ASTGraph();
        ast.addNode(new KernelASTNode(n.id, n.additiveType || n.element || n.name || 'SUBCIRCLE', subAst, n.level, n.sourceElement));
      }
    }

    for (const e of graph.edges) {
      ast.addEdge(e.sourceId, e.targetId, e.type || 'AND');
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

    // if (this.hasCycle(ast)) {
    //   errors.push("Paradoxo Temporal: O feitiço descreve um loop infinito (dependências circulares). Executar causaria um buraco negro semântico.");
    // }

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

// 5. Reconhecedor de Padrões Topológicos (Graph Pattern Matcher)
//
// O trabalho deste estágio é puramente de SELEÇÃO: decidir, a partir da
// topologia do grafo, qual nível está ativo em cada aditivo "de modo"
// (PONTO/MANTER/FORMA/MOVER/PERCEBER) e se TESTE está presente. Esses
// níveis não são somados como o resto do buffer — são seletores discretos
// (qual das 3-5 variantes está ativa), então continuam sendo resolvidos
// aqui por nó, não pela álgebra do buffer. Depois de resolvidos, o motor
// (seção 7) os dobra para dentro do mesmo buffer numérico que os atributos
// físicos (entropia, luminância...), para que toda fórmula posterior leia
// de um único vetor.
export class PatternMatcher {
  public static flattenNodes(ast: ASTGraph): ASTNode[] {
      let nodes: ASTNode[] = [];
      for (const node of ast.nodes) {
         nodes.push(node);
         if (node instanceof KernelASTNode && node.subGraph) {
             nodes = nodes.concat(this.flattenNodes(node.subGraph));
         }
      }
      return nodes;
  }

  // Mesma ideia de flattenNodes, mas para arestas: um Kernel guarda seu
  // próprio subgrafo (com suas próprias arestas), então os conectivos só
  // ficam visíveis pro resto do compilador depois de achatados.
  public static flattenEdges(ast: ASTGraph): FlatEdge[] {
      let edges: FlatEdge[] = [...ast.edges];
      for (const node of ast.nodes) {
          if (node instanceof KernelASTNode && node.subGraph) {
              edges = edges.concat(this.flattenEdges(node.subGraph));
          }
      }
      return edges;
  }

  // Existe uma aresta do tipo `type` ligando dois nós quaisquer dentro do
  // conjunto `ids` (em qualquer direção)? Usado pra detectar quando um
  // grupo de nós do mesmo aditivo (ex: dois Forma) foi deliberadamente
  // ligado por OR/XOR em vez de simplesmente duplicado por engano.
  private static isLinkedByType(ids: string[], type: string, edges: FlatEdge[]): boolean {
      const idSet = new Set(ids);
      return edges.some(e => e.type === type && idSet.has(e.sourceId) && idSet.has(e.targetId));
  }

  // O conjunto `ids` forma uma figura FECHADA (um ciclo simples passando
  // por todos eles — triângulo pra 3 nós, quadrado pra 4)? Conta as
  // arestas entre os próprios membros do grupo (qualquer tipo, sem
  // direção) e exige exatamente `ids.length` arestas com cada nó tocando
  // exatamente 2 delas — a única forma de um grafo simples com N nós ficar
  // "2-regular" é ser um único ciclo de comprimento N. Usado pelo Ponto
  // (§5 do docs/COMO_FUNCIONA.md): 3 Pontos só valem como Projétil se
  // estiverem de fato ligados em triângulo, não só soltos no círculo.
  private static formsClosedPolygon(ids: string[], edges: FlatEdge[]): boolean {
      if (ids.length <= 1) return true;
      const idSet = new Set(ids);
      const relevant = edges.filter(e => e.sourceId !== e.targetId && idSet.has(e.sourceId) && idSet.has(e.targetId));
      if (relevant.length !== ids.length) return false;
      const degree = new Map<string, number>(ids.map(id => [id, 0]));
      for (const e of relevant) {
          degree.set(e.sourceId, (degree.get(e.sourceId) || 0) + 1);
          degree.set(e.targetId, (degree.get(e.targetId) || 0) + 1);
      }
      return ids.every(id => degree.get(id) === 2);
  }

  // Quais nós são alcançáveis a partir do Núcleo, andando pelas arestas
  // (em qualquer direção)? "De dentro pra fora": um compilador de verdade
  // resolve a figura a partir da raiz (o Núcleo), não filtrando o grafo
  // inteiro às cegas — um Ponto solto, sem nenhum caminho até o Núcleo,
  // não faz parte da magia.
  private static reachableFromCore(ast: ASTGraph, flatEdges: FlatEdge[]): Set<string> {
      const core = ast.nodes.find(n => n instanceof CoreASTNode);
      if (!core) return new Set();
      const neighbors = new Map<string, string[]>();
      const link = (a: string, b: string) => {
          if (!neighbors.has(a)) neighbors.set(a, []);
          neighbors.get(a)!.push(b);
      };
      for (const e of flatEdges) { link(e.sourceId, e.targetId); link(e.targetId, e.sourceId); }
      const visited = new Set<string>([core.id]);
      const queue = [core.id];
      while (queue.length > 0) {
          const cur = queue.shift()!;
          for (const next of (neighbors.get(cur) || [])) {
              if (!visited.has(next)) { visited.add(next); queue.push(next); }
          }
      }
      return visited;
  }

  // Resolve um grupo de nós do mesmo aditivo "de nível" (Ponto, Manter,
  // Forma, Mover, Perceber, Gatilho). Sem nenhum conectivo especial entre
  // eles, o comportamento é o de sempre: nível mais alto vence, avisado
  // como [REDUNDÂNCIA] (provável engano). Ligados por OR, viram uma escolha
  // real oferecida ao conjurador (ficha usa o pior caso). Ligados por XOR,
  // viram variantes excludentes (ficha usa a primeira como padrão descrito).
  private static resolveLeveledGroup(
      nodes: AdditiveASTNode[],
      levelBoost: Map<string, number>,
      min: number,
      defaultLevel: number,
      max: number,
      nameFn: (level: number) => string,
      slotLabel: string,
      flatEdges: FlatEdge[],
      instabilities: string[]
  ): number {
      if (nodes.length === 0) return 0;
      const levels = nodes.map(n => clamp((n.level ?? defaultLevel) + (levelBoost.get(n.id) || 0), min, max));
      nodes.forEach((n, i) => {
          const boost = levelBoost.get(n.id) || 0;
          if (boost !== 0) {
              instabilities.push(`[CANALIZAÇÃO] ${slotLabel} de "${n.id}" ajustado por Atribuição (${boost > 0 ? '+' : ''}${boost} nível) → nível final ${levels[i]}.`);
          }
      });
      if (nodes.length === 1) return levels[0];

      const ids = nodes.map(n => n.id);
      const names = levels.map(nameFn);
      if (this.isLinkedByType(ids, 'XOR', flatEdges)) {
          instabilities.push(`[ESCOLHA XOR] ${slotLabel} tem variantes excludentes: ${names.join(' ou ')}. A ficha descreve "${names[0]}" como padrão; o conjurador escolhe uma das opções ao lançar, nunca as duas ao mesmo tempo.`);
          return levels[0];
      }
      if (this.isLinkedByType(ids, 'OR', flatEdges)) {
          const maxLevel = Math.max(...levels);
          instabilities.push(`[ESCOLHA] ${slotLabel} oferece variantes ao conjurador: ${names.join(' ou ')}. A ficha usa o pior caso (${nameFn(maxLevel)}) para nível/CD.`);
          return maxLevel;
      }
      const maxLevel = Math.max(...levels);
      instabilities.push(`[REDUNDÂNCIA] ${nodes.length} nós de ${slotLabel} detectados; apenas o de maior nível (${nameFn(maxLevel)}) foi considerado. Use um único nó, ou ligue-os com uma aresta OR/XOR para uma escolha real.`);
      return maxLevel;
  }

  private static checkCycleFlat(ast: ASTGraph, subset: ASTNode[], length: number): boolean {
       let subsetIds = new Set(subset.map(n => n.id));
       let edgesCount = 0;

       const countEdges = (g: ASTGraph) => {
           g.nodes.forEach(n => {
              let fwd = g.forwardAdjacency.get(n.id) || [];
              edgesCount += fwd.filter(d => subsetIds.has(d)).length;
           });
           g.nodes.forEach(n => {
              if (n instanceof KernelASTNode && n.subGraph) countEdges(n.subGraph);
           });
       };
       countEdges(ast);
       return edgesCount >= length;
  }

  public static matchAndTransform(ast: ASTGraph) {
      const logs: ActionBufferItem[] = [];
      const instabilities: string[] = [];

      const allNodes = this.flattenNodes(ast);
      // Conectivos: arestas achatadas (incluindo as de dentro de Kernels) e
      // um índice id -> nó, pra que as regras abaixo consigam olhar quem
      // está ligado a quem, e com qual tipo de aresta.
      const flatEdges = this.flattenEdges(ast);
      const nodeById = new Map(allNodes.map(n => [n.id, n]));

      // --- ATRIBUIÇÃO (canalização): uma aresta ATRIBUICAO de um nó de
      // Aumento/Redução pra um aditivo "de nível" (Manter/Forma/Mover/
      // Perceber/Gatilho) redireciona aquele modificador: em vez de
      // reforçar o buffer genericamente (potency/complexity), ele soma ou
      // subtrai 1 nível diretamente no aditivo de destino. `redirectedIds`
      // guarda quais nós de Aumento/Redução tiveram seu efeito genérico
      // anulado porque foram canalizados (evita contar o bônus duas vezes).
      // Ponto NÃO entra mais nessa lista: desde que virou geométrico (figura
      // por contagem/forma, não um dial de nível — ver bloco de PONTO mais
      // abaixo), não há mais "nível" nenhum nele pra Atribuição reforçar.
      const leveledSlotTypes = new Set(['MANTER', 'FORMA', 'MOVER', 'PERCEBER', 'GATILHO']);
      const levelBoost = new Map<string, number>();
      const redirectedIds = new Set<string>();
      for (const e of flatEdges) {
          if (e.type !== 'ATRIBUICAO') continue;
          const src = nodeById.get(e.sourceId);
          const tgt = nodeById.get(e.targetId);
          const srcOk = src instanceof AdditiveASTNode && (src.additiveType === 'AUMENTO' || src.additiveType === 'REDUCAO');
          const tgtOk = tgt instanceof AdditiveASTNode && leveledSlotTypes.has(tgt.additiveType);
          if (srcOk && tgtOk) {
              const delta = (src as AdditiveASTNode).additiveType === 'AUMENTO' ? 1 : -1;
              levelBoost.set(tgt!.id, (levelBoost.get(tgt!.id) || 0) + delta);
              redirectedIds.add(src!.id);
          } else {
              instabilities.push(`[ATRIBUIÇÃO INVÁLIDA] Uma aresta de Atribuição precisa sair de Aumento/Redução e apontar para um aditivo de nível (Manter, Forma, Mover, Perceber ou Gatilho); a ligação entre "${e.sourceId}" e "${e.targetId}" foi ignorada.`);
          }
      }

      // --- FUSAO: funde um segundo elemento/polaridade ao Núcleo sem
      // exigir um segundo nó de Núcleo (que o validador semântico rejeita
      // como "Colapso Dimensional"). Isso é o que torna as combinações
      // abaixo (Fogo+Terra=Metal, Luz+Compor=Vida/Cura...) alcançáveis de
      // verdade — antes, só existiam na teoria. Ver engine/colleges.ts.
      const fusaoNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'FUSAO');
      let fusionElement: string | null = null;
      if (fusaoNodes.length > 0) {
          fusionElement = fusaoNodes[0].fusionElement || null;
          if (fusaoNodes.length > 1) {
              const ids = fusaoNodes.map(n => n.id);
              const names = fusaoNodes.map(n => n.fusionElement || '???');
              if (this.isLinkedByType(ids, 'XOR', flatEdges)) {
                  instabilities.push(`[ESCOLHA XOR] Fusão tem variantes excludentes: ${names.join(' ou ')}. O Colégio descrito na ficha usa "${fusionElement}"; o conjurador escolhe uma fusão por vez, nunca as duas.`);
              } else if (this.isLinkedByType(ids, 'OR', flatEdges)) {
                  instabilities.push(`[ESCOLHA] Fusão oferece variantes ao conjurador: ${names.join(' ou ')}. O Colégio descrito na ficha usa "${fusionElement}".`);
              } else {
                  instabilities.push(`[REDUNDÂNCIA] ${fusaoNodes.length} nós de FUSAO detectados; apenas o primeiro (${fusionElement}) foi considerado. Use um único nó de FUSAO, ou ligue-os com OR/XOR para uma escolha real.`);
              }
          }
      }
      const primaryElement = (ast.nodes.find(n => n instanceof CoreASTNode) as CoreASTNode | undefined)?.element || null;

      let hasElement = (e: string) => allNodes.some(n => (n instanceof CoreASTNode && n.element === e) || (n instanceof KernelASTNode && n.kernelType === e));
      let hasAdditive = (a: string) => allNodes.some(n => (n instanceof AdditiveASTNode && n.additiveType === a));

      let elements = new Set(allNodes.filter(n => n instanceof CoreASTNode).map(n => (n as CoreASTNode).element));
      let compor = hasElement('COMPOR') || hasAdditive('COMPOR') || fusionElement === 'COMPOR';
      let decompor = hasElement('DECOMPOR') || hasAdditive('DECOMPOR') || fusionElement === 'DECOMPOR';
      let fogo = hasElement('FOGO') || fusionElement === 'FOGO';
      let terra = hasElement('TERRA') || fusionElement === 'TERRA';
      let agua = hasElement('ÁGUA') || hasElement('AGUA') || fusionElement === 'AGUA';
      let ar = hasElement('AR') || fusionElement === 'AR';
      let luz = hasElement('LUZ') || fusionElement === 'LUZ';
      let sombra = hasElement('SOMBRA') || fusionElement === 'SOMBRA';

      let finalElement = 'Desconhecido';

      if (fogo && terra && compor) finalElement = 'METAL';
      else if (fogo && terra && decompor) finalElement = 'LAVA';
      else if (fogo && ar && compor) finalElement = 'ELETRICIDADE';
      else if (fogo && ar && decompor) finalElement = 'COMBUSTÃO';
      else if (agua && terra && compor) finalElement = 'MADEIRA';
      else if (agua && terra && decompor) finalElement = 'VENENO';
      else if (agua && ar) finalElement = 'NUVEM';
      else if (luz && decompor && sombra) finalElement = 'ILUSÃO';
      else if (luz && decompor && compor) finalElement = 'CONTRAMÁGICA';
      else if (luz && compor) finalElement = 'VIDA/CURA';
      else if (sombra && decompor) finalElement = 'MORTE/DRENAR';
      else if (sombra && compor) finalElement = 'MALDIÇÃO';
      else if (elements.size > 0) finalElement = Array.from(elements)[0] as string;

      if (finalElement !== 'Desconhecido' && finalElement !== Array.from(elements)[0]) {
          logs.push({
              step: 0,
              title: `Síntese Elemental: ${finalElement}`,
              description: `Conexões lógicas transmutaram os elementos base na estrutura geométrica de ${finalElement}.`,
              type: 'MODIFIER',
              element: finalElement
          });
      }

      // --- PONTO (alcance/geometria): resolvido "de dentro pra fora" ---
      // Não é mais um dial de intensidade (nível 1-3 num nó só) — é
      // geométrico de verdade: a quantidade de nós de Ponto alcançáveis a
      // partir do Núcleo, e se eles estão de fato DESENHADOS formando a
      // figura certa (arestas fechando um triângulo/quadrado entre eles,
      // não só soltos). 1 Ponto sozinho = Toque; 3 em triângulo = Projétil;
      // 4 em quadrado = Aura. Ver PONTO_LEVELS/PONTO_COUNT_TO_TIER e
      // `formsClosedPolygon`/`reachableFromCore` acima.
      const reachableIds = this.reachableFromCore(ast, flatEdges);
      const allPontoNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'PONTO');
      const pontoNodes = allPontoNodes.filter(n => reachableIds.has(n.id));
      if (pontoNodes.length !== allPontoNodes.length) {
          instabilities.push(`[PONTO DESCONECTADO] ${allPontoNodes.length - pontoNodes.length} nó(s) de Ponto não têm nenhum caminho até o Núcleo e foram ignorados na leitura da figura.`);
      }
      const pontoCount = pontoNodes.length;
      const pontoTier = PONTO_COUNT_TO_TIER[pontoCount];
      let pontoLevel = 0;
      if (pontoCount === 0) {
          pontoLevel = 0;
      } else if (!pontoTier) {
          instabilities.push(`[GEOMETRIA INVÁLIDA] ${pontoCount} nó(s) de Ponto não correspondem a nenhuma figura reconhecida — use 1 (Ponto = Toque), 3 ligados em Triângulo (Projétil) ou 4 ligados em Quadrado (Aura).`);
      } else if (pontoCount > 1 && !this.formsClosedPolygon(pontoNodes.map(n => n.id), flatEdges)) {
          const shapeName = PONTO_LEVELS[pontoTier].shapeName;
          instabilities.push(`[GEOMETRIA INVÁLIDA] ${pontoCount} nós de Ponto encontrados, mas não estão ligados entre si formando um ${shapeName} — conecte cada um aos outros ${pontoCount - 1} pra fechar a figura.`);
      } else {
          pontoLevel = pontoTier;
      }

      // --- MANTER (duração): nível explícito no próprio nó ---
      const manterNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'MANTER');
      const manterLevel = this.resolveLeveledGroup(manterNodes, levelBoost, MANTER_LEVEL_MIN, 1, MANTER_LEVEL_MAX, l => MANTER_LEVELS[l].name, 'Manter', flatEdges, instabilities);

      // --- FORMA (geometria): aditivo opcional que só refina uma Aura
      // (PONTO 3 -> Cone/Linha) ou um Alcance (PONTO 2 -> Esfera Remota).
      // Não é mais um "nível de força" — é uma escolha entre 3 variantes.
      const formaNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'FORMA');
      let formaLevel = this.resolveLeveledGroup(formaNodes, levelBoost, FORMA_LEVEL_MIN, FORMA_LEVEL_MIN, FORMA_LEVEL_MAX, l => FORMA_LEVELS[l].name, 'Forma', flatEdges, instabilities);
      if (formaLevel > 0) {
          const formaInfo = FORMA_LEVELS[formaLevel];
          if (formaInfo.appliesToPontoLevel !== pontoLevel) {
              const requiredShape = PONTO_LEVELS[formaInfo.appliesToPontoLevel]?.shapeName || '?';
              const currentShape = pontoLevel > 0 ? PONTO_LEVELS[pontoLevel]?.shapeName : 'nenhuma figura';
              instabilities.push(`[FORMA SEM EFEITO] "${formaInfo.name}" só se aplica com Ponto em ${requiredShape} (${PONTO_LEVELS[formaInfo.appliesToPontoLevel]?.name}); a figura atual é ${currentShape}, então ela é ignorada.`);
              formaLevel = 0;
          }
      }

      // --- MOVER / PERCEBER (modo): aditivos que substituem dano/cura por
      // deslocamento ou informação. Por padrão são mutuamente exclusivos —
      // mas uma aresta XOR explícita entre eles vira uma magia "versátil"
      // intencional (dois modos, o conjurador escolhe um por lançamento),
      // em vez de um erro de design silenciosamente resolvido.
      const moverNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'MOVER');
      const moverLevel = this.resolveLeveledGroup(moverNodes, levelBoost, MOVER_LEVEL_MIN, MOVER_LEVEL_MIN, MOVER_LEVEL_MAX, l => MOVER_LEVELS[l].name, 'Mover', flatEdges, instabilities);

      const perceberNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'PERCEBER');
      let perceberLevel = this.resolveLeveledGroup(perceberNodes, levelBoost, PERCEBER_LEVEL_MIN, PERCEBER_LEVEL_MIN, PERCEBER_LEVEL_MAX, l => PERCEBER_LEVELS[l].name, 'Perceber', flatEdges, instabilities);

      let altPerceberInfo: { level: number; name: string; detail: string } | null = null;
      if (moverLevel > 0 && perceberLevel > 0) {
          const linkedIds = [...moverNodes.map(n => n.id), ...perceberNodes.map(n => n.id)];
          if (this.isLinkedByType(linkedIds, 'XOR', flatEdges)) {
              instabilities.push(`[VERSÁTIL XOR] Mover e Perceber estão ligados por uma aresta de exclusão mútua: a magia oferece os dois modos, mas o conjurador escolhe apenas um por lançamento. A ficha detalha o modo Mover; Perceber (nível ${perceberLevel}) fica registrado como modo alternativo.`);
              altPerceberInfo = PERCEBER_LEVELS[perceberLevel];
          } else {
              instabilities.push(`[MODOS CONFLITANTES] Mover e Perceber não podem atuar juntos na mesma magia; apenas Mover foi aplicado. Ligue-os com uma aresta XOR se a intenção for um modo alternável.`);
          }
          perceberLevel = 0;
      }
      if ((moverLevel > 0 || perceberLevel > 0) && formaLevel > 0) {
          instabilities.push(`[FORMA SEM EFEITO] Forma não se aplica a magias de Mover ou Perceber.`);
          formaLevel = 0;
      }

      // --- GATILHO (Capacitor): guarda a magia num glifo em vez de gastá-la
      // na hora. O nível é quantas cargas (turnos/conjuradores) o capacitor
      // precisa; cada carga soma potência/complexidade ao feitiço final —
      // ver GATILHO_LEVELS em engine/constants.ts.
      const gatilhoNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'GATILHO');
      const gatilhoLevel = this.resolveLeveledGroup(gatilhoNodes, levelBoost, GATILHO_LEVEL_MIN, GATILHO_LEVEL_MIN, GATILHO_LEVEL_MAX, l => GATILHO_LEVELS[l].name, 'Gatilho', flatEdges, instabilities);
      let triggerType = DEFAULT_TRIGGER_TYPE;
      if (gatilhoNodes.length > 0) {
          triggerType = gatilhoNodes[0].triggerType && TRIGGER_TYPES[gatilhoNodes[0].triggerType] ? gatilhoNodes[0].triggerType : DEFAULT_TRIGGER_TYPE;
      }

      // --- TESTE: aditivo binário (sem nível) que troca a jogada de ataque
      // por um teste de resistência do alvo em PONTO 1 (Toque) ou 2
      // (Alcance) — o alcance da magia não deveria decidir sozinho se ela é
      // um ataque ou um teste; isso depende da magia, não da distância.
      const hasTeste = allNodes.some(n => n instanceof AdditiveASTNode && n.additiveType === 'TESTE');
      if (hasTeste && (moverLevel > 0 || perceberLevel > 0)) {
          instabilities.push(`[TESTE SEM EFEITO] Teste não se aplica a magias de Mover ou Perceber, que não têm ataque nem teste.`);
      }

      // --- SE_ENTAO (condicional): só é válida saindo de um nó com um
      // resultado incerto em jogo — Teste (o alvo pode passar ou falhar) ou
      // Gatilho (o gatilho pode disparar ou não). O nó de destino passa a
      // ser descrito como um efeito condicionado, não sempre ativo — ver
      // `conditionalEffects` no retorno e o texto gerado em
      // MagicCompilerEngine.execute.
      const conditionalEffects: { targetId: string; conditionLabel: string; targetLabel: string }[] = [];
      for (const e of flatEdges) {
          if (e.type !== 'SE_ENTAO') continue;
          const src = nodeById.get(e.sourceId);
          const tgt = nodeById.get(e.targetId);
          const isTesteSrc = src instanceof AdditiveASTNode && src.additiveType === 'TESTE';
          const isGatilhoSrc = src instanceof AdditiveASTNode && src.additiveType === 'GATILHO';
          if (!tgt || (!isTesteSrc && !isGatilhoSrc)) {
              instabilities.push(`[CONDIÇÃO INVÁLIDA] SE_ENTÃO precisa sair de um nó de Teste ou Gatilho; a aresta a partir de "${e.sourceId}" foi ignorada.`);
              continue;
          }
          let targetLabel = e.targetId;
          if (tgt instanceof AdditiveASTNode) targetLabel = AdditiveDescriptions[tgt.additiveType] || tgt.additiveType;
          else if (tgt instanceof KernelASTNode) targetLabel = AdditiveDescriptions[tgt.kernelType] || tgt.kernelType;
          conditionalEffects.push({ targetId: e.targetId, conditionLabel: isTesteSrc ? 'o alvo falhar no teste de resistência' : 'o gatilho disparar', targetLabel });
      }

      // --- CORRENTE (cadeia): uma sequência de nós ligados por arestas
      // CORRENTE representa o efeito saltando de alvo em alvo. `chainHops`
      // é o comprimento da maior cadeia encontrada — cada salto além do
      // primeiro soma complexidade (mais alvos para gerenciar) e vira uma
      // cláusula extra no texto final.
      const correnteEdges = flatEdges.filter(e => e.type === 'CORRENTE');
      let chainHops = 0;
      if (correnteEdges.length > 0) {
          const adj = new Map<string, string[]>();
          for (const e of correnteEdges) {
              if (!adj.has(e.sourceId)) adj.set(e.sourceId, []);
              adj.get(e.sourceId)!.push(e.targetId);
          }
          const memo = new Map<string, number>();
          const visiting = new Set<string>();
          let hasCycle = false;
          const longestFrom = (id: string): number => {
              if (memo.has(id)) return memo.get(id)!;
              if (visiting.has(id)) { hasCycle = true; return 0; }
              visiting.add(id);
              let best = 0;
              for (const child of (adj.get(id) || [])) best = Math.max(best, 1 + longestFrom(child));
              visiting.delete(id);
              memo.set(id, best);
              return best;
          };
          const allChainIds = new Set(correnteEdges.flatMap(e => [e.sourceId, e.targetId]));
          for (const id of allChainIds) chainHops = Math.max(chainHops, longestFrom(id));
          if (hasCycle) {
              instabilities.push(`[CORRENTE CÍCLICA] A cadeia de arestas CORRENTE forma um loop; o comprimento foi truncado para evitar um salto infinito.`);
          }
      }

      // Nota: o antigo "Alerta do Triângulo Base" (exigia 3+ nós no total)
      // foi removido. Ele vinha da era em que PONTO/MANTER eram contados em
      // cópias empilhadas e um "triângulo" geométrico era necessário para
      // formar uma topologia válida. Hoje um único nó de PONTO já é uma
      // magia completa e legítima (Fire Bolt é literalmente Núcleo+Ponto),
      // então aquele alerta apenas marcava toda magia simples como instável
      // sem motivo real.

      const kernelsAtivosNodes = allNodes.filter(n => n instanceof KernelASTNode) as KernelASTNode[];
      const kernelsAtivos = kernelsAtivosNodes.length;
      const mainKernel = kernelsAtivos > 0 ? kernelsAtivosNodes[0].kernelType : null;

      // --- LEI DO COMBO DE KERNELS: escalar um único Kernel (nível > 1)
      // já é proporcional (ver KERNEL_INTENSITY_LEVELS). Escalar DOIS OU
      // MAIS ao mesmo tempo soma uma sobretaxa de complexidade — o excesso
      // total de níveis multiplicado por (quantos eixos - 1), pra crescer
      // com o número de eixos combinados, não só com o quanto cada um
      // subiu. Ex: dois Kernels a +2 níveis cada custam mais que a soma
      // dos dois isolados; três custam ainda mais que isso.
      const scaledKernels = kernelsAtivosNodes.filter(k => (k.level ?? 1) > 1);
      let kernelComboPenalty = 0;
      if (scaledKernels.length >= 2) {
          const totalExcess = scaledKernels.reduce((sum, k) => sum + ((k.level ?? 1) - 1), 0);
          kernelComboPenalty = totalExcess * (scaledKernels.length - 1);
          instabilities.push(`[COMBO DE KERNELS] ${scaledKernels.length} eixos escalados juntos (${scaledKernels.map(k => k.kernelType).join(', ')}); combiná-los soma +${kernelComboPenalty} de complexidade além do custo normal de cada um.`);
      }

      // --- ABSORÇÃO AMBIENTAL / "NÍVEL 0": um Kernel de Absorção não gera
      // energia do zero — capta um elemento ambiente/externo (sourceElement)
      // pra dentro de um glifo. A favor do próprio Núcleo (mesmo elemento),
      // é Nível 0: a captação não soma custo de mana. Contra o Núcleo
      // (elemento diferente), é cara: soma complexidade proporcional ao
      // nível do Kernel. Ver ABSORCAO_MISALIGNED_COMPLEXITY_PER_LEVEL e o
      // comentário completo em engine/constants.ts.
      const absorcaoNodes = kernelsAtivosNodes.filter(k => k.kernelType === 'ABSORCAO');
      let absorcaoSourceElement: string | null = null;
      let absorcaoAligned = false;
      let absorcaoLevel = 0;
      if (absorcaoNodes.length > 0) {
          absorcaoSourceElement = absorcaoNodes[0].sourceElement || null;
          absorcaoLevel = absorcaoNodes[0].level ?? 1;
          if (!absorcaoSourceElement) {
              instabilities.push(`[ABSORÇÃO SEM FONTE] O Kernel de Absorção precisa de um elemento ambiente escolhido para captar; sem isso, ele fica inerte.`);
          } else if (!primaryElement) {
              instabilities.push(`[ABSORÇÃO SEM NÚCLEO] Sem um Núcleo próprio, não há "o que é seu" pra comparar com a energia captada (${absorcaoSourceElement}) — a Absorção não pode ser avaliada como a favor ou contra o ambiente.`);
          } else {
              absorcaoAligned = absorcaoSourceElement === primaryElement;
              if (absorcaoAligned) {
                  instabilities.push(`[ABSORÇÃO A FAVOR / NÍVEL 0] A energia captada (${absorcaoSourceElement}) já é da mesma natureza do seu Núcleo — você só está canalizando o que já está no ambiente. A captação não soma custo de mana.`);
              } else {
                  instabilities.push(`[ABSORÇÃO CONTRA O AMBIENTE] A energia captada (${absorcaoSourceElement}) é estranha ao seu Núcleo (${primaryElement}) — canalizar contra a natureza do ambiente é caro: +${absorcaoLevel * ABSORCAO_MISALIGNED_COMPLEXITY_PER_LEVEL} de complexidade.`);
              }
          }
          if (absorcaoNodes.length > 1) {
              instabilities.push(`[REDUNDÂNCIA] ${absorcaoNodes.length} Kernels de Absorção detectados; apenas o primeiro (${absorcaoSourceElement || '???'}) foi considerado.`);
          }
      }
      // Conecta com o Capacitor (§7): quando os dois existem juntos, a
      // Absorção alimenta o glifo com energia ambiente/de evento em vez de
      // turnos de conjuração.
      const absorcaoChargesCapacitor = absorcaoNodes.length > 0 && gatilhoNodes.length > 0;

      return {
          finalElement,
          fusionElement,
          primaryElement,
          pontoLevel,
          manterLevel,
          formaLevel,
          moverLevel,
          perceberLevel,
          altPerceberInfo,
          gatilhoLevel,
          triggerType,
          hasTeste,
          redirectedIds,
          conditionalEffects,
          chainHops,
          pontosLength: pontoNodes.length,
          totalComponents: allNodes.length,
          kernelsAtivos,
          mainKernel,
          kernelComboPenalty,
          absorcaoActive: absorcaoNodes.length > 0,
          absorcaoSourceElement,
          absorcaoAligned,
          absorcaoLevel,
          absorcaoChargesCapacitor,
          transmutationLogs: logs,
          topologicalInstabilities: instabilities
      };
  }
}

// 6. Álgebra do Buffer
//
// SpellBuffer é o único vetor numérico do compilador: cada Núcleo, Aditivo
// e Kernel contribui para ele por SOMA (ver NodeAttributesDict + mergeAttrs
// abaixo) — nunca por multiplicação, então dois FOGOs equivalentes sempre
// somam, nunca compõem exponencialmente. Os seletores de PONTO/MANTER/
// FORMA/MOVER/PERCEBER/TESTE (resolvidos por nó no PatternMatcher, porque
// são "qual variante" e não "quanto", então não fazem sentido somados) são
// dobrados para dentro deste mesmo vetor como mais alguns eixos
// (alcance/duracao/forma/mover/perceber/teste), para que TODA fórmula do
// motor leia de um único lugar em vez de misturar `currentAttrs.x` com
// variáveis soltas como `patterns.pontoLevel`.
//
// As funções abaixo são a "álgebra": cada uma é pura (buffer → número),
// nomeada pelo que calcula, e é a única responsável por aquele número no
// feitiço final. O texto mágico (mais abaixo, em MagicCompilerEngine) só
// LÊ esses números e o buffer para escolher entre um punhado de gabaritos
// de prosa — a álgebra decide "quanto", a prosa só veste "como soa".
export type SpellBuffer = Record<string, any>;

function mergeAttrs(a: SpellBuffer, b: SpellBuffer): SpellBuffer {
  const res = { ...a };
  for (const key in b) {
      if (typeof b[key] === 'number') res[key] = (res[key] || 0) + b[key];
      else if (Array.isArray(b[key])) res[key] = [...new Set([...(res[key] || []), ...b[key]])];
      else res[key] = b[key];
  }
  return res;
}

// Multiplica só os eixos numéricos de um conjunto de atributos por um
// fator — usado pela intensidade de Kernel (nível 1-5): nível 1 mantém o
// mesmo +1 de sempre (fator 1), nível 5 multiplica por 5. Condição/
// resistência (strings) e tags (arrays) não escalam, só os números.
function scaleAttrs(attrs: SpellBuffer, factor: number): SpellBuffer {
  const res: SpellBuffer = {};
  for (const key in attrs) {
      res[key] = typeof attrs[key] === 'number' ? attrs[key] * factor : attrs[key];
  }
  return res;
}

// magnitude = soma dos eixos "físicos" que dão peso a um efeito (entropia,
// força, volume, ordem). alcance/duração somam meio ponto de dado cada —
// um feitiço mais abrangente ou mais longo tende a carregar mais peso.
function computeDamageDice(buffer: SpellBuffer): number {
  const magnitude = (buffer.entropy || 0) + (buffer.strength || 0) + (buffer.volume || 0) + (buffer.order || 0);
  const numDice = Math.floor(magnitude / 2) + Math.floor((buffer.alcance || 0) / 2) + Math.floor((buffer.duracao || 0) / 2);
  return Math.max(1, numDice);
}

function computeSpellLevel(buffer: SpellBuffer, eventCount: number): number {
  return 1 + Math.floor((buffer.complexity || 0) / 3) + Math.floor(eventCount / 4);
}

function computeDC(level: number, buffer: SpellBuffer): number {
  return 10 + Math.floor(level / 2) + Math.floor((buffer.potency || 0) / 2);
}

// Custo em mana: cresce ao quadrado do nível (mesma curva não-linear do
// pool de mana por conjurador, ver MANA_POR_NIVEL) + potência/complexidade
// brutas do buffer — inclui automaticamente qualquer sobretaxa da Lei do
// Combo de Kernels, já que ela soma direto em `complexity`. Nível 1 custa
// pouco; nível 10 (o teto de progressão normal) custa uma fatia grande do
// pool daquele nível, não o pool inteiro — dá pra conjurar mais de uma vez.
function computeManaCost(level: number, buffer: SpellBuffer): number {
  return Math.max(1, level * level + Math.floor((buffer.potency || 0) / 2) + Math.floor((buffer.complexity || 0) / 2));
}

// Aura (alcance 3) é sempre teste; Alcance (2) + Esfera Remota (forma 3)
// também vira teste (a explosão atinge uma área, não um único alvo);
// TESTE liga isso explicitamente em Toque (1) ou Alcance (2). Mover/
// Perceber nunca pedem teste — não causam dano.
function resolveIsSaveBased(buffer: SpellBuffer, isMode: boolean): boolean {
  if (isMode) return false;
  if (buffer.alcance === 3) return true;
  if (buffer.alcance === 2 && buffer.forma === 3) return true;
  if (buffer.teste > 0 && (buffer.alcance === 1 || buffer.alcance === 2)) return true;
  return false;
}

// Determinismo (dano automático, sem CD/ataque) só no teto de PONTO (Aura),
// e só quando a malha está livre de instabilidades.
function resolveIsDeterministic(buffer: SpellBuffer, hasErrors: boolean): boolean {
  return buffer.alcance === PONTO_LEVEL_MAX && !hasErrors;
}

// 7. O Motor Principal do Compilador
export class MagicCompilerEngine {
  public static execute(graphObject: any) {
    if (!graphObject.nodes || graphObject.nodes.length === 0) {
      return null;
    }

    // 1. Parser JSON -> AST
    const astGraph = GraphToASTBuilder.build(graphObject);

    // 2. Validador Semântico
    const semanticErrors = SemanticValidator.validate(astGraph);

    // 3. Graph Pattern Matcher (Topologia e Transmutação)
    const patterns = PatternMatcher.matchAndTransform(astGraph);
    semanticErrors.push(...patterns.topologicalInstabilities);

    // Sem PONTO não é sinônimo de instável: uma magia Pessoal legítima
    // (ex: Escudo, uma aura permanente em você mesmo) não precisa de
    // alcance nenhum, desde que tenha algum outro componente (Manter,
    // Controle, Gatilho...). Só é de fato instável quando não sobrou nada
    // além do Núcleo sozinho — uma magia sem nenhum efeito definido.
    const isTrulyEmpty = patterns.pontoLevel === 0 && patterns.totalComponents <= 1;
    const isPersonalOnly = patterns.pontoLevel === 0 && patterns.totalComponents > 1;
    if (isTrulyEmpty) {
        semanticErrors.push("A energia manifesta-se de forma estática. Risco de Colapso iminente.");
    }

    // 4. Travessia (Resolução da Ordem de Avaliação)
    const executionOrder = ExecutionTraversal.resolveOrder(astGraph);

    // 5. Construção do Buffer (o vetor único)
    // Cada Núcleo/Aditivo/Kernel soma seus eixos (NodeAttributesDict) ao
    // buffer, na ordem topológica — um Kernel é processado depois do
    // Núcleo, então quando ambos definem o mesmo eixo não-numérico
    // (ex: saveAbility), o do Kernel prevalece por ser mais específico.
    let buffer: SpellBuffer = {};
    let element = patterns.finalElement;

    for (const node of executionOrder) {
      if (node instanceof CoreASTNode) {
          buffer = mergeAttrs(buffer, NodeAttributesDict[node.element] || {});
      } else if (node instanceof AdditiveASTNode) {
          // Um Aumento/Redução canalizado por ATRIBUICAO (ver PatternMatcher)
          // já converteu seu efeito em nível no aditivo de destino — contar
          // o potency/complexity genérico dele aqui seria pagar duas vezes
          // pelo mesmo bônus.
          if (!patterns.redirectedIds.has(node.id)) {
              buffer = mergeAttrs(buffer, NodeAttributesDict[node.additiveType] || {});
          }
          // FUSAO carrega os atributos do próprio elemento escolhido (o
          // "segundo Núcleo"), somados como se fosse um Núcleo de verdade.
          if (node.additiveType === 'FUSAO' && node.fusionElement) {
              buffer = mergeAttrs(buffer, NodeAttributesDict[node.fusionElement] || {});
          }
      } else if (node instanceof KernelASTNode) {
          // Intensidade do Kernel (1-5, padrão 1): escala proporcionalmente
          // sua contribuição ao buffer — nível 1 é o +1 de sempre, nível 5
          // multiplica por 5. Ver KERNEL_INTENSITY_LEVELS.
          buffer = mergeAttrs(buffer, scaleAttrs(NodeAttributesDict[node.kernelType] || {}, node.level ?? 1));
          // ABSORÇÃO: o Kernel em si não carrega atributos fixos — a
          // energia de verdade vem do elemento ambiente captado
          // (sourceElement), somada como se fosse um segundo Núcleo (igual
          // à FUSAO). É isso que permite converter energia absorvida pra
          // outro efeito (ex: fogo absorvido → poder extra numa cura).
          if (node.kernelType === 'ABSORCAO' && node.sourceElement) {
              buffer = mergeAttrs(buffer, scaleAttrs(NodeAttributesDict[node.sourceElement] || {}, node.level ?? 1));
          }
      }
    }

    // CORRENTE: cada salto além do primeiro alvo soma complexidade (mais
    // alvos pra gerenciar na mesma malha) — ver PatternMatcher.chainHops.
    if (patterns.chainHops > 0) {
        buffer = mergeAttrs(buffer, { complexity: patterns.chainHops });
    }
    buffer.chainHops = patterns.chainHops;

    // Lei do Combo de Kernels: dois ou mais Kernels escalados juntos (nível
    // > 1 cada) somam uma sobretaxa de complexidade além do que cada um já
    // contribui isoladamente — ver PatternMatcher.kernelComboPenalty.
    if (patterns.kernelComboPenalty > 0) {
        buffer = mergeAttrs(buffer, { complexity: patterns.kernelComboPenalty });
    }

    // Absorção Ambiental / Nível 0: canalizar um elemento estranho ao seu
    // próprio Núcleo (contra o ambiente) soma complexidade proporcional ao
    // nível do Kernel — a favor (mesmo elemento do Núcleo) não soma nada
    // aqui; o desconto dela aparece mais abaixo, direto no custo de mana.
    if (patterns.absorcaoActive && patterns.absorcaoSourceElement && !patterns.absorcaoAligned) {
        buffer = mergeAttrs(buffer, { complexity: patterns.absorcaoLevel * ABSORCAO_MISALIGNED_COMPLEXITY_PER_LEVEL });
    }

    // A Lei da Simetria: Criar (fusão com COMPOR) é a versão permanente e
    // cara — soma complexidade/potência (que elevam nível e CD via as
    // fórmulas abaixo); Destruir (fusão com DECOMPOR) é a versão efêmera e
    // barata — subtrai. Ver engine/colleges.ts.
    const symmetryDelta = polaritySymmetryDelta(patterns.fusionElement);
    if (symmetryDelta) {
        buffer = mergeAttrs(buffer, symmetryDelta);
    }

    // Capacitor (GATILHO): cada carga investida soma potência/complexidade
    // — é isso que permite que uma magia carregada por vários turnos (ou
    // por vários conjuradores enchendo o mesmo capacitor) saia mais forte
    // do que um só conjurador conseguiria pagar num único turno.
    const gatilhoInfo = patterns.gatilhoLevel > 0 ? GATILHO_LEVELS[patterns.gatilhoLevel] : null;
    if (gatilhoInfo) {
        buffer = mergeAttrs(buffer, { potency: gatilhoInfo.powerBonus, complexity: gatilhoInfo.powerBonus });
    }
    buffer.capacitor = patterns.gatilhoLevel;

    // Resolve qual dos 32 Colégios está ativo (Núcleo principal + fusão).
    // Um Colégio muda o NOME e o vocabulário da magia — é uma identidade
    // diferente do Núcleo puro, não só uma variação de intensidade.
    const college = patterns.primaryElement ? resolveCollege(patterns.primaryElement, patterns.fusionElement) : null;

    // Dobra os seletores de modo (resolvidos por nó no PatternMatcher, não
    // por soma) para dentro do mesmo buffer, como mais alguns eixos —
    // daqui em diante, toda fórmula lê só do buffer, nunca de `patterns.*`.
    buffer.alcance = patterns.pontoLevel;
    buffer.duracao = patterns.manterLevel;
    buffer.forma = patterns.formaLevel;
    buffer.mover = patterns.moverLevel;
    buffer.perceber = patterns.perceberLevel;
    buffer.teste = patterns.hasTeste ? 1 : 0;

    const isMode = patterns.moverLevel > 0 || patterns.perceberLevel > 0;

    // Condição imposta pelo efeito e habilidade usada para resisti-la.
    // Vêm do elemento (Núcleo) e, se houver, são refinadas pelo Kernel ativo.
    const saveAbility: string = buffer.saveAbility || 'Destreza';
    const activeDebuffs: string[] = buffer.debuffs || [];

    // Régua de alcance/duração: uma só tabela (PONTO_LEVELS/MANTER_LEVELS)
    // alimenta tanto o texto curto da ficha quanto o bloco formal D&D 5e,
    // então os dois nunca mais divergem entre si.
    const pontoInfo = PONTO_LEVELS[buffer.alcance];
    const manterInfo = MANTER_LEVELS[buffer.duracao];
    // FORMA (quando aplicável) substitui a geometria padrão de PONTO por
    // uma variante direcional (Cone/Linha) ou remota (Esfera) — ver
    // FORMA_LEVELS em engine/constants.ts para as regras de aplicabilidade.
    const formaInfo = buffer.forma > 0 ? FORMA_LEVELS[buffer.forma] : null;
    // MOVER/PERCEBER são aditivos de "modo": quando ativos, o resultado da
    // magia deixa de ser dano/cura e passa a ser deslocamento ou informação
    // (ver MOVER_LEVELS/PERCEBER_LEVELS em engine/constants.ts).
    const moverInfo = buffer.mover > 0 ? MOVER_LEVELS[buffer.mover] : null;
    const perceberInfo = buffer.perceber > 0 ? PERCEBER_LEVELS[buffer.perceber] : null;

    // Cada Kernel escala o feitiço por "Aumento" (amplitude) ou
    // "Complexibilidade" (natureza do efeito) — ver KERNEL_SCALE_AXIS.
    let eixoEscopo = patterns.mainKernel ? (KERNEL_SCALE_AXIS[patterns.mainKernel] || 'Aumento') : 'Base';
    let descEscala = eixoEscopo;

    // A álgebra decide os números; a prosa (mais abaixo) só lê o resultado.
    const isDeterministic = resolveIsDeterministic(buffer, semanticErrors.length > 0);
    const isSaveBased = resolveIsSaveBased(buffer, isMode);

    let damageBase = buffer.damageType || (element !== 'Desconhecido' ? element : 'Energia Pura');
    const safeDice = computeDamageDice(buffer);
    const bonus = buffer.potency > 0 ? `+${buffer.potency * 2}` : '';
    let spellDamage = buffer.alcance === 0 ? `0` : `${safeDice}d6${bonus}`;
    let healDamage = buffer.alcance === 0 ? `0` : `${safeDice}d8${bonus}`;

    // PIPELINE DE EXECUÇÃO STRICT (Codexv3)
    const events: ActionBufferItem[] = [];
    let stepCount = 1;

    let fase1Desc = `Varredura profunda: Ponto nível ${buffer.alcance} e Manter nível ${buffer.duracao} detectados. ${semanticErrors.length === 0 ? 'Estabilidade verificada.' : 'Instabilidade detectada!'}`;
    if (isDeterministic) fase1Desc = `Varredura profunda: Ponto nível ${buffer.alcance} e Manter nível ${buffer.duracao} detectados. Estabilidade Redundante.`;
    events.push({
        step: stepCount++,
        title: `Forja (Estabilidade)`,
        description: fase1Desc,
        type: 'CAST'
    });

    const fase2Name = isPersonalOnly ? 'Pessoal (Você mesmo)' : (isTrulyEmpty ? 'Nenhum / Instável' : (formaInfo ? formaInfo.name : pontoInfo.vetor));
    const fase2ModoSufixo = moverInfo ? ` — Modo Mover: ${moverInfo.name}` : perceberInfo ? ` — Modo Perceber: ${perceberInfo.name}` : '';
    events.push({
        step: stepCount++,
        title: `Projeção (Vetor)`,
        description: `Topologia configurada para o template: ${fase2Name}${fase2ModoSufixo}.`,
        type: 'TRAVEL'
    });

    let kernelText = patterns.mainKernel ? `${patterns.mainKernel.charAt(0).toUpperCase() + patterns.mainKernel.slice(1).toLowerCase()} (${element})` : `Núcleo de ${element}`;
    events.push({
        step: stepCount++,
        title: `Resolução (Kernel)`,
        description: `${kernelText} escalado(a) por ${descEscala}. Dano/Efeito base amplificado.`,
        type: 'CONTROL'
    });

    events.push({
        step: stepCount++,
        title: `Status Final`,
        description: isDeterministic ? `Malha 100% conectada (--). Sucesso Determinístico aplicado. CD descartada e Evasão suprimida. Dano Constante Ambiental.` : (isTrulyEmpty ? `Malha corrompida. Protocolo de falha acionado.` : (isPersonalOnly ? `Malha fechada sobre o próprio conjurador. Nenhum alvo externo necessário.` : `Malha operando sob incerteza parcial. Resolvendo impactos e testes (CD).`)),
        type: 'IMPACT',
        dice: isMode ? undefined : ((element === 'VIDA/CURA' || buffer.healing) ? healDamage : spellDamage),
        element
    });

    // Formatando o D&D text output (UI description)
    let description = `**Manifestação Semântica Resolvida**\n\n`;
    description += `*Buffer Numérico e Tático Extraído do Codex Mágico:*\n\n`;

    for (const step of events) {
        description += `**[Step ${step.step}]: ${step.title}**\n`;
        description += `*${step.description}*\n`;
        if (step.dice && buffer.alcance > 0) description += `> Impacto Resultante: **${step.dice}**\n`;
        description += `\n`;
    }

    const rangeStr = isPersonalOnly ? 'Pessoal' : (isTrulyEmpty ? 'Nenhum / Instável' : (formaInfo ? formaInfo.rangeStr : pontoInfo.rangeStr));
    const level = computeSpellLevel(buffer, events.length);
    const dc = computeDC(level, buffer);
    let manaCost = computeManaCost(level, buffer);
    // Absorção A Favor / Nível 0: a energia captada já era do ambiente, não
    // gerada do zero — a fatia de custo equivalente ao nível do Kernel de
    // Absorção é dispensada (nunca abaixo de 1, uma magia nunca é 100%
    // grátis).
    if (patterns.absorcaoActive && patterns.absorcaoAligned) {
        manaCost = Math.max(1, manaCost - patterns.absorcaoLevel);
    }
    // Nível 10 é o teto de progressão "normal" (ver MANA_POR_NIVEL). Acima
    // disso, mais mana não resolve — só um Arquétipo de Prestígio (ainda
    // sem conteúdo/regras próprias implementadas) libera o próximo passo.
    const requiresPrestige = level > MANA_NIVEL_MAX;
    const manaPoolAtLevel = MANA_POR_NIVEL[Math.min(Math.max(level, 1), MANA_NIVEL_MAX)];
    if (requiresPrestige) {
        semanticErrors.push(`[REQUER ARQUÉTIPO DE PRESTÍGIO] Esta magia calcula nível ${level}, acima do teto de progressão normal (nível ${MANA_NIVEL_MAX}). Só seria alcançável através de um Arquétipo de Prestígio (ex: Necromante) — sistema ainda sem regras próprias implementadas; por ora, é só um aviso.`);
    }
    const durationStr = manterInfo.duration;

    // D&D 5e Block Processing
    const dndRange = isPersonalOnly ? 'Pessoal' : (isTrulyEmpty ? 'Nulo / Instável' : (formaInfo ? formaInfo.dndRange : pontoInfo.dndRange));
    const dndDuration = manterInfo.dndDuration;

    let isHealing = element === 'VIDA/CURA' || buffer.healing;

    // manifestKey identifica, de forma determinística, QUAL combinação
    // mecânica exata está ativa (alcance × forma × teste × modo). A mesma
    // chave sempre resolve pra mesma palavra em MANIFESTACAO_TABLE — dado
    // X, a resposta é sempre aquilo, nunca uma prosa remontada por acaso.
    let manifestKey: string | null = null;
    let dndFullText = "";
    if (isTrulyEmpty) {
        dndFullText = `A magia não possui geometria de ancoragem ou expansão válida, manifestando-se estaticamente sem alcance. Nenhum alvo pode ser definido logicamente.`;
    } else if (isPersonalOnly) {
        // Sem PONTO, mas com outros componentes: efeito Pessoal legítimo
        // (ex: Escudo) — a energia nunca sai de você, então não há alvo,
        // ataque, teste ou dano a um terceiro.
        manifestKey = 'PESSOAL';
        if (isHealing) {
             dndFullText = `Você direciona a energia inteiramente para dentro de si mesmo, sem afetar nada externo. Uma onda de ${damageBase.toLowerCase()} reforça sua própria vitalidade.`;
        } else {
             dndFullText = `Você direciona ${damageBase.toLowerCase()} inteiramente para dentro de si mesmo, sem projetá-lo a nenhum alvo externo — a energia reforça sua própria defesa ou capacidade enquanto a magia perdurar.`;
        }
    } else if (moverInfo) {
        // MOVER: PONTO decide quem é afetado (você / um alvo / a área),
        // MOVER decide a distância — não há dano, cura nem teste envolvido.
        // O nome da manifestação já vem pronto de MOVER_LEVELS (Passo
        // Curto/Salto Médio/Salto Longo) — não precisa de uma 2ª tabela.
        if (buffer.alcance === 1) {
             dndFullText = `Você desaparece num piscar e reaparece ${moverInfo.distance} adiante, atravessando o espaço instantaneamente — ou agarra uma criatura ao alcance e a desloca pela mesma distância.`;
        } else if (buffer.alcance === 2) {
             dndFullText = `Uma força invisível dispara em direção a um alvo à distância, empurrando-o ou puxando-o ${moverInfo.distance} na direção que você desejar.`;
        } else {
             dndFullText = `Uma onda de força emana de você, deslocando cada criatura na área ${moverInfo.distance} para longe ou para perto, à sua escolha.`;
        }
    } else if (perceberInfo) {
        // PERCEBER: mesma lógica — nome já vem de PERCEBER_LEVELS
        // (Detectar/Identificar/Vislumbrar).
        if (buffer.alcance === 1) {
             dndFullText = `Ao tocar o alvo ou a superfície, você absorve uma impressão sensorial imediata: ${perceberInfo.detail}.`;
        } else if (buffer.alcance === 2) {
             dndFullText = `Você projeta sua percepção em direção a um ponto distante e capta uma impressão clara: ${perceberInfo.detail}.`;
        } else {
             dndFullText = `Uma onda de sensibilidade arcana se espalha ao seu redor: dentro da área, você ${perceberInfo.detail}.`;
        }
    } else if (buffer.alcance === 3 && formaInfo?.level === 1) {
        // Cone: mesma Aura, mas direcionada à sua frente em vez de 360°.
        manifestKey = 'AURA_CONE';
        if (isHealing) {
             dndFullText = `Você emite um cone de energia regenerativa à sua frente. Cada aliado na área recupera ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você projeta um cone de energia primordial à sua frente, atingindo tudo em seu caminho. Cada criatura na área sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A emanação é implacável: dano automático, sem teste de resistência.' : ` Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (buffer.alcance === 3 && formaInfo?.level === 2) {
        // Linha: mesma Aura, mas um feixe reto em vez de um raio ao redor.
        manifestKey = 'AURA_LINHA';
        if (isHealing) {
             dndFullText = `Um feixe curativo contínuo se propaga a partir de você em linha reta. Cada aliado atingido recupera ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Um feixe reto e contínuo de energia dispara a partir de você, perfurando tudo em linha. Cada criatura atingida sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A emanação é implacável: dano automático, sem teste de resistência.' : ` Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (buffer.alcance === 3) {
        manifestKey = 'AURA';
        if (isHealing) {
             dndFullText = `Uma aura de vitalidade emana de você (ou de um ponto ancorado), envolvendo tudo ao redor. Cada criatura dentro do alcance da aura recupera ${healDamage} pontos de vida enquanto permanecer na área.`;
        } else {
             dndFullText = `Uma aura de energia primordial emana de você, consumindo o espaço ao redor. Cada criatura na área sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A emanação é implacável: dano automático, sem teste de resistência.' : ` Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (buffer.alcance === 2 && formaInfo?.level === 3) {
        // Esfera Remota: o projétil detona num ponto à distância — vira
        // teste de resistência em área, não mais ataque à distância.
        manifestKey = 'ALCANCE_ESFERA';
        if (isHealing) {
             dndFullText = `Você projeta um pulso de vida que floresce num ponto à distância. Cada aliado dentro da esfera recupera ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você arremessa um foco de energia primordial que detona ao atingir um ponto à distância, envolvendo a área numa esfera devastadora. Cada criatura na esfera sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}. Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`;
        }
    } else if (buffer.alcance === 2 && buffer.teste > 0) {
        // Alcance + TESTE: à distância, mas resolvido por teste de
        // resistência do alvo em vez de jogada de ataque (ex: Chama Sagrada).
        manifestKey = 'ALCANCE_TESTE';
        if (isHealing) {
             dndFullText = `Você dispara um vetor cinético curativo através do espaço, atingindo com precisão um alvo. O feixe estabiliza feridas restaurando ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você concentra ${damageBase.toLowerCase()} num feixe preciso direcionado a um alvo à distância. Ele tenta resistência de ${saveAbility} (CD ${dc}) ou sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
    } else if (buffer.alcance === 2) {
        manifestKey = 'ALCANCE_ATAQUE';
        if (isHealing) {
             dndFullText = `Você dispara um vetor cinético curativo através do espaço, atingindo com precisão um alvo. O feixe estabiliza feridas restaurando ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você gera um vetor balístico contendo força letal primordial. Faça um ataque à distância com magia. O alvo recebe ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A cinemática é inevitável (auto-hit).' : ''}`;
        }
    } else if (buffer.teste > 0) {
        // Toque + TESTE: mesma ideia, mas ao toque em vez de à distância.
        manifestKey = 'TOQUE_TESTE';
        if (isHealing) {
             dndFullText = `Ao tocar uma criatura, sua energia divina infunde vitalidade nela, curando-a em ${healDamage} pontos de vida através de feixes de ${damageBase.toLowerCase()}.`;
        } else {
             dndFullText = `Ao encostar no alvo, você libera ${damageBase.toLowerCase()} diretamente em seu corpo. Ele tenta resistência de ${saveAbility} (CD ${dc}) ou sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
    } else {
        manifestKey = 'TOQUE_ATAQUE';
        if (isHealing) {
             dndFullText = `Ao tocar uma criatura, sua energia divina infunde vitalidade nela, curando-a em ${healDamage} pontos de vida através de feixes de ${damageBase.toLowerCase()}.`;
        } else {
             dndFullText = `A energia letal e bruta de ${damageBase.toLowerCase()} flui através de suas mãos. Faça um ataque corpo-a-corpo com magia contra uma criatura. Num acerto, ela sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
    }

    // O nome da manifestação abre o texto final sempre que resolvido —
    // pra mesma combinação mecânica, sempre a mesma palavra em primeiro
    // lugar. Mover/Perceber usam o nome que já vem de suas próprias
    // tabelas de nível; Pessoal e os 8 casos de ataque/teste/aura usam
    // MANIFESTACAO_TABLE.
    const manifestName = moverInfo?.name || perceberInfo?.name || (manifestKey ? MANIFESTACAO_TABLE[manifestKey]?.name : null) || null;
    if (manifestName && !isTrulyEmpty) {
        dndFullText = `[MANIFESTAÇÃO: ${manifestName.toUpperCase()}]\n${dndFullText}`;
    }

    if (buffer.duracao >= 4) {
        dndFullText += ` A energia se estabiliza num capacitor autossustentável, persistindo indefinidamente sem exigir concentração contínua do conjurador — até que seja dissipada por vontade própria ou por magia antagônica.`;
    } else if ((buffer.duracao === 2 || buffer.duracao === 3) && !isMode) {
        dndFullText += ` Devido à forte presença térmica ou entrópica, a área do feitiço se torna persistentemente instável. Qualquer criatura que inicie seu turno na área ou alvo afetado sofrerá efeitos secundários proporcionais à magia enquanto durar a concentração.`;
    }

    // Condição imposta pelo elemento/kernel ativo (ver saveAbility/activeDebuffs
    // acima). Um efeito de cura nunca impõe condição — só o dano/controle.
    // Mover/Perceber também nunca impõem condição: não são efeitos hostis.
    if (activeDebuffs.length > 0 && !isHealing && !isMode && buffer.alcance > 0) {
        const debuffList = activeDebuffs.join(', ');
        if (isSaveBased && isDeterministic) {
            dndFullText += ` O efeito também deixa os atingidos ${debuffList} até o fim do próximo turno, sem chance de resistência.`;
        } else if (isSaveBased) {
            dndFullText += ` Quem falhar nesse teste também fica ${debuffList} até o fim do próximo turno.`;
        } else {
            dndFullText += ` Quem for atingido também fica ${debuffList} até o fim do próximo turno.`;
        }
    }

    if (semanticErrors.length > 0) {
        const roll = Math.floor(Math.random() * 10) + 1;
        let failEffect = "";
        let catText = "";
        if (roll <= 3) {
            catText = "CRÍTICO/CATASTRÓFICO";
            failEffect = "Singularidade, Bumerangue de Dano Dobrado, ou Fenda Elemental.";
            if (isTrulyEmpty) {
                dndFullText = `[FALHA CATASTRÓFICA]\nUma fissura mística se rompe bem no seu núcleo arcano, dilacerando a realidade. A magia não surte o efeito desejado; em vez disso, colapsa violentamente causando: ${failEffect}`;
            } else {
                dndFullText += `\n\n[FALHA CATASTRÓFICA]\nA malha rompeu causando: ${failEffect}`;
            }
        } else if (roll <= 6) {
            catText = "MÉDIO/GRAVE";
            failEffect = "Choque Mental (Atordoado), Exaustão de Afinidade ou Inversão de Aditivo.";
            let warningBlock = `\n\n[FALHA MÉDIA/GRAVE]\nOcorreu uma falha de nível ${catText}. Efeitos possíveis ocorrem no conjurador: ${failEffect}`;
            dndFullText += warningBlock;
        } else {
            catText = "LEVE/INOFENSIVO";
            failEffect = "Estigma de Vulnerabilidade, Eco Temporal ou Dissipação Fria.";
            let warningBlock = `\n\n[FALHA LEVE]\nOcorreu uma desestabilização de nível ${catText}. Causa pequenos inconvenientes: ${failEffect}`;
            dndFullText += warningBlock;
        }

        events.push({
            step: stepCount++,
            title: `Falha Dimensional (Rolagem: 1d10 = ${roll})`,
            description: `Grau: ${catText}. Efeitos projetados: ${failEffect}`,
            type: 'CONTROL'
        });
    }

    // Lógica Síntese (Nome da Magia)
    let spellName = `Manifestação de ${element}`;
    if (patterns.mainKernel) {
        switch (patterns.mainKernel.toUpperCase()) {
            case 'DECOMPOR': spellName = `Filtro Entrópico (${element})`; break;
            case 'SOMBRA': spellName = `Controle Morfológico (${element})`; break;
            case 'ENTROPIA': spellName = `Crisol de Entropia (${element})`; break;
            case 'MORFOLOGIA': spellName = `Controle Morfológico (${element})`; break;
            case 'ESTADO': spellName = `Transmutação de Estado (${element})`; break;
            case 'LUMINOSIDADE': spellName = `Projeção Cênica (${element})`; break;
            case 'SOM': spellName = `Vibração Destrutiva (${element})`; break;
            case 'FORCA': spellName = `Colapso Gravitacional (${element})`; break;
            case 'VOLUME': spellName = `Controle Volumétrico (${element})`; break;
            case 'ORDEM': spellName = `Estruturação Pura (${element})`; break;
            case 'CAOS': spellName = `Desintegração Dimensional (${element})`; break;
            default: spellName = `Sintonia de ${patterns.mainKernel} (${element})`; break;
        }
    }
    // Um Colégio (Núcleo + Fusão) é a identidade mais específica possível
    // da magia — prioriza sobre o nome derivado do Kernel escalar.
    if (college) {
        spellName = college.name;
    }
    // Mover/Perceber mudam a própria natureza do feitiço, então a escola de
    // magia prioriza isso sobre o Kernel escalar (mas o nome do Colégio,
    // quando existe, continua valendo — ex: "Colégio da Adivinação"
    // fazendo uma leitura à distância continua sendo Adivinação).
    let magicSchool = 'Evocação';
    if (moverInfo) { if (!college) spellName = `Deslocamento de ${element}`; magicSchool = 'Conjuração'; }
    else if (perceberInfo) { if (!college) spellName = `Percepção de ${element}`; magicSchool = 'Adivinhação'; }

    if (college) {
        dndFullText += `\n\n[${college.name.toUpperCase()}]\nEsta magia pertence ao colégio que trata de ${college.vocabulary}.`;
    }

    // Capacitor: a magia não dispara ao ser conjurada — fica armazenada no
    // glifo até a condição do gatilho se cumprir.
    const triggerInfo = TRIGGER_TYPES[patterns.triggerType] || TRIGGER_TYPES[DEFAULT_TRIGGER_TYPE];
    if (gatilhoInfo) {
        dndFullText += `\n\n[CAPACITOR: ${gatilhoInfo.name.toUpperCase()}]\nEm vez de se manifestar na hora, a magia é armazenada num glifo (${gatilhoInfo.cargas} de carga). O efeito só ${triggerInfo.description} — Gatilho de ${triggerInfo.name}.`;
    }

    // Absorção Ambiental / Nível 0: em vez de gerar a energia do zero, o
    // conjurador capta energia elemental já presente no ambiente.
    if (patterns.absorcaoActive && patterns.absorcaoSourceElement) {
        const alignLabel = patterns.absorcaoAligned ? 'A FAVOR DO AMBIENTE (NÍVEL 0)' : 'CONTRA O AMBIENTE';
        const alignText = patterns.absorcaoAligned
            ? ' Como a fonte já é da mesma natureza do seu Núcleo, a captação não soma custo de mana.'
            : ' Como a fonte é estranha ao seu Núcleo, captá-la contra a natureza do ambiente sai mais caro em complexidade.';
        const capacitorText = gatilhoInfo ? ' Essa energia captada alimenta diretamente o Capacitor, no lugar dos turnos normais de conjuração.' : '';
        dndFullText += `\n\n[ABSORÇÃO: ${alignLabel}]\nVocê capta ${patterns.absorcaoSourceElement.toLowerCase()} ambiente e o guarda num glifo, em vez de gerar essa energia do zero.${alignText}${capacitorText}`;
    }

    // Modo alternativo (Mover XOR Perceber): a mesma malha serve pros dois,
    // o conjurador escolhe qual manifestar a cada lançamento — ver o bloco
    // [VERSÁTIL XOR] gerado pelo PatternMatcher.
    if (patterns.altPerceberInfo) {
        dndFullText += `\n\n[MODO ALTERNATIVO: PERCEBER]\nEm vez de deslocar, o conjurador pode escolher perceber: ${patterns.altPerceberInfo.detail}.`;
    }

    // SE_ENTAO: efeitos condicionados a um Teste (o alvo pode falhar ou
    // resistir) ou a um Gatilho (que pode disparar ou não) — descritos à
    // parte do restante, que continua sempre ativo.
    if (patterns.conditionalEffects.length > 0) {
        const clauses = patterns.conditionalEffects.map((cond: { targetId: string; conditionLabel: string; targetLabel: string }) =>
            `Se ${cond.conditionLabel}, então: ${cond.targetLabel}.`
        );
        dndFullText += `\n\n[CONDICIONAL]\n${clauses.join(' ')}`;
    }

    // CORRENTE: a energia salta em cadeia pra alvos adicionais além do
    // primeiro impacto, perdendo força a cada salto.
    if (patterns.chainHops > 0 && !isMode) {
        dndFullText += `\n\n[CORRENTE]\nApós atingir o primeiro alvo, a energia salta em cadeia para até ${patterns.chainHops} alvo(s) adicional(is) ao alcance, cada salto causando metade do dano do salto anterior.`;
    }

    if (isDeterministic && !isMode) {
        dndFullText += `\n\n[DETERMINISMO ABSOLUTO]\nA precisão desta malha anula todas as defesas. Nenhum Teste de Resistência (CD) é exigido, e rolagens de ataque são omitidas. O dano associado é uma Constante Ambiental (Automático e Inevitável).`;
    }

    const debugPathBlock = `[DEBUG_PATH]: { Buffer: ${JSON.stringify({ alcance: buffer.alcance, duracao: buffer.duracao, forma: buffer.forma, mover: buffer.mover, perceber: buffer.perceber, teste: buffer.teste })}, Fase2_Vetor: [${fase2Name}], Escala: [${descEscala}], SaveBased: [${isSaveBased}], Status: [${semanticErrors.length === 0 ? 'Sucesso' : 'Instável'}] }`;

    const dndBlock = {
        name: spellName,
        levelSchool: `${level}º nível de ${magicSchool} (${isDeterministic ? 'Física Determinística' : 'Customizada'})`,
        castingTime: gatilhoInfo ? `1 Ação para carregar (${gatilhoInfo.cargas}) + Gatilho de ${triggerInfo.name}` : "1 Ação",
        range: dndRange,
        components: "V, S",
        duration: dndDuration,
        fullText: dndFullText
    };

    return {
      description,
      attrs: buffer,
      instabilities: semanticErrors,
      logs: events,
      element,
      // Colégio ativo (Núcleo + Fusão), ou null se a magia usa só o
      // Núcleo puro sem fusão — ver engine/colleges.ts.
      college,
      // Capacitor ativo (GATILHO), ou null se a magia dispara na hora.
      capacitor: gatilhoInfo ? { ...gatilhoInfo, trigger: triggerInfo } : null,
      // Palavra fixa que identifica a geometria de entrega da magia (ver
      // MANIFESTACAO_TABLE) — a mesma combinação de alcance/forma/teste/modo
      // sempre resolve pro mesmo nome, nunca varia por acaso.
      manifestation: manifestName ? { name: manifestName } : null,
      // Economia de mana (ver §"Economia de Mana" em engine/constants.ts):
      // custo desta magia, o pool de referência de um conjurador no mesmo
      // nível dela (teto 10), e se ela já exige um Arquétipo de Prestígio.
      manaCost,
      manaPoolAtLevel,
      requiresPrestige,
      // Absorção Ambiental / Nível 0 (ver engine/constants.ts), ou null se
      // não há Kernel de Absorção ativo na magia.
      absorcao: patterns.absorcaoActive ? {
          sourceElement: patterns.absorcaoSourceElement,
          aligned: patterns.absorcaoAligned,
          level: patterns.absorcaoLevel,
          chargesCapacitor: patterns.absorcaoChargesCapacitor,
      } : null,
      needsDC: isSaveBased && dc > 10 && !isDeterministic,
      // 'MOVER' | 'PERCEBER' | null — diz à UI que a magia não tem dano/cura.
      mode: moverInfo ? 'MOVER' : perceberInfo ? 'PERCEBER' : null,
      saveAbility,
      // Mover/Perceber não são efeitos hostis: não impõem a condição do
      // elemento, mesmo que o Núcleo ativo normalmente imponha uma.
      conditions: isMode ? [] : activeDebuffs,
      rangeStr,
      level,
      dc,
      durationStr,
      dndBlock,
      debugPathBlock
    };
  }
}
