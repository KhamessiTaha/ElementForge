import { Material, MaterialType } from "../types/particles";

export const MATERIALS: Record<MaterialType, Material> = {
  sand: {
    name: "Sand",
    color: "#F4A460",
    density: 2.65,
    viscosity: 0.9,
    temperature: 20,
    flammable: false,
    soluble: false,
    gaseous: false,
    interactions: { fire: "burn", acid: "dissolve" },
  },
  water: {
    name: "Water",
    color: "#1E90FF",
    density: 1.0,
    viscosity: 0.1,
    temperature: 20,
    flammable: false,
    soluble: false,
    gaseous: false,
    interactions: { fire: "evaporate" },
  },
  stone: {
    name: "Stone",
    color: "#696969",
    density: 3.0,
    viscosity: 1.0,
    temperature: 20,
    flammable: false,
    soluble: false,
    gaseous: false,
    interactions: { acid: "dissolve" },
  },
  fire: {
    name: "Fire",
    color: "#FF4500",
    density: 0.3,
    viscosity: 0.05,
    temperature: 800,
    flammable: false,
    soluble: false,
    gaseous: true,
    interactions: {},
  },
  smoke: {
    name: "Smoke",
    color: "#808080",
    density: 0.5,
    viscosity: 0.02,
    temperature: 100,
    flammable: false,
    soluble: false,
    gaseous: true,
    interactions: {},
  },
  oil: {
    name: "Oil",
    color: "#2F4F2F",
    density: 0.8,
    viscosity: 0.3,
    temperature: 20,
    flammable: true,
    soluble: false,
    gaseous: false,
    interactions: { fire: "burn" },
  },
  acid: {
    name: "Acid",
    color: "#32CD32",
    density: 1.2,
    viscosity: 0.2,
    temperature: 20,
    flammable: false,
    soluble: false,
    gaseous: false,
    interactions: {},
  },
  steam: {
    name: "Steam",
    color: "#E6E6FA",
    density: 0.1,
    viscosity: 0.01,
    temperature: 100,
    flammable: false,
    soluble: false,
    gaseous: true,
    interactions: {},
  },
  // ... rest of the materials
};

export const GRAVITY = 0.2;
export const DAMPING = 0.99;
export const GRID_SIZE = 8;
export const MAX_PARTICLES = 10000;
export const TEMPERATURE_DIFFUSION = 0.1;
