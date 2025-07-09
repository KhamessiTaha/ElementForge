import { Particle, MaterialType, GridCell } from '../../types/particles';
import { MATERIALS, GRAVITY, DAMPING, GRID_SIZE, MAX_PARTICLES, TEMPERATURE_DIFFUSION } from '../../constants/materials';

export class ParticlePhysicsEngine {
  private particles: Particle[] = [];
  private particlePool: Particle[] = [];
  private grid: GridCell[][] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private gridWidth: number;
  private gridHeight: number;
  private nextId = 0;
  private dirtyRects: Set<string> = new Set();
  private imageData!: ImageData;
  private buffer!: Uint32Array;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.gridWidth = Math.ceil(this.width / GRID_SIZE);
    this.gridHeight = Math.ceil(this.height / GRID_SIZE);
    
    this.initializeGrid();
    this.initializeImageData();
    this.initializeParticlePool();
  }

  private initializeGrid(): void {
    this.grid = Array(this.gridHeight).fill(null).map(() =>
      Array(this.gridWidth).fill(null).map(() => ({
        particles: [],
        dirty: false
      }))
    );
  }

  private initializeImageData(): void {
    this.imageData = this.ctx.createImageData(this.width, this.height);
    this.buffer = new Uint32Array(this.imageData.data.buffer);
  }

  private initializeParticlePool(): void {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particlePool.push({
        id: -1,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        type: 'sand',
        temperature: 20,
        life: 1,
        color: '#000000',
        density: 1,
        active: false
      });
    }
  }

  private getParticleFromPool(): Particle | null {
    const particle = this.particlePool.pop();
    if (particle) {
      particle.active = true;
      particle.id = this.nextId++;
      return particle;
    }
    return null;
  }

  private returnParticleToPool(particle: Particle): void {
    particle.active = false;
    this.particlePool.push(particle);
  }

  private getGridPosition(x: number, y: number): { gx: number; gy: number } {
    return {
      gx: Math.floor(x / GRID_SIZE),
      gy: Math.floor(y / GRID_SIZE)
    };
  }

  private addToGrid(particle: Particle): void {
    const { gx, gy } = this.getGridPosition(particle.x, particle.y);
    if (gx >= 0 && gx < this.gridWidth && gy >= 0 && gy < this.gridHeight) {
      this.grid[gy][gx].particles.push(particle.id);
      this.grid[gy][gx].dirty = true;
      this.dirtyRects.add(`${gx},${gy}`);
    }
  }

  private removeFromGrid(particle: Particle): void {
    const { gx, gy } = this.getGridPosition(particle.x, particle.y);
    if (gx >= 0 && gx < this.gridWidth && gy >= 0 && gy < this.gridHeight) {
      const cell = this.grid[gy][gx];
      const index = cell.particles.indexOf(particle.id);
      if (index > -1) {
        cell.particles.splice(index, 1);
        cell.dirty = true;
        this.dirtyRects.add(`${gx},${gy}`);
      }
    }
  }

  private getNeighbors(particle: Particle): Particle[] {
    const neighbors: Particle[] = [];
    const { gx, gy } = this.getGridPosition(particle.x, particle.y);
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        
        if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
          const cell = this.grid[ny][nx];
          for (const id of cell.particles) {
            const neighbor = this.particles.find(p => p.id === id);
            if (neighbor && neighbor.id !== particle.id) {
              neighbors.push(neighbor);
            }
          }
        }
      }
    }
    
    return neighbors;
  }

  public addParticle(x: number, y: number, type: MaterialType, brushSize: number = 1): void {
    const material = MATERIALS[type];
    const radius = Math.max(1, brushSize);
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const px = x + dx;
          const py = y + dy;
          
          if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
            const particle = this.getParticleFromPool();
            if (particle && this.particles.length < MAX_PARTICLES) {
              particle.x = px;
              particle.y = py;
              particle.vx = (Math.random() - 0.5) * 0.5;
              particle.vy = (Math.random() - 0.5) * 0.5;
              particle.type = type;
              particle.temperature = material.temperature;
              particle.life = type === 'fire' ? 0.5 + Math.random() * 0.5 : 1;
              particle.color = material.color;
              particle.density = material.density;
              
              this.particles.push(particle);
              this.addToGrid(particle);
            }
          }
        }
      }
    }
  }

  private applyPhysics(particle: Particle): void {
    const material = MATERIALS[particle.type];
    
    // Apply gravity (less for gases)
    if (!material.gaseous) {
      particle.vy += GRAVITY;
    } else {
      particle.vy -= GRAVITY * 0.3; // Gases rise
    }
    
    // Apply viscosity
    particle.vx *= (1 - material.viscosity * 0.1);
    particle.vy *= (1 - material.viscosity * 0.1);
    
    // Temperature effects
    if (particle.temperature > 100 && particle.type === 'water') {
      particle.type = 'steam';
      particle.color = MATERIALS.steam.color;
      particle.density = MATERIALS.steam.density;
    }
    
    // Fire and smoke behavior
    if (particle.type === 'fire') {
      particle.life -= 0.01;
      if (particle.life <= 0) {
        particle.type = 'smoke';
        particle.color = MATERIALS.smoke.color;
        particle.life = 1;
      }
    }
    
    if (particle.type === 'smoke') {
      particle.life -= 0.005;
      if (particle.life <= 0) {
        this.removeParticle(particle);
        return;
      }
    }
  }

  private handleCollisions(particle: Particle): void {
    const neighbors = this.getNeighbors(particle);
    
    for (const neighbor of neighbors) {
      const dx = particle.x - neighbor.x;
      const dy = particle.y - neighbor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 2 && distance > 0) {
        // Handle material interactions
        this.handleMaterialInteraction(particle, neighbor);
        
        // Simple collision response
        const overlap = 2 - distance;
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        particle.x += normalX * overlap * 0.5;
        particle.y += normalY * overlap * 0.5;
        neighbor.x -= normalX * overlap * 0.5;
        neighbor.y -= normalY * overlap * 0.5;
        
        // Velocity exchange based on density
        const totalDensity = particle.density + neighbor.density;
        const impactVelocity = (particle.vx - neighbor.vx) * normalX + (particle.vy - neighbor.vy) * normalY;
        
        if (impactVelocity > 0) {
          const impulse = 2 * impactVelocity / totalDensity;
          particle.vx -= impulse * neighbor.density * normalX;
          particle.vy -= impulse * neighbor.density * normalY;
          neighbor.vx += impulse * particle.density * normalX;
          neighbor.vy += impulse * particle.density * normalY;
        }
      }
    }
  }

  private handleMaterialInteraction(particle1: Particle, particle2: Particle): void {
    const material1 = MATERIALS[particle1.type];
    const material2 = MATERIALS[particle2.type];
    
    // Fire interactions
    if (particle1.type === 'fire' && material2.flammable) {
      particle2.type = 'fire';
      particle2.color = MATERIALS.fire.color;
      particle2.life = 0.5 + Math.random() * 0.5;
      particle2.temperature = 800;
    }
    
    if (particle2.type === 'fire' && material1.flammable) {
      particle1.type = 'fire';
      particle1.color = MATERIALS.fire.color;
      particle1.life = 0.5 + Math.random() * 0.5;
      particle1.temperature = 800;
    }
    
    // Acid dissolving
    if (particle1.type === 'acid' && material2.soluble) {
      this.removeParticle(particle2);
    }
    
    if (particle2.type === 'acid' && material1.soluble) {
      this.removeParticle(particle1);
    }
    
    // Temperature exchange
    const avgTemp = (particle1.temperature + particle2.temperature) / 2;
    particle1.temperature += (avgTemp - particle1.temperature) * TEMPERATURE_DIFFUSION;
    particle2.temperature += (avgTemp - particle2.temperature) * TEMPERATURE_DIFFUSION;
  }

  private removeParticle(particle: Particle): void {
    this.removeFromGrid(particle);
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
      this.returnParticleToPool(particle);
    }
  }

  public update(): number {
    const startTime = performance.now();
    
    // Clear grid
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x].particles = [];
        this.grid[y][x].dirty = false;
      }
    }
    
    // Update particles
    for (const particle of this.particles) {
      this.applyPhysics(particle);
      this.handleCollisions(particle);
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Boundary constraints
      if (particle.x < 0) {
        particle.x = 0;
        particle.vx = -particle.vx * 0.5;
      }
      if (particle.x >= this.width) {
        particle.x = this.width - 1;
        particle.vx = -particle.vx * 0.5;
      }
      if (particle.y < 0) {
        particle.y = 0;
        particle.vy = -particle.vy * 0.5;
      }
      if (particle.y >= this.height) {
        particle.y = this.height - 1;
        particle.vy = -particle.vy * 0.5;
      }
      
      // Re-add to grid
      this.addToGrid(particle);
    }
    
    return performance.now() - startTime;
  }

  public render(): number {
    const startTime = performance.now();
    
    // Clear buffer
    this.buffer.fill(0xFF000000);
    
    // Render particles
    for (const particle of this.particles) {
      const x = Math.floor(particle.x);
      const y = Math.floor(particle.y);
      
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        const index = y * this.width + x;
        const color = this.hexToRgba(particle.color, particle.life);
        this.buffer[index] = color;
      }
    }
    
    // Update canvas
    this.ctx.putImageData(this.imageData, 0, 0);
    
    return performance.now() - startTime;
  }

  private hexToRgba(hex: string, alpha: number): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = Math.floor(alpha * 255);
    
    return (a << 24) | (b << 16) | (g << 8) | r;
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public clear(): void {
    for (const particle of this.particles) {
      this.returnParticleToPool(particle);
    }
    this.particles = [];
    this.dirtyRects.clear();
    this.initializeGrid();
  }

  public exportScene(): string {
    return JSON.stringify({
      particles: this.particles.map(p => ({
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        type: p.type,
        temperature: p.temperature,
        life: p.life
      }))
    });
  }

  public importScene(data: string): void {
    try {
      const scene = JSON.parse(data);
      this.clear();
      
      for (const pData of scene.particles) {
        const particle = this.getParticleFromPool();
        if (particle) {
          particle.x = pData.x;
          particle.y = pData.y;
          particle.vx = pData.vx;
          particle.vy = pData.vy;
          particle.type = pData.type;
          particle.temperature = pData.temperature;
          particle.life = pData.life;
          particle.color = MATERIALS[pData.type as MaterialType].color;
          particle.density = MATERIALS[pData.type as MaterialType].density;
          
          this.particles.push(particle);
          this.addToGrid(particle);
        }
      }
    } catch (error) {
      console.error('Failed to import scene:', error);
    }
  }
}