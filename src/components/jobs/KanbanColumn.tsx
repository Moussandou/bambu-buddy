import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-h-[500px] transition-all ${
        isOver ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      {/* Header */}
      <div className={`${color} rounded-t-lg p-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded-full text-sm font-medium">
            {count}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg p-4 overflow-y-auto">
        {count === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
            Aucune impression
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
