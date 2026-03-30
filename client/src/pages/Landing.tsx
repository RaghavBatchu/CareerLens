import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

/* ─── Types ──────────────────────────────────────────────── */
const features = [
  {
    num: '01',
    title: 'Resume Score',
    desc: 'Two-stage analysis using TF-IDF keyword matching and BERT semantic similarity. Know exactly where you stand.',
    stat: 'Up to 94% match accuracy',
  },
  {
    num: '02',
    title: 'AI Enhancer',
    desc: 'Section-by-section rewriting with stronger action verbs, quantified metrics, and natural keyword insertion.',
    stat: 'Powered by Gemini Flash',
  },
  {
    num: '03',
    title: 'Culture Fit',
    desc: 'A 12-question assessment maps your work style to company archetypes — startup, enterprise, research, and more.',
    stat: 'KNN classifier, k=5',
  },
  {
    num: '04',
    title: 'Career Roadmap',
    desc: 'AI-generated 30/60/90-day skill plan tailored to your gaps, culture result, and target role.',
    stat: '~10 tasks per roadmap',
  },
];

/* ─── Mock app screenshot ─────────────────────────────────── */
function AppMockup() {
  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #ffffff14',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          background: '#1a1a1a',
          borderBottom: '1px solid #ffffff0d',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3a3a', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3a3a', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3a3a3a', display: 'inline-block' }} />
        <div style={{ flex: 1, height: 20, background: '#252525', borderRadius: 6, marginLeft: 8 }} />
      </div>

      {/* App layout */}
      <div style={{ display: 'flex', height: 380 }}>
        {/* Sidebar */}
        <div style={{ width: 160, borderRight: '1px solid #ffffff0d', padding: '20px 0' }}>
          <div style={{ padding: '0 16px', marginBottom: 24 }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>CareerLens</span>
          </div>
          {['Dashboard', 'Resume Score', 'AI Enhancer', 'Culture Fit', 'Roadmap'].map((item, i) => (
            <div
              key={item}
              style={{
                padding: '8px 16px',
                margin: '2px 8px',
                borderRadius: 6,
                background: i === 1 ? '#10b98115' : 'transparent',
                borderLeft: i === 1 ? '2px solid #10b981' : '2px solid transparent',
                color: i === 1 ? '#fff' : '#555',
                fontSize: 12,
                cursor: 'default',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>MATCH SCORE</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <span style={{ color: '#fff', fontSize: 36, fontWeight: 700, lineHeight: 1 }}>78</span>
              <span style={{ color: '#10b981', fontSize: 13, marginBottom: 4 }}>/ 100</span>
            </div>
            {/* Score bar */}
            <div style={{ height: 4, background: '#222', borderRadius: 2, marginTop: 10, width: '100%' }}>
              <div style={{ height: 4, background: '#10b981', borderRadius: 2, width: '78%', transition: 'width 1s' }} />
            </div>
          </div>

          {/* Keyword pills */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#555', fontSize: 10, marginBottom: 8 }}>MATCHED KEYWORDS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'REST APIs'].map(k => (
                <span key={k} style={{ padding: '2px 8px', background: '#10b98115', border: '1px solid #10b98125', borderRadius: 4, color: '#10b981', fontSize: 10 }}>
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#555', fontSize: 10, marginBottom: 8 }}>MISSING KEYWORDS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Kubernetes', 'Docker', 'CI/CD'].map(k => (
                <span key={k} style={{ padding: '2px 8px', background: '#ff444415', border: '1px solid #ff444425', borderRadius: 4, color: '#ff6b6b', fontSize: 10 }}>
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Section bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
            {[['Experience', 82], ['Skills', 91], ['Education', 65]].map(([label, val]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ color: '#555', fontSize: 10 }}>{label}</span>
                  <span style={{ color: '#888', fontSize: 10 }}>{val}%</span>
                </div>
                <div style={{ height: 3, background: '#1e1e1e', borderRadius: 2 }}>
                  <div style={{ height: 3, background: '#ffffff20', borderRadius: 2, width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ────────────────────────────────────────── */
function FeatureCard({ num, title, desc, stat, index }: typeof features[0] & { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      style={{
        border: '1px solid #ffffff10',
        borderRadius: 12,
        padding: '28px 28px 24px',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'default',
        transition: 'border-color 0.2s',
      }}
      whileHover={{ borderColor: '#ffffff20' }}
    >
      <div style={{ color: '#10b981', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
        {num} /
      </div>
      <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 600 }}>{title}</div>
      <div style={{ color: '#666', fontSize: 13, lineHeight: 1.7 }}>{desc}</div>
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid #ffffff08',
          color: '#444',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        {stat}
      </div>
    </motion.div>
  );
}

/* ─── Landing ────────────────────────────────────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#fff' }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '0 48px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.3s, border-color 0.3s',
          background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid #ffffff0d' : '1px solid transparent',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
          CareerLens
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/login"
            style={{
              color: '#888',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              padding: '6px 16px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{
              background: '#fff',
              color: '#0a0a0a',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              padding: '7px 18px',
              borderRadius: 8,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 100,
          paddingLeft: 48,
          paddingRight: 48,
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
        }}
      >
        {/* Left: Text */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ display: 'inline-block', color: '#10b981', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
              Career Intelligence
            </span>
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(48px, 5.5vw, 76px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                color: '#fff',
                margin: 0,
              }}
            >
              Land the job<br />
              <span style={{ color: '#333' }}>you actually want.</span>
            </h1>
          </div>

          <p
            style={{
              color: '#666',
              fontSize: 16,
              lineHeight: 1.75,
              maxWidth: 420,
              margin: '0 0 40px',
            }}
          >
            Score your resume against any job description, enhance it with AI,
            discover your culture fit, and get a personalised career roadmap.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link
              to="/register"
              style={{
                background: '#fff',
                color: '#0a0a0a',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Analyse my resume →
            </Link>

            <Link
              to="/login"
              style={{
                color: '#888',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
                textDecorationColor: '#333',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}
            >
              See how it works
            </Link>
          </div>
        </motion.div>

        {/* Right: Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <AppMockup />
        </motion.div>
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #ffffff08', maxWidth: 1200, margin: '0 auto' }} />

      {/* ── Feature cards ────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={f.num} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid #ffffff08',
          padding: '24px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <span style={{ color: '#333', fontSize: 12 }}>CareerLens · 2026</span>
        <nav style={{ display: 'flex', gap: 24 }}>
          {[['Sign in', '/login'], ['Sign up', '/register']].map(([label, to]) => (
            <Link
              key={to}
              to={to}
              style={{ color: '#333', textDecoration: 'none', fontSize: 12, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#888')}
              onMouseLeave={e => (e.currentTarget.style.color = '#333')}
            >
              {label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
