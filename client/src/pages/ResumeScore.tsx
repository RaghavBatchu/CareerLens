import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import ResumeUpload from '../components/ResumeUpload';
import api from '../api/axios';

interface ScoreResult {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
}

export default function ResumeScore() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !jdText.trim()) { setError('Please upload a resume and paste a job description.'); return; }
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      form.append('jd_text', jdText);
      if (jobRole) form.append('job_role', jobRole);
      const { data } = await api.post('/api/resume/score', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Scoring failed. Make sure the ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.score >= 70 ? '#34d399' : result.score >= 45 ? '#fbbf24' : '#f87171'
    : '#7c3aed';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="page-title">Resume Score</h1>
        <p className="page-subtitle">Upload your resume and paste a job description to get your match score.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="card">
              <p className="label mb-3">Resume PDF</p>
              <ResumeUpload onFileAccepted={setFile} currentFile={file} />
            </div>

            <div className="card space-y-4">
              <div>
                <label className="label">Job Role (optional)</label>
                <input className="input" placeholder="e.g. Backend Engineer" value={jobRole} onChange={e => setJobRole(e.target.value)} />
              </div>
              <div>
                <label className="label">Job Description *</label>
                <textarea
                  className="input resize-none"
                  rows={8}
                  placeholder="Paste the full job description here…"
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400 px-1">⚠ {error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading || !file}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analysing…
                </span>
              ) : 'Analyse Resume'}
            </button>
          </motion.form>

          {/* Result Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {result ? (
              <div className="space-y-5">
                {/* Score ring */}
                <div className="card-glow text-center py-8">
                  <svg viewBox="0 0 120 120" className="w-32 h-32 mx-auto mb-4">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="10"
                      strokeDasharray={`${(result.score / 100) * 314} 314`}
                      strokeLinecap="round" transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 8px ${scoreColor})` }}/>
                    <text x="60" y="65" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{Math.round(result.score)}</text>
                    <text x="60" y="82" textAnchor="middle" fill="#64748b" fontSize="10">/ 100</text>
                  </svg>
                  <p className="text-sm font-medium" style={{ color: scoreColor }}>
                    {result.score >= 70 ? 'Strong Match ✓' : result.score >= 45 ? 'Partial Match' : 'Low Match — Consider Enhancing'}
                  </p>
                </div>

                {/* Keywords */}
                <div className="card space-y-4">
                  <div>
                    <p className="label mb-2">Matched Keywords ({result.matched_keywords.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_keywords.slice(0, 20).map(k => (
                        <span key={k} className="badge-success">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="label mb-2">Missing Keywords ({result.missing_keywords.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.slice(0, 20).map(k => (
                        <span key={k} className="badge-danger">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card h-full flex flex-col items-center justify-center text-center py-20 text-slate-500">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-sm">Your score results will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
