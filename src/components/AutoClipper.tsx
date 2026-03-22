import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Scissors, Link, Youtube, Music, Camera, Loader2, Zap, TrendingUp, Clock, Star, Trash2, Download, ChevronRight, AlertCircle } from 'lucide-react';
import { useAppStore, ClipJob } from '../store/appStore';

function PlatformIcon({ platform }: { platform: ClipJob['platform'] }) {
  if (platform === 'youtube') return <Youtube size={18} className="text-red-400" />;
  if (platform === 'tiktok') return <Music size={18} className="text-pink-400" />;
  if (platform === 'instagram') return <Camera size={18} className="text-purple-400" />;
  return <Link size={18} className="text-slate-400" />;
}

function StatusBadge({ status }: { status: ClipJob['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    queued: { label: 'Queued', cls: 'bg-slate-700 text-slate-300' },
    analyzing: { label: '🔍 Analyzing...', cls: 'bg-blue-900/50 text-blue-300' },
    clipping: { label: '✂️ Clipping...', cls: 'bg-purple-900/50 text-purple-300' },
    done: { label: '✅ Done', cls: 'bg-green-900/50 text-green-300' },
    error: { label: '❌ Error', cls: 'bg-red-900/50 text-red-300' },
  };
  const s = map[status] || map.queued;
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.cls}`}>{s.label}</span>;
}

function ClipCard({ clip }: { clip: import('../store/appStore').GeneratedClip }) {
  const [dl, setDl] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-4 relative overflow-hidden cursor-pointer group"
      style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${clip.color} opacity-5`} />
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-sm font-bold text-white">{clip.label}</div>
          <div className="text-xs text-slate-400 mt-0.5">{clip.tag}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-sm font-black bg-gradient-to-r ${clip.color} bg-clip-text text-transparent`}>{clip.score}%</div>
          <div className="text-xs text-slate-500">viral score</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={11} />
          {clip.duration}
        </div>
        <button
          onClick={() => { setDl(true); setTimeout(() => setDl(false), 1500); }}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${dl ? 'bg-green-600 text-white' : 'bg-white/5 hover:bg-purple-600/30 text-slate-400 hover:text-white'}`}
        >
          {dl ? '✓ Saved' : <><Download size={11} /> Export</>}
        </button>
      </div>
    </motion.div>
  );
}

function JobCard({ job }: { job: ClipJob }) {
  const { clearClipJob } = useAppStore();
  const [expanded, setExpanded] = useState(job.status === 'done');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(13,13,31,0.85)', border: '1px solid rgba(168,85,247,0.2)' }}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(168,85,247,0.15)' }}>
          {job.thumb}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <PlatformIcon platform={job.platform} />
            <span className="text-sm font-bold text-white truncate">{job.title}</span>
          </div>
          <div className="text-xs text-slate-500 truncate">{job.url}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={job.status} />
          {job.status === 'done' && (
            <button onClick={() => setExpanded(v => !v)} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}
          <button onClick={() => clearClipJob(job.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Progress */}
      {(job.status === 'analyzing' || job.status === 'clipping' || job.status === 'queued') && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{job.status === 'analyzing' ? '🔍 Scanning for viral moments...' : job.status === 'clipping' ? '✂️ Generating clips...' : '⏳ In queue...'}</span>
            <span>{job.progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}
              initial={{ width: 0 }}
              animate={{ width: `${job.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {job.status === 'analyzing' && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {['Detecting scenes', 'AI scoring', 'Finding hooks'].map((s, i) => (
                <div key={s} className="text-center p-2 rounded-lg" style={{ background: 'rgba(168,85,247,0.07)' }}>
                  <Loader2 size={14} className="animate-spin mx-auto mb-1 text-purple-400" style={{ animationDelay: `${i * 0.2}s` }} />
                  <div className="text-xs text-slate-500">{s}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clips */}
      <AnimatePresence>
        {job.status === 'done' && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-green-400" />
                <span className="text-sm font-bold text-white">{job.clips.length} Viral Clips Found</span>
                <span className="text-xs text-slate-500">— sorted by viral score</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {job.clips.sort((a, b) => b.score - a.score).map(clip => (
                  <ClipCard key={clip.id} clip={clip} />
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                  <Download size={14} />
                  <span>Export All {job.clips.length} Clips</span>
                </button>
                <button className="px-4 rounded-full text-sm font-semibold transition-all hover:bg-purple-900/30 text-purple-400 border border-purple-700/40">
                  <Star size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UrlValidator(url: string) {
  try { new URL(url); return true; } catch { return false; }
}

function isVideoOrChannelUrl(url: string) {
  return url.includes('youtube.com') || url.includes('youtu.be') ||
    url.includes('tiktok.com') || url.includes('instagram.com') ||
    url.startsWith('http');
}

export default function AutoClipper() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { clipJobs, submitClipJob, isLoggedIn, openLogin } = useAppStore();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { openLogin(); return; }
    const trimmed = url.trim();
    if (!trimmed) { setError('Please enter a URL.'); return; }
    if (!UrlValidator(trimmed) || !isVideoOrChannelUrl(trimmed)) {
      setError('Please enter a valid YouTube, TikTok, or Instagram URL.');
      return;
    }
    setError('');
    setLoading(true);
    submitClipJob(trimmed, { autoEdit: true, autoRank: true, autoPublish: false, publishTargets: [] });
    setUrl('');
    setTimeout(() => setLoading(false), 500);
  };

  const platformExamples = [
    { label: 'YouTube Video', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', icon: '▶️' },
    { label: 'YouTube Channel', url: 'https://youtube.com/@mkbhd', icon: '📺' },
    { label: 'TikTok Video', url: 'https://tiktok.com/@user/video/123456', icon: '🎵' },
    { label: 'Instagram Reel', url: 'https://instagram.com/reel/abc123', icon: '📸' },
  ];

  return (
    <section id="auto-clipper" className="section py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ y: 30, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="feature-badge inline-flex mb-4">
            <Scissors size={12} />
            AI Auto-Clipper
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Paste Any URL →{' '}
            <span className="neon-text">Get Viral Clips</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Drop a YouTube video, channel, TikTok, or Instagram URL. Our AI scans every second, scores viral moments, and exports ready-to-post clips automatically.
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-6"
        >
          <form onSubmit={handleSubmit}>
            <div className="relative border-glow-anim p-0.5 rounded-2xl">
              <div className="relative rounded-2xl overflow-hidden" style={{ background: 'rgba(10,10,25,0.95)' }}>
                <div className="flex items-center">
                  <div className="pl-5 pr-3 flex-shrink-0">
                    <Link size={20} className="text-purple-400" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={e => { setUrl(e.target.value); setError(''); }}
                    placeholder="Paste YouTube, TikTok, or Instagram URL here..."
                    className="flex-grow py-5 pr-4 bg-transparent text-white placeholder-slate-500 text-base outline-none"
                  />
                  <div className="p-2 pr-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary py-3 px-6 text-sm flex items-center gap-2 disabled:opacity-60 whitespace-nowrap"
                    >
                      {loading
                        ? <><Loader2 size={16} className="animate-spin" /><span>Processing...</span></>
                        : <><Zap size={16} /><span>Auto-Clip</span></>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl"
              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}

          {/* Quick examples */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {platformExamples.map(ex => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setUrl(ex.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white transition-all hover:border-purple-500/60"
                style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}
              >
                <span>{ex.icon}</span>
                {ex.label}
              </button>
            ))}
          </div>

          {!isLoggedIn && (
            <p className="text-center text-xs text-slate-500 mt-3">
              🔒 <button onClick={openLogin} className="text-purple-400 hover:text-purple-300 underline">Log in free</button> to start clipping
            </p>
          )}
        </motion.div>

        {/* How it works mini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: '🔗', step: '1', label: 'Paste URL', desc: 'YouTube, TikTok, Instagram' },
            { icon: '🤖', step: '2', label: 'AI Analyzes', desc: 'Scores every moment' },
            { icon: '✂️', step: '3', label: 'Get Clips', desc: 'Viral-ready exports' },
          ].map(s => (
            <div key={s.step} className="text-center p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xs text-purple-400 font-bold mb-0.5">Step {s.step}</div>
              <div className="text-sm font-bold text-white mb-1">{s.label}</div>
              <div className="text-xs text-slate-500">{s.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Job list */}
        <AnimatePresence>
          {clipJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Scissors size={16} className="text-purple-400" />
                <h3 className="text-lg font-bold text-white">Clip Jobs</h3>
                <span className="text-xs text-slate-500">({clipJobs.length})</span>
              </div>
              {clipJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo info box */}
        {clipJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center py-12 rounded-2xl"
            style={{ background: 'rgba(168,85,247,0.04)', border: '1px dashed rgba(168,85,247,0.2)' }}
          >
            <Scissors size={40} className="mx-auto text-purple-800 mb-4" />
            <p className="text-slate-500 text-sm">No clip jobs yet. Paste a URL above to get started.</p>
            <p className="text-slate-600 text-xs mt-2">Supports YouTube videos & channels · TikTok · Instagram</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
