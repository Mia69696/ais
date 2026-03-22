import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import TiltCard from './TiltCard';
import {
  Zap, Cpu, Mic2, Image, Film, Scissors,
  LayoutTemplate, SlidersHorizontal, Globe, Star, Trophy,
  MessageSquare, Flame,
} from 'lucide-react';

const featureGroups = [
  {
    id: 'features',
    category: '🎬 AI Video Engine',
    color: 'from-purple-600 to-pink-500',
    items: [
      {
        icon: <Zap size={22} />,
        title: 'Fast / Pro / Cinematic Modes',
        desc: 'Choose your rendering style. Fast for quick content, Pro for polished output, Cinematic for Hollywood-grade quality — available on Creator & Business plans.',
        badge: 'Rendering',
      },
      {
        icon: <LayoutTemplate size={22} />,
        title: 'Niche-Specific Templates',
        desc: 'Pre-built AI templates for YouTube Shorts, Instagram Reels, TikTok, and Story Shorts. Each template is trained on the highest-performing viral formats.',
        badge: 'Templates',
      },
      {
        icon: <Flame size={22} />,
        title: 'Bulk & One-Click Creation',
        desc: 'Drop a single idea or script and the engine handles scenes, voiceover, captions, and music — finished in minutes, not hours.',
        badge: 'Automation',
      },
    ],
  },
  {
    id: 'tools',
    category: '🧠 Content & Ideation',
    color: 'from-cyan-500 to-blue-500',
    items: [
      {
        icon: <Cpu size={22} />,
        title: 'AI Shorts Creator',
        desc: 'Our AI Ideation engine drafts viral-ready scripts with hooks, tension arcs, and CTA patterns pulled from millions of top-performing shorts.',
        badge: 'Scripting',
      },
      {
        icon: <Trophy size={22} />,
        title: 'Video Ranking Tool 🔥',
        desc: 'The secret sauce. Generate "Top List" ranking videos automatically — ranking things best to worst with AI narration, visuals, and music. Currently the #1 trend.',
        badge: 'Trending #1',
      },
      {
        icon: <MessageSquare size={22} />,
        title: 'Video Commentary',
        desc: 'Paste any raw script and the AI converts it into narrated scenes, syncs them with visuals, and adds emotional tone modulation automatically.',
        badge: 'Commentary',
      },
    ],
  },
  {
    id: 'audio',
    category: '🎙️ Audio & Visual AI',
    color: 'from-pink-500 to-rose-500',
    items: [
      {
        icon: <Mic2 size={22} />,
        title: 'Voice Cloning & 35+ AI Voices',
        desc: 'Powered by ElevenLabs. Clone your own voice in seconds or pick from 35+ AI voices. Natural, expressive, and indistinguishable from a real human narrator.',
        badge: 'ElevenLabs',
      },
      {
        icon: <Film size={22} />,
        title: 'Video Transcriber & Subtitles',
        desc: 'Upload any video and get auto-generated captions with precise word-level timing, custom fonts, and multi-language subtitle support in one click.',
        badge: 'Transcription',
      },
      {
        icon: <Image size={22} />,
        title: 'AI Image & Video Generator',
        desc: 'Generate custom thumbnails, scene assets, and full prompt-to-visuals video clips. Turn a text prompt into cinematic visuals without leaving the platform.',
        badge: 'Generative AI',
      },
    ],
  },
  {
    id: 'workflow',
    category: '⚡ Editing & Automation',
    color: 'from-amber-500 to-orange-500',
    items: [
      {
        icon: <Scissors size={22} />,
        title: 'Auto-Clipping & Viral Highlights',
        desc: 'Import from YouTube, TikTok, or Instagram URLs. The AI scans for emotional peaks, loud moments, and retention spikes — then auto-clips the viral gold.',
        badge: 'Smart Clips',
      },
      {
        icon: <SlidersHorizontal size={22} />,
        title: 'Split-Screen Layouts',
        desc: 'Gameplay + face-cam, ASMR + reactions, dual commentary — the multi-visual framing engine boosts average watch time by up to 42% vs. single-frame content.',
        badge: 'Retention',
      },
      {
        icon: <Star size={22} />,
        title: 'Project Timeline Editor',
        desc: 'Full timeline precision: trim, reorder, merge, and polish scenes with frame-level controls. Drag-and-drop simplicity with pro-level output quality.',
        badge: 'Precision',
      },
    ],
  },
  {
    id: 'business',
    category: '🚀 Business & Scaling',
    color: 'from-green-500 to-emerald-500',
    items: [
      {
        icon: <Star size={22} />,
        title: 'Brand Kits',
        desc: 'Upload logos, define color palettes, set fonts, and lock in your visual identity. Every video across multiple theme pages stays on-brand automatically.',
        badge: 'Branding',
      },
      {
        icon: <Zap size={22} />,
        title: 'Priority Rendering Queue',
        desc: 'Business users skip the queue with dedicated rendering nodes. Your videos process first — no waiting, no bottlenecks during peak hours.',
        badge: 'Business Only',
      },
      {
        icon: <Globe size={22} />,
        title: 'Multi-Platform Publishing',
        desc: 'One-click export and direct publishing to YouTube, TikTok, Instagram, and more. Schedule posts, manage accounts, and track performance from one dashboard.',
        badge: 'Publishing',
      },
    ],
  },
];

function FeatureCard({ icon, title, desc, badge, color }: {
  icon: React.ReactNode; title: string; desc: string; badge: string; color: string;
}) {
  return (
    <TiltCard className="glass-card p-6 h-full">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-white text-base leading-snug">{title}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${color} text-white flex-shrink-0 mt-0.5 whitespace-nowrap`}>
          {badge}
        </span>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </TiltCard>
  );
}

function FeatureGroup({ group }: { group: typeof featureGroups[0] }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <div id={group.id} ref={ref} className="mb-20">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{group.category}</h2>
        <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${group.color}`} />
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {group.items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ y: 40, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
          >
            <FeatureCard {...item} color={group.color} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section className="section py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {featureGroups.map(group => (
          <FeatureGroup key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}
