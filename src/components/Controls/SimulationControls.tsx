import React from 'react';
import { Play, Pause, RotateCcw, Download, Upload } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  toggleSimulation: () => void;
  clearCanvas: () => void;
  exportScene: () => void;
  importScene: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  toggleSimulation,
  clearCanvas,
  exportScene,
  importScene
}) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={toggleSimulation}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={exportScene}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={importScene}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default SimulationControls;