import { useEffect, useRef, useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { homeCopy } from '@/translations/home';
import '@/styles/home.css';

/* ==========================================================================
   Shared homepage-style shell (nav / footer / preloader / cursor / effects)
   Extracted from Index.tsx so all marketing pages share the same chrome.
   ========================================================================== */

export const LogoMark = ({ gold = false }: { gold?: boolean }) => (
  <svg viewBox="0 0 100 110" aria-hidden="true">
    {gold && (
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0cd7e" />
          <stop offset="0.55" stopColor="#d9a441" />
          <stop offset="1" stopColor="#8a6420" />
        </linearGradient>
      </defs>
    )}
    <g fill={gold ? 'url(#goldGrad)' : 'currentColor'}>
      <path d="M51 3 66 26 50 48 37 27Z" />
      <path d="M52 51 64 35 94 99q2 6-4 6H70q4-6 1-12Z" />
      <path d="M17 105 32 68q4 20-3 30 4 5 11 7z" />
    </g>
  </svg>
);

/* ---------------- Count-up ---------------- */
export function useCountUp(target: number, decimals: number) {
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

export const Counter = ({ target, decimals, unit }: { target: number; decimals: number; unit: string }) => {
  const { ref, text } = useCountUp(target, decimals);
  return <b><span ref={ref}>{text}</span><em>{unit}</em></b>;
};

/* ---------------- Preloader ---------------- */
export const Preloader = ({ onDone, label }: { onDone: () => void; label: string }) => {
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

/* ---------------- Page Shader (subdued for interior pages) ---------------- */
export const PageShader = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl || rm) {
      canvas.style.background = 'radial-gradient(ellipse 80% 60% at 30% 20%, #2a2010, transparent), radial-gradient(ellipse 60% 50% at 80% 60%, #0c2626, #070604)';
      return;
    }
    const vsrc = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
    const fsrc = `
      precision highp float;
      uniform vec2 u_res; uniform float u_time;
      float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_res.xy) / min(u_res.x, u_res.y);
        float t = u_time * 0.35;
        float g = hash21(floor(p * 8.0) + floor(t));
        vec3 col = vec3(0.024, 0.020, 0.013);
        col += vec3(0.35, 0.24, 0.09) * exp(-length(p - vec2(-0.6, 0.3)) * 1.4) * 0.55;
        col += vec3(0.05, 0.20, 0.20) * exp(-length(p - vec2(0.7, -0.2)) * 1.6) * 0.42;
        col += vec3(0.95, 0.72, 0.30) * g * 0.014;
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
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.4);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="shader-canvas" aria-hidden="true" />;
};

/* ---------------- Shared effects (reveals + cursor + magnetic + tilt + nav scroll) ---------------- */
export const useHomeEffects = (rootRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.16, rootMargin: '0px 0px -50px 0px' });
    root.querySelectorAll('.fade-up, .mask-reveal, .c-c, .c-e, .c-d').forEach((el) => io.observe(el));

    const orbitCell = root.querySelector('.c-b');
    let orbIo: IntersectionObserver | null = null;
    if (orbitCell) {
      orbIo = new IntersectionObserver((es) => es.forEach((e) => orbitCell.classList.toggle('live', e.isIntersecting)));
      orbIo.observe(orbitCell);
    }

    const sio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('active', e.isIntersecting)), { rootMargin: '-35% 0px -35% 0px' });
    root.querySelectorAll('.p-step').forEach((s) => sio.observe(s));

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

/* ---------------- HomeNav ---------------- */
export const HomeNav = ({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) => {
  const { language, setLanguage } = useLanguage();
  const t = homeCopy[language];
  const loc = useLocation();
  const toggleLang = () => setLanguage(language === 'fa' ? 'en' : 'fa');
  const active = (p: string) => loc.pathname === p ? 'active' : '';

  const links = [
    { href: '/about', label: t.pagesNav.about },
    { href: '/services', label: t.pagesNav.services },
    { href: '/case-studies', label: t.pagesNav.cases },
    { href: '/ai-philosophy', label: t.pagesNav.philosophy },
    { href: '/blog', label: t.pagesNav.blog },
  ];

  return (
    <>
      <nav className="hr-nav">
        <div className="nav-inner">
          <Link to="/" className="brand" data-cursor="home" aria-label="Adrian Idea — home">
            <LogoMark gold />
            <span className="wordmark">{t.wordmark.main}<small>{t.wordmark.sub}</small></span>
          </Link>
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.href}><Link to={l.href} data-cursor="go" className={active(l.href)}>{l.label}</Link></li>
            ))}
          </ul>
          <div className="nav-right">
            <button className="lang-btn" onClick={toggleLang} aria-label="Switch language">
              {language === 'fa' ? 'EN' : 'فا'}
            </button>
            <Link to="/auth" className="btn btn-line btn-sm magnetic" data-cursor="go">
              <span>{t.nav.signIn}</span>
            </Link>
            <Link to="/contact" className="btn btn-fill btn-sm magnetic" data-cursor="start">
              <span>{t.nav.startProject}</span>
            </Link>
            <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
              {t.nav.menuBtn}
            </button>
          </div>
        </div>
      </nav>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-label="Navigation">
        <button className="lang-btn" onClick={toggleLang} aria-label="Switch language">
          {language === 'fa' ? 'EN' : 'فا'}
        </button>
        <button className="menu-close" onClick={() => setMenuOpen(false)}>{t.nav.menuClose}</button>
        <Link to="/" onClick={() => setMenuOpen(false)}><span>{t.pagesNav.home}</span><small>01</small></Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}><span>{t.pagesNav.about}</span><small>02</small></Link>
        <Link to="/services" onClick={() => setMenuOpen(false)}><span>{t.pagesNav.services}</span><small>03</small></Link>
        <Link to="/case-studies" onClick={() => setMenuOpen(false)}><span>{t.pagesNav.cases}</span><small>04</small></Link>
        <Link to="/ai-philosophy" onClick={() => setMenuOpen(false)}><span>{t.pagesNav.philosophy}</span><small>05</small></Link>
        <Link to="/blog" onClick={() => setMenuOpen(false)}><span>{t.pagesNav.blog}</span><small>06</small></Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}><span>{t.pagesNav.contact}</span><small>07</small></Link>
        <Link to="/auth" onClick={() => setMenuOpen(false)}><span>{t.nav.signIn}</span><small>08</small></Link>
      </div>
    </>
  );
};

/* ---------------- HomeFooter ---------------- */
export const HomeFooter = () => {
  const { language } = useLanguage();
  const t = homeCopy[language];
  return (
    <footer className="hr-footer">
      <div className="foot-big-wrap"><div className="foot-big" aria-hidden="true">ADRIAN&nbsp;IDEA</div></div>
      <div className="foot-grid">
        <div className="foot-brand">
          <Link to="/" className="brand" aria-label="Adrian Idea">
            <LogoMark gold />
            <span className="wordmark">{t.wordmark.main}<small>{t.footer.wordmarkSub}</small></span>
          </Link>
          <p>{t.footer.p}</p>
        </div>
        <div className="foot-col">
          <h4>{t.footer.studioH}</h4>
          <ul>
            <li><Link to="/about">{t.pagesNav.about}</Link></li>
            <li><Link to="/services">{t.pagesNav.services}</Link></li>
            <li><Link to="/case-studies">{t.pagesNav.cases}</Link></li>
            <li><Link to="/ai-philosophy">{t.pagesNav.philosophy}</Link></li>
            <li><Link to="/blog">{t.pagesNav.blog}</Link></li>
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
            <li><Link to="/privacy-policy">{t.footer.legal[0]}</Link></li>
            <li><Link to="/terms-of-service">{t.footer.legal[1]}</Link></li>
            <li><Link to="/cookie-policy">{t.footer.legal[2]}</Link></li>
          </ul>
        </div>
      </div>
      <div className="foot-bottom">
        <span>{t.footer.copy}</span>
        <span>{t.footer.tag}</span>
      </div>
    </footer>
  );
};

/* ---------------- HomeShell (wrap interior pages) ---------------- */
export const HomeShell = ({
  children,
  className = '',
  skipPreloader = false,
  hideFooter = false,
}: {
  children: ReactNode;
  className?: string;
  skipPreloader?: boolean;
  hideFooter?: boolean;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = homeCopy[language];
  const [preloading, setPreloading] = useState(() => {
    if (skipPreloader) return false;
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem('ai-preloaded');
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useHomeEffects(rootRef);

  useEffect(() => {
    if (!preloading && rootRef.current) rootRef.current.classList.add('loaded');
  }, [preloading]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const dir = language === 'fa' ? 'rtl' : 'ltr';

  return (
    <div ref={rootRef} className={`home-root ${className}`} lang={language} dir={dir}>
      {preloading && (
        <Preloader
          label={t.preLabel}
          onDone={() => { sessionStorage.setItem('ai-preloaded', '1'); setPreloading(false); }}
        />
      )}
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
      <div id="hr-progress" aria-hidden="true" />
      <a href="#main" className="skip-link">{t.skip}</a>
      <HomeNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="main">{children}</main>
      {!hideFooter && <HomeFooter />}
    </div>
  );
};

/* ---------------- AppShell (internal authenticated pages) ---------------- */
export const AppShell = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <HomeShell skipPreloader className={`app-shell ${className}`}>
    {children}
  </HomeShell>
);

/* ---------------- Panel (gold-bordered card) ---------------- */
export const Panel = ({
  children,
  className = '',
  as: Tag = 'div',
  ...rest
}: { children: ReactNode; className?: string; as?: any; [k: string]: any }) => (
  <Tag className={`ai-panel ${className}`} {...rest}>{children}</Tag>
);

/* ---------------- Field (labeled input/textarea/select) ---------------- */
export const Field = ({
  label, hint, children, className = '',
}: { label?: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) => (
  <label className={`ai-field ${className}`}>
    {label && <span className="ai-field-label">{label}</span>}
    {children}
    {hint && <span className="ai-field-hint">{hint}</span>}
  </label>
);

/* ---------------- SectionTitle (alias for reuse; see SecHead below) ---------------- */
export const SectionTitle = (props: { index: string; titlePre: string; titleSerif: string }) => (
  <SecHead {...props} />
);



/* ---------------- Page hero (interior pages) ---------------- */
export const PageHero = ({
  crumb, titleHtml, intro,
}: { crumb: string; titleHtml: ReactNode; intro: string }) => {
  const { language } = useLanguage();
  const t = homeCopy[language];
  return (
    <header className="page-hero hero">
      <PageShader />
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-fade" aria-hidden="true" />
      <div className="hero-inner wrap" id="heroInner" style={{ position: 'relative', zIndex: 2, width: '100%', margin: '0 auto', maxWidth: 1440 }}>
        <div className="crumb">
          <Link to="/">{t.pagesNav.home}</Link>
          <span className="tick" />
          <span>{crumb}</span>
        </div>
        <h1 className="page-title">{titleHtml}</h1>
        <p className="page-intro">{intro}</p>
      </div>
    </header>
  );
};

/* ---------------- Final CTA block ---------------- */
export const FinalCTA = ({
  titleParts, p, cta1, cta1Href, cta2, cta2Href, cta2External,
}: {
  titleParts: { l1?: ReactNode; l2Pre?: ReactNode; l2Serif?: ReactNode; l2?: ReactNode };
  p: string; cta1: string; cta1Href: string; cta2: string; cta2Href: string; cta2External?: boolean;
}) => (
  <section className="final-cta" style={{ borderTop: '1px solid var(--line)' }}>
    <div className="cta-orb" aria-hidden="true" />
    <div className="wrap" style={{ position: 'relative' }}>
      <h2 className="giant mask-reveal">
        {titleParts.l1 && <><span className="w"><span>{titleParts.l1}</span></span><br /></>}
        {titleParts.l2Pre && <span className="w"><span>{titleParts.l2Pre}</span></span>}
        {titleParts.l2Pre && ' '}
        {titleParts.l2Serif && <span className="w"><span className="serif">{titleParts.l2Serif}</span></span>}
        {titleParts.l2 && <span className="w"><span>{titleParts.l2}</span></span>}
      </h2>
      <p className="fade-up">{p}</p>
      <div className="cta-row fade-up">
        {cta1Href.startsWith('/') ? (
          <Link to={cta1Href} className="btn btn-fill magnetic" data-cursor="start"><span>{cta1}</span></Link>
        ) : (
          <a href={cta1Href} className="btn btn-fill magnetic" data-cursor="start"><span>{cta1}</span></a>
        )}
        {cta2External ? (
          <a href={cta2Href} target="_blank" rel="noopener noreferrer" className="btn btn-line magnetic" data-cursor="go">{cta2}</a>
        ) : cta2Href.startsWith('/') ? (
          <Link to={cta2Href} className="btn btn-line magnetic" data-cursor="go">{cta2}</Link>
        ) : (
          <a href={cta2Href} className="btn btn-line magnetic" data-cursor="go">{cta2}</a>
        )}
      </div>
    </div>
  </section>
);

/* ---------------- Section header (index label + big title with serif accent) ---------------- */
export const SecHead = ({ index, titlePre, titleSerif }: { index: string; titlePre: string; titleSerif: string }) => (
  <div className="sec-head">
    <div className="sec-index">{index}</div>
    <h2 className="sec-title mask-reveal">
      <span className="w"><span>{titlePre}</span></span>{' '}
      <span className="w"><span className="serif">{titleSerif}</span></span>
    </h2>
  </div>
);
