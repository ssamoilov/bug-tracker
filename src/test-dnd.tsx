// Это временный файл для тестирования, его можно удалить после исправления
import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const TestDnD = () => {
  const [items] = useState(['1', '2', '3']);
  
  return (
    <DndContext onDragEnd={() => {}}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div>Test</div>
      </SortableContext>
    </DndContext>
  );
};