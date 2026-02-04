import { useState, useRef, useEffect } from 'react';

interface CustomDraggableProps {
  id: string;
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  className?: string;
  previewMode?: boolean;
}

const CustomDraggable: React.FC<CustomDraggableProps> = ({ 
  id, 
  children, 
  initialPosition, 
  onPositionChange,
  className = "",
  previewMode = false
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (previewMode) return;
    
    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || previewMode) return;

      const container = document.getElementById('letter-canvas');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newPosition = {
          x: e.clientX - containerRect.left - dragOffset.x,
          y: e.clientY - containerRect.top - dragOffset.y
        };
        
        // Constrain within container bounds
        newPosition.x = Math.max(0, Math.min(newPosition.x, containerRect.width - 200));
        newPosition.y = Math.max(0, Math.min(newPosition.y, containerRect.height - 50));
        
        setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onPositionChange(id, position);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position, id, onPositionChange, previewMode]);

  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${className} ${isDragging ? 'z-50 opacity-90 scale-105' : 'z-10'} ${!previewMode ? 'cursor-move hover:shadow-lg' : ''} transition-all duration-150`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <div className={`w-full h-full p-2 ${!previewMode ? 'border-2 border-dashed border-blue-400 hover:border-blue-600 hover:shadow-md bg-white/90' : ''} rounded transition-all duration-200`}>
        <div className="pointer-events-none select-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomDraggable;