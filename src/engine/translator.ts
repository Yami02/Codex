import { CompiledSpell } from '../types/magic';

export class CodexTranslator {
  public translate(spell: CompiledSpell): CompiledSpell {
    const attrs = spell.finalAttributes as any;
    const coreElement = spell.spellName.split(' ').pop() || 'Desconhecido';
    
    let description = `**Manifestação Semântica de ${coreElement}**\n`;
    description += `*${spell.level}º nível de Magia de Codex*\n\n`;
    
    description += `**Tempo de Conjuração:** ${spell.castingTime}\n`;
    description += `**Alcance:** ${spell.range}\n`;
    description += `**Componentes:** ${spell.components}\n`;
    description += `**Duração:** ${spell.duration}\n\n`;

    description += `**Descrição Mecânica:**\n`;
    description += `A manifestação converte a estrutura fundamental do plano dimensional filtrada pela lente de ${coreElement}. `;
    
    const activeStats = [
        { name: 'Entropia', val: attrs.entropy },
        { name: 'Luminância', val: attrs.lumen },
        { name: 'Complexidade', val: attrs.complexity },
        { name: 'Acústica', val: attrs.sonic },
        { name: 'Força', val: attrs.strength },
        { name: 'Volume', val: attrs.volume },
        { name: 'Morfologia', val: attrs.morphology },
        { name: 'Ordem', val: attrs.order },
        { name: 'Caos', val: attrs.chaos },
        { name: 'Frequência', val: attrs.wave }
    ].filter(s => s.val && s.val !== 0).map(s => `${s.name} (${s.val})`).join(', ');

    description += `Atributos da magia gerada: ${activeStats || 'Nenhum atributo primário detectado'}.\n`;
    description += `Os gatilhos e aditivos vinculados determinam a formatação espacial. A magia propaga-se segundo a leitura conectiva elaborada pelos ciclos.\n\n`;

    description += `**Cálculo de Dano/Efeito:** ${spell.damageOrEffect}\n`;
    description += `**Estabilidade:** ${spell.instabilities.length === 0 ? 'Estável' : 'Instável'}\n`;

    spell.damageOrEffect = description;
    return spell;
  }
}
