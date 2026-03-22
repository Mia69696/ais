// Real ElevenLabs API for AI Voice generation
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

export const VOICE_LIBRARY = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', accent: 'British', style: 'Narration', gender: 'Male', emoji: '🎙️' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', accent: 'American', style: 'Conversational', gender: 'Female', emoji: '🎤' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', accent: 'American', style: 'Energetic', gender: 'Male', emoji: '⚡' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', accent: 'British', style: 'News', gender: 'Female', emoji: '📰' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', accent: 'American', style: 'Casual', gender: 'Male', emoji: '😎' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', accent: 'American', style: 'Friendly', gender: 'Female', emoji: '✨' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', accent: 'British', style: 'Deep', gender: 'Male', emoji: '🔥' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Nicole', accent: 'American', style: 'Whisper', gender: 'Female', emoji: '🌙' },
];

export async function textToSpeech(text: string, voiceId = 'JBFqnCBsd6RMkjVDRZzb'): Promise<string> {
  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
    },
    body: JSON.stringify({
      text: text.slice(0, 500),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs error ${res.status}: ${await res.text()}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function getVoices(): Promise<typeof VOICE_LIBRARY> {
  try {
    const res = await fetch(`${BASE_URL}/voices`, {
      headers: { 'xi-api-key': API_KEY },
    });
    if (!res.ok) return VOICE_LIBRARY;
    const data = await res.json();
    if (data.voices && data.voices.length > 0) {
      return data.voices.slice(0, 8).map((v: { voice_id: string; name: string; labels?: { accent?: string; use_case?: string; gender?: string } }) => ({
        id: v.voice_id,
        name: v.name,
        accent: v.labels?.accent || 'English',
        style: v.labels?.use_case || 'General',
        gender: v.labels?.gender || 'Neutral',
        emoji: '🎙️',
      }));
    }
    return VOICE_LIBRARY;
  } catch {
    return VOICE_LIBRARY;
  }
}

export async function getUserQuota(): Promise<{ used: number; limit: number; resetDate: string }> {
  try {
    const res = await fetch(`${BASE_URL}/user/subscription`, {
      headers: { 'xi-api-key': API_KEY },
    });
    if (!res.ok) return { used: 0, limit: 10000, resetDate: 'Next month' };
    const data = await res.json();
    return {
      used: data.character_count || 0,
      limit: data.character_limit || 10000,
      resetDate: data.next_character_count_reset_unix
        ? new Date(data.next_character_count_reset_unix * 1000).toLocaleDateString()
        : 'Next month',
    };
  } catch {
    return { used: 0, limit: 10000, resetDate: 'Next month' };
  }
}

export default { textToSpeech, getVoices, getUserQuota, VOICE_LIBRARY };
