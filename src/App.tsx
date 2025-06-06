import React, { useState } from 'react';
import Canvas from './components/Canvas/Canvas';
import ToolPanel from './components/UI/ToolPanel';
import { ParticleType } from './engine/ParticleTypes';
import './App.css';

function App() {
  const [selectedParticle, setSelectedParticle] = useState<ParticleType>(ParticleType.SAND);
  const [brushSize, setBrushSize] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [gameLoop, setGameLoop] = useState<any>(null);

  const handleClear = () => {
    // Implement clear functionality
  };

  const handlePause = () => {
    if (gameLoop) gameLoop.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    if (gameLoop) gameLoop.resume();
    setIsPaused(false);
  };

  return (
    <div className="App">
      <h1>Particle Physics Simulator</h1>
      <div className="game-container">
        <ToolPanel
          selectedParticle={selectedParticle}
          setSelectedParticle={setSelectedParticle}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onClear={handleClear}
          onPause={handlePause}
          onResume={handleResume}
          isPaused={isPaused}
        />
        <Canvas width={800} height={600} />
      </div>
    </div>
  );
}

export default App;