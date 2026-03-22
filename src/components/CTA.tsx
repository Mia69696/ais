import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Zap, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function CTA() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { isLoggedIn, openSignup, openDashboard } = useAppStore();

  return (
    <section className="section py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          ref={ref}
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={inView ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="border-glow-anim relative rounded-3xl overflow-hidden"
        >
          <div className="relative z-10 p-1 rounded-3xl">
            <div className="glass-card rounded-2xl p-14" style={{ background: 'rgba(13,13,31,0.95)' }}>
              {/* Decorative blobs */}
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="text-5xl mb-6">🚀</div>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
                  Start <span className="neon-text">Automating</span> Your
                  <br />
                  <span className="neon-text-cyan">Viral Content</span> Today
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
                  Join 50,000+ creators and businesses using Foufou.AI to generate viral videos 10× faster.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-green-300 mb-10"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  ✅ Completely FREE — No credit card, no limits, no BS
                </div>

                <div className="flex flex-wrap gap-4 justify-center mb-8">
                  <button
                    onClick={isLoggedIn ? openDashboard : openSignup}
                    className="btn-primary text-base px-8 py-4"
                  >
                    <span className="flex items-center gap-2">
                      <Zap size={18} />
                      {isLoggedIn ? 'Open Dashboard' : 'Start Free — $0 Forever'}
                    </span>
                  </button>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-outline text-base px-8 py-4 flex items-center gap-2"
                  >
                    View All Features <ArrowRight size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                  {['✅ Free forever', '✅ No credit card', '✅ Unlimited videos', '✅ Instant access'].map(t => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
