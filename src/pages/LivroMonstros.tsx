import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skull, Bone, Ghost, Flame, Droplets, Eye } from 'lucide-react';

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
    <div className="flex flex-col h-[100dvh] monster-page text-[#3b2818] overflow-hidden select-none">
      
      <div className="px-4 md:px-8 py-3 border-b-2 border-[#5c3a21] flex flex-col sm:flex-row justify-between items-center bg-[#150f0a] shadow-xl z-20 gap-3 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="m-0 font-metal text-2xl md:text-3xl text-[#a31c1c] tracking-wider drop-shadow-md">Bestiário Maldito</h1>
          <span className="text-[10px] md:text-xs text-[#8a7d9b] font-serif italic">Registros manchados de sangue // Cuidado com as páginas soltas</span>
        </div>
        <Link to="/" className="text-[#a31c1c] no-underline border border-[#5c3a21] hover:bg-[#a31c1c] hover:text-[#150f0a] px-3 md:px-4 py-2 text-xs md:text-sm transition-all font-metal uppercase tracking-widest text-center">
          Fugir do Arquivo
        </Link>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden flashback-filter font-serif relative">
        { /* Blood drip effect for hard monsters */ }
        {(tier === 'Elite' || tier === 'Alpha' || tier === 'Lenda') && <div className="blood-drip" style={{height: targetCr >= 17 ? '150px' : (targetCr >= 11 ? '100px' : '50px')}}></div>}
        
        {/* Sidebar */}
        <div className="w-full md:w-[350px] h-[30vh] md:h-auto border-b-2 md:border-b-0 md:border-r-2 border-[#3b2818] flex flex-col bg-[#0a0705] z-10 shadow-[0_5px_15px_rgba(0,0,0,0.8)] md:shadow-[5px_0_15px_rgba(0,0,0,0.8)] relative">
          <div className="p-4 border-b border-[#3b2818]">
            <h2 className="font-metal text-xl m-0 text-[#8c6b4e] tracking-widest text-center shadow-black">Almas Condenadas</h2>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {MOCK_MONSTERS.map(m => (
              <div 
                key={m.id}
                onClick={() => handleSelectMonster(m.id)}
                className={`p-4 border-b border-[#3b2818]/30 cursor-pointer transition-colors relative blood-splatter
                  ${selectedId === m.id ? 'bg-[#1c0a0a] border-l-[3px] border-l-[#a31c1c]' : 'bg-transparent border-l-[3px] border-l-transparent hover:bg-[#120a07]'}`}
              >
                <div className={`text-xl font-metal tracking-wider ${selectedId === m.id ? 'text-[#a31c1c]' : 'text-[#8c6b4e]'} mb-1`}>
                  {m.name}
                </div>
                <div className="text-xs text-[#5a483a] italic font-serif">Ameaça Original: {m.baseCr}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Output & Visuals - The Cursed Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 relative">
          
          <div className={`max-w-4xl mx-auto cursed-paper-dark p-8 md:p-12 mb-10 transition-transform duration-300 ${targetCr >= 17 ? 'fear-shake' : ''}`}>
            <div className="vignette-pulse"></div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 relative z-10">
              
              {/* Imagem do Monstro */}
              {monster.imageUrl && (
                <div className="w-full md:w-[350px] shrink-0 border-[3px] border-[#333] p-1 bg-[#111] rotate-1 hover:rotate-0 transition-transform shadow-2xl mx-auto max-w-[300px] md:max-w-none">
                  <img src={monster.imageUrl} alt={monster.name} className="w-full h-auto block object-cover monster-sketch" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="font-metal text-3xl sm:text-4xl md:text-5xl m-0 mb-4 text-[#8b0000] drop-shadow-sm uppercase tracking-wider blood-gradient-text text-shadow-bone px-2">{monster.name}</h2>
                <div className="text-[#d4cfb8] leading-relaxed mb-6 md:mb-8 text-base md:text-lg font-apple ink-writing font-bold drop-shadow-[0_0_1px_rgba(0,0,0,0.5)] max-w-full overflow-hidden">
                  {monster.description}
                </div>

                <div className="bg-[#111]/80 p-3 md:p-4 border border-dashed border-[#5c3a21] shadow-inner stain-brown-dark">
                  <h4 className="m-0 mb-2 text-[#8c6b4e] text-xs uppercase font-bold tracking-widest font-sans text-shadow-bone">Fragmento de Visão (Prompt)</h4>
                  <p className="m-0 text-[10px] md:text-xs text-[#a37d5c] font-mono italic opacity-90 text-shadow-bone break-words">
                    {monster.prompt}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-[2px] bg-[#5c3a21] opacity-60 my-6 md:my-8 mx-auto relative z-10" />

            {/* Slider Configuração */}
            <h3 className="font-metal text-xl md:text-2xl mb-4 text-[#8b0000] tracking-widest text-center text-shadow-bone relative z-10">Ritual de Mutação</h3>
            
            <div className="bg-[#111] p-4 md:p-6 border-[2px] border-[#333] shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] mb-8 md:mb-10 relative overflow-hidden z-10">
               {targetCr >= 17 && <div className="absolute inset-0 stain-red opacity-30 pointer-events-none"></div>}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 mb-4 sm:items-center relative z-10">
                <span className="text-base md:text-lg text-[#d4cfb8] font-bold font-serif italic text-shadow-bone">Nível de Corrupção: <strong className="blood-gradient-text text-2xl md:text-3xl font-metal not-italic ml-2">{targetCr}</strong></span>
                <span className="text-[10px] md:text-xs border border-[#8b0000] bg-[#1a0a0a] text-[#d4cfb8] px-2 md:px-3 py-1 font-metal uppercase tracking-widest shadow-md text-shadow-bone self-start sm:self-auto">
                  Ameaça: <strong className="text-[#f0ead6] ml-1">{tier}</strong>
                </span>
              </div>
              
              <input 
                type="range" 
                min={monster.baseCr} 
                max={30} 
                value={targetCr} 
                onChange={(e) => setTargetCr(parseInt(e.target.value))}
                className="w-full cursor-pointer opacity-80 hover:opacity-100 transition-opacity accent-[#8b0000] relative z-10"
              />
              <div className="flex justify-between text-[10px] md:text-xs text-[#d4cfb8] mt-3 font-serif font-bold relative z-10 text-shadow-bone">
                <span>Criatura Natural (CR {monster.baseCr})</span>
                <span>Pesadelo Encarnado (CR 30)</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 relative z-10">
              {/* Stat Block Final */}
              <div className="flex-1 min-w-0 border-t-4 border-b-4 border-double border-[#8b0000] py-4 md:py-6 px-3 md:px-4 relative bg-[#1a1a1a]/60 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] stain-brown-dark rounded">
                
                <h2 className="font-metal text-2xl sm:text-3xl md:text-4xl mb-1 tracking-widest text-[#8b0000] font-bold blood-gradient-text text-shadow-bone break-words">
                  {monster.name.split(' (')[0]} <span className="text-xl md:text-2xl text-[#d4cfb8]">[{targetCr}]</span>
                </h2>
                
                <div className="text-[#a37d5c] text-xs md:text-sm mb-4 font-serif italic font-bold text-shadow-bone">
                  Horror Anômalo ({tier})
                </div>
                
                <div className="border-t border-b border-[#333] py-4 text-[#f0ead6] font-serif font-semibold text-base md:text-lg leading-relaxed text-shadow-bone relative z-20">
                  <div><strong className="font-metal text-xl md:text-2xl uppercase tracking-wider text-[#8b0000]">Defesa:</strong> {calculatedAc} {crDiff > 0 && <span className="text-[#a37d5c] text-xs md:text-sm">(+{Math.floor(crDiff/2)} Escamas)</span>}</div>
                  <div><strong className="font-metal text-xl md:text-2xl uppercase tracking-wider text-[#8b0000]">Vitalidade:</strong> {calculatedHp} {hpMulti > 1 && <span className="text-[#a37d5c] text-xs md:text-sm">(x{hpMulti} Carne)</span>}</div>
                  <div><strong className="font-metal text-xl md:text-2xl uppercase tracking-wider text-[#8b0000]">Movimentação:</strong> {monster.speed.replace('ft', ' pés').replace('Fly', 'Voo').replace('Burrow', 'Escavação').replace('Swim', 'Nado')}</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-6 text-left bg-[#111]/80 border border-[#333] p-3 md:p-4 shadow-inner relative z-20 stain-brown-dark">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Bone className="w-4 h-4 md:w-5 md:h-5 text-[#E2D1B3]"/><span className="text-[10px] md:text-xs text-[#E2D1B3] uppercase font-bold font-sans tracking-widest">Corporal</span></div><strong className="font-metal text-2xl md:text-3xl text-[#E2D1B3] font-bold text-shadow-bone">{atributos.fisico}</strong></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Eye className="w-4 h-4 md:w-5 md:h-5 text-[#E2D1B3]"/><span className="text-[10px] md:text-xs text-[#E2D1B3] uppercase font-bold font-sans tracking-widest">Psique</span></div><strong className="font-metal text-2xl md:text-3xl text-[#E2D1B3] font-bold text-shadow-bone">{atributos.mente}</strong></div>
                    
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Flame className="w-4 h-4 md:w-5 md:h-5 text-[#E2D1B3]"/><span className="text-[10px] md:text-xs text-[#E2D1B3] uppercase font-bold font-sans tracking-widest">Letalidade</span></div><strong className="font-metal text-2xl md:text-3xl text-[#E2D1B3] font-bold text-shadow-bone">{atributos.precisao}</strong></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Skull className="w-4 h-4 md:w-5 md:h-5 text-[#E2D1B3]"/><span className="text-[10px] md:text-xs text-[#E2D1B3] uppercase font-bold font-sans tracking-widest">Determinação</span></div><strong className="font-metal text-2xl md:text-3xl text-[#E2D1B3] font-bold text-shadow-bone">{atributos.vontade}</strong></div>

                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Droplets className="w-4 h-4 md:w-5 md:h-5 text-[#E2D1B3]"/><span className="text-[10px] md:text-xs text-[#E2D1B3] uppercase font-bold font-sans tracking-widest">Vigor</span></div><strong className="font-metal text-2xl md:text-3xl text-[#E2D1B3] font-bold text-shadow-bone">{atributos.resistencia}</strong></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Ghost className="w-4 h-4 md:w-5 md:h-5 text-[#E2D1B3]"/><span className="text-[10px] md:text-xs text-[#E2D1B3] uppercase font-bold font-sans tracking-widest">Sussurros</span></div><strong className="font-metal text-2xl md:text-3xl text-[#E2D1B3] font-bold text-shadow-bone">{atributos.eloquencia}</strong></div>
                  </div>
                </div>

                <div className="my-6 text-shadow-bone">
                  <h4 className="font-metal text-2xl md:text-3xl text-[#8b0000] m-0 mb-3 border-b border-[#333] pb-1">Espólios e Ações</h4>
                  <ul className="m-0 pl-4 md:pl-5 text-[#f0ead6] text-sm md:text-base font-serif font-semibold space-y-2 marker:text-[#8b0000]">
                    <li>
                      <strong className="text-[#a37d5c]">Ataque Sombrio:</strong> {finalDamageStr.replace('força', 'Poder Bruto').replace('perfurante', 'Perfuração').replace('contundente', 'Esmagamento').replace('ácido', 'Corrosão').replace('cortante', 'Lâminas')}
                    </li>
                    <li>
                      <strong className="text-[#a37d5c]">{abilitiesText.split(':')[0]}:</strong> <span className="font-apple text-lg md:text-xl text-[#f0ead6] font-black tracking-wide ml-1">{abilitiesText.includes(':') ? abilitiesText.split(':')[1] : abilitiesText}</span>
                    </li>
                    <li>
                      <strong className="text-[#a37d5c]">Terror (CD):</strong> {saveDc} (Evitar Desespero)
                    </li>
                  </ul>
                </div>


                {extraFeatures.length > 0 && (
                   <div className="mt-8 p-4 bg-[#8b0000]/10 border-l-[4px] border-[#8b0000] stain-red">
                    <h4 className="font-metal text-2xl text-[#8b0000] m-0 mb-2 text-shadow-bone">Despertares Profanos</h4>
                    <ul className="m-0 pl-5 text-[#f0ead6] text-lg font-serif italic space-y-1 text-shadow-bone">
                      {extraFeatures.map((feat, i) => <li key={i}>{feat}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Logs do Output */}
              <div className="flex-1 min-w-0 md:min-w-[300px] flex flex-col">
                <h3 className="font-finger text-xl md:text-2xl m-0 mb-3 text-[#d4cfb8] font-bold text-shadow-bone">Anotações do Pesquisador</h3>
                <div className="bg-[#111]/80 border border-[#333] p-4 md:p-5 font-apple text-lg md:text-xl text-[#f0ead6] font-bold leading-relaxed shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] flex-1 min-h-[300px] stain-brown-dark rounded">
                  {logs.length === 0 ? (
                     <p className="text-[#a37d5c] opacity-80 text-shadow-bone">"A besta ainda se encontra em seu estado infantil... por enquanto."</p>
                  ) : (
                    <div className="ink-writing flex flex-col space-y-3 md:space-y-4 pt-2">
                       {logs.map((log, i) => (
                         <div key={i} className="flex gap-2 text-shadow-bone break-words">
                           <span className="text-[#8b0000] font-sans">†</span>
                           <span>{log.replace('Processando Upgrade...', 'O sangue ferve...').replace('Aplicado.', 'desperto!').replace('Refinamento Rúnico', 'Pele esticada e endurecida').replace('Kernel de Entropia', 'Garras mais afiadas, dentes maiores...').replace('Conectividade duplicada', 'Surgem novos apêndices... que nojo.')}</span>
                         </div>
                       ))}
                       <div className="mt-4 md:mt-6 border-t-2 border-dashed border-[#5c3a21] pt-4 text-[#8b0000] font-metal text-xl md:text-2xl tracking-wider text-center text-shadow-bone">
                         "A NATUREZA SE CURVA A ESTE HORROR."
                       </div>
                    </div>
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
