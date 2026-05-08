import { MagicLexer, MagicParser } from './parser';

const inputString = "Sangue >> (Projetil & [Veneno >> Gasoso]) ^ Persistente";

console.log("=========================================");
console.log("INICIANDO DECOMPILADOR ARCÂNICO...");
console.log(`Expressão: "${inputString}"`);
console.log("=========================================\n");

try {
  // 1. Lexer (Análise Léxica)
  console.log("1. Gerando Tokens...");
  const lexer = new MagicLexer(inputString);
  const tokens = lexer.tokenize();
  console.log(`-> ${tokens.length} tokens gerados.`);
  // console.log(tokens.map(t => t.type).join(' '));

  // 2. Parser (Análise Sintática)
  console.log("\n2. Construindo Grafo Mágico...");
  const parser = new MagicParser(tokens);
  const magicGraph = parser.parse();

  console.log("\n-> MAGIC GRAPH RESULTANTE (JSON):");
  console.log(JSON.stringify(magicGraph, null, 2));
} catch (error: any) {
  console.error(`\n[FALHA DE COMPILAÇÃO]: ${error.message}`);
}
