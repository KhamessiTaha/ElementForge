export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: MaterialType;
  temperature: number;
  life: number;
  color: string;
  density: number;
  active: boolean;
}

export type MaterialType = 'sand' | 'water' | 'stone' | 'fire' | 'smoke' | 'oil' | 'acid' | 'steam';

export interface Material {
  name: string;
  color: string;
  density: number;
  viscosity: number;
  temperature: number;
  flammable: boolean;
  soluble: boolean;
  gaseous: boolean;
  interactions: Partial<Record<MaterialType, 'burn' | 'dissolve' | 'evaporate' | 'condense'>>;
}

export interface GridCell {
  particles: number[];
  dirty: boolean;
}