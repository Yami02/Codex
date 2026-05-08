import { NodeType, CoreElement, NodeAttributesDict, EdgeSymbols, EdgeType } from './src/magicConstants.js';
import fs from 'fs';

const graph = {
  "nodes": [
    {
      "id": "node_1778270190525",
      "type": "CORE",
      "element": "FOGO",
      "layer": 0
    }
  ],
  "edges": []
};

class MagicCompiler {
      static merge(a, b, propertyOnly = false) {
        if (!a) return b || {};
        if (!b) return a || {};
        
        const isKernel = b.isKernelBuffer;
        const res = { ...a, tags: [...new Set([...(a.tags || []), ...(b.tags || [])])] };
        
        const keys = ['thermal', 'entropy', 'morphology', 'volume', 'strength', 'wave', 'sonic', 'lumen', 'order', 'chaos', 'potency', 'complexity', 'mass', 'velocity'];
        keys.forEach(k => res[k] = (a[k] || 0) + (b[k] || 0));
        
        if (!propertyOnly && !isKernel) {
          res.damageType = b.damageType || a.damageType;
          res.baseDamage = b.baseDamage || a.baseDamage;
          res.healing = b.healing || a.healing;
        }
        
        res.debuffs = [...new Set([...(a.debuffs || []), ...(b.debuffs || [])])];
        if (b.duration) res.duration = b.duration;
        return res;
      }

      static _compileInternal(graph) {
        const core = graph.nodes.find(n => n.type === NodeType.CORE);
        if (!core) return null;

        let attrs = { ...(NodeAttributesDict[core.element] || {}), tags: [...(NodeAttributesDict[core.element]?.tags || [])] };
        const instabilities = [];
        const logs = [];

        const layers = [...new Set(graph.nodes.map(n => n.layer || 0))].sort();
        
        layers.forEach(L => {
          const nodes = graph.nodes.filter(n => n.layer === L && n.type !== NodeType.CORE);
          nodes.forEach(node => {
            const attributionEdges = graph.edges.filter(e => e.type === EdgeType.ATRIBUICAO && e.targetId === node.id);
            attributionEdges.forEach(edge => {
              const source = graph.nodes.find(n => n.id === edge.sourceId);
              if (source) {
                const sourceAttrs = source.type === NodeType.SUBCIRCLE ? MagicCompiler._compileInternal(source.magicGraph)?.attrs : NodeAttributesDict[source.additiveType];
                if (sourceAttrs) {
                  if (sourceAttrs.magnitude) {
                    let base = NodeAttributesDict[node.additiveType] || {};
                    node.tempAttrs = this.multiply(base, sourceAttrs.magnitude);
                  } else {
                    node.tempAttrs = this.merge(node.tempAttrs || NodeAttributesDict[node.additiveType] || {}, sourceAttrs);
                  }
                }
              }
            });
          });

          nodes.forEach(node => {
            let nodeAttrs = node.tempAttrs || NodeAttributesDict[node.additiveType] || {};
            let isPropertyOnly = false;

            const toCoreEdge = graph.edges.find(e => e.type === EdgeType.ATRIBUICAO && e.sourceId === node.id && e.targetId === core.id);
            if (toCoreEdge) isPropertyOnly = true;

            if (node.type === NodeType.SUBCIRCLE || node.type === NodeType.KERNEL) {
              const sub = MagicCompiler._compileInternal(node.magicGraph);
              if (sub) {
                nodeAttrs = { ...sub.attrs };
                if (node.type === NodeType.KERNEL) {
                  delete nodeAttrs.damageType;
                  delete nodeAttrs.healing;
                  delete nodeAttrs.baseDamage;
                  
                  const kernelBase = NodeAttributesDict[node.additiveType] || {};
                  nodeAttrs = this.merge(nodeAttrs, kernelBase, true);
                  nodeAttrs.isKernelBuffer = true;
                }
                (sub.instabilities || []).forEach(i => instabilities.push(i));
              }
            }
            
            attrs = this.merge(attrs, nodeAttrs, isPropertyOnly);
          });
        });

        const t = attrs.tags || [];

        if (t.includes('Fogo') && t.includes('Terra')) { attrs.damageType = 'lava'; attrs.thermal += 4; }
        if (t.includes('Fogo') && t.includes('Ar')) { attrs.damageType = 'combustão/eletricidade'; attrs.potency += 3; }
        if (t.includes('Água') && t.includes('Terra')) { attrs.damageType = 'lodo/madeira'; attrs.mass += 5; }
        if (t.includes('Água') && t.includes('Ar')) { attrs.damageType = 'nuvem'; attrs.stealth += 4; }
        if (t.includes('Luz') && t.includes('Composição')) { attrs.damageType = 'vida/cura'; attrs.healing = '2d6'; }
        if (t.includes('Luz') && t.includes('Decomposição')) { attrs.damageType = 'ilusão/contramágica'; attrs.stealth += 5; }
        if (t.includes('Sombra') && t.includes('Decomposição')) { attrs.damageType = 'morte/drenar'; attrs.potency += 6; }
        if (t.includes('Sombra') && t.includes('Composição')) { attrs.damageType = 'maldição'; attrs.debuffs = [...(attrs.debuffs || []), 'amaldiçoado']; }

        if (graph.nodes.length < 3) instabilities.push('Magia instável: Menos de 3 componentes detectados (Pilar do Triângulo ausente).');

        const level = 1 + Math.floor((attrs.complexity || 0) / 3);
        
        const subcirclesCount = graph.nodes.filter(n => n.type === NodeType.SUBCIRCLE).length;
        const subcirclesText = subcirclesCount > 0 ? `${subcirclesCount} Subciclo(s)` : 'Nenhum';
        
        const activeConnections = graph.edges.map(e => {
            const s = graph.nodes.find(n => n.id === e.sourceId);
            const t = graph.nodes.find(n => n.id === e.targetId);
            if (!s || !t) return null;
            return `${s.additiveType || s.element || '()'} ${EdgeSymbols[e.type] || '--'} ${t.additiveType || t.element || '()'}`;
        }).filter(Boolean).join(', ');

        const magicSchool = {
            [CoreElement.FOGO]: 'Evocação',
            [CoreElement.AGUA]: 'Abjuração/Conjuração',
            [CoreElement.TERRA]: 'Transmutação',
            [CoreElement.AR]: 'Transmutação/Evocação',
            [CoreElement.LUZ]: 'Ilusão/Evocação',
            [CoreElement.SOMBRA]: 'Necromancia/Ilusão'
        }[core.element] || 'Magia Universal';
        
        let damageDice = Math.max(1, Math.floor((attrs.potency || 0) / 2));
        let baseDamageType = attrs.damageType || (core.element === CoreElement.FOGO ? 'Fogo' : (core.element === CoreElement.TERRA ? 'Contundente' : 'Força Arcana'));
        let damageStr = attrs.healing ? `${damageDice}d8 + ${attrs.potency || 0} de Cura` : `${damageDice}d6 + ${attrs.potency || 0} de dano de ${baseDamageType}`;

        let castTime = attrs.mass > 10 ? '1 Minuto' : '1 Ação';
        let rangeStr = attrs.potency > 5 ? `${30 + (attrs.velocity || 0) * 10} pés` : 'Toque / Centrado no Conjurador';
        let durationStr = attrs.duration || ((attrs.mass || 0) > 5 ? 'Concentração, até 1 minuto' : 'Instantânea');

        const isStable = instabilities.length === 0;

        const magicDescription = `**Manifestação Semântica de ${core.element}**
*${level}º nível de ${magicSchool}*

**Tempo de Conjuração:** ${castTime}
**Alcance:** ${rangeStr}
**Componentes:** V, S, M (Codex Arcana)
**Duração:** ${durationStr}

**Descrição Mecânica:**
A manifestação converte a estrutura fundamental do plano dimensional filtrada pela lente de ${core.element}. A interpretação do Codex Arcana de dentro para fora gera uma teia estruturada de efeitos. Atributos da magia gerada: Térmico (${attrs.thermal || 0}), Cinético (${attrs.velocity || 0}), Luminância (${attrs.lumen || 0}), Entropia (${attrs.entropy || 0}), e Complexidade (${attrs.complexity || 0}). 
Os gatilhos e aditivos vinculados determinam a formatação espacial (Área de Efeito, Projétil ou Aura Localizada). A magia propaga-se segundo a leitura conectiva elaborada pelos ciclos, transmutando a realidade imediata.

**Cálculo de Dano/Efeito:** ${damageStr}
**Estabilidade:** ${isStable ? 'Estável' : 'Instável'}

**Log do Compilador:**
Núcleo Principal: ${core.element}
Subcírculos: ${subcirclesText}
Conexões Ativas: ${activeConnections || 'Nenhuma'}`;
        
        logs.push({ action: 'Compile Success', description: magicDescription, timestamp: new Date().toISOString() });

        return { attrs, instabilities, logs, element: core.element, description: magicDescription };
      }
}

console.log(MagicCompiler._compileInternal(graph));
