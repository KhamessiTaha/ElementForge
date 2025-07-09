import React from 'react';
import { Info } from 'lucide-react';
import type { PerformanceMetrics } from '../../types/performance';

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-400">{metrics.fps}</div>
        <div className="text-gray-400">FPS</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-400">{metrics.particleCount}</div>
        <div className="text-gray-400">Particles</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-400">{metrics.memoryUsage.toFixed(1)}MB</div>
        <div className="text-gray-400">Memory</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-400">{metrics.updateTime.toFixed(2)}ms</div>
        <div className="text-gray-400">Update</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-400">{metrics.renderTime.toFixed(2)}ms</div>
        <div className="text-gray-400">Render</div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;