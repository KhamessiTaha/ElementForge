import React from 'react';
import { ParticleType } from '../../engine/ParticleTypes';
import { PARTICLE_PROPERTIES } from '../../engine/ParticleTypes';
import './ToolPanel.css';

interface ToolPanelProps {
  selectedParticle: ParticleType;
  setSelectedParticle: (type: ParticleType) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onClear: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedParticle,
  setSelectedParticle,
  brushSize,
  setBrushSize,
  onClear,
  onPause,
  onResume,
  isPaused
}) => {
  const particleTypes = Object.values(ParticleType).filter(t => t !== ParticleType.EMPTY);

  return (
    <div className="tool-panel">
      <div className="particle-selector">
        {particleTypes.map(type => (
          <button
            key={type}
            className={`particle-btn ${selectedParticle === type ? 'active' : ''}`}
            onClick={() => setSelectedParticle(type)}
            style={{ backgroundColor: PARTICLE_PROPERTIES[type].color }}
            title={type}
          />
        ))}
      </div>
      
      <div className="brush-control">
        <label>Brush Size: {brushSize}</label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
      </div>
      
      <div className="action-buttons">
        <button onClick={onClear}>Clear</button>
        <button onClick={isPaused ? onResume : onPause}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default ToolPanel;