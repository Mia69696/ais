import { motion } from 'framer-motion';
import CountUp from './CountUp';
import { useInView } from 'react-intersection-observer';

const stats = [
  { value: 500000, suffix: '+', label: 'Videos Created' },
  { value: 35, suffix: '+', label: 'AI Voice Clones' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
  { value: 4, suffix: ' Platforms', label: 'Auto-Published To' },
  { value: 200, suffix: '/mo', label: 'Max Videos (Business)' },
];

const platforms = [
  '🎬 YouTube Shorts', '🎵 TikTok', '📸 Instagram Reels', '📖 Story Shorts',
  '🤖 AI Scripting', '🏆 Video Ranking', '🎙️ Voice Cloning', '✂️ Auto-Clipping',
  '🎬 YouTube Shorts', '🎵 TikTok', '📸 Instagram Reels', '📖 Story Shorts',
  '🤖 AI Scripting', '🏆 Video Ranking', '🎙️ Voice Cloning', '✂️ Auto-Clipping',
];

export default function StatsBar() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="section py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Animated Stats */}
        <motion.div
          ref={ref}
          initial={{ y: 40, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="glass-card p-8 mb-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-3xl font-black mb-1">
                  <CountUp end={s.value} suffix={s.suffix} duration={1800} />
                </div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ticker */}
        <div className="ticker-wrap py-3 border border-purple-900/20 rounded-full bg-purple-900/5">
          <div className="ticker-track">
            {platforms.map((p, i) => (
              <span key={i} className="mx-8 text-sm text-slate-400 font-medium">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
