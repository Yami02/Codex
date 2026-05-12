import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  NodeType, CoreElement, AdditiveType, KernelType, EdgeType,
  CoreRunes, AdditiveRunes, EdgeCycle, EdgeSymbols,
  AdditiveDescriptions, NodeAttributesDict
} from '../magicConstants';

interface DraggableItemProps { type: any; name: any; label?: any; className?: any; onAdd?: any; }
const DraggableItem = ({ type, name, label, className, onAdd }: DraggableItemProps) => {
  const handleDragStart = (e: any) => { e.dataTransfer.setData('application/json', JSON.stringify({ type, name })); };
  const rune = type === NodeType.CORE ? CoreRunes[name] : (type === NodeType.ADDITIVE || type === NodeType.KERNEL) ? AdditiveRunes[name] : null;
  return (
    <div 
      className={`draggable-item ${className || ''}`} 
      draggable 
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.preventDefault();
        onAdd && onAdd(type, name);
      }}
      style={{ cursor: 'pointer', userSelect: 'none', touchAction: 'manipulation' }}
    >
      <span style={{ pointerEvents: 'none', flex: 1 }}>{label || name}</span>
      {rune && <span className="runic-text" style={{ marginLeft: '8px', pointerEvents: 'none' }}>{rune}</span>}
    </div>
  );
};
export default DraggableItem;