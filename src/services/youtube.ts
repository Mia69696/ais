// Real YouTube Data API v3 — fetch video/channel metadata
const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YTVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  viewCount: string;
  likeCount: string;
  duration: string;
  publishedAt: string;
  tags: string[];
}

export interface YTChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  recentVideos: YTVideo[];
}

// Extract video ID from URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Extract channel handle/id from URL
function extractChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/@([^&\n?#/]+)/,
    /youtube\.com\/channel\/([^&\n?#/]+)/,
    /youtube\.com\/c\/([^&\n?#/]+)/,
    /youtube\.com\/user\/([^&\n?#/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Convert ISO 8601 duration to readable
function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = parseInt(m[1] || '0');
  const min = parseInt(m[2] || '0');
  const s = parseInt(m[3] || '0');
  if (h > 0) return `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${min}:${String(s).padStart(2,'0')}`;
}

// Format large numbers
function formatCount(n: string): string {
  const num = parseInt(n || '0');
  if (num >= 1_000_000) return `${(num/1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num/1_000).toFixed(1)}K`;
  return String(num);
}

// ── Fetch single video data ───────────────────────────────────────────────────
export async function fetchVideoData(url: string): Promise<YTVideo | null> {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  const res = await fetch(
    `${YT_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YT_API_KEY}`
  );
  if (!res.ok) {
    console.error('YouTube API error:', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description?.slice(0, 200) || '',
    thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || '',
    channelTitle: item.snippet.channelTitle,
    viewCount: formatCount(item.statistics?.viewCount),
    likeCount: formatCount(item.statistics?.likeCount),
    duration: parseDuration(item.contentDetails?.duration || ''),
    publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
    tags: item.snippet.tags?.slice(0, 10) || [],
  };
}

// ── Fetch channel data + recent videos ───────────────────────────────────────
export async function fetchChannelData(url: string): Promise<YTChannel | null> {
  const handle = extractChannelId(url);
  if (!handle) return null;

  // First resolve handle to channel ID
  let channelId = handle;
  if (!handle.startsWith('UC')) {
    const searchRes = await fetch(
      `${YT_BASE}/search?part=snippet&type=channel&q=${handle}&maxResults=1&key=${YT_API_KEY}`
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      channelId = searchData.items?.[0]?.snippet?.channelId || handle;
    }
  }

  // Get channel stats
  const chanRes = await fetch(
    `${YT_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${YT_API_KEY}`
  );
  if (!chanRes.ok) return null;
  const chanData = await chanRes.json();
  const chan = chanData.items?.[0];
  if (!chan) return null;

  // Get recent videos
  const videosRes = await fetch(
    `${YT_BASE}/search?part=snippet&channelId=${channelId}&maxResults=6&order=date&type=video&key=${YT_API_KEY}`
  );
  let recentVideos: YTVideo[] = [];
  if (videosRes.ok) {
    const videosData = await videosRes.json();
    const ids = videosData.items?.map((v: { id: { videoId: string } }) => v.id?.videoId).filter(Boolean).join(',');
    if (ids) {
      const detailRes = await fetch(
        `${YT_BASE}/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${YT_API_KEY}`
      );
      if (detailRes.ok) {
        const details = await detailRes.json();
        recentVideos = (details.items || []).map((item: {
          id: string;
          snippet: { title: string; description?: string; thumbnails?: { high?: { url: string }; maxres?: { url: string } }; channelTitle: string; publishedAt: string; tags?: string[] };
          statistics?: { viewCount?: string; likeCount?: string };
          contentDetails?: { duration?: string };
        }) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description?.slice(0, 150) || '',
          thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || '',
          channelTitle: item.snippet.channelTitle,
          viewCount: formatCount(item.statistics?.viewCount || '0'),
          likeCount: formatCount(item.statistics?.likeCount || '0'),
          duration: parseDuration(item.contentDetails?.duration || ''),
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
          tags: item.snippet.tags?.slice(0, 5) || [],
        }));
      }
    }
  }

  return {
    id: channelId,
    title: chan.snippet.title,
    description: chan.snippet.description?.slice(0, 200) || '',
    thumbnail: chan.snippet.thumbnails?.high?.url || '',
    subscriberCount: formatCount(chan.statistics?.subscriberCount || '0'),
    videoCount: formatCount(chan.statistics?.videoCount || '0'),
    viewCount: formatCount(chan.statistics?.viewCount || '0'),
    recentVideos,
  };
}

// ── Auto-detect URL type and fetch ───────────────────────────────────────────
export async function fetchYouTubeData(url: string): Promise<{
  type: 'video' | 'channel' | 'unknown';
  video?: YTVideo | null;
  channel?: YTChannel | null;
}> {
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return { type: 'unknown' };
  }

  const videoId = extractVideoId(url);
  if (videoId) {
    const video = await fetchVideoData(url);
    return { type: 'video', video };
  }

  const channelHandle = extractChannelId(url);
  if (channelHandle) {
    const channel = await fetchChannelData(url);
    return { type: 'channel', channel };
  }

  return { type: 'unknown' };
}

// ── Search trending videos ────────────────────────────────────────────────────
export async function searchTrendingVideos(query: string, maxResults = 5): Promise<YTVideo[]> {
  const res = await fetch(
    `${YT_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&order=viewCount&type=video&key=${YT_API_KEY}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  const ids = data.items?.map((v: { id: { videoId: string } }) => v.id?.videoId).filter(Boolean).join(',');
  if (!ids) return [];

  const detailRes = await fetch(
    `${YT_BASE}/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${YT_API_KEY}`
  );
  if (!detailRes.ok) return [];
  const details = await detailRes.json();
  return (details.items || []).map((item: {
    id: string;
    snippet: { title: string; description?: string; thumbnails?: { high?: { url: string } }; channelTitle: string; publishedAt: string; tags?: string[] };
    statistics?: { viewCount?: string; likeCount?: string };
    contentDetails?: { duration?: string };
  }) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description?.slice(0, 150) || '',
    thumbnail: item.snippet.thumbnails?.high?.url || '',
    channelTitle: item.snippet.channelTitle,
    viewCount: formatCount(item.statistics?.viewCount || '0'),
    likeCount: formatCount(item.statistics?.likeCount || '0'),
    duration: parseDuration(item.contentDetails?.duration || ''),
    publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
    tags: item.snippet.tags?.slice(0, 5) || [],
  }));
}

export default { fetchVideoData, fetchChannelData, fetchYouTubeData, searchTrendingVideos };
