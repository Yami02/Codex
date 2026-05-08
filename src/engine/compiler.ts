import { 
  MagicGraph, 
  CompiledSpell, 
  MagicNode, 
  NodeType, 
  CoreElement, 
  EdgeType,
  SubCircleNode,
  NodeAttributes
} from '../types/magic';

export class MagicCompiler {
  public instabilities: string[] = [];
  public auditLog: string[] = [];

  constructor() {
    this.instabilities = [];
    this.auditLog = [];
  }

  public compile(graph: MagicGraph): CompiledSpell {
    this.instabilities = [];
    this.auditLog = [];
    
    // 1. Validação
    this.validateValence(graph);

    // 2. Resolução do Grafo
    const finalAttributes = this.resolveGraph(graph);

    const statusTags = [...(finalAttributes.tags || [])];
    
    // Sustentação -> Concentração
    if (statusTags.includes('Concentração')) {
      finalAttributes.duration = 'Concentração, até 1 minuto';
    }

    // 3. Síntese de Elementos (Junções)
    if (statusTags.includes('Luz') && statusTags.includes('Composição')) {
      finalAttributes.healing = '2d6';
      finalAttributes.damageType = 'vida/cura';
      this.auditLog.push("Síntese Arcanica: Luz + Composição. Propriedade de VIDA/CURA ativada.");
    }
    if (statusTags.includes('Sombra') && statusTags.includes('Decomposição')) {
      finalAttributes.potency = (finalAttributes.potency || 0) + 6;
      finalAttributes.damageType = 'morte';
      this.auditLog.push("Síntese Arcanica: Sombra + Decomposição. Propriedade de MORTE ativada.");
    }
    if (statusTags.includes('Sombra') && statusTags.includes('Composição')) {
      finalAttributes.debuffs = [...(finalAttributes.debuffs || []), 'amaldiçoado'];
      this.auditLog.push("Síntese Arcanica: Sombra + Composição. Propriedade de MALDIÇÃO ativada.");
    }
    if (statusTags.includes('Terra') && statusTags.includes('Fogo')) {
      finalAttributes.damageType = 'lava/metal';
      finalAttributes.thermal = (finalAttributes.thermal || 0) + 4;
      this.auditLog.push("Síntese Arcanica: Terra + Fogo. Propriedade de LAVA/METAL ativada.");
    }
    if (statusTags.includes('Fogo') && statusTags.includes('Ar')) {
      finalAttributes.damageType = 'eletricidade';
      finalAttributes.potency = (finalAttributes.potency || 0) + 3;
      this.auditLog.push("Síntese Arcanica: Fogo + Ar. Propriedade de COMBUSTÃO/ELETRICIDADE ativada.");
    }
    if (statusTags.includes('Água') && statusTags.includes('Terra')) {
      finalAttributes.mass = (finalAttributes.mass || 0) + 5;
      finalAttributes.damageType = 'lodo/madeira';
      this.auditLog.push("Síntese Arcanica: Água + Terra. Propriedade de MADEIRA/LODO ativada.");
    }
    if (statusTags.includes('Água') && statusTags.includes('Ar')) {
      finalAttributes.stealth = (finalAttributes.stealth || 0) + 4;
      finalAttributes.damageType = 'nuvem';
      this.auditLog.push("Síntese Arcanica: Água + Ar. Propriedade de NUVEM embaçada.");
    }
    if (statusTags.includes('Luz') && statusTags.includes('Decomposição')) {
      finalAttributes.stealth = (finalAttributes.stealth || 0) + 5;
      finalAttributes.damageType = 'ilusão';
      this.auditLog.push("Síntese Arcanica: Luz + Decomposição. Propriedade de ILUSÃO/CONTRAMÁGICA.");
    }

    // Regra do Triângulo (Base estável)
    if (graph.nodes.length < 3) {
      this.instabilities.push("Pilar do Triângulo Incompleto: Magia instável (menos de 3 componentes).");
    }

    if ((finalAttributes.lumen || 0) <= 0) statusTags.push('INVISIBLE_SPELL');
    if ((finalAttributes.sonic || 0) <= 0) statusTags.push('SILENT');
    
    // Alerta de Instabilidade
    if ((finalAttributes.thermal || 0) > 10 && (finalAttributes.volatility || 0) > 5) {
      this.instabilities.push("Círculo Instável: Risco de Colapso Elemental Térmico");
    }

    finalAttributes.tags = statusTags;

    // 4. Formatação Final da Ficha
    return this.formatSpell(graph, finalAttributes);
  }

  private validateValence(graph: MagicGraph) {
    const provided = new Set<string>();
    const sortedNodes = [...graph.nodes].sort((a, b) => (a.layer || 0) - (b.layer || 0));

    for (const node of sortedNodes) {
      if (node.requires) {
        for (const req of node.requires) {
          if (!provided.has(req)) {
            this.instabilities.push(`Falha de Valência: O nó ${node.type} (${node.id}) requer [${req}]`);
          }
        }
      }
      if (node.provides) {
        node.provides.forEach(p => provided.add(p));
      }
      if (node.type === NodeType.SUBCIRCLE) {
        this.validateValence((node as SubCircleNode).magicGraph);
      }
    }
  }

  private resolveGraph(graph: MagicGraph): NodeAttributes {
    const core = graph.nodes.find(n => n.type === NodeType.CORE);
    if (!core) return {};

    let currentAttributes: NodeAttributes = { ...core.attributes };
    
    const layers = new Map<number, MagicNode[]>();
    for (const node of graph.nodes) {
      if (node.type === NodeType.CORE) continue;
      const l = node.layer || 1;
      if (!layers.has(l)) layers.set(l, []);
      layers.get(l)!.push(node);
    }

    const maxLayer = layers.size > 0 ? Math.max(...Array.from(layers.keys())) : 0;

    for (let i = 1; i <= maxLayer; i++) {
      const nodesInLayer = layers.get(i);
      if (!nodesInLayer) continue;

      // Primeiro, resolvemos as conexões lógicas (XOR, etc)
      const activeNodesInLayer = this.resolveConnections(nodesInLayer, graph.edges);

      // Segundo, resolvemos as "Implicações" ou "Atribuições" entre nós da mesma camada
      const modifiedNodes = this.applyStructuralEdges(activeNodesInLayer, graph.edges);

      for (const node of modifiedNodes) {
        let nodeAttrs = { ...node.attributes };

        if (node.type === NodeType.SUBCIRCLE) {
          nodeAttrs = this.resolveSubcycle(node as SubCircleNode);
        } else {
          // Logando a contribuição deste nó
          const coreDesc = (node as any).element || (node as any).additiveType || node.type;
          this.auditLog.push(`[Layer ${i}] +${coreDesc}: Lumen(${nodeAttrs.lumen || 0}) Thermal(${nodeAttrs.thermal || 0}) Potency(${nodeAttrs.potency || 0})`);
        }

        currentAttributes = this.mergeAttributes(currentAttributes, nodeAttrs);
      }
    }

    currentAttributes.maxLayer = maxLayer;
    return currentAttributes;
  }

  private applyStructuralEdges(nodes: MagicNode[], edges: any[]): MagicNode[] {
    const result = [...nodes];
    const attributionEdges = edges.filter(e => e.type === EdgeType.ATRIBUICAO);

    for (const edge of attributionEdges) {
      const source = result.find(n => n.id === edge.sourceId);
      const target = result.find(n => n.id === edge.targetId);

      if (source && target) {
        this.auditLog.push(`Implicação: ${source.id} modificando ${target.id}`);
        target.attributes = this.mergeAttributes(target.attributes || {}, source.attributes || {});
      }
    }
    return result;
  }

  private resolveConnections(nodesInLayer: MagicNode[], edges: any[]): MagicNode[] {
    const activeNodes = new Map<string, MagicNode>();
    nodesInLayer.forEach(n => activeNodes.set(n.id, n));
    
    const xorEdges = edges.filter(e => e.type === EdgeType.XOR);
    for (const edge of xorEdges) {
      if (activeNodes.has(edge.sourceId) && activeNodes.has(edge.targetId)) {
        activeNodes.delete(edge.targetId);
        this.instabilities.push(`Anulação XOR: O nó ${edge.targetId} foi sacrificado.`);
      }
    }

    return Array.from(activeNodes.values());
  }

  private resolveSubcycle(node: SubCircleNode): NodeAttributes {
    const subCompiler = new MagicCompiler();
    const subSpell = subCompiler.compile(node.magicGraph);
    
    subCompiler.instabilities.forEach(i => this.instabilities.push(`[Subciclo]: ${i}`));
    this.auditLog.push(`[Subciclo Resolvido/Kernel]: Lumen(${subSpell.finalAttributes.lumen}) Potency(${subSpell.finalAttributes.potency})`);

    const kernelAttrs = { ...subSpell.finalAttributes };
    // Subciclo perde a ideia de elemento
    delete (kernelAttrs as any).damageType;
    delete (kernelAttrs as any).healing;

    return kernelAttrs as any;
  }

  private mergeAttributes(attr1: NodeAttributes, attr2: NodeAttributes): NodeAttributes {
    const keys = [
      'lumen', 'sonic', 'thermal', 'olfactory',
      'mass', 'velocity', 'density', 'potency',
      'volatility', 'complexity', 'stealth', 'saveDCBonus'
    ];

    const merged: NodeAttributes = { ...attr1 };

    for (const key of keys) {
      const val1 = attr1[key] || 0;
      const val2 = attr2[key] || 0;
      merged[key] = val1 + val2;
    }

    merged.tags = [...new Set([...(attr1.tags || []), ...(attr2.tags || [])])];
    merged.debuffs = [...new Set([...(attr1.debuffs || []), ...(attr2.debuffs || [])])];
    merged.damageType = attr2.damageType || attr1.damageType;
    merged.baseDamage = attr2.baseDamage || attr1.baseDamage;
    merged.healing = attr2.healing || attr1.healing;

    return merged;
  }

  private formatSpell(graph: MagicGraph, attrs: NodeAttributes): CompiledSpell {
    const core = graph.nodes.find(n => n.type === NodeType.CORE) as any;
    const element = core ? core.element : 'Desconhecido';

    let school = 'Evocação';
    if (element === CoreElement.COMPOR || element === CoreElement.TERRA) school = 'Conjuração';
    if (attrs.healing || element === CoreElement.LUZ) school = 'Abjuração';
    if (element === CoreElement.AR) school = 'Transmutação';
    if (element === CoreElement.MORTE || element === CoreElement.DECOMPOR || element === CoreElement.SOMBRA) school = 'Necromancia';
    if (element === 'Psiquico' || element === 'Mente') school = 'Encantamento';

    let level = 1 + Math.floor((attrs.complexity || 0) / 3) + (attrs.maxLayer || 0);
    if (level > 9) level = 9;

    let castingTime = '1 Ação';
    if ((attrs.mass || 0) < 0) castingTime = '1 Ação Bônus';
    if ((attrs.mass || 0) > 10) castingTime = '1 Minuto';

    // 4. Dedução de Propriedades D&D 5e
    let rangeStr = 'Toque';
    if ((attrs.velocity || 0) > 0) {
      rangeStr = `${30 + (attrs.velocity || 0) * 10} pés (Arremessada)`;
    } else if ((attrs.rangeBonus || 0) > 0) {
      rangeStr = `${attrs.rangeBonus} pés (Aura)`;
    }

    // Mecânicas de Dano / Cura / Debuffs
    const damageDice = Math.max(1, level + Math.floor((attrs.potency || 0) / 2));
    let finalDamageType = attrs.damageType || 'força';
    
    // Mudança de estado baseada em temperatura extrema
    if (finalDamageType === 'fire' && (attrs.thermal || 0) < -5) finalDamageType = 'cold';
    if (finalDamageType === 'fire' && (attrs.thermal || 0) > 15) finalDamageType = 'radiant'; // Fogo branco

    let mechanics = '';
    if (attrs.healing) {
      mechanics = `Restaura ${damageDice}d${attrs.healing.split('d')[1] || '8'} HP.`;
    } else {
      mechanics = `Causa ${damageDice}d${attrs.baseDamage?.split('d')[1] || '8'} de dano ${finalDamageType}.`;
    }

    if (attrs.debuffs && attrs.debuffs.length > 0) {
      const dc = 10 + Math.floor(level / 2) + (attrs.saveDCBonus || 0);
      mechanics += ` CD ${dc} ou fica: ${attrs.debuffs.join(', ')}.`;
    }

    return {
      spellName: 'Manifestação Arcana',
      level,
      school,
      castingTime,
      range: rangeStr,
      components: attrs.tags?.includes('SILENT') ? 'S' : 'V, S',
      duration: 'Instantânea',
      damageOrEffect: mechanics,
      instabilities: this.instabilities,
      finalAttributes: {
        lumen: attrs.lumen || 0,
        sonic: attrs.sonic || 0,
        thermal: attrs.thermal || 0,
        olfactory: attrs.olfactory || 0,
        mass: attrs.mass || 0,
        velocity: attrs.velocity || 0,
        density: attrs.density || 0,
        potency: attrs.potency || 0,
        volatility: attrs.volatility || 0,
        complexity: attrs.complexity || 0,
        stealth: attrs.stealth || 0,
        status: attrs.tags || [],
        auditLog: this.auditLog
      }
    };
  }
}
