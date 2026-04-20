import { useEffect, useRef } from 'react';
import { TIER_GOLD, TIER_UNSOLVED, TIER_CONFIG } from '../utils/awards.js';

const CONFETTI_COLORS = ['#f59e0b', '#fbbf24', '#fde68a', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'];
const CONFETTI_DURATION = 5000;
const CONFETTI_FADE_START = 3000; // stay fully opaque until this point

function useConfetti(active) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 5,
      vy: 1.5 + Math.random() * 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: 5 + Math.random() * 7,
      h: 3 + Math.random() * 5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
    }));

    const start = Date.now();
    let animId;

    function draw() {
      const elapsed = Date.now() - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed >= CONFETTI_DURATION) return;

      const fade = elapsed < CONFETTI_FADE_START ? 1 : Math.max(0, 1 - (elapsed - CONFETTI_FADE_START) / (CONFETTI_DURATION - CONFETTI_FADE_START));

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.angle += p.spin;
        if (p.y > canvas.height + 20 && elapsed < CONFETTI_FADE_START) {
          p.x = Math.random() * canvas.width;
          p.y = -10 - Math.random() * 60;
          p.vy = 1.5 + Math.random() * 4;
          p.vx = (Math.random() - 0.5) * 5;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return canvasRef;
}

export default function ResultBanner({ tier, title, details, children }) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG[TIER_UNSOLVED];
  const canvasRef = useConfetti(tier === TIER_GOLD);

  return (
    <>
      {tier === TIER_GOLD && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 9999 }}
        />
      )}
      <div className={`w-full rounded-2xl p-5 text-center space-y-3 border ${cfg.bg} ${cfg.border}`}>
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-white/90 shadow-sm flex items-center justify-center text-3xl">
            {cfg.emoji}
          </div>
        </div>
        <p className={`font-bold text-lg ${cfg.text}`}>{title ?? cfg.label}</p>
        {details && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{details}</p>
        )}
        {children}
      </div>
    </>
  );
}
