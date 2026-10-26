import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AdminUser } from '../types/ott';
import { adminLogin } from '../services/ottStorage';

interface AdminLoginPageProps {
  onSuccess: (admin: AdminUser) => void;
  onBackToSite: () => void;
  accessDeniedNotice?: string | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onBackToSite,
  accessDeniedNotice,
}) => {
  const [username, setUsername] = useState('admin@tamilflix.tv');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Rate limiting countdown
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutRemaining > 0) {
      setError(`Too many failed attempts. Access locked for ${lockoutRemaining} seconds.`);
      return;
    }

    if (!password.trim()) {
      setError('Please enter the administrative password.');
      return;
    }

    try {
      // In production security, authenticates admin credentials
      const admin = adminLogin(password);
      // Reset attempts
      setAttempts(0);
      onSuccess(admin);
    } catch (err: unknown) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setLockoutRemaining(60);
        setError('Too many failed administrative attempts. Access locked for 60 seconds.');
      } else {
        const remaining = 5 - nextAttempts;
        setError(
          err instanceof Error
            ? `${err.message} (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lockout)`
            : 'Authentication failed.'
        );
      }
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-zinc-950 text-zinc-100 select-none">
      {/* Background glow styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      {/* Admin Login Card */}
      <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-md">
        {/* Top brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
            <Shield className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Control Portal</h1>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xs">
            Restricted gateway: Please authenticate to access OTT platform management, movies, series, and live streaming controls.
          </p>
        </div>

        {/* Access Denied notification if normal user accessed /admin */}
        {accessDeniedNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>{accessDeniedNotice}</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {lockoutRemaining > 0 && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Security lockout active: {lockoutRemaining}s remaining.</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Admin Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@tamilflix.tv"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. admin123)"
                disabled={lockoutRemaining > 0}
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Default password: <code className="text-amber-400 font-mono">admin123</code> or <code className="text-amber-400 font-mono">tamilflix</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={lockoutRemaining > 0}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all hover:scale-[1.01] cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            Authenticate & Open Dashboard
          </button>
        </form>

        {/* Back to Site Link */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
          <button
            onClick={onBackToSite}
            className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
