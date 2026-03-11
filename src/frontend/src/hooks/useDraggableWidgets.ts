import { useCallback, useState } from "react";

export function useDraggableWidgets(defaultOrder: string[]) {
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("widgetOrder");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        // Ensure all default widgets are present
        const merged = [...parsed.filter((id) => defaultOrder.includes(id))];
        for (const id of defaultOrder) {
          if (!merged.includes(id)) merged.push(id);
        }
        return merged;
      }
    } catch {
      // ignore
    }
    return defaultOrder;
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) return;

      setOrder((prev) => {
        const newOrder = [...prev];
        const fromIdx = newOrder.indexOf(draggedId);
        const toIdx = newOrder.indexOf(targetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, draggedId);
        localStorage.setItem("widgetOrder", JSON.stringify(newOrder));
        return newOrder;
      });
    },
    [draggedId],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(defaultOrder);
    localStorage.removeItem("widgetOrder");
  }, [defaultOrder]);

  return {
    order,
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    resetOrder,
  };
}
