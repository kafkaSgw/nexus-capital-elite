import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
}

export function SortableItem({ id, children, isEditMode }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group w-full">
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 p-2 bg-dark-card border border-white/10 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all z-50 text-gray-400 hover:text-white flex items-center shadow-lg"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}
      
      {/* Wrapper to handle pointer events during edit mode to prevent interacting with the widgets instead of dragging */}
      <div className={`${isEditMode ? 'pointer-events-none ring-2 ring-primary/20 rounded-2xl relative' : ''}`}>
        {isEditMode && (
          <div className="absolute inset-0 bg-primary/5 rounded-2xl z-40 pointer-events-none" />
        )}
        {children}
      </div>
    </div>
  );
}
