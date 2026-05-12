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

      let pontos = allNodes.filter(n => n instanceof AdditiveASTNode && n.additiveType === 'PONTO');
      let pontoLevel = 0;
      if (pontos.length === 1) {
          pontoLevel = 1;
      } else if (pontos.length === 2) {
          instabilities.push("[MAGIA INSTÁVEL] 2 pontos não configuram uma topologia de projeção na versão 3.0 do Codex.");
          pontoLevel = 2; // Instável, mas não reseta para 0
      } else if (pontos.length === 3) {
          pontoLevel = 3;
      } else if (pontos.length === 4) {
          pontoLevel = 4;
      } else if (pontos.length >= 5) {
          pontoLevel = 5;
      }

      let manters = allNodes.filter(n => n instanceof AdditiveASTNode && n.additiveType === 'MANTER');
      let manterLevel = 0;
      if (manters.length === 1 || manters.length === 2) manterLevel = 1;
      else if (manters.length === 3) {
          let isTriangle = this.checkCycleFlat(ast, manters, 3);
          if (isTriangle) manterLevel = 3;
          else instabilities.push("[MAGIA INSTÁVEL] Os 3 'manter' não formam geometria fechada (Triângulo).");
      } else if (manters.length >= 4) {
          let isSquare = this.checkCycleFlat(ast, manters, 4);
          if (isSquare) manterLevel = 4;
          else instabilities.push("[MAGIA INSTÁVEL] Geometria do Capacitor corrompida.");
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
          pontosLength: pontos.length,
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

    const allNodesFlat = PatternMatcher.flattenNodes(astGraph);
    const compKernels = ['DECOMPOR', 'SOMBRA', 'MORFOLOGIA', 'FILTRO'];
    let eixoEscopo = 'Base';
    if (patterns.mainKernel) {
        if (compKernels.includes(patterns.mainKernel)) eixoEscopo = 'Complexibilidade';
        else eixoEscopo = 'Aumento';
    }
    let descEscala = eixoEscopo;

    // Determina isDeterministic
    const isDeterministic = patterns.pontoLevel >= 5 && semanticErrors.length === 0;

    let damageBase = currentAttrs.damageType || (element !== 'Desconhecido' ? element : 'Energia Pura');
    const mainDamageAttr = (currentAttrs.entropy || 0) + (currentAttrs.strength || 0) + (currentAttrs.volume || 0) + (currentAttrs.order || 0);
    const numDice = Math.max(1, Math.floor(mainDamageAttr / 2) + Math.floor(patterns.pontoLevel / 2) + Math.floor(patterns.manterLevel / 2));
    const bonus = currentAttrs.potency > 0 ? `+${currentAttrs.potency * 2}` : '';
    const safeDice = numDice > 0 ? numDice : 1;
    let spellDamage = patterns.pontoLevel === 0 ? `0` : `${safeDice}d6${bonus}`;
    let healDamage = patterns.pontoLevel === 0 ? `0` : `${safeDice}d8${bonus}`;

    // PIPELINE DE EXECUÇÃO STRICT (Codexv3)
    let fase1Desc = `Varredura profunda: ${patterns.pontosLength} Pontos e ${patterns.manterLevel > 0 ? patterns.manterLevel : 0} Manteres detectados. ${semanticErrors.length === 0 ? 'Estabilidade verificada.' : 'Instabilidade detectada!'}`;
    if (isDeterministic) fase1Desc = `Varredura profunda: ${patterns.pontosLength} Pontos e ${patterns.manterLevel > 0 ? patterns.manterLevel : 0} Manteres detectados. Estabilidade Redundante.`;
    events.push({
        step: stepCount++,
        title: `Forja (Estabilidade)`,
        description: fase1Desc,
        type: 'CAST'
    });

    let fase2Name = 'Área';
    if (patterns.pontoLevel === 1) fase2Name = 'Toque / Centro';
    else if (patterns.pontoLevel === 2) fase2Name = 'Instável (2 Pontos)';
    else if (patterns.pontoLevel === 3) fase2Name = 'Ancorado (Fixo)';
    else if (patterns.pontoLevel === 4) fase2Name = 'Movimento / Projétil';
    else if (patterns.pontoLevel >= 5) fase2Name = 'Área (Pentágono)';
    else if (patterns.pontoLevel === 0) fase2Name = 'Nenhum / Instável';
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

    let rangeStr = 'Toque / Corpo-a-Corpo';
    if (patterns.pontoLevel >= 3) rangeStr = 'Efeito em Área (AoE)';
    else if (patterns.pontoLevel === 2) rangeStr = 'Projétil Arcano (20m)';

    const level = 1 + Math.floor((currentAttrs.complexity || 0) / 3) + Math.floor(events.length / 4);
    const dc = 10 + Math.floor(level / 2) + Math.floor((currentAttrs.potency || 0) / 2);

    let durationStr = 'Colisão Instantânea';
    if (patterns.manterLevel >= 3) {
        durationStr = patterns.manterLevel >= 4 ? 'Aura Estável (Capacitor)' : 'Concentração Contínua';
    }

    // D&D 5e Block Processing
    let dndRange = 'Toque';
    let fase2Vetor = 'Toque / Centro';

    if (patterns.pontoLevel >= 5) {
        dndRange = 'Área (Preenchimento volumétrico)';
        fase2Vetor = 'Área';
    } else if (patterns.pontoLevel === 4) {
        dndRange = '120 pés (Movimento / Projétil)';
        fase2Vetor = 'Movimento / Projétil';
    } else if (patterns.pontoLevel === 3) {
        dndRange = 'Ancorado (Fixo)';
        fase2Vetor = 'Ancorado';
    } else if (patterns.pontoLevel === 0) {
        dndRange = 'Nulo / Instável';
        fase2Vetor = 'Nulo / Instável';
    }

    let dndDuration = 'Instantânea';
    if (patterns.manterLevel >= 4) dndDuration = '[EM DESENVOLVIMENTO]';
    else if (patterns.manterLevel === 3) dndDuration = 'Concentração, até 1 minuto';
    else if (patterns.manterLevel === 1) dndDuration = '1 rodada';

    let isHealing = element === 'VIDA/CURA' || currentAttrs.healing;
    
    let dndFullText = "";
    if (patterns.manterLevel >= 4) {
        dndFullText = "[EM DESENVOLVIMENTO] Módulo do Capacitor ainda em arquitetura na Forja Arcana.";
    } else if (patterns.pontoLevel === 0) {
        dndFullText = `A magia não possui geometria de ancoragem ou expansão válida, manifestando-se estaticamente sem alcance. Nenhum alvo pode ser definido logicamente.`;
    } else if (patterns.pontoLevel >= 5) {
        if (isHealing) {
             dndFullText = `Você traça uma mandala de poder regenerativo, purificando a área num volume expansivo. Cada criatura englobada recupera ${healDamage} pontos de vida incontestavelmente.`;
        } else {
             dndFullText = `Você converte a área num espaço de contenção geométrica absoluta (pentágono/mandala) aprisionando grande força primordial. A realidade local sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A topologia selada anula qualquer evasão, suprimindo o teste de resistência (dano automático).' : ` Alvos tentam resistência de Destreza (CD ${dc}) para reduzir à metade.`}`;
        }
    } else if (patterns.pontoLevel === 4) {
        if (isHealing) {
             dndFullText = `Você dispara um vetor cinético curativo através do espaço, atingindo com precisão um alvo. O feixe estabiliza feridas restaurando ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você gera um vetor balístico contendo força letal primordial. Faça um ataque à distância com magia. O alvo recebe ${spellDamage} de dano de ${damageBase.toLowerCase()}.${isDeterministic ? ' A cinemática é inevitável (auto-hit).' : ''}`;
        }
    } else if (patterns.pontoLevel === 3) {
        if (isHealing) {
             dndFullText = `Você fixa sua magia em um objeto, solo ou pessoa. Uma aura curativa emana do ponto, restaurando ${healDamage} pontos de vida.`;
        } else {
             dndFullText = `Você ancora o núcleo mágico em uma superfície ou alvo inflexível. Um ciclo destrutivo reverbera na âncora, causando ${spellDamage} de dano de ${damageBase.toLowerCase()} àqueles que ousarem tocá-la ou entrarem no espaço da geometria.${isDeterministic ? ' A destruição é certeira, sem evasão.' : ` Resistência de Destreza (CD ${dc}) aplica-se.`}`;
        }
    } else {
        if (isHealing) {
             dndFullText = `Ao tocar uma criatura, sua energia divina infunde vitalidade nela, curando-a em ${healDamage} pontos de vida através de feixes de ${damageBase.toLowerCase()}.`;
        } else {
             dndFullText = `A energia letal e bruta de ${damageBase.toLowerCase()} flui através de suas mãos. Faça um ataque corpo-a-corpo com magia contra uma criatura. Num acerto, ela sofre ${spellDamage} de dano de ${damageBase.toLowerCase()}.`;
        }
    }

    if (patterns.manterLevel === 3) {
        dndFullText += ` Devido à forte presença térmica ou entrópica, a área do feitiço se torna persistentemente instável. Qualquer criatura que inicie seu turno na área ou alvo afetado sofrerá efeitos secundários proporcionais a magia enquanto durar a concentração.`;
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

    const debugPathBlock = `[DEBUG_PATH]: { PontosTotal: ${patterns.pontosLength}, Fase2_Vetor: [${fase2Vetor}], Escala: [${descEscala}], Status: [${semanticErrors.length === 0 ? 'Sucesso' : 'Instável'}] }`;

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
