// Ponte de compatibilidade: todo o vocabulário de núcleos, aditivos, kernels,
// runas e atributos vive em engine/constants.ts (fonte única da verdade).
// Este arquivo existe apenas porque os componentes da UI do compilador
// (CodexModule, MagicCanvas, DraggableItem, etc.) importam de '../magicConstants'.
export * from './engine/constants';

export type { MagicGraph, MagicNode, MagicEdge, CompiledSpell } from './types/magic';
