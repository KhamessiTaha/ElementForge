import React, { useRef, useEffect } from 'react';
import { ParticlePhysicsEngine } from './ParticlePhysicsEngine';
import { MaterialType } from '../../types/particles';

interface CanvasProps {
  isRunning: boolean;
  selectedMaterial: MaterialType;
  brushSize: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  engineRef: React.MutableRefObject<ParticlePhysicsEngine | null>;
}

const Canvas: React.FC<CanvasProps> = ({
  isRunning,
  selectedMaterial,
  brushSize,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  engineRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    engineRef.current = new ParticlePhysicsEngine(canvas);
  }, [engineRef]);

  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-600 rounded cursor-crosshair bg-black"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
};

export default Canvas;