import fs from 'fs';

let content = fs.readFileSync('src/components/DemoApp.tsx', 'utf-8');
const imports = `import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
  CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
  AdditiveDescriptions, NodeAttributesDict
} from '../magicConstants';
`;

function extractBlock(startStr, endStr) {
    const start = content.indexOf(startStr);
    if (start === -1) return null;
    const end = content.indexOf(endStr, start);
    if (end === -1) return null;
    return content.substring(start, end + endStr.length);
}

// DraggableItem
const draggable = extractBlock('interface DraggableItemProps', '};');
content = content.replace(draggable, '');
fs.writeFileSync('src/components/DraggableItem.tsx', imports + '\n' + draggable + '\nexport default DraggableItem;');

// EdgeVisual
const edgeVisual = extractBlock('interface EdgeVisualProps', '\n    };');
const getNodeRadius = extractBlock('const getNodeRadius', '\n    };');
content = content.replace(edgeVisual, '');
content = content.replace(getNodeRadius, '');
fs.writeFileSync('src/components/EdgeVisual.tsx', imports + '\n' + getNodeRadius + '\n' + edgeVisual + '\nexport default EdgeVisual;');

// MiniatureCanvas
const minCanvas = extractBlock('const MiniatureCanvas =', '\n    };');
content = content.replace(minCanvas, '');
fs.writeFileSync('src/components/MiniatureCanvas.tsx', imports + '\nimport EdgeVisual from "./EdgeVisual";\nimport { getNodeRadius } from "./EdgeVisual";\n' + minCanvas + '\nexport default MiniatureCanvas;');

const exportGetRadius = `export const getNodeRadius = (graph: any, nodeId: any) => {
  const node = graph.nodes.find((n: any) => n.id === nodeId);
  if (!node) return 35;
  if (node.type === NodeType.ADDITIVE) return 35;
  return 45;
};`;
let evContent = fs.readFileSync('src/components/EdgeVisual.tsx', 'utf-8');
evContent = evContent.replace(/const getNodeRadius = [\s\S]*?\n    };/, exportGetRadius);
fs.writeFileSync('src/components/EdgeVisual.tsx', evContent);

// MagicCanvas
const magCanvas = extractBlock('const MagicCanvas =', '\n    };');
content = content.replace(magCanvas, '');
fs.writeFileSync('src/components/MagicCanvas.tsx', imports + '\nimport EdgeVisual from "./EdgeVisual";\nimport MiniatureCanvas from "./MiniatureCanvas";\nimport { getNodeRadius } from "./EdgeVisual";\n' + magCanvas + '\nexport default MagicCanvas;');

// MagicTranslator
const magTrans = extractBlock('const MagicTranslator =', '\n    };');
content = content.replace(magTrans, '');
const transImports = imports + `\nimport { MagicCompiler } from '../engine/compiler';\nimport { MagicPipeline } from '../engine/pipeline';\n`;
fs.writeFileSync('src/components/MagicTranslator.tsx', transImports + '\n' + magTrans + '\nexport default MagicTranslator;');

// Update DemoApp
content = content.replace('import { MagicCompiler } from \'../engine/compiler\';', '');
content = content.replace('import { MagicPipeline } from \'../engine/pipeline\';', '');
let demoAppFinal = `
import DraggableItem from './DraggableItem';
import MagicCanvas from './MagicCanvas';
import MagicTranslator from './MagicTranslator';
import EdgeVisual from './EdgeVisual';
` + content;
fs.writeFileSync('src/components/DemoApp.tsx', demoAppFinal);

console.log("Successfully split components");
