import { MagicGraph } from '../types/magic';

// Este arquivo foi desativado em favor do motor C++/WASM.
// A lógica de tokenização e parsing deve ser executada no novo backend de compilação.

export class MagicLexer {
  constructor(_input: string) {
    throw new Error('MagicLexer TS desativado: migração para WASM em andamento.');
  }
  public tokenize(): any[] {
    throw new Error('MagicLexer TS desativado: migração para WASM em andamento.');
  }
}

export class MagicParser {
  constructor(_tokens: any[]) {
    throw new Error('MagicParser TS desativado: migração para WASM em andamento.');
  }

  public parse(): MagicGraph {
    throw new Error('MagicParser TS desativado: migração para WASM em andamento.');
  }
}
