import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { useAppStore } from '../store/appStore';

function LoginForm() {
  const { login, loginError, openSignup, closeLogin } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-4 glow-purple">
          <Zap size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white">Welcome Back</h2>
        <p className="text-slate-400 text-sm mt-1">Sign in to your Foufou.AI account</p>
      </div>

      {/* Quick login tip */}
      <div className="mb-5 p-3 rounded-xl bg-purple-900/20 border border-purple-700/30 text-xs text-purple-300 text-center">
        🚀 <strong>Demo:</strong> Use any email + any password (4+ chars) to log in free!
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input pl-11"
            required
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Password (4+ chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-input pl-11 pr-11"
            required
          />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {loginError && (
          <div className="text-red-400 text-sm text-center p-2 rounded-lg bg-red-900/20 border border-red-700/30">
            {loginError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /><span>Signing in...</span></> : <span>Sign In Free →</span>}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <button onClick={openSignup} className="text-purple-400 hover:text-purple-300 font-semibold">
          Sign up free
        </button>
      </div>

      <div className="mt-4 text-center">
        <button onClick={closeLogin} className="text-xs text-slate-600 hover:text-slate-400">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SignupForm() {
  const { signup, loginError, openLogin, closeSignup } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signup(name, email, password);
    setLoading(false);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4 glow-cyan">
          <Zap size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white">Create Free Account</h2>
        <p className="text-slate-400 text-sm mt-1">Start creating viral videos today — 100% free</p>
      </div>

      <div className="mb-5 p-3 rounded-xl bg-green-900/20 border border-green-700/30 text-xs text-green-300 text-center">
        ✅ <strong>Unlimited free plan</strong> — No credit card required. Ever.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="auth-input pl-11"
            required
          />
        </div>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input pl-11"
            required
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Create password (4+ chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-input pl-11 pr-11"
            required
          />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {loginError && (
          <div className="text-red-400 text-sm text-center p-2 rounded-lg bg-red-900/20 border border-red-700/30">
            {loginError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /><span>Creating account...</span></> : <span>Create Free Account →</span>}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button onClick={openLogin} className="text-purple-400 hover:text-purple-300 font-semibold">
          Sign in
        </button>
      </div>

      <div className="mt-4 text-center">
        <button onClick={closeSignup} className="text-xs text-slate-600 hover:text-slate-400">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AuthModal() {
  const { showLogin, showSignup, closeLogin, closeSignup } = useAppStore();
  const isOpen = showLogin || showSignup;
  const close = showLogin ? closeLogin : closeSignup;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={close}
        >
          <motion.div
            key="auth-card"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md"
            style={{ background: 'rgba(10,10,25,0.97)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 24, padding: 36, boxShadow: '0 0 80px rgba(168,85,247,0.25), 0 40px 80px rgba(0,0,0,0.6)' }}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>

            {/* Glow orb bg */}
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

            <AnimatePresence mode="wait">
              {showLogin && (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <LoginForm />
                </motion.div>
              )}
              {showSignup && (
                <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <SignupForm />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
