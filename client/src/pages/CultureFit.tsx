import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const QUESTIONS = [
  "I prefer working in a fast-paced environment where priorities shift frequently.",
  "I work best when there is a sense of urgency and rapid delivery.",
  "I enjoy working closely with cross-functional teams rather than producing work in isolation.",
  "I believe pair programming and constant communication lead to better outcomes.",
  "I thrive when there are clear rules, strict processes, and well-defined expectations.",
  "I prefer to have my daily tasks and long-term goals rigidly structured.",
  "I am comfortable making decisions even when I don't have all the relevant information.",
  "Working on deeply ambiguous problems excites me more than clear-cut tickets.",
  "I prefer direct, immediate, and sometimes blunt feedback on my performance.",
  "I appreciate regular critique as it helps me improve faster.",
  "I actively seek out new challenges that force me outside my comfort zone.",
  "I view failures as a stepping stone rather than a reflection of my abilities."
];

interface CultureResult {
  probabilities: Record<string, number>;
  top_match: string;
  dimensions: {
    pace: number;
    collaboration: number;
    structure: number;
    ambiguity_tolerance: number;
    feedback_style: number;
    growth_mindset: number;
  };
}

export default function CultureFit() {
  const [answers, setAnswers] = useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CultureResult | null>(null);
  const [error, setError] = useState('');

  const handleSelect = (idx: number, val: number) => {
    const newAnswers = [...answers];
    newAnswers[idx] = val;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (answers.includes(0)) {
      setError('Please answer all 12 questions.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/culture', { answers });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze culture fit.');
    } finally {
      setLoading(false);
    }
  };

  const radarData = result ? [
    { metric: 'Pace', score: result.dimensions.pace },
    { metric: 'Collaboration', score: result.dimensions.collaboration },
    { metric: 'Structure', score: result.dimensions.structure },
    { metric: 'Ambiguity', score: result.dimensions.ambiguity_tolerance },
    { metric: 'Feedback', score: result.dimensions.feedback_style },
    { metric: 'Growth', score: result.dimensions.growth_mindset },
  ] : [];

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="page-title">Culture Fit Predictor</h1>
        <p className="page-subtitle">Answer 12 questions to discover your ideal company archetype.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Questions Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-8">
              {QUESTIONS.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="text-sm text-slate-300 font-medium">{idx + 1}. {q}</p>
                  <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-500 w-16">Disagree</span>
                    {[1, 2, 3, 4, 5].map(val => (
                      <label key={val} className="flex flex-col items-center cursor-pointer gap-1">
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={val}
                          checked={answers[idx] === val}
                          onChange={() => handleSelect(idx, val)}
                          className="w-4 h-4 accent-purple-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">{val}</span>
                      </label>
                    ))}
                    <span className="text-xs text-slate-500 w-16 text-right">Agree</span>
                  </div>
                </div>
              ))}

              {error && <p className="text-sm text-red-400 px-1">⚠ {error}</p>}

              <button type="submit" className="btn-primary w-full" disabled={loading || answers.includes(0)}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Discover Archetype'}
              </button>
            </form>
          </motion.div>

          {/* Results Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card flex flex-col items-center justify-center">
            {result ? (
              <div className="w-full space-y-8 text-center animate-fade-in">
                <div>
                  <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Your Ideal Archetype</h3>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
                    {result.top_match}
                  </h2>
                </div>

                <div className="h-[300px] w-full max-w-md mx-auto relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar
                        name="Traits"
                        dataKey="score"
                        stroke="#c084fc"
                        fill="#c084fc"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-flow-col auto-cols-max gap-4 justify-center text-left flex-wrap">
                  {Object.entries(result.probabilities)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([type, prob]) => (
                      <div key={type} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 min-w-[100px]">
                        <p className="text-xs text-slate-400 truncate">{type}</p>
                        <p className="text-sm font-bold text-slate-200">{(prob * 100).toFixed(1)}%</p>
                      </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
                <div className="text-6xl mb-4">🧬</div>
                <p className="text-sm">Answer the questions to discover your ideal culture fit.</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
