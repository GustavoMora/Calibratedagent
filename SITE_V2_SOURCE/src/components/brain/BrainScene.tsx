import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { brain, nodeById, regionById } from '../../data';
import { useStore, type BrainView } from '../../store/navigation';
import { buildBrainCloud } from './geometry';
import type { FlowState } from '../../simulation/requestFlow';

export interface Safe {
  /** px reservados a la derecha (panel lateral) */
  right: number;
  /** px reservados abajo (hoja inferior en móvil) */
  bottom: number;
  /** px reservados arriba (breadcrumb y chips) */
  top: number;
}
export interface Orbit {
  yaw: number;
  pitch: number;
  dragging: boolean;
}

const REGION_INDEX = new Map(brain.regions.map((r, i) => [r.id, i]));
const v3 = (a: number[]) => new THREE.Vector3(a[0] ?? 0, a[1] ?? 0, a[2] ?? 0);
const FLOW_REGIONS = new Set(['entrada', 'calibracion', 'politica', 'salidas']);

/** El ensamblaje esfera → cerebro corre una sola vez por carga de página. */
let introDone = false;

// ───────────────────────── cámara ─────────────────────────
interface Shot {
  target: THREE.Vector3;
  dir: THREE.Vector3;
  radius: number;
}

function shotFor(view: BrainView): Shot {
  switch (view.level) {
    case 'region': {
      const c = v3(regionById.get(view.region)?.center ?? [0, 0, 0]);
      // se mira la región manteniendo el cerebro como contexto: objetivo a medio camino del centro
      const target = c.clone().multiplyScalar(0.62);
      const dir = c.clone().normalize().add(new THREE.Vector3(0.25, 0.35, 0.2)).normalize();
      return { target, dir, radius: 1.35 };
    }
    case 'node': {
      const p = v3(nodeById.get(view.node)?.pos ?? [0, 0, 0]);
      const target = p.clone().multiplyScalar(0.85);
      const dir = p.clone().normalize().add(new THREE.Vector3(0.15, 0.3, 0.1)).normalize();
      return { target, dir, radius: 0.85 };
    }
    case 'flow':
      // vista lateral: la ruta entrada (frente) → decisiones (atrás) se ve completa
      return { target: new THREE.Vector3(0, 0.25, 0), dir: new THREE.Vector3(0.93, 0.32, 0.18).normalize(), radius: 1.32 };
    default:
      // v3: encuadre más cerrado (antes 1,7): el cerebro ocupa el escenario
      return { target: new THREE.Vector3(0, 0.02, 0), dir: new THREE.Vector3(0.82, 0.42, 0.55).normalize(), radius: 1.36 };
  }
}

function CameraRig({ safe, orbit }: { safe: React.MutableRefObject<Safe>; orbit: React.MutableRefObject<Orbit> }) {
  const view = useStore((s) => s.view);
  const { camera, size } = useThree();
  const cur = useRef({ target: new THREE.Vector3(0, 0.08, 0), init: false });
  const shot = useMemo(() => shotFor(view), [view]);
  const lastOffset = useRef('');

  useEffect(() => {
    // cada cambio de vista recentra la órbita del usuario
    orbit.current.yaw = 0;
    orbit.current.pitch = 0;
  }, [view, orbit]);

  useFrame((state, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const w = size.width;
    const h = size.height;
    const sr = safe.current;
    // safe areas: corremos el centro óptico para que el panel no tape la escena
    const offX = Math.round(sr.right / 2);
    const offY = Math.round((sr.bottom - sr.top) / 2);
    const key = `${w}x${h}:${offX}:${offY}`;
    if (key !== lastOffset.current) {
      lastOffset.current = key;
      if (offX || offY) cam.setViewOffset(w, h, offX, offY, w, h);
      else cam.clearViewOffset();
      cam.updateProjectionMatrix();
    }
    const visW = Math.max(120, w - sr.right);
    const visH = Math.max(120, h - sr.bottom - sr.top);
    const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const distV = shot.radius / (tanV * (visH / h));
    const distH = shot.radius / (tanV * (visW / h));
    const dist = Math.max(distV, distH) * 1.08;

    const dir = shot.dir.clone();
    const o = orbit.current;
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), o.yaw);
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    dir.applyAxisAngle(right, -o.pitch).normalize();
    const goal = shot.target.clone().add(dir.multiplyScalar(dist));

    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const k = !cur.current.init || reduce ? 1 : 1 - Math.exp(-dt * 3.4);
    cur.current.init = true;
    cam.position.lerp(goal, k);
    cur.current.target.lerp(shot.target, k);
    cam.lookAt(cur.current.target);

    const moving = cam.position.distanceTo(goal) > 0.002 || o.dragging;
    if (moving) state.invalidate();
  });
  return null;
}

// ───────────────────────── nube de puntos ─────────────────────────
const VERT = /* glsl */ `
attribute vec3 aSphere;
attribute float aRegion;
attribute float aSeed;
uniform float uIntro;
uniform float uFocus;
uniform float uDim;
uniform float uGlobal;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uColors[6];
varying vec3 vColor;
varying float vAlpha;
void main() {
  float k = clamp((uIntro - aSeed * 0.35) / 0.65, 0.0, 1.0);
  k = 1.0 - pow(1.0 - k, 3.0);
  vec3 p = mix(aSphere, position, k);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  int ri = int(aRegion + 0.5);
  vec3 col = uColors[0];
  for (int j = 0; j < 6; j++) { if (j == ri) col = uColors[j]; }
  float focus = (uFocus < -0.5 || abs(aRegion - uFocus) < 0.5) ? 1.0 : uDim;
  vColor = mix(vec3(0.96, 0.96, 0.96), col, 0.85 * k);
  vAlpha = (0.2 + 0.34 * aSeed) * focus * uGlobal * (0.5 + 0.5 * k);
  gl_PointSize = uSize * uPixelRatio * (0.7 + aSeed * 0.6) / -mv.z;
}`;

const FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(vColor, a * vAlpha);
}`;

function Cloud({ view }: { view: BrainView }) {
  const { gl, size } = useThree();
  const count = size.width < 700 ? 4200 : 9000;
  const cloud = useMemo(() => buildBrainCloud(count, brain.regions), [count]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3));
    g.setAttribute('aSphere', new THREE.BufferAttribute(cloud.sphere, 3));
    g.setAttribute('aRegion', new THREE.BufferAttribute(cloud.region, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(cloud.seed, 1));
    g.setDrawRange(0, cloud.count);
    return g;
  }, [cloud]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uIntro: { value: introDone ? 1 : 0 },
          uFocus: { value: -1 },
          uDim: { value: 0.16 },
          uGlobal: { value: 1 },
          uSize: { value: 27 },
          uPixelRatio: { value: gl.getPixelRatio() },
          uColors: { value: brain.regions.map((r) => new THREE.Color(r.color)) },
        },
      }),
    [gl],
  );
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);

  const focus = view.level === 'region' || view.level === 'node' ? REGION_INDEX.get(view.region) ?? -1 : -1;
  const intro = useRef(introDone ? 1 : 0);

  useFrame((state, dt) => {
    const u = mat.uniforms;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (intro.current < 1) {
      intro.current = reduce ? 1 : Math.min(1, intro.current + dt / 2.2);
      if (intro.current >= 1) introDone = true;
      state.invalidate();
    }
    u.uIntro!.value = intro.current;
    u.uFocus!.value = focus;
    const targetGlobal = view.level === 'flow' ? 0.5 : 1;
    const g = u.uGlobal!.value as number;
    if (Math.abs(g - targetGlobal) > 0.005) {
      u.uGlobal!.value = g + (targetGlobal - g) * Math.min(1, dt * 4);
      state.invalidate();
    }
    u.uPixelRatio!.value = state.gl.getPixelRatio();
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

// ───────────────────────── anillo de marca ─────────────────────────
const RING_R = 1.5;
function Ring({ level }: { level: BrainView['level'] }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state, dt) => {
    if (!mat.current) return;
    const target = level === 'brain' ? 0.6 : 0.22;
    const o = mat.current.opacity;
    if (Math.abs(o - target) > 0.01) {
      mat.current.opacity = o + (target - o) * Math.min(1, dt * 3);
      state.invalidate();
    }
  });
  return (
    <group rotation={[1.32, 0.12, -0.18]}>
      <mesh>
        <torusGeometry args={[RING_R, 0.005, 8, 220]} />
        <meshBasicMaterial ref={mat} color="#FFFFFF" transparent opacity={0.75} />
      </mesh>
      <mesh position={[RING_R * Math.cos(-0.6), RING_R * Math.sin(-0.6), 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

// ───────────────────────── halo reutilizable ─────────────────────────
let haloTex: THREE.Texture | null = null;
function getHalo(): THREE.Texture {
  if (haloTex) return haloTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  haloTex = new THREE.CanvasTexture(c);
  return haloTex;
}

// ───────────────────────── nodos, enlaces y regiones ─────────────────────────
/** Regla de color v3: solo las decisiones tienen color de semáforo (valores del tema oscuro: la sala 3D siempre es oscura). */
const DECISION_COLOR: Record<string, string> = { actuar: '#3DDC84', preguntar: '#FFB84D', abstenerse: '#FF5A4F' };
function nodeState(id: string, region: string, view: BrainView, flow: FlowState): { scale: number; opacity: number; gold: boolean } {
  const onPath = flow.steps.slice(0, flow.index + 1).some((s) => s.node === id);
  const current = flow.steps[flow.index]?.node === id;
  if (view.level === 'flow') {
    const inRoute = flow.steps.some((s) => s.node === id) || FLOW_REGIONS.has(region);
    return { scale: current ? 1.9 : onPath ? 1.35 : 1, opacity: inRoute ? (onPath ? 1 : 0.55) : 0.12, gold: onPath };
  }
  if (view.level === 'node') {
    if (id === view.node) return { scale: 1.5, opacity: 1, gold: true };
    const linked = brain.links.some(([a, b]) => (a === view.node && b === id) || (b === view.node && a === id));
    return { scale: linked ? 1.3 : 1, opacity: linked || region === view.region ? 0.85 : 0.18, gold: false };
  }
  if (view.level === 'region') return { scale: region === view.region ? 1.35 : 1, opacity: region === view.region ? 1 : 0.2, gold: false };
  return { scale: 1, opacity: 0.85, gold: false };
}

function Nodes({ view, flow }: { view: BrainView; flow: FlowState }) {
  const selectNode = useStore((s) => s.selectNode);
  const halo = useMemo(() => getHalo(), []);
  const geom = useMemo(() => new THREE.SphereGeometry(0.038, 20, 20), []);
  useEffect(() => () => geom.dispose(), [geom]);
  return (
    <group>
      {brain.nodes.map((n) => {
        const st = nodeState(n.id, n.region, view, flow);
        const color = DECISION_COLOR[n.id] ?? (st.gold ? '#FFFFFF' : regionById.get(n.region)?.color ?? '#F5F5F5');
        return (
          <group key={n.id} position={n.pos as [number, number, number]} scale={st.scale}>
            <mesh
              geometry={geom}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                if (e.delta > 6) return;
                e.stopPropagation();
                selectNode(n.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => (document.body.style.cursor = '')}
            >
              <meshBasicMaterial color={color} transparent opacity={st.opacity} />
            </mesh>
            <sprite scale={[0.22, 0.22, 1]}>
              <spriteMaterial map={halo} color={color} transparent opacity={st.opacity * 0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
            </sprite>
          </group>
        );
      })}
    </group>
  );
}

function Links({ view, flow }: { view: BrainView; flow: FlowState }) {
  const base = useMemo(() => {
    const pts: number[] = [];
    for (const [a, b] of brain.links) {
      const A = nodeById.get(a!)?.pos;
      const B = nodeById.get(b!)?.pos;
      if (A && B) pts.push(...A, ...B);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const hi = useMemo(() => {
    const pts: number[] = [];
    if (view.level === 'node') {
      for (const [a, b] of brain.links) {
        if (a === view.node || b === view.node) {
          pts.push(...(nodeById.get(a!)?.pos ?? []), ...(nodeById.get(b!)?.pos ?? []));
        }
      }
    } else if (view.level === 'flow') {
      for (let i = 0; i < flow.index; i++) {
        pts.push(...(nodeById.get(flow.steps[i]!.node)?.pos ?? []), ...(nodeById.get(flow.steps[i + 1]!.node)?.pos ?? []));
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [view, flow.index, flow.steps]);
  useEffect(() => () => base.dispose(), [base]);
  useEffect(() => () => hi.dispose(), [hi]);
  const baseOpacity = view.level === 'brain' ? 0.22 : 0.12;
  return (
    <>
      <lineSegments geometry={base}>
        <lineBasicMaterial color="#BDBDBD" transparent opacity={baseOpacity} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={hi}>
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.9} depthWrite={false} />
      </lineSegments>
    </>
  );
}

function RegionHits() {
  const go = useStore((s) => s.go);
  return (
    <group>
      {brain.regions.map((r) => (
        <mesh
          key={r.id}
          position={r.center as [number, number, number]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (e.delta > 6) return;
            e.stopPropagation();
            go({ level: 'region', region: r.id });
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          <sphereGeometry args={[0.42, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ───────────────────────── pedido en viaje (simulación única) ─────────────────────────
function pointOnPath(flow: FlowState, t: number, out: THREE.Vector3): THREE.Vector3 {
  const a = nodeById.get(flow.steps[flow.index]?.node ?? '')?.pos;
  const b = nodeById.get(flow.steps[Math.min(flow.index + 1, flow.steps.length - 1)]?.node ?? '')?.pos;
  if (!a || !b) return out.set(0, 0, 0);
  const A = v3(a);
  const B = v3(b);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  mid.add(mid.clone().normalize().multiplyScalar(0.22));
  const u = Math.min(1, Math.max(0, t));
  // Bézier cuadrática
  out.copy(A.multiplyScalar((1 - u) * (1 - u)))
    .add(mid.multiplyScalar(2 * (1 - u) * u))
    .add(B.multiplyScalar(u * u));
  return out;
}

function Request() {
  const tick = useStore((s) => s.tick);
  const status = useStore((s) => s.flow.status);
  const head = useRef<THREE.Group>(null);
  const trail = useRef<(THREE.Mesh | null)[]>([]);
  const halo = useMemo(() => getHalo(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    if (status === 'running') {
      tick(Math.min(dt, 0.1));
      state.invalidate();
    }
    const f = useStore.getState().flow;
    if (!head.current) return;
    head.current.visible = f.status !== 'idle';
    if (f.status === 'idle') return;
    pointOnPath(f, f.t, tmp);
    head.current.position.copy(tmp);
    trail.current.forEach((m, i) => {
      if (!m) return;
      const tt = f.t - (i + 1) * 0.045;
      m.visible = f.status === 'running' && tt > 0;
      if (m.visible) pointOnPath(f, tt, m.position);
    });
  });

  return (
    <>
      <group ref={head} visible={false}>
        <mesh>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <sprite scale={[0.5, 0.5, 1]}>
          <spriteMaterial map={halo} color="#FFFFFF" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} ref={(m) => (trail.current[i] = m)} visible={false}>
          <sphereGeometry args={[0.028 * (1 - i / 9), 10, 10]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55 * (1 - i / 8)} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

// ───────────────────────── etiquetas HTML proyectadas ─────────────────────────
function LabelProjector({ layer }: { layer: React.RefObject<HTMLDivElement> }) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const el = layer.current;
    if (!el) return;
    // la matriz de cámara se actualiza recién en el render: forzarla para no proyectar con el frame anterior
    camera.updateMatrixWorld();
    const items = el.querySelectorAll<HTMLElement>('[data-pos]');
    items.forEach((it) => {
      const [x, y, z] = (it.dataset.pos ?? '0,0,0').split(',').map(Number);
      v.set(x ?? 0, y ?? 0, z ?? 0).project(camera);
      const behind = v.z > 1;
      const sx = (v.x * 0.5 + 0.5) * size.width;
      const sy = (-v.y * 0.5 + 0.5) * size.height;
      it.style.transform = `translate(-50%, -50%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
      it.style.visibility = behind ? 'hidden' : 'visible';
    });
  });
  return null;
}

/** Invalida el render a demanda cuando cambia el store (vista, flujo, idioma). */
function StoreInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => useStore.subscribe(() => invalidate()), [invalidate]);
  return null;
}

export function BrainScene({
  safe,
  orbit,
  labelLayer,
}: {
  safe: React.MutableRefObject<Safe>;
  orbit: React.MutableRefObject<Orbit>;
  labelLayer: React.RefObject<HTMLDivElement>;
}) {
  const view = useStore((s) => s.view);
  const flow = useStore((s) => s.flow);
  return (
    <>
      <CameraRig safe={safe} orbit={orbit} />
      <StoreInvalidator />
      <Cloud view={view} />
      <Ring level={view.level} />
      <Links view={view} flow={flow} />
      <RegionHits />
      <Nodes view={view} flow={flow} />
      <Request />
      <LabelProjector layer={labelLayer} />
    </>
  );
}
