import React, { useState } from 'react';
import { Sparkles, Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import GlassCard from '../../components/GlassCard';

const Login = () => {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Small delay to simulate network latency
    setTimeout(async () => {
      try {
        const result = await login(username, password);
        setLoading(false);
        if (!result.success) {
          setError(result.message);
        }
      } catch (err) {
        setLoading(false);
        setError(err.message || 'Lỗi đăng nhập');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-[#06070B] px-4 py-12">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-pink-500/10 blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Cyber Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-[420px] z-10 animate-in fade-in zoom-in duration-300">
        <GlassCard hoverEffect={false} className="p-8 border border-white/10 shadow-2xl relative">

          {/* Accent light highlight top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl shadow-purple-500/30 text-white mb-3 flex items-center justify-center">
              <Sparkles size={24} className="animate-spin-slow" />
            </div>
            <h1 className="text-xl font-extrabold tracking-widest text-white uppercase">CHINH</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">System Terminal Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs animate-in shake duration-200">
                <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Username</label>
              <div className="relative">
                <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs glass-input"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 rounded-xl text-xs glass-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold text-white glass-btn-primary shadow-lg shadow-purple-500/20 tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'ENTER TERMINAL'
              )}
            </button>
          </form>


        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
