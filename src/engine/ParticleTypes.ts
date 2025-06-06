export enum ParticleType {
  EMPTY = 'empty',
  SAND = 'sand',
  WATER = 'water',
  FIRE = 'fire',
  SMOKE = 'smoke',
  STONE = 'stone',
  WOOD = 'wood',
  OIL = 'oil',
  STEAM = 'steam',
  ICE = 'ice',
  METAL = 'metal'
}

export interface Particle {
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  temperature: number;
  life: number;
  color: string;
  updated: boolean;
}

export const PARTICLE_PROPERTIES: Record<ParticleType, {
  color: string;
  density: number;
  flammable?: boolean;
  meltable?: boolean;
  evaporable?: boolean;
}> = {
  [ParticleType.EMPTY]: { color: '#000000', density: 0 },
  [ParticleType.SAND]: { color: '#f4e542', density: 5 },
  [ParticleType.WATER]: { color: '#3a86ff', density: 3 },
  [ParticleType.FIRE]: { color: '#ff5400', density: -1 },
  [ParticleType.SMOKE]: { color: '#555555', density: -2 },
  [ParticleType.STONE]: { color: '#7f7f7f', density: 10 },
  [ParticleType.WOOD]: { color: '#8b5a2b', density: 4, flammable: true },
  [ParticleType.OIL]: { color: '#333333', density: 2, flammable: true },
  [ParticleType.STEAM]: { color: '#dddddd', density: -1 },
  [ParticleType.ICE]: { color: '#a8d0e6', density: 3, meltable: true },
  [ParticleType.METAL]: { color: '#b8b8b8', density: 8 }
};