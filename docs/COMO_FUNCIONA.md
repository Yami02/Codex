# Como o Compilador Mágico Funciona

Documento de referência técnica, mantido atualizado a cada mudança de
mecânica. Se você alterar como algo funciona (uma fórmula, um aditivo, uma
regra de resolução), atualize a seção correspondente aqui **na mesma
sessão de trabalho** — este arquivo é a fonte da verdade de como o sistema
se comporta, não só o código.

O espelho simplificado disto (linguagem de jogador, sem detalhe técnico)
vive dentro do próprio app: botão **❓ Ajuda** no Codex (`src/components/HelpGuide.tsx`).

## Índice
1. [Visão geral do pipeline](#1-visão-geral-do-pipeline)
2. [O Buffer (vetor único)](#2-o-buffer-vetor-único)
3. [Núcleos](#3-núcleos)
4. [Aditivos](#4-aditivos)
5. [Kernels](#5-kernels)
6. [Conectivos de Aresta (Edges)](#6-conectivos-de-aresta-edges)
7. [Os 32 Colégios (Fusão)](#7-os-32-colégios-fusão)
8. [Capacitor / Gatilho](#8-capacitor--gatilho)
9. [Selo Arcano](#9-selo-arcano)
10. [Onde cada coisa mora no código](#10-onde-cada-coisa-mora-no-código)
11. [Ideias em Aberto (ainda não implementadas)](#11-ideias-em-aberto-ainda-não-implementadas)

---

## 1. Visão geral do pipeline

`engine/compiler.ts` → `MagicCompilerEngine.execute(graph)`:

1. **Parser** (`GraphToASTBuilder`): JSON do grafo → árvore de sintaxe (AST).
2. **Validador Semântico** (`SemanticValidator`): exige exatamente 1 Núcleo;
   Kernels não podem estar vazios.
3. **Pattern Matcher** (`PatternMatcher.matchAndTransform`): resolve, a
   partir da topologia do grafo, o nível de cada aditivo "de modo" (Ponto,
   Manter, Forma, Mover, Perceber, Gatilho), a fusão ativa (Fusão), e o
   elemento final combinado (ex: Fogo+Terra+Compor = Metal).
4. **Construção do Buffer**: soma os atributos de cada Núcleo/Aditivo/Kernel
   num único vetor numérico.
5. **Álgebra**: fórmulas puras (`computeDamageDice`, `computeSpellLevel`,
   `computeDC`, `resolveIsSaveBased`, `resolveIsDeterministic`) leem só do
   buffer.
6. **Geração de texto**: um pequeno conjunto de gabaritos de prosa escolhe
   frases com base nos valores já resolvidos do buffer — a álgebra decide
   "quanto", o texto só veste "como soa".

### 1.1 Manifestação: a palavra fixa por combinação

Pra que o texto final se comporte de verdade como algo *compilado* — "se
tiver X, a resposta é sempre aquilo" — cada combinação mecânica exata de
alcance/forma/teste/modo resolve pra uma palavra fixa e determinística
(`MANIFESTACAO_TABLE`, `engine/constants.ts`), nunca uma prosa remontada
por acaso. A mesma geometria sempre abre o texto com o mesmo nome:

| Combinação | Palavra |
|---|---|
| Toque, ataque | Impacto Direto |
| Toque, Teste | Descarga de Contato |
| Alcance, ataque | Projétil Dirigido |
| Alcance, Teste | Feixe Guiado |
| Alcance + Esfera Remota | Detonação Remota |
| Aura | Emanação Radial |
| Aura + Cone | Rajada Cônica |
| Aura + Linha | Lança Retilínea |
| Pessoal (sem Ponto) | Infusão Interna |
| Mover | usa o nome já pronto de `MOVER_LEVELS` (Passo Curto/Salto Médio/Salto Longo) |
| Perceber | usa o nome já pronto de `PERCEBER_LEVELS` (Detectar/Identificar/Vislumbrar) |

`MagicCompilerEngine.execute` resolve a chave (`manifestKey`) no mesmo
if/else que já monta `dndFullText` (cada ramo só ganhou uma linha
atribuindo sua chave — a prosa em si não mudou), prefixa o texto final com
`[MANIFESTAÇÃO: NOME]`, e devolve `manifestation: { name }` no resultado.
`MagicTranslator.tsx` mostra isso como mais uma caixa de estatística, ao
lado de Alcance/Duração/Tempo de Conjuração.

## 2. O Buffer (vetor único)

Tipo `SpellBuffer` (`engine/compiler.ts`) — um `Record<string, any>` que é a
**única** fonte de números do motor. Dois tipos de eixo:

- **Eixos acumulativos** (somam por adição quando múltiplos nós contribuem):
  `thermal`, `entropy`, `lumen`, `order`, `chaos`, `strength`, `volume`,
  `potency`, `complexity`, etc. — vêm de `NodeAttributesDict`
  (`engine/constants.ts`).
- **Eixos seletores** (não somam — o `PatternMatcher` decide qual nível está
  ativo por nó, e só then é dobrado pro buffer como um número): `alcance`
  (Ponto), `duracao` (Manter), `forma` (Forma), `mover`/`perceber`,
  `teste`, `capacitor` (Gatilho).

Regra de combinação: **sempre soma, nunca multiplica** (decisão explícita
do usuário — ver histórico de commits "motor vira álgebra de buffer
único").

## 3. Núcleos

8 valores possíveis, **um único Núcleo por magia** (trocar substitui o
atual). Cada um define seu vetor base em `NodeAttributesDict`, incluindo a
condição que impõe e a habilidade de resistência contra ela:

| Núcleo | Atributos físicos | Condição imposta | Resistência |
|---|---|---|---|
| Fogo | `thermal +6, entropy +3` | Queimando | Destreza |
| Água | `volume +4` | Lento | Constituição |
| Terra | `strength +5, mass +3` | Retido | Força |
| Ar | `wave +2, sonic +2` | Empurrado | Força |
| Luz | `wave +5, lumen +6` | Cego | Constituição |
| Sombra | `morphology +4, lumen -4` | Amedrontado | Sabedoria |
| Compor | `order +5` | Enfeitiçado | Sabedoria |
| Decompor | `chaos +5` | Exausto | Constituição |

Um **Kernel** ativo (ver §5) é mais específico que o Núcleo puro e
sobrescreve a condição/resistência dele.

## 4. Aditivos

| Aditivo | O que faz | Nível? |
|---|---|---|
| Ponto | Alcance: 1=Toque, 2=Alcance, 3=Aura | 1-3 |
| Manter | Duração: 0=Instantânea … 4=Capacitor (aura permanente, sem concentração) | 0-4 |
| Forma | Geometria: 1=Cone/2=Linha (só com Ponto 3), 3=Esfera Remota (só com Ponto 2, vira teste em área) | 1-3 |
| Mover | Substitui dano/cura por deslocamento. Ponto decide quem é afetado; o nível de Mover decide a distância | 1-3 |
| Perceber | Substitui dano/cura por informação (Detectar/Identificar/Vislumbrar) | 1-3 |
| Teste | Binário: troca ataque por teste de resistência em Ponto 1 ou 2 | — |
| Fusão | Escolhe um 2º elemento/polaridade → revela um Colégio (§6) | — (campo `fusionElement`) |
| Gatilho | O Capacitor (§7): guarda a magia pra disparar depois | 1-5 + campo `triggerType` |
| Controle / Aumento / Redução / Eco | Ajustes finos de atributos, sem lógica de modo própria | — |

Regras de conflito já implementadas (o compilador avisa como
instabilidade, nunca falha em silêncio):
- Mover + Perceber juntos → só Mover prevalece.
- Forma presente mas Ponto no nível errado → Forma é ignorada.
- Forma + (Mover ou Perceber) → Forma é ignorada.
- Teste + (Mover ou Perceber) → avisado como sem efeito (não fazem
  ataque nem teste).
- Múltiplos nós do mesmo aditivo de nível → só o de maior nível conta,
  avisado como redundância.

**Pessoal**: uma magia sem Ponto mas com outro aditivo presente (ex:
Manter sozinho) não é instável — é um efeito Pessoal legítimo (o
conjurador é o próprio alvo, sem ataque/teste/dano a terceiros). Só é
tratada como vazia de verdade quando não sobra nada além do Núcleo.

## 5. Kernels

Um Kernel mora dentro de um Subcírculo e representa um eixo mais
específico do que o Núcleo. Cada um escala a magia por "Aumento"
(amplitude) ou "Complexibilidade" (natureza do efeito) — `KERNEL_SCALE_AXIS`:

| Kernel | Eixo | Condição que refina |
|---|---|---|
| Entropia | Aumento | Envenenado (Constituição) |
| Força | Aumento | Retido (Força) |
| Volume | Aumento | Empurrado (Força) |
| Som | Aumento | Atordoado (Constituição) |
| Luminosidade | Aumento | Cego (Constituição) |
| Ordem | Aumento | Enfeitiçado (Sabedoria) |
| Morfologia | Complexibilidade | Enfeitiçado (Inteligência) |
| Estado | Complexibilidade | Paralisado (Constituição) |
| Caos | Complexibilidade | Atordoado (Constituição) |

## 6. Conectivos de Aresta (Edges)

`engine/compiler.ts` (`ASTGraph.edges`, `PatternMatcher.matchAndTransform`).
Até esta mudança, `EdgeType` existia (arestas coloridas, com um símbolo
diferente por tipo, cicláveis clicando na aresta) mas era **100%
decorativo**: o compilador nunca lia `edge.type`, só a existência da
conexão (pra ordenação topológica). Toda ligação se comportava
exatamente igual, qualquer que fosse o tipo escolhido.

Agora `ASTGraph` guarda o tipo de cada aresta e `PatternMatcher` lê seis
deles (os mesmos do `EdgeCycle`, alcançáveis clicando numa aresta) pra
aplicar uma regra real. **A aresta padrão criada ao conectar dois nós
continua sendo AND** — por isso toda magia já montada antes desta mudança
se comporta exatamente igual; os outros cinco tipos só mudam alguma coisa
quando o jogador explicitamente cicla a aresta pra eles.

| Conectivo | Regra real |
|---|---|
| **AND** (padrão) | Combinação direta: os nós ligados só coexistem e somam ao buffer, como sempre funcionou. Nenhuma mudança de comportamento. |
| **OR** | Alternativa: liga duas variantes do **mesmo aditivo de nível** (Ponto, Manter, Forma, Mover, Perceber, Gatilho ou Fusão). Em vez do aviso de `[REDUNDÂNCIA]` (que assume engano), o compilador registra `[ESCOLHA]`: o conjurador escolhe uma variante ao lançar, e a ficha usa o pior caso (maior nível) pra nível/CD, pra continuar balanceada nos dois casos. |
| **XOR** | Exclusão mútua: mesma detecção de grupo do OR, mas registrado como `[ESCOLHA XOR]` e a ficha descreve a **primeira variante declarada** como padrão (não o pior caso) — as opções nunca coexistem por definição, então não há por que descrever pelo caso mais forte. É também o que torna **Mover + Perceber juntos** uma magia "versátil" intencional (`[VERSÁTIL XOR]`, com o modo Perceber anotado como alternativa no texto final) em vez do aviso antigo de `[MODOS CONFLITANTES]` — que continua acontecendo normalmente se os dois estiverem presentes sem uma aresta XOR entre eles. |
| **SE_ENTAO** | Condicional: só é uma aresta válida saindo de um nó de **Teste** ou **Gatilho** — os únicos aditivos com um resultado incerto em jogo (o alvo pode passar ou falhar no teste; o gatilho pode disparar ou não). Saindo de qualquer outro nó, é rejeitada como `[CONDIÇÃO INVÁLIDA]`. Quando válida, o nó de destino é descrito à parte no texto final, como `[CONDICIONAL] Se o alvo falhar no teste de resistência, então: <efeito>` (ou `Se o gatilho disparar, então: <efeito>`) — o efeito continua contando pro nível/CD, só a descrição deixa claro que ele não é incondicional. |
| **ATRIBUICAO** | Canalização: liga um nó de **Aumento/Redução** a um aditivo de nível (Ponto, Manter, Forma, Mover, Perceber ou Gatilho). Em vez de somar `potency`/`complexity` genericamente ao buffer, o Aumento/Redução soma (ou subtrai) **1 nível direto** no aditivo de destino (respeitando o mínimo/máximo dele) — e sua contribuição genérica é anulada, pra não contar o bônus duas vezes. Registrado como `[CANALIZAÇÃO]`. Uma Atribuição fora desse par (origem/destino errados) é rejeitada como `[ATRIBUIÇÃO INVÁLIDA]`. |
| **CORRENTE** | Corrente/cadeia: uma sequência de nós ligados em cadeia (A→B→C...) faz o efeito saltar de alvo em alvo. O compilador mede o comprimento da maior cadeia (`chainHops`, à prova de ciclo — um loop de CORRENTE vira `[CORRENTE CÍCLICA]` e é truncado); cada salto além do primeiro soma `+1` a `complexity` (mais alvos pra gerenciar, o que pode elevar nível/CD) e aparece no texto final como `[CORRENTE] ... salta para até N alvo(s) adicional(is) ..., cada salto causando metade do dano do salto anterior`. |

> `EdgeType` também tem `UNIAO` e `REVERSO` no enum e um desenho próprio em
> `EdgeVisual.tsx`, mas nenhum dos dois está em `EdgeCycle` — não são
> alcançáveis clicando numa aresta, então ficaram de fora desta rodada
> (sem regra própria ainda).
>
> O guia em linguagem simples (aba "Conectivos" em `HelpGuide.tsx`) espelha
> esta tabela a partir de `EdgeDescriptions` (`engine/constants.ts`), pra
> não haver duas explicações divergentes.

## 7. Os 32 Colégios (Fusão)

`engine/colleges.ts`. O aditivo **Fusão** carrega um segundo elemento (um
dos 8 valores de Núcleo) sem precisar de um segundo nó de Núcleo — resolve
o bug estrutural que antes tornava essas combinações inalcançáveis
("Colapso Dimensional" ao tentar usar 2 Núcleos).

- **8 Colégios Base** (Núcleo sozinho): Arcano (Fogo), Cura (Água), Estudos
  das Forças (Terra), Palácio Mental (Ar), Ilusão (Luz), Corpo (Sombra),
  Conjuração (Compor), Eliminação (Decompor).
- **12 Pares Criar↔Destruir** (elemento + Compor/Decompor): Feixe/Combustão
  (Fogo), Invocação/Evocação (Água), Golemancia/Telecinesia (Terra),
  Canção/Sussurro (Ar), Bênção/Maldição (Luz), Acordo/Necromancia (Sombra).
- **12 Combinações de elemento** (sem polaridade): Transmutação (Fogo+Terra),
  Progresso (Fogo+Ar), Purificação (Fogo+Luz), Obsessão (Fogo+Sombra),
  Herbologia (Água+Terra), Tormenta (Água+Ar), O Espírito (Água+Luz),
  Sangue (Água+Sombra), Abjuração (Terra+Luz), Selo (Terra+Sombra),
  Adivinação (Ar+Luz), Domínio (Ar+Sombra).

**A Lei da Simetria** (`polaritySymmetryDelta`): fundir com Compor (Criar,
permanente/caro) soma `complexity +4, potency +2` ao buffer; fundir com
Decompor (Destruir, efêmero/barato) subtrai `complexity -2, potency -1`.
Isso muda nível e CD de verdade, não só o nome — decisão explícita do
usuário.

> Escopo consciente: isto é o mecanismo de **resolução** de qual colégio
> está ativo (nome, vocabulário, assimetria numérica), não uma cópia das
> ~128 magias nomeadas do grimório original do usuário — o compilador
> gera magias a partir do grafo, não de uma lista fixa de feitiços.

## 8. Capacitor / Gatilho

O aditivo **Gatilho** é o Capacitor: em vez de a magia se manifestar ao
ser conjurada, ela fica armazenada num glifo até uma condição se cumprir.

- **Nível (1-5) = carga necessária** (`GATILHO_LEVELS`): 1 turno até 5
  turnos — ou 5 conjuradores diferentes enchendo o mesmo capacitor, cada
  um contribuindo uma carga. Cada nível de carga soma diretamente
  `potency` e `complexity` ao buffer (1 a 5) — é isso que permite uma
  magia carregada por várias pessoas/turnos sair mais forte do que um só
  conjurador pagaria num turno.
- **Tipo de gatilho** (`TRIGGER_TYPES`, campo `triggerType`): o que
  dispara o efeito armazenado.
  - `TEMPO`: dispara sozinho após um número de turnos definido ao conjurar.
  - `IMPACTO`: dispara quando o glifo ou alvo marcado sofre um golpe/toque.
  - `COMANDO` (padrão): dispara na palavra de ativação do conjurador.
  - `PROXIMIDADE`: dispara quando algo entra na área marcada.

`castingTime` do bloco D&D muda para refletir isso (`"1 Ação para
carregar (N turnos) + Gatilho de X"`), e o texto final ganha um bloco
`[CAPACITOR: ...]` explicando a carga e a condição de disparo.

> **Estado da mecânica**: é a primeira versão. O próprio usuário pediu
> pra revisar o sistema de trigger com mais calma depois — os 4 tipos
> acima e a forma como a carga se soma ao buffer são um ponto de partida
> funcional, não a palavra final. Também ainda não modelamos a ligação
> entre carga do capacitor e duração do efeito resultante (ex: "uma
> magia carregada o bastante dura um ano") — Manter continua sendo o
> único eixo de duração por enquanto.

## 9. Selo Arcano

`engine/sigil.ts`. Gera um glifo único e determinístico pra cada magia
compilada, baseado no "Gorilla of Destiny's Spell Writing Guide": um
polígono de 11 vértices (`n = 2×5+1`, 5 atributos: elemento, nível,
alcance, manifestação, duração), cada atributo com seu próprio "salto" k
(1 a 5) e um número binário ciclicamente único (nenhuma rotação bate com
outra já usada) por valor possível daquele atributo.
`cyclicallyUniqueBinaryNumbers(n)` foi validado byte a byte contra o
dicionário do livro original.

## 10. Onde cada coisa mora no código

| Arquivo | Responsabilidade |
|---|---|
| `engine/constants.ts` | Fonte única dos enums (NodeType, CoreElement, AdditiveType, KernelType, EdgeType), runas, descrições (`AdditiveDescriptions`, `EdgeDescriptions`), `NodeAttributesDict`, e todas as tabelas de nível (`PONTO_LEVELS`, `MANTER_LEVELS`, `FORMA_LEVELS`, `MOVER_LEVELS`, `PERCEBER_LEVELS`, `GATILHO_LEVELS`, `TRIGGER_TYPES`, `MANIFESTACAO_TABLE` — ver §1.1). |
| `types/magic.ts` | Interfaces de nó/aresta/grafo; reexporta os enums de `constants.ts`. |
| `engine/compiler.ts` | O motor: AST, validador, pattern matcher (inclui as regras dos conectivos de aresta — §6), álgebra do buffer, geração de texto. |
| `engine/colleges.ts` | Tabela dos 32 Colégios, a Lei da Simetria, e `listColleges()` (lista os 32 com a chave de formação, pro Grande Tomo exibir sem duplicar a tabela). |
| `engine/sigil.ts` | Gerador do Selo Arcano. |
| `components/CodexModule.tsx` | UI do canvas: sidebar, drag-and-drop, barra de ações do nó selecionado. |
| `components/MagicTranslator.tsx` | Renderiza o resultado compilado (ficha, bloco D&D 5e, Selo Arcano). |
| `components/HelpGuide.tsx` | Guia de ajuda in-app (linguagem simples, espelha este documento). |
| `pages/Naturalista.tsx` | O Estudo Naturalista: layout de livro-tomo (couro, pergaminho, tinta, índice giratório) com um léxico de palavras de poder livre — flavor, não é o sistema real. |
| `pages/LivroMagias.tsx` | O Grande Tomo: **mesmo layout de livro** de `Naturalista.tsx` (propositalmente — ver nota abaixo), mas com conteúdo real: explica Núcleos, Aditivos, Conectivos, Kernels/Subnúcleos e as 32 Escolas puxando a descrição de cada um direto de `engine/constants.ts`/`engine/colleges.ts`, a mesma fonte que o compilador usa. |

> **Por que duas páginas com o mesmo design?** `Naturalista.tsx` é flavor
> (um léxico de palavras inventadas, sem ligação com o motor). `LivroMagias.tsx`
> foi refeito pra usar exatamente o mesmo design — pedido explícito do
> usuário — só que agora documentando o sistema de verdade por trás do
> Codex. As duas telas compartilham a mesma estrutura JSX (livro
> desktop/mobile, ribbon, lombada, índice com círculo mágico no hover) só
> que com dados diferentes; é duplicação de layout deliberada (telas
> independentes, sem um componente-livro compartilhado ainda), não um
> componente reaproveitado.

## 11. Ideias em Aberto (ainda não implementadas)

Três ideias levantadas pelo usuário numa sessão de brainstorm, explicitamente
adiadas ("não vou fazer agora, no momento" / "só documentar tudo por
agora"). A terceira (conectivos de aresta) já foi implementada desde então
— ver a nota no fim desta seção. As outras duas continuam em aberto, só
documentadas, sem código.

### 11.1 Nível infinito via mana investida (curva tipo Fibonacci)

Ideia central: **nível deixa de ser uma categoria escolhida e passa a ser
puramente uma função da mana gasta**. Não existe "escolher lançar nível 3"
— existe "quanto mana você tem pra gastar", e o nível resultante é
derivado disso.

- Um conjurador com mais mana disponível (ex: 300 de mana) consegue "pagar"
  por uma magia de nível muito mais alto que o normal.
- Quanto maior o nível, **mais aditivos/núcleos/capacidade** a magia
  suporta — nível vira, na prática, o "orçamento" de quantos nós o grafo
  pode ter e quão fortes eles podem ser.
- O custo por nível **não escala linear nem 2x por nível** — a ideia é uma
  curva parecida com Fibonacci: cada nível seguinte custa
  significativamente mais que o anterior (não simplesmente o dobro), de
  forma que nível 6, por exemplo, representa uma complexidade extrema
  comparado a nível 1 ou 2.
- Importante (citação do usuário): "uma magia level 1, uma magia level 2,
  a única diferença é a quantidade de mana que ele consegue colocar.
  Somente isso. Não tem mais outra diferença." — ou seja, nível não é um
  eixo qualitativo separado, é 100% derivado da mana investida. Isso
  substituiria (ou se sobreporia a) `computeSpellLevel` atual, que hoje
  deriva nível de `totalComponents`/buffer sem noção de "mana disponível
  pelo conjurador" como recurso externo.
- Em aberto: qual é a fórmula exata da curva de custo, como ela se
  relaciona com `computeSpellLevel`/`computeDC` existentes, e se "mana"
  vira um novo campo de buffer ou um recurso externo ao grafo (atributo do
  personagem, não da magia).

### 11.2 "Nível 0" / conjuração ambiental + Kernel de Absorção

Ideia de magia de custo zero (ou muito reduzido) quando conjurada **a
favor do ambiente**, e cara ou impossível quando contra ele.

- Exemplo do usuário: um mago de água tentando conjurar fogo num lugar
  dominado por fogo tem muita dificuldade (ou não consegue). Um mago de
  fogo, nesse mesmo lugar cheio de fogo, possivelmente **nem precisa gastar
  mana** pra fazer algo de nível 0 — ele só está canalizando energia que já
  está lá.
- Proposta concreta: um novo **Kernel de Absorção** (não um Núcleo — o
  usuário foi explícito que a ideia é um Kernel), que captura energia
  elemental externa/ambiente e a guarda num glifo, em vez de gerar a
  energia do zero.
  - Exemplo dado: um alvo pegando fogo → o conjurador absorve esse fogo pra
    dentro de um glifo, em vez de deixá-lo se dissipar.
  - Quanto mais o glifo acumula (mais fogo absorvido), mais potente fica o
    que pode ser feito com aquela energia depois — inclusive convertendo
    pra outro uso (ex: fogo absorvido → depois usado pra **curar** pessoas,
    trocando de elemento/efeito na conversão).
  - Conecta diretamente com o Capacitor/Gatilho (§7) já implementado: a
    Absorção seria uma forma alternativa de encher um capacitor — em vez de
    "gastar N turnos conjurando", seria "captar energia ambiente/de um
    evento por N unidades".
- Em aberto: como medir "a favor" vs "contra" o ambiente (precisa de algum
  conceito de "ambiente elemental atual" que hoje não existe no sistema);
  a fórmula de conversão entre elemento absorvido e elemento de saída (ex:
  fogo→cura); e se isso é um `KernelType` novo ou um modo do Gatilho
  existente.

### ~~10.3 Conectivos de aresta são decorativos~~ — resolvido

Esta era a terceira ideia registrada aqui. **Já foi implementada** (regras
reais pra AND/OR/XOR/SE_ENTAO/ATRIBUICAO/CORRENTE) — ver §6 (Conectivos de
Aresta) mais acima. Deixado de fora dessa seção porque não é mais uma
ideia em aberto.
