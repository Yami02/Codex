import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, CoreElement, AdditiveType } from '../types/magic';
import {
  NodeAttributesDict,
  PONTO_LEVELS, PONTO_LEVEL_MIN, PONTO_LEVEL_MAX,
  MANTER_LEVELS, MANTER_LEVEL_MIN, MANTER_LEVEL_MAX,
  FORMA_LEVELS, FORMA_LEVEL_MIN, FORMA_LEVEL_MAX,
  MOVER_LEVELS, MOVER_LEVEL_MIN, MOVER_LEVEL_MAX,
  PERCEBER_LEVELS, PERCEBER_LEVEL_MIN, PERCEBER_LEVEL_MAX,
  KERNEL_SCALE_AXIS,
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
  constructor(id: string, public additiveType: string, public level?: number, public fusionElement?: string) { super(id); }
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
        ast.addNode(new AdditiveASTNode(n.id, n.additiveType || n.name, n.level, n.fusionElement));
      } else if (n.type === NodeType.KERNEL || n.type === NodeType.SUBCIRCLE) {
        const subAst = n.magicGraph ? this.build(n.magicGraph) : new ASTGraph();
        ast.addNode(new KernelASTNode(n.id, n.additiveType || n.element || n.name || 'SUBCIRCLE', subAst));
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
              instabilities.push(`[REDUNDÂNCIA] ${fusaoNodes.length} nós de FUSAO detectados; apenas o primeiro (${fusionElement}) foi considerado. Use um único nó de FUSAO.`);
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

      // --- PONTO (alcance/topologia): nível explícito no próprio nó ---
      // Cada nó de PONTO carrega seu `level` (1-3). Não é mais a contagem de
      // nós empilhados que define o alcance — isso elimina o número mágico
      // escondido e o estado "2 pontos = instável" que não tinha explicação
      // visível para quem estava montando o feitiço.
      const pontoNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'PONTO');
      let pontoLevel = 0;
      if (pontoNodes.length > 0) {
          const levels = pontoNodes.map(n => clamp(n.level ?? PONTO_LEVEL_MIN, PONTO_LEVEL_MIN, PONTO_LEVEL_MAX));
          pontoLevel = Math.max(...levels);
          if (pontoNodes.length > 1) {
              instabilities.push(`[REDUNDÂNCIA] ${pontoNodes.length} nós de PONTO detectados; apenas o de maior nível (${pontoLevel}) foi considerado. Use um único nó de PONTO e ajuste seu nível.`);
          }
      }

      // --- MANTER (duração): nível explícito no próprio nó ---
      const manterNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'MANTER');
      let manterLevel = 0;
      if (manterNodes.length > 0) {
          const levels = manterNodes.map(n => clamp(n.level ?? 1, MANTER_LEVEL_MIN, MANTER_LEVEL_MAX));
          manterLevel = Math.max(...levels);
          if (manterNodes.length > 1) {
              instabilities.push(`[REDUNDÂNCIA] ${manterNodes.length} nós de MANTER detectados; apenas o de maior nível (${manterLevel}) foi considerado. Use um único nó de MANTER e ajuste seu nível.`);
          }
      }

      // --- FORMA (geometria): aditivo opcional que só refina uma Aura
      // (PONTO 3 -> Cone/Linha) ou um Alcance (PONTO 2 -> Esfera Remota).
      // Não é mais um "nível de força" — é uma escolha entre 3 variantes.
      const formaNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'FORMA');
      let formaLevel = 0;
      if (formaNodes.length > 0) {
          const levels = formaNodes.map(n => clamp(n.level ?? FORMA_LEVEL_MIN, FORMA_LEVEL_MIN, FORMA_LEVEL_MAX));
          formaLevel = Math.max(...levels);
          if (formaNodes.length > 1) {
              instabilities.push(`[REDUNDÂNCIA] ${formaNodes.length} nós de FORMA detectados; apenas "${FORMA_LEVELS[formaLevel].name}" foi considerado. Use um único nó de FORMA.`);
          }
          const formaInfo = FORMA_LEVELS[formaLevel];
          if (formaInfo.appliesToPontoLevel !== pontoLevel) {
              instabilities.push(`[FORMA SEM EFEITO] "${formaInfo.name}" só se aplica com PONTO nível ${formaInfo.appliesToPontoLevel}; no nível atual (${pontoLevel}) ela é ignorada.`);
              formaLevel = 0;
          }
      }

      // --- MOVER / PERCEBER (modo): aditivos que substituem dano/cura por
      // deslocamento ou informação. São mutuamente exclusivos — uma magia
      // não pode "só mover" e "só perceber" ao mesmo tempo neste modelo.
      const moverNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'MOVER');
      let moverLevel = 0;
      if (moverNodes.length > 0) {
          const levels = moverNodes.map(n => clamp(n.level ?? MOVER_LEVEL_MIN, MOVER_LEVEL_MIN, MOVER_LEVEL_MAX));
          moverLevel = Math.max(...levels);
          if (moverNodes.length > 1) {
              instabilities.push(`[REDUNDÂNCIA] ${moverNodes.length} nós de MOVER detectados; apenas o de maior nível (${moverLevel}) foi considerado. Use um único nó de MOVER.`);
          }
      }

      const perceberNodes = allNodes.filter((n): n is AdditiveASTNode => n instanceof AdditiveASTNode && n.additiveType === 'PERCEBER');
      let perceberLevel = 0;
      if (perceberNodes.length > 0) {
          const levels = perceberNodes.map(n => clamp(n.level ?? PERCEBER_LEVEL_MIN, PERCEBER_LEVEL_MIN, PERCEBER_LEVEL_MAX));
          perceberLevel = Math.max(...levels);
          if (perceberNodes.length > 1) {
              instabilities.push(`[REDUNDÂNCIA] ${perceberNodes.length} nós de PERCEBER detectados; apenas o de maior nível (${perceberLevel}) foi considerado. Use um único nó de PERCEBER.`);
          }
      }

      if (moverLevel > 0 && perceberLevel > 0) {
          instabilities.push(`[MODOS CONFLITANTES] Mover e Perceber não podem atuar juntos na mesma magia; apenas Mover foi aplicado.`);
          perceberLevel = 0;
      }
      if ((moverLevel > 0 || perceberLevel > 0) && formaLevel > 0) {
          instabilities.push(`[FORMA SEM EFEITO] Forma não se aplica a magias de Mover ou Perceber.`);
          formaLevel = 0;
      }

      // --- TESTE: aditivo binário (sem nível) que troca a jogada de ataque
      // por um teste de resistência do alvo em PONTO 1 (Toque) ou 2
      // (Alcance) — o alcance da magia não deveria decidir sozinho se ela é
      // um ataque ou um teste; isso depende da magia, não da distância.
      const hasTeste = allNodes.some(n => n instanceof AdditiveASTNode && n.additiveType === 'TESTE');
      if (hasTeste && (moverLevel > 0 || perceberLevel > 0)) {
          instabilities.push(`[TESTE SEM EFEITO] Teste não se aplica a magias de Mover ou Perceber, que não têm ataque nem teste.`);
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

      return {
          finalElement,
          fusionElement,
          primaryElement,
          pontoLevel,
          manterLevel,
          formaLevel,
          moverLevel,
          perceberLevel,
          hasTeste,
          pontosLength: pontoNodes.length,
          totalComponents: allNodes.length,
          kernelsAtivos,
          mainKernel,
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
          buffer = mergeAttrs(buffer, NodeAttributesDict[node.additiveType] || {});
          // FUSAO carrega os atributos do próprio elemento escolhido (o
          // "segundo Núcleo"), somados como se fosse um Núcleo de verdade.
          if (node.additiveType === 'FUSAO' && node.fusionElement) {
              buffer = mergeAttrs(buffer, NodeAttributesDict[node.fusionElement] || {});
          }
      } else if (node instanceof KernelASTNode) {
          buffer = mergeAttrs(buffer, NodeAttributesDict[node.kernelType] || {});
      }
    }

    // A Lei da Simetria: Criar (fusão com COMPOR) é a versão permanente e
    // cara — soma complexidade/potência (que elevam nível e CD via as
    // fórmulas abaixo); Destruir (fusão com DECOMPOR) é a versão efêmera e
    // barata — subtrai. Ver engine/colleges.ts.
    const symmetryDelta = polaritySymmetryDelta(patterns.fusionElement);
    if (symmetryDelta) {
        buffer = mergeAttrs(buffer, symmetryDelta);
    }

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
    const durationStr = manterInfo.duration;

    // D&D 5e Block Processing
    const dndRange = isPersonalOnly ? 'Pessoal' : (isTrulyEmpty ? 'Nulo / Instável' : (formaInfo ? formaInfo.dndRange : pontoInfo.dndRange));
    const dndDuration = manterInfo.dndDuration;

    let isHealing = element === 'VIDA/CURA' || buffer.healing;

    let dndFullText = "";
    if (isTrulyEmpty) {
        dndFullText = `A magia não possui geometria de ancoragem ou expansão válida, manifestando-se estaticamente sem alcance. Nenhum alvo pode ser definido logicamente.`;
    } else if (isPersonalOnly) {
        // Sem PONTO, mas com outros componentes: efeito Pessoal legítimo
        // (ex: Escudo) — a energia nunca sai de você, então não há alvo,
        // ataque, teste ou dano a um terceiro.
        if (isHealing) {
             dndFullText = `Você direciona a energia inteiramente para dentro de si mesmo, sem afetar nada externo. Uma onda de ${damageBase.toLowerCase()} reforça sua própria vitalidade.`;
        } else {
             dndFullText = `Você direciona ${damageBase.toLowerCase()} inteiramente para dentro de si mesmo, sem projetá-lo a nenhum alvo externo — a energia reforça sua própria defesa ou capacidade enquanto a magia perdurar.`;
        }
    } else if (moverInfo) {
        // MOVER: PONTO decide quem é afetado (você / um alvo / a área),
        // MOVER decide a distância — não há dano, cura nem teste envolvido.
        if (buffer.alcance === 1) {
             dndFullText = `Você desaparece num piscar e reaparece ${moverInfo.distance} adiante, atravessando o espaço instantaneamente — ou agarra uma criatura ao alcance e a desloca pela mesma distância.`;
        } else if (buffer.alcance === 2) {
             dndFullText = `Uma força invisível dispara em direção a um alvo à distância, empurrando-o ou puxando-o ${moverInfo.distance} na direção que você desejar.`;
        } else {
             dndFullText = `Uma onda de força emana de você, deslocando cada criatura na área ${moverInfo.distance} para longe ou para perto, à sua escolha.`;
        }
    } else if (perceberInfo) {
        // PERCEBER: mesma lógica — PONTO decide o alcance da percepção,
        // PERCEBER decide a profundidade da informação revelada.
        if (buffer.alcance === 1) {
             dndFullText = `Ao tocar o alvo ou a superfície, você absorve uma impressão sensorial imediata: ${perceberInfo.detail}.`;
        } else if (buffer.alcance === 2) {
             dndFullText = `Você projeta sua percepção em direção a um ponto distante e capta uma impressão clara: ${perceberInfo.detail}.`;
        } else {
             dndFullText = `Uma onda de sensibilidade arcana se espalha ao seu redor: dentro da área, você ${perceberInfo.detail}.`;
        }
    } else if (buffer.alcance === 3 && formaInfo?.level === 1) {
        // Cone: mesma Aura, mas direcionada à sua frente em vez de 360°.
        if (isHealing) {
             dndFullText = `Você emite um cone de energia regenerativa à sua frente. Cada aliado na área recupera ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você projeta um cone de energia primordial à sua frente, atingindo tudo em seu caminho. Cada criatura na área sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A emanação é implacável: dano automático, sem teste de resistência.' : ` Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (buffer.alcance === 3 && formaInfo?.level === 2) {
        // Linha: mesma Aura, mas um feixe reto em vez de um raio ao redor.
        if (isHealing) {
             dndFullText = `Um feixe curativo contínuo se propaga a partir de você em linha reta. Cada aliado atingido recupera ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Um feixe reto e contínuo de energia dispara a partir de você, perfurando tudo em linha. Cada criatura atingida sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A emanação é implacável: dano automático, sem teste de resistência.' : ` Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (buffer.alcance === 3) {
        if (isHealing) {
             dndFullText = `Uma aura de vitalidade emana de você (ou de um ponto ancorado), envolvendo tudo ao redor. Cada criatura dentro do alcance da aura recupera ${healDamage} pontos de vida enquanto permanecer na área.`;
        } else {
             dndFullText = `Uma aura de energia primordial emana de você, consumindo o espaço ao redor. Cada criatura na área sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A emanação é implacável: dano automático, sem teste de resistência.' : ` Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (buffer.alcance === 2 && formaInfo?.level === 3) {
        // Esfera Remota: o projétil detona num ponto à distância — vira
        // teste de resistência em área, não mais ataque à distância.
        if (isHealing) {
             dndFullText = `Você projeta um pulso de vida que floresce num ponto à distância. Cada aliado dentro da esfera recupera ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você arremessa um foco de energia primordial que detona ao atingir um ponto à distância, envolvendo a área numa esfera devastadora. Cada criatura na esfera sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}. Alvos tentam resistência de ${saveAbility} (CD ${dc}) para reduzir à metade.`;
        }
    } else if (buffer.alcance === 2 && buffer.teste > 0) {
        // Alcance + TESTE: à distância, mas resolvido por teste de
        // resistência do alvo em vez de jogada de ataque (ex: Chama Sagrada).
        if (isHealing) {
             dndFullText = `Você dispara um vetor cinético curativo através do espaço, atingindo com precisão um alvo. O feixe estabiliza feridas restaurando ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você concentra ${damageBase.toLowerCase()} num feixe preciso direcionado a um alvo à distância. Ele tenta resistência de ${saveAbility} (CD ${dc}) ou sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
    } else if (buffer.alcance === 2) {
        if (isHealing) {
             dndFullText = `Você dispara um vetor cinético curativo através do espaço, atingindo com precisão um alvo. O feixe estabiliza feridas restaurando ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você gera um vetor balístico contendo força letal primordial. Faça um ataque à distância com magia. O alvo recebe ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A cinemática é inevitável (auto-hit).' : ''}`;
        }
    } else if (buffer.teste > 0) {
        // Toque + TESTE: mesma ideia, mas ao toque em vez de à distância.
        if (isHealing) {
             dndFullText = `Ao tocar uma criatura, sua energia divina infunde vitalidade nela, curando-a em ${healDamage} pontos de vida através de feixes de ${damageBase.toLowerCase()}.`;
        } else {
             dndFullText = `Ao encostar no alvo, você libera ${damageBase.toLowerCase()} diretamente em seu corpo. Ele tenta resistência de ${saveAbility} (CD ${dc}) ou sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
    } else {
        if (isHealing) {
             dndFullText = `Ao tocar uma criatura, sua energia divina infunde vitalidade nela, curando-a em ${healDamage} pontos de vida através de feixes de ${damageBase.toLowerCase()}.`;
        } else {
             dndFullText = `A energia letal e bruta de ${damageBase.toLowerCase()} flui através de suas mãos. Faça um ataque corpo-a-corpo com magia contra uma criatura. Num acerto, ela sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
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

    if (isDeterministic && !isMode) {
        dndFullText += `\n\n[DETERMINISMO ABSOLUTO]\nA precisão desta malha anula todas as defesas. Nenhum Teste de Resistência (CD) é exigido, e rolagens de ataque são omitidas. O dano associado é uma Constante Ambiental (Automático e Inevitável).`;
    }

    const debugPathBlock = `[DEBUG_PATH]: { Buffer: ${JSON.stringify({ alcance: buffer.alcance, duracao: buffer.duracao, forma: buffer.forma, mover: buffer.mover, perceber: buffer.perceber, teste: buffer.teste })}, Fase2_Vetor: [${fase2Name}], Escala: [${descEscala}], SaveBased: [${isSaveBased}], Status: [${semanticErrors.length === 0 ? 'Sucesso' : 'Instável'}] }`;

    const dndBlock = {
        name: spellName,
        levelSchool: `${level}º nível de ${magicSchool} (${isDeterministic ? 'Física Determinística' : 'Customizada'})`,
        castingTime: "1 Ação",
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
