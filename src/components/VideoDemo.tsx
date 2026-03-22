import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play, Trophy, TrendingUp, Zap, Mic2, Scissors } from 'lucide-react';
import { useState } from 'react';

const demos = [
  {
    id: 'ranking',
    icon: <Trophy size={18} />,
    label: 'Video Ranking',
    title: 'Top 10 Best Gaming Chairs in 2025',
    type: 'Top List · AI Narrated · Auto-Generated',
    color: 'from-purple-600 to-pink-500',
    items: ['🥇 Herman Miller Embody', '🥈 Secretlab Titan', '🥉 DXRacer Formula', '4th Razer Iskur'],
    views: '2.4M views',
    badge: '🔥 Trending Format',
  },
  {
    id: 'shorts',
    icon: <Zap size={18} />,
    label: 'YouTube Shorts',
    title: '5 Life Hacks That Actually Work',
    type: 'Shorts · Fast Mode · 60s',
    color: 'from-red-600 to-orange-500',
    items: ['Hook: "You\'ve been doing this wrong..."', 'Scene 1: Trick #1 revealed', 'Scene 2: Trick #2 with reaction', 'CTA: "Follow for more"'],
    views: '890K views',
    badge: '⚡ Fast Mode',
  },
  {
    id: 'asmr',
    icon: <Mic2 size={18} />,
    label: 'Voice Clone',
    title: 'Narrated with YOUR cloned voice',
    type: 'ElevenLabs · Voice Clone · Pro Mode',
    color: 'from-cyan-500 to-blue-600',
    items: ['Upload 30s of your voice', 'AI clones it in seconds', 'Apply to any video type', 'Indistinguishable output'],
    views: '1.1M views',
    badge: '🎙️ Your Voice',
  },
  {
    id: 'clip',
    icon: <Scissors size={18} />,
    label: 'Auto-Clipping',
    title: 'Best Moments from 2h Stream',
    type: 'YouTube Import · Viral Detection · Split-Screen',
    color: 'from-green-500 to-emerald-400',
    items: ['Import stream URL', 'AI detects 8 viral moments', 'Auto-clips generated', 'Published to TikTok & Shorts'],
    views: '567K views',
    badge: '✂️ Smart Clips',
  },
];

export default function VideoDemo() {
  const [active, setActive] = useState('ranking');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const demo = demos.find(d => d.id === active)!;

  return (
    <section className="section py-20 px-6 bg-gradient-to-b from-transparent via-pink-950/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="feature-badge inline-flex mb-4">🎥 Live Demo</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            See the AI <span className="neon-text">in Action</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Explore the different video types Foufou.AI can generate in minutes.
          </p>
        </motion.div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {demos.map(d => (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                active === d.id
                  ? `bg-gradient-to-r ${d.color} text-white shadow-lg`
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {d.icon}{d.label}
            </button>
          ))}
        </motion.div>

        {/* Demo panel */}
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-2 gap-8 items-center"
        >
          {/* Mock video player */}
          <div className="video-mock aspect-[9/16] max-w-xs mx-auto lg:mx-0 w-full relative">
            <div className="video-scanline" />
            {/* Fake video content */}
            <div className={`absolute inset-0 bg-gradient-to-b ${demo.color} opacity-20`} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${demo.color} flex items-center justify-center`}>
                {demo.icon}
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm mb-1">{demo.title}</div>
                <div className="text-slate-400 text-xs">{demo.type}</div>
              </div>
              {/* Fake waveform */}
              <div className="flex items-end gap-1 h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full bg-gradient-to-t ${demo.color}`}
                    style={{
                      height: `${20 + Math.sin(i * 0.8) * 14 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.05}s`,
                      animation: 'pulseDot 1.2s ease-in-out infinite',
                    }}
                  />
                ))}
              </div>
              {/* Play button */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${demo.color} flex items-center justify-center glow-purple cursor-pointer`}>
                <Play size={20} className="text-white ml-1" />
              </div>
            </div>
            {/* Views badge */}
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={11} /> {demo.views}
            </div>
            {/* Badge */}
            <div className="absolute bottom-3 left-3 right-3">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${demo.color} text-white`}>
                {demo.badge}
              </span>
            </div>
          </div>

          {/* Info panel */}
          <div>
            <div className="feature-badge mb-4">{demo.badge}</div>
            <h3 className="text-2xl font-black text-white mb-2">{demo.title}</h3>
            <p className="text-slate-400 text-sm mb-6">{demo.type}</p>

            <div className="space-y-3 mb-8">
              {demo.items.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 glass-card p-3"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${demo.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {i + 1}
                  </div>
                  <span className="text-slate-300 text-sm">{item}</span>
                </motion.div>
              ))}
            </div>

            <button className="btn-primary">
              <span className="flex items-center gap-2">
                <Zap size={16} /> Generate This Type Now
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
