import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

interface Task {
  id: number;
  task: string;
  category: string;
  status: 'Todo' | 'In Progress' | 'Done';
  day_target: number;
  priority: string;
}

interface ResumeHistory {
  id: number;
  score: number;
  missing_keywords: string;
  job_role: string;
  created_at: string;
}

export default function Roadmap() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<ResumeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, historyRes] = await Promise.all([
        api.get('/api/roadmap/tasks'),
        api.get('/api/resume/history')
      ]);
      setTasks(tasksRes.data);
      setHistory(historyRes.data);
    } catch (err: any) {
      setError('Failed to load roadmap data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!history.length) return;
    const latest = history[0];
    
    // Parse missing_keywords since it might be a JSON string from the DB
    let missing = [];
    try {
      missing = typeof latest.missing_keywords === 'string' 
        ? JSON.parse(latest.missing_keywords) 
        : latest.missing_keywords;
    } catch (e) {
      missing = [];
    }

    try {
      setGenerating(true);
      await api.post('/api/roadmap/generate', {
        missing_keywords: missing,
        top_match: String(latest.score),
        job_role: latest.job_role || 'General',
      });
      // Re-fetch tasks immediately after generation
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate roadmap. Ensure ML service is running.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const res = await api.patch(`/api/roadmap/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: res.data.status } : t));
    } catch (err: any) {
      console.error('Failed to update task status', err);
    }
  };

  // Group tasks by day_target
  const groupedTasks = [30, 60, 90].map(day => {
    return {
      day,
      items: tasks.filter(t => t.day_target === day)
    };
  });

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="page-title mb-1">Career Roadmap</h1>
            <p className="page-subtitle">Your AI-generated 30/60/90-day skill-building plan.</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              title="Fetch latest updates from the database"
            >
              Refresh
            </button>
            {history.length > 0 && tasks.length > 0 && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 flex items-center gap-2"
                title={`Generate new roadmap for the latest job role: ${history[0].job_role || 'General'}`}
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Generating...
                  </>
                ) : 'Regenerate Roadmap'}
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-red-400 mb-4 px-2">⚠ {error}</p>}

        {loading ? (
          <div className="flex justify-center flex-col items-center h-64 text-slate-400 gap-4">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
             Loading career insights...
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-8">
            {groupedTasks.map(group => group.items.length > 0 && (
              <motion.div key={group.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                <h2 className="text-xl font-bold mb-4 text-white">
                  {group.day} Days Target
                </h2>
                <div className="space-y-4">
                  {group.items.map(task => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                      <div className="flex-1 mb-3 sm:mb-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                            {task.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-md ${task.priority?.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-400' : task.priority?.toLowerCase() === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                            {task.priority || 'Medium'}
                          </span>
                        </div>
                        <p className={`text-sm ${task.status === 'Done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {task.task}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <select 
                          className="input !py-1.5 !px-3 text-sm focus:outline-none bg-slate-800 text-white"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="Todo" className="bg-slate-800 text-white">Todo</option>
                          <option value="In Progress" className="bg-slate-800 text-white">In Progress</option>
                          <option value="Done" className="bg-slate-800 text-white">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-xl font-bold text-white mb-2">No Roadmap Generated Yet</h2>
            
            {history.length > 0 ? (
              <>
                <p className="text-slate-400 mb-6 max-w-md">
                  We can generate a customized 30/60/90-day learning roadmap based on your latest resume score of <strong className="text-white">{Math.round(history[0].score)}/100</strong> for <strong className="text-white">{history[0].job_role || 'General Role'}</strong>.
                </p>
                <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
                  {generating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Generating Roadmap...
                    </>
                  ) : 'Generate Roadmap Now'}
                </button>
              </>
            ) : (
               <>
                <p className="text-slate-400 mb-6 max-w-md">
                  You need to score a resume at least once before we can generate a personalized skill-building roadmap for you.
                </p>
                <Link to="/resume" className="btn-primary">
                  Go to Resume Score
                </Link>
               </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
