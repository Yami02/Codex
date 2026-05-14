import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MOCK_MONSTERS = [
  {
    id: 1,
    name: "Sombras (Shadows)",
    imageUrl: "https://images.unsplash.com/photo-1542442436-1e64627d3148?q=80&w=1000&auto=format&fit=crop",
    description: `Pessoas que "viram do avesso" ao perderem a alma. Tornam-se cascas vazias e famintas que consomem magia. Quanto mais absorvem, mais densas, rápidas e complexas suas formas se tornam, ganhando membros extras de escuridão pura.`,
    prompt: "Conceptual art of a shadow monster, a humanoid silhouette devoid of a soul, wispy edges composed of absolute darkness, multiple dark tentacles emerging as limbs, red malevolent eyes. The creature is actively absorbing glowing cyan magical energy arcs from a wizard's staff, making it visibly grow denser and taller. The background is a stark white void with glowing ancient runes. --ar 16:9 --v 6.0",
    baseCr: 1,
    baseAc: 12,
    baseHp: 16,
    conMod: 0 /* Ajustado para bater exatamente com a matemática do exemplo (16 -> 32 no CR 5) */,
    damageBaseStr: "1d6 + 2 de força",
    damageDiceCount: 1,
    damageDiceSides: 6,
    damageBonus: 2,
    damageType: "força",
    speed: "30ft, Fly 40ft (hover)",
    baseAbility: "Drenar Magia (1/dia).",
  },
  {
    id: 2,
    name: "Porcos de Tetas (Teat-Pigs)",
    imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1000&auto=format&fit=crop",
    description: `Aberrações grotescas. Não possuem patas dianteiras, andando desajeitadamente apenas com as patas traseiras. Para voar, utilizam seus próprios peitos flácidos e inflados como asas ou órgãos de levitação orgânica.`,
    prompt: `A bizarre and grotesque fantasy creature, a mutant domestic pig with no front limbs, walking clumsily on its hind legs only. It has large, flabby, inflated tits instead of wings, positioned near its shoulders, which pulse with unnatural internal pressure to provide lift. The creature has a manic, snorting expression. Cinematic lighting, photorealistic texture, murky background. --ar 3:4 --v 6.0`,
    baseCr: 2,
    baseAc: 10,
    baseHp: 22,
    conMod: 2,
    damageBaseStr: "2d4 + 1 contundente",
    damageDiceCount: 2,
    damageDiceSides: 4,
    damageBonus: 1,
    damageType: "contundente",
    speed: "20ft, Fly 30ft (desajeitado)",
    baseAbility: "Carga Repulsiva (1/dia)",
  },
  {
    id: 3,
    name: "Kimkris (Parasitic Ooze)",
    imageUrl: "https://images.unsplash.com/photo-1629814421293-8da5b42d721f?q=80&w=1000&auto=format&fit=crop",
    description: `Um limo amarelo parasita. Em níveis baixos, é visível através da pele do hospedeiro animal, parecendo um fungo limoso brilhante, mas concedendo força absurda. Em níveis altos, o Kimkris consome os órgãos internos e assume o controle total.`,
    prompt: `A parasitic yellow ooze symbiotic relationship, the bright yellow mold-like fungus is visibly spreading beneath the translucent skin of a wolf, pulsating with power and making its muscles look unnaturally dense. The slime has formed a pseudo-central nervous system visible near the wolf's skull. Moody, dark forest setting, high contrast bioluminescence. --ar 1:1 --v 6.0`,
    baseCr: 3,
    baseAc: 13,
    baseHp: 18,
    conMod: 1,
    damageBaseStr: "1d8 + 3 ácido",
    damageDiceCount: 1,
    damageDiceSides: 8,
    damageBonus: 3,
    damageType: "ácido",
    speed: "40ft (depende do hospedeiro)",
    baseAbility: "Controle Neural (1/dia)",
  },
  {
    id: 4,
    name: "Grimgar (The Crow Kin)",
    imageUrl: "https://images.unsplash.com/photo-1543329065-5c1cfba119c4?q=80&w=1000&auto=format&fit=crop",
    description: `Uma família de corvos que age como um único corpo e mente. Tudo o que um corvo aprende, todos sabem. Sua forma inicial é um corvo grotesco e desproporcional. Eles são transmorfos e costumam usar formas humanas para governar vilas.`,
    prompt: `A grotesque swarm of shapeshifting crows, hundreds of ravens clinging together on a massive, deformed skeleton, forming a singular, colossal, ragged entity that mimics a human lord in posture but is clearly composed of screeching birds. Crows are exchanging pieces of knowledge visibly through dark energy arcs between their eyes. Dark fantasy village setting, gothic atmosphere, ominous lighting. --ar 16:9 --v 6.0`,
    baseCr: 4,
    baseAc: 14,
    baseHp: 25,
    conMod: 1,
    damageBaseStr: "2d6 + 2 perfurante",
    damageDiceCount: 2,
    damageDiceSides: 6,
    damageBonus: 2,
    damageType: "perfurante",
    speed: "30ft, Fly 50ft",
    baseAbility: "Mente de Enxame (1/dia)",
  },
  {
    id: 5,
    name: "Tecelão de Carne (Flesh Weaver)",
    imageUrl: "https://images.unsplash.com/photo-1505503072223-2895690b29ce?q=80&w=1000&auto=format&fit=crop",
    description: `Uma abelha esquelética gigante cujas asas são feitas de pele humana esticada. Ela usa agulhas de osso e fios de tendão para "costurar" suas vítimas ainda vivas em casulos de carne, criando servos acéfalos e costurados.`,
    prompt: `Dark fantasy concept art of a giant skeletal bee creature. Its wings are large panels of stretched human skin stitched together with sinew, pulsing with arcane veins. Its legs end in sharp, bone needles. It is hovering over a cocoon made of stitched, still-living humanoid flesh on a dark forest floor. Gothic atmosphere, horrific details, cinematic lighting. --ar 16:9 --v 6.0`,
    baseCr: 5,
    baseAc: 15,
    baseHp: 40,
    conMod: 2,
    damageBaseStr: "2d8 + 3 perfurante",
    damageDiceCount: 2,
    damageDiceSides: 8,
    damageBonus: 3,
    damageType: "perfurante",
    speed: "20ft, Fly 60ft",
    baseAbility: "Costurar Casulo (1/dia)",
  },
  {
    id: 6,
    name: "Mandíbula Subterrânea (Burrowing Maw)",
    imageUrl: "https://images.unsplash.com/photo-1518063073998-d1a10de35d88?q=80&w=1000&auto=format&fit=crop",
    description: `Um verme gigante sem olhos que consiste inteiramente de mandíbulas concêntricas e rotativas feitas de rocha obsidian. Ele não apenas cava, ele "tritura" a realidade, deixando túneis de vácuo semântico para trás.`,
    prompt: `An eyeless subterranean giant worm monster, composed entirely of concentric, rotating jaws of jagged obsidian rock. It is actively grinding through the earth, leaving behind a tunnel of strange, flickering, non-existent vacuum instead of a physical hole. Bioluminescent fungi light the cavern from below. Low angle shot, massive scale, detailed rock textures. --ar 16:9 --v 6.0`,
    baseCr: 6,
    baseAc: 16,
    baseHp: 65,
    conMod: 3,
    damageBaseStr: "3d8 + 4 cortante",
    damageDiceCount: 3,
    damageDiceSides: 8,
    damageBonus: 4,
    damageType: "cortante/anulação",
    speed: "20ft, Burrow 60ft",
    baseAbility: "Destruição Semântica (1/dia)",
  },
  {
    id: 7,
    name: "Cabeça Murmurante (Whispering Head)",
    imageUrl: "https://images.unsplash.com/photo-1509200424683-1463e264010a?q=80&w=1000&auto=format&fit=crop",
    description: `Uma cabeça decepada que flutua usando uma cabeleira feita de línguas costuradas. Ela não ataca fisicamente, mas murmura segredos cósmicos instáveis que causam colapso mental (dano psíquico) em quem ouve.`,
    prompt: `A severed human head floating in mid-air, its "hair" is made of hundreds of human tongues stitched together with glowing silver threads, constantly whispering and lashing. Its eyes are milky white, and its mouth is stitched shut with barbed wire. Ethereal blue light illuminates it from behind, smoky, dark environment. --ar 1:1 --v 6.0`,
    baseCr: 2,
    baseAc: 11,
    baseHp: 13,
    conMod: 0,
    damageBaseStr: "2d6 psíquico",
    damageDiceCount: 2,
    damageDiceSides: 6,
    damageBonus: 0,
    damageType: "psíquico",
    speed: "Fly 30ft (hover)",
    baseAbility: "Sussurros do Colapso (1/dia)",
  },
  {
    id: 8,
    name: "Autômato Acorrentado (Chained Automaton)",
    imageUrl: "https://images.unsplash.com/photo-1616422204780-e4b9bb9953d6?q=80&w=1000&auto=format&fit=crop",
    description: `Um autômato rústico feito de metal sagrado derretido e ossos de santos. Ele está acorrentado a um monolito de pedra de 10 toneladas que ele arrasta. Ele não tem livre arbítrio, executando apenas a última ordem de seu criador morto.`,
    prompt: `A dark fantasy, rustic automaton made of fused, corroded holy metal and large, polished saint bones. It is chained by massive, glowing rusted iron links to a jagged stone monolith ten times its size, which it is dragging across a barren landscape. It has no head, only a pulsating magical core. Ominous, stormy sky, desaturated colors. --ar 16:9 --v 6.0`,
    baseCr: 7,
    baseAc: 18,
    baseHp: 80,
    conMod: 4,
    damageBaseStr: "2d10 + 5 concussão",
    damageDiceCount: 2,
    damageDiceSides: 10,
    damageBonus: 5,
    damageType: "concussão",
    speed: "15ft",
    baseAbility: "Arrastar Monolito (Passiva)",
  },
  {
    id: 9,
    name: "Isca Bioluminescente (Bioluminescent Lure)",
    imageUrl: "https://images.unsplash.com/photo-1518331539958-8120e24ec1d0?q=80&w=1000&auto=format&fit=crop",
    description: `Uma aberração marinha ou pantanosa. Sua cabeça é uma flor bioluminescente hipnótica e deslumbrante que atrai presas curiosas. Seu corpo verdadeiro, no entanto, é um emaranhado de tentáculos de gancho e mandíbulas dentadas escondidos.`,
    prompt: `A bioluminescent lure aberration in a murky swamp at night. Above water, it displays a dazzling, hypnotic flower-like structure glowing with vibrant, pulsating cyan and magenta light, attracting curious sprites. Submerged beneath the black mud, its true body is a horrifying tangle of black, hook-tipped tentacles and jagged jaws. Deep depth of field, detailed water reflections, moody ambiance. --ar 16:9 --v 6.0`,
    baseCr: 3,
    baseAc: 13,
    baseHp: 28,
    conMod: 2,
    damageBaseStr: "1d10 + 3 perfurante",
    damageDiceCount: 1,
    damageDiceSides: 10,
    damageBonus: 3,
    damageType: "perfurante + agarre",
    speed: "10ft, Swim 40ft",
    baseAbility: "Luz Hipnótica (1/dia)",
  },
  {
    id: 10,
    name: "Simbionte Fúngico Grosseiro (Gross Symbiote)",
    imageUrl: "https://images.unsplash.com/photo-1616782298622-c13f9c6d32ce?q=80&w=1000&auto=format&fit=crop",
    description: `Uma criatura humanóide completamente coberta por um fungo espesso, pulsante e colorido. O fungo não é apenas armadura, ele é um órgão digestivo externo. Ele digere presas através do toque e injeta esporos.`,
    prompt: `A humanoid creature completely covered in a thick, pulsating symbiote of gross, colorful fungus. The fungus is not armor but an active external digestive organ, secreting acid through its vibrant orange and purple spores upon contact with a decaying log. Its original face is visible, distorted, through the transparent slime layer. Photorealistic textures, dark fantasy aesthetic. --ar 16:9 --v 6.0`,
    baseCr: 4,
    baseAc: 14,
    baseHp: 35,
    conMod: 3,
    damageBaseStr: "1d8 + 2 necrótico",
    damageDiceCount: 1,
    damageDiceSides: 8,
    damageBonus: 2,
    damageType: "necrótico",
    speed: "30ft",
    baseAbility: "Esporos Parasitas (1/dia)",
  }
];

export const LivroMonstros = () => {
  const [selectedId, setSelectedId] = useState(MOCK_MONSTERS[0].id);
  const [targetCr, setTargetCr] = useState(MOCK_MONSTERS[0].baseCr);

  const monster = MOCK_MONSTERS.find(m => m.id === selectedId) || MOCK_MONSTERS[0];

  const handleSelectMonster = (id: number) => {
    const m = MOCK_MONSTERS.find(x => x.id === id);
    if(m) {
      setSelectedId(id);
      setTargetCr(Math.max(targetCr, m.baseCr));
    }
  };

  const crDiff = Math.max(0, targetCr - monster.baseCr);
  
  // Tiers CR logic based on targetCr
  let tier = 'Base';
  let hpMulti = 1;

  if (targetCr >= 17) {
      tier = 'Lenda';
      hpMulti = 4;
  } else if (targetCr >= 11) {
      tier = 'Alpha';
      hpMulti = 3;
  } else if (targetCr >= 5) {
      tier = 'Elite';
      hpMulti = 2;
  }

  // Math
  const atributos = {
    fisico: 10 + (monster.conMod * 2) + Math.floor(crDiff / 2),
    precisao: 10 + monster.conMod + Math.floor(crDiff / 3),
    resistencia: 10 + (monster.conMod * 2) + Math.floor(crDiff / 2),
    mente: 10 + Math.floor(crDiff / 4),
    vontade: 10 + monster.conMod + Math.floor(crDiff / 3),
    eloquencia: 8 + Math.floor(crDiff / 5),
  };

  const calculatedAc = monster.baseAc + Math.floor(crDiff / 2);
  const hpBonusFromResistencia = crDiff * Math.floor((atributos.resistencia - 10) / 2);
  const calculatedHp = (monster.baseHp + hpBonusFromResistencia) * hpMulti;
  const addedDice = Math.floor(crDiff / 3);
  
  const dmgBonus = monster.damageBonus + Math.floor((atributos.fisico - 10) / 2);
  const finalDiceCount = monster.damageDiceCount + addedDice;
  const finalDamageStr = `${finalDiceCount}d${monster.damageDiceSides} + ${dmgBonus} ${monster.damageType}`;
  
  const prof = 2 + Math.floor(Math.max(0, targetCr - 1) / 4);
  const saveDc = 8 + prof + Math.floor((atributos.mente - 10) / 2);

  // Features mapping String
  let abilitiesText = monster.baseAbility;
  // Apply usages per day scaling roughly equivalent to tier
  if (tier === 'Elite') abilitiesText = abilitiesText.replace('1/dia', '3/dia');
  else if (tier === 'Alpha') abilitiesText = abilitiesText.replace('1/dia', '5/dia');
  else if (tier === 'Lenda') abilitiesText = abilitiesText.replace('1/dia', 'Ilimitado');

  const extraFeatures = [];
  if (targetCr >= 5) extraFeatures.push('Multiataque (2 ataques)');
  if (targetCr >= 11) extraFeatures.push('Resistência Lendária (1/dia)');
  if (targetCr >= 17) {
    // Substitui 2 ataques pra 3 se lenda
    const index = extraFeatures.indexOf('Multiataque (2 ataques)');
    if (index !== -1) extraFeatures[index] = 'Multiataque (3 ataques)';
    extraFeatures.push('Ações Lendárias');
  }

  // Logs Generation
  const logs = [];
  if (tier !== 'Base') logs.push(`Processando Upgrade... Tier ${tier} Aplicado.`);
  if (hpMulti > 1) logs.push(`HP Multiplicado (x${hpMulti}) (Fase 1: Estabilidade redundante).`);
  if (crDiff >= 2) logs.push(`AC +${Math.floor(crDiff/2)} (Refinamento Rúnico).`);
  if (addedDice > 0) logs.push(`Dano +${addedDice}d${monster.damageDiceSides} (Kernel de Entropia).`);
  if (extraFeatures.length > 0) logs.push(`Atributos de Combate concedidos (Conectividade duplicada).`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#05040a', color: '#d4af37', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.5rem', color: '#1dd1a1' }}>O Livro Dinâmico de Monstros</h1>
          <span style={{ fontSize: '0.8rem', color: '#8a7d9b' }}>CR Engine Upgradable // v4.1</span>
        </div>
        <Link to="/" style={{ color: '#d4af37', textDecoration: 'none', border: '1px solid #d4af37', padding: '8px 16px', borderRadius: '4px', fontSize: '0.9rem', transition: 'all 0.2s' }}>
          Voltar ao Hub
        </Link>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar */}
        <div style={{ width: '350px', borderRight: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', flexDirection: 'column', background: '#0a0812' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', margin: 0, color: '#feca57' }}>Aberrações (10)</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {MOCK_MONSTERS.map(m => (
              <div 
                key={m.id}
                onClick={() => handleSelectMonster(m.id)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  cursor: 'pointer',
                  background: selectedId === m.id ? 'rgba(29, 209, 161, 0.1)' : 'transparent',
                  borderLeft: selectedId === m.id ? '4px solid #1dd1a1' : '4px solid transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 600, color: selectedId === m.id ? '#1dd1a1' : '#d4af37', marginBottom: '4px' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8a7d9b' }}>CR Base: {m.baseCr}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Output & Visuals */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              
              {/* Imagem do Monstro */}
              {monster.imageUrl && (
                <div style={{ width: '300px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #d4af37' }}>
                  <img src={monster.imageUrl} alt={monster.name} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: '300px' }}>
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', margin: '0 0 1rem 0', color: '#feca57' }}>{monster.name}</h2>
                <p style={{ color: '#c8d6e5', lineHeight: 1.6, marginBottom: '2rem' }}>
                  {monster.description}
                </p>

                <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', border: '1px dashed #3a2f4c' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#8a7d9b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Midjourney Prompt (EN)</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#1dd1a1', fontFamily: 'monospace' }}>
                    {monster.prompt}
                  </p>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'rgba(212, 175, 55, 0.2)', margin: '2rem 0' }}/>

            {/* Slider Configuração */}
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', marginBottom: '1rem', color: '#ff9ff3' }}>[ Módulo de Compilação do Desafio ]</h3>
            <div style={{ background: '#120e1f', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 159, 243, 0.3)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>Challenge Rating Atual: <strong style={{ color: '#1dd1a1', fontSize: '1.4rem' }}>{targetCr}</strong></span>
                <span style={{ color: '#8a7d9b', fontSize: '0.9rem', border: '1px solid #8a7d9b', padding: '4px 8px', borderRadius: '4px' }}>
                  Tier: <strong style={{ color: tier === 'Base' ? '#d4af37' : (tier === 'Elite' ? '#1dd1a1' : (tier === 'Alpha' ? '#ff9ff3' : '#ff6b6b')) }}>{tier}</strong>
                </span>
              </div>
              
              <input 
                type="range" 
                min={monster.baseCr} 
                max={30} 
                value={targetCr} 
                onChange={(e) => setTargetCr(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', appearance: 'auto', accentColor: '#1dd1a1' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8a7d9b', marginTop: '0.5rem' }}>
                <span>Base (CR {monster.baseCr})</span>
                <span>Deus (CR 30)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Stat Block Final */}
              <div style={{ flex: 1, minWidth: '300px', background: 'rgba(235, 230, 220, 0.05)', border: '1px solid #d4af37', padding: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#d4af37' }}></div>
                
                <h2 style={{ fontFamily: 'Cinzel, serif', color: '#feca57', borderBottom: '2px solid #d4af37', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  {monster.name.split(' (')[0]} - Nível {targetCr}
                </h2>
                
                <div style={{ color: '#ff9ff3', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                  Aberração {tier}, Desalinhada
                </div>
                
                <div style={{ borderTop: '1px dotted #d4af37', borderBottom: '1px dotted #d4af37', padding: '0.8rem 0', color: '#c8d6e5' }}>
                  <div><strong>Armor Class (AC):</strong> {calculatedAc} {crDiff > 0 && <span style={{ color: '#1dd1a1', fontSize: '0.8rem' }}>(+{Math.floor(crDiff/2)} Refinamento)</span>}</div>
                  <div><strong>Hit Points (HP):</strong> {calculatedHp} {hpMulti > 1 && <span style={{ color: '#1dd1a1', fontSize: '0.8rem' }}>(Base Multiplicada x{hpMulti})</span>}</div>
                  <div><strong>Velocidade:</strong> {monster.speed}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                     <div><span style={{ fontSize: '0.7rem', color: '#d4af37', display: 'block', textTransform: 'uppercase' }}>Físico</span><strong>{atributos.fisico}</strong></div>
                     <div><span style={{ fontSize: '0.7rem', color: '#d4af37', display: 'block', textTransform: 'uppercase' }}>Precisão</span><strong>{atributos.precisao}</strong></div>
                     <div><span style={{ fontSize: '0.7rem', color: '#d4af37', display: 'block', textTransform: 'uppercase' }}>Resistência</span><strong>{atributos.resistencia}</strong></div>
                     <div><span style={{ fontSize: '0.7rem', color: '#d4af37', display: 'block', textTransform: 'uppercase' }}>Mente</span><strong>{atributos.mente}</strong></div>
                     <div><span style={{ fontSize: '0.7rem', color: '#d4af37', display: 'block', textTransform: 'uppercase' }}>Vontade</span><strong>{atributos.vontade}</strong></div>
                     <div><span style={{ fontSize: '0.7rem', color: '#d4af37', display: 'block', textTransform: 'uppercase' }}>Eloquência</span><strong>{atributos.eloquencia}</strong></div>
                  </div>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <h4 style={{ color: '#feca57', margin: '0 0 0.5rem 0' }}>Ações e Habilidades Base</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8d6e5', fontSize: '0.95rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>Dano Primário:</strong> {finalDamageStr}
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>{abilitiesText.split(':')[0]}:</strong> {abilitiesText.includes(':') ? abilitiesText.split(':')[1] : abilitiesText}
                    </li>
                    <li>
                      <strong>CD de Resistência:</strong> {saveDc} (Para efeitos que exijam Salvaguarda)
                    </li>
                  </ul>
                </div>

                {extraFeatures.length > 0 && (
                   <div style={{ margin: '1.5rem 0 0 0', padding: '1rem', background: 'rgba(29, 209, 161, 0.05)', borderLeft: '3px solid #1dd1a1' }}>
                    <h4 style={{ color: '#1dd1a1', margin: '0 0 0.5rem 0' }}>Mutações do Tier {tier}</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8d6e5', fontSize: '0.9rem' }}>
                      {extraFeatures.map((feat, i) => <li key={i} style={{ marginBottom: '0.2rem' }}>{feat}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Logs do Output */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#c8d6e5' }}>Output do Compilador</h3>
                <div style={{ background: '#05040a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a29bfe', height: '100%', minHeight: '300px' }}>
                  {logs.length === 0 ? (
                    <span style={{ color: '#8a7d9b' }}>Nenhum Upgrade Sistêmico Processado. A criatura encontra-se em seu CR base orgânico.</span>
                  ) : (
                    <>
                      {logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: '#ff9ff3' }}>{'>'}</span>
                          <span>{log}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', color: '#1dd1a1' }}>
                        {'[ SISTEMA ] >> Ficha Atualizada em Tempo Real.'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
