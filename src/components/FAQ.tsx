import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "What is Foufou.AI?",
    a: "Foufou.AI is a global AI video automation platform for content creators and businesses. Paste any URL and Foufou.AI automatically clips, edits, ranks, and publishes viral short-form videos across YouTube, TikTok, and Instagram — completely free.",
  },
  {
    q: 'What is the Video Ranking Tool and why is it trending?',
    a: "The Video Ranking Tool generates 'Top List' style videos that rank items from best to worst — the exact format dominating TikTok, YouTube Shorts, and Instagram Reels in 2025. The AI writes the script, generates visuals, narrates it, and adds music automatically. It's currently the single biggest viral video format on social media.",
  },
  {
    q: 'How does Voice Cloning work?',
    a: 'Foufou.AI uses ElevenLabs technology under the hood. You upload 30 seconds of your voice, the system analyzes your tone, pitch, cadence, and accent, then creates a digital clone. Every video you generate thereafter can use your voice — indistinguishable from a real recording.',
  },
  {
    q: 'Do video limits and credits both apply?',
    a: 'Yes — they are separate systems. Your monthly video limit controls how many complete videos you can export. Credits are consumed by specific AI features: voice generation, image creation, video generation, and transcription. Running out of credits stops those features; running out of videos stops exports.',
  },
  {
    q: 'Can I import content from YouTube or TikTok?',
    a: "Yes. Paste any public YouTube, TikTok, or Instagram URL and the Auto-Clipping tool will import the video, scan it for viral moments using emotional peak detection and audio spike analysis, then generate short-form clips automatically. No downloads needed.",
  },
  {
    q: 'What platforms can I publish to directly?',
    a: 'The multi-platform publisher supports YouTube (Shorts & long-form), TikTok, Instagram (Reels & Stories), and more. Business users get scheduling and batch-publishing features. Creator and above get one-click multi-platform export.',
  },
  {
    q: 'What are Brand Kits?',
    a: "Brand Kits let you define your visual identity: logo, color palette, fonts, and outro style. Once set, every video across all your theme pages uses these settings automatically — no manual styling per video. Creator plan gets 1 kit; Business gets unlimited kits for managing multiple channels.",
  },
  {
    q: 'Is Cinematic mode worth the wait?',
    a: 'For flagship content — absolutely. Cinematic mode produces 4K-optimized visuals, professional color grading, spatial audio, and motion graphic overlays. For daily posting, Fast or Pro is smarter. Think of Cinematic as your "hero video" mode for major launches or channel trailers.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="glass-card overflow-hidden cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="p-5 flex items-start justify-between gap-4">
        <h3 className="text-white font-semibold text-sm leading-snug">{q}</h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 mt-0.5"
        >
          <ChevronDown size={18} className="text-purple-400" />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-purple-900/20 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="faq" className="section py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="feature-badge inline-flex mb-4">❓ FAQ</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Common <span className="neon-text">Questions</span>
          </h2>
          <p className="text-slate-400">Everything you need to know before getting started.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-3"
        >
          {faqs.map(faq => (
            <FAQItem key={faq.q} {...faq} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
