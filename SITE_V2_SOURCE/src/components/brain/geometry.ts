/**
 * Geometría procedural y determinista del cerebro (sin assets externos).
 * Dos hemisferios elipsoidales con pliegues, cisura central y cerebelo. Cada punto pertenece a la región
 * de centro más cercano (brain.json). Además guarda una posición de partida sobre una esfera (motivo de marca)
 * para la animación de ensamblaje.
 */
import type { BrainRegion } from '../../data/types';
import { mulberry32 } from '../../domain/prng';

export interface BrainCloud {
  positions: Float32Array;
  sphere: Float32Array;
  region: Float32Array;
  seed: Float32Array;
  count: number;
}

export function buildBrainCloud(count: number, regions: BrainRegion[]): BrainCloud {
  const rnd = mulberry32(20261025);
  const positions = new Float32Array(count * 3);
  const sphere = new Float32Array(count * 3);
  const region = new Float32Array(count);
  const seed = new Float32Array(count);
  const centers = regions.map((r) => r.center as [number, number, number]);

  let i = 0;
  let guard = 0;
  while (i < count && guard < count * 20) {
    guard++;
    // dirección uniforme
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dx = s * Math.cos(th);
    const dy = u;
    const dz = s * Math.sin(th);
    const cerebellum = rnd() < 0.09;
    let x: number;
    let y: number;
    let z: number;
    if (cerebellum) {
      const rr = 0.92 + rnd() * 0.08;
      x = dx * 0.62 * rr;
      y = dy * 0.3 * rr - 0.62;
      z = dz * 0.42 * rr - 0.78;
      if (y > -0.45) continue;
    } else {
      const left = dx < 0;
      // radio sesgado hacia la superficie: se lee como silueta, no como bola maciza
      const depth = 1 - Math.pow(rnd(), 2.2) * 0.14;
      // pliegues (giros y surcos)
      const fold = 1 + 0.07 * Math.sin(9 * th + 3 * u) * Math.sin(7 * u + 2 * th) + 0.03 * Math.sin(23 * th) * Math.cos(19 * u);
      const r = depth * fold;
      x = Math.abs(dx) * 0.72 * r + 0.06;
      x = left ? -x : x;
      y = dy * 0.9 * r + 0.1;
      z = dz * 1.32 * r;
      // base aplanada y lóbulos temporales
      if (y < -0.35) y = -0.35 + (y + 0.35) * 0.45;
      if (y < -0.2 && z > 0.65) continue;
      // cisura entre hemisferios
      if (Math.abs(x) < 0.07 && y > 0.1) continue;
    }
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // esfera de partida (Fibonacci) para el ensamblaje
    const fy = 1 - (i / Math.max(1, count - 1)) * 2;
    const fr = Math.sqrt(1 - fy * fy);
    const fth = i * 2.399963;
    sphere[i * 3] = Math.cos(fth) * fr * 1.25;
    sphere[i * 3 + 1] = fy * 1.25;
    sphere[i * 3 + 2] = Math.sin(fth) * fr * 1.25;

    let best = 0;
    let bestD = Infinity;
    centers.forEach((c, ci) => {
      const d = (x - c[0]) ** 2 + (y - c[1]) ** 2 * 1.2 + (z - c[2]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = ci;
      }
    });
    region[i] = best;
    seed[i] = rnd();
    i++;
  }
  return { positions, sphere, region, seed, count: i };
}
