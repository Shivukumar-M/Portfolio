import { useEffect, useRef, useState, useCallback } from 'react';

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
export function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Reveal wrapper ────────────────────────────────────────────────────────────
export function Reveal({ children, delay = 0, direction = 'up', className = '', speed = 'normal' }) {
  const [ref, visible] = useReveal();
  const dur = { none: 0, slow: 900, normal: 600, fast: 280 }[speed] ?? 600;
  const t = { up: 'translateY(32px)', right: 'translateX(32px)', left: 'translateX(-32px)', down: 'translateY(-32px)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : (t[direction] || t.up),
      transition: `opacity ${dur}ms ease ${delay}ms, transform ${dur}ms ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── 3-D tilt card ─────────────────────────────────────────────────────────────
export function TiltCard({ children, className = '' }) {
  const el = useRef(null);
  const onMove = (e) => {
    const r = el.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -16;
    el.current.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) scale(1.03)`;
  };
  const onLeave = () => { el.current.style.transform = ''; };
  return (
    <div ref={el} className={className}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: 'transform 0.18s ease', willChange: 'transform' }}>
      {children}
    </div>
  );
}

// ── Magnetic button ───────────────────────────────────────────────────────────
export function MagneticBtn({ children, className = '', href, onClick, style }) {
  const el = useRef(null);
  const onMove = (e) => {
    const r = el.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.25;
    const y = (e.clientY - r.top  - r.height / 2) * 0.25;
    el.current.style.transform = `translate(${x}px,${y}px) scale(1.06)`;
  };
  const onLeave = () => { el.current.style.transform = ''; };
  const s = { transition: 'transform 0.25s cubic-bezier(.25,.46,.45,.94)', ...style };
  return href ? (
    <a ref={el} href={href} target="_blank" rel="noopener noreferrer"
      className={className} onMouseMove={onMove} onMouseLeave={onLeave} style={s}>{children}</a>
  ) : (
    <button ref={el} className={className} onClick={onClick}
      onMouseMove={onMove} onMouseLeave={onLeave} style={s}>{children}</button>
  );
}

// ── Typewriter ────────────────────────────────────────────────────────────────
export function TypeWriter({ words, speed = 120 }) {
  const [text, setText] = useState('');
  const [del,  setDel]  = useState(false);
  const [idx,  setIdx]  = useState(0);
  const [spd,  setSpd]  = useState(speed);
  useEffect(() => {
    const full = words[idx % words.length];
    const t = setTimeout(() => {
      setText(del ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
      setSpd(del ? 40 : speed);
      if (!del && text === full) setTimeout(() => setDel(true), 1800);
      if (del  && text === '')  { setDel(false); setIdx(i => i + 1); }
    }, spd);
    return () => clearTimeout(t);
  }, [text, del, idx, spd, words, speed]);
  return <span>{text}<span className="animate-pulse">|</span></span>;
}

// ── Glitch text ───────────────────────────────────────────────────────────────
export function GlitchText({ text, className = '' }) {
  return (
    <span className={`relative inline-block ${className}`} data-glitch={text}>
      {text}
      <style>{`
        [data-glitch]::before,[data-glitch]::after{content:attr(data-glitch);position:absolute;top:0;left:0;width:100%;}
        [data-glitch]::before{animation:_g1 3.5s infinite;clip-path:polygon(0 0,100% 0,100% 35%,0 35%);color:inherit;opacity:.8}
        [data-glitch]::after{animation:_g2 3.5s .05s infinite;clip-path:polygon(0 65%,100% 65%,100% 100%,0 100%);color:inherit;opacity:.8}
        @keyframes _g1{0%,90%,100%{transform:none;opacity:0}91%{transform:translate(-2px,-1px);opacity:.8;filter:hue-rotate(30deg)}93%{transform:translate(2px,1px);opacity:.8}95%{opacity:0}}
        @keyframes _g2{0%,90%,100%{transform:none;opacity:0}92%{transform:translate(2px,1px);opacity:.8;filter:hue-rotate(-30deg)}94%{transform:translate(-2px,-1px);opacity:.8}96%{opacity:0}}
      `}</style>
    </span>
  );
}

// ── Custom CSS/JS injector ────────────────────────────────────────────────────
export function CustomInjector({ css, js }) {
  useEffect(() => {
    if (!js) return;
    try { new Function(js)(); } catch (e) { console.warn('[Custom JS]', e.message); }
  }, [js]);
  return css ? <style>{css}</style> : null;
}

// ── Font loader ───────────────────────────────────────────────────────────────
export const FONTS = [
  { id: 'Inter',              label: 'Inter (Default)',      category: 'sans-serif' },
  { id: 'Space Grotesk',      label: 'Space Grotesk',        category: 'sans-serif' },
  { id: 'Poppins',            label: 'Poppins',              category: 'sans-serif' },
  { id: 'Outfit',             label: 'Outfit',               category: 'sans-serif' },
  { id: 'Raleway',            label: 'Raleway (Elegant)',     category: 'sans-serif' },
  { id: 'Playfair Display',   label: 'Playfair (Serif)',      category: 'serif'      },
  { id: 'JetBrains Mono',     label: 'JetBrains Mono',       category: 'monospace'  },
  { id: 'Press Start 2P',     label: 'Press Start 2P (Pixel)',category: 'monospace'  },
];

export function FontLoader({ font }) {
  if (!font || font === 'Inter') return null;
  const enc = encodeURIComponent(font);
  return <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${enc}:wght@300;400;500;600;700;800&display=swap`} />;
}

// ── Skill icon renderer ───────────────────────────────────────────────────────
// Handles: si:react (skillicons.dev), http URLs, FontAwesome classes
export function SkillIcon({ icon, size = 28, className = '' }) {
  if (!icon) return <i className={`fas fa-code ${className}`} />;
  if (icon.startsWith('si:')) {
    return (
      <img
        src={`https://skillicons.dev/icons?i=${icon.slice(3)}&theme=dark`}
        alt={icon.slice(3)}
        width={size} height={size}
        loading="lazy"
        className={`object-contain ${className}`}
      />
    );
  }
  if (icon.startsWith('http') || icon.startsWith('/')) {
    return <img src={icon} alt="skill" width={size} height={size} className={`object-contain ${className}`} />;
  }
  return <i className={`${icon} ${className}`} style={{ fontSize: size * 0.7 }} />;
}

// ── Speed → duration ──────────────────────────────────────────────────────────
export const speedMs = (s) => ({ none: 0, slow: 900, normal: 600, fast: 280 }[s] ?? 600);

// ── Mouse parallax hook ───────────────────────────────────────────────────────
export function useMouseParallax() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const fn = (e) => setMouse({
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);
  return mouse;
}

// ── Scroll parallax hook ──────────────────────────────────────────────────────
export function useScrollParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let raf;
    const fn = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setOffset(window.scrollY * speed));
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => { window.removeEventListener('scroll', fn); cancelAnimationFrame(raf); };
  }, [speed]);
  return offset;
}

// ── Parallax element ──────────────────────────────────────────────────────────
// mx/my: normalized mouse coords (-1 to 1), strength: pixel depth
// scrollOffset: raw px from useScrollParallax
export function ParallaxEl({ children, mx = 0, my = 0, strength = 20, scrollOffset = 0, className = '', style = {} }) {
  return (
    <div className={className} style={{
      ...style,
      transform: `translate(${mx * strength}px, ${my * strength + scrollOffset}px)`,
      transition: 'transform 1.2s cubic-bezier(0.23,1,0.32,1)',
      willChange: 'transform',
    }}>
      {children}
    </div>
  );
}
