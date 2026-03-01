import { GripVertical } from 'lucide-react';

interface DraggableWidgetProps {
  id: string;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
}

export default function DraggableWidget({
  id,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  children,
}: DraggableWidgetProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => onDragOver(e, id)}
      onDragEnd={onDragEnd}
      className={`relative group transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}`}
    >
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}
