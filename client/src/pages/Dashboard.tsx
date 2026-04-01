import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  to: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [taskCount, setTaskCount] = useState<number | null>(null);

  useEffect(() => {
    api.get('/api/resume/history')
      .then(r => { if (r.data?.[0]) setLatestScore(r.data[0].score); })
      .catch(() => {});
    api.get('/api/roadmap/tasks')
      .then(r => setTaskCount(r.data?.length ?? 0))
      .catch(() => {});
  }, []);

  const stats: StatCard[] = [
    { label: 'Latest Resume Score', value: latestScore !== null ? `${latestScore.toFixed(0)}` : '—', icon: '📊', color: '#7c3aed', to: '/resume' },
    { label: 'Active Roadmap Tasks', value: taskCount !== null ? String(taskCount) : '—', icon: '🗺️', color: '#34d399', to: '/roadmap' },
    { label: 'Culture Fit', value: 'Take Quiz', icon: '🧬', color: '#f87171', to: '/culture' },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's your career intelligence snapshot.</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {stats.map((s) => (
            <motion.div key={s.label} variants={item}>
              <Link to={s.to} className="block card hover:scale-[1.02] transition-transform duration-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
                    {s.icon}
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">View →</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1"
                  style={s.value !== '—' && s.value !== 'Improve it' && s.value !== 'Take Quiz'
                    ? { color: s.color } : {}}>
                  {s.value}
                </p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick action banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="card-glow flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white mb-1">Ready to score your resume?</h2>
              <p className="text-sm text-slate-400">Upload a PDF and paste a job description to get your match score.</p>
            </div>
            <Link to="/resume" className="btn-primary shrink-0">Score Now</Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
