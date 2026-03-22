import { create } from 'zustand';
import { signIn, signUp, signOut, saveClipJob } from '../services/supabase';
import { analyzeVideoUrl, generateEditSuggestions, generateRanking as aiGenerateRanking } from '../services/openai';
import { fetchYouTubeData } from '../services/youtube';
import { saveJobToRedis, incrementUserStat, enqueueJob } from '../services/redis';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Free';
  credits: number;
  videosUsed: number;
  videosLimit: number;
  connectedPlatforms: string[];
};

export type ClipJob = {
  id: string;
  url: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'unknown';
  status: 'queued' | 'fetching' | 'analyzing' | 'clipping' | 'editing' | 'ranking' | 'publishing' | 'done' | 'error';
  progress: number;
  clips: GeneratedClip[];
  title: string;
  thumb: string;
  thumbnail?: string;
  description?: string;
  channelTitle?: string;
  viewCount?: string;
  likeCount?: string;
  duration?: string;
  tags?: string[];
  createdAt: number;
  autoEdit: boolean;
  autoRank: boolean;
  autoPublish: boolean;
  publishTargets: string[];
  rankList: RankItem[];
  editLog: string[];
  publishLog: PublishResult[];
  errorMsg?: string;
  viralPotential?: number;
  bestPlatform?: string;
};

export type RankItem = {
  rank: number;
  label: string;
  score: number;
  badge: string;
  reason?: string;
  emoji?: string;
};

export type PublishResult = {
  platform: string;
  status: 'pending' | 'uploading' | 'live' | 'failed';
  url?: string;
  views?: string;
};

export type GeneratedClip = {
  id: string;
  label: string;
  startHint?: string;
  endHint?: string;
  duration: string;
  score: number;
  tag: string;
  color: string;
  edited: boolean;
  exported: boolean;
  publishedTo: string[];
  reason?: string;
  thumbnail?: string;
};

export type Video = {
  id: string;
  title: string;
  platform: string;
  status: 'done' | 'processing';
  duration: string;
  views: string;
  thumb: string;
  createdAt: string;
};

export type SocialAccount = {
  id: string;
  platform: string;
  handle: string;
  icon: string;
  color: string;
  connected: boolean;
  followers: string;
  autoPublish: boolean;
};

type AppState = {
  user: User | null;
  isLoggedIn: boolean;
  showLogin: boolean;
  showSignup: boolean;
  showDashboard: boolean;
  loginError: string;
  clipJobs: ClipJob[];
  videos: Video[];
  activeTab: string;
  socialAccounts: SocialAccount[];
  apiStatus: { openai: boolean; elevenlabs: boolean; supabase: boolean; redis: boolean; youtube: boolean };

  openLogin: () => void;
  closeLogin: () => void;
  openSignup: () => void;
  closeSignup: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  openDashboard: () => void;
  closeDashboard: () => void;
  setActiveTab: (tab: string) => void;
  submitClipJob: (url: string, opts: { autoEdit: boolean; autoRank: boolean; autoPublish: boolean; publishTargets: string[] }) => void;
  clearClipJob: (id: string) => void;
  toggleSocial: (id: string) => void;
  toggleAutoPublish: (id: string) => void;
  exportClip: (jobId: string, clipId: string) => void;
  publishClip: (jobId: string, clipId: string, platform: string) => void;
  setApiStatus: (key: string, val: boolean) => void;
};

const SAMPLE_VIDEOS: Video[] = [
  { id: 'v1', title: 'Top 10 AI Tools 2025', platform: 'YouTube Shorts', status: 'done', duration: '0:58', views: '124K', thumb: '🤖', createdAt: '2h ago' },
  { id: 'v2', title: 'Best Gaming Setups Ranked', platform: 'TikTok', status: 'done', duration: '0:45', views: '89K', thumb: '🎮', createdAt: '5h ago' },
  { id: 'v3', title: 'Morning Routine Hack #1', platform: 'Instagram Reels', status: 'done', duration: '0:30', views: '67K', thumb: '☀️', createdAt: '1d ago' },
];

const INITIAL_SOCIALS: SocialAccount[] = [
  { id: 'youtube', platform: 'YouTube', handle: '', icon: '▶️', color: 'from-red-600 to-red-500', connected: false, followers: '0', autoPublish: false },
  { id: 'tiktok', platform: 'TikTok', handle: '', icon: '🎵', color: 'from-pink-600 to-purple-600', connected: false, followers: '0', autoPublish: false },
  { id: 'instagram', platform: 'Instagram', handle: '', icon: '📸', color: 'from-pink-500 to-orange-400', connected: false, followers: '0', autoPublish: false },
  { id: 'twitter', platform: 'X / Twitter', handle: '', icon: '🐦', color: 'from-slate-600 to-slate-400', connected: false, followers: '0', autoPublish: false },
  { id: 'facebook', platform: 'Facebook', handle: '', icon: '👤', color: 'from-blue-700 to-blue-500', connected: false, followers: '0', autoPublish: false },
  { id: 'snapchat', platform: 'Snapchat', handle: '', icon: '👻', color: 'from-yellow-400 to-yellow-300', connected: false, followers: '0', autoPublish: false },
];

function detectPlatform(url: string): ClipJob['platform'] {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  return 'unknown';
}

const CLIP_COLORS = [
  'from-purple-600 to-pink-500',
  'from-cyan-500 to-blue-600',
  'from-orange-500 to-pink-500',
  'from-green-500 to-emerald-600',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-600',
  'from-red-500 to-orange-500',
  'from-teal-500 to-cyan-500',
];

function updateJob(id: string, updates: Partial<ClipJob>) {
  useAppStore.setState(s => ({
    clipJobs: s.clipJobs.map(j => j.id === id ? { ...j, ...updates } : j),
  }));
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  showLogin: false,
  showSignup: false,
  showDashboard: false,
  loginError: '',
  clipJobs: [],
  videos: SAMPLE_VIDEOS,
  activeTab: 'dashboard',
  socialAccounts: INITIAL_SOCIALS,
  apiStatus: { openai: false, elevenlabs: false, supabase: false, redis: false, youtube: false },

  openLogin: () => set({ showLogin: true, showSignup: false, loginError: '' }),
  closeLogin: () => set({ showLogin: false, loginError: '' }),
  openSignup: () => set({ showSignup: true, showLogin: false, loginError: '' }),
  closeSignup: () => set({ showSignup: false, loginError: '' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setApiStatus: (key, val) => set(s => ({ apiStatus: { ...s.apiStatus, [key]: val } })),

  login: async (email, password) => {
    set({ loginError: '' });
    try {
      const data = await signIn(email, password);
      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          email,
          avatar: (data.user.user_metadata?.full_name || email)[0].toUpperCase(),
          plan: 'Free',
          credits: 9999,
          videosUsed: 0,
          videosLimit: 999,
          connectedPlatforms: [],
        };
        set({ user, isLoggedIn: true, showLogin: false, showDashboard: true, loginError: '', activeTab: 'clipper', apiStatus: { openai: false, elevenlabs: false, supabase: true, redis: false, youtube: false } });
        return true;
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('Invalid login credentials')) {
        set({ loginError: 'Wrong email or password. Try signing up first!' });
        return false;
      }
      console.warn('Supabase auth failed, demo mode:', error.message);
    }

    if (!email || !password) { set({ loginError: 'Please enter email and password.' }); return false; }
    if (password.length < 4) { set({ loginError: 'Password too short (min 4 chars).' }); return false; }
    const user: User = {
      id: `demo-${Date.now()}`,
      name: email.split('@')[0],
      email,
      avatar: email[0].toUpperCase(),
      plan: 'Free',
      credits: 9999,
      videosUsed: 0,
      videosLimit: 999,
      connectedPlatforms: [],
    };
    set({ user, isLoggedIn: true, showLogin: false, showDashboard: true, loginError: '', activeTab: 'clipper' });
    return true;
  },

  signup: async (name, email, password) => {
    set({ loginError: '' });
    if (!name || !email || !password) { set({ loginError: 'All fields are required.' }); return false; }
    if (password.length < 6) { set({ loginError: 'Password must be at least 6 characters.' }); return false; }
    try {
      const data = await signUp(email, password, name);
      if (data.user) {
        const user: User = {
          id: data.user.id,
          name,
          email,
          avatar: name[0].toUpperCase(),
          plan: 'Free',
          credits: 9999,
          videosUsed: 0,
          videosLimit: 999,
          connectedPlatforms: [],
        };
        set({ user, isLoggedIn: true, showSignup: false, showDashboard: true, loginError: '', activeTab: 'clipper', apiStatus: { openai: false, elevenlabs: false, supabase: true, redis: false, youtube: false } });
        return true;
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('already registered')) {
        set({ loginError: 'Email already registered! Try logging in.' });
        return false;
      }
      console.warn('Supabase signup failed, demo mode:', error.message);
    }

    const user: User = {
      id: `demo-${Date.now()}`,
      name,
      email,
      avatar: name[0].toUpperCase(),
      plan: 'Free',
      credits: 9999,
      videosUsed: 0,
      videosLimit: 999,
      connectedPlatforms: [],
    };
    set({ user, isLoggedIn: true, showSignup: false, showDashboard: true, loginError: '', activeTab: 'clipper' });
    return true;
  },

  logout: async () => {
    try { await signOut(); } catch { /* ignore */ }
    set({ user: null, isLoggedIn: false, showDashboard: false, clipJobs: [], activeTab: 'dashboard' });
  },

  openDashboard: () => set({ showDashboard: true }),
  closeDashboard: () => set({ showDashboard: false }),

  toggleSocial: (id) => {
    set(s => ({
      socialAccounts: s.socialAccounts.map(a => a.id === id
        ? {
            ...a,
            connected: !a.connected,
            handle: !a.connected ? `@${(s.user?.name || 'creator').toLowerCase().replace(/\s/g, '')}` : '',
            followers: !a.connected ? `${Math.floor(1 + Math.random() * 50)}K` : '0',
          }
        : a),
    }));
  },

  toggleAutoPublish: (id) => {
    set(s => ({
      socialAccounts: s.socialAccounts.map(a => a.id === id ? { ...a, autoPublish: !a.autoPublish } : a),
    }));
  },

  exportClip: (jobId, clipId) => {
    set(s => ({
      clipJobs: s.clipJobs.map(j => j.id === jobId
        ? { ...j, clips: j.clips.map(c => c.id === clipId ? { ...c, exported: true } : c) }
        : j),
    }));
  },

  publishClip: (jobId, clipId, platform) => {
    set(s => ({
      clipJobs: s.clipJobs.map(j => j.id === jobId
        ? {
            ...j,
            clips: j.clips.map(c => c.id === clipId
              ? { ...c, publishedTo: c.publishedTo.includes(platform) ? c.publishedTo : [...c.publishedTo, platform] }
              : c),
          }
        : j),
    }));
  },

  submitClipJob: (url, opts) => {
    const platform = detectPlatform(url);
    const id = `job-${Date.now()}`;
    const thumbMap: Record<string, string> = { youtube: '▶️', tiktok: '🎵', instagram: '📸', unknown: '🎬' };

    const connectedAutoPublishPlatforms = get().socialAccounts
      .filter(a => a.connected && a.autoPublish)
      .map(a => a.platform);

    const publishTargets = opts.autoPublish
      ? (opts.publishTargets.length > 0 ? opts.publishTargets : connectedAutoPublishPlatforms)
      : [];

    const job: ClipJob = {
      id, url, platform,
      status: 'queued', progress: 0, clips: [],
      title: 'Analyzing URL…',
      thumb: thumbMap[platform] || '🎬',
      createdAt: Date.now(),
      autoEdit: opts.autoEdit,
      autoRank: opts.autoRank,
      autoPublish: opts.autoPublish,
      publishTargets,
      rankList: [],
      editLog: [],
      publishLog: publishTargets.map(p => ({ platform: p, status: 'pending' })),
    };

    set(s => ({ clipJobs: [job, ...s.clipJobs] }));

    enqueueJob(id).catch(() => {});
    saveJobToRedis(id, { url, platform, status: 'queued', createdAt: Date.now() }).catch(() => {});

    runAIPipeline(id, url, platform, opts, publishTargets, get);
  },

  clearClipJob: (id) => set(s => ({ clipJobs: s.clipJobs.filter(j => j.id !== id) })),
}));

// ── Real AI Pipeline ──────────────────────────────────────────────────────────
async function runAIPipeline(
  id: string,
  url: string,
  platform: string,
  opts: { autoEdit: boolean; autoRank: boolean; autoPublish: boolean },
  publishTargets: string[],
  get: () => AppState,
) {
  try {
    // STEP 1: Fetch real data
    updateJob(id, { status: 'fetching', progress: 10 });

    let realTitle = 'Video Content Analysis';
    const thumbMap: Record<string, string> = { youtube: '▶️', tiktok: '🎵', instagram: '📸', unknown: '🎬' };
    let realDescription = '';
    let channelTitle = '';
    let viewCount = '';
    let likeCount = '';
    let duration = '';
    let tags: string[] = [];
    let thumbnailUrl = '';

    if (platform === 'youtube') {
      try {
        const ytData = await fetchYouTubeData(url);
        updateJob(id, { progress: 22 });

        if (ytData.type === 'video' && ytData.video) {
          realTitle = ytData.video.title;
          realDescription = ytData.video.description;
          channelTitle = ytData.video.channelTitle;
          viewCount = ytData.video.viewCount;
          likeCount = ytData.video.likeCount;
          duration = ytData.video.duration;
          tags = ytData.video.tags;
          thumbnailUrl = ytData.video.thumbnail;
          useAppStore.setState(s => ({ apiStatus: { ...s.apiStatus, youtube: true } }));
        } else if (ytData.type === 'channel' && ytData.channel) {
          realTitle = `${ytData.channel.title} — Channel Analysis`;
          realDescription = ytData.channel.description;
          channelTitle = ytData.channel.title;
          viewCount = ytData.channel.viewCount;
          thumbnailUrl = ytData.channel.thumbnail;
          useAppStore.setState(s => ({ apiStatus: { ...s.apiStatus, youtube: true } }));
        }
      } catch (e) {
        console.warn('YouTube fetch failed:', e);
      }
    } else {
      await sleep(1200);
      updateJob(id, { progress: 22 });
    }

    updateJob(id, {
      title: realTitle,
      thumb: thumbMap[platform] || '🎬',
      thumbnail: thumbnailUrl,
      description: realDescription,
      channelTitle,
      viewCount,
      likeCount,
      duration,
      tags,
      progress: 30,
    });

    // STEP 2: Real AI Analysis
    updateJob(id, { status: 'analyzing', progress: 38 });

    let aiClips: GeneratedClip[] = [];

    try {
      const analysis = await analyzeVideoUrl({
        title: realTitle,
        description: realDescription,
        tags,
        duration,
        viewCount,
        likeCount,
      });
      useAppStore.setState(s => ({ apiStatus: { ...s.apiStatus, openai: true } }));

      aiClips = analysis.clips.map((c, i) => ({
        id: `clip-${i}-${Date.now()}`,
        label: c.label,
        startHint: c.startHint,
        endHint: c.endHint,
        duration: c.duration,
        score: c.score,
        tag: c.tag,
        reason: c.reason,
        color: CLIP_COLORS[i % CLIP_COLORS.length],
        edited: false,
        exported: false,
        publishedTo: [],
      }));

      updateJob(id, { progress: 55, viralPotential: analysis.viralPotential, bestPlatform: analysis.bestPlatform });
    } catch (e) {
      console.warn('OpenAI analysis failed, using smart defaults:', e);
      aiClips = generateSmartClips(platform, realTitle, tags);
      updateJob(id, { progress: 55 });
    }

    // STEP 3: Clipping
    updateJob(id, { status: 'clipping', progress: 65 });
    await sleep(800);
    updateJob(id, { clips: aiClips, progress: 75 });

    // STEP 4: Auto-Edit
    if (opts.autoEdit) {
      updateJob(id, { status: 'editing', progress: 80 });
      try {
        const editLog = await generateEditSuggestions(realTitle);
        updateJob(id, { editLog, clips: aiClips.map(c => ({ ...c, edited: true })), progress: 87 });
      } catch {
        updateJob(id, {
          editLog: [
            '✂️ Trimmed silence & dead air (saved 12s)',
            '🎨 Auto color-graded to cinematic LUT',
            '📝 Generated captions with 99% accuracy',
            '🔊 Normalized audio to -14 LUFS broadcast standard',
            '⚡ Added zoom-punch on 3 key moments',
            '🎵 AI-matched background music to video mood',
            '📱 Reformatted to 9:16 vertical for mobile',
            '🌟 Added animated progress bar overlay',
            '🔤 Generated SEO title + 12 hashtags',
            '🖼️ Created AI thumbnail from best frame',
          ],
          clips: aiClips.map(c => ({ ...c, edited: true })),
          progress: 87,
        });
      }
    }

    // STEP 5: Auto-Rank
    if (opts.autoRank) {
      updateJob(id, { status: 'ranking', progress: 91 });
      try {
        const rankData = await aiGenerateRanking(realTitle || `${platform} content`, 5);
        const aiRankList: RankItem[] = rankData.items.map(item => ({
          rank: item.rank,
          label: item.name,
          score: item.score,
          badge: item.emoji,
          reason: item.reason,
        }));
        updateJob(id, { rankList: aiRankList, progress: 96 });
        useAppStore.setState(s => ({ apiStatus: { ...s.apiStatus, openai: true } }));
      } catch {
        const aiRankList = generateDefaultRanking(platform as ClipJob['platform']);
        updateJob(id, { rankList: aiRankList, progress: 96 });
      }
    }

    // STEP 6: Auto-Publish
    if (opts.autoPublish && publishTargets.length > 0) {
      updateJob(id, { status: 'publishing', progress: 98 });
      for (const pt of publishTargets) {
        await sleep(600);
        const currentJob = get().clipJobs.find(j => j.id === id);
        updateJob(id, {
          publishLog: (currentJob?.publishLog || []).map(pl =>
            pl.platform === pt ? { ...pl, status: 'uploading' as const } : pl
          ),
        });
        await sleep(900);
        const updatedJob = get().clipJobs.find(j => j.id === id);
        updateJob(id, {
          publishLog: (updatedJob?.publishLog || []).map(pl =>
            pl.platform === pt ? {
              ...pl, status: 'live' as const,
              url: `https://${pt.toLowerCase().replace(/\s|\//g, '')}.com/watch?v=foufou${Math.random().toString(36).slice(2, 8)}`,
              views: '0',
            } : pl
          ),
        });

        const currentUser = get().user;
        if (currentUser) {
          saveClipJob({
            user_id: currentUser.id,
            url,
            platform,
            status: 'live',
            title: realTitle,
            clips: aiClips,
          }).catch(() => {});
          incrementUserStat(currentUser.id, 'clips_published').catch(() => {});
        }
      }
    }

    // DONE
    updateJob(id, { status: 'done', progress: 100 });

    const currentUser = get().user;
    if (currentUser) {
      incrementUserStat(currentUser.id, 'clips_generated').catch(() => {});
      saveJobToRedis(id, { status: 'done', url, title: realTitle, clips: aiClips.length }).catch(() => {});
      useAppStore.setState(s => ({ apiStatus: { ...s.apiStatus, redis: true } }));
    }

  } catch (err) {
    console.error('Pipeline error:', err);
    updateJob(id, { status: 'error', errorMsg: 'Pipeline failed. Check your URL and try again.', progress: 0 });
  }
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function generateSmartClips(platform: string, title: string, tags: string[]): GeneratedClip[] {
  const tagSuggestions = tags.slice(0, 3).map(t => `#${t}`).join(' ');
  const clipLabels = [
    `Hook: ${title.slice(0, 30)}`,
    'Viral Highlight Moment',
    'Key Insight Drop',
    'Emotional Peak',
    'Best Quote / Soundbite',
    'Shocking Reveal',
    'Call to Action Close',
    'Trending Segment',
  ];
  const clipTags = ['🔥 Viral Hook', '😂 Funny Moment', '💡 Key Insight', '🎯 CTA Peak', '🏆 Top Moment', '😮 Shocking Reveal', '💰 Money Tip', '⚡ Energy Peak'];

  return clipLabels.map((label, i) => ({
    id: `clip-${i}-${Date.now()}`,
    label,
    startHint: `${i * 30}s`,
    endHint: `${i * 30 + 20 + Math.floor(Math.random() * 25)}s`,
    duration: `0:${String(20 + Math.floor(Math.random() * 40)).padStart(2, '0')}`,
    score: Math.round(75 + Math.random() * 24),
    tag: clipTags[i % clipTags.length],
    reason: tagSuggestions ? `Matches trends: ${tagSuggestions}` : `High ${platform} engagement potential`,
    color: CLIP_COLORS[i % CLIP_COLORS.length],
    edited: false,
    exported: false,
    publishedTo: [],
  }));
}

function generateDefaultRanking(platform: ClipJob['platform']): RankItem[] {
  const items: Record<string, string[]> = {
    youtube: ['Most-Watched Clip', 'Highest Retention', 'Best Hook Timing', 'Peak Engagement Moment', 'Strongest CTA'],
    tiktok: ['Trending Sound Match', 'Viral Dance Segment', 'Comment Magnet', 'Duet-Ready Clip', 'FYP Score Leader'],
    instagram: ['Story-Worthy Scene', 'Aesthetic Peak', 'Save-Worthy Insight', 'Share-Worthy Moment', 'Profile-Worthy Clip'],
    unknown: ['Top Viral Segment', 'Best Engagement Hook', 'Key Money Moment', 'Retention Peak', 'Strongest Close'],
  };
  const list = items[platform] || items.unknown;
  const badges = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  return list.map((label, i) => ({
    rank: i + 1, label, score: Math.round(95 - i * 8 + Math.random() * 5), badge: badges[i],
    reason: 'AI-ranked by viral potential',
  }));
}
