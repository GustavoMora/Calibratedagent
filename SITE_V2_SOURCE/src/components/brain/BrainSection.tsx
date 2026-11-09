import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { brain, nodeById, regionById, scenarioById, scenarios } from '../../data';
import { useLang, useT } from '../../app/i18n';
import { useStore } from '../../store/navigation';
import { currentNode, type FlowState } from '../../simulation/requestFlow';
import { fmt } from '../../domain/decisionModel';
import { ActionChip } from '../ui/ActionChip';
import type { Orbit, Safe } from './BrainScene';
import './brain.css';

const BrainCanvas = lazy(() => import('./BrainCanvas'));

const FLOW_REGIONS = new Set(['entrada', 'calibracion', 'politica', 'salidas']);

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Ticker para cuando no hay escena 3D (vista 2D): la misma simulación, otro "reloj". */
function useFlowTicker(active: boolean) {
  const status = useStore((s) => s.flow.status);
  const tick = useStore((s) => s.tick);
  useEffect(() => {
    if (!active || status !== 'running') return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      tick(Math.min(0.1, (t - last) / 1000));
      last = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, status, tick]);
}

function Breadcrumb() {
  const t = useT();
  const lang = useLang();
  const view = useStore((s) => s.view);
  const go = useStore((s) => s.go);
  const crumbs: { label: string; onClick?: () => void }[] = [{ label: t.brainAll, onClick: view.level !== 'brain' ? () => go({ level: 'brain' }) : undefined }];
  if (view.level === 'region' || view.level === 'node') {
    const r = regionById.get(view.region);
    crumbs.push({
      label: r?.label[lang] ?? view.region,
      onClick: view.level === 'node' ? () => go({ level: 'region', region: view.region }) : undefined,
    });
  }
  if (view.level === 'node') crumbs.push({ label: nodeById.get(view.node)?.label[lang] ?? view.node });
  if (view.level === 'flow') crumbs.push({ label: t.brainFlowTitle });
  return (
    <nav className="bc" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((c, i) => (
          <li key={i}>
            {c.onClick ? (
              <button type="button" onClick={c.onClick}>
                {c.label}
              </button>
            ) : (
              <span aria-current="location">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function RegionChips() {
  const lang = useLang();
  const t = useT();
  const view = useStore((s) => s.view);
  const go = useStore((s) => s.go);
  const activeRegion = view.level === 'region' || view.level === 'node' ? view.region : null;
  return (
    <div className="chips" role="group" aria-label={t.nav.brain}>
      {brain.regions.map((r) => (
        <button
          key={r.id}
          type="button"
          className="chip"
          aria-pressed={activeRegion === r.id}
          style={{ ['--rc' as string]: r.color }}
          onClick={() => go({ level: 'region', region: r.id })}
        >
          <span className="dot" aria-hidden="true" />
          {r.label[lang]}
        </button>
      ))}
    </div>
  );
}

function FlowControls({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const flow = useStore((s) => s.flow);
  const send = useStore((s) => s.sendRequest);
  const pause = useStore((s) => s.pause);
  const resume = useStore((s) => s.resume);
  const setSpeed = useStore((s) => s.setSpeed);
  return (
    <div className={`flow-ctl ${compact ? 'compact' : ''}`}>
      {flow.status === 'idle' && (
        <button type="button" className="btn btn-primary btn-sm" onClick={send}>
          ➜ {t.brainSend}
        </button>
      )}
      {flow.status === 'running' && (
        <button type="button" className="btn btn-sm" onClick={pause}>
          ❚❚ {t.brainPause}
        </button>
      )}
      {flow.status === 'paused' && (
        <button type="button" className="btn btn-sm" onClick={resume}>
          ▶ {t.brainResume}
        </button>
      )}
      {flow.status !== 'idle' && (
        <button type="button" className="btn btn-sm" onClick={send}>
          ↺ {t.brainReplay}
        </button>
      )}
      {!compact && (
        <label className="speed">
          <span>{t.brainSpeed}</span>
          <select value={flow.speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={0.5}>0,5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      )}
    </div>
  );
}

function CasePicker() {
  const t = useT();
  const lang = useLang();
  const caseId = useStore((s) => s.caseId);
  const setCase = useStore((s) => s.setCase);
  return (
    <div className="case-pick" role="group" aria-label={t.brainCase}>
      {scenarios.map((s) => (
        <button key={s.id} type="button" className="btn btn-sm" aria-pressed={s.id === caseId} onClick={() => setCase(s.id)}>
          {s.label[lang]}
        </button>
      ))}
    </div>
  );
}

function FlowFeed({ flow }: { flow: FlowState }) {
  const t = useT();
  const lang = useLang();
  const sc = scenarioById(useStore((s) => s.caseId));
  const stageLabel = (id: string) => brain.flow.stages.find((s) => s.id === id)?.label[lang] ?? id;
  return (
    <div className="feed">
      <p className="feed-req">
        <span className="note">{t.caseFields.request}:</span> {sc.request[lang]}
      </p>
      <p className="note">
        {t.thClass[sc.riskClass]} · p = <span className="mono">{fmt(sc.p, 2, lang)}</span> <span className="tag tag-hypo">{t.hypothetical}</span>
      </p>
      {flow.status === 'idle' ? (
        <p className="feed-idle">{t.brainFlowIdle}</p>
      ) : (
        <ol className="feed-steps" aria-live="polite">
          {flow.steps.map((s, i) => {
            const n = nodeById.get(s.node);
            const state = i < flow.index ? 'done' : i === flow.index ? 'now' : 'next';
            return (
              <li key={`${s.node}-${i}`} data-state={state}>
                <span className="feed-stage">{stageLabel(s.stage)}</span>
                <span className="feed-node">{n?.label[lang]}</span>
              </li>
            );
          })}
        </ol>
      )}
      {flow.status === 'done' && flow.outcome && (
        <div className="feed-out">
          <span className="note">{t.brainOutcome}</span> <ActionChip action={flow.outcome} />
          <p>{sc.why[lang]}</p>
          {flow.vetoApplied && <p className="case-veto">⚠ {t.brainVeto}</p>}
          {sc.irreversible && !flow.vetoApplied && <p className="case-veto">⚠ {t.veto}</p>}
        </div>
      )}
      <p className="note">{t.brainFlowNote}</p>
    </div>
  );
}

function Panel() {
  const t = useT();
  const lang = useLang();
  const view = useStore((s) => s.view);
  const flow = useStore((s) => s.flow);
  const go = useStore((s) => s.go);
  const back = useStore((s) => s.back);
  const selectNode = useStore((s) => s.selectNode);
  const headRef = useRef<HTMLHeadingElement>(null);

  // mover el foco al título del panel al cambiar de nivel (lectores de pantalla y teclado)
  useEffect(() => {
    if (view.level !== 'brain') headRef.current?.focus({ preventScroll: true });
  }, [view]);

  if (view.level === 'brain') {
    return (
      <div className="panel-body">
        <h3 ref={headRef} tabIndex={-1}>
          {t.brainTitle}
        </h3>
        <p className="note">{t.brainHint}</p>
        <ul className="region-list">
          {brain.regions.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => go({ level: 'region', region: r.id })} style={{ ['--rc' as string]: r.color }}>
                <span className="dot" aria-hidden="true" />
                <strong>{r.label[lang]}</strong>
                <span className="note">{r.summary[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="panel-cta">
          <CasePicker />
          <FlowControls compact />
        </div>
      </div>
    );
  }

  if (view.level === 'flow') {
    return (
      <div className="panel-body">
        <h3 ref={headRef} tabIndex={-1}>
          {t.brainFlowTitle}
        </h3>
        <CasePicker />
        <FlowControls />
        <FlowFeed flow={flow} />
        <button type="button" className="btn btn-sm" onClick={() => go({ level: 'brain' })}>
          ← {t.brainBack}
        </button>
      </div>
    );
  }

  const region = regionById.get(view.region);
  if (view.level === 'region') {
    const nodes = brain.nodes.filter((n) => n.region === view.region);
    return (
      <div className="panel-body">
        <span className="kicker" style={{ color: region?.color }}>
          {t.nav.brain}
        </span>
        <h3 ref={headRef} tabIndex={-1}>
          {region?.label[lang]}
        </h3>
        <p>{region?.summary[lang]}</p>
        <h4 className="panel-sub">{t.brainRegionNodes}</h4>
        <ul className="node-list">
          {nodes.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => selectNode(n.id)}>
                {n.label[lang]} <span aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>
        {FLOW_REGIONS.has(view.region) && (
          <div className="panel-cta">
            <p className="note">{t.brainFlowNote}</p>
            <FlowControls compact />
          </div>
        )}
        <button type="button" className="btn btn-sm" onClick={back}>
          ← {t.brainBack}
        </button>
      </div>
    );
  }

  const node = nodeById.get(view.node);
  if (!node) return null;
  const conns = brain.links.filter(([a, b]) => a === node.id || b === node.id).map(([a, b]) => (a === node.id ? b! : a!));
  return (
    <div className="panel-body">
      <span className="kicker" style={{ color: region?.color }}>
        {region?.label[lang]}
      </span>
      <h3 ref={headRef} tabIndex={-1}>
        {node.label[lang]}
      </h3>
      <span className={`tag ${node.tag === 'ILLUSTRATION' ? 'tag-hypo' : node.tag === 'EXTERNAL' ? '' : 'tag-int'}`}>{t.tags[node.tag] ?? node.tag}</span>
      <p className="node-desc">{node.desc[lang]}</p>
      <p className="node-ex">
        <span className="note">{lang === 'es' ? 'Ejemplo' : 'Example'}:</span> {node.example[lang]}
      </p>
      {node.url && (
        <p>
          <a href={node.url} target="_blank" rel="noopener noreferrer">
            {t.brainOpen} ↗
          </a>
        </p>
      )}
      {conns.length > 0 && (
        <>
          <h4 className="panel-sub">{t.brainConnections}</h4>
          <ul className="node-list">
            {conns.map((id) => (
              <li key={id}>
                <button type="button" onClick={() => selectNode(id)}>
                  {nodeById.get(id)?.label[lang]} <span aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="panel-row">
        <button type="button" className="btn btn-sm" onClick={back}>
          ↑ {t.brainUp}
        </button>
        <button type="button" className="btn btn-sm" onClick={() => go({ level: 'brain' })}>
          ← {t.brainBack}
        </button>
      </div>
    </div>
  );
}

/** Etiquetas clicables proyectadas sobre la escena (también son la navegación por teclado del 3D). */
function Labels({ layer }: { layer: React.RefObject<HTMLDivElement> }) {
  const lang = useLang();
  const view = useStore((s) => s.view);
  const flow = useStore((s) => s.flow);
  const go = useStore((s) => s.go);
  const selectNode = useStore((s) => s.selectNode);
  let items: { id: string; pos: number[]; text: string; kind: 'region' | 'node'; on: () => void; current?: boolean }[] = [];
  if (view.level === 'brain') {
    items = brain.regions.map((r) => ({
      id: r.id,
      pos: r.center.map((c) => c * 1.12),
      text: r.label[lang],
      kind: 'region',
      on: () => go({ level: 'region', region: r.id }),
    }));
  } else if (view.level === 'flow') {
    const cur = currentNode(flow);
    const ids = flow.steps.length ? Array.from(new Set(flow.steps.map((s) => s.node))) : ['pedido', 'contexto', 'agente', 'calibrador', 'regla', 'actuar', 'preguntar', 'abstenerse'];
    items = ids.map((id) => {
      const n = nodeById.get(id)!;
      return { id, pos: n.pos, text: n.label[lang], kind: 'node', on: () => selectNode(id), current: id === cur };
    });
  } else {
    items = brain.nodes
      .filter((n) => n.region === view.region || (view.level === 'node' && brain.links.some(([a, b]) => (a === view.node && b === n.id) || (b === view.node && a === n.id))))
      .map((n) => ({ id: n.id, pos: n.pos, text: n.label[lang], kind: 'node', on: () => selectNode(n.id), current: view.level === 'node' && view.node === n.id }));
  }
  return (
    <div className="labels" ref={layer} aria-hidden="true">
      {items.map((it) => (
        <button
          key={`${view.level}-${it.id}`}
          type="button"
          tabIndex={-1}
          className={`lbl lbl-${it.kind} ${it.current ? 'is-current' : ''}`}
          data-pos={it.pos.join(',')}
          onClick={it.on}
        >
          {it.text}
        </button>
      ))}
    </div>
  );
}

/** Vista 2D accesible: mismo contenido y mismo estado que la escena 3D. */
function Brain2D() {
  const lang = useLang();
  const view = useStore((s) => s.view);
  const flow = useStore((s) => s.flow);
  const go = useStore((s) => s.go);
  const selectNode = useStore((s) => s.selectNode);
  const visited = new Set(flow.steps.slice(0, flow.index + 1).map((s) => s.node));
  return (
    <div className="brain2d">
      {brain.regions.map((r) => {
        const activeR = (view.level === 'region' || view.level === 'node') && view.region === r.id;
        return (
          <section key={r.id} className={`b2-region ${activeR ? 'is-active' : ''}`} style={{ ['--rc' as string]: r.color }}>
            <button type="button" className="b2-rtitle" aria-pressed={activeR} onClick={() => go({ level: 'region', region: r.id })}>
              <span className="dot" aria-hidden="true" /> {r.label[lang]}
            </button>
            <ul>
              {brain.nodes
                .filter((n) => n.region === r.id)
                .map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      aria-pressed={view.level === 'node' && view.node === n.id}
                      className={visited.has(n.id) && view.level === 'flow' ? 'is-visited' : ''}
                      onClick={() => selectNode(n.id)}
                    >
                      {n.label[lang]}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function BrainSection() {
  const t = useT();
  const view = useStore((s) => s.view);
  const back = useStore((s) => s.back);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const labelLayer = useRef<HTMLDivElement>(null);
  const safe = useRef<Safe>({ right: 0, bottom: 0, top: 0 });
  const orbit = useRef<Orbit>({ yaw: 0, pitch: 0, dragging: false });
  const [webgl] = useState(() => hasWebGL());
  const [mode, setMode] = useState<'3d' | '2d'>(() => (hasWebGL() ? '3d' : '2d'));
  const [inView, setInView] = useState(false);

  useFlowTicker(mode === '2d');

  // safe areas según el layout real del panel
  useLayoutEffect(() => {
    const update = () => {
      const stage = stageRef.current;
      const panel = panelRef.current;
      if (!stage || !panel) return;
      const sr = stage.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      const mobile = sr.width < 760;
      const chips = stage.querySelector('.chips')?.getBoundingClientRect();
      const top = chips ? Math.max(0, chips.bottom - sr.top + 8) : 0;
      safe.current = mobile
        ? { right: 0, bottom: Math.max(0, sr.bottom - pr.top), top }
        : { right: Math.max(0, sr.right - pr.left + 12), bottom: 0, top: Math.round(top * 0.5) };
      window.dispatchEvent(new Event('ca-invalidate'));
    };
    update();
    const ro = new ResizeObserver(update);
    if (stageRef.current) ro.observe(stageRef.current);
    if (panelRef.current) ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, [view]);

  // pausar render fuera de pantalla
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Escape sube un nivel cuando el cerebro está en pantalla
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !inView) return;
      if (useStore.getState().view.level !== 'brain') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, back]);

  // arrastre para girar (horizontal en touch; la página sigue scrolleando en vertical)
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, select, input')) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) < 3) return;
    orbit.current.dragging = true;
    orbit.current.yaw -= dx * 0.006;
    if (e.pointerType !== 'touch') orbit.current.pitch = Math.max(-0.6, Math.min(0.6, orbit.current.pitch + dy * 0.004));
    d.x = e.clientX;
    d.y = e.clientY;
    window.dispatchEvent(new Event('ca-invalidate'));
  }, []);
  const endDrag = useCallback(() => {
    drag.current = null;
    orbit.current.dragging = false;
  }, []);

  return (
    <section id="cerebro" className="chapter chapter-brain" aria-labelledby="brain-h">
      <div className="wrap">
        <header className="chapter-head">
          <span className="kicker">{t.brainKicker}</span>
          <h2 id="brain-h">{t.brainTitle}</h2>
          <p className="lead">{t.brainLead}</p>
        </header>
      </div>

      <div className={`brain-stage mode-${mode} level-${view.level}`} ref={stageRef}>
        <div className="stage-top">
          <Breadcrumb />
          <div className="stage-tools">
            {webgl && (
              <button type="button" className="btn btn-sm" onClick={() => setMode((m) => (m === '3d' ? '2d' : '3d'))}>
                {mode === '3d' ? t.brain2d : t.brain3d}
              </button>
            )}
          </div>
        </div>
        <RegionChips />

        {mode === '3d' ? (
          <div
            className="canvas-wrap"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
          >
            <Suspense fallback={<div className="canvas-loading" />}>
              <BrainCanvas safe={safe} orbit={orbit} labelLayer={labelLayer} active={inView} />
            </Suspense>
            <Labels layer={labelLayer} />
            <div className="legend-mini note" aria-hidden="true">
              {t.brainLegend.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="canvas-wrap is-2d">
            {!webgl && <p className="note nowebgl">{t.brainNoWebGL}</p>}
            <Brain2D />
          </div>
        )}

        <aside className="brain-panel card" ref={panelRef} aria-live="polite">
          <Panel />
        </aside>
      </div>
    </section>
  );
}
