import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './RoutingVisualizer.css';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Upstream {
  provider: string;
  model: string;
  color: string;
  icon: string;
  meta?: string;
}

interface SubRouter {
  label: string;
  type: string;
  upstreams: Upstream[];
}

interface Mode {
  key: string;
  labelKey: string;
  upstreams: Upstream[];
  subRouters?: SubRouter[];
}

const MODES: Mode[] = [
  {
    key: 'smart',
    labelKey: 'smart',
    upstreams: [
      { provider: 'Anthropic', model: 'Claude Opus 4.6', color: '#d97706', icon: 'A', meta: 'IQ 53 · Speed 56.9 · $5/$25' },
      { provider: 'Anthropic', model: 'Claude Sonnet 4.6', color: '#d97706', icon: 'A', meta: 'IQ 52 · Speed 63.2 · $3/$15' },
      { provider: 'OpenAI', model: 'GPT 5.4', color: '#10b981', icon: 'O', meta: 'IQ 57 · Speed 82.0 · $2.5/$15' },
      { provider: 'Ollama', model: 'GLM 5', color: '#6366f1', icon: 'L', meta: 'IQ 50 · Speed 75.9 · $1/$3.2' },
    ],
  },
  {
    key: 'failover',
    labelKey: 'failover',
    upstreams: [
      { provider: 'Anthropic', model: 'Claude Opus 4.6', color: '#d97706', icon: 'A', meta: 'primary' },
      { provider: 'Anthropic', model: 'Claude Sonnet 4.6', color: '#d97706', icon: 'A', meta: 'fallback1' },
      { provider: 'Anthropic', model: 'Claude Opus 4.5', color: '#d97706', icon: 'A', meta: 'fallback2' },
    ],
  },
  {
    key: 'weighted',
    labelKey: 'weighted',
    upstreams: [
      { provider: 'Ollama', model: 'qwen3.5:35b', color: '#6366f1', icon: 'L', meta: '60%' },
      { provider: 'Ollama', model: 'qwen3.5:35b-a3b-q8_0', color: '#6366f1', icon: 'L', meta: '20%' },
      { provider: 'Ollama', model: 'qwen3.5:35b-a3b-bf16', color: '#6366f1', icon: 'L', meta: '20%' },
    ],
  },
  {
    key: 'combined',
    labelKey: 'combined',
    upstreams: [],
    subRouters: [
      {
        label: 'Failover A',
        type: 'failover',
        upstreams: [
          { provider: 'Bedrock', model: 'Claude Opus 4.6', color: '#d97706', icon: 'B', meta: 'EU Stockholm' },
          { provider: 'Bedrock', model: 'Claude Opus 4.6', color: '#d97706', icon: 'B', meta: 'EU Frankfurt' },
        ],
      },
      {
        label: 'Failover B',
        type: 'failover',
        upstreams: [
          { provider: 'Bedrock', model: 'gpt-oss-120b', color: '#10b981', icon: 'B', meta: 'EU Frankfurt' },
          { provider: 'Bedrock', model: 'gpt-oss-120b', color: '#10b981', icon: 'B', meta: 'EU Stockholm' },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Packet                                                             */
/* ------------------------------------------------------------------ */

interface Packet {
  id: number;
  targetIdx: number;
  progress: number;
  returning: boolean;
  failed?: boolean;
  retryTo?: number;
  segment?: number;
  subTarget?: number;
}

/* ------------------------------------------------------------------ */
/*  Layout: compute all positions as percentages                       */
/* ------------------------------------------------------------------ */

interface Pt { x: number; y: number }
interface Line { x1: number; y1: number; x2: number; y2: number }

function computeLayout(mode: Mode) {
  const isCombined = mode.key === 'combined';

  // Anchor points (percentage of container width/height)
  const clientPt: Pt = { x: 13, y: 50 };

  if (!isCombined) {
    const gwPt: Pt = { x: 47, y: 50 };
    const n = mode.upstreams.length;
    const upPts: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const ySpread = Math.min(70, n * 20);
      const y = 50 - ySpread / 2 + (n === 1 ? 0 : (i * ySpread) / (n - 1));
      upPts.push({ x: 75, y });
    }
    // Lines: gw center -> each upstream center (nodes draw on top to hide overlap)
    const gwLines: Line[] = upPts.map((u) => ({ x1: gwPt.x, y1: gwPt.y, x2: u.x, y2: u.y }));
    // Wire: client center -> gw center
    const wire: Line = { x1: clientPt.x, y1: clientPt.y, x2: gwPt.x, y2: gwPt.y };

    return { isCombined: false as const, clientPt, gwPt, upPts, gwLines, wire, subRouterPts: [], subUpPts: [], subGwLines: [], subUpLines: [] };
  }

  // Combined layout: columns at ~13%, 36%, 56%, 80%
  const gwPt: Pt = { x: 40, y: 50 };
  const srs = mode.subRouters!;
  const srCount = srs.length;
  const srPts: Pt[] = [];
  for (let i = 0; i < srCount; i++) {
    const ySpread = 36;
    const y = 50 - ySpread / 2 + (srCount === 1 ? 0 : (i * ySpread) / (srCount - 1));
    srPts.push({ x: 60, y });
  }
  // gw center -> sub-router center
  const subGwLines: Line[] = srPts.map((sr) => ({ x1: gwPt.x, y1: gwPt.y, x2: sr.x, y2: sr.y }));

  // Each sub-router -> its upstreams
  // Place each sub-router's upstreams around its Y, with enough spread to avoid overlap
  const subUpPts: Pt[][] = [];
  const subUpLines: Line[][] = [];
  // Calculate total upstream count to distribute evenly across the full height
  const allUps = srs.flatMap(s => s.upstreams);
  const totalUps = allUps.length;
  const totalSpread = Math.min(66, totalUps * 18);
  let upIdx = 0;
  for (let i = 0; i < srCount; i++) {
    const sr = srPts[i];
    const ups = srs[i].upstreams;
    const pts: Pt[] = [];
    const lns: Line[] = [];
    for (let j = 0; j < ups.length; j++) {
      const y = 50 - totalSpread / 2 + (totalUps === 1 ? 0 : (upIdx * totalSpread) / (totalUps - 1));
      const pt: Pt = { x: 80, y };
      pts.push(pt);
      lns.push({ x1: sr.x, y1: sr.y, x2: pt.x, y2: pt.y });
      upIdx++;
    }
    subUpPts.push(pts);
    subUpLines.push(lns);
  }

  const wire: Line = { x1: clientPt.x, y1: clientPt.y, x2: gwPt.x, y2: gwPt.y };

  return { isCombined: true as const, clientPt, gwPt, upPts: [], gwLines: [], wire, subRouterPts: srPts, subUpPts, subGwLines: subGwLines, subUpLines };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RoutingVisualizer() {
  const { t } = useTranslation('landing');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [wirePackets, setWirePackets] = useState<{ id: number; progress: number; returning: boolean }[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [litSub, setLitSub] = useState<{ router: number; up: number } | null>(null);
  const pid = useRef(0);
  const rafRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Pause animation when component is not visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mode = MODES[activeIdx];
  const isCombined = mode.key === 'combined';
  const targetCount = isCombined ? mode.subRouters!.length : mode.upstreams.length;
  const layout = useMemo(() => computeLayout(mode), [mode]);

  // All connection lines flattened for packet position calculation
  const allLines = useMemo(() => {
    if (!layout.isCombined) return { simple: layout.gwLines, sub: [] as Line[][] };
    return { simple: layout.subGwLines, sub: layout.subUpLines };
  }, [layout]);

  // Auto-cycle
  useEffect(() => {
    if (isPaused || !isVisible) return;
    const timer = setInterval(() => setActiveIdx((p) => (p + 1) % MODES.length), 8000);
    return () => clearInterval(timer);
  }, [isPaused, isVisible]);

  // Reset on mode change -- seed with packets already in flight
  useEffect(() => {
    const tc = isCombined ? (mode.subRouters?.length || 0) : mode.upstreams.length;
    const seed: Packet[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = tc > 0 ? i % tc : 0;
      seed.push({
        id: ++pid.current, targetIdx: idx, progress: Math.random() * 0.8,
        returning: false, failed: false,
        ...(isCombined ? { segment: 0 } : {}),
      });
    }
    // Seed some returning packets too
    for (let i = 0; i < 3; i++) {
      const idx = tc > 0 ? i % tc : 0;
      seed.push({
        id: ++pid.current, targetIdx: idx, progress: Math.random() * 0.7,
        returning: true, failed: false,
        ...(isCombined ? { segment: 0 } : {}),
      });
    }
    setPackets(seed);
    // Seed wire packets
    setWirePackets([
      { id: ++pid.current, progress: 0.2, returning: false },
      { id: ++pid.current, progress: 0.6, returning: false },
      { id: ++pid.current, progress: 0.3, returning: true },
      { id: ++pid.current, progress: 0.7, returning: true },
    ]);
    setLit(null);
    setLitSub(null);
  }, [activeIdx]);

  // Spawn packets
  useEffect(() => {
    if (targetCount === 0 || !isVisible) return;
    const timer = setInterval(() => {
      let idx: number;
      if (mode.key === 'failover') {
        idx = 0;
      } else if (mode.key === 'weighted') {
        const r = Math.random();
        idx = r < 0.5 ? 0 : r < 0.8 ? 1 : Math.min(2, targetCount - 1);
      } else {
        idx = Math.floor(Math.random() * targetCount);
      }
      // Mark for failure but don't show red until it returns from upstream
      const willFail = mode.key === 'failover' && idx === 0 && Math.random() < 0.35;
      setPackets((prev) => [
        ...prev,
        {
          id: ++pid.current, targetIdx: idx, progress: 0, returning: false,
          failed: false, retryTo: willFail ? Math.min(idx + 1, targetCount - 1) : undefined,
          ...(isCombined ? { segment: 0 } : {}),
        },
      ]);
    }, 400);
    // Spawn wire packets in both directions
    const w = setInterval(() => {
      setWirePackets((prev) => [
        ...prev,
        { id: ++pid.current, progress: 0, returning: false },
        { id: ++pid.current, progress: 0, returning: true },
      ]);
    }, 600);
    return () => { clearInterval(timer); clearInterval(w); };
  }, [mode, targetCount, isCombined, isVisible]);

  // Animate
  useEffect(() => {
    if (!isVisible) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPackets((prev) => {
        const next: Packet[] = [];
        for (const p of prev) {
          const np = { ...p, progress: p.progress + 0.8 * dt };
          const isCombinedPacket = np.segment != null;

          if (isCombinedPacket) {
            if (!p.returning && np.progress >= 1) {
              if (np.segment === 0) {
                // Reached sub-router: always target primary (0), mark if will fail
                const willFail = Math.random() < 0.25;
                next.push({ ...np, segment: 1, subTarget: 0, progress: 0, failed: false, retryTo: willFail ? 1 : undefined });
              } else {
                // Reached upstream
                if (p.retryTo != null) {
                  // Will fail: return as red from upstream
                  next.push({ ...np, returning: true, progress: 0, failed: true });
                } else {
                  // Success: return as green
                  next.push({ ...np, returning: true, progress: 0 });
                }
              }
              continue;
            }
            if (p.returning && np.progress >= 1) {
              if (np.segment === 1) {
                if (p.failed && p.retryTo != null) {
                  // Red return reached sub-router: retry on fallback
                  next.push({ ...np, returning: false, progress: 0, subTarget: p.retryTo, failed: false, retryTo: undefined });
                } else {
                  // Green return: continue back through segment 0
                  next.push({ ...np, segment: 0, progress: 0, failed: false });
                }
              }
              // segment 0 return reached gateway: done
              continue;
            }
            next.push(np);
          } else {
            if (!p.returning && np.progress >= 1) {
              if (p.retryTo != null) {
                // Reached upstream but will fail: return as red
                next.push({ ...np, returning: true, progress: 0, failed: true });
              } else {
                // Success: return as green
                next.push({ ...np, returning: true, progress: 0 });
              }
              continue;
            }
            if (p.returning && np.progress >= 1) {
              if (p.retryTo != null && p.failed) {
                // Red return reached gateway: spawn retry to fallback
                next.push({ id: ++pid.current, targetIdx: p.retryTo, progress: 0, returning: false, failed: false });
              }
              continue;
            }
            next.push(np);
          }
        }
        return next;
      });
      // Animate wire packets
      setWirePackets((prev) => prev
        .map((wp) => ({ ...wp, progress: wp.progress + 0.8 * dt }))
        .filter((wp) => wp.progress < 1)
      );

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetCount, mode, isVisible]);

  // Highlight
  useEffect(() => {
    const hit = packets.find((p) => !p.returning && p.progress > 0.75 && !p.failed);
    if (!hit) { setLit(null); setLitSub(null); return; }
    if (hit.segment === 1 && hit.subTarget != null) {
      setLit(null);
      setLitSub({ router: hit.targetIdx, up: hit.subTarget });
    } else {
      setLit(hit.targetIdx);
      setLitSub(null);
    }
  }, [packets]);

  const select = (i: number) => { setActiveIdx(i); setIsPaused(true); };

  // Resolve translated meta for failover upstreams
  const getUpstreamMeta = (u: Upstream): string | undefined => {
    if (!u.meta) return undefined;
    // Check if meta is a translatable key (primary, fallback1, fallback2)
    const metaKey = `routing.upstreamMeta.${u.meta}`;
    const translated = t(metaKey, { defaultValue: '' });
    return translated || u.meta;
  };

  // Packet position from line + progress (percentage coords)
  const getPacketPct = (p: Packet): Pt | null => {
    let line: Line | undefined;
    if (p.segment != null) {
      line = p.segment === 0 ? allLines.simple[p.targetIdx] : allLines.sub[p.targetIdx]?.[p.subTarget ?? 0];
    } else {
      line = allLines.simple[p.targetIdx];
    }
    if (!line) return null;
    const { x1, y1, x2, y2 } = line;
    if (p.returning) return { x: x2 + (x1 - x2) * p.progress, y: y2 + (y1 - y2) * p.progress };
    return { x: x1 + (x2 - x1) * p.progress, y: y1 + (y2 - y1) * p.progress };
  };

  /* ---- Render helpers ---- */
  const GwIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  );

  const UpCard = ({ u, isLit }: { u: Upstream; isLit: boolean }) => (
    <div className={`rv-up ${isLit ? 'lit' : ''}`}>
      <div className="rv-up-badge" style={{ background: u.color }}>{u.icon}</div>
      <div className="rv-up-text">
        <span className="rv-up-name">{u.provider} <span className="rv-up-model">{u.model}</span></span>
        {u.meta && <span className="rv-up-meta">{getUpstreamMeta(u)}</span>}
      </div>
    </div>
  );

  const modeTagline = t(`routing.modes.${mode.key}.tagline`);
  const modeDescription = t(`routing.modes.${mode.key}.description`);
  const modeRouterLabel = t(`routing.modes.${mode.key}.routerLabel`);

  return (
    <section className="rv-section" ref={containerRef}>
      <h2 className="rv-heading">{t('routing.heading')}</h2>
      <p className="rv-subheading">
        {t('routing.subheading')}
      </p>

      {/* Mode tabs */}
      <div className="rv-tabs">
        {MODES.map((m, i) => (
          <button key={m.key} className={`rv-tab ${activeIdx === i ? 'on' : ''}`} onClick={() => select(i)}>
            {/* dot removed */}
            <span className="rv-tab-text">
              <span className="rv-tab-label">{t(`routing.modes.${m.key}.label`)}</span>
              <span className="rv-tab-tag">{t(`routing.modes.${m.key}.tagline`)}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ============ Desktop canvas -- all positions computed ============ */}
      <div className="rv-canvas">
        {/* SVG: all wires + connection lines */}
        <svg className="rv-svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Wire: client -> gateway (dashed) */}
          <line x1={layout.wire.x1} y1={layout.wire.y1} x2={layout.wire.x2} y2={layout.wire.y2} className="rv-wire-svg" />

          {/* Simple mode lines: gw -> upstreams */}
          {!isCombined && layout.gwLines.map((l, i) => (
            <line key={`gl${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className={`rv-line ${lit === i ? 'lit' : ''}`} />
          ))}

          {/* Combined: gw -> sub-routers */}
          {isCombined && layout.subGwLines.map((l, i) => (
            <line key={`sgl${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className={`rv-line ${lit === i ? 'lit' : ''}`} />
          ))}

          {/* Combined: sub-routers -> upstreams */}
          {isCombined && layout.subUpLines.flatMap((group, gi) =>
            group.map((l, li) => (
              <line key={`sul${gi}-${li}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                className={`rv-line ${litSub?.router === gi && litSub?.up === li ? 'lit' : ''}`} />
            ))
          )}
        </svg>

        {/* Wire packet dots (client <-> gateway) */}
        {wirePackets.map((wp) => {
          const { x1, y1, x2, y2 } = layout.wire;
          const x = wp.returning
            ? x2 + (x1 - x2) * wp.progress
            : x1 + (x2 - x1) * wp.progress;
          const y = wp.returning
            ? y2 + (y1 - y2) * wp.progress
            : y1 + (y2 - y1) * wp.progress;
          return (
            <div key={`w${wp.id}`} className={`rv-dot ${wp.returning ? 'ret' : ''}`}
              style={{ left: `${x}%`, top: `${y}%` }} />
          );
        })}

        {/* Packet dots */}
        {packets.map((p) => {
          const pos = getPacketPct(p);
          if (!pos) return null;
          return (
            <div key={`d${p.id}`}
              className={`rv-dot ${p.returning ? 'ret' : ''} ${p.failed ? 'fail' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />
          );
        })}

        {/* Client node */}
        <div className="rv-node-abs rv-client" style={{ left: `${layout.clientPt.x}%`, top: `${layout.clientPt.y}%` }}>
          <div className="rv-client-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="rv-client-name">{t('routing.clientLabel')}</span>
          <span className="rv-client-examples">{t('routing.clientExamples')}</span>
        </div>

        {/* Gateway node */}
        <div className="rv-node-abs rv-gw" style={{ left: `${layout.gwPt.x}%`, top: `${layout.gwPt.y}%` }}>
          <div className="rv-gw-icon"><GwIcon /></div>
          <span className="rv-gw-label">{modeRouterLabel}</span>
          <span className="rv-gw-sub">{modeTagline}</span>
          <div className="rv-gw-ring" />
        </div>

        {/* Simple mode: upstream nodes */}
        {!isCombined && layout.upPts.map((pt, i) => (
          <div key={`up${i}`} className="rv-node-abs" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
            <UpCard u={mode.upstreams[i]} isLit={lit === i} />
          </div>
        ))}

        {/* Combined: sub-router nodes + their upstreams */}
        {isCombined && layout.subRouterPts.map((pt, i) => (
          <div key={`sr${i}`} className="rv-node-abs rv-lane-router-wrap" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
            <div className={`rv-lane-router ${lit === i ? 'lit' : ''}`}>
              <div className="rv-lane-icon"><GwIcon /></div>
              <span className="rv-lane-label">{mode.subRouters![i].label}</span>
              <span className="rv-lane-type">{mode.subRouters![i].type}</span>
            </div>
          </div>
        ))}

        {isCombined && layout.subUpPts.flatMap((group, gi) =>
          group.map((pt, ui) => (
            <div key={`su${gi}-${ui}`} className="rv-node-abs" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
              <UpCard u={mode.subRouters![gi].upstreams[ui]} isLit={litSub?.router === gi && litSub?.up === ui} />
            </div>
          ))
        )}
      </div>

      {/* ============ Mobile flow (unchanged) ============ */}
      <div className="rv-mobile">
        <div className="rv-m-node rv-m-client">
          <div className="rv-m-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="rv-m-node-text">
            <span>{t('routing.clientLabel')}</span>
            <span className="rv-m-subtext">{t('routing.clientExamples')}</span>
          </div>
        </div>
        <div className="rv-m-arrow" />
        <div className="rv-m-node rv-m-gw">
          <div className="rv-m-icon rv-m-icon-gw"><GwIcon /></div>
          <div className="rv-m-node-text">
            <span>{modeRouterLabel}</span>
            <span className="rv-m-subtext">{modeTagline}</span>
          </div>
        </div>
        {!isCombined ? (
          <div className="rv-m-fan">
            {mode.upstreams.map((u, i) => (
              <div key={i} className="rv-m-branch">
                <div className="rv-m-branch-line">
                  {i < mode.upstreams.length - 1 && <div className="rv-m-branch-down" />}
                </div>
                <div className="rv-m-up-card">
                  <div className="rv-up-badge" style={{ background: u.color }}>{u.icon}</div>
                  <div className="rv-up-text">
                    <span className="rv-up-name">{u.provider} <span className="rv-up-model">{u.model}</span></span>
                    {u.meta && <span className="rv-up-meta">{getUpstreamMeta(u)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {mode.subRouters!.map((sr, si) => (
              <div key={si} className="rv-m-lane">
                <div className="rv-m-arrow" />
                <div className="rv-m-node rv-m-subrouter">
                  <div className="rv-m-icon rv-m-icon-gw"><GwIcon /></div>
                  <div className="rv-m-node-text">
                    <span>{sr.label}</span>
                    <span className="rv-m-subtext">{sr.type}</span>
                  </div>
                </div>
                <div className="rv-m-fan">
                  {sr.upstreams.map((u, j) => (
                    <div key={j} className="rv-m-branch">
                      <div className="rv-m-branch-line">
                        {j < sr.upstreams.length - 1 && <div className="rv-m-branch-down" />}
                      </div>
                      <div className="rv-m-up-card">
                        <div className="rv-up-badge" style={{ background: u.color }}>{u.icon}</div>
                        <div className="rv-up-text">
                          <span className="rv-up-name">{u.provider} <span className="rv-up-model">{u.model}</span></span>
                          {u.meta && <span className="rv-up-meta">{getUpstreamMeta(u)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Description + pause */}
      <div className="rv-bottom">
        <div className="rv-desc">{modeDescription}</div>
        <button className="rv-pause-btn" onClick={() => setIsPaused((p) => !p)} title={isPaused ? t('routing.resume') : t('routing.pause')}>
          {isPaused ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          )}
        </button>
      </div>
    </section>
  );
}
