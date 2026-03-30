import Sidebar from '../components/Sidebar';

export default function CultureFit() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="page-title">Culture Fit</h1>
        <p className="page-subtitle">Answer 12 questions to discover your ideal company archetype.</p>
        <div className="card flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="text-5xl mb-4">🧬</div>
          <p className="text-sm">Coming in next session</p>
        </div>
      </main>
    </div>
  );
}
