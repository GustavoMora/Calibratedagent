import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useStore } from '../../store/navigation';
import { BrainScene, type Orbit, type Safe } from './BrainScene';

function DragInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    window.addEventListener('ca-invalidate', on);
    return () => window.removeEventListener('ca-invalidate', on);
  }, [invalidate]);
  return null;
}

export default function BrainCanvas({
  safe,
  orbit,
  labelLayer,
  active,
}: {
  safe: React.MutableRefObject<Safe>;
  orbit: React.MutableRefObject<Orbit>;
  labelLayer: React.RefObject<HTMLDivElement>;
  active: boolean;
}) {
  const back = useStore((s) => s.back);
  return (
    <Canvas
      // render a demanda: solo hay frames mientras algo se mueve; fuera de pantalla, ninguno
      frameloop={active ? 'demand' : 'never'}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 38, near: 0.05, far: 50, position: [2.4, 1.6, 3.6] }}
      onPointerMissed={(e) => {
        // clic fuera (sin arrastre) = subir un nivel
        if (!orbit.current.dragging && e.type === 'click') back();
      }}
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
    >
      <DragInvalidator />
      <BrainScene safe={safe} orbit={orbit} labelLayer={labelLayer} />
    </Canvas>
  );
}
