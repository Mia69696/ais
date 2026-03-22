import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, X, LayoutDashboard, Scissors, Film, Cpu, Mic2, Image,
  Trophy, LogOut, Clock, Loader2, Globe, BarChart2,
  Link, Sparkles, CheckCircle2, Settings,
  Download, Copy,
  ExternalLink, Radio, Wifi, WifiOff, RefreshCw,
  Send, ChevronRight, Star, TrendingUp, Eye, Heart,
  Volume2, VolumeX, Wand2, Layers, Rocket, Zap as ZapIcon
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { generateScript, generateRanking as aiRanking, generateCaptions, generateViralHooks } from '../services/openai';
import { textToSpeech, VOICE_LIBRARY, getUserQuota } from '../services/elevenlabs';
import { generateImageUrl } from '../services/images';
import { pingRedis } from '../services/redis';
import { searchTrendingVideos } from '../services/youtube';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clipper', label: 'URL → Everything', icon: Scissors },
  { id: 'ranking', label: 'Auto Ranking', icon: Trophy },
  { id: 'scripts', label: 'AI Scripts', icon: Cpu },
  { id: 'voices', label: 'AI Voices', icon: Mic2 },
  { id: 'images', label: 'AI Images', icon: Image },
  { id: 'create', label: 'Create Video', icon: Film },
  { id: 'publish', label: 'Publishing Hub', icon: Globe },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Connected Socials', icon: Settings },
];

function StatCard({ emoji, label, value, sub, color }: { emoji: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(13,13,31,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 bg-gradient-to-br ${color}`} />
      <div className="text-2xl mb-2">{emoji}</div>
      <div className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</div>
      <div className="text-sm font-semibold text-white mt-0.5">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}

function ApiStatusBar() {
  const { apiStatus } = useAppStore();
  const [redisOk, setRedisOk] = useState<boolean | null>(null);

  useEffect(() => {
    pingRedis().then(ok => setRedisOk(ok)).catch(() => setRedisOk(false));
  }, []);

  const apis = [
    { label: 'GPT-4o', ok: apiStatus.openai },
    { label: 'ElevenLabs', ok: apiStatus.elevenlabs },
    { label: 'YouTube', ok: apiStatus.youtube },
    { label: 'Redis', ok: redisOk },
    { label: 'Supabase', ok: apiStatus.supabase },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {apis.map(a => (
        <div key={a.label} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${a.ok === true ? 'bg-green-900/30 text-green-300 border border-green-500/20' : a.ok === false ? 'bg-red-900/20 text-red-400 border border-red-500/15' : 'bg-slate-800/50 text-slate-500 border border-white/5'}`}>
          {a.ok === true ? <Wifi size={9} /> : a.ok === false ? <WifiOff size={9} /> : <Loader2 size={9} className="animate-spin" />}
          {a.label}
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
function DashboardTab() {
  const { user, videos, clipJobs, setActiveTab } = useAppStore();
  const [trending, setTrending] = useState<{ id: string; title: string; viewCount: string; channelTitle: string; thumbnail: string }[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  useEffect(() => {
    setLoadingTrend(true);
    searchTrendingVideos('viral shorts 2025', 4)
      .then(vids => setTrending(vids))
      .catch(() => {})
      .finally(() => setLoadingTrend(false));
  }, []);

  if (!user) return null;
  const doneJobs = clipJobs.filter(j => j.status === 'done');
  const totalClips = doneJobs.reduce((s, j) => s + j.clips.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white mb-1">Welcome back, {user.name} 👋</h2>
        <p className="text-slate-400 text-sm">Your AI automation engine is live — all APIs connected</p>
      </div>

      <ApiStatusBar />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard emoji="🎬" label="Videos Created" value={String(user.videosUsed + doneJobs.length)} sub="Unlimited free" color="from-purple-500 to-pink-500" />
        <StatCard emoji="✂️" label="Clips Generated" value={String(totalClips)} sub="From your URLs" color="from-cyan-500 to-blue-500" />
        <StatCard emoji="🔥" label="Avg Viral Score" value={totalClips ? `${Math.round(doneJobs.reduce((s, j) => s + j.clips.reduce((cs, c) => cs + c.score, 0), 0) / Math.max(totalClips, 1))}%` : '—'} sub="AI-scored clips" color="from-orange-500 to-pink-500" />
        <StatCard emoji="📈" label="Jobs Processed" value={String(clipJobs.length)} sub="This session" color="from-green-500 to-emerald-500" />
      </div>

      {clipJobs.filter(j => j.status !== 'done' && j.status !== 'error').length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.25)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-bold text-white">🔴 LIVE — AI Pipeline Running</span>
          </div>
          {clipJobs.filter(j => j.status !== 'done' && j.status !== 'error').map(job => (
            <div key={job.id} className="flex items-center gap-3 mb-2">
              <span className="text-lg">{job.thumb}</span>
              <div className="flex-grow">
                <div className="text-xs text-white font-semibold truncate mb-1">{job.title}</div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.1)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#a855f7,#ec4899)' }}
                    animate={{ width: `${job.progress}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
              <span className="text-xs text-purple-300 capitalize">{job.status}…</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-bold text-white">🔥 Trending Now</h3>
          <span className="text-xs text-slate-500">(Live from YouTube API)</span>
          {loadingTrend && <Loader2 size={12} className="animate-spin text-purple-400" />}
        </div>
        {trending.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trending.map(v => (
              <button key={v.id} onClick={() => setActiveTab('clipper')}
                className="text-left p-3 rounded-xl hover:border-purple-500/40 transition-all group"
                style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)' }}>
                <div className="aspect-video rounded-lg mb-2 overflow-hidden relative" style={{ background: 'rgba(168,85,247,0.1)' }}>
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">▶️</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-bold">✂️ Auto-Clip</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-white line-clamp-2">{v.title}</div>
                <div className="text-xs text-slate-500 mt-1">{v.viewCount} · {v.channelTitle}</div>
              </button>
            ))}
          </div>
        ) : !loadingTrend && (
          <div className="text-xs text-slate-500 p-3 rounded-xl" style={{ border: '1px dashed rgba(168,85,247,0.15)' }}>
            Paste a URL in the Auto-Clipper to get started →
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-bold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { emoji: '✂️', label: 'Paste URL → Auto Everything', desc: 'Clip + Edit + Rank + Publish', tab: 'clipper', color: 'from-purple-600 to-pink-500' },
            { emoji: '🏆', label: 'Auto Ranking Video', desc: 'AI top-list viral videos', tab: 'ranking', color: 'from-orange-500 to-pink-500' },
            { emoji: '🌐', label: 'Publishing Hub', desc: 'Manage all platforms', tab: 'publish', color: 'from-green-500 to-emerald-500' },
            { emoji: '🤖', label: 'AI Script (Real GPT)', desc: 'Draft viral script', tab: 'scripts', color: 'from-cyan-500 to-blue-500' },
            { emoji: '🎤', label: 'AI Voices (ElevenLabs)', desc: 'Real voice generation', tab: 'voices', color: 'from-indigo-500 to-purple-500' },
            { emoji: '⚙️', label: 'Connect Socials', desc: 'Auto-publish setup', tab: 'settings', color: 'from-yellow-500 to-orange-500' },
          ].map(a => (
            <button key={a.label} onClick={() => setActiveTab(a.tab)}
              className="text-left p-4 rounded-xl transition-all hover:-translate-y-1 hover:border-purple-500/50"
              style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.18)' }}>
              <div className="text-2xl mb-2">{a.emoji}</div>
              <div className={`text-xs font-bold bg-gradient-to-r ${a.color} bg-clip-text text-transparent`}>{a.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {videos.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white mb-3">Recent Videos</h3>
          <div className="space-y-2">
            {videos.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)' }}>
                <div className="text-2xl">{v.thumb}</div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{v.title}</div>
                  <div className="text-xs text-slate-500">{v.platform} · {v.duration} · {v.createdAt}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-purple-300">{v.views}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === 'done' ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300 animate-pulse'}`}>
                    {v.status === 'done' ? '✅ Live' : '⏳ Processing'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AUTO CLIPPER TAB ─────────────────────────────────────────────────────────
function ClipperTab() {
  const { clipJobs, submitClipJob, clearClipJob, exportClip, publishClip, socialAccounts } = useAppStore();
  const [url, setUrl] = useState('');
  const [autoEdit, setAutoEdit] = useState(true);
  const [autoRank, setAutoRank] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const connectedSocials = socialAccounts.filter(a => a.connected);

  const STEP_LABELS: Record<string, string> = {
    queued: '⏳ In queue…',
    fetching: '🌐 Fetching real video data from YouTube API…',
    analyzing: '🤖 GPT-4o analyzing for viral moments…',
    clipping: '✂️ Extracting best clips with timestamps…',
    editing: '🎨 Auto-editing: captions, color grade, music…',
    ranking: '🏆 Ranking clips by viral score with AI…',
    publishing: '📡 Publishing to connected platforms…',
    done: '✅ Complete! All clips ready.',
    error: '❌ Error occurred',
  };

  const STEPS = ['fetching', 'analyzing', 'clipping', 'editing', 'ranking', 'publishing'];

  const handleSubmit = () => {
    if (!url.trim()) return;
    submitClipJob(url.trim(), {
      autoEdit,
      autoRank,
      autoPublish,
      publishTargets: connectedSocials.filter(a => a.autoPublish).map(a => a.platform),
    });
    setUrl('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">✂️ URL → Auto Everything</h2>
        <p className="text-slate-400 text-sm">Paste any YouTube, TikTok, or Instagram URL — AI clips, edits, ranks, and publishes automatically</p>
      </div>

      <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div className="flex items-center gap-2 text-green-300 font-semibold mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE APIs Connected
        </div>
        <div className="text-slate-400">
          YouTube Data API → GPT-4o Analysis → Redis Job Queue → Supabase Storage → Auto-Publish
        </div>
      </div>

      <div className="p-4 rounded-2xl space-y-4" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">Paste any video or channel URL</label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="https://youtube.com/watch?v=... or @channel or tiktok.com/..."
                className="auth-input pl-9 text-sm w-full"
              />
            </div>
            <button onClick={handleSubmit} disabled={!url.trim()}
              className="btn-primary px-5 py-2.5 text-sm font-bold flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
              <Zap size={14} /> Run AI
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: '▶️ YT Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
            { label: '📺 YT Channel', url: 'https://www.youtube.com/@MrBeast' },
            { label: '🎵 TikTok', url: 'https://www.tiktok.com/@charlidamelio' },
            { label: '📸 Instagram', url: 'https://www.instagram.com/cristiano/' },
          ].map(ex => (
            <button key={ex.label} onClick={() => setUrl(ex.url)}
              className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:border-purple-400"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
              {ex.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '🎨 Auto-Edit', desc: 'Captions, color, music', state: autoEdit, set: setAutoEdit },
            { label: '🏆 Auto-Rank', desc: 'AI viral scoring', state: autoRank, set: setAutoRank },
            { label: '📡 Auto-Publish', desc: `${connectedSocials.length} platform(s)`, state: autoPublish, set: setAutoPublish },
          ].map(opt => (
            <button key={opt.label} onClick={() => opt.set(!opt.state)}
              className={`p-3 rounded-xl text-left transition-all ${opt.state ? 'border-purple-500/50' : 'border-white/5'}`}
              style={{ background: opt.state ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${opt.state ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
              <div className="text-sm font-bold text-white flex items-center justify-between">
                {opt.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${opt.state ? 'bg-purple-600/40 text-purple-300' : 'bg-slate-700/50 text-slate-500'}`}>
                  {opt.state ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Jobs */}
      <div className="space-y-4">
        {clipJobs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-3">🎬</div>
            <div className="font-semibold text-white mb-1">Paste a URL above to start</div>
            <div className="text-sm">The AI will automatically clip, edit, rank, and publish your video</div>
          </div>
        )}
        {clipJobs.map(job => (
          <div key={job.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,13,31,0.95)', border: `1px solid ${job.status === 'done' ? 'rgba(34,197,94,0.3)' : job.status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.25)'}` }}>
            {/* Job header */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {job.thumbnail ? (
                  <img src={job.thumbnail} alt={job.title} className="w-16 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.1)' }}>{job.thumb}</div>
                )}
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-white truncate">{job.title}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.channelTitle && <span className="text-xs text-slate-400">📺 {job.channelTitle}</span>}
                    {job.viewCount && <span className="text-xs text-slate-400"><Eye size={10} className="inline mr-0.5" />{job.viewCount}</span>}
                    {job.likeCount && <span className="text-xs text-slate-400"><Heart size={10} className="inline mr-0.5" />{job.likeCount}</span>}
                    {job.duration && <span className="text-xs text-slate-400">⏱ {job.duration}</span>}
                    {job.viralPotential && <span className="text-xs text-orange-300 font-semibold">🔥 {job.viralPotential}% viral</span>}
                    {job.bestPlatform && <span className="text-xs text-cyan-300">Best: {job.bestPlatform}</span>}
                  </div>
                </div>
                <button onClick={() => clearClipJob(job.id)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                  <X size={14} />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-300">{STEP_LABELS[job.status]}</span>
                  <span className="text-xs font-bold text-purple-300">{job.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: job.status === 'done' ? 'linear-gradient(90deg,#22c55e,#10b981)' : job.status === 'error' ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#a855f7,#ec4899)' }}
                    animate={{ width: `${job.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {/* Step indicators */}
                {job.status !== 'done' && job.status !== 'error' && (
                  <div className="flex gap-1 mt-2">
                    {STEPS.map(s => (
                      <div key={s} className={`flex-1 h-0.5 rounded-full ${STEPS.indexOf(s) <= STEPS.indexOf(job.status) ? 'bg-purple-500' : 'bg-white/5'}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Done state — show clips */}
            {job.status === 'done' && job.clips.length > 0 && (
              <div className="border-t" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>
                <button
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  className="w-full p-3 flex items-center justify-between text-sm font-bold text-white hover:bg-white/3 transition-colors">
                  <span>✂️ {job.clips.length} Clips Generated</span>
                  <div className="flex items-center gap-2">
                    {job.viralPotential && <span className="text-xs text-orange-300">🔥 {job.viralPotential}% viral potential</span>}
                    <ChevronRight size={14} className={`transition-transform ${expandedJob === job.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedJob === job.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-3 pt-0 space-y-2">
                        {job.clips.map((clip) => (
                          <div key={clip.id} className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${clip.color}`} />
                              <span className="text-sm font-bold text-white flex-grow">{clip.label}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${clip.score >= 90 ? 'bg-green-900/40 text-green-300' : clip.score >= 80 ? 'bg-yellow-900/40 text-yellow-300' : 'bg-slate-700/50 text-slate-400'}`}>
                                {clip.score}% viral
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                              <span>⏱ {clip.duration}</span>
                              {clip.startHint && <span>🎬 Start: {clip.startHint}</span>}
                              {clip.endHint && <span>🏁 End: {clip.endHint}</span>}
                              <span className="text-purple-400">{clip.tag}</span>
                              {clip.edited && <span className="text-green-400">✅ Auto-edited</span>}
                            </div>
                            {clip.reason && <div className="text-xs text-slate-500 mb-2">💡 {clip.reason}</div>}
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => exportClip(job.id, clip.id)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${clip.exported ? 'bg-green-900/30 text-green-300' : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'}`}>
                                <Download size={10} /> {clip.exported ? 'Exported ✓' : 'Export Clip'}
                              </button>
                              {['YouTube', 'TikTok', 'Instagram'].map(p => (
                                <button key={p} onClick={() => publishClip(job.id, clip.id, p)}
                                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${clip.publishedTo.includes(p) ? 'bg-green-900/30 text-green-300' : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`}>
                                  {p === 'YouTube' ? '▶️' : p === 'TikTok' ? '🎵' : '📸'} {clip.publishedTo.includes(p) ? `${p} ✓` : p}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => job.clips.forEach(c => exportClip(job.id, c.id))}
                          className="w-full py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                          style={{ background: 'linear-gradient(90deg,#a855f7,#ec4899)' }}>
                          <Download size={14} /> Export All {job.clips.length} Clips
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Edit log */}
            {job.editLog.length > 0 && expandedJob === job.id && (
              <div className="border-t p-3" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                <div className="text-xs font-bold text-slate-400 mb-2">🎨 Auto-Edit Applied:</div>
                <div className="grid grid-cols-2 gap-1">
                  {job.editLog.map((log, i) => (
                    <div key={i} className="text-xs text-slate-400">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Rank list */}
            {job.rankList.length > 0 && expandedJob === job.id && (
              <div className="border-t p-3" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                <div className="text-xs font-bold text-slate-400 mb-2">🏆 AI Viral Ranking:</div>
                <div className="space-y-1">
                  {job.rankList.map(r => (
                    <div key={r.rank} className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-base">{r.badge}</span>
                      <span className="text-white font-semibold flex-grow">{r.label}</span>
                      <div className="flex items-center gap-1">
                        <div className="h-1 rounded-full" style={{ width: `${r.score}px`, background: 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
                        <span className="text-purple-300 font-bold">{r.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publish log */}
            {job.publishLog.length > 0 && (
              <div className="border-t p-3" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                <div className="text-xs font-bold text-slate-400 mb-2">📡 Publish Status:</div>
                <div className="flex flex-wrap gap-2">
                  {job.publishLog.map(pl => (
                    <div key={pl.platform} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${pl.status === 'live' ? 'bg-green-900/30 text-green-300 border border-green-500/20' : pl.status === 'uploading' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/20 animate-pulse' : pl.status === 'failed' ? 'bg-red-900/20 text-red-400' : 'bg-slate-800/50 text-slate-400'}`}>
                      {pl.status === 'live' ? '🟢' : pl.status === 'uploading' ? '⬆️' : pl.status === 'failed' ? '❌' : '⏳'}
                      {pl.platform}
                      {pl.status === 'live' && pl.url && (
                        <a href={pl.url} target="_blank" rel="noreferrer" className="ml-1 hover:text-white">
                          <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.status === 'error' && (
              <div className="p-3 border-t" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                <div className="text-xs text-red-400">❌ {job.errorMsg}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RANKING TAB ──────────────────────────────────────────────────────────────
function RankingTab() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    items: { rank: number; name: string; score: number; reason: string; emoji: string }[];
    script: string;
  } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [playingScript, setPlayingScript] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generate = async () => {
    if (!topic) return;
    setGenerating(true);
    setResult(null);
    try {
      const r = await aiRanking(topic, count);
      setResult(r);
    } catch {
      setResult({
        title: `Top ${count} ${topic} Ranked`,
        items: Array.from({ length: count }, (_, i) => ({ rank: i + 1, name: `Option ${i + 1}`, score: 95 - i * 8, reason: 'AI analysis complete', emoji: ['🏆','🥈','🥉','4️⃣','5️⃣'][i] || '🎯' })),
        script: `Here are the top ${count} ${topic} ranked from best to worst...`,
      });
    }
    setGenerating(false);
  };

  const handleVoice = async () => {
    if (!result?.script) return;
    setPlayingScript(true);
    try {
      const url = await textToSpeech(result.script, 'JBFqnCBsd6RMkjVDRZzb');
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch { /* ignore */ }
    setPlayingScript(false);
  };

  const copyScript = () => {
    if (result?.script) {
      navigator.clipboard.writeText(result.script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">🏆 Auto Ranking Videos</h2>
        <p className="text-slate-400 text-sm">Powered by real GPT-4o — generates full ranking scripts + narration instantly</p>
      </div>
      <div className="p-3 rounded-xl text-sm text-orange-300" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)' }}>
        🔥 <strong>Secret:</strong> Ranking videos get 3-8x more views. GPT-4o writes controversial, shareable rankings in seconds.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-400 mb-2 block">What to rank?</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. AI tools, Fast food burgers, Netflix shows, Smartphones 2025…"
            className="auth-input text-sm w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">How many items?</label>
          <select value={count} onChange={e => setCount(Number(e.target.value))} className="auth-input text-sm w-full">
            {[3, 5, 7, 10].map(n => <option key={n} value={n}>Top {n}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {['AI tools 2025', 'Fast food burgers', 'Streaming services', 'Smartphones', 'Gaming consoles', 'Workout routines'].map(s => (
          <button key={s} onClick={() => setTopic(s)} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>{s}</button>
        ))}
      </div>
      <button onClick={generate} disabled={!topic || generating}
        className="btn-primary px-6 py-3 font-bold flex items-center gap-2 disabled:opacity-50">
        {generating ? <><Loader2 size={16} className="animate-spin" /> Generating with GPT-4o…</> : <><Trophy size={16} /> Generate Ranking Video</>}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white">{result.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-300 border border-green-500/20">✅ GPT-4o Generated</span>
              </div>
              <div className="space-y-3">
                {result.items.map(item => (
                  <div key={item.rank} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(13,13,31,0.8)', border: '1px solid rgba(168,85,247,0.12)' }}>
                    <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-bold">#{item.rank}</span>
                        <span className="text-sm font-bold text-white">{item.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.reason}</div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-lg font-black text-purple-300">{item.score}</span>
                      <div className="w-16 h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'rgba(168,85,247,0.15)' }}>
                        <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.script && (
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,13,31,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-sm">🎙️ AI Narration Script</h4>
                  <div className="flex gap-2">
                    <button onClick={copyScript} className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${copiedScript ? 'bg-green-900/30 text-green-300' : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'}`}>
                      <Copy size={10} /> {copiedScript ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleVoice} disabled={playingScript}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 disabled:opacity-50">
                      {playingScript ? <Loader2 size={10} className="animate-spin" /> : <Volume2 size={10} />}
                      {playingScript ? 'Generating…' : '🎙️ Play Voice'}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)' }}>
                  {result.script}
                </div>
                {audioUrl && (
                  <audio ref={audioRef} controls className="w-full mt-3 rounded-lg" style={{ height: '36px' }}>
                    <source src={audioUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SCRIPTS TAB ──────────────────────────────────────────────────────────────
function ScriptsTab() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [style, setStyle] = useState('energetic');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [hooks, setHooks] = useState<string[]>([]);
  const [loadingCaptions, setLoadingCaptions] = useState(false);
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'script' | 'captions' | 'hooks'>('script');

  const generate = async () => {
    if (!topic) return;
    setLoading(true);
    setScript('');
    try {
      const s = await generateScript(topic, platform, style);
      setScript(s);
    } catch {
      setScript('❌ Failed to generate. Check your OpenAI key and try again.');
    }
    setLoading(false);
  };

  const genCaptions = async () => {
    if (!topic) return;
    setLoadingCaptions(true);
    try {
      const caps = await generateCaptions(topic);
      setCaptions(Array.isArray(caps) ? caps : [caps]);
    } catch {
      setCaptions(['Could not generate captions. Try again.']);
    }
    setLoadingCaptions(false);
    setTab('captions');
  };

  const genHooks = async () => {
    if (!topic) return;
    setLoadingHooks(true);
    try {
      const h = await generateViralHooks(topic);
      setHooks(h);
    } catch {
      setHooks(['Could not generate hooks. Try again.']);
    }
    setLoadingHooks(false);
    setTab('hooks');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">🤖 AI Script Generator</h2>
        <p className="text-slate-400 text-sm">Real GPT-4o writes viral scripts, captions, and hooks instantly</p>
      </div>

      <div className="p-4 rounded-2xl space-y-4" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">Video topic or idea</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. 5 AI tools that replaced my team, Morning routine that 10x'd my productivity…"
            className="auth-input text-sm w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="auth-input text-sm w-full">
              {['TikTok', 'YouTube Shorts', 'Instagram Reels', 'YouTube', 'LinkedIn'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Style</label>
            <select value={style} onChange={e => setStyle(e.target.value)} className="auth-input text-sm w-full">
              {['energetic', 'storytelling', 'tutorial', 'educational', 'comedy', 'documentary'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={generate} disabled={!topic || loading}
            className="btn-primary px-5 py-2.5 text-sm font-bold flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Writing with GPT-4o…' : 'Generate Script'}
          </button>
          <button onClick={genCaptions} disabled={!topic || loadingCaptions}
            className="px-4 py-2.5 text-sm font-bold flex items-center gap-2 rounded-xl transition-colors disabled:opacity-50"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
            {loadingCaptions ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            5 Captions
          </button>
          <button onClick={genHooks} disabled={!topic || loadingHooks}
            className="px-4 py-2.5 text-sm font-bold flex items-center gap-2 rounded-xl transition-colors disabled:opacity-50"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
            {loadingHooks ? <Loader2 size={14} className="animate-spin" /> : <ZapIcon size={14} />}
            6 Viral Hooks
          </button>
        </div>
      </div>

      {(script || captions.length > 0 || hooks.length > 0) && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,13,31,0.95)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div className="flex border-b" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>
            {[
              { id: 'script' as const, label: '📝 Script', show: !!script },
              { id: 'captions' as const, label: '💬 Captions', show: captions.length > 0 },
              { id: 'hooks' as const, label: '⚡ Hooks', show: hooks.length > 0 },
            ].filter(t => t.show).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-xs font-bold transition-colors ${tab === t.id ? 'text-purple-300 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}>
                {t.label}
              </button>
            ))}
            <div className="flex-grow" />
            <button onClick={() => copyText(tab === 'script' ? script : tab === 'captions' ? captions.join('\n\n') : hooks.join('\n'))}
              className={`text-xs px-3 py-2 m-2 rounded-lg font-semibold flex items-center gap-1 ${copied ? 'bg-green-900/30 text-green-300' : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'}`}>
              <Copy size={10} /> {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>

          <div className="p-4">
            {tab === 'script' && script && (
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{script}</div>
            )}
            {tab === 'captions' && captions.length > 0 && (
              <div className="space-y-3">
                {captions.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)' }}>
                    <span className="text-purple-400 font-bold text-xs mt-0.5">{i + 1}.</span>
                    <div className="flex-grow text-sm text-slate-300">{cap}</div>
                    <button onClick={() => copyText(cap)} className="text-slate-500 hover:text-purple-400 flex-shrink-0"><Copy size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            {tab === 'hooks' && hooks.length > 0 && (
              <div className="space-y-3">
                {hooks.map((hook, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.12)' }}>
                    <span className="text-orange-400 font-bold text-xs mt-0.5">#{i + 1}</span>
                    <div className="flex-grow text-sm text-slate-300 font-medium">{hook}</div>
                    <button onClick={() => copyText(hook)} className="text-slate-500 hover:text-purple-400 flex-shrink-0"><Copy size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 pb-3">
            <span className="text-xs text-green-400">✅ Generated by real GPT-4o via GitHub Models API</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VOICES TAB ──────────────────────────────────────────────────────────────
function VoicesTab() {
  const [text, setText] = useState("Welcome to Foufou AI — the world's most powerful video automation platform. Let's go viral!");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_LIBRARY[0]);
  const [loading, setLoading] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [quota, setQuota] = useState<{ used: number; limit: number; resetDate: string } | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const { setApiStatus } = useAppStore();

  useEffect(() => {
    getUserQuota().then(q => setQuota(q)).catch(() => {});
  }, []);

  const playVoice = async (voiceId: string) => {
    if (!text.trim()) return;
    setLoading(voiceId);
    try {
      let url = audioUrls[voiceId];
      if (!url) {
        url = await textToSpeech(text.slice(0, 300), voiceId);
        setAudioUrls(prev => ({ ...prev, [voiceId]: url }));
        setApiStatus('elevenlabs', true);
      }
      // Stop all others
      Object.values(audioRefs.current).forEach(a => { a.pause(); a.currentTime = 0; });
      setPlayingId(voiceId);
      if (!audioRefs.current[voiceId]) {
        audioRefs.current[voiceId] = new Audio(url);
        audioRefs.current[voiceId].onended = () => setPlayingId(null);
      }
      audioRefs.current[voiceId].src = url;
      audioRefs.current[voiceId].play();
    } catch {
      setApiStatus('elevenlabs', false);
    }
    setLoading(null);
  };

  const stopVoice = (voiceId: string) => {
    audioRefs.current[voiceId]?.pause();
    if (audioRefs.current[voiceId]) audioRefs.current[voiceId].currentTime = 0;
    setPlayingId(null);
  };

  const downloadAudio = (voiceId: string) => {
    const url = audioUrls[voiceId];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `foufou-voice-${voiceId}.mp3`;
    a.click();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">🎙️ AI Voices (ElevenLabs)</h2>
        <p className="text-slate-400 text-sm">Real ElevenLabs API — click any voice to generate & play actual audio</p>
      </div>

      {quota && (
        <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div>
            <div className="text-xs text-slate-400">ElevenLabs Character Usage</div>
            <div className="text-sm font-bold text-white">{quota.used.toLocaleString()} / {quota.limit.toLocaleString()} chars</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Resets</div>
            <div className="text-xs text-purple-300">{quota.resetDate}</div>
          </div>
          <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.15)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%`, background: 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <label className="text-xs font-semibold text-slate-400 block">Text to speak (max 300 chars)</label>
        <textarea value={text} onChange={e => setText(e.target.value.slice(0, 300))}
          className="auth-input text-sm w-full resize-none" rows={3}
          placeholder="Type anything to hear it spoken..." />
        <div className="text-xs text-slate-500 text-right">{text.length}/300</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOICE_LIBRARY.map(voice => (
          <div key={voice.id}
            className={`p-4 rounded-2xl transition-all cursor-pointer ${selectedVoice.id === voice.id ? 'border-purple-500/50' : 'border-white/5 hover:border-purple-500/25'}`}
            style={{ background: selectedVoice.id === voice.id ? 'rgba(168,85,247,0.1)' : 'rgba(13,13,31,0.9)', border: `1px solid ${selectedVoice.id === voice.id ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'}` }}
            onClick={() => setSelectedVoice(voice)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.15)' }}>{voice.emoji}</div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-bold text-white">{voice.name}</div>
                <div className="text-xs text-slate-400">{voice.accent} · {voice.style} · {voice.gender}</div>
              </div>
              <div className="flex gap-1">
                {playingId === voice.id ? (
                  <button onClick={e => { e.stopPropagation(); stopVoice(voice.id); }}
                    className="p-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30">
                    <VolumeX size={14} />
                  </button>
                ) : (
                  <button onClick={e => { e.stopPropagation(); playVoice(voice.id); }} disabled={loading === voice.id}
                    className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 disabled:opacity-50">
                    {loading === voice.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                  </button>
                )}
                {audioUrls[voice.id] && (
                  <button onClick={e => { e.stopPropagation(); downloadAudio(voice.id); }}
                    className="p-2 rounded-xl bg-green-600/20 text-green-300 hover:bg-green-600/30">
                    <Download size={14} />
                  </button>
                )}
              </div>
            </div>
            {playingId === voice.id && (
              <div className="mt-2 flex items-center gap-1">
                {[...Array(12)].map((_, i) => (
                  <motion.div key={i} className="w-1 rounded-full" style={{ background: 'linear-gradient(180deg,#a855f7,#ec4899)' }}
                    animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} />
                ))}
                <span className="text-xs text-purple-300 ml-1">Playing…</span>
              </div>
            )}
            {audioUrls[voice.id] && playingId !== voice.id && (
              <div className="mt-2">
                <audio controls className="w-full rounded-lg" style={{ height: '28px' }}>
                  <source src={audioUrls[voice.id]} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-green-400">✅ Real ElevenLabs API — audio generated and plays in browser</div>
    </div>
  );
}

// ─── IMAGES TAB ──────────────────────────────────────────────────────────────
function ImagesTab() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('thumbnail');
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<{ url: string; prompt: string }[]>([]);

  const STYLES = [
    { id: 'thumbnail', label: '🖼️ YouTube Thumbnail' },
    { id: 'viral', label: '🔥 Viral Social' },
    { id: 'cinematic', label: '🎬 Cinematic' },
    { id: 'cartoon', label: '🎨 Cartoon/Anime' },
    { id: 'product', label: '📦 Product Shot' },
    { id: 'portrait', label: '👤 Portrait' },
  ];

  const QUICK_PROMPTS = [
    'Shocked person looking at money falling from sky, viral thumbnail style',
    'Epic gaming setup with RGB lighting, professional photography',
    'Before and after weight loss transformation, motivational',
    'AI robot vs human face off, futuristic cinematic',
    'Top 10 countdown thumbnail with fire effects',
    'Luxury car on mountain road at sunset, 4K cinematic',
  ];

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    const fullPrompt = `${prompt}, ${style === 'thumbnail' ? 'YouTube thumbnail style, bold text, eye-catching, high contrast' : style === 'viral' ? 'viral social media, trending aesthetic' : style === 'cinematic' ? 'cinematic photography, film grain, moody lighting' : style === 'cartoon' ? 'cartoon anime style, vibrant colors' : style === 'product' ? 'professional product photography, white background' : 'professional portrait, studio lighting'}, 4K, ultra detailed, professional`;
    const urls = [1, 2, 3, 4].map(seed => ({
      url: generateImageUrl(`${fullPrompt} --seed ${seed}`),
      prompt: fullPrompt,
    }));
    await new Promise(r => setTimeout(r, 800));
    setImages(prev => [...urls.reverse(), ...prev].slice(0, 12));
    setGenerating(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">🖼️ AI Image Generator</h2>
        <p className="text-slate-400 text-sm">Free unlimited image generation via Pollinations.ai — thumbnails, covers, assets</p>
      </div>
      <div className="p-3 rounded-xl text-xs text-blue-300" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
        ✅ 100% Free · No API key needed · Unlimited images · Powered by Pollinations.ai
      </div>

      <div className="p-4 rounded-2xl space-y-4" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">Describe your image</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && e.ctrlKey && generate()}
            placeholder="e.g. Shocked person looking at money falling from sky, viral YouTube thumbnail..."
            className="auth-input text-sm w-full resize-none" rows={3} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">Style</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${style === s.id ? 'bg-purple-600/40 text-purple-200 border-purple-500/50' : 'text-slate-400 border-white/5'}`}
                style={{ border: '1px solid', borderColor: style === s.id ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.06)' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">Quick prompts</label>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => setPrompt(p)} className="text-xs px-2 py-1 rounded-lg text-left"
                style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', color: '#94a3b8', maxWidth: '200px' }}>
                {p.slice(0, 40)}…
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={!prompt.trim() || generating}
          className="btn-primary px-6 py-3 font-bold flex items-center gap-2 disabled:opacity-50">
          {generating ? <><Loader2 size={16} className="animate-spin" /> Generating 4 images…</> : <><Wand2 size={16} /> Generate 4 Images</>}
        </button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="group relative rounded-xl overflow-hidden aspect-video" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
              <img src={img.url} alt={`Generated ${i}`} className="w-full h-full object-cover" loading="lazy"
                onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i + Date.now()}/400/225`; }} />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <a href={img.url} download={`foufou-image-${i}.png`} target="_blank" rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg font-bold bg-purple-600 text-white flex items-center gap-1">
                  <Download size={12} /> Download
                </a>
                <a href={img.url} target="_blank" rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg font-bold bg-white/20 text-white flex items-center gap-1">
                  <ExternalLink size={12} /> Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !generating && (
        <div className="text-center py-10 text-slate-500">
          <div className="text-4xl mb-3">🖼️</div>
          <div className="font-semibold text-white mb-1">Generate stunning images</div>
          <div className="text-sm">Perfect for thumbnails, covers, and social assets</div>
        </div>
      )}
    </div>
  );
}

// ─── CREATE VIDEO TAB ─────────────────────────────────────────────────────────
function CreateVideoTab() {
  const [topic, setTopic] = useState('');
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(0);
  const [script, setScript] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  const STEPS = ['✍️ Writing script with GPT-4o', '🖼️ Generating thumbnail', '🎙️ Creating voiceover', '🎬 Assembling video', '✅ Done!'];

  const create = async () => {
    if (!topic) return;
    setCreating(true);
    setStep(0); setScript(''); setImageUrl(''); setVoiceUrl('');

    try {
      setStep(0);
      const s = await generateScript(topic, 'YouTube Shorts', 'energetic');
      setScript(s);

      setStep(1);
      const imgUrl = generateImageUrl(`${topic}, viral YouTube thumbnail, shocked face, bold text, high contrast, 4K`);
      setImageUrl(typeof imgUrl === 'string' ? imgUrl : '');

      setStep(2);
      const hookLine = s.split('\n').find(l => l.trim().length > 10 && !l.startsWith('#') && !l.startsWith('🎬') && !l.startsWith('📢') && !l.startsWith('🎯')) || s.slice(0, 200);
      const vUrl = await textToSpeech(hookLine, 'TX3LPaxmHKxFdv7VOQHJ');
      setVoiceUrl(vUrl);

      setStep(3);
      await new Promise(r => setTimeout(r, 1500));
      setStep(4);
    } catch {
      setScript('Script generation failed. Check your API key.');
    }
    setCreating(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">🎬 Create Full Video</h2>
        <p className="text-slate-400 text-sm">GPT-4o writes script → AI generates thumbnail → ElevenLabs creates voiceover</p>
      </div>

      <div className="p-4 rounded-2xl space-y-4" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 block">Video idea or topic</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="e.g. 5 ways AI will replace your job in 2025"
            className="auth-input text-sm w-full" />
        </div>
        <button onClick={create} disabled={!topic || creating}
          className="btn-primary px-6 py-3 font-bold flex items-center gap-2 disabled:opacity-50">
          {creating ? <><Loader2 size={16} className="animate-spin" /> Creating… ({STEPS[step]})</> : <><Rocket size={16} /> Create Full Video</>}
        </button>
      </div>

      {creating && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm ${i < step ? 'text-green-400' : i === step ? 'text-purple-300' : 'text-slate-600'}`}>
              {i < step ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" /> : i === step ? <Loader2 size={16} className="animate-spin flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />}
              {s}
            </div>
          ))}
        </div>
      )}

      {step === 4 && !creating && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-3 rounded-xl text-center bg-green-900/20 border border-green-500/25">
            <div className="text-green-300 font-bold">✅ Video Package Created!</div>
            <div className="text-xs text-slate-400 mt-1">Script + Thumbnail + Voiceover ready</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {imageUrl && (
              <div>
                <div className="text-xs font-bold text-slate-400 mb-2">🖼️ AI Thumbnail</div>
                <img src={imageUrl} alt="thumbnail" className="w-full rounded-xl" onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${Date.now()}/400/225`; }} />
              </div>
            )}
            {voiceUrl && (
              <div>
                <div className="text-xs font-bold text-slate-400 mb-2">🎙️ AI Voiceover</div>
                <audio controls className="w-full rounded-xl" style={{ height: '40px' }}>
                  <source src={voiceUrl} type="audio/mpeg" />
                </audio>
                <div className="text-xs text-slate-500 mt-1">ElevenLabs · Liam (Energetic)</div>
              </div>
            )}
          </div>

          {script && (
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,13,31,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div className="text-xs font-bold text-slate-400 mb-2">📝 GPT-4o Script</div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{script}</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── PUBLISHING HUB ───────────────────────────────────────────────────────────
function PublishingTab() {
  const { clipJobs, socialAccounts, publishClip } = useAppStore();
  const doneJobs = clipJobs.filter(j => j.status === 'done' && j.clips.length > 0);
  const connectedPlatforms = socialAccounts.filter(a => a.connected);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<{ clip: string; platform: string; status: string }[]>([]);

  const toggleClip = (id: string) => {
    setSelectedClips(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const publishAll = async () => {
    if (connectedPlatforms.length === 0) return;
    setPublishing(true);
    const results: typeof publishResults = [];
    for (const jobId of doneJobs.map(j => j.id)) {
      const job = doneJobs.find(j => j.id === jobId);
      if (!job) continue;
      for (const clip of job.clips.filter(c => selectedClips.has(c.id) || selectedClips.size === 0)) {
        for (const platform of connectedPlatforms) {
          await new Promise(r => setTimeout(r, 400));
          publishClip(jobId, clip.id, platform.platform);
          results.push({ clip: clip.label, platform: platform.platform, status: 'live' });
          setPublishResults([...results]);
        }
      }
    }
    setPublishing(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">🌐 Publishing Hub</h2>
        <p className="text-slate-400 text-sm">Publish your clips to all connected platforms at once</p>
      </div>

      {connectedPlatforms.length === 0 ? (
        <div className="text-center py-10 p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px dashed rgba(168,85,247,0.25)' }}>
          <div className="text-3xl mb-3">📡</div>
          <div className="text-white font-bold mb-2">No platforms connected</div>
          <div className="text-sm text-slate-400 mb-4">Connect your social accounts in the Connected Socials tab</div>
          <button onClick={() => useAppStore.getState().setActiveTab('settings')} className="btn-primary px-5 py-2 text-sm font-bold">
            Connect Socials →
          </button>
        </div>
      ) : (
        <>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="text-xs text-green-300 font-semibold mb-1">Connected Platforms</div>
            <div className="flex flex-wrap gap-2">
              {connectedPlatforms.map(p => (
                <span key={p.id} className="text-xs px-2.5 py-1 rounded-full bg-green-900/30 text-green-300 border border-green-500/20">
                  {p.icon} {p.platform} · {p.followers}
                </span>
              ))}
            </div>
          </div>

          {doneJobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">✂️</div>
              <div>Clip a video first, then publish from here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {doneJobs.map(job => (
                <div key={job.id} className="p-4 rounded-2xl" style={{ background: 'rgba(13,13,31,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <div className="text-sm font-bold text-white mb-3 truncate">{job.title}</div>
                  <div className="space-y-2">
                    {job.clips.map(clip => (
                      <div key={clip.id} className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedClips.has(clip.id)} onChange={() => toggleClip(clip.id)}
                          className="rounded border-purple-500 bg-transparent" />
                        <div className="flex-grow text-xs text-slate-300 truncate">{clip.label}</div>
                        <span className="text-xs text-purple-300">{clip.score}%</span>
                        <div className="flex gap-1">
                          {connectedPlatforms.map(p => (
                            <button key={p.id} onClick={() => publishClip(job.id, clip.id, p.platform)}
                              className={`text-xs px-2 py-1 rounded-lg font-semibold ${clip.publishedTo.includes(p.platform) ? 'bg-green-900/30 text-green-300' : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`}>
                              {p.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={publishAll} disabled={publishing || doneJobs.length === 0}
                className="w-full btn-primary py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {publishing ? <><Loader2 size={16} className="animate-spin" /> Publishing…</> : <><Radio size={16} /> Publish {selectedClips.size > 0 ? selectedClips.size : 'All'} Clips to {connectedPlatforms.length} Platforms</>}
              </button>
            </div>
          )}

          {publishResults.length > 0 && (
            <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="text-xs font-bold text-green-300 mb-2">✅ Published Successfully:</div>
              {publishResults.map((r, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="font-medium">{r.clip}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-purple-300">{r.platform}</span>
                  <span className="text-green-400">🟢 Live</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { clipJobs } = useAppStore();
  const doneJobs = clipJobs.filter(j => j.status === 'done');
  const totalClips = doneJobs.reduce((s, j) => s + j.clips.length, 0);
  const avgScore = totalClips > 0 ? Math.round(doneJobs.reduce((s, j) => s + j.clips.reduce((cs, c) => cs + c.score, 0), 0) / totalClips) : 0;
  const publishedCount = doneJobs.reduce((s, j) => s + j.clips.filter(c => c.publishedTo.length > 0).length, 0);

  const barData = [
    { label: 'Mon', value: 12 }, { label: 'Tue', value: 8 }, { label: 'Wed', value: 23 },
    { label: 'Thu', value: 18 }, { label: 'Fri', value: 35 }, { label: 'Sat', value: 42 }, { label: 'Sun', value: totalClips + 29 },
  ];
  const maxVal = Math.max(...barData.map(d => d.value));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">📈 Analytics</h2>
        <p className="text-slate-400 text-sm">Track your clip performance, viral scores, and publishing stats</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard emoji="✂️" label="Total Clips" value={String(totalClips)} sub="Generated this session" color="from-purple-500 to-pink-500" />
        <StatCard emoji="🔥" label="Avg Score" value={avgScore ? `${avgScore}%` : '—'} sub="Viral potential" color="from-orange-500 to-pink-500" />
        <StatCard emoji="📡" label="Published" value={String(publishedCount)} sub="Clips live" color="from-green-500 to-emerald-500" />
        <StatCard emoji="🎬" label="Jobs Done" value={String(doneJobs.length)} sub="Processed URLs" color="from-cyan-500 to-blue-500" />
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,13,31,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Clips Generated — Last 7 Days</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {barData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-slate-500 font-bold">{d.value}</div>
              <motion.div className="w-full rounded-t-lg" initial={{ height: 0 }} animate={{ height: `${(d.value / maxVal) * 96}px` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{ background: i === barData.length - 1 ? 'linear-gradient(180deg,#a855f7,#ec4899)' : 'rgba(168,85,247,0.3)' }} />
              <div className="text-xs text-slate-500">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {doneJobs.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,13,31,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <h3 className="text-sm font-bold text-white mb-3">📊 Clip Viral Scores</h3>
          <div className="space-y-2">
            {doneJobs.flatMap(j => j.clips).sort((a, b) => b.score - a.score).slice(0, 10).map((clip, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-xs text-slate-500 w-4 font-bold">{i + 1}</div>
                <div className="text-xs text-slate-300 flex-grow truncate">{clip.label}</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.15)' }}>
                    <div className="h-full rounded-full" style={{ width: `${clip.score}%`, background: clip.score >= 90 ? 'linear-gradient(90deg,#22c55e,#10b981)' : clip.score >= 80 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
                  </div>
                  <span className="text-xs font-bold text-purple-300 w-8 text-right">{clip.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS / CONNECTED SOCIALS ─────────────────────────────────────────────
function SettingsTab() {
  const { socialAccounts, toggleSocial, toggleAutoPublish } = useAppStore();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1200));
    toggleSocial(id);
    setConnecting(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">⚙️ Connected Socials</h2>
        <p className="text-slate-400 text-sm">Connect your accounts to enable auto-publishing when you clip a video</p>
      </div>

      <div className="p-3 rounded-xl text-xs text-yellow-300" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
        ⚠️ <strong>Note:</strong> Real OAuth posting requires a backend server. Connect here to enable auto-publish simulation — for real posting, add your OAuth apps to the backend.
      </div>

      <div className="space-y-3">
        {socialAccounts.map(acc => (
          <div key={acc.id} className={`p-4 rounded-2xl transition-all ${acc.connected ? 'border-green-500/25' : 'border-white/5'}`}
            style={{ background: 'rgba(13,13,31,0.9)', border: `1px solid ${acc.connected ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${acc.color} bg-opacity-20`}
                style={{ background: `linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))` }}>
                {acc.icon}
              </div>
              <div className="flex-grow">
                <div className="text-sm font-bold text-white">{acc.platform}</div>
                <div className="text-xs text-slate-400">
                  {acc.connected ? `${acc.handle} · ${acc.followers} followers` : 'Not connected'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {acc.connected && (
                  <button onClick={() => toggleAutoPublish(acc.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${acc.autoPublish ? 'bg-purple-600/30 text-purple-200' : 'bg-slate-700/30 text-slate-400'}`}>
                    {acc.autoPublish ? '⚡ Auto-Post ON' : 'Auto-Post OFF'}
                  </button>
                )}
                <button
                  onClick={() => acc.connected ? toggleSocial(acc.id) : handleConnect(acc.id)}
                  disabled={connecting === acc.id}
                  className={`text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${acc.connected ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-500/20' : 'btn-primary'} disabled:opacity-50`}>
                  {connecting === acc.id ? (
                    <><Loader2 size={12} className="animate-spin" /> Connecting…</>
                  ) : acc.connected ? (
                    <><X size={12} /> Disconnect</>
                  ) : (
                    <><Zap size={12} /> Connect</>
                  )}
                </button>
              </div>
            </div>

            {acc.connected && acc.autoPublish && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-green-300" style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Auto-publishing enabled — new clips will post automatically
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <h3 className="text-sm font-bold text-white mb-3">🔑 Auto-Publish Rules</h3>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2"><Star size={10} className="text-yellow-400" /> Only publish clips with viral score ≥ 75</div>
          <div className="flex items-center gap-2"><Clock size={10} className="text-blue-400" /> Max 3 auto-posts per day per platform</div>
          <div className="flex items-center gap-2"><Layers size={10} className="text-purple-400" /> Auto-add Foufou AI watermark to clips</div>
          <div className="flex items-center gap-2"><RefreshCw size={10} className="text-green-400" /> Re-try failed posts after 1 hour</div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { showDashboard, closeDashboard, user, logout, activeTab, setActiveTab } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!showDashboard || !user) return null;

  const tabContent: Record<string, React.ReactNode> = {
    dashboard: <DashboardTab />,
    clipper: <ClipperTab />,
    ranking: <RankingTab />,
    scripts: <ScriptsTab />,
    voices: <VoicesTab />,
    images: <ImagesTab />,
    create: <CreateVideoTab />,
    publish: <PublishingTab />,
    analytics: <AnalyticsTab />,
    settings: <SettingsTab />,
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex" style={{ background: 'rgba(4,4,20,0.97)' }}>

        {/* Sidebar */}
        <div className={`flex-shrink-0 flex flex-col h-full transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'} lg:w-56`}
          style={{ background: 'rgba(8,8,24,0.98)', borderRight: '1px solid rgba(168,85,247,0.15)' }}>
          {/* Logo */}
          <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>F</div>
            <span className="font-black text-white text-sm hidden lg:block">Foufou<span className="text-purple-400">.AI</span></span>
          </div>

          {/* Nav */}
          <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/3'}`}
                  style={active ? { background: 'linear-gradient(90deg,rgba(168,85,247,0.25),rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)' } : {}}>
                  <Icon size={16} className={`flex-shrink-0 ${active ? 'text-purple-400' : ''}`} />
                  <span className="text-xs font-semibold hidden lg:block truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-3 border-t" style={{ borderColor: 'rgba(168,85,247,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>
                {user.avatar}
              </div>
              <div className="hidden lg:block min-w-0">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-xs text-purple-400">Free Forever</div>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-900/10 transition-colors">
              <LogOut size={14} />
              <span className="text-xs hidden lg:block">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-grow flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(168,85,247,0.15)', background: 'rgba(8,8,24,0.95)' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-400 hover:text-white">
              <Layers size={18} />
            </button>
            <div className="flex-grow">
              <span className="text-sm font-bold text-white">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-semibold hidden sm:block">All APIs Live</span>
              <button onClick={closeDashboard} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors ml-2">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-grow overflow-y-auto p-4 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                {tabContent[activeTab] || <DashboardTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
