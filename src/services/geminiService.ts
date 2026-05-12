import { GoogleGenAI } from "@google/genai";
import { MagicGraph, CompiledSpell } from "../types/magic";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_PROMPT = `
You are the "CodexARCH v2" Arcane Compiler Engine. Your job is to transform a Magic DSL (Domain Specific Language) into a structured graph and a D&D 5e-style spell description according to the new specific rules.

NÚCLEO (CoreElement):
- Elemental: FOGO, AGUA, TERRA, AR.
- Dualidade: LUZ, SOMBRA, COMPOR, DECOMPOR.
- Combinations:
  - FOGO + TERRA = METAL / LAVA
  - FOGO + AR = COMBUSTAO / ELETRICIDADE
  - AGUA + TERRA = MADEIRA / LODO
  - AGUA + AR = NUVEM
  - LUZ + COMPOR = VIDA / CURA
  - LUZ + DECOMPOR = ILUSAO / CONTRAMAGICA
  - SOMBRA + DECOMPOR = MORTE / DRENAR
  - SOMBRA + COMPOR = MALDICAO

KERNELS / BUFFER (AdditiveType):
- Propriedades Físicas: ENTROPIA, MORFOLOGIA, ESTADO, ONDA, FORCA, VOLUME.
- SUBCIRCLES ( ) act as KERNELS: They lose their elemental identity (Fogo, Agua, etc) and function as a semantic buffer (a variable) for the parent cycle.

ADITIVOS (AdditiveType):
- CONTROLE, AUMENTO, REDUCAO, PONTO, MANTER, GATILHO, ECO.
- NOTE: Multipliers (Roman Numerals) are removed. Use AUMENTO/REDUCAO for fixed logic.

CONNECTIVES (EdgeType):
- ">>" (SEQUENCIA): Flow of power.
- "&" (AND): Simultaneous connection.
- "|" (OR): Alternating states.
- "^" (XOR): Exclusive choice.
- "=>" (ATRIBUICAO): Characteristic assignment.

RULES:
1. TRIANGLE RULE: A spell with fewer than 3 components is marked as "Instável: Pilar do Triângulo Incompleto".
2. KERNEL SEMANTICS: When a Subcircle is used, it should be treated as a composite Kernel in the logic.

OUTPUT FORMAT (JSON ONLY):
{
  "spell": {
    "spellName": "creative arcane name",
    "level": 1-9, "school": "Evocation", "castingTime": "1 action",
    "range": "60 feet", "components": "V, SM", "duration": "Instantaneous",
    "damageOrEffect": "Deals 2d6 fire damage.",
    "instabilities": [],
    "finalAttributes": { "lumen": 0, "thermal": 0, "sonic": 0, "mass": 0, "velocity": 0, "density": 0, "auditLog": ["Compiled successfully."] }
  }
}
`;

export async function compileArcaneGraph(graph: MagicGraph): Promise<{ spell: CompiledSpell }> {
  try {
    const inputJson = JSON.stringify(graph, null, 2);
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Input Graph:\n${inputJson}\n\nAnalyze this visual magic graph. Return only the JSON representing the CompiledSpell.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const data = JSON.parse(text);

    return {
      spell: data.spell || data // In case it returns the spell object directly or wrapped
    };
  } catch (error) {
    console.error("Gemini Compilation Error:", error);
    throw error;
  }
}
