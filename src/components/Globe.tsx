import { useEffect, useRef, useState } from 'react';
import { majorCities, getCitiesInVicinity, latLonToXYZ, GLOBE_CONFIG, type Point3D } from '../data/globeData';
import './Globe.css';

/* ------------------------------------------------------------------ */
/*  One-time: generate points and build connections                     */
/* ------------------------------------------------------------------ */

function buildPointCloud(): Point3D[] {
  const points: Point3D[] = [];

  majorCities.forEach((city) => {
    const coords = latLonToXYZ(city.lat, city.lon);
    points.push({ ...coords, size: city.size, connections: [] });

    const vicinity = getCitiesInVicinity(city.lat, city.lon, {
      count: 5, maxDistKm: 800, baseSize: city.size - 1, sizeJitter: 0.4,
    });
    points.push(...vicinity);
  });

  // Build connections between nearby points
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const pointLat = (Math.asin(point.y) * 180) / Math.PI;
    if (pointLat < -60) continue;

    const candidates: { index: number; distance: number; sameRegion: boolean; isMajorCity: boolean }[] = [];

    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const targetLat = (Math.asin(points[j].y) * 180) / Math.PI;
      if (targetLat < -60) continue;

      const dx = points[j].x - point.x;
      const dy = points[j].y - point.y;
      const dz = points[j].z - point.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const sameRegion = Math.abs(point.x - points[j].x) < 0.5 && Math.abs(point.y - points[j].y) < 0.5;
      const isMajorCity = points[j].size === 3;
      const isCurrentMajor = point.size === 3;

      let connect = false;
      const isNorthAtlantic =
        (point.x < -0.3 && points[j].x > -0.3 && point.y > 0.3 && points[j].y > 0.3) ||
        (point.x > -0.3 && points[j].x < -0.3 && point.y > 0.3 && points[j].y > 0.3);
      const isSouthern = point.y < -0.2 && points[j].y < -0.2;

      if (isCurrentMajor && isMajorCity) {
        if (sameRegion || isNorthAtlantic || isSouthern || Math.random() < 0.6) connect = true;
      } else if (sameRegion && distance < 0.8) {
        connect = true;
      } else if (isSouthern && distance < 1.0 && Math.random() < 0.18) {
        connect = true;
      } else if (isNorthAtlantic && distance > 0.7 && Math.random() < 0.25) {
        connect = true;
      } else if (!sameRegion && distance > 0.7 && Math.random() < 0.02) {
        connect = true;
      }

      if (connect) candidates.push({ index: j, distance, sameRegion, isMajorCity });
    }

    candidates.sort((a, b) => {
      if (a.isMajorCity !== b.isMajorCity) return a.isMajorCity ? -1 : 1;
      if (a.sameRegion !== b.sameRegion) return a.sameRegion ? -1 : 1;
      return a.distance - b.distance;
    });

    const max = point.size === 3 ? 12 : point.size === 2 ? 8 : 6;
    point.connections = candidates.slice(0, max).map((p) => ({
      index: p.index,
      isContinent: p.distance > 0.7,
    }));
  }

  return points;
}

/* ------------------------------------------------------------------ */
/*  Projection: rotate a 3D point and project to 2D canvas coords      */
/* ------------------------------------------------------------------ */

interface Projected {
  x: number;
  y: number;
  z: number;
  size: number;
}

function projectPoints(
  points: Point3D[],
  rotX: number,
  rotY: number,
  mouseX: number,
  mouseY: number,
  cx: number,
  cy: number,
  radius: number,
): Projected[] {
  const mi = GLOBE_CONFIG.animation.mouseInfluence;
  return points.map((p) => {
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    let y = p.y;
    const ty = y * Math.cos(rotX) - z * Math.sin(rotX);
    z = y * Math.sin(rotX) + z * Math.cos(rotX);
    y = ty;
    x += mouseX * mi * z;
    y += mouseY * mi * z;
    const scale = radius / (2 + z * 0.5);
    return { x: cx + x * scale, y: cy + y * scale, z, size: p.size };
  });
}

/* ------------------------------------------------------------------ */
/*  Drawing: render connections and points to canvas                    */
/* ------------------------------------------------------------------ */

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  points: Point3D[],
  projected: Projected[],
  rotX: number,
  rotY: number,
  mouseX: number,
  mouseY: number,
  cx: number,
  cy: number,
  radius: number,
) {
  const mi = GLOBE_CONFIG.animation.mouseInfluence;
  const drawn = new Set<string>();

  // Connections
  points.forEach((point, i) => {
    const pi = projected[i];
    point.connections.forEach((conn) => {
      const key = `${Math.min(i, conn.index)}-${Math.max(i, conn.index)}`;
      if (drawn.has(key)) return;
      drawn.add(key);
      const cj = projected[conn.index];
      if (!cj) return;

      const o1 = pi.z > 0 ? (pi.z + 1) / 2 : Math.max(0.1, (1 + pi.z) * 0.3);
      const o2 = cj.z > 0 ? (cj.z + 1) / 2 : Math.max(0.1, (1 + cj.z) * 0.3);
      const avg = (o1 + o2) / 2;

      ctx.strokeStyle = `rgba(147, 112, 219, ${avg * (conn.isContinent ? 0.3 : 0.2)})`;
      ctx.lineWidth = conn.isContinent ? 1.5 : 0.9;

      if (conn.isContinent) {
        // Great-circle arc via spherical interpolation
        const op = points[i];
        const oc = points[conn.index];
        const segs = 8;
        const path: { x: number; y: number }[] = [];
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          const dot = op.x * oc.x + op.y * oc.y + op.z * oc.z;
          const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
          let ix: number, iy: number, iz: number;
          if (angle < 0.001) {
            ix = op.x + t * (oc.x - op.x);
            iy = op.y + t * (oc.y - op.y);
            iz = op.z + t * (oc.z - op.z);
          } else {
            const sa = Math.sin(angle);
            const a = Math.sin((1 - t) * angle) / sa;
            const b = Math.sin(t * angle) / sa;
            ix = a * op.x + b * oc.x;
            iy = a * op.y + b * oc.y;
            iz = a * op.z + b * oc.z;
          }
          let rx = ix * Math.cos(rotY) - iz * Math.sin(rotY);
          let rz = ix * Math.sin(rotY) + iz * Math.cos(rotY);
          let ry = iy;
          const ty2 = ry * Math.cos(rotX) - rz * Math.sin(rotX);
          rz = ry * Math.sin(rotX) + rz * Math.cos(rotX);
          ry = ty2;
          rx += mouseX * mi * rz;
          ry += mouseY * mi * rz;
          const sc = radius / (2 + rz * 0.5);
          path.push({ x: cx + rx * sc, y: cy + ry * sc });
        }
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let s = 1; s < path.length; s++) ctx.lineTo(path[s].x, path[s].y);
        ctx.stroke();
      } else {
        // Local connection with slight curve
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        const mx = (pi.x + cj.x) / 2 + mouseX * 15;
        const my = (pi.y + cj.y) / 2 + mouseY * 15;
        ctx.quadraticCurveTo(mx, my, cj.x, cj.y);
        ctx.stroke();
      }
    });
  });

  // Points
  projected.forEach((pt) => {
    const opacity = pt.z > 0 ? (pt.z + 1) / 2 : Math.max(0, (1 + pt.z) * 0.3);
    const ps = pt.size * (1 + pt.z * 0.2);
    if (pt.size > 1) {
      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, ps * 4);
      grad.addColorStop(0, `rgba(147, 112, 219, ${opacity * 0.6})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, ps * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = pt.z > 0
      ? `rgba(255, 255, 255, ${opacity * 0.9})`
      : `rgba(147, 112, 219, ${opacity * 0.6})`;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, ps, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Globe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const pointsRef = useRef<Point3D[]>([]);
  const rotationRef = useRef({ ...GLOBE_CONFIG.rotation });
  const mousePosRef = useRef({ x: 0, y: 0 });
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

  // Generate points once
  useEffect(() => {
    pointsRef.current = buildPointCloud();
  }, []);

  // Track mouse position relative to canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        // Only apply mouse influence when cursor is near the canvas.
        // When scrolled away, the relative offset becomes huge and distorts arcs.
        if (Math.abs(x) < 1.5 && Math.abs(y) < 1.5) {
          mousePosRef.current = { x, y };
        } else {
          // Ease back to center when mouse is far away
          mousePosRef.current.x *= 0.9;
          mousePosRef.current.y *= 0.9;
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop + resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // Use devicePixelRatio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Always rotate
      rotationRef.current.y += GLOBE_CONFIG.animation.speed;

      // Globe is always centered in its container, radius fills the space
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.85;

      const projected = projectPoints(
        pointsRef.current,
        rotationRef.current.x,
        rotationRef.current.y,
        mousePosRef.current.x,
        mousePosRef.current.y,
        cx, cy, radius,
      );

      drawGlobe(
        ctx, pointsRef.current, projected,
        rotationRef.current.x, rotationRef.current.y,
        mousePosRef.current.x, mousePosRef.current.y,
        cx, cy, radius,
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isVisible) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible]);

  return (
    <div className="globe-container" ref={containerRef}>
      <canvas ref={canvasRef} className="globe-canvas" />
      <div className="globe-glow" />
    </div>
  );
}
