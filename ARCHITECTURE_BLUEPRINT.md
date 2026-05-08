# ARCHITECTURE_BLUEPRINT.md

## Visão Geral da Arquitetura

O "Códex Geométrico" é um compilador mágico que transforma strings de feitiços em uma AST geométrica e um RealityBuffer interpretável pelo frontend. A migração para C++20 + WebAssembly tem como objetivo:
- performance quase nativa;
- segurança de memória e limites estritos;
- execução em thread separada via Web Worker;
- renderização burra do Canvas a partir do JSON retornado.

### Componentes Principais
- **Frontend (React/TypeScript)**: UI, Canvas SVG, Web Worker, visualização do RealityBuffer.
- **Engine C++ (WASM)**: Lexer, Parser recursivo descent, redutor semântico e motor termodinâmico.
- **Ponte WASM**: Bindings via Emscripten/C API para string in/JSON out.
- **Web Worker**: Isola a execução e previne travamentos de UI.

## Gramática Formal (EBNF)

```
<expression>        ::= <term> (<operator> <term>)*
<term>              ::= <identifier> | "(" <expression> ")" | "[" <expression> "]"
<identifier>        ::= [A-Za-z_][A-Za-z0-9_]*
<operator>          ::= <connection_op> | <state_modifier> | <entropy_op>
<connection_op>     ::= "--" | "--o" | "==c" | ">--<"
<state_modifier>    ::= "energia" | "gas" | "liquido" | "solido"
<entropy_op>        ::= "aumento" | "reducao"
```

### Tokens
- IDENTIFIER: [A-Za-z_][A-Za-z0-9_]*
- LAYER_SHIFT: >>
- AND: &
- OR: |
- XOR: ^
- L_PAREN: (
- R_PAREN: )
- L_BRACKET: [
- R_BRACKET: ]
- IMPLICATION: ->
- CONTAINMENT: ==c
- GEOMETRY: >--<
- ASSIGN: --o
- NEGATION: --x--
- EOF: fim da entrada

## Modelo de Memória (C++)

### Alocação da AST
- **std::unique_ptr<Node>** para ownership único e destruição automática.
- **std::pmr::monotonic_buffer_resource** para alocações temporárias de parsing.
- **Arena** para nós reutilizáveis de AST, evitando overhead de alocação por nó.

### RealityBuffer
O RealityBuffer é o produto final do compilador WASM:
```cpp
struct RealityBuffer {
    float density = 1.0f;
    float entropy_level = 1.0f;
    float inertia = 0.0f;
    float velocity = 0.0f;
    bool is_contained = false;
    bool rigid_collision = false;
    std::vector<std::pair<float, float>> vertices;
    std::unordered_map<std::string, float> attributes;
    std::vector<std::string> tags;
    std::vector<std::string> instabilities;
};
```

### Estrutura de Nó
```cpp
struct Node {
    NodeType type;
    std::variant<CoreNode, AdditiveNode, ConnectionNode, SubCircleNode> data;
};
```

## Regras de Negócio e Lógica de Baixo Nível

### Operador de Contenção `==c`
- Atua como um lock de constante: todos os atributos passados por `==c` recebem `range_decay = 0`.
- A flag `RealityBuffer::is_contained = true` é propagada para os filhos do subtree.
- Isso garante que forças e densidades não se dissipem devido à distância geométrica.

### Transição de Fase Termodinâmica
- **Energia**:
  - `velocity`: máximo
  - `inertia`: 0
  - `rigid_collision`: false
- **Gas**:
  - `velocity`: alto
  - `inertia`: baixo
  - `rigid_collision`: false
- **Liquido**:
  - `velocity`: médio
  - `inertia`: médio
  - `rigid_collision`: false
- **Sólido**:
  - `velocity`: mínimo
  - `inertia`: máximo
  - `rigid_collision`: true

### Lógica de Entropia
- `entropy_level` cresce com a complexidade topológica do grafo.
- `aumento` incrementa entropia e pode amplificar `volatility`.
- `reducao` estabiliza atributos e diminui `complexity`.

### Matemática de Grafos
- **Pontos** são vetores 2D `(x, y)`.
- **Conectivo `>--<`** calcula área pelo determinante absoluto:
  - `area = std::abs(v1.x * v2.y - v1.y * v2.x)`.
- **Entropia geométrica** é derivada da média de grau dos vértices e do número de ciclos.

## Design da Ponte WASM

### Fluxo de Dados
1. JavaScript envia a string de magia para WASM.
2. C++ valida e tokeniza a entrada.
3. Parser recursivo constrói AST segura.
4. Redutor semântico aplica estados e contenção.
5. RealityBuffer é serializado para JSON.
6. JSON volta ao JS para renderização do Canvas.

### Requisitos de Bindings
- Use **C API pura** ou **embind** para exponenciar apenas a função de entrada:
  - `const char* compileMagic(const char* input)`
- A saída deve ser um JSON alocado em memória WASM e transferido para JS com mínima cópia.

### Interface proposta
```cpp
extern "C" {
    const char* compileMagic(const char* input);
    void freeWasmString(const char* ptr);
}
```

## Threat Model (Cybersecurity)

### Vetores de Ataque
- **Injeção de Sintaxe**: Strings malformadas e operadores misturados.
- **Overflow de Mana**: Atributos sem limite causam valores inválidos.
- **DoS**: Expressões com recursão profunda ou repetição exponencial.

### Mitigações
- **Sanitização**:
  - input length limitada a 10KB.
  - caracteres permitidos restritos.
  - tokens validados contra gramática.
- **Bounds Checking**:
  - profundidade máxima de recursão limitada a 100.
  - limites de nó e aresta, p.ex. 512 nodes.
- **Memory Safety**:
  - `std::unique_ptr` + `pmr::monotonic_buffer_resource`.
  - nenhuma alocação manual `new` sem smart pointer.
- **Error Boundary**:
  - Web Worker captura falhas e envia mensagem de erro sem quebrar UI.

### Auditoria
- Fuzzing do parser com entradas aleatórias.
- Testes de limites de densidade e estados termodinâmicos.
- Validação de saída JSON para evitar atributos NaN/inf.

## Lista de Descarte Imediato
- Desativar `src/engine/parser.ts`.
- Descartar `src/engine/lexer.ts` e `src/engine/reducer.ts` se existirem.
- Remover cálculos de distância/estado do Canvas: ele deve apenas renderizar JSON.
</content>
<parameter name="filePath">/workspaces/Codex/ARCHITECTURE_BLUEPRINT.md