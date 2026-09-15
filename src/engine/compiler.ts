import { MagicGraph, MagicNode, MagicEdge, NodeType, EdgeType, CoreElement, AdditiveType } from '../types/magic';
import {
  NodeAttributesDict,
  PONTO_LEVELS, PONTO_LEVEL_MIN, PONTO_LEVEL_MAX,
  MANTER_LEVELS, MANTER_LEVEL_MIN, MANTER_LEVEL_MAX,
  KERNEL_SCALE_AXIS,
} from './constants';

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
  constructor(id: string, public additiveType: string, public level?: number) { super(id); }
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
        ast.addNode(new AdditiveASTNode(n.id, n.additiveType || n.name, n.level));
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

      let hasElement = (e: string) => allNodes.some(n => (n instanceof CoreASTNode && n.element === e) || (n instanceof KernelASTNode && n.kernelType === e));
      let hasAdditive = (a: string) => allNodes.some(n => (n instanceof AdditiveASTNode && n.additiveType === a));

      let elements = new Set(allNodes.filter(n => n instanceof CoreASTNode).map(n => (n as CoreASTNode).element));
      let compor = hasElement('COMPOR') || hasAdditive('COMPOR');
      let decompor = hasElement('DECOMPOR') || hasAdditive('DECOMPOR');
      let fogo = hasElement('FOGO');
      let terra = hasElement('TERRA');
      let agua = hasElement('ÁGUA') || hasElement('AGUA');
      let ar = hasElement('AR');
      let luz = hasElement('LUZ');
      let sombra = hasElement('SOMBRA');

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

      let otherComponents = allNodes.length - allNodes.filter(n => n instanceof CoreASTNode).length;
      if (allNodes.length >= 2 && otherComponents < 2) {
          instabilities.push("Alerta de Instabilidade! A geometria atual carece do 'Triângulo Base'. Risco alto de colapso arcanamente imprevisível no conjurador.");
      }

      const kernelsAtivosNodes = allNodes.filter(n => n instanceof KernelASTNode) as KernelASTNode[];
      const kernelsAtivos = kernelsAtivosNodes.length;
      const mainKernel = kernelsAtivos > 0 ? kernelsAtivosNodes[0].kernelType : null;

      return {
          finalElement,
          pontoLevel,
          manterLevel,
          pontosLength: pontoNodes.length,
          kernelsAtivos,
          mainKernel,
          transmutationLogs: logs,
          topologicalInstabilities: instabilities
      };
  }
}


// 6. O Motor Principal do Compilador
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

    if (patterns.pontoLevel === 0) {
        semanticErrors.push("A energia manifesta-se de forma estática. Risco de Colapso iminente.");
    }

    // 4. Travessia (Resolução da Ordem de Avaliação)
    const executionOrder = ExecutionTraversal.resolveOrder(astGraph);

    // 5. Geração do Buffer de Saída (D&D Output)
    const events: ActionBufferItem[] = [];
    let stepCount = 1;

    let currentAttrs: any = {};
    let element = patterns.finalElement;

    // Calcular atributos totais
    for (const node of executionOrder) {
      if (node instanceof CoreASTNode) {
          currentAttrs = this.mergeAttrs(currentAttrs, NodeAttributesDict[node.element] || {});
      } else if (node instanceof AdditiveASTNode) {
          currentAttrs = this.mergeAttrs(currentAttrs, NodeAttributesDict[node.additiveType] || {});
      }
    }

    // Régua de alcance/duração: uma só tabela (PONTO_LEVELS/MANTER_LEVELS)
    // alimenta tanto o texto curto da ficha quanto o bloco formal D&D 5e,
    // então os dois nunca mais divergem entre si.
    const pontoInfo = PONTO_LEVELS[patterns.pontoLevel];
    const manterInfo = MANTER_LEVELS[patterns.manterLevel];

    // Cada Kernel escala o feitiço por "Aumento" (amplitude) ou
    // "Complexibilidade" (natureza do efeito) — ver KERNEL_SCALE_AXIS.
    let eixoEscopo = patterns.mainKernel ? (KERNEL_SCALE_AXIS[patterns.mainKernel] || 'Aumento') : 'Base';
    let descEscala = eixoEscopo;

    // Determina isDeterministic
    const isDeterministic = patterns.pontoLevel === PONTO_LEVEL_MAX && semanticErrors.length === 0;

    let damageBase = currentAttrs.damageType || (element !== 'Desconhecido' ? element : 'Energia Pura');
    const mainDamageAttr = (currentAttrs.entropy || 0) + (currentAttrs.strength || 0) + (currentAttrs.volume || 0) + (currentAttrs.order || 0);
    const numDice = Math.max(1, Math.floor(mainDamageAttr / 2) + Math.floor(patterns.pontoLevel / 2) + Math.floor(patterns.manterLevel / 2));
    const bonus = currentAttrs.potency > 0 ? `+${currentAttrs.potency * 2}` : '';
    const safeDice = numDice > 0 ? numDice : 1;
    let spellDamage = patterns.pontoLevel === 0 ? `0` : `${safeDice}d6${bonus}`;
    let healDamage = patterns.pontoLevel === 0 ? `0` : `${safeDice}d8${bonus}`;

    // PIPELINE DE EXECUÇÃO STRICT (Codexv3)
    let fase1Desc = `Varredura profunda: Ponto nível ${patterns.pontoLevel} e Manter nível ${patterns.manterLevel} detectados. ${semanticErrors.length === 0 ? 'Estabilidade verificada.' : 'Instabilidade detectada!'}`;
    if (isDeterministic) fase1Desc = `Varredura profunda: Ponto nível ${patterns.pontoLevel} e Manter nível ${patterns.manterLevel} detectados. Estabilidade Redundante.`;
    events.push({
        step: stepCount++,
        title: `Forja (Estabilidade)`,
        description: fase1Desc,
        type: 'CAST'
    });

    const fase2Name = patterns.pontoLevel === 0 ? 'Nenhum / Instável' : pontoInfo.vetor;
    events.push({
        step: stepCount++,
        title: `Projeção (Vetor)`,
        description: `Topologia configurada para o template: ${fase2Name}.`,
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
        description: isDeterministic ? `Malha 100% conectada (--). Sucesso Determinístico aplicado. CD descartada e Evasão suprimida. Dano Constante Ambiental.` : (semanticErrors.length > 0 && patterns.pontoLevel === 0 ? `Malha corrompida. Protocolo de falha acionado.` : `Malha operando sob incerteza parcial. Resolvendo impactos e testes (CD).`),
        type: 'IMPACT',
        dice: (element === 'VIDA/CURA' || currentAttrs.healing) ? healDamage : spellDamage,
        element
    });

    // Formatando o D&D text output (UI description)
    let description = `**Manifestação Semântica Resolvida**\n\n`;
    description += `*Buffer Numérico e Tático Extraído do Codex Mágico:*\n\n`;

    for (const step of events) {
        description += `**[Step ${step.step}]: ${step.title}**\n`;
        description += `*${step.description}*\n`;
        if (step.dice && patterns.pontoLevel > 0) description += `> Impacto Resultante: **${step.dice}**\n`;
        description += `\n`;
    }

    const rangeStr = patterns.pontoLevel === 0 ? 'Nenhum / Instável' : pontoInfo.rangeStr;
    const level = 1 + Math.floor((currentAttrs.complexity || 0) / 3) + Math.floor(events.length / 4);
    const dc = 10 + Math.floor(level / 2) + Math.floor((currentAttrs.potency || 0) / 2);
    const durationStr = manterInfo.duration;

    // D&D 5e Block Processing
    const dndRange = patterns.pontoLevel === 0 ? 'Nulo / Instável' : pontoInfo.dndRange;
    const dndDuration = manterInfo.dndDuration;

    let isHealing = element === 'VIDA/CURA' || currentAttrs.healing;

    let dndFullText = "";
    if (patterns.pontoLevel === 0) {
        dndFullText = `A magia não possui geometria de ancoragem ou expansão válida, manifestando-se estaticamente sem alcance. Nenhum alvo pode ser definido logicamente.`;
    } else if (patterns.pontoLevel === 3) {
        if (isHealing) {
             dndFullText = `Uma aura de vitalidade emana de você (ou de um ponto ancorado), envolvendo tudo ao redor. Cada criatura dentro do alcance da aura recupera ${healDamage} pontos de vida enquanto permanecer na área.`;
        } else {
             dndFullText = `Uma aura de energia primordial emana de você, consumindo o espaço ao redor. Cada criatura na área sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A emanação é implacável: dano automático, sem teste de resistência.' : ` Alvos tentam resistência de Destreza (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (patterns.pontoLevel === 2) {
        if (isHealing) {
             dndFullText = `Você dispara um vetor cinético curativo através do espaço, atingindo com precisão um alvo. O feixe estabiliza feridas restaurando ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você gera um vetor balístico contendo força letal primordial. Faça um ataque à distância com magia. O alvo recebe ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A cinemática é inevitável (auto-hit).' : ''}`;
        }
    } else {
        if (isHealing) {
             dndFullText = `Ao tocar uma criatura, sua energia divina infunde vitalidade nela, curando-a em ${healDamage} pontos de vida através de feixes de ${damageBase.toLowerCase()}.`;
        } else {
             dndFullText = `A energia letal e bruta de ${damageBase.toLowerCase()} flui através de suas mãos. Faça um ataque corpo-a-corpo com magia contra uma criatura. Num acerto, ela sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
    }

    if (patterns.manterLevel >= 4) {
        dndFullText += ` A energia se estabiliza num capacitor autossustentável, persistindo indefinidamente sem exigir concentração contínua do conjurador — até que seja dissipada por vontade própria ou por magia antagônica.`;
    } else if (patterns.manterLevel === 2 || patterns.manterLevel === 3) {
        dndFullText += ` Devido à forte presença térmica ou entrópica, a área do feitiço se torna persistentemente instável. Qualquer criatura que inicie seu turno na área ou alvo afetado sofrerá efeitos secundários proporcionais à magia enquanto durar a concentração.`;
    }

    if (semanticErrors.length > 0) {
        const roll = Math.floor(Math.random() * 10) + 1;
        let failEffect = "";
        let catText = "";
        if (roll <= 3) {
            catText = "CRÍTICO/CATASTRÓFICO";
            failEffect = "Singularidade, Bumerangue de Dano Dobrado, ou Fenda Elemental.";
            if (patterns.pontoLevel === 0) {
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

    if (isDeterministic) {
        dndFullText += `\n\n[DETERMINISMO ABSOLUTO]\nA precisão desta malha anula todas as defesas. Nenhum Teste de Resistência (CD) é exigido, e rolagens de ataque são omitidas. O dano associado é uma Constante Ambiental (Automático e Inevitável).`;
    }

    const debugPathBlock = `[DEBUG_PATH]: { PontoNivel: ${patterns.pontoLevel}, ManterNivel: ${patterns.manterLevel}, Fase2_Vetor: [${fase2Name}], Escala: [${descEscala}], Status: [${semanticErrors.length === 0 ? 'Sucesso' : 'Instável'}] }`;

    const dndBlock = {
        name: spellName,
        levelSchool: `${level}º nível de Evocação (${isDeterministic ? 'Física Determinística' : 'Customizada'})`,
        castingTime: "1 Ação",
        range: dndRange,
        components: "V, S",
        duration: dndDuration,
        fullText: dndFullText
    };

    return {
      description,
      attrs: currentAttrs,
      instabilities: semanticErrors,
      logs: events,
      element,
      needsDC: dc > 10 && !isDeterministic,
      rangeStr,
      level,
      dc,
      durationStr,
      dndBlock,
      debugPathBlock
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
