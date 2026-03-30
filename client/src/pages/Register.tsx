import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (field: 'name' | 'email' | 'password', value: string) => {
    const next = { ...errors };
    if (field === 'name') next.name = value.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
    if (field === 'email') next.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address';
    if (field === 'password') next.password = value.length >= 4 ? '' : 'Password must be at least 4 characters';
    setErrors(next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const nameErr = name.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
    const emailErr = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid email address';
    const passErr = password.length >= 4 ? '' : 'Password must be at least 4 characters';
    if (nameErr || emailErr || passErr) { setErrors({ name: nameErr, email: emailErr, password: passErr }); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">🔭</span>
            <span className="text-2xl font-bold gradient-text">CareerLens</span>
          </div>
          <p className="text-slate-400 text-sm">Create your account</p>
        </div>

        <div className="card-glow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => { setName(e.target.value); validateField('name', e.target.value); }}
                required
                style={errors.name ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); validateField('email', e.target.value); }}
                required
                style={errors.email ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password <span className="normal-case" style={{ color: 'var(--text-muted)' }}>(min 4 chars)</span></label>
              <input
                type="password"
                className="input"
                placeholder="Min 4 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value); }}
                required
                style={errors.password ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.password}</p>}
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-4 py-3 text-sm text-red-300"
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                {submitError}
              </motion.div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
