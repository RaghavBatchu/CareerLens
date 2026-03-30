import Sidebar from '../components/Sidebar';

export default function Roadmap() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="page-title">Career Roadmap</h1>
        <p className="page-subtitle">Your AI-generated 30/60/90-day skill-building plan.</p>
        <div className="card flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-sm">Coming in next session</p>
        </div>
      </main>
    </div>
  );
}
