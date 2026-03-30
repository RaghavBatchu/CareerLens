import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '📊', title: 'Resume Scoring', desc: 'AI-powered match score vs any job description using semantic analysis.' },
  { icon: '✨', title: 'AI Enhancer', desc: 'Rewrite resume sections with stronger verbs and JD-aligned keywords.' },
  { icon: '🧬', title: 'Culture Fit', desc: 'Discover your ideal company archetype via a 12-question personality quiz.' },
  { icon: '🗺️', title: 'Career Roadmap', desc: 'Get a personalised 30/60/90-day skill-building plan powered by Gemini AI.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)', background: 'rgba(10,10,20,0.7)' }}>
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🔭</span>
          <span className="text-lg font-bold gradient-text">CareerLens</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm py-2 px-5">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="badge-purple mb-6 inline-flex text-xs py-1 px-4">
            Powered by Gemini 1.5 Flash + all-MiniLM-L6-v2
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6"
            style={{ letterSpacing: '-0.02em' }}>
            Your career,{' '}
            <span className="gradient-text">smarter</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Score your resume against any job, enhance it with AI, discover your culture fit,
            and get a personalised career roadmap — all in one place.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-8 py-3 glow-pulse">
              Get Started Free →
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-10 mt-16 flex-wrap justify-center"
        >
          {[['AI Scoring', 'TF-IDF + BERT'], ['Culture KNN', 'k=5 classifier'], ['Roadmap AI', 'Gemini Flash']].map(([label, sub]) => (
            <div key={label} className="text-center">
              <p className="text-white font-bold text-lg">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features grid ────────────────────────────────────── */}
      <section className="relative z-10 px-8 py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white text-center mb-2"
          >
            Everything you need to land the job
          </motion.h2>
          <p className="text-slate-400 text-center text-sm mb-12">Four AI-powered tools, one dashboard.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="card hover:scale-[1.03] transition-transform duration-200 cursor-default"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="relative z-10 px-8 py-16 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold text-white mb-4">Ready to level up your career?</h2>
          <p className="text-slate-400 text-sm mb-8">Free to use. No credit card required.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3">
            Create Your Account →
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 px-8 py-6 text-center text-slate-600 text-xs"
        style={{ borderTop: '1px solid var(--border)' }}>
        © 2026 CareerLens · Built with React + FastAPI + Gemini AI
      </footer>
    </div>
  );
}
