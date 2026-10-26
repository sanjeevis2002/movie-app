import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Crown, Check, AlertCircle, LogOut, ShieldCheck } from 'lucide-react';
import { User, AdminUser } from '../types/ott';
import { loginUser, registerUser, adminLogin, toggleUserPremiumStatus } from '../services/ottStorage';
import { getUserActiveSubscription, getPaymentOrders } from '../services/subscriptionStorage';
import { PaymentOrder } from '../types/subscription';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        const user = loginUser(email);
        onSuccess(user);
        onClose();
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        const user = registerUser(name.trim(), email.trim());
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Sign In to TamilFlix' : 'Create Free Account'}
            </h3>
            <p className="text-xs text-zinc-400">
              {mode === 'login'
                ? 'Access your watchlist, resume progress, and HD streams'
                : 'Stream thousands of Tamil movies, series, and live TV'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anbu Selvan"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-colors cursor-pointer shadow-md mt-2"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-amber-400 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-amber-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (admin: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const admin = adminLogin(passcode);
      onSuccess(admin);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid administrator passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">OTT Administration Portal</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Restricted area for platform administrators and editors
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Admin Password / Master PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin password (e.g. admin123)"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">
              Default demo key: <code className="text-amber-400 font-mono">admin123</code> or <code className="text-amber-400 font-mono">tamilflix</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-colors cursor-pointer shadow-md"
          >
            Authenticate & Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

interface UserProfileViewProps {
  user: User;
  onLogout: () => void;
  onUpdate: (user: User) => void;
  onNavigateToSubscription?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onLogout,
  onUpdate,
  onNavigateToSubscription,
}) => {
  const activeSub = getUserActiveSubscription(user.id);
  const userOrders = getPaymentOrders().filter((o: PaymentOrder) => o.userId === user.id);

  const daysRemaining = activeSub
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activeSub.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-zinc-800">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-zinc-950 shrink-0 shadow-md">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white truncate">{user.name}</h2>
              {activeSub ? (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeSub.planName.toUpperCase()} VIP</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-medium">
                  STANDARD FREE
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">{user.email}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Account created {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-red-950/40 border border-zinc-700 hover:border-red-500/40 text-zinc-300 hover:text-red-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* MODULE 6: USER SUBSCRIPTION SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Current Subscription & Entitlements</span>
            </h3>
            {activeSub && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase">
                Active & Verified
              </span>
            )}
          </div>

          {activeSub ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-900 border border-amber-500/30 space-y-4 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Subscribed Plan
                  </span>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <span>{activeSub.planName}</span>
                    <span className="text-xs font-normal text-zinc-400 font-mono">
                      (₹{activeSub.amountInr} paid)
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Days Remaining
                  </span>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {daysRemaining} Days
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
                <div>
                  <span className="text-zinc-500 block">Start Date:</span>
                  <strong className="text-zinc-300">
                    {new Date(activeSub.startDate).toLocaleDateString()}
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Expiry Date:</span>
                  <strong className="text-amber-400">
                    {new Date(activeSub.expiryDate).toLocaleDateString()}
                  </strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Device Screens:</span>
                  <strong className="text-zinc-300">{activeSub.maxScreens} Screen(s)</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Video Quality:</span>
                  <strong className="text-zinc-300">{activeSub.videoQuality}</strong>
                </div>
              </div>

              {onNavigateToSubscription && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onNavigateToSubscription}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-amber-400 hover:text-amber-300 font-bold text-xs rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Renew or Upgrade Plan
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-white text-sm">No Active Subscription</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Subscribe to unlock all premium movies, multi-season series, and exclusive live galas.
                </p>
              </div>

              {onNavigateToSubscription && (
                <button
                  onClick={onNavigateToSubscription}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all shrink-0"
                >
                  View Subscription Plans
                </button>
              )}
            </div>
          )}
        </div>

        {/* PAYMENT HISTORY TABLE */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Payment & Transaction History
          </h4>

          {userOrders.length === 0 ? (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-500">
              No previous transactions found for this account.
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3.5">Order Number</th>
                    <th className="py-2.5 px-3.5">Plan</th>
                    <th className="py-2.5 px-3.5">Amount</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {userOrders.map((o: PaymentOrder) => (
                    <tr key={o.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-zinc-200">
                        {o.orderNumber}
                      </td>
                      <td className="py-2.5 px-3.5 text-zinc-300 font-medium">
                        {o.planName}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-amber-400 font-bold">
                        ₹{o.amountInr}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.status === 'success'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-400 text-[10px]">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security & Streaming Quality */}
        <div className="space-y-3 pt-2 text-xs">
          <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
            Account Security & Gateway Trust
          </h4>
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
            <span>Payment Security Partner</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              IMB Gateway Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
