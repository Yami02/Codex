import { CompiledSpell } from '../types/magic';

export class CodexTranslator {
  
  public translate(spell: CompiledSpell): CompiledSpell {
    const attrs = spell.finalAttributes;
    const isInvisible = attrs.status.includes('INVISIBLE_SPELL');
    const isSilent = attrs.status.includes('SILENT');
    
    // 1. Geração do Nome
    spell.spellName = this.generateName(attrs, isInvisible, isSilent);

    // 2. Geração da Descrição de Lore
    spell.damageOrEffect = this.generateLore(attrs, isInvisible, isSilent, spell.instabilities);

    return spell;
  }

  private generateName(attrs: any, isInvisible: boolean, isSilent: boolean): string {
    let noun = 'Manifestação';
    if (attrs.density > 3) noun = 'Singularidade';
    else if (attrs.velocity > 3) noun = 'Projétil';
    else if (attrs.mass > 3) noun = 'Massa';
    else if (attrs.stealth > 2) noun = 'Sussurro';

    let adjective = 'Arcana';
    if (attrs.thermal > 3) adjective = 'Térmica';
    else if (attrs.thermal < -3) adjective = 'Gélida';
    else if (attrs.lumen > 3) adjective = 'Radiante';
    else if (attrs.sonic > 3) adjective = 'Ressonante';
    
    if (isInvisible && attrs.thermal > 0) adjective += ' Obscura';
    else if (isInvisible) adjective = 'Invisível';

    if (isSilent) adjective += ' e Silenciosa';

    return `${noun} ${adjective}`.trim();
  }

  private generateLore(attrs: any, isInvisible: boolean, isSilent: boolean, instabilities: string[]): string {
    let lore = '';

    // Sujeito Inicial baseado na Fenomenologia
    if (attrs.density > 3) {
      lore += `Uma zona de extrema densidade curva o espaço local. `;
    } else if (attrs.mass > 3) {
      lore += `Um impacto cinético massivo é invocado. `;
    } else if (attrs.thermal > 3) {
      lore += `Uma manifestação de calor estelar irrompe violentamente. `;
    } else if (attrs.thermal > 0) {
      lore += `Uma zona de calor estático deforma o ambiente. `;
    } else {
      lore += `A trama arcana se remodela em uma manifestação focalizada. `;
    }

    // Resolvendo XOR e Sacrifícios primeiro
    const xorSacrifices = instabilities.filter(i => i.includes('Anulação XOR'));
    if (xorSacrifices.length > 0) {
      lore += `O fluxo instável força o colapso estrutural, anulando parte de sua natureza para favorecer a essência primária. `;
    }

    // Se houver um Subciclo
    const hasSubcycle = instabilities.some(i => i.includes('[Subciclo]'));
    if (hasSubcycle && isInvisible) {
      lore += `Em seu interior, um filtro de escuridão profunda consome qualquer manifestação de brilho antes que possa emanar. `;
    } else if (hasSubcycle) {
      lore += `Alimentado por uma anomalia encapsulada que dita seu comportamento intrínseco. `;
    }

    // Aspectos Sensoriais e Aniquilação
    if (isInvisible && attrs.thermal > 0 && !hasSubcycle) {
      lore += `Apesar da energia termodinâmica avassaladora, a manifestação permanece em trevas absolutas, incapaz de emitir um único fóton. `;
    } else if (attrs.lumen > 3 && !isInvisible) {
      lore += `Sua radiação gera um brilho ofuscante impossível de ignorar. `;
    }

    if (isSilent && attrs.complexity > 0) {
      lore += `De forma antinatural, todo o processo ocorre em absoluto silêncio, dissipando ondas sonoras. `;
    }

    return lore.trim();
  }
}
