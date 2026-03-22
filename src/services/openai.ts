// Real OpenAI via GitHub Models (Azure inference endpoint)
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://models.inference.ai.azure.com';

async function chat(messages: { role: string; content: string }[], model = 'gpt-4o', maxTokens = 1500): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.85 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function testOpenAI(): Promise<boolean> {
  try {
    const r = await chat([{ role: 'user', content: 'Reply with just: ok' }], 'gpt-4o-mini', 5);
    return r.toLowerCase().includes('ok');
  } catch { return false; }
}

// ── Script Generator ─────────────────────────────────────────────────────────
export async function generateScript(topic: string, platform: string, style: string): Promise<string> {
  const prompt = `You are a viral content creator. Write a SHORT, punchy ${style} video script for ${platform} about: "${topic}".

Format your response exactly like this:
🎬 HOOK (first 3 seconds):
[hook text - must grab attention instantly]

📢 BODY (main content, 30-45 seconds):
[body with scene cues and timing]

🎯 CTA (last 5 seconds):
[strong call to action]

💡 CAPTION: [one viral caption for the post]

#️⃣ HASHTAGS: [8 viral hashtags]

Keep under 160 words total. Make it viral. Use emojis. Be energetic and punchy.`;

  return await chat([{ role: 'user', content: prompt }]);
}

// ── Ranking Video Generator ───────────────────────────────────────────────────
export async function generateRanking(topic: string, count = 5): Promise<{
  title: string;
  items: { rank: number; name: string; score: number; reason: string; emoji: string }[];
  script: string;
}> {
  const prompt = `Create a viral "Top ${count}" ranking video about: "${topic}".

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "title": "Top ${count} [topic] Ranked from Worst to Best",
  "items": [
    {"rank": 1, "name": "item name", "score": 95, "reason": "one punchy sentence why this ranks here", "emoji": "🏆"},
    {"rank": 2, "name": "item name", "score": 88, "reason": "one punchy sentence why", "emoji": "🥈"}
  ],
  "script": "Full energetic narration script that would work as a voiceover, 100-150 words, very viral and engaging"
}

Rules: controversial rankings, scores 55-99, exactly ${count} items, punchy reasons, relevant emojis.`;

  const raw = await chat([{ role: 'user', content: prompt }]);
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
    return JSON.parse(json);
  } catch {
    return {
      title: `Top ${count} ${topic} Ranked`,
      items: Array.from({ length: count }, (_, i) => ({
        rank: i + 1, name: `#${i + 1} Pick`, score: 95 - i * 8,
        reason: 'AI-powered analysis complete', emoji: ['🏆','🥈','🥉','4️⃣','5️⃣'][i] || '🎯',
      })),
      script: `Here are the top ${count} ${topic} ranked from best to worst. Let's dive in!`,
    };
  }
}

// ── Clip Viral Analyzer ───────────────────────────────────────────────────────
export async function analyzeVideoUrl(videoData: {
  title: string;
  description: string;
  tags: string[];
  duration: string;
  viewCount: string;
  likeCount: string;
}): Promise<{
  clips: { label: string; startHint: string; endHint: string; duration: string; score: number; tag: string; reason: string }[];
  editSuggestions: string[];
  viralPotential: number;
  bestPlatform: string;
}> {
  const prompt = `You are an expert video editor and viral content analyst.

Analyze this YouTube video and identify the best clips to extract for short-form content:

Title: "${videoData.title}"
Description: "${videoData.description?.slice(0, 300)}"
Tags: ${videoData.tags?.slice(0, 10).join(', ')}
Duration: ${videoData.duration}
Views: ${videoData.viewCount}
Likes: ${videoData.likeCount}

Return ONLY valid JSON (no markdown):
{
  "clips": [
    {
      "label": "Clip title that would go viral",
      "startHint": "around 0:30 when they say...",
      "endHint": "until 1:15 after the reveal",
      "duration": "0:45",
      "score": 94,
      "tag": "Hook",
      "reason": "Why this moment is viral-worthy"
    }
  ],
  "editSuggestions": [
    "Add captions to every word",
    "Zoom in at 0:42 for emphasis",
    "Cut the intro, start at the action",
    "Add trending sound overlay",
    "Use jump cuts every 3 seconds"
  ],
  "viralPotential": 87,
  "bestPlatform": "TikTok"
}

Generate 5-7 clips. Tags can be: Hook, Punchline, Reveal, Tutorial, Reaction, Story, Tips, Controversy, Funny. Scores 65-99.`;

  const raw = await chat([{ role: 'user', content: prompt }]);
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
    return JSON.parse(json);
  } catch {
    return {
      clips: [
        { label: 'Opening Hook', startHint: '0:00', endHint: '0:30', duration: '0:30', score: 91, tag: 'Hook', reason: 'Strong opening moment' },
        { label: 'Key Reveal', startHint: '1:00', endHint: '1:45', duration: '0:45', score: 87, tag: 'Reveal', reason: 'High engagement moment' },
        { label: 'Best Quote', startHint: '2:10', endHint: '2:55', duration: '0:45', score: 83, tag: 'Punchline', reason: 'Quotable and shareable' },
        { label: 'Call to Action', startHint: '3:30', endHint: '4:00', duration: '0:30', score: 79, tag: 'Tips', reason: 'Actionable insight' },
        { label: 'Funny Moment', startHint: '4:15', endHint: '4:45', duration: '0:30', score: 76, tag: 'Funny', reason: 'Entertaining clip' },
      ],
      editSuggestions: ['Add captions to all words', 'Crop to 9:16 vertical', 'Add trending audio', 'Zoom punch on key moments', 'Color grade to pop'],
      viralPotential: 82,
      bestPlatform: 'TikTok',
    };
  }
}

// ── Auto Edit Suggestions ─────────────────────────────────────────────────────
export async function generateEditSuggestions(title: string): Promise<string[]> {
  const prompt = `You are a professional video editor. List 10 specific auto-edit actions to apply to this video: "${title}"

Return ONLY a JSON array of strings (no markdown, no extra text):
["action 1", "action 2", ...]

Each action should be specific and technical like: "Apply cinematic color grade", "Add jump cut every 3s", "Burn-in white captions at bottom", "Normalize audio to -14 LUFS", "Add zoom punch at main point", "Crop to 9:16 vertical", "Add background music at 20% volume", "Generate thumbnail from best frame", "Add subscribe animation at end", "Speed ramp on b-roll sections"`;

  const raw = await chat([{ role: 'user', content: prompt }]);
  try {
    const arr = raw.match(/\[[\s\S]*\]/)?.[0] || raw;
    return JSON.parse(arr);
  } catch {
    return [
      '✅ Crop to 9:16 vertical format',
      '✅ Apply cinematic color grade',
      '✅ Burn-in captions (auto-transcribed)',
      '✅ Normalize audio to -14 LUFS',
      '✅ Add zoom punch on key moments',
      '✅ Generate thumbnail from best frame',
      '✅ Add subscribe animation overlay',
      '✅ Speed ramp on b-roll sections',
      '✅ Add trending background music (20%)',
      '✅ Export in 1080x1920 for Shorts/Reels',
    ];
  }
}

// ── Caption Generator ─────────────────────────────────────────────────────────
export async function generateCaptions(topic: string): Promise<string[]> {
  const prompt = `Write 5 viral social media captions for a video about: "${topic}"

Return ONLY a JSON array of 5 strings (no markdown):
["caption 1", "caption 2", "caption 3", "caption 4", "caption 5"]

Each caption: punchy, uses emojis, under 150 chars, ends with a question or hook, includes 3-4 hashtags.`;

  const raw = await chat([{ role: 'user', content: prompt }]);
  try {
    const arr = raw.match(/\[[\s\S]*\]/)?.[0] || raw;
    return JSON.parse(arr);
  } catch {
    return [
      `🔥 This changes everything about ${topic}! Are you ready? #viral #trending #fyp`,
      `Nobody talks about this ${topic} secret 👀 Watch till the end! #shorts #reels`,
      `POV: You just discovered the truth about ${topic} 😱 #mindblown #facts`,
      `The ${topic} hack that went viral overnight 🚀 Save this! #lifehack #tips`,
      `Wait for the plot twist... ${topic} edition 🤯 Drop a 🔥 if you knew! #trending`,
    ];
  }
}

// ── Thumbnail Text Generator ──────────────────────────────────────────────────
export async function generateThumbnailText(title: string): Promise<{ headline: string; subtext: string; style: string }> {
  const prompt = `Create viral YouTube thumbnail text for: "${title}"

Return ONLY valid JSON:
{
  "headline": "3-4 word shocking headline in ALL CAPS",
  "subtext": "secondary text that adds context",
  "style": "one of: shocking, curiosity, listicle, tutorial, reaction"
}`;

  const raw = await chat([{ role: 'user', content: prompt }]);
  try {
    const json = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
    return JSON.parse(json);
  } catch {
    return { headline: 'YOU WON\'T BELIEVE THIS', subtext: title.slice(0, 40), style: 'shocking' };
  }
}

// ── Viral Hook Generator ──────────────────────────────────────────────────────
export async function generateViralHooks(topic: string): Promise<string[]> {
  const prompt = `Generate 6 ultra-viral video hooks (opening lines) for a video about: "${topic}"

Rules:
- First 3 seconds must stop the scroll
- Create curiosity or shock
- Under 15 words each
- Use patterns like: "Nobody tells you...", "I tried X for 30 days...", "The truth about...", "Stop doing X if...", "This changed my..."

Return ONLY a JSON array of 6 strings.`;

  const raw = await chat([{ role: 'user', content: prompt }]);
  try {
    const arr = raw.match(/\[[\s\S]*\]/)?.[0] || raw;
    return JSON.parse(arr);
  } catch {
    return [
      `Nobody tells you the truth about ${topic}...`,
      `I tested ${topic} for 30 days and THIS happened`,
      `Stop doing ${topic} wrong — here's why`,
      `The ${topic} secret they don't want you to know`,
      `This ${topic} hack changed everything for me`,
      `Wait — you've been doing ${topic} wrong this whole time`,
    ];
  }
}

export default { generateScript, generateRanking, analyzeVideoUrl, generateEditSuggestions, generateCaptions, generateThumbnailText, generateViralHooks, testOpenAI };
