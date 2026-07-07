import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import '@/styles/home.css';

/* ============================================================
   Adrian Idea homepage — 1:1 port of index2.html visual system.
============================================================ */



const LogoMark = ({ gold = false }: { gold?: boolean }) => (
  <svg viewBox="0 0 100 110" aria-hidden="true">
    {gold && (
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d67f" />
          <stop offset="0.45" stopColor="#e2ae4a" />
          <stop offset="0.78" stopColor="#c08c2e" />
          <stop offset="1" stopColor="#7a5518" />
        </linearGradient>
      </defs>
    )}
    <g fill={gold ? 'url(#goldGrad)' : 'currentColor'}>
      <path d="M50.6 4.9 60.7 28.1 48.3 48.2 37.9 27.7Z" />
      <path d="M49.3 49.3 59.6 29.6 95.7 99Q96.6 100.7 94.2 100.7L63.8 100.7Q68.2 98.1 67.7 90.9Z" />
      <path d="M20.8 71.5 5.2 100.7 27.5 100.7Q30 99.8 28.8 97.7Q23.5 85.5 20.8 71.5Z" />
    </g>
  </svg>
);


/* ---------------- Count-up hook ---------------- */
function useCountUp(target: number, decimals: number) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) { setVal(target); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1900;
        const step = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          setVal(target * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return { ref, text: val.toFixed(decimals) };
}

const Counter = ({ target, decimals, unit }: { target: number; decimals: number; unit: string }) => {
  const { ref, text } = useCountUp(target, decimals);
  return (
    <b>
      <span ref={ref}>{text}</span>
      <em>{unit}</em>
    </b>
  );
};

/* ---------------- Preloader ---------------- */
const Preloader = ({ onDone, label }: { onDone: () => void; label: string }) => {
  const [num, setNum] = useState('00');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) { setDone(true); setTimeout(onDone, 100); return; }
    const t0 = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setNum(String(Math.floor(100 * (1 - Math.pow(1 - p, 3)))).padStart(2, '0'));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => { setDone(true); setTimeout(onDone, 1100); }, 150);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return (
    <div id="preloader" className={done ? 'done' : ''} aria-hidden="true">
      <svg className="pre-mark" viewBox="0 0 100 110" fill="none">
        <path d="M51 3 66 26 50 48 37 27Z" />
        <path d="M52 51 64 35 94 99q2 6-4 6H70q4-6 1-12Z" />
        <path d="M17 105 32 68q4 20-3 30 4 5 11 7z" />
      </svg>
      <div className="pre-label"><span>{label}</span> <b>{num}</b></div>
    </div>
  );
};

/* ---------------- WebGL Shader ---------------- */
const ShaderCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl || rm) {
      if (canvas) canvas.style.background = 'radial-gradient(ellipse 80% 60% at 30% 20%, #2a2010, transparent), radial-gradient(ellipse 60% 50% at 80% 60%, #0c2626, #070604)';
      return;
    }
    const vsrc = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
    const fsrc = `
      precision highp float;
      uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
      float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec3 layer(vec2 p, float t, float sc, float seed){
        vec2 g = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p * sc + seed;
        vec2 id = floor(g); vec2 f  = fract(g) - 0.5;
        vec3 col = vec3(0.0);
        float dv = 0.5 - abs(f.x); float dh = 0.5 - abs(f.y);
        float grid = max(smoothstep(0.045, 0.0, dv), smoothstep(0.045, 0.0, dh));
        col += vec3(0.30, 0.21, 0.08) * grid * 0.22;
        float laneV = floor(g.x + 0.5);
        float spV = 0.10 + 0.22 * hash21(vec2(laneV, seed + 7.0));
        float pv = fract(g.y * 0.22 - t * spV - hash21(vec2(laneV, seed + 3.0)));
        col += vec3(0.95, 0.78, 0.40) * exp(-pv * 12.0) * smoothstep(0.05, 0.0, dv) * 0.9;
        float laneH = floor(g.y + 0.5);
        float spH = 0.08 + 0.18 * hash21(vec2(laneH, seed + 11.0));
        float ph = fract(g.x * 0.22 - t * spH - hash21(vec2(laneH, seed + 5.0)));
        col += vec3(0.95, 0.78, 0.40) * exp(-ph * 12.0) * smoothstep(0.05, 0.0, dh) * 0.9;
        vec2 fn = fract(g + 0.5) - 0.5;
        float nd = abs(fn.x) + abs(fn.y);
        float tw = hash21(id + seed);
        float breathe = pow(0.5 + 0.5 * sin(t * 1.6 + tw * 6.2831), 3.0);
        col += vec3(0.85, 0.64, 0.28) * exp(-nd * 13.0) * breathe * step(0.45, tw);
        float room = step(0.94, hash21(id + seed + 31.0));
        col += vec3(0.05, 0.16, 0.16) * room * exp(-(abs(f.x) + abs(f.y)) * 2.5)
               * (0.4 + 0.6 * sin(t * 0.9 + tw * 6.2831)) * 0.5;
        return col;
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_res.xy) / min(u_res.x, u_res.y);
        float t = u_time;
        vec2 m = (u_mouse * 2.0 - 1.0) * vec2(1.0, -1.0);
        float md = length(p - m);
        vec3 col = vec3(0.024, 0.020, 0.013);
        col += layer(p + m * 0.020, t, 2.1, 17.0);
        col += layer(p + m * 0.050, t * 1.25, 3.4, 53.0) * 0.55;
        col += layer(p + m * 0.095, t * 1.5, 5.6, 89.0) * 0.28;
        col += vec3(0.45, 0.32, 0.11) * exp(-md * 2.6) * 0.28;
        float vig = smoothstep(1.7, 0.35, length(p * vec2(0.85, 1.1)));
        col *= vig * (0.72 + 0.5 * (1.0 - uv.y));
        gl_FragColor = vec4(col, 1.0);
      }`;
    const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pg = gl.createProgram()!;
    gl.attachShader(pg, mk(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(pg, mk(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(pg); gl.useProgram(pg);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pg, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(pg, 'u_res');
    const uTime = gl.getUniformLocation(pg, 'u_time');
    const uMouse = gl.getUniformLocation(pg, 'u_mouse');
    let sm = { x: 0.5, y: 0.5 }, tm = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => { tm.x = e.clientX / innerWidth; tm.y = e.clientY / innerHeight; };
    addEventListener('pointermove', onMove);
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.6);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);
    let visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
    io.observe(canvas);
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      sm.x += (tm.x - sm.x) * 0.05;
      sm.y += (tm.y - sm.y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, sm.x, sm.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, []);
  return <canvas ref={ref} className="shader-canvas" aria-hidden="true" />;
};

/* ---------------- Agent network viz (bento cell A) ---------------- */
const AgentsViz = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const vc = ref.current;
    if (!vc) return;
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    const ctx = vc.getContext('2d')!;
    let vw = 0, vh = 0, pts: any[] = [];
    const vResize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const parent = vc.parentElement!;
      vw = parent.clientWidth; vh = parent.clientHeight;
      vc.style.width = vw + 'px'; vc.style.height = vh + 'px';
      vc.width = vw * dpr; vc.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: 24 }, () => ({
        x: Math.random() * vw, y: Math.random() * vh,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      }));
    };
    vResize();
    addEventListener('resize', vResize);
    let vVis = false;
    const io = new IntersectionObserver((es) => { vVis = es[0].isIntersecting; });
    io.observe(vc);
    let raf = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!vVis) return;
      ctx.clearRect(0, 0, vw, vh);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > vw) p.vx *= -1;
        if (p.y < 0 || p.y > vh) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 150) {
          ctx.strokeStyle = `rgba(217, 164, 65, ${(1 - d / 150) * 0.35})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if ((i + j) % 7 === 0) {
            const k = (t / 1200 + i * 0.37) % 1;
            ctx.fillStyle = 'rgba(240, 205, 126, 0.9)';
            ctx.beginPath();
            ctx.arc(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, 1.6, 0, 7);
            ctx.fill();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = 'rgba(244, 239, 228, 0.8)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7); ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', vResize); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className="viz-agents" aria-hidden="true" />;
};

/* ---------------- Reveal-on-scroll setup (single effect) ---------------- */
const useHomeEffects = (rootRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Reveals
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.16, rootMargin: '0px 0px -50px 0px' });
    root.querySelectorAll('.fade-up, .mask-reveal, .c-c, .c-e, .c-d').forEach((el) => io.observe(el));

    // Orbit live-on-view
    const orbitCell = root.querySelector('.c-b');
    let orbIo: IntersectionObserver | null = null;
    if (orbitCell) {
      orbIo = new IntersectionObserver((es) => es.forEach((e) => orbitCell.classList.toggle('live', e.isIntersecting)));
      orbIo.observe(orbitCell);
    }

    // Process step highlight
    const sio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('active', e.isIntersecting)), { rootMargin: '-35% 0px -35% 0px' });
    root.querySelectorAll('.p-step').forEach((s) => sio.observe(s));

    // Tilt cards
    const tiltHandlers: Array<[Element, (e: any) => void, () => void]> = [];
    if (fine && !rm) {
      root.querySelectorAll('.tilt').forEach((card) => {
        const mv = (e: any) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          (card as HTMLElement).style.transform = `perspective(900px) rotateY(${(px - 0.5) * 5}deg) rotateX(${(0.5 - py) * 5}deg)`;
          (card as HTMLElement).style.setProperty('--gx', px * 100 + '%');
          (card as HTMLElement).style.setProperty('--gy', py * 100 + '%');
        };
        const lv = () => { (card as HTMLElement).style.transform = ''; };
        card.addEventListener('pointermove', mv);
        card.addEventListener('pointerleave', lv);
        tiltHandlers.push([card, mv, lv]);
      });
    }

    // Magnetic buttons
    const magHandlers: Array<[Element, (e: any) => void, () => void]> = [];
    if (fine && !rm) {
      root.querySelectorAll('.magnetic').forEach((btn) => {
        const mv = (e: any) => {
          const r = btn.getBoundingClientRect();
          (btn as HTMLElement).style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
        };
        const lv = () => { (btn as HTMLElement).style.transform = ''; };
        btn.addEventListener('pointermove', mv);
        btn.addEventListener('pointerleave', lv);
        magHandlers.push([btn, mv, lv]);
      });
    }

    // Custom cursor
    let cursorCleanup = () => {};
    if (fine && !rm) {
      root.classList.add('fancy-cursor');
      const dot = root.querySelector<HTMLDivElement>('.cursor-dot');
      const ring = root.querySelector<HTMLDivElement>('.cursor-ring');
      if (dot && ring) {
        let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
        const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
        addEventListener('pointermove', onMove);
        let raf = 0;
        const loop = () => {
          raf = requestAnimationFrame(loop);
          rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
          dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
          ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
        };
        raf = requestAnimationFrame(loop);
        const onOver = (e: any) => {
          const el = e.target.closest('[data-cursor]');
          if (el) { ring.classList.add('hovering'); ring.dataset.label = el.dataset.cursor; }
        };
        const onOut = (e: any) => {
          const el = e.target.closest('[data-cursor]');
          if (el && !el.contains(e.relatedTarget)) ring.classList.remove('hovering');
        };
        document.addEventListener('pointerover', onOver);
        document.addEventListener('pointerout', onOut);
        cursorCleanup = () => {
          cancelAnimationFrame(raf);
          removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerover', onOver);
          document.removeEventListener('pointerout', onOut);
        };
      }
    }

    // Nav scrolled state + progress bar + hero scrub + kinetic parallax
    const nav = root.querySelector<HTMLElement>('.hr-nav');
    const prog = root.querySelector<HTMLElement>('#hr-progress');
    const heroInner = root.querySelector<HTMLElement>('#heroInner');
    const heroEl = root.querySelector<HTMLElement>('.hero');
    const kLines = root.querySelectorAll<HTMLElement>('.kinetic-line');
    let scrollRaw = scrollY, scrollSmooth = scrollY, rafScroll = 0;
    const onScroll = () => { scrollRaw = scrollY; };
    addEventListener('scroll', onScroll, { passive: true });
    if (!rm) {
      const scrollLoop = () => {
        rafScroll = requestAnimationFrame(scrollLoop);
        scrollSmooth += (scrollRaw - scrollSmooth) * 0.09;
        if (Math.abs(scrollRaw - scrollSmooth) < 0.05) scrollSmooth = scrollRaw;
        const h = document.documentElement.scrollHeight - innerHeight;
        if (prog) prog.style.transform = `scaleX(${h > 0 ? scrollSmooth / h : 0})`;
        if (nav) nav.classList.toggle('scrolled', scrollSmooth > 30);
        if (heroInner && heroEl) {
          const hp = Math.min(scrollSmooth / (heroEl.offsetHeight * 0.85), 1);
          if (hp < 1) {
            heroInner.style.transform = `translateY(${hp * -60}px) scale(${1 - hp * 0.06})`;
            heroInner.style.opacity = String(1 - hp * 1.1);
          }
        }
        kLines.forEach((l) => {
          const r = l.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          const p = (innerHeight - r.top) / (innerHeight + r.height);
          l.style.transform = `translateX(${(p - 0.5) * 90 * parseFloat(l.dataset.speed || '0')}vw)`;
        });
      };
      rafScroll = requestAnimationFrame(scrollLoop);
    } else {
      const simple = () => {
        if (nav) nav.classList.toggle('scrolled', scrollY > 30);
        const h = document.documentElement.scrollHeight - innerHeight;
        if (prog) prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      };
      addEventListener('scroll', simple, { passive: true });
    }

    return () => {
      io.disconnect();
      orbIo?.disconnect();
      sio.disconnect();
      tiltHandlers.forEach(([el, mv, lv]) => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); });
      magHandlers.forEach(([el, mv, lv]) => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); });
      cursorCleanup();
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafScroll);
      root.classList.remove('fancy-cursor');
    };
  }, [rootRef]);
};

/* ---------------- Main Homepage ---------------- */
const Index = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = homeCopy[language];

  const [preloading, setPreloading] = useState(true);
  const [flipIdx, setFlipIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [playConsole, setPlayConsole] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const quoteTimerRef = useRef<any>(null);

  // Flip word cycler
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    const id = setInterval(() => setFlipIdx((i) => (i + 1) % t.hero.flip.length), 2600);
    return () => clearInterval(id);
  }, [t.hero.flip.length]);

  // Quote carousel
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) return;
    quoteTimerRef.current = setInterval(() => setQuoteIdx((i) => (i + 1) % t.voices.quotes.length), 6000);
    return () => clearInterval(quoteTimerRef.current);
  }, [t.voices.quotes.length]);

  // Agent console play trigger
  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es, obs) => es.forEach((e) => {
      if (e.isIntersecting) { setPlayConsole(true); obs.disconnect(); }
    }), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useHomeEffects(rootRef);

  // Set loaded class after preloader
  useEffect(() => {
    if (!preloading && rootRef.current) rootRef.current.classList.add('loaded');
  }, [preloading]);

  // Body scroll lock for mobile menu
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Escape closes menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const toggleLang = () => {
    const to = language === 'fa' ? '/en' : '/';
    navigate(to);
  };

  const replayConsole = () => {
    setPlayConsole(false);
    setTimeout(() => setPlayConsole(true), 30);
  };

  const goQuote = (i: number) => {
    clearInterval(quoteTimerRef.current);
    setQuoteIdx(i);
    quoteTimerRef.current = setInterval(() => setQuoteIdx((x) => (x + 1) % t.voices.quotes.length), 6000);
  };

  const dir = language === 'fa' ? 'rtl' : 'ltr';
  const langCode = language;

  return (
    <div ref={rootRef} className="home-root" lang={langCode} dir={dir}>
      {preloading && <Preloader onDone={() => setPreloading(false)} label={t.preLabel} />}

      {/* Cursor */}
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />

      {/* Progress */}
      <div id="hr-progress" aria-hidden="true" />

      <a href="#main" className="skip-link">{t.skip}</a>

      {/* NAV */}
      <nav className="hr-nav">
        <div className="nav-inner">
          <a href="#" className="brand" data-cursor="home" aria-label="Adrian Idea — home">
            <LogoMark gold />
            <span className="wordmark">{t.wordmark.main}<small>{t.wordmark.sub}</small></span>
          </a>
          <ul className="nav-links">
            <li><a href="#capabilities" data-cursor="go">{t.nav.capabilities}</a></li>
            <li><a href="#agent-console" data-cursor="go">{t.nav.product}</a></li>
            <li><a href="#process" data-cursor="go">{t.nav.process}</a></li>
            <li><a href="#voices" data-cursor="go">{t.nav.voices}</a></li>
          </ul>
          <div className="nav-right">
            <button className="lang-btn" onClick={toggleLang} aria-label="Switch language">
              {language === 'fa' ? 'EN' : 'فا'}
            </button>
            <a href="#contact" className="btn btn-fill btn-sm magnetic" data-cursor="start">
              <span>{t.nav.startProject}</span>
            </a>
            <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
              {t.nav.menuBtn}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-label="Navigation">
        <button className="lang-btn" onClick={toggleLang} aria-label="Switch language">
          {language === 'fa' ? 'EN' : 'فا'}
        </button>
        <button className="menu-close" onClick={() => setMenuOpen(false)}>{t.nav.menuClose}</button>
        <a href="#capabilities" onClick={() => setMenuOpen(false)}><span>{t.nav.capabilities}</span><small>01</small></a>
        <a href="#agent-console" onClick={() => setMenuOpen(false)}><span>{t.nav.product}</span><small>02</small></a>
        <a href="#process" onClick={() => setMenuOpen(false)}><span>{t.nav.process}</span><small>03</small></a>
        <a href="#voices" onClick={() => setMenuOpen(false)}><span>{t.nav.voices}</span><small>04</small></a>
        <a href="#contact" onClick={() => setMenuOpen(false)}><span>{t.nav.contact}</span><small>05</small></a>
      </div>

      <main id="main">
        {/* HERO */}
        <header className="hero" id="hero">
          <ShaderCanvas />
          <div className="hero-noise" aria-hidden="true" />
          <div className="hero-fade" aria-hidden="true" />
          <div className="hero-inner" id="heroInner">
            <div className="hero-meta">
              <span className="badge">{t.hero.badge}</span>
              <span className="tick" />
              <span>{t.hero.metaLabel}</span>
            </div>

            <h1 className="display">
              <span className="line"><span>{t.hero.h1Line1Pre}<span className="hollow">{t.hero.h1Line1Hollow}</span>{t.hero.h1Line1Post}</span></span>
              <span className="line"><span>{t.hero.h1Line2Pre}<span className="serif">{t.hero.h1Line2Serif}</span></span></span>
              <span className="line">
                <span>
                  {t.hero.h1Line3Pre}
                  <span className="flip-wrap">
                    <span className="flip-inner" style={{ transform: `translateY(-${flipIdx}em)` }}>
                      {t.hero.flip.map((w) => <span key={w}>{w}</span>)}
                    </span>
                  </span>
                </span>
              </span>
            </h1>

            <div className="hero-bottom">
              <p className="hero-sub">
                <strong>{t.hero.sub.pre}</strong>{t.hero.sub.body}<span className="gold">{t.hero.sub.gold}</span>{t.hero.sub.tail}
              </p>
              <div className="hero-ctas">
                <a href="#contact" className="btn btn-fill magnetic" data-cursor="let's go"><span>{t.hero.cta1}</span></a>
                <a href="#agent-console" className="btn btn-line magnetic" data-cursor="watch">{t.hero.cta2}</a>
              </div>
            </div>
          </div>

          <div className="hero-ticker">
            <div className="ticker-inner">
              {t.hero.tick.map((tk, i) => (
                <div className="tick-item" key={i}>
                  <Counter target={tk.value} decimals={tk.decimals} unit={tk.unit} />
                  <small>{tk.label}</small>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* MARQUEE */}
        <div className="marquee-band" aria-hidden="true">
          <div className="marquee-track">
            {[...t.marquee, ...t.marquee, ...t.marquee, ...t.marquee].map((m, i) => (
              <span key={i} className={`mq-item${i % 2 ? ' ghost' : ''}`}>{m}</span>
            ))}
          </div>
        </div>

        {/* CAPABILITIES */}
        <section id="capabilities">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-index">{t.capabilities.index}</div>
              <h2 className="sec-title mask-reveal">
                <span className="w"><span>{t.capabilities.titlePre}</span></span>{' '}
                <span className="w"><span className="serif">{t.capabilities.titleSerif}</span></span>
              </h2>
            </div>
            <div className="bento">
              <div className="cell c-a tilt fade-up">
                <AgentsViz />
                <span className="tag">{t.capabilities.cells.a.tag}</span>
                <h3>{t.capabilities.cells.a.h}</h3>
                <p>{t.capabilities.cells.a.p}</p>
              </div>
              <div className="cell c-b tilt fade-up">
                <div className="orbit-wrap" aria-hidden="true">
                  <div className="orbit-ring"><span className="orbit-chip">{t.capabilities.cells.b.chips[0]}</span></div>
                  <div className="orbit-ring r2"><span className="orbit-chip">{t.capabilities.cells.b.chips[1]}</span></div>
                  <div className="orbit-ring r3"><span className="orbit-chip">{t.capabilities.cells.b.chips[2]}</span></div>
                  <div className="orbit-core"><LogoMark /></div>
                </div>
                <span className="tag">{t.capabilities.cells.b.tag}</span>
                <h3>{t.capabilities.cells.b.h}</h3>
                <p>{t.capabilities.cells.b.p}</p>
              </div>
              <div className="cell c-c tilt fade-up">
                <div className="bars" aria-hidden="true">
                  {[.45, .7, .35, .85, .55, 1, .65, .9, .5, .75].map((h, i) => (
                    <i key={i} style={{ ['--h' as any]: h }} />
                  ))}
                </div>
                <span className="tag">{t.capabilities.cells.c.tag}</span>
                <h3>{t.capabilities.cells.c.h}</h3>
                <p>{t.capabilities.cells.c.p}</p>
              </div>
              <div className="cell c-d tilt fade-up">
                <div className="stack-list" aria-hidden="true">
                  <span>agents.deploy() <b>TypeScript</b></span>
                  <span>pipeline.train() <b>Python</b></span>
                  <span>infer.stream() <b>Go / REST</b></span>
                  <span>evals.watch() <b>CLI</b></span>
                </div>
                <span className="tag">{t.capabilities.cells.d.tag}</span>
                <h3>{t.capabilities.cells.d.h}</h3>
                <p>{t.capabilities.cells.d.p}</p>
              </div>
              <div className="cell c-e tilt fade-up">
                <div className="shield-rings" aria-hidden="true">
                  <svg viewBox="0 0 110 110">
                    <circle className="track" cx="55" cy="55" r="50" />
                    <circle className="val" cx="55" cy="55" r="50" />
                  </svg>
                  <div className="shield-pct">SOC2</div>
                </div>
                <span className="tag">{t.capabilities.cells.e.tag}</span>
                <h3>{t.capabilities.cells.e.h}</h3>
                <p>{t.capabilities.cells.e.p}</p>
              </div>
            </div>
          </div>
        </section>

        {/* AGENT CONSOLE */}
        <section id="agent-console" className="console-sec">
          <div className="wrap console-grid">
            <div className="console-copy">
              <div className="sec-index" style={{ marginBottom: 14 }}>{t.agentConsole.index}</div>
              <h2 className="sec-title mask-reveal">
                <span className="w"><span>{t.agentConsole.titlePre}</span></span>{' '}
                <span className="w"><span className="serif">{t.agentConsole.titleSerif}</span></span>
              </h2>
              <p>{t.agentConsole.p}</p>
              <ul className="console-points">
                {t.agentConsole.points.map((pt, i) => (
                  <li key={i}><span className="n">{pt.n}</span><span><b>{pt.bold}</b>{pt.rest}</span></li>
                ))}
              </ul>
            </div>
            <div ref={consoleRef} className={`console fade-up ${playConsole ? 'play' : ''}`} aria-label="Product demo: agent console replay">
              <div className="console-bar">
                <span>{t.agentConsole.bar}</span>
                <span className="status"><i /><span>{t.agentConsole.status}</span></span>
              </div>
              <div className="console-body">
                <div className="msg user m1">
                  <div className="who">{t.agentConsole.msg1Who}</div>
                  <div className="bubble">{t.agentConsole.msg1}</div>
                </div>
                <div className="msg agent m2">
                  <div className="who">{t.agentConsole.msg2Who}</div>
                  <div className="bubble">{t.agentConsole.msg2}</div>
                </div>
                <div className="msg agent tool-row m3">
                  {t.agentConsole.msg3.map((c, i) => (
                    <span key={i} className="tool-chip"><span className="ok">✓</span> {c.label}</span>
                  ))}
                </div>
                <div className="msg agent m4">
                  <div className="who">{t.agentConsole.msg4Who}</div>
                  <div className="bubble">{t.agentConsole.msg4}</div>
                </div>
                <div className="msg m5" style={{ maxWidth: '100%' }}>
                  <div className="approval">
                    <span><small>{t.agentConsole.approvalLabel}</small>{t.agentConsole.approvalQ}</span>
                    <a href="#contact" className="btn btn-fill" data-cursor="approve"><span>{t.agentConsole.approvalBtn}</span></a>
                  </div>
                </div>
                <div className="msg agent m6">
                  <div className="who">{t.agentConsole.msg6Who}</div>
                  <div className="bubble">{t.agentConsole.msg6}</div>
                </div>
              </div>
              <button className="replay-btn" onClick={replayConsole} aria-label="Replay demo">{t.agentConsole.replay}</button>
            </div>
          </div>
        </section>

        {/* KINETIC BAND */}
        <div className="kinetic-band" aria-hidden="true">
          <div className="kinetic-line" data-speed="-0.32">{t.kinetic.line1}&nbsp;</div>
          <div className="kinetic-line ghost" data-speed="0.32">
            {t.kinetic.line2.pre}<span className="serif">{t.kinetic.line2.s1}</span>
            {t.kinetic.line2.mid}<span className="serif">{t.kinetic.line2.s2}</span>
            {t.kinetic.line2.mid2}<span className="serif">{t.kinetic.line2.s3}</span>
            {t.kinetic.line2.tail}&nbsp;
          </div>
        </div>

        {/* PROCESS */}
        <section id="process">
          <div className="wrap process">
            <div className="process-sticky">
              <div className="sec-index" style={{ marginBottom: 14 }}>{t.process.index}</div>
              <h2 className="sec-title mask-reveal">
                <span className="w"><span>{t.process.titlePre}</span></span><br />
                <span className="w"><span className="serif">{t.process.titleSerif}</span></span>
              </h2>
              <p>{t.process.p}</p>
            </div>
            <div className="process-steps">
              {t.process.steps.map((s, i) => (
                <div className="p-step" key={i}>
                  <div className="p-num">{s.n}</div>
                  <div>
                    <div className="p-meta">{s.meta}</div>
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MANIFESTO */}
        <section className="manifesto" aria-label="Our belief">
          <span className="label fade-up">{t.manifesto.label}</span>
          <blockquote className="fade-up">{t.manifesto.quotePre}<em>{t.manifesto.quoteEm}</em>{t.manifesto.quotePost}</blockquote>
          <div className="sign fade-up">{t.manifesto.signPre}<b>{t.manifesto.signBold}</b>{t.manifesto.signPost}</div>
        </section>

        {/* VOICES */}
        <section id="voices" style={{ borderTop: '1px solid var(--line)' }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-index">{t.voices.index}</div>
              <h2 className="sec-title mask-reveal">
                <span className="w"><span>{t.voices.titlePre}</span></span>{' '}
                <span className="w"><span className="serif">{t.voices.titleSerif}</span></span>
              </h2>
            </div>
            <div className="quote-stage">
              {t.voices.quotes.map((q, i) => (
                <div className={`quote-slide ${i === quoteIdx ? 'on' : ''}`} key={i}>
                  <blockquote>{q.pre}<mark>{q.mark}</mark>{q.post}</blockquote>
                  <div className="quote-who">
                    <div className="avi">{q.avi}</div>
                    <div className="info"><b>{q.name}</b><span>{q.role}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="quote-nav">
              {t.voices.quotes.map((_, i) => (
                <button key={i} className={i === quoteIdx ? 'on' : ''} onClick={() => goQuote(i)} aria-label={`Show quote ${i + 1}`}><i /></button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="final-cta">
          <div className="cta-orb" aria-hidden="true" />
          <div className="wrap" style={{ position: 'relative' }}>
            <h2 className="giant mask-reveal">
              <span className="w"><span>{t.cta.titleL1}</span></span><br />
              <span className="w"><span>{t.cta.titleL2Pre}</span></span>{' '}
              <span className="w"><span className="serif">{t.cta.titleL2Serif}</span></span>
            </h2>
            <p className="fade-up">{t.cta.p}</p>
            <div className="cta-row fade-up">
              <a href="mailto:Contact@AdrianIdea.ir" className="btn btn-fill magnetic" data-cursor="hello"><span>{t.cta.email}</span></a>
              <a href="tel:+989125633479" className="btn btn-line magnetic" data-cursor="call">{t.cta.phone}</a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="hr-footer">
        <div className="foot-big-wrap"><div className="foot-big" aria-hidden="true">ADRIAN&nbsp;IDEA</div></div>
        <div className="foot-grid">
          <div className="foot-brand">
            <a href="#" className="brand" aria-label="Adrian Idea">
              <LogoMark gold />
              <span className="wordmark">{t.wordmark.main}<small>{t.footer.wordmarkSub}</small></span>
            </a>
            <p>{t.footer.p}</p>
          </div>
          <div className="foot-col">
            <h4>{t.footer.studioH}</h4>
            <ul>
              <li><a href="#capabilities">{t.footer.studio[0]}</a></li>
              <li><a href="#agent-console">{t.footer.studio[1]}</a></li>
              <li><a href="#process">{t.footer.studio[2]}</a></li>
              <li><a href="#voices">{t.footer.studio[3]}</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>{t.footer.reachH}</h4>
            <ul>
              <li><a href="mailto:Contact@AdrianIdea.ir">Contact@AdrianIdea.ir</a></li>
              <li><a href="tel:+989125633479">+98 912 563 3479</a></li>
              <li><a href="https://www.AdrianIdea.ir">www.AdrianIdea.ir</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>{t.footer.legalH}</h4>
            <ul>
              <li><a href="#">{t.footer.legal[0]}</a></li>
              <li><a href="#">{t.footer.legal[1]}</a></li>
              <li><a href="#">{t.footer.legal[2]}</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{t.footer.copy}</span>
          <span>{t.footer.tag}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
