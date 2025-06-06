import { useCallback, useRef } from 'react';
import { ParticleType } from '../engine/ParticleTypes';

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  particleSystem: any,
  selectedParticle: ParticleType,
  brushSize: number
) => {
  const isDrawing = useRef(false);

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: -1, y: -1 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) * (canvasRef.current.width / rect.width));
    const y = Math.floor((clientY - rect.top) * (canvasRef.current.height / rect.height));
    
    return { x, y };
  }, [canvasRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const { x, y } = getCanvasCoordinates(clientX, clientY);
    
    if (e.nativeEvent instanceof MouseEvent && e.nativeEvent.button === 2) {
      // Right click - erase
      particleSystem.removeParticle(x, y);
    } else {
      // Left click or touch - add particles
      drawParticles(x, y, selectedParticle, brushSize);
    }
  }, [getCanvasCoordinates, particleSystem, selectedParticle, brushSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const { x, y } = getCanvasCoordinates(clientX, clientY);
    
    if (x >= 0 && y >= 0) {
      if ('button' in e && e.button === 2) {
        particleSystem.removeParticle(x, y);
      } else {
        drawParticles(x, y, selectedParticle, brushSize);
      }
    }
  }, [getCanvasCoordinates, particleSystem, selectedParticle, brushSize]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const drawParticles = useCallback((x: number, y: number, type: ParticleType, size: number) => {
    const radius = Math.floor(size / 2);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          particleSystem.addParticle(x + dx, y + dy, type);
        }
      }
    }
  }, [particleSystem]);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
};