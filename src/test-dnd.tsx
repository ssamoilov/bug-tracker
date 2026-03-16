// Это временный файл для тестирования, его можно удалить после исправления
import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const TestDnD = () => {
  const [items, setItems] = useState(['1', '2', '3']);
  
  return (
    <DndContext onDragEnd={() => {}}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div>Test</div>
      </SortableContext>
    </DndContext>
  );
};