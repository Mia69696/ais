import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Scissors } from 'lucide-react';
import TiltCard from './TiltCard';
import { useAppStore } from '../store/appStore';

const TYPEWRITER_WORDS = [
  'Viral YouTube Shorts',
  'TikTok Bangers',
  'Instagram Reels',
  'Trending Top Lists',
  'AI Commentary Videos',
];

function Typewriter() {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = TYPEWRITER_WORDS[wordIdx];
    const delay = deleting ? 40 : charIdx === word.length ? 1800 : 70;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setWordIdx(i => (i + 1) % TYPEWRITER_WORDS.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx]);

  return (
    <span className="neon-text-pink">
      {TYPEWRITER_WORDS[wordIdx].slice(0, charIdx)}
      <span className="cursor-blink" />
    </span>
  );
}

// Animated orbit visual
function OrbitVisual() {
  const platforms = [
    { emoji: '▶️', label: 'YouTube', deg: 0, r: 130 },
    { emoji: '🎵', label: 'TikTok', deg: 90, r: 130 },
    { emoji: '📸', label: 'Instagram', deg: 180, r: 130 },
    { emoji: '✨', label: 'Reels', deg: 270, r: 130 },
    { emoji: '🔥', label: 'Trending', deg: 45, r: 80 },
    { emoji: '🤖', label: 'AI', deg: 225, r: 80 },
  ];

  return (
    <div className="orbit-container mx-auto">
      {/* Outer ring */}
      <div
        className="orbit-ring spin-ring"
        style={{ width: 280, height: 280, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
      />
      {/* Inner ring */}
      <div
        className="orbit-ring spin-ring-reverse"
        style={{ width: 175, height: 175, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
      />

      {/* Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center glow-purple float-anim z-10">
        <Zap size={32} className="text-white" />
      </div>

      {/* Planets */}
      {platforms.map((p, i) => {
        const rad = (p.deg * Math.PI) / 180;
        const cx = 190, cy = 190;
        const x = cx + p.r * Math.cos(rad) - 22;
        const y = cy + p.r * Math.sin(rad) - 22;
        return (
          <motion.div
            key={p.label}
            className="orbit-planet w-11 h-11 glass-card flex items-center justify-center text-xl z-10"
            style={{ left: x, top: y, position: 'absolute' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            title={p.label}
          >
            {p.emoji}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Hero() {
  const { isLoggedIn, openSignup, openDashboard } = useAppStore();

  const scrollToClipper = () => {
    const el = document.getElementById('auto-clipper');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section min-h-screen flex items-center pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="feature-badge mb-4">
              <Sparkles size={12} />
              AI-Powered Video Automation
            </div>
            
            {/* FREE badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-green-300 mb-5"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)' }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              100% Free — No credit card ever required
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              <span className="neon-text">Automate</span>
              <br />
              <Typewriter />
              <br />
              <span className="text-white">in Minutes</span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              Foufou.AI is the most powerful <strong className="text-white">free</strong> AI video engine. 
              Auto-clip any YouTube/TikTok/Instagram URL, generate viral scripts, rank top lists, 
              clone voices — all 100% free, no editing skills needed.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={isLoggedIn ? openDashboard : openSignup}
                className="btn-primary"
              >
                <span className="flex items-center gap-2">
                  <Zap size={16} />
                  {isLoggedIn ? 'Open Dashboard' : 'Start Free — $0'}
                </span>
              </button>
              <button
                onClick={scrollToClipper}
                className="btn-outline flex items-center gap-2"
              >
                <Scissors size={16} /> Try Auto-Clipper
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: '🎬', value: '∞', label: 'Unlimited videos' },
                { icon: '🎙️', value: '35+', label: 'AI Voice Clones' },
                { icon: '📱', value: '4', label: 'Platforms Supported' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <div className="font-black text-lg neon-text-cyan">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right – 3D orbit */}
          <motion.div
            initial={{ x: 60, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            className="flex flex-col items-center gap-8"
          >
            <OrbitVisual />

            {/* Trending badge */}
            <TiltCard className="glass-card p-4 flex items-center gap-3 max-w-xs w-full">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Video Ranking Tool 🔥</div>
                <div className="text-xs text-slate-400">Currently the #1 trending video format</div>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
              </div>
            </TiltCard>

            {/* Free badge card */}
            <TiltCard className="glass-card p-4 flex items-center gap-3 max-w-xs w-full">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-xl">
                ✅
              </div>
              <div>
                <div className="font-bold text-sm text-white">Completely Free Forever</div>
                <div className="text-xs text-slate-400">No subscriptions, no hidden fees</div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
