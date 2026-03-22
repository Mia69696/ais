import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Lightbulb, Cpu, Sliders, Rocket } from 'lucide-react';

const steps = [
  {
    icon: <Lightbulb size={28} />,
    step: '01',
    title: 'Drop Your Idea or Script',
    desc: 'Type a topic, paste a script, or let the AI Ideation Engine generate a viral concept for you. Choose your niche template (Shorts, Reels, TikTok, etc.).',
    color: 'from-purple-600 to-pink-500',
  },
  {
    icon: <Cpu size={28} />,
    step: '02',
    title: 'AI Builds Everything',
    desc: 'The engine auto-generates the script, scenes, visuals, voiceover (from your cloned or AI voice), music, captions, and split-screen layouts.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <Sliders size={28} />,
    step: '03',
    title: 'Polish with the Editor',
    desc: 'Open the timeline editor to trim, reorder, swap visuals, adjust voice tone, and fine-tune captions. Optional — most videos need zero editing.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <Rocket size={28} />,
    step: '04',
    title: 'One-Click Publish',
    desc: 'Export to YouTube, TikTok, Instagram, and more simultaneously. Schedule your drops, track views, and watch the algorithm love your content.',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="how-it-works" className="section py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="feature-badge inline-flex mb-4">⚡ The Workflow</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            From <span className="neon-text">Idea</span> to <span className="neon-text-cyan">Viral</span> in 4 Steps
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            No editing skills. No studio. No team. Just you, a prompt, and the most powerful AI video engine on the market.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-600 via-pink-500 to-emerald-500 opacity-20 hidden lg:block" />

          <div className="space-y-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0 }}
                animate={inView ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Card */}
                <div className="flex-1 glass-card p-8">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1 tracking-widest uppercase">Step {s.step}</div>
                      <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Center step circle */}
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center font-black text-white text-lg flex-shrink-0 glow-purple z-10`}>
                  {s.step}
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
