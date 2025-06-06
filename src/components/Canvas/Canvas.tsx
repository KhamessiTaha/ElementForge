import React, { useRef, useState } from 'react';
import { ParticleType } from '../../engine/ParticleTypes';
import { useParticleSystem } from '../../hooks/useParticleSystem';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useCanvas } from '../../hooks/useCanvas';
import { PARTICLE_PROPERTIES } from '../../engine/ParticleTypes';

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedParticle, setSelectedParticle] = useState<ParticleType>(ParticleType.SAND);
  const [brushSize, setBrushSize] = useState(5);
  
  // Initialize game systems
  const particleSystem = useParticleSystem(width, height);
  const { handleMouseDown, handleMouseMove, handleMouseUp } = useCanvas(
    canvasRef as React.RefObject<HTMLCanvasElement>,
    particleSystem,
    selectedParticle,
    brushSize
  );
  
  // Game loop
  useGameLoop(() => {
    particleSystem.update();
    particleSystem.render(canvasRef.current?.getContext('2d')!);
  });

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    />
  );
};

export default Canvas;