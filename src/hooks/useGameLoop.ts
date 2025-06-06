import { useEffect, useRef } from 'react';

export const useGameLoop = (callback: (deltaTime: number) => void) => {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const isRunningRef = useRef(true);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined && isRunningRef.current) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const pause = () => {
    isRunningRef.current = false;
  };

  const resume = () => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      previousTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  return { pause, resume };
};