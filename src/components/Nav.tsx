import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const links = ['Features', 'Auto Clipper', 'How It Works', 'Pricing', 'FAQ'];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isLoggedIn, user, openLogin, openSignup, openDashboard } = useAppStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id.toLowerCase().replace(/ /g, '-'));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-glass shadow-lg shadow-purple-900/10' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center glow-purple">
              <Zap size={18} className="text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full pulse-dot" />
          </div>
          <span className="font-black text-xl tracking-tight">
            <span className="neon-text">Foufou</span>
            <span className="text-white">.AI</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold ml-1">
            FREE
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <button
              key={l}
              onClick={() => scrollTo(l)}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {l}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button
                onClick={openDashboard}
                className="flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-purple-900/20"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </button>
              <button
                onClick={openDashboard}
                className="flex items-center gap-2 btn-primary text-sm py-2 px-5"
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {user?.avatar?.[0]}
                </span>
                <span>{user?.name?.split(' ')[0]}</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={openLogin} className="btn-outline text-sm py-2 px-5">Log In</button>
              <button onClick={openSignup} className="btn-primary text-sm py-2 px-5 flex items-center gap-1.5">
                <span>Start Free</span>
                <span className="text-xs opacity-80">— $0</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden nav-glass border-t border-purple-900/20 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map(l => (
                <button key={l} onClick={() => scrollTo(l)} className="text-left text-slate-300 hover:text-white font-medium py-1">
                  {l}
                </button>
              ))}
              {isLoggedIn ? (
                <button onClick={() => { openDashboard(); setOpen(false); }} className="btn-primary w-full mt-2">
                  <span>Open Dashboard</span>
                </button>
              ) : (
                <>
                  <button onClick={() => { openLogin(); setOpen(false); }} className="btn-outline w-full">Log In</button>
                  <button onClick={() => { openSignup(); setOpen(false); }} className="btn-primary w-full mt-1">
                    <span>Start Free — $0</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
