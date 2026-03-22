// Real Supabase Auth + Database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, display_name: name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ── Clip Jobs ─────────────────────────────────────────────────────────────────
export async function saveClipJob(job: {
  user_id: string;
  url: string;
  platform: string;
  status: string;
  title: string;
  clips: unknown[];
}) {
  const { data, error } = await supabase.from('jobs').insert(job).select().single();
  if (error) {
    console.warn('Supabase saveClipJob:', error.message);
    return null;
  }
  return data;
}

export async function updateClipJob(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('jobs').update(updates).eq('id', id);
  if (error) console.warn('Supabase updateClipJob:', error.message);
}

export async function getUserJobs(userId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) { console.warn('Supabase getUserJobs:', error.message); return []; }
  return data || [];
}

// ── Published Posts ───────────────────────────────────────────────────────────
export async function savePost(post: {
  user_id: string;
  clip_id: string;
  platform: string;
  status: string;
  post_url?: string;
}) {
  const { data, error } = await supabase.from('posts').insert(post).select().single();
  if (error) { console.warn('Supabase savePost:', error.message); return null; }
  return data;
}

export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.warn('Supabase getPosts:', error.message); return []; }
  return data || [];
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export async function upsertProfile(profile: { id: string; username?: string; plan?: string; credits?: number }) {
  const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
  if (error) console.warn('Supabase upsertProfile:', error.message);
}

export default supabase;
