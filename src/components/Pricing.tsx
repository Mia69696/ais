import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Zap } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    tagline: 'Perfect to get started — no card needed',
    videos: '∞',
    credits: 'Unlimited',
    color: 'from-slate-400 to-slate-300',
    features: [
      { text: 'Unlimited videos', ok: true },
      { text: 'Unlimited credits', ok: true },
      { text: 'Fast rendering mode', ok: true },
      { text: 'YouTube Shorts & TikTok templates', ok: true },
      { text: '5 AI voice options', ok: true },
      { text: 'Auto-captions', ok: true },
      { text: 'Auto Clipper (URL to clips)', ok: true },
      { text: 'Voice Cloning', ok: true },
      { text: 'AI Image Generator', ok: true },
      { text: 'Brand Kit', ok: true },
    ],
  },
  {
    name: 'Creator',
    price: 'Free',
    period: '',
    tagline: 'Full power for serious content creators',
    videos: '∞',
    credits: 'Unlimited',
    color: 'from-purple-600 to-pink-500',
    featured: true,
    features: [
      { text: 'Unlimited videos / month', ok: true },
      { text: 'Unlimited credits', ok: true },
      { text: 'Fast + Pro rendering modes', ok: true },
      { text: 'All platform templates', ok: true },
      { text: '35+ AI voices (ElevenLabs)', ok: true },
      { text: 'Auto-captions & subtitles', ok: true },
      { text: 'Voice Cloning', ok: true },
      { text: 'AI Image Generator', ok: true },
      { text: 'Brand Kit (unlimited)', ok: true },
      { text: 'Multi-platform publishing', ok: true },
    ],
  },
  {
    name: 'Business',
    price: 'Free',
    period: '',
    tagline: 'Scale your media business for free',
    videos: '∞',
    credits: 'Unlimited',
    color: 'from-cyan-500 to-blue-600',
    features: [
      { text: 'Unlimited videos / month', ok: true },
      { text: 'Unlimited credits', ok: true },
      { text: 'Fast + Pro + Cinematic modes', ok: true },
      { text: 'All platform templates', ok: true },
      { text: '35+ AI voices (ElevenLabs)', ok: true },
      { text: 'Auto-captions & subtitles', ok: true },
      { text: 'Cinematic rendering', ok: true },
      { text: 'Voice Cloning (unlimited)', ok: true },
      { text: 'AI Image & Video Generator', ok: true },
      { text: 'Brand Kits (unlimited)', ok: true },
      { text: '⚡ Priority rendering queue', ok: true },
      { text: 'Multi-platform publishing', ok: true },
    ],
  },
];

function TierCard({ tier, i }: { tier: typeof tiers[0]; i: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { isLoggedIn, openSignup, openDashboard } = useAppStore();

  const handleCTA = () => {
    if (isLoggedIn) openDashboard();
    else openSignup();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ y: 60, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.7, delay: i * 0.15 }}
    >
      <div className={`tier-card ${tier.featured ? 'featured' : ''} h-full flex flex-col`}>
        {tier.featured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-purple-900/40 whitespace-nowrap">
            ⭐ Most Popular
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-black text-white mb-1">{tier.name}</h3>
          <p className="text-sm text-slate-400 mb-4">{tier.tagline}</p>
          <div className="flex items-end gap-2">
            <span className={`text-5xl font-black bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
              {tier.price}
            </span>
            <span className="text-green-400 font-bold mb-2 text-sm">Forever ✅</span>
          </div>
        </div>

        {/* Video & credit highlights */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.08)' }}>
            <div className="text-2xl font-black text-white">{tier.videos}</div>
            <div className="text-xs text-slate-400">Videos / month</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(6,182,212,0.08)' }}>
            <div className="text-sm font-black text-white">{tier.credits}</div>
            <div className="text-xs text-slate-400">Credits / month</div>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-8 flex-grow">
          {tier.features.map(f => (
            <li key={f.text} className="flex items-start gap-2.5 text-sm text-slate-300">
              <Check size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
              {f.text}
            </li>
          ))}
        </ul>

        <button
          onClick={handleCTA}
          className={`w-full rounded-full py-3 font-bold text-white transition-all duration-200 ${
            tier.featured
              ? 'btn-primary'
              : `bg-gradient-to-r ${tier.color} hover:opacity-90 hover:scale-[1.02]`
          }`}
        >
          <span>Get Started Free →</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="pricing" className="section py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="feature-badge inline-flex mb-4">💳 Pricing</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            100% Free. <span className="neon-text">No Hidden Fees.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every plan is completely free. No credit card. No trial. Just pick your tier and start creating viral videos today.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-green-300"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            ✅ All plans are FREE — Unlimited videos, unlimited credits
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <TierCard key={tier.name} tier={tier} i={i} />
          ))}
        </div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 glass-card p-5 text-center"
        >
          <Zap size={18} className="inline-block mr-2 text-yellow-400" />
          <span className="text-slate-300 text-sm">
            <strong className="text-white">Always free.</strong> Foufou.AI is completely free to use. We believe every creator deserves access to the best AI video tools —
            <strong className="text-green-400"> no subscriptions, no limits, no BS.</strong>
          </span>
        </motion.div>
      </div>
    </section>
  );
}
