import { Particle, ParticleType, PARTICLE_PROPERTIES } from "./ParticleTypes";

export class Physics {
  private width: number;
  private height: number;
  private gravity = 0.2;
  private friction = 0.9;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  update(
    particles: Particle[],
    grid: (Particle | null)[][]
  ): {
    updatedParticles: Particle[];
    updatedGrid: (Particle | null)[][];
  } {
    // Reset updated flag and grid
    const newGrid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(null));
    const newParticles: Particle[] = [];

    // Process particles in reverse order for proper stacking
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      if (particle.updated) continue;

      const updatedParticle = this.updateParticle(particle, grid);
      newParticles.push(updatedParticle);

      // Place in new grid if still within bounds
      if (
        updatedParticle.x >= 0 &&
        updatedParticle.x < this.width &&
        updatedParticle.y >= 0 &&
        updatedParticle.y < this.height
      ) {
        newGrid[updatedParticle.y][updatedParticle.x] = updatedParticle;
      }
    }

    return {
      updatedParticles: newParticles,
      updatedGrid: newGrid,
    };
  }

  private updateParticle(
    particle: Particle,
    grid: (Particle | null)[][]
  ): Particle {
    const { type, x, y, vx, vy, temperature, life } = particle;
    let newX = x;
    let newY = y;
    let newVx = vx * this.friction;
    let newVy = vy * this.friction;
    let newLife = life;
    let newTemp = temperature;

    // Apply gravity based on density
    const density = PARTICLE_PROPERTIES[type].density;
    if (density > 0) {
      newVy += this.gravity;
    } else if (density < 0) {
      newVy -= this.gravity * 0.5; // Lighter particles rise
    }

    // Handle different particle types
    switch (type) {
      case ParticleType.SAND:
        return this.updateSand(particle, grid);
      case ParticleType.WATER:
        return this.updateWater(particle, grid);
      case ParticleType.FIRE:
        return this.updateFire(particle, grid);
      // Add other particle types...
      default:
        return { ...particle, updated: true };
    }
  }

  private updateSand(
    particle: Particle,
    grid: (Particle | null)[][]
  ): Particle {
    const { x, y, vx, vy } = particle;
    let newX = x;
    let newY = y;
    let newVx = vx;
    let newVy = vy;

    // Check below
    if (this.isCellEmpty(x, y + 1, grid)) {
      newY += 1;
    }
    // Check diagonally below
    else {
      const dir = Math.random() > 0.5 ? 1 : -1;
      if (this.isCellEmpty(x + dir, y + 1, grid)) {
        newX += dir;
        newY += 1;
      } else if (this.isCellEmpty(x - dir, y + 1, grid)) {
        newX -= dir;
        newY += 1;
      }
    }

    return {
      ...particle,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      updated: true,
    };
  }

  private updateWater(
    particle: Particle,
    grid: (Particle | null)[][]
  ): Particle {
    const { x, y, vx, vy } = particle;
    let newX = x;
    let newY = y;
    let newVx = vx;
    let newVy = vy;

    // Check below
    if (this.isCellEmpty(x, y + 1, grid)) {
      newY += 1;
    }
    // Check diagonally below
    else {
      const dir = Math.random() > 0.5 ? 1 : -1;
      if (this.isCellEmpty(x + dir, y + 1, grid)) {
        newX += dir;
        newY += 1;
      } else if (this.isCellEmpty(x - dir, y + 1, grid)) {
        newX -= dir;
        newY += 1;
      }
      // Check sides
      else if (this.isCellEmpty(x + 1, y, grid)) {
        newX += 1;
      } else if (this.isCellEmpty(x - 1, y, grid)) {
        newX -= 1;
      }
    }

    return {
      ...particle,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      updated: true,
    };
  }

  private updateFire(
    particle: Particle,
    grid: (Particle | null)[][]
  ): Particle {
    const { x, y, vx, vy, life } = particle;
    let newX = x;
    let newY = y;
    let newVx = vx;
    let newVy = vy - 0.5; // Fire rises
    let newLife = life - 1;

    // Random movement
    newVx += (Math.random() - 0.5) * 0.5;

    // Check above
    if (this.isCellEmpty(x, y - 1, grid)) {
      newY -= 1;
    } else {
      // Check diagonally above
      const dir = Math.random() > 0.5 ? 1 : -1;
      if (this.isCellEmpty(x + dir, y - 1, grid)) {
        newX += dir;
        newY -= 1;
      } else if (this.isCellEmpty(x - dir, y - 1, grid)) {
        newX -= dir;
        newY -= 1;
      }
    }

    // Spread to flammable materials
    this.spreadFire(x, y, grid);

    // Die if life is over
    if (newLife <= 0) {
      return { ...particle, type: ParticleType.SMOKE, updated: true };
    }

    return {
      ...particle,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      life: newLife,
      updated: true,
    };
  }

  private updateTemperature(
    particle: Particle,
    grid: (Particle | null)[][]
  ): Particle {
    const { x, y, temperature } = particle;
    let newTemp = temperature;

    // Heat transfer with neighbors
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const neighbor = grid[ny][nx];
          if (neighbor) {
            // Transfer heat based on temperature difference
            const tempDiff = temperature - neighbor.temperature;
            const transfer = tempDiff * 0.05;
            newTemp -= transfer;
          }
        }
      }
    }

    // Environmental cooling/heating
    newTemp += (20 - temperature) * 0.01; // Cool towards room temperature

    // State changes
    if (particle.type === ParticleType.ICE && newTemp > 0) {
      return { ...particle, type: ParticleType.WATER, temperature: 0 };
    }
    if (particle.type === ParticleType.WATER && newTemp > 100) {
      return { ...particle, type: ParticleType.STEAM, temperature: 100 };
    }
    if (particle.type === ParticleType.WATER && newTemp < 0) {
      return { ...particle, type: ParticleType.ICE, temperature: 0 };
    }
    if (particle.type === ParticleType.STEAM && newTemp < 100) {
      return { ...particle, type: ParticleType.WATER, temperature: 100 };
    }

    return { ...particle, temperature: newTemp };
  }

  private spreadFire(x: number, y: number, grid: (Particle | null)[][]) {
    // Check adjacent cells for flammable materials
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const neighbor = grid[ny][nx];
          if (neighbor && PARTICLE_PROPERTIES[neighbor.type]?.flammable) {
            // Chance to ignite
            if (Math.random() < 0.1) {
              neighbor.type = ParticleType.FIRE;
              neighbor.life = Math.random() * 100 + 50;
              neighbor.color = PARTICLE_PROPERTIES[ParticleType.FIRE].color;
            }
          }
        }
      }
    }
  }

  private isCellEmpty(
    x: number,
    y: number,
    grid: (Particle | null)[][]
  ): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return grid[y][x] === null;
  }
}
