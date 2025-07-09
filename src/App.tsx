import React, { useRef, useState, useCallback, useEffect } from 'react';
import { MaterialType } from './types/particles';
import { PerformanceMetrics as PerformanceMetricsType } from './types/performance';
import { MATERIALS } from './constants/materials';

import Canvas from './components/Canvas/Canvas';
import SimulationControls from './components/Controls/SimulationControls';
import PerformanceMetrics from './components/Performance/PerformanceMetrics';
import { ParticlePhysicsEngine } from './components/Canvas/ParticlePhysicsEngine';

class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastTime = performance.now();
  private frameCount = 0;
  
  update(): PerformanceMetricsType {
    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    this.frameCount++;
    
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = Math.round(1000 / avgFrameTime);
    
    return {
      fps,
      particleCount: 0,
      memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 : 0,
      updateTime: 0,
      renderTime: 0
    };
  }
}

const App: React.FC = () => {
  const engineRef = useRef<ParticlePhysicsEngine | null>(null);
  const performanceMonitorRef = useRef<PerformanceMonitor>(new PerformanceMonitor());
  const animationFrameRef = useRef<number | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>('sand');
  const [brushSize, setBrushSize] = useState(3);
  const [metrics, setMetrics] = useState<PerformanceMetricsType>({
    fps: 0,
    particleCount: 0,
    memoryUsage: 0,
    updateTime: 0,
    renderTime: 0
  });
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const gameLoop = useCallback(() => {
    if (!engineRef.current) return;
    
    const updateTime = engineRef.current.update();
    const renderTime = engineRef.current.render();
    
    const performanceMetrics = performanceMonitorRef.current.update();
    setMetrics({
      ...performanceMetrics,
      particleCount: engineRef.current.getParticleCount(),
      updateTime,
      renderTime
    });
    
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, gameLoop]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastMousePos({ x, y });
    
    if (engineRef.current) {
      engineRef.current.addParticle(x, y, selectedMaterial, brushSize);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !engineRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - lastMousePos.x;
    const dy = y - lastMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / 2);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = lastMousePos.x + dx * t;
      const py = lastMousePos.y + dy * t;
      engineRef.current.addParticle(px, py, selectedMaterial, brushSize);
    }
    
    setLastMousePos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const clearCanvas = () => {
    if (engineRef.current) {
      engineRef.current.clear();
      setMetrics(prev => ({
        ...prev,
        particleCount: 0
      }));
    }
  };

  const exportScene = () => {
    if (engineRef.current) {
      const data = engineRef.current.exportScene();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'particle-scene.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importScene = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && engineRef.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        engineRef.current!.importScene(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Particle Physics Simulation
          </h1>
          <p className="text-gray-300 text-center">
            Advanced particle physics engine with realistic material interactions
          </p>
        </header>

        <div className="flex gap-6">
          {/* Main Canvas Area */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <Canvas
                isRunning={isRunning}
                selectedMaterial={selectedMaterial}
                brushSize={brushSize}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                engineRef={engineRef}
              />
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Performance Metrics
              </h3>
              <PerformanceMetrics metrics={metrics} />
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-80 space-y-4">
            {/* Simulation Controls */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Simulation Controls</h3>
              <SimulationControls
                isRunning={isRunning}
                toggleSimulation={toggleSimulation}
                clearCanvas={clearCanvas}
                exportScene={exportScene}
                importScene={importScene}
              />
            </div>

            {/* Material Selection */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Materials</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(MATERIALS).map(([type, material]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMaterial(type as MaterialType)}
                    className={`flex items-center gap-2 p-3 rounded-lg font-medium transition-all ${
                      selectedMaterial === type
                        ? 'bg-blue-600 ring-2 ring-blue-400'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: material.color }}
                    />
                    <span className="text-sm">{material.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Brush Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Brush Size: {brushSize}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="text-sm text-gray-400">
                  <p>Current Material: <span className="text-white font-medium">{MATERIALS[selectedMaterial].name}</span></p>
                  <p>Density: <span className="text-white">{MATERIALS[selectedMaterial].density}</span></p>
                  <p>Temperature: <span className="text-white">{MATERIALS[selectedMaterial].temperature}°C</span></p>
                </div>
              </div>
            </div>

            {/* Material Properties */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Material Properties</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Flammable:</span>
                  <span className={MATERIALS[selectedMaterial].flammable ? 'text-red-400' : 'text-green-400'}>
                    {MATERIALS[selectedMaterial].flammable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gaseous:</span>
                  <span className={MATERIALS[selectedMaterial].gaseous ? 'text-blue-400' : 'text-gray-400'}>
                    {MATERIALS[selectedMaterial].gaseous ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Viscosity:</span>
                  <span className="text-white">{MATERIALS[selectedMaterial].viscosity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Soluble:</span>
                  <span className={MATERIALS[selectedMaterial].soluble ? 'text-yellow-400' : 'text-gray-400'}>
                    {MATERIALS[selectedMaterial].soluble ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>• <strong>Click and drag</strong> to place particles</p>
                <p>• <strong>Fire</strong> spreads to flammable materials</p>
                <p>• <strong>Acid</strong> dissolves soluble materials</p>
                <p>• <strong>Water</strong> turns to steam when heated</p>
                <p>• <strong>Oil</strong> floats on water and burns</p>
                <p>• <strong>Smoke</strong> rises and dissipates</p>
                <p>• Materials interact based on temperature and density</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Advanced Particle Physics Engine • Optimized for 60 FPS • 
            Built with React, TypeScript, and Canvas API
          </p>
          <p className="mt-1">
            Features: Spatial grid optimization, object pooling, realistic material interactions
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;