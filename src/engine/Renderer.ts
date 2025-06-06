import { Particle, ParticleType } from "./ParticleTypes";

export class Renderer {
  private width: number;
  private height: number;
  private imageData: ImageData | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  render(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    if (
      !this.imageData ||
      this.imageData.width !== this.width ||
      this.imageData.height !== this.height
    ) {
      this.imageData = ctx.createImageData(this.width, this.height);
    }

    // Clear canvas
    const data = this.imageData.data;
    data.fill(0);

    // Draw particles
    particles.forEach((particle) => {
      if (particle.type === ParticleType.EMPTY) return; // Use return instead of continue

      const index = (particle.y * this.width + particle.x) * 4;
      const color = hexToRgb(particle.color);

      if (color) {
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    });

    ctx.putImageData(this.imageData, 0, 0);

    // Draw special effects (fire, smoke) on top
    this.drawSpecialEffects(ctx, particles);
  }

  private drawSpecialEffects(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ) {
    particles.forEach((particle) => {
      if (particle.type === ParticleType.FIRE) {
        ctx.fillStyle = `rgba(255, 100, 0, 0.5)`;
        ctx.fillRect(particle.x - 1, particle.y - 1, 3, 3);
      } else if (particle.type === ParticleType.SMOKE) {
        ctx.fillStyle = `rgba(100, 100, 100, 0.3)`;
        ctx.fillRect(particle.x - 1, particle.y - 1, 3, 3);
      }
    });
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}