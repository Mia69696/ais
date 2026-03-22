import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Zap, Sparkles, Film } from 'lucide-react';

const modes = [
  {
    icon: <Zap size={28} />,
    name: 'Fast',
    tagline: 'Speed above all',
    desc: 'Renders in under 2 minutes. Perfect for bulk content, daily posting schedules, and testing ideas. Lower visual fidelity but maximum output velocity.',
    time: '< 2 min',
    quality: 65,
    speed: 100,
    plan: 'All Plans',
    color: 'from-amber-500 to-yellow-400',
    glow: 'glow-cyan',
  },
  {
    icon: <Sparkles size={28} />,
    name: 'Pro',
    tagline: 'Quality meets speed',
    desc: 'The sweet spot. High-definition visuals, smoother transitions, richer AI voice expression, and detailed caption styling. Renders in 5–8 minutes.',
    time: '5–8 min',
    quality: 85,
    speed: 70,
    plan: 'Creator & Business',
    color: 'from-purple-600 to-pink-500',
    glow: 'glow-purple',
    featured: true,
  },
  {
    icon: <Film size={28} />,
    name: 'Cinematic',
    tagline: 'Hollywood-grade output',
    desc: 'Maximum quality rendering: 4K-optimized visuals, cinematic color grading, spatial audio mixing, and pro-grade motion graphics. For flagship content.',
    time: '15–25 min',
    quality: 100,
    speed: 35,
    plan: 'Business Only',
    color: 'from-blue-600 to-cyan-400',
    glow: 'glow-cyan',
  },
];

export default function VideoModes() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section className="section py-20 px-6 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="feature-badge inline-flex mb-4">🎬 Rendering Engine</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Three Rendering <span className="neon-text">Modes</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose the right engine for every situation — from rapid daily uploads to flagship cinematic pieces.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.name}
              initial={{ y: 50, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              <div className={`tier-card ${mode.featured ? 'featured' : ''} h-full flex flex-col`}>
                {mode.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white mb-5`}>
                  {mode.icon}
                </div>

                <h3 className="text-2xl font-black text-white mb-1">{mode.name}</h3>
                <p className="text-sm font-semibold text-slate-400 mb-4">{mode.tagline}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">{mode.desc}</p>

                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Quality</span><span>{mode.quality}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${mode.quality}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Speed</span><span>{mode.speed}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${mode.speed}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Render time: <strong className="text-white">{mode.time}</strong></span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${mode.color} text-white`}>
                    {mode.plan}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
